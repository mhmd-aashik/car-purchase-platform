import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

import { CreatePurchaseDto } from './dto/create-purchase.dto';

import { PurchasesService } from './purchases.service';
import {
  Purchase,
  FindPurchasePayload,
  FindUserPurchasesPayload,
} from './types/purchase.types';

@Controller()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @MessagePattern('purchase.health')
  getHealth(): {
    service: string;
    status: string;
    transport: string;
    database: string;
  } {
    return {
      service: 'purchase-service',
      status: 'running',
      transport: 'rabbitmq',
      database: 'postgresql',
    };
  }

  @MessagePattern('purchase.create')
  create(@Payload() payload: CreatePurchaseDto): Promise<Purchase> {
    return this.purchasesService.create(payload);
  }

  @MessagePattern('purchase.find-one')
  async findOne(@Payload() payload: FindPurchasePayload): Promise<Purchase> {
    const purchase = await this.purchasesService.findOne(payload.id);

    if (!purchase) {
      throw new RpcException({
        statusCode: 404,
        message: 'Purchase not found',
      });
    }

    return purchase;
  }

  @MessagePattern('purchase.find-by-user')
  findByUser(
    @Payload()
    payload: FindUserPurchasesPayload,
  ): Promise<Purchase[]> {
    return this.purchasesService.findByUser(payload.userId);
  }
}
