import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CarsController } from './cars.controller';

@Module({
  imports: [
    AnalyticsModule,
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
    ]),
  ],
  controllers: [CarsController],
})
export class CarsModule {}
