import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { CreateCommentInput } from '@issueflow/types';

export class CreateCommentDto implements CreateCommentInput {
  @ApiProperty({ example: 'This is a great task!' })
  @IsNotEmpty()
  @IsString()
  content!: string;

  @IsOptional()
  @IsUUID()
  issueId!: string;

  @ApiProperty({ example: 'parent-comment-uuid', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ example: ['user-id-1', 'user-id-2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}
