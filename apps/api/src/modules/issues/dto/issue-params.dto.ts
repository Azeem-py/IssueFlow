import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IssueParamsDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  id!: string;
}
