import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getMyNotifications(userId: string, orgId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        organizationId: orgId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
        issue: { select: { id: true, shortId: true, title: true } },
        comment: { select: { id: true, content: true } }
      }
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true }
    });
  }

  async markAllAsRead(userId: string, orgId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        organizationId: orgId,
        read: false
      },
      data: { read: true }
    });
  }
}
