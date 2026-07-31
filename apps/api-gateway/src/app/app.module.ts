import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module';
import { PurchasesModule } from './purchases/purchases.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, CarsModule, PurchasesModule],
})
export class AppModule {}
