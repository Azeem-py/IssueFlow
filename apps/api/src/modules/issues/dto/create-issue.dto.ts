import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { IssueStatus, IssuePriority, CreateIssueInput } from '@issueflow/types';

export class CreateIssueDto implements CreateIssueInput {
  @ApiProperty({ example: 'Implement login' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Fix the auth flow', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: IssueStatus, default: IssueStatus.BACKLOG, required: false })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @ApiProperty({ enum: IssuePriority, default: IssuePriority.MEDIUM, required: false })
  @IsOptional()
  @IsEnum(IssuePriority)
  priority?: IssuePriority;

  @ApiProperty({ example: 'project-uuid' })
  @IsNotEmpty()
  @IsUUID()
  projectId!: string;

  @ApiProperty({ example: 'organization-uuid' })
  @IsNotEmpty()
  @IsUUID()
  organizationId!: string;

  @ApiProperty({ example: 'assignee-uuid', required: false })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
