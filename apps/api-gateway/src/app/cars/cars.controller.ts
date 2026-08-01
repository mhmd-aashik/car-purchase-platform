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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AuthUser } from '../auth/types';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
import { AnalyticsService } from '../analytics/analytics.service';

@Controller('cars')
export class CarsController {
  constructor(
    @Inject('CAR_SERVICE')
    private readonly carServiceClient: ClientProxy,

    private readonly analyticsService: AnalyticsService,
  ) {}

  @Post()
  create(@Body() input: CreateCarDto): Promise<Car> {
    return this.send<Car>('car.create', input);
  }

  @Public()
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
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<Car> {
    const car = await this.send<Car>('car.find-one', { id });

    this.analyticsService.capture({
      distinctId: user.userId,
      event: 'car_viewed',
      properties: {
        carId: car.id,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price,
      },
    });

    return car;
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
