import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { CreateOrgInput } from '@issueflow/types';

export class CreateOrgDto implements CreateOrgInput {
  @ApiProperty({ example: 'My Startup' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'my-startup' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase and contain only alphanumeric characters and hyphens' })
  slug!: string;

  @ApiProperty({ example: 'https://cloudinary.com/logo.png', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
