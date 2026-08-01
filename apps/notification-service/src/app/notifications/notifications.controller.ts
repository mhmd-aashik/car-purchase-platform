import { Controller, Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PurchaseCompletedEvent } from './purchase-completed.event';

@Controller()
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('purchase.completed')
  async handlePurchaseCompleted(
    @Payload() event: PurchaseCompletedEvent,
  ): Promise<void> {
    this.logger.log(`Received purchase.completed event ${event.eventId}`);

    await this.notificationsService.sendPurchaseConfirmation(event);
  }
}
