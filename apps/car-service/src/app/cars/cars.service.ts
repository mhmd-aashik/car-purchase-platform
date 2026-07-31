import { Inject, Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './types/car.types';
import { DATABASE_CONNECTION } from '../database/database.constants';
import { Database } from '../database/database.types';
import { CarRecord, cars } from '../database/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class CarsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: Database,
  ) {}

  async create(input: CreateCarDto): Promise<Car> {
    const [record] = await this.database
      .insert(cars)
      .values({
        brand: input.brand,
        model: input.model,
        year: input.year,
        price: input.price.toString(),
        color: input.color,
      })
      .returning();

    return this.toCar(record);
  }

  async findAll(): Promise<Car[]> {
    const records = await this.database
      .select()
      .from(cars)
      .orderBy(cars.createdAt);

    return records.map((record) => this.toCar(record));
  }

  async findOne(id: string): Promise<Car | null> {
    const [record] = await this.database
      .select()
      .from(cars)
      .where(eq(cars.id, id))
      .limit(1);

    return record ? this.toCar(record) : null;
  }

  async update(id: string, input: UpdateCarDto): Promise<Car | null> {
    const values = {
      ...(input.brand !== undefined && {
        brand: input.brand,
      }),
      ...(input.model !== undefined && {
        model: input.model,
      }),
      ...(input.year !== undefined && {
        year: input.year,
      }),
      ...(input.price !== undefined && {
        price: input.price.toString(),
      }),
      ...(input.color !== undefined && {
        color: input.color,
      }),
      updatedAt: new Date(),
    };

    const [record] = await this.database
      .update(cars)
      .set(values)
      .where(eq(cars.id, id))
      .returning();

    return record ? this.toCar(record) : null;
  }

  async remove(id: string): Promise<boolean> {
    const deletedRecords = await this.database
      .delete(cars)
      .where(eq(cars.id, id))
      .returning({
        id: cars.id,
      });

    return deletedRecords.length > 0;
  }

  async reserve(carId: string, userId: string): Promise<Car | null> {
    const reservationDurationMs = 5 * 60 * 1000;
    const reservedUntil = new Date(Date.now() + reservationDurationMs);

    const [record] = await this.database
      .update(cars)
      .set({
        status: 'RESERVED',
        reservedBy: userId,
        reservedUntil,
        updatedAt: new Date(),
      })
      .where(and(eq(cars.id, carId), eq(cars.status, 'AVAILABLE')))
      .returning();

    return record ? this.toCar(record) : null;
  }

  async releaseReservation(carId: string, userId: string): Promise<Car | null> {
    const [record] = await this.database
      .update(cars)
      .set({
        status: 'AVAILABLE',
        reservedBy: null,
        reservedUntil: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cars.id, carId),
          eq(cars.status, 'RESERVED'),
          eq(cars.reservedBy, userId),
        ),
      )
      .returning();

    return record ? this.toCar(record) : null;
  }

  private toCar(record: CarRecord): Car {
    return {
      id: record.id,
      brand: record.brand,
      model: record.model,
      year: record.year,
      price: Number(record.price),
      color: record.color,
      status: record.status,
      reservedBy: record.reservedBy,
      reservedUntil: record.reservedUntil?.toISOString() ?? null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
