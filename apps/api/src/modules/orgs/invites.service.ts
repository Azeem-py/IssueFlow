import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, CreateInviteInput } from '@issueflow/types';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class InvitesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private activityService: ActivityService
  ) {}

  async createInvite(orgId: string, inviterId: string, dto: CreateInviteInput) {
    const email = dto.email.toLowerCase();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const [org, inviter, invite] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: orgId } }),
      this.prisma.user.findUnique({ where: { id: inviterId } }),
      this.prisma.invitation.create({
        data: {
          email,
          token,
          role: dto.role as any,
          organizationId: orgId,
          inviterId,
          expiresAt,
        },
      }),
    ]);

    if (!org || !inviter) {
      throw new NotFoundException('Organization or Inviter not found');
    }

    // Send the email in background (don't wait for it if not necessary)
    this.emailService.sendInvitationEmail(email, org.name, inviter.name || inviter.email, token);

    await this.activityService.log({
      action: ActivityAction.MEMBER_INVITED,
      organizationId: orgId,
      userId: inviterId,
      metadata: { invitedEmail: email, role: dto.role },
    });

    return invite;
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite) throw new NotFoundException('Invitation not found');
    
    // Safety check: ensure current user email matches invite email
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new BadRequestException('This invitation was sent to a different email address');
    }

    if (invite.acceptedAt) throw new BadRequestException('Invitation already accepted');
    if (invite.expiresAt < new Date()) throw new BadRequestException('Invitation expired');

    // Create member and mark invite as accepted in a transaction
    return await this.prisma.$transaction(async (tx) => {
      await tx.member.upsert({
        where: {
          userId_organizationId: {
            userId,
            organizationId: invite.organizationId,
          },
        },
        create: {
          userId,
          organizationId: invite.organizationId,
          role: invite.role as any,
        },
        update: {
          role: invite.role as any,
          deletedAt: null,
        },
      });

      await tx.invitation.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      await this.activityService.log({
        action: ActivityAction.MEMBER_JOINED,
        organizationId: invite.organizationId,
        userId: userId,
        metadata: { inviteId: invite.id, email: invite.email },
      });

      return invite;
    });
  }

  async getInvites(orgId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId: orgId, acceptedAt: null },
      include: { inviter: { select: { name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyInvitations(email: string) {
    return this.prisma.invitation.findMany({
      where: { email: email.toLowerCase(), acceptedAt: null },
      include: { 
        organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
        inviter: { select: { id: true, name: true, email: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeInvite(orgId: string, inviteId: string) {
    const invite = await this.prisma.invitation.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.organizationId !== orgId) {
      throw new NotFoundException('Invitation not found in this organization');
    }

    return this.prisma.invitation.delete({
      where: { id: inviteId },
    });
  }

  async declineInvite(inviteId: string, email: string) {
    const invite = await this.prisma.invitation.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.email.toLowerCase() !== email.toLowerCase()) {
      throw new NotFoundException('Invitation not found');
    }

    return this.prisma.invitation.delete({
      where: { id: inviteId },
    });
  }
}
