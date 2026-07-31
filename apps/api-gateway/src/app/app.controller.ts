import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

interface CarServiceHealth {
  service: string;
  status: string;
  transport: string;
}

@Controller()
export class AppController {
  constructor(
    @Inject('CAR_SERVICE')
    private readonly carServiceClient: ClientProxy,
  ) {}

  @Get()
  getGatewayHealth(): {
    service: string;
    status: string;
  } {
    return {
      service: 'api-gateway',
      status: 'running',
    };
  }

  @Get('cars/health')
  async getCarServiceHealth(): Promise<CarServiceHealth> {
    try {
      return await firstValueFrom(
        this.carServiceClient
          .send<CarServiceHealth>('car.health', {})
          .pipe(timeout(5000)),
      );
    } catch {
      throw new ServiceUnavailableException('Car Service is unavailable');
    }
  }
}
