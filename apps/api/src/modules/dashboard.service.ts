import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(orgId: string, userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. My Tasks (Assigned to user in current org)
    const myTasksCount = await this.prisma.issue.count({
      where: { organizationId: orgId, assigneeId: userId, status: { not: 'DONE' } },
    });

    // Previous period
    const myTasksCountPrev = await this.prisma.issue.count({
      where: { organizationId: orgId, assigneeId: userId, status: { not: 'DONE' }, createdAt: { lt: sevenDaysAgo } },
    });

    // 2. High Priority (High/Urgent in current org)
    const highPriorityCount = await this.prisma.issue.count({
      where: { organizationId: orgId, priority: { in: ['HIGH', 'URGENT'] }, status: { not: 'DONE' } },
    });

    // Previous period
    const highPriorityCountPrev = await this.prisma.issue.count({
      where: { organizationId: orgId, priority: { in: ['HIGH', 'URGENT'] }, status: { not: 'DONE' }, createdAt: { lt: sevenDaysAgo } },
    });

    // 3. Team Velocity (Issues resolved in the last 7 days)
    const velocityCount = await this.prisma.issue.count({
      where: { organizationId: orgId, status: 'DONE', updatedAt: { gte: sevenDaysAgo } },
    });

    // Previous period (Issues resolved between 7 and 14 days ago)
    const velocityCountPrev = await this.prisma.issue.count({
      where: { organizationId: orgId, status: 'DONE', updatedAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
    });

    // 4. Total Issues (Total issues in current org)
    const totalIssuesCount = await this.prisma.issue.count({
      where: { organizationId: orgId },
    });

    const totalIssuesCountPrev = await this.prisma.issue.count({
      where: { organizationId: orgId, createdAt: { lt: sevenDaysAgo } },
    });

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+100%' : '0%';
      const percentChange = ((current - previous) / previous) * 100;
      return `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(0)}%`;
    };

    return {
      baseStats: [
        { label: 'My Tasks', value: myTasksCount.toString(), change: calculateChange(myTasksCount, myTasksCountPrev), icon: 'assignment', color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'High Priority', value: highPriorityCount.toString(), change: calculateChange(highPriorityCount, highPriorityCountPrev), icon: 'priority_high', color: 'text-amber-500', bg: 'bg-amber-500/10' },
      ],
      advancedStats: [
        { label: 'Team Velocity', value: velocityCount.toString(), change: calculateChange(velocityCount, velocityCountPrev), icon: 'bolt', color: 'text-indigo-400', bg: 'bg-indigo-400/10', unit: 'pts' },
        { label: 'Total Issues', value: totalIssuesCount.toString(), change: calculateChange(totalIssuesCount, totalIssuesCountPrev), icon: 'confirmation_number', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      ]
    };
  }
}
