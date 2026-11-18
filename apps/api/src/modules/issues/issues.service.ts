import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IssueSequenceService } from './issue-sequence.service';
import { PushService } from '../notifications/push.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '@prisma/client';
import { CreateIssueInput, SearchFilters, CreateCommentInput } from '@issueflow/types';

@Injectable()
export class IssuesService {
  private readonly logger = new Logger(IssuesService.name);

  constructor(
    private prisma: PrismaService,
    private sequenceService: IssueSequenceService,
    private pushService: PushService,
    private activityService: ActivityService,
  ) {}

  private async assertIssueInOrg(issueId: string, orgId: string) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue || issue.organizationId !== orgId) {
      throw new NotFoundException('Issue not found');
    }
    return issue;
  }

  private async assertMemberOfOrg(orgId: string, userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (!member || member.deletedAt) {
      throw new BadRequestException('Assignee must be a member of this organization');
    }
    return member;
  }

  async createIssue(dto: CreateIssueInput, authorId: string, orgId: string) {
    if (dto.organizationId && dto.organizationId !== orgId) {
      throw new BadRequestException('Organization does not match the requested workspace');
    }

    // Make sure the project belongs to the workspace the user is acting in.
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project || project.organizationId !== orgId) {
      throw new BadRequestException('Project not found in this organization');
    }

    if (dto.assigneeId) {
      await this.assertMemberOfOrg(orgId, dto.assigneeId);
    }

    // Atomic sequential numbering
    const shortId = await this.sequenceService.getNextShortId(dto.projectId);
    this.logger.log(`Creating issue ${shortId} in project ${dto.projectId} by user ${authorId}`);

    const issue = await this.prisma.issue.create({
      data: {
        shortId,
        title: dto.title,
        description: dto.description,
        status: dto.status || 'BACKLOG',
        priority: dto.priority || 'MEDIUM',
        projectId: dto.projectId,
        organizationId: orgId,
        authorId,
        assigneeId: dto.assigneeId || null,
      },
      include: {
        author: { select: { name: true, email: true } },
      }
    });

    await this.activityService.log({
      action: ActivityAction.ISSUE_CREATED,
      organizationId: orgId,
      userId: authorId,
      issueId: issue.id,
      projectId: issue.projectId,
      metadata: { shortId: issue.shortId, title: issue.title },
    });

    // Notify all org members (Feature: Issue Creation Notification)
    const members = await this.prisma.member.findMany({
      where: { organizationId: orgId },
      select: { userId: true },
    });

    const otherMemberIds = members
      .map((m) => m.userId)
      .filter((uid) => uid !== authorId);

    this.logger.log(`Created issue ${shortId}, notifying ${otherMemberIds.length} members`);

    if (otherMemberIds.length > 0) {
      await Promise.allSettled(
        otherMemberIds.map((userId) =>
          this.pushService.sendPushNotification(userId, {
            title: `New Issue: ${issue.shortId}`,
            body: `${issue.author?.name || 'Someone'} opened: ${issue.title}`,
            url: `/dashboard/issues/${issue.id}`,
          })
        )
      );
    }

    return issue;
  }

  async getIssues(orgId: string, filters: SearchFilters) {
    return this.prisma.issue.findMany({
      where: {
        organizationId: orgId,
        ...(filters.status && { status: { in: filters.status } }),
        ...(filters.priority && { priority: { in: filters.priority } }),
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
        ...(filters.q && {
          OR: [
            { title: { contains: filters.q, mode: 'insensitive' as const } },
            { shortId: { contains: filters.q, mode: 'insensitive' as const } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } }
      },
    });
  }

  async getIssue(orgId: string, issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        author: { select: { id: true, name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { comments: true } }
      }
    });

    if (!issue || issue.organizationId !== orgId) throw new NotFoundException('Issue not found');
    return issue;
  }

  async deleteIssue(orgId: string, issueId: string, actorId: string) {
    const issue = await this.assertIssueInOrg(issueId, orgId);

    const deleted = await this.prisma.issue.update({
      where: { id: issueId },
      data: { deletedAt: new Date() }
    });

    await this.activityService.log({
      action: ActivityAction.ISSUE_DELETED,
      organizationId: orgId,
      userId: actorId,
      issueId: issue.id,
      projectId: issue.projectId,
      metadata: { shortId: issue.shortId, title: issue.title },
    });

    return deleted;
  }

  async updateIssue(orgId: string, issueId: string, actorId: string, dto: any) {
    // Fetch current issue to detect assignee change and enforce tenant isolation
    const current = await this.assertIssueInOrg(issueId, orgId);

    if (dto.assigneeId) {
      await this.assertMemberOfOrg(orgId, dto.assigneeId);
    }

    const updated = await this.prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
        ...(dto.priority && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId || null }),
      },
    });

    const changes: Record<string, unknown> = {};
    if (dto.status && dto.status !== current.status) changes.status = { from: current.status, to: dto.status };
    if (dto.priority && dto.priority !== current.priority) changes.priority = { from: current.priority, to: dto.priority };
    if (dto.assigneeId !== undefined && dto.assigneeId !== current.assigneeId) changes.assigneeId = { from: current.assigneeId, to: dto.assigneeId || null };
    if (dto.title && dto.title !== current.title) changes.title = { from: current.title, to: dto.title };

    if (Object.keys(changes).length > 0) {
      await this.activityService.log({
        action: ActivityAction.ISSUE_UPDATED,
        organizationId: orgId,
        userId: actorId,
        issueId: updated.id,
        projectId: updated.projectId,
        metadata: { shortId: updated.shortId, changes },
      });
    }

    // Notify the newly assigned user (if assignee changed)
    if (
      dto.assigneeId &&
      dto.assigneeId !== current?.assigneeId
    ) {
      this.logger.log(`Assignee changed for issue ${updated.shortId}, notifying user ${dto.assigneeId}`);
      await this.pushService.sendPushNotification(dto.assigneeId, {
        title: 'You have been assigned an issue',
        body: `Issue ${updated.shortId}: ${updated.title}`,
        url: `/dashboard/issues/${updated.id}`,
      });
    }

    return updated;
  }

  // --- Comments ---

  async addComment(orgId: string, dto: CreateCommentInput, authorId: string) {
    const issue = await this.assertIssueInOrg(dto.issueId, orgId);

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.issueId !== issue.id) {
        throw new BadRequestException('Parent comment does not belong to this issue');
      }
    }

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

    await this.activityService.log({
      action: ActivityAction.COMMENT_ADDED,
      organizationId: orgId,
      userId: authorId,
      issueId: issue.id,
      projectId: issue.projectId,
      metadata: { commentId: newComment.id, shortId: issue.shortId },
    });

    // Only allow mentioning users who are members of this workspace.
    const memberIds = new Set(
      (await this.prisma.member.findMany({
        where: { organizationId: orgId },
        select: { userId: true },
      })).map((m) => m.userId),
    );
    const validMentions = (dto.mentions || []).filter((userId) => memberIds.has(userId));

    // Handle @mentions (existing logic)
    const mentionedOthers = validMentions.filter((userId) => userId !== authorId);
    if (validMentions.length > 0) {
      const notificationData = validMentions.map((userId) => ({
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

      if (mentionedOthers.length > 0) {
        this.logger.log(`Notifying ${mentionedOthers.length} users mentioned in comment ${newComment.id}`);
        await Promise.allSettled(
          mentionedOthers.map((userId) =>
            this.pushService.sendPushNotification(userId, {
              title: 'You were mentioned in IssueFlow',
              body: `${newComment.author?.name || 'Someone'} mentioned you in ${issue.shortId}`,
              url: `/dashboard/issues/${issue.id}`,
            })
          )
        );
      }
    }

    // --- Feature #5: New Top-Level Comment (Notify All Org Members) ---
    if (!dto.parentId) {
      const members = await this.prisma.member.findMany({
        where: { organizationId: issue.organizationId },
        select: { userId: true },
      });

      const otherMemberIds = members
        .map((m) => m.userId)
        .filter((uid) => uid !== authorId);

      this.logger.log(`Top-level comment added, notifying ${otherMemberIds.length} org members`);

      if (otherMemberIds.length > 0) {
        await Promise.allSettled(
          otherMemberIds.map((userId) =>
            this.pushService.sendPushNotification(userId, {
              title: `New comment on ${issue.shortId}`,
              body: `${newComment.author?.name || 'Someone'}: ${newComment.content.substring(0, 80)}${newComment.content.length > 80 ? '...' : ''}`,
              url: `/dashboard/issues/${issue.id}`,
            })
          )
        );
      }
    }

    // --- Feature #6: Reply (Notify Thread Participants) ---
    if (dto.parentId) {
      // Find thread participants (author of parent and any ancestors)
      const threadRecipients = new Set<string>();
      
      let currentParentId: string | null = dto.parentId;
      while (currentParentId) {
        const parentComment: any = await this.prisma.comment.findUnique({
          where: { id: currentParentId },
          select: { authorId: true, parentId: true },
        });

        if (parentComment) {
          if (parentComment.authorId !== authorId && !mentionedOthers.includes(parentComment.authorId)) {
            threadRecipients.add(parentComment.authorId);
          }
          currentParentId = parentComment.parentId;
        } else {
          currentParentId = null;
        }
      }

      this.logger.log(`Reply added, notifying ${threadRecipients.size} thread participants`);

      if (threadRecipients.size > 0) {
        await Promise.allSettled(
          Array.from(threadRecipients).map((userId) =>
            this.pushService.sendPushNotification(userId, {
              title: `Someone replied to your thread on ${issue.shortId}`,
              body: `${newComment.author?.name || 'Someone'}: ${newComment.content.substring(0, 80)}${newComment.content.length > 80 ? '...' : ''}`,
              url: `/dashboard/issues/${issue.id}`,
            })
          )
        );
      }
    }

    return newComment;
  }

  async getComments(orgId: string, issueId: string) {
    await this.assertIssueInOrg(issueId, orgId);

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
