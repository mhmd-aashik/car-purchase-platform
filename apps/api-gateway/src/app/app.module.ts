import { Module } from '@nestjs/common';
import { CarsModule } from './cars/cars.module';
import { PurchasesModule } from './purchases/purchases.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [AnalyticsModule, AuthModule, CarsModule, PurchasesModule],
})
export class AppModule {}
