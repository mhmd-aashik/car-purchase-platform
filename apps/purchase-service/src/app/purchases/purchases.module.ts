import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CAR_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ??
              'amqp://car_user:car_password@localhost:5672/car_platform',
          ],
          queue: 'car_service_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ??
              'amqp://car_user:car_password@localhost:5672/car_platform',
          ],
          queue: 'notification_service_queue',
          queueOptions: {
            durable: true,
          },
          persistent: true,
        },
      },
    ]),
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
