import { timestamp, uuid } from 'drizzle-orm/pg-core';
import { numeric } from 'drizzle-orm/pg-core';
import { varchar } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';

export const carStatusEnum = pgEnum('car_status', [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
]);

export const cars = pgTable('cars', {
  id: uuid('id').defaultRandom().primaryKey(),
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
  status: carStatusEnum('status').default('AVAILABLE').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
    .defaultNow()
    .notNull(),
});

export type CarRecord = typeof cars.$inferSelect;
export type NewCarRecord = typeof cars.$inferInsert;
