import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateProjectInput } from '@issueflow/types';

export class CreateProjectDto implements CreateProjectInput {
  @ApiProperty({ example: 'Marketing Website' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'MKT' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  key!: string;
}
