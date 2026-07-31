import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { desc, eq } from 'drizzle-orm';
import { firstValueFrom, timeout } from 'rxjs';

import { PURCHASE_DATABASE } from '../database/database.constants';
import { PurchaseDatabase } from '../database/database.types';
import { PurchaseRecord, purchases } from '../database/schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Purchase, CarResponse } from './types/purchase.types';

@Injectable()
export class PurchasesService {
  constructor(
    @Inject(PURCHASE_DATABASE)
    private readonly database: PurchaseDatabase,

    @Inject('CAR_SERVICE')
    private readonly carServiceClient: ClientProxy,
  ) {}

  async create(input: CreatePurchaseDto): Promise<Purchase> {
    const car = await this.findCar(input.carId);

    if (car.status !== 'AVAILABLE') {
      throw new RpcException({
        statusCode: 409,
        message: 'Car is not available for purchase',
      });
    }

    const [record] = await this.database
      .insert(purchases)
      .values({
        carId: car.id,
        userId: input.userId,
        carBrand: car.brand,
        carModel: car.model,
        amount: car.price.toString(),
        status: 'COMPLETED',
      })
      .returning();

    return this.toPurchase(record);
  }

  async findOne(id: string): Promise<Purchase | null> {
    const [record] = await this.database
      .select()
      .from(purchases)
      .where(eq(purchases.id, id))
      .limit(1);

    return record ? this.toPurchase(record) : null;
  }

  async findByUser(userId: string): Promise<Purchase[]> {
    const records = await this.database
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));

    return records.map((record) => this.toPurchase(record));
  }

  private async findCar(carId: string): Promise<CarResponse> {
    try {
      return await firstValueFrom(
        this.carServiceClient
          .send<CarResponse>('car.find-one', { id: carId })
          .pipe(timeout(5000)),
      );
    } catch (error: unknown) {
      const rpcError = this.extractRpcError(error);

      if (rpcError.statusCode === 404) {
        throw new RpcException({
          statusCode: 404,
          message: 'Car not found',
        });
      }

      throw new RpcException({
        statusCode: 503,
        message: 'Car Service is unavailable',
      });
    }
  }

  private extractRpcError(error: unknown): {
    statusCode?: number;
    message?: string;
  } {
    if (typeof error === 'object' && error !== null) {
      return error as {
        statusCode?: number;
        message?: string;
      };
    }

    return {};
  }

  private toPurchase(record: PurchaseRecord): Purchase {
    return {
      id: record.id,
      carId: record.carId,
      userId: record.userId,
      carBrand: record.carBrand,
      carModel: record.carModel,
      amount: Number(record.amount),
      status: record.status,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
