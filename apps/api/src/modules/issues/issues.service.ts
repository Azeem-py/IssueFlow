import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IssueSequenceService } from './issue-sequence.service';
import { CreateIssueInput, SearchFilters, CreateCommentInput } from '@issueflow/types';

@Injectable()
export class IssuesService {
  constructor(
    private prisma: PrismaService,
    private sequenceService: IssueSequenceService
  ) {}

  async createIssue(dto: CreateIssueInput, authorId: string) {
    // Atomic sequential numbering
    const shortId = await this.sequenceService.getNextShortId(dto.projectId);

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
        deletedAt: null,
        ...(filters.status && { status: { in: filters.status } }),
        ...(filters.priority && { priority: { in: filters.priority } }),
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, name: true, email: true } }
      },
    });
  }

  async getIssue(issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId, deletedAt: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, name: true, email: true } },
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
      where: { id: dto.issueId, deletedAt: null }
    });

    if (!issue) throw new NotFoundException('Issue not found');

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        issueId: dto.issueId,
        authorId,
        parentId: dto.parentId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async getComments(issueId: string) {
    // We'll fetch all comments for the issue and build the tree in memory or use include for one level
    // For simplicity and to support "deep" nesting as requested, we fetch all and build tree.
    const allComments = await this.prisma.comment.findMany({
      where: { issueId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, email: true } }
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
