import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern('car.health')
  getHealth() {
    return {
      service: 'car-service',
      status: 'running',
      transport: 'rabbitmq',
    };
  }
}
