import { Pool } from 'pg';
import { z } from 'zod';
import { env } from '@/server/env';

export const runtime = 'nodejs';

const submission = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(1000),
  consent: z.union([z.literal('on'), z.literal(true)]),
});

const pool = env.DATABASE_URL ? new Pool({ connectionString: env.DATABASE_URL }) : undefined;

async function notifyDiscord(data: z.infer<typeof submission>) {
  if (!env.DISCORD_WEBHOOK_URL) return;

  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: 'Bonbons Pauvres',
      embeds: [{
        title: 'Новая заявка с сайта',
        color: 13954871,
        fields: [
          { name: 'Имя', value: data.name, inline: true },
          { name: 'Телефон', value: data.phone, inline: true },
          { name: 'Email', value: data.email, inline: true },
          { name: 'Комментарий', value: data.message.slice(0, 1024) },
        ],
        timestamp: new Date().toISOString(),
      }],
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error(`Discord webhook returned ${response.status}`);
}

export async function POST(request: Request) {
  const parsed = submission.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return Response.json({ error: 'Проверьте заполнение формы.' }, { status: 400 });
  if (!pool) return Response.json({ error: 'Приём заявок временно недоступен.' }, { status: 503 });

  const { name, phone, email, message } = parsed.data;
  try {
    await pool.query(
      'INSERT INTO contact_requests (name, phone, email, message) VALUES ($1, $2, $3, $4)',
      [name, phone, email, message],
    );
  } catch (error) {
    console.error('Unable to persist contact request', error);
    return Response.json({ error: 'Не удалось сохранить заявку.' }, { status: 500 });
  }

  notifyDiscord(parsed.data).catch((error: unknown) => console.error('Unable to send Discord notification', error));
  return Response.json({ data: { message: 'Спасибо! Мы свяжемся с вами в ближайшее время.' } });
}
