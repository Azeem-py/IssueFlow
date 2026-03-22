import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgsService {
  constructor(private prisma: PrismaService) {}

  async createOrg(name: string, slug: string, userId: string, logoUrl?: string) {
    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('Slug already taken');

    return this.prisma.organization.create({
      data: {
        name,
        slug,
        logoUrl,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async getMyOrgs(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        members: { some: { userId } },
        deletedAt: null,
      },
      include: {
        members: {
          where: { userId },
          select: { role: true }
        }
      }
    });
  }

  async deleteOrg(id: string) {
    return this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createProject(orgId: string, name: string, key: string, logoUrl?: string) {
    const existing = await this.prisma.project.findUnique({
      where: { organizationId_key: { organizationId: orgId, key } },
    });
    if (existing) throw new BadRequestException('Project key already exists in this organization');

    return this.prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        organizationId: orgId,
        logoUrl,
      },
    });
  }

  async getProjects(orgId: string) {
    return this.prisma.project.findMany({
      where: { organizationId: orgId },
    });
  }

  async getMembers(orgId: string) {
    return this.prisma.member.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async updateMemberRole(orgId: string, memberId: string, newRole: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== orgId) {
      throw new BadRequestException('Member not found in this organization');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot change roles for the owner. Transfer ownership instead.');
    }

    return this.prisma.member.update({
      where: { id: memberId },
      data: { role: newRole as any },
    });
  }

  async transferOwnership(orgId: string, currentOwnerId: string, nextOwnerMemberId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify next owner exists in this org
      const nextOwner = await tx.member.findUnique({
        where: { id: nextOwnerMemberId },
      });

      if (!nextOwner || nextOwner.organizationId !== orgId) {
        throw new BadRequestException('Target member not found in this organization');
      }

      // 2. Demote current owner to ADMIN
      await tx.member.update({
        where: {
          userId_organizationId: {
            userId: currentOwnerId,
            organizationId: orgId,
          },
        },
        data: { role: 'ADMIN' },
      });

      // 3. Promote next owner to OWNER
      return tx.member.update({
        where: { id: nextOwnerMemberId },
        data: { role: 'OWNER' },
      });
    });
  }
}
