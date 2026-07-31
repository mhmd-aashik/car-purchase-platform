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
  create(@Payload() payload: CreateCarDto): Car {
    return this.carsService.create(payload);
  }

  @MessagePattern('car.find-all')
  findAll(): Car[] {
    return this.carsService.findAll();
  }

  @MessagePattern('car.find-one')
  findOne(@Payload() payload: FindCarPayload): Car {
    const car = this.carsService.findOne(payload.id);

    if (!car) {
      throw new RpcException({
        statusCode: 404,
        message: 'Car not found',
      });
    }

    return car;
  }

  @MessagePattern('car.update')
  update(@Payload() payload: UpdateCarPayload): Car {
    const car = this.carsService.update(payload.id, payload.data);

    if (!car) {
      throw new RpcException({
        statusCode: 404,
        message: 'Car not found',
      });
    }

    return car;
  }

  @MessagePattern('car.remove')
  remove(@Payload() payload: RemoveCarPayload): {
    deleted: boolean;
    id: string;
  } {
    const deleted = this.carsService.remove(payload.id);

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
  } {
    return {
      service: 'car-service',
      status: 'running',
      transport: 'rabbitmq',
    };
  }
}
