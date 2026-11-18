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

    if (!issueId || !membership) return true;

    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    // Never allow access to an issue from a different workspace.
    if (!issue || issue.organizationId !== membership.organizationId) {
      throw new NotFoundException('Issue not found');
    }

    // Admins and Owners have global access to issues
    if (membership.role === UserRole.OWNER || membership.role === UserRole.ADMIN) {
      return true;
    }

    // Members can edit and move any issue in their workspace, but may only
    // delete issues they authored. Viewers are blocked earlier by @Roles().
    if (membership.role === UserRole.MEMBER) {
      if (request.method === 'DELETE' && issue.authorId !== user.id) {
        throw new ForbiddenException('You can only delete your own issues');
      }
      return true;
    }

    // Viewers cannot modify anything
    throw new ForbiddenException('Viewers do not have write permissions');
  }
}
