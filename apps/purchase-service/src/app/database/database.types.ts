import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

export type PurchaseDatabase = NodePgDatabase<typeof schema>;
