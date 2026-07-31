import {
  Controller,
  Inject,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from '../auth/decorators/public.decorator';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';

@Controller('cars')
export class CarsController {
  constructor(
    @Inject('CAR_SERVICE')
    private readonly carServiceClient: ClientProxy,
  ) {}

  @Post()
  create(@Body() input: CreateCarDto): Promise<Car> {
    return this.send<Car>('car.create', input);
  }

  @Get()
  findAll(): Promise<Car[]> {
    return this.send<Car[]>('car.find-all', {});
  }

  @Public()
  @Get('health')
  getHealth(): Promise<{
    service: string;
    status: string;
    transport: string;
  }> {
    return this.send('car.health', {});
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Car> {
    return this.send<Car>('car.find-one', { id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateCarDto): Promise<Car> {
    return this.send<Car>('car.update', {
      id,
      data: input,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{
    deleted: boolean;
    id: string;
  }> {
    return this.send('car.remove', { id });
  }

  private async send<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await firstValueFrom(
        this.carServiceClient.send<T>(pattern, payload).pipe(
          timeout(5000),
          catchError((error: unknown) => throwError(() => error)),
        ),
      );
    } catch (error: unknown) {
      this.handleRpcError(error);
    }
  }

  private handleRpcError(error: unknown): never {
    const rpcError = this.extractRpcError(error);

    if (rpcError.statusCode === 404) {
      throw new NotFoundException(rpcError.message ?? 'Car not found');
    }

    throw new ServiceUnavailableException('Car Service is unavailable');
  }

  private extractRpcError(error: unknown): RpcError {
    if (typeof error === 'object' && error !== null) {
      return error as RpcError;
    }

    return {};
  }
}
