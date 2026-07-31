import {
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller('purchases')
export class PurchasesController {
  constructor(
    @Inject('PURCHASE_SERVICE')
    private readonly purchaseClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() input: CreatePurchaseDto): Promise<Purchase> {
    return this.send<Purchase>('purchase.create', input);
  }

  @Get('health')
  getHealth(): Promise<{
    service: string;
    status: string;
    transport: string;
    database: string;
  }> {
    return this.send('purchase.health', {});
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string): Promise<Purchase[]> {
    return this.send<Purchase[]>('purchase.find-by-user', { userId });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Purchase> {
    return this.send<Purchase>('purchase.find-one', { id });
  }

  private async send<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await firstValueFrom(
        this.purchaseClient.send<T>(pattern, payload).pipe(timeout(7000)),
      );
    } catch (error: unknown) {
      this.handleRpcError(error);
    }
  }

  private handleRpcError(error: unknown): never {
    const rpcError = this.extractRpcError(error);

    if (rpcError.statusCode === 404) {
      throw new NotFoundException(rpcError.message ?? 'Resource not found');
    }

    if (rpcError.statusCode === 409) {
      throw new ConflictException(
        rpcError.message ?? 'Purchase cannot be completed',
      );
    }

    throw new ServiceUnavailableException(
      rpcError.message ?? 'Purchase Service is unavailable',
    );
  }

  private extractRpcError(error: unknown): RpcError {
    if (typeof error === 'object' && error !== null) {
      return error as RpcError;
    }

    return {};
  }
}
