import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IssueSequenceService } from './issue-sequence.service';
import { PushService } from '../notifications/push.service';
import { CreateIssueInput, SearchFilters, CreateCommentInput } from '@issueflow/types';

@Injectable()
export class IssuesService {
  private readonly logger = new Logger(IssuesService.name);

  constructor(
    private prisma: PrismaService,
    private sequenceService: IssueSequenceService,
    private pushService: PushService
  ) {}

  async createIssue(dto: CreateIssueInput, authorId: string) {
    // Atomic sequential numbering
    const shortId = await this.sequenceService.getNextShortId(dto.projectId);
    this.logger.log(`Creating issue ${shortId} in project ${dto.projectId} by user ${authorId}`);

    return this.prisma.issue.create({
      data: {
        shortId,
        title: dto.title,
        description: dto.description,
        status: dto.status || 'BACKLOG',
        priority: dto.priority || 'MEDIUM',
        projectId: dto.projectId,
        organizationId: dto.organizationId,
        authorId,
        assigneeId: dto.assigneeId || null,
      },
    });
  }

  async getIssues(orgId: string, filters: SearchFilters) {
    return this.prisma.issue.findMany({
      where: {
        organizationId: orgId,
        ...(filters.status && { status: { in: filters.status } }),
        ...(filters.priority && { priority: { in: filters.priority } }),
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } }
      },
    });
  }

  async getIssue(issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { comments: true } }
      }
    });

    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async deleteIssue(issueId: string) {
    // Soft delete
    return this.prisma.issue.update({
      where: { id: issueId },
      data: { deletedAt: new Date() }
    });
  }

  async updateIssue(issueId: string, dto: any) {
    return this.prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId || null }),
      },
    });
  }

  // --- Comments ---

  async addComment(dto: CreateCommentInput, authorId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: dto.issueId }
    });

    if (!issue) throw new NotFoundException('Issue not found');

    this.logger.log(`Adding comment to issue ${dto.issueId} by user ${authorId}`);

    const newComment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        issueId: dto.issueId,
        authorId,
        parentId: dto.parentId,
      },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    if (dto.mentions && dto.mentions.length > 0) {
      // Create notifications for each mentioned user (including self, per requirements)
      const notificationData = dto.mentions.map((userId) => ({
        type: 'MENTION',
        userId,
        actorId: authorId,
        issueId: dto.issueId,
        commentId: newComment.id,
        organizationId: issue.organizationId,
      }));

      await this.prisma.notification.createMany({
        data: notificationData,
        skipDuplicates: true,
      });

      this.logger.log(`Created ${notificationData.length} mention notifications for comment ${newComment.id}`);
      
      // Trigger Web Push Notifications — use Promise.allSettled so errors in one
      // notification don't block others, and we actually await all of them.
      const mentionedOthers = dto.mentions.filter((userId) => userId !== authorId);
      if (mentionedOthers.length > 0) {
        await Promise.allSettled(
          mentionedOthers.map((userId) =>
            this.pushService.sendPushNotification(userId, {
              title: 'You were mentioned in IssueFlow',
              body: `${newComment.author?.name || 'Someone'} mentioned you in ${issue.shortId}`,
              url: `/issues/${issue.shortId}`,
            })
          )
        );
      }
    }

    return newComment;
  }

  async getComments(issueId: string) {
    // We'll fetch all comments for the issue and build the tree in memory or use include for one level
    // For simplicity and to support "deep" nesting as requested, we fetch all and build tree.
    const allComments = await this.prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    const commentMap = new Map();
    const rootComments: any[] = [];

    allComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    allComments.forEach(comment => {
      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId).replies.push(commentMap.get(comment.id));
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  }
}
