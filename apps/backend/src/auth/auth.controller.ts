import { Controller, Post, Body, Res, UnauthorizedException, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials or suspended account');
    }

    const { accessToken } = await this.authService.login(user);

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return { message: 'Logged in successfully', user };
  }

  @Post('register')
  async register(@Body() body: any) {
    const existingUser = await this.usersService.findOneByEmail(body.email);
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(body.password, salt);

    const isFirstUser = await this.usersService.countAll() === 0;

    const newUser = await this.usersService.create({
      email: body.email,
      passwordHash: hash,
      role: isFirstUser ? UserRole.SUPER_ADMIN : UserRole.REPORTER,
    });

    const { passwordHash, ...result } = newUser;
    return result;
  }
}
