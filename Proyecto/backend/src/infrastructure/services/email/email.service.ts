// src/infrastructure/services/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailContract } from 'src/domain/contracts/email.contract';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService implements EmailContract {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendWelcomeEmail(user: {
    id: string;
    nombres: string;
    apellidos: string;
    correo_electronico: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido ${user.nombres} ${user.apellidos}!</h2>
        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Datos de tu cuenta:</h3>
          <p><strong>ID:</strong> <code>${user.id}</code></p>
          <p><strong>Email:</strong> ${user.correo_electronico}</p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_USER')!,
        to: user.correo_electronico,
        subject: `¡Bienvenido ${user.nombres}! ID: ${user.id}`,
        html,
      });
      this.logger.log(`Email de bienvenida enviado a ${user.correo_electronico}`);
    } catch (error) {
      this.logger.error(`Error enviando email a ${user.correo_electronico}:`, error);
      throw new Error('Fallo al enviar email de bienvenida');
    }
  }
}
