import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { AcceptInviteInput } from '@issueflow/types';

export class AcceptInviteDto implements AcceptInviteInput {
  @ApiProperty()
  @IsString()
  token!: string;
}
