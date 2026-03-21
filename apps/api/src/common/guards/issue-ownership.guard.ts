import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { UserRole } from '@issueflow/types';

@Injectable()
export class IssueOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const issueId = request.params.id;
    const membership = request.membership; // Provided by OrgMemberGuard

    if (!issueId) return true;

    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue || issue.deletedAt) {
      throw new NotFoundException('Issue not found');
    }

    // Admins and Owners have global access to issues
    if (membership.role === UserRole.OWNER || membership.role === UserRole.ADMIN) {
      return true;
    }

    // Members can only modify their own issues
    if (membership.role === UserRole.MEMBER) {
      if (issue.authorId === user.id) {
        return true;
      }
      throw new ForbiddenException('You can only modify your own issues');
    }

    // Viewers cannot modify anything
    throw new ForbiddenException('Viewers do not have write permissions');
  }
}
