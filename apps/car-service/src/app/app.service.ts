import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return {
      service: 'car-service',
      status: 'running',
    };
  }
}
