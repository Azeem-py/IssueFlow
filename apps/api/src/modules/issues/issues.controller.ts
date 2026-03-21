import { Controller, Get, Post, Body, Query, Headers, UseGuards, Param, Delete } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { OrgMemberGuard } from '../../common/guards/org-member.guard';
import { UserRole } from '@issueflow/types';
import { Roles } from '../../common/decorators/roles.decorator';
import { IssueOwnershipGuard } from '../../common/guards/issue-ownership.guard';

import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { SearchFiltersDto } from './dto/search-filters.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { IssueParamsDto } from './dto/issue-params.dto';

@ApiTags('Issues')
@ApiBearerAuth()
@ApiHeader({ name: 'x-org-id', required: true })
@UseGuards(OrgMemberGuard)
@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  @ApiOperation({ summary: 'Get issues for an organization' })
  async getIssues(
    @Headers('x-org-id') orgId: string,
    @Query() filters: SearchFiltersDto
  ) {
    return this.issuesService.getIssues(orgId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single issue' })
  async getIssue(@Param() params: IssueParamsDto) {
    return this.issuesService.getIssue(params.id);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Create a new issue' })
  async createIssue(
    @Body() dto: CreateIssueDto,
    @CurrentUser() user: any
  ) {
    return this.issuesService.createIssue(dto, user.id);
  }

  @Post(':id')
  @UseGuards(IssueOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Update an issue' })
  async updateIssue(
    @Param() params: IssueParamsDto,
    @Body() dto: UpdateIssueDto
  ) {
    return this.issuesService.updateIssue(params.id, dto);
  }

  @Delete(':id')
  @UseGuards(IssueOwnershipGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Soft delete an issue' })
  async deleteIssue(@Param() params: IssueParamsDto) {
    return this.issuesService.deleteIssue(params.id);
  }

  // --- Comments ---

  @Post(':id/comments')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Add a comment to an issue' })
  async addComment(
    @Param() params: IssueParamsDto,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any
  ) {
    return this.issuesService.addComment({ ...dto, issueId: params.id }, user.id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments for an issue' })
  async getComments(@Param() params: IssueParamsDto) {
    return this.issuesService.getComments(params.id);
  }
}
