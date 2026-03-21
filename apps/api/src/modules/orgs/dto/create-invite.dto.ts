import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { UserRole, CreateInviteInput } from '@issueflow/types';

export class CreateInviteDto implements CreateInviteInput {
  @ApiProperty({ example: 'teammate@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.MEMBER })
  @IsEnum(UserRole)
  role!: UserRole;
}
