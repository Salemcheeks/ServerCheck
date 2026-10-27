const express = require('express');
const cors = require('cors');
const dashboardHtml = require('./dashboard');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_LOGS = 30;

app.use(cors());
app.use(express.json());

// ------------------------------------------------------------------
// Data storage
// Default: in-memory (may be lost or split across instances on Vercel).
// Optional: Upstash Redis (Vercel Marketplace) -> used automatically
// when the environment variables below are present.
// ------------------------------------------------------------------
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);
const KEY = 'sensor_logs';
let memoryLogs = [];

async function redisPipeline(commands) {
  const res = await fetch(REDIS_URL + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + REDIS_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!res.ok) throw new Error('Redis HTTP ' + res.status);
  return res.json();
}

async function saveLog(entry) {
  if (!useRedis) {
    memoryLogs.unshift(entry);
    if (memoryLogs.length > MAX_LOGS) memoryLogs.length = MAX_LOGS;
    return;
  }
  await redisPipeline([
    ['LPUSH', KEY, JSON.stringify(entry)],
    ['LTRIM', KEY, '0', String(MAX_LOGS - 1)]
  ]);
}

async function getLogs() {
  if (!useRedis) return memoryLogs;
  const [r] = await redisPipeline([['LRANGE', KEY, '0', String(MAX_LOGS - 1)]]);
  return (r.result || []).map((s) => JSON.parse(s));
}

// ------------------------------------------------------------------
// API (unchanged for the ESP32: POST JSON { device_id, suhu, kelembapan })
//   suhu = temperature (°C), kelembapan = humidity / moisture (%)
// ------------------------------------------------------------------
app.post('/api/sensor', async (req, res) => {
  const { device_id, suhu, kelembapan } = req.body || {};

  if (suhu === undefined || kelembapan === undefined) {
    return res.status(400).json({ status: 'error', message: 'Temperature or humidity value is missing' });
  }
  if (Number.isNaN(Number(suhu)) || Number.isNaN(Number(kelembapan))) {
    return res.status(400).json({ status: 'error', message: 'Temperature and humidity must be numbers' });
  }

  const now = Date.now();
  const entry = {
    id: now,
    ts: now,
    device_id: String(device_id || 'ESP32-01').slice(0, 40),
    suhu: Number(suhu),
    kelembapan: Number(kelembapan),
    waktu: new Date(now).toLocaleTimeString('en-GB', { timeZone: 'Asia/Jakarta' })
  };

  try {
    await saveLog(entry);
    console.log(`[IN] ${entry.device_id} | Temp: ${entry.suhu}°C | Humidity: ${entry.kelembapan}%`);
    res.status(200).json({ status: 'success', data: entry });
  } catch (err) {
    console.error('Failed to save:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to save data' });
  }
});

app.get('/api/sensor', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    res.json(await getLogs());
  } catch (err) {
    console.error('Failed to read:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to read data' });
  }
});

// TerraTech dashboard
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(dashboardHtml);
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} (storage: ${useRedis ? 'Upstash Redis' : 'memory'})`)
);

module.exports = app;
