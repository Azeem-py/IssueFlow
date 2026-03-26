import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '@issueflow/types';
import { Response } from 'express';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async forgotPassword(emailInput: string) {
    const email = emailInput.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, don't reveal if user exists.
      return { message: 'If an account exists with this email, you will receive an OTP shortly.' };
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: await bcrypt.hash(otp, 10),
        resetOtpExpires: otpExpires,
      },
    });

    await this.emailService.sendOtpEmail(email, otp);

    return { message: 'If an account exists with this email, you will receive an OTP shortly.' };
  }

  async resetPassword(emailInput: string, otp: string, newPass: string) {
    const email = emailInput.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      throw new BadRequestException('Invalid or expired reset request');
    }

    if (new Date() > user.resetOtpExpires) {
      throw new BadRequestException('OTP has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpires: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  async register(emailInput: string, pass: string, name?: string, role: UserRole = UserRole.MEMBER, secretCode?: string) {
    const email = emailInput.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('User already exists');

    // Admin Role Protection
    if (role === UserRole.ADMIN) {
      const adminSecret = this.configService.get<string>('ADMIN_SECRET_CODE');
      if (!secretCode || secretCode !== adminSecret) {
        throw new BadRequestException('Invalid secret code for Admin registration');
      }
    }

    // Owner role restriction
    if (role === UserRole.OWNER) {
        throw new BadRequestException('Owner accounts cannot be created via public signup');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return user;
  }

  async validateUser(emailInput: string, pass: string): Promise<any> {
    const email = emailInput.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, response?: Response, rememberMe: boolean = false) {
    const payload = { email: user.email, sub: user.id };
    
    // Access Token (short-lived)
    const access_token = this.jwtService.sign(payload, {
        expiresIn: '15m'
    });

    if (response) {
      const isProduction = this.configService.get('NODE_ENV') === 'production';
      const isSecure = isProduction || !!this.configService.get('VERCEL');

      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 mins
        path: '/',
      });

      // Refresh Token (long-lived)
      if (rememberMe) {
        const refresh_token = this.jwtService.sign(payload, {
          expiresIn: '7d',
          secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
        });

        await this.prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: await bcrypt.hash(refresh_token, 10) },
        });

        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
        response.clearCookie('refresh_token', {
          httpOnly: true,
          secure: isSecure,
          sameSite: 'lax',
          path: '/',
        });
      }
    }

    return {
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    };
  }

  async refreshTokens(refreshToken: string, response: Response) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid refresh token');

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

      const newPayload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      const new_refresh_token = this.jwtService.sign(newPayload, {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret',
      });

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await bcrypt.hash(new_refresh_token, 10) },
      });

      const isProduction = this.configService.get('NODE_ENV') === 'production';
      const isSecure = isProduction || !!this.configService.get('VERCEL');

      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      });

      response.cookie('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return { message: 'Token refreshed' };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, response: Response) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isSecure = isProduction || !!this.configService.get('VERCEL');

    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as 'lax',
      path: '/',
    };
    
    response.clearCookie('access_token', cookieOptions);
    response.clearCookie('refresh_token', cookieOptions);
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      },
      select: { id: true, email: true, name: true, avatarUrl: true }
    });
  }
}
