import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';
import { PrismaClient } from './generated/prisma/client';

// Configure WebSocket for Neon Serverless Driver in Node environment
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  // Extract database URL from process environment
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://placeholder:dummy@localhost:5432/placeholder?sslmode=require";

  if (!process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL is not configured in process.env. Runtime database queries will fail until set."
    );
  }

  // Initialize PrismaNeon adapter with the config directly
  // give up on an unreachable database after 8s (Neon wakes from sleep in a second or two), so
  // callers with a fallback (lib/contentStore.ts) are not held for the driver's long default
  const adapter = new PrismaNeon({ connectionString, connectionTimeoutMillis: 8000 });

  // Pass it as the single required `adapter` option
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
