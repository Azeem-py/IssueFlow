import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { LoginInput } from '@issueflow/types';

export class LoginDto implements LoginInput {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
