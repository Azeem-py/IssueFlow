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
}
