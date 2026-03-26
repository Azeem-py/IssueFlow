import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityAction } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    action: ActivityAction;
    organizationId: string;
    userId: string;
    issueId?: string;
    projectId?: string;
    metadata?: any;
  }) {
    return this.prisma.activityLog.create({
      data: {
        action: data.action,
        organizationId: data.organizationId,
        userId: data.userId,
        issueId: data.issueId,
        projectId: data.projectId,
        metadata: data.metadata,
      },
    });
  }

  async getLogs(orgId: string, limit = 20) {
    return this.prisma.activityLog.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAuditLogs(orgId: string, limit = 10) {
    const auditActions: ActivityAction[] = [
      ActivityAction.MEMBER_INVITED,
      ActivityAction.MEMBER_JOINED,
      ActivityAction.MEMBER_ROLE_UPDATED,
      ActivityAction.MEMBER_REMOVED,
      ActivityAction.OWNERSHIP_TRANSFERRED,
      ActivityAction.ORG_UPDATED,
      ActivityAction.PROJECT_CREATED,
      ActivityAction.PROJECT_DELETED,
    ];

    return this.prisma.activityLog.findMany({
      where: {
        organizationId: orgId,
        action: { in: auditActions },
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
