import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class TransferOwnershipDto {
  @ApiProperty({ description: 'The Member ID (not User ID) of the target user' })
  @IsNotEmpty()
  @IsUUID()
  nextOwnerMemberId!: string;
}
