import { Controller, Post, Body, Get, Res, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.register(dto.email, dto.password, dto.name, dto.role, dto.secretCode);
    return this.authService.login(user, response);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new BadRequestException('Invalid credentials');
    return this.authService.login(user, response, dto.rememberMe);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');
    return this.authService.refreshTokens(refreshToken, response);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset OTP' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.otp, dto.newPassword);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@CurrentUser() user: any, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(user.id, response);
    return { message: 'Logged out' };
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: any) {
    return user;
  }

  @ApiBearerAuth()
  @Post('me')
  @ApiOperation({ summary: 'Update profile info' })
  async updateProfile(@CurrentUser() user: any, @Body() body: { name?: string; avatarUrl?: string }) {
    return this.authService.updateProfile(user.id, body);
  }
}
