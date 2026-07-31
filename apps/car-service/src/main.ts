/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import 'dotenv/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap(): Promise<void> {
  const logger = new Logger('CarService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
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
  );

  app.enableShutdownHooks();

  await app.listen();

  logger.log('Car Service connected to RabbitMQ');
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('CarServiceBootstrap');
  logger.error('Failed to start Car Service', error);
  process.exit(1);
});
