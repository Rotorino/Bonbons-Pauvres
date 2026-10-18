require('dotenv').config();

const path = require('path');
const https = require('https');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { Pool } = require('pg');
const { SocksProxyAgent } = require('socks-proxy-agent');

const app = express();
const port = Number(process.env.PORT) || 3000;

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

function postDiscordWebhook(webhookUrl, payload) {
  const body = JSON.stringify(payload);
  const proxyUrl = process.env.DISCORD_SOCKS5_PROXY;

  return new Promise((resolve, reject) => {
    const request = https.request(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      agent: proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined,
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => resolve({ status: response.statusCode || 500, body: responseBody }));
    });
    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

async function sendContactToDiscord({ name, phone, email, message }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  const response = await postDiscordWebhook(webhookUrl, {
    username: 'Bonbons Pauvres',
    embeds: [{
      title: 'Новая заявка с сайта',
      color: 13954871,
      fields: [
        { name: 'Имя', value: name, inline: true },
        { name: 'Телефон', value: phone, inline: true },
        { name: 'Email', value: email, inline: true },
        { name: 'Комментарий', value: message.slice(0, 1024) },
      ],
      timestamp: new Date().toISOString(),
    }],
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Discord webhook responded with ${response.status}: ${response.body.slice(0, 300)}`);
  }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'bonbons-pauvres-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));
const frontendPath = path.join(__dirname, '..', 'frontend', 'public');
app.use(express.static(frontendPath));

const pages = {
  '/': 'index.html',
  '/about': 'about.html',
  '/menu': 'menu.html',
  '/articles': 'articles.html',
  '/contacts': 'contacts.html',
};

for (const [route, file] of Object.entries(pages)) {
  app.get(route, (_req, res) => {
    res.sendFile(path.join(frontendPath, file));
  });
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bonbons-pauvres' });
});

app.get('/api/categories', async (_req, res) => {
  try { res.json((await pool.query('SELECT id, name, slug FROM categories ORDER BY id')).rows); }
  catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось загрузить категории.' }); }
});

app.get('/api/dishes', async (req, res) => {
  try {
    const values = [];
    let filter = '';
    if (req.query.category_id) { values.push(Number(req.query.category_id)); filter = 'WHERE d.category_id = $1'; }
    const result = await pool.query(`SELECT d.id, d.title, d.description, d.price, d.weight, d.badge, d.image_url, c.slug AS category FROM dishes d JOIN categories c ON c.id = d.category_id ${filter} ORDER BY d.sort_order, d.id`, values);
    res.json(result.rows);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось загрузить каталог.' }); }
});

app.get('/api/services', async (_req, res) => {
  try { res.json((await pool.query('SELECT id, title, description FROM services ORDER BY sort_order, id')).rows); }
  catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось загрузить услуги.' }); }
});

app.get('/api/articles', async (_req, res) => {
  try { res.json((await pool.query('SELECT id, title, excerpt, content, published_at FROM articles ORDER BY published_at DESC, id')).rows); }
  catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось загрузить статьи.' }); }
});

async function getPoll(pollId) {
  const result = await pool.query(`SELECT p.id, p.question, o.id AS option_id, o.title, COUNT(v.id)::int AS votes
    FROM polls p JOIN poll_options o ON o.poll_id = p.id LEFT JOIN votes v ON v.option_id = o.id
    WHERE p.is_active = TRUE ${pollId ? 'AND p.id = $1' : ''}
    GROUP BY p.id, p.question, o.id, o.title, o.sort_order ORDER BY o.sort_order`, pollId ? [pollId] : []);
  if (!result.rows.length) return null;
  const total = result.rows.reduce((sum, row) => sum + row.votes, 0);
  return { id: result.rows[0].id, question: result.rows[0].question, total, options: result.rows.map((row) => ({ id: row.option_id, title: row.title, votes: row.votes, percent: total ? Math.round((row.votes / total) * 100) : 0 })) };
}

app.get('/api/poll', async (req, res) => {
  try { const poll = await getPoll(); if (!poll) return res.status(404).json({ error: 'Активный опрос не найден.' }); res.json({ ...poll, hasVoted: Boolean(req.session.votedPolls?.includes(poll.id)) }); }
  catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось загрузить опрос.' }); }
});

app.get('/api/poll/results', async (_req, res) => {
  try { const poll = await getPoll(); if (!poll) return res.status(404).json({ error: 'Активный опрос не найден.' }); res.json(poll); }
  catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось загрузить результаты.' }); }
});

app.post('/api/vote', async (req, res) => {
  const optionId = Number(req.body.optionId);
  try {
    const poll = await getPoll();
    if (!poll) return res.status(404).json({ error: 'Активный опрос не найден.' });
    if (req.session.votedPolls?.includes(poll.id)) return res.status(409).json({ error: 'Вы уже голосовали в этом опросе.' });
    if (!poll.options.some((option) => option.id === optionId)) return res.status(400).json({ error: 'Выбранный вариант не найден.' });
    await pool.query('INSERT INTO votes (poll_id, option_id, session_id) VALUES ($1, $2, $3)', [poll.id, optionId, req.sessionID]);
    req.session.votedPolls = [...(req.session.votedPolls || []), poll.id];
    res.json({ message: 'Ваш голос принят.', poll: await getPoll(poll.id) });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Не удалось сохранить голос.' }); }
});

app.post('/api/contact', async (req, res) => {
  const { name, phone, email, message, consent } = req.body;
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (cleanName.length < 2 || cleanName.length > 80) return res.status(400).json({ error: 'Укажите имя длиной от 2 до 80 символов.' });
  if (!/^\+?[0-9 ()-]{7,20}$/.test(cleanPhone)) return res.status(400).json({ error: 'Укажите корректный номер телефона.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ error: 'Укажите корректный email.' });
  if (cleanMessage.length < 10 || cleanMessage.length > 1000) return res.status(400).json({ error: 'Комментарий должен содержать от 10 до 1000 символов.' });
  if (!consent) return res.status(400).json({ error: 'Необходимо согласиться на обработку данных.' });

  try {
    await pool.query('INSERT INTO contact_requests (name, phone, email, message) VALUES ($1, $2, $3, $4)', [cleanName, cleanPhone, cleanEmail, cleanMessage]);
    console.log(`Новая заявка от ${cleanName}: ${cleanEmail}`);
    sendContactToDiscord({ name: cleanName, phone: cleanPhone, email: cleanEmail, message: cleanMessage })
      .catch((webhookError) => console.error('Не удалось отправить заявку в Discord:', webhookError.message));
    return res.json({ message: 'Спасибо! Мы свяжемся с вами в ближайшее время.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Не удалось сохранить заявку.' });
  }
});

async function checkDatabaseConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('PostgreSQL: подключение успешно.');
  } catch (error) {
    console.error('PostgreSQL: ошибка подключения:', error.message);
  }
}

app.listen(port, () => {
  console.log(`Bonbons Pauvres запущен: http://localhost:${port}`);
  checkDatabaseConnection();
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

module.exports = { app, pool };
