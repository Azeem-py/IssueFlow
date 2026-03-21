import { Controller, Post, Body, Get, Param, UseGuards, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { InvitesService } from './invites.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrgMemberGuard } from '../../common/guards/org-member.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@issueflow/types';
import { Public } from '../../common/decorators/public.decorator';

import { CreateOrgDto } from './dto/create-org.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { OrgParamsDto } from './dto/org-params.dto';
import { MemberUpdateParamsDto } from './dto/member-update-params.dto';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrgsController {
  constructor(
    private orgsService: OrgsService,
    private invitesService: InvitesService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  create(@Body() dto: CreateOrgDto, @CurrentUser() user: any) {
    return this.orgsService.createOrg(dto.name, dto.slug, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user organizations' })
  getMyOrgs(@CurrentUser() user: any) {
    return this.orgsService.getMyOrgs(user.id);
  }

  @Delete(':id')
  @UseGuards(OrgMemberGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Delete an organization (Owner only)' })
  deleteOrg(@Param() params: OrgParamsDto) {
    return this.orgsService.deleteOrg(params.id);
  }

  // --- Projects ---

  @Post(':id/projects')
  @UseGuards(OrgMemberGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new project (Admin/Owner only)' })
  createProject(
    @Param() params: OrgParamsDto,
    @Body() dto: CreateProjectDto
  ) {
    return this.orgsService.createProject(params.id, dto.name, dto.key);
  }

  @Get(':id/projects')
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: 'Get projects for an organization' })
  getProjects(@Param() params: OrgParamsDto) {
    return this.orgsService.getProjects(params.id);
  }

  // --- Invitations ---

  @Post(':id/invites')
  @UseGuards(OrgMemberGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Invite a teammate (Admin/Owner only)' })
  createInvite(
    @Param() params: OrgParamsDto,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: any
  ) {
    return this.invitesService.createInvite(params.id, user.id, dto);
  }

  @Get(':id/invites')
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: 'Get pending invites' })
  getInvites(@Param() params: OrgParamsDto) {
    return this.invitesService.getInvites(params.id);
  }

  @Public()
  @Post('invites/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an invitation' })
  acceptInvite(@Body() dto: AcceptInviteDto, @CurrentUser() user: any) {
    return this.invitesService.acceptInvite(dto.token, user.id);
  }

  // --- Member Management ---

  @Get(':id/members')
  @UseGuards(OrgMemberGuard)
  @ApiOperation({ summary: 'Get organization members' })
  getMembers(@Param() params: OrgParamsDto) {
    return this.orgsService.getMembers(params.id);
  }

  @Post(':id/members/:memberId/role')
  @UseGuards(OrgMemberGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a members role (Admin/Owner only)' })
  updateRole(
    @Param() params: MemberUpdateParamsDto,
    @Body() dto: UpdateRoleDto
  ) {
    return this.orgsService.updateMemberRole(params.id, params.memberId, dto.role);
  }

  @Post(':id/transfer-ownership')
  @UseGuards(OrgMemberGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Transfer organization ownership (Owner only)' })
  transferOwnership(
    @Param() params: OrgParamsDto,
    @CurrentUser() user: any,
    @Body() dto: TransferOwnershipDto
  ) {
    return this.orgsService.transferOwnership(params.id, user.id, dto.nextOwnerMemberId);
  }
}
