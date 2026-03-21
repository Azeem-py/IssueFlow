import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, CreateInviteInput } from '@issueflow/types';
import * as crypto from 'crypto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  async createInvite(orgId: string, inviterId: string, dto: CreateInviteInput) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    return this.prisma.invitation.create({
      data: {
        email: dto.email,
        token,
        role: dto.role as any,
        organizationId: orgId,
        inviterId,
        expiresAt,
      },
    });
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.prisma.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invite) throw new NotFoundException('Invitation not found');
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

      return tx.invitation.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
    });
  }

  async getInvites(orgId: string) {
    return this.prisma.invitation.findMany({
      where: { organizationId: orgId, acceptedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
