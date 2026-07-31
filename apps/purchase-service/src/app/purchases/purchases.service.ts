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
    const reservedCar = await this.reserveCar(input.carId, input.userId);

    try {
      const [record] = await this.database
        .insert(purchases)
        .values({
          carId: reservedCar.id,
          userId: input.userId,
          carBrand: reservedCar.brand,
          carModel: reservedCar.model,
          amount: reservedCar.price.toString(),
          status: 'COMPLETED',
        })
        .returning();

      await this.confirmCarSale(input.carId, input.userId);

      return this.toPurchase(record);
    } catch (error: unknown) {
      await this.releaseCarReservationSafely(input.carId, input.userId);

      const rpcError = this.extractRpcError(error);

      if (rpcError.statusCode) {
        throw error;
      }

      throw new RpcException({
        statusCode: 500,
        message: 'Purchase could not be completed',
      });
    }
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

  private async reserveCar(
    carId: string,
    userId: string,
  ): Promise<CarResponse> {
    try {
      return await firstValueFrom(
        this.carServiceClient
          .send<CarResponse>('car.reserve', {
            carId,
            userId,
          })
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

      if (rpcError.statusCode === 409) {
        throw new RpcException({
          statusCode: 409,
          message: 'Car is not available',
        });
      }

      throw new RpcException({
        statusCode: 503,
        message: 'Car Service is unavailable',
      });
    }
  }

  private async confirmCarSale(
    carId: string,
    userId: string,
  ): Promise<CarResponse> {
    try {
      return await firstValueFrom(
        this.carServiceClient
          .send<CarResponse>('car.confirm-sale', {
            carId,
            userId,
          })
          .pipe(timeout(5000)),
      );
    } catch {
      throw new RpcException({
        statusCode: 503,
        message:
          'Purchase was recorded, but the car sale could not be confirmed',
      });
    }
  }

  private async releaseCarReservationSafely(
    carId: string,
    userId: string,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.carServiceClient
          .send('car.release-reservation', {
            carId,
            userId,
          })
          .pipe(timeout(5000)),
      );
    } catch {
      //
    }
  }
}
