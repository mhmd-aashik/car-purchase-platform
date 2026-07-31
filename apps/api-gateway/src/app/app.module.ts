import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module';
import { PurchasesModule } from './purchases/purchases.module';

@Module({
  imports: [CarsModule, PurchasesModule],
})
export class AppModule {}
