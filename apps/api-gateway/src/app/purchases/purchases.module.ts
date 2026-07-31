import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PurchasesController } from './purchases.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PURCHASE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ??
              'amqp://car_user:car_password@localhost:5672/car_platform',
          ],
          queue: 'purchase_service_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [PurchasesController],
})
export class PurchasesModule {}
