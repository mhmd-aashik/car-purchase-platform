import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { PurchaseCompletedEvent } from './purchase-completed.event';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>('SMTP_HOST');
    const port = this.configService.getOrThrow<number>('SMTP_PORT');

    this.fromAddress = this.configService.getOrThrow<string>('SMTP_FROM');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: undefined,
    });
  }

  async sendPurchaseConfirmation(event: PurchaseCompletedEvent): Promise<void> {
    const { data } = event;

    const subject = `Purchase confirmed: ${data.carBrand} ${data.carModel}`;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: data.userEmail,
      subject,
      text: this.createTextBody(event),
      html: this.createHtmlBody(event),
      headers: {
        'X-Event-Id': event.eventId,
        'X-Purchase-Id': data.purchaseId,
      },
    });

    this.logger.log(
      `Purchase email sent to ${data.userEmail} for purchase ${data.purchaseId}`,
    );
  }

  private createTextBody(event: PurchaseCompletedEvent): string {
    const { data } = event;

    return [
      'Your car purchase has been completed.',
      '',
      `Purchase ID: ${data.purchaseId}`,
      `Car: ${data.carBrand} ${data.carModel}`,
      `Amount: AED ${data.amount.toFixed(2)}`,
      '',
      'Thank you for using Car Platform.',
    ].join('\n');
  }

  private createHtmlBody(event: PurchaseCompletedEvent): string {
    const { data } = event;

    return `
      <main>
        <h1>Purchase confirmed</h1>

        <p>Your car purchase has been completed.</p>

        <dl>
          <dt>Purchase ID</dt>
          <dd>${this.escapeHtml(data.purchaseId)}</dd>

          <dt>Car</dt>
          <dd>
            ${this.escapeHtml(data.carBrand)}
            ${this.escapeHtml(data.carModel)}
          </dd>

          <dt>Amount</dt>
          <dd>AED ${data.amount.toFixed(2)}</dd>
        </dl>

        <p>Thank you for using Car Platform.</p>
      </main>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace('&', '&amp;')
      .replace('<', '&lt;')
      .replace('>', '&gt;')
      .replace('"', '&quot;')
      .replace("'", '&#039;');
  }
}
