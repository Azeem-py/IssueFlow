import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@issueflow/types';

@Injectable()
export class OrgMemberGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orgId = request.headers['x-org-id'] || request.params.orgId || request.params.id;

    if (!orgId) {
      throw new BadRequestException('Organization ID (x-org-id header) is required');
    }

    const member = await this.prisma.member.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
    });

    if (!member || member.deletedAt) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Check Roles if required
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(member.role as UserRole)) {
        throw new ForbiddenException('You do not have the required permissions');
      }
    }

    // Attach membership to request for later use in controllers if needed
    request.membership = member;
    return true;
  }
}
