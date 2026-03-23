import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMemberGuard } from '../common/guards/org-member.guard';
import { Request } from 'express';

@ApiTags('dashboard')
@ApiBearerAuth()
@ApiHeader({ name: 'x-org-id', required: true, description: 'Organization ID' })
@Controller('dashboard')
@UseGuards(JwtAuthGuard, OrgMemberGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats(@Req() req: Request) {
    const orgId = req.headers['x-org-id'] as string;
    const userId = (req.user as any).userId;
    return this.dashboardService.getStats(orgId, userId);
  }
}
