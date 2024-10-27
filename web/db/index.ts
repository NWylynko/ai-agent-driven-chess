import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import "server-only";

import * as driz from "drizzle-orm";
import * as schema from "./schema";

const client = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(client, { schema });
const { sql } = driz
export { schema, driz, sql };
