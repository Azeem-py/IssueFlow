import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrgParamsDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  id!: string;
}
