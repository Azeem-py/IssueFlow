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
      where: { organizationId: orgId, deletedAt: null },
      include: {
        issues: {
          select: {
            assignee: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  async getProject(orgId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.organizationId !== orgId) {
      throw new BadRequestException('Project not found in this organization');
    }

    return project;
  }

  async updateProject(orgId: string, projectId: string, data: { name?: string, key?: string, logoUrl?: string }) {
    const project = await this.getProject(orgId, projectId);

    if (data.key && data.key !== project.key) {
      const existing = await this.prisma.project.findUnique({
        where: { organizationId_key: { organizationId: orgId, key: data.key.toUpperCase() } },
      });
      if (existing) throw new BadRequestException('Project key already exists in this organization');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.key && { key: data.key.toUpperCase() }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      },
    });
  }

  async deleteProject(orgId: string, projectId: string) {
    await this.getProject(orgId, projectId);
    
    // Soft delete if possible, but schema doesn't have deletedAt for Project in all places or maybe it does.
    // Looking at schema.prisma: Project has deletedAt.
    return this.prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
  }

  async getMembers(orgId: string) {
    return this.prisma.member.findMany({
      where: { organizationId: orgId, deletedAt: null },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
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

  async removeMember(orgId: string, memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== orgId) {
      throw new BadRequestException('Member not found in this organization');
    }

    if (member.role === 'OWNER') {
      throw new BadRequestException('Cannot remove the owner of an organization.');
    }

    // Soft delete member
    return this.prisma.member.update({
      where: { id: memberId },
      data: { deletedAt: new Date() },
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
