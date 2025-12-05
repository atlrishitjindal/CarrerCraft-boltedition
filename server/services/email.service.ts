import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to CareerCraft AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to CareerCraft AI!</h1>
            <p>Hi ${name},</p>
            <p>Thank you for joining CareerCraft AI, your intelligent career companion.</p>
            <p>Get started by:</p>
            <ul>
              <li>Uploading your resume for AI analysis</li>
              <li>Exploring job matches tailored to your profile</li>
              <li>Generating AI-powered cover letters</li>
              <li>Preparing for interviews with our AI coach</li>
            </ul>
            <p>Best regards,<br>The CareerCraft AI Team</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - CareerCraft AI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Password Reset Request</h1>
            <p>You requested a password reset for your CareerCraft AI account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  async sendJobApplicationConfirmation(
    email: string,
    jobTitle: string,
    company: string
  ) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Application Submitted: ${jobTitle} at ${company}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Application Submitted</h1>
            <p>Your application has been successfully submitted!</p>
            <p><strong>Position:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p>We'll track any responses and notify you of updates.</p>
            <p>Good luck!</p>
          </div>
        `
      });
    } catch (error) {
      console.error('Email send error:', error);
    }
  }
}

export const emailService = new EmailService();
