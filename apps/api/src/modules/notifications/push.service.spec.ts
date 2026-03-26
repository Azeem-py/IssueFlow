import { Test, TestingModule } from '@nestjs/testing';
import { PushService } from './push.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

describe('PushService', () => {
  let service: PushService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pushSubscription: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'VAPID_PUBLIC_KEY') return 'test-public-key';
      if (key === 'VAPID_PRIVATE_KEY') return 'test-private-key';
      if (key === 'VAPID_SUBJECT') return 'mailto:test@test.com';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PushService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PushService>(PushService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveSubscription', () => {
    const userId = 'user-1';
    const subscription = {
      endpoint: 'https://push.service.com/test-endpoint',
      keys: { p256dh: 'p-key', auth: 'auth-key' }
    };

    it('should create a new subscription if it does not exist', async () => {
      mockPrismaService.pushSubscription.findUnique.mockResolvedValue(null);
      mockPrismaService.pushSubscription.create.mockResolvedValue({ id: 'sub-1', ...subscription, userId });

      const result = await service.saveSubscription(userId, subscription);

      expect(prisma.pushSubscription.findUnique).toHaveBeenCalledWith({ where: { endpoint: subscription.endpoint } });
      expect(prisma.pushSubscription.create).toHaveBeenCalledWith({
        data: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        }
      });
      expect(result.id).toEqual('sub-1');
    });

    it('should update the subscription if it exists but belongs to a different user', async () => {
      mockPrismaService.pushSubscription.findUnique.mockResolvedValue({ 
        id: 'sub-1', endpoint: subscription.endpoint, userId: 'user-2' 
      });
      mockPrismaService.pushSubscription.update.mockResolvedValue({
        id: 'sub-1', endpoint: subscription.endpoint, userId
      });

      const result = await service.saveSubscription(userId, subscription);

      expect(prisma.pushSubscription.update).toHaveBeenCalledWith({
        where: { endpoint: subscription.endpoint },
        data: { userId }
      });
      expect(result.userId).toEqual(userId);
    });
  });

  describe('removeSubscription', () => {
    it('should remove the subscription by endpoint', async () => {
      mockPrismaService.pushSubscription.delete.mockResolvedValue({});
      await service.removeSubscription('https://push.service.com/test-endpoint');
      expect(prisma.pushSubscription.delete).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.service.com/test-endpoint' }
      });
    });
  });
});
