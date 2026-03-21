import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, IsArray, IsString } from 'class-validator';
import { IssueStatus, IssuePriority, SearchFilters } from '@issueflow/types';
import { Transform } from 'class-transformer';

export class SearchFiltersDto implements SearchFilters {
  @ApiProperty({ enum: IssueStatus, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(IssueStatus, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  status?: IssueStatus[];

  @ApiProperty({ enum: IssuePriority, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(IssuePriority, { each: true })
  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  priority?: IssuePriority[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  q?: string;
}
