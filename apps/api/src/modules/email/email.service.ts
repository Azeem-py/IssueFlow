import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  private getTransporter() {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendInvitationEmail(to: string, orgName: string, inviterName: string, inviteToken: string) {
    const inviteUrl = `${this.configService.get('FRONTEND_URL')}/invite/accept?token=${inviteToken}`;
    const transporter = this.getTransporter();
    const user = this.configService.get('EMAIL_USER');

    const mailOptions = {
      from: `"IssueFlow" <${user}>`,
      to,
      subject: `Invitation to join ${orgName} on IssueFlow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #000; font-weight: 800; text-transform: uppercase; letter-spacing: -0.025em; margin-bottom: 24px;">You've been invited!</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">${inviterName} has invited you to join the organization <strong>${orgName}</strong> on IssueFlow.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 12px;">IssueFlow is a high-performance issue tracking system designed for developer flow.</p>
          <div style="margin: 40px 0;">
            <a href="${inviteUrl}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 0.05em; display: inline-block;">Accept Invitation</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;"><a href="${inviteUrl}" style="color: #000; font-weight: 600;">${inviteUrl}</a></p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center;">This invitation will expire in 7 days.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending invitation email:', error);
    }
  }

  async sendOtpEmail(to: string, otp: string) {
    const transporter = this.getTransporter();
    const user = this.configService.get('EMAIL_USER');

    const mailOptions = {
      from: `"IssueFlow" <${user}>`,
      to,
      subject: `Your Password Reset OTP - IssueFlow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e0e0e0; border-radius: 12px; text-align: center;">
          <h2 style="color: #000; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em; margin-bottom: 8px;">Reset Your Password</h2>
          <p style="color: #6b7280; font-size: 16px; margin-bottom: 32px;">Use the following code to reset your password. This code will expire in 10 minutes.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <span style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 900; letter-spacing: 0.2em; color: #000;">${otp}</span>
          </div>

          <p style="color: #9ca3af; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">IssueFlow - High Performance Issue Tracking</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending OTP email:', error);
    }
  }
}
