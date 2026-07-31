import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return {
      service: 'purchase-service',
      status: 'running',
    };
  }
}
