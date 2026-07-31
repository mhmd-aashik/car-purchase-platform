import {
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const purchaseStatusEnum = pgEnum('purchase_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const purchases = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey(),
  carId: uuid('car_id').notNull(),
  userId: varchar('user_id', {
    length: 255,
  }).notNull(),
  carBrand: varchar('car_brand', {
    length: 100,
  }).notNull(),
  carModel: varchar('car_model', {
    length: 100,
  }).notNull(),
  amount: numeric('amount', {
    precision: 12,
    scale: 2,
  }).notNull(),
  status: purchaseStatusEnum('status').default('COMPLETED').notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'date',
  })
    .defaultNow()
    .notNull(),
});

export type PurchaseRecord = typeof purchases.$inferSelect;

export type NewPurchaseRecord = typeof purchases.$inferInsert;
