import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationParamsDto {
  @ApiProperty({ example: 'notification-uuid' })
  @IsUUID()
  @IsNotEmpty()
  id!: string;
}
