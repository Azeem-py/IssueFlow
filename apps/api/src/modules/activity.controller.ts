import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ActivityService } from './activity/activity.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMemberGuard } from '../common/guards/org-member.guard';
import { Request } from 'express';

@ApiTags('activity')
@ApiBearerAuth()
@ApiHeader({ name: 'x-org-id', required: true, description: 'Organization ID' })
@Controller('activity')
@UseGuards(JwtAuthGuard, OrgMemberGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent activity logs' })
  async getLogs(@Req() req: Request) {
    const orgId = req.headers['x-org-id'] as string;
    return this.activityService.getLogs(orgId);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Get recent administrative audit logs' })
  async getAuditLogs(@Req() req: Request) {
    const orgId = req.headers['x-org-id'] as string;
    return this.activityService.getAuditLogs(orgId);
  }
}
