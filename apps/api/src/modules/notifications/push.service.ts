import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:admin@issueflow.com');
    
    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.logger.log('Web Push VAPID keys configured.');
    } else {
      this.logger.warn('Web Push VAPID keys are missing from environment variables.');
    }
  }

  async saveSubscription(userId: string, subscription: any) {
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      if (existing.userId !== userId) {
        return this.prisma.pushSubscription.update({
          where: { endpoint: subscription.endpoint },
          data: { userId },
        });
      }
      return existing;
    }

    return this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }

  async removeSubscription(endpoint: string) {
    try {
      return await this.prisma.pushSubscription.delete({
        where: { endpoint },
      });
    } catch (error) {
       return null;
    }
  }

  async sendPushNotification(userId: string, payload: any) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) return;

    this.logger.log(`Sending push notification to user ${userId} (${subscriptions.length} devices)`);
    
    const sendPromises = subscriptions.map(async (sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
      } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.removeSubscription(sub.endpoint);
        } else {
          this.logger.error(`Error sending push notification to endpoint ${sub.endpoint}`, error.stack);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }
}
