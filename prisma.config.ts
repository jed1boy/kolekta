import "dotenv/config";
import { defineConfig } from "prisma/config";

// Standard SQLite configuration for migration generation
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: "file:./dev.db",
  },
});
