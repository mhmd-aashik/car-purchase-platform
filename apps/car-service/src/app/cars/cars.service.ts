import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car, CAR_STATUS } from './types/car.types';

@Injectable()
export class CarsService {
  private readonly cars = new Map<string, Car>();

  create(input: CreateCarDto): Car {
    const now = new Date().toISOString();

    const car: Car = {
      id: randomUUID(),
      brand: input.brand,
      model: input.model,
      year: input.year,
      price: input.price,
      color: input.color,
      status: CAR_STATUS.AVAILABLE,
      createdAt: now,
      updatedAt: now,
    };

    this.cars.set(car.id, car);

    return car;
  }

  findAll(): Car[] {
    return Array.from(this.cars.values());
  }

  findOne(id: string): Car | null {
    return this.cars.get(id) ?? null;
  }

  update(id: string, input: UpdateCarDto): Car | null {
    const existingCar = this.cars.get(id);

    if (!existingCar) {
      return null;
    }

    const updatedCar: Car = {
      ...existingCar,
      ...input,
      id: existingCar.id,
      status: existingCar.status,
      createdAt: existingCar.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.cars.set(id, updatedCar);

    return updatedCar;
  }

  remove(id: string): boolean {
    return this.cars.delete(id);
  }
}
