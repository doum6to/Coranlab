import { config } from "dotenv";
import type { Config } from "drizzle-kit";

config({ path: ".env.local" });

const dbUrl = new URL(process.env.DATABASE_URL!);

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    host: dbUrl.hostname,
    port: Number(dbUrl.port),
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
  },
} satisfies Config;
