import { Test, TestingModule } from '@nestjs/testing';
import { IssueSequenceService } from './issue-sequence.service';
import { PrismaService } from '../prisma/prisma.service';

describe('IssueSequenceService', () => {
  let service: IssueSequenceService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    project: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssueSequenceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<IssueSequenceService>(IssueSequenceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should increment issueCounter and return formatted shortId', async () => {
    const projectId = 'test-project-id';
    mockPrisma.project.update.mockResolvedValue({
      key: 'WEB',
      issueCounter: 5,
    });

    const result = await service.getNextShortId(projectId);

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: projectId },
      data: { issueCounter: { increment: 1 } },
      select: { key: true, issueCounter: true },
    });
    expect(result).toBe('WEB-5');
  });
});
