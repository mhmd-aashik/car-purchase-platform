import 'dotenv/config';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('PurchaseService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
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
  );

  app.enableShutdownHooks();

  await app.listen();

  logger.log('Purchase Service connected to RabbitMQ');
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('PurchaseServiceBootstrap');

  logger.error(
    'Failed to start Purchase Service',
    error instanceof Error ? error.stack : String(error),
  );

  process.exit(1);
});
