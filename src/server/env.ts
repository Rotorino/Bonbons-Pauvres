import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  NODE_ENV: process.env.NODE_ENV,
});
