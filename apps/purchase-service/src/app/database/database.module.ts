import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { PURCHASE_DATABASE } from './database.constants';
import * as schema from './schema';

const PURCHASE_POOL = Symbol('PURCHASE_POOL');

@Global()
@Module({
  providers: [
    {
      provide: PURCHASE_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool => {
        return new Pool({
          connectionString: configService.getOrThrow<string>(
            'PURCHASE_DATABASE_URL',
          ),
          max: 10,
        });
      },
    },
    {
      provide: PURCHASE_DATABASE,
      inject: [PURCHASE_POOL],
      useFactory: (pool: Pool) => {
        return drizzle(pool, {
          schema,
        });
      },
    },
  ],
  exports: [PURCHASE_DATABASE],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(
    @Inject(PURCHASE_POOL)
    private readonly pool: Pool,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
