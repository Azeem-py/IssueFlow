import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MemberUpdateParamsDto {
  @ApiProperty({ example: 'org-uuid' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 'member-uuid' })
  @IsUUID()
  memberId!: string;
}
