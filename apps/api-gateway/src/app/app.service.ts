import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return {
      service: 'api-gateway',
      status: 'running',
    };
  }
}
