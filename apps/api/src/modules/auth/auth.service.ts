import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@issueflow/types';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, pass: string, name?: string, role: UserRole = UserRole.MEMBER, secretCode?: string) {
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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, response?: Response) {
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);

    if (response) {
      response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: this.configService.get('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return {
      access_token,
      user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
    };
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
