import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IssueSequenceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates the next short ID for a project in an atomic way using a transaction.
   * e.g., WEB-1, WEB-2
   */
  async getNextShortId(projectId: string): Promise<string> {
    return await this.prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id: projectId },
        data: {
          issueCounter: {
            increment: 1,
          },
        },
        select: {
          key: true,
          issueCounter: true,
        },
      });

      return `${project.key}-${project.issueCounter}`;
    });
  }
}
