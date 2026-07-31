import { Controller } from '@nestjs/common';
import { CarsService } from './cars.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  Car,
  FindCarPayload,
  RemoveCarPayload,
  UpdateCarPayload,
} from './types/car.types';
import { CreateCarDto } from './dto/create-car.dto';

@Controller()
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @MessagePattern('car.create')
  create(@Payload() payload: CreateCarDto): Promise<Car> {
    return this.carsService.create(payload);
  }

  @MessagePattern('car.find-all')
  findAll(): Promise<Car[]> {
    return this.carsService.findAll();
  }

  @MessagePattern('car.find-one')
  async findOne(@Payload() payload: FindCarPayload): Promise<Car> {
    const car = await this.carsService.findOne(payload.id);

    if (!car) {
      throw new RpcException({
        statusCode: 404,
        message: 'Car not found',
      });
    }

    return car;
  }

  @MessagePattern('car.update')
  async update(@Payload() payload: UpdateCarPayload): Promise<Car> {
    const car = await this.carsService.update(payload.id, payload.data);

    if (!car) {
      throw new RpcException({
        statusCode: 404,
        message: 'Car not found',
      });
    }

    return car;
  }

  @MessagePattern('car.remove')
  async remove(@Payload() payload: RemoveCarPayload): Promise<{
    deleted: boolean;
    id: string;
  }> {
    const deleted = await this.carsService.remove(payload.id);

    if (!deleted) {
      throw new RpcException({
        statusCode: 404,
        message: 'Car not found',
      });
    }

    return {
      deleted: true,
      id: payload.id,
    };
  }

  @MessagePattern('car.health')
  getHealth(): {
    service: string;
    status: string;
    transport: string;
    database: string;
  } {
    return {
      service: 'car-service',
      status: 'running',
      transport: 'rabbitmq',
      database: 'postgresql',
    };
  }
}
