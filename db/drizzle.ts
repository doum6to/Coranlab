import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const db = drizzle(pool, { schema });

export default db;
