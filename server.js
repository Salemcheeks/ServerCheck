const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Menyimpan 30 data terakhir di memori RAM untuk pengetesan
let sensorLogs = [];

// Endpoint POST & GET dijadikan satu path agar kompatibel dengan opsi PHP
app.post('/api/sensor', (req, res) => {
  const { device_id, suhu, kelembapan } = req.body;

  if (suhu === undefined || kelembapan === undefined) {
    return res.status(400).json({ status: 'error', message: 'Data suhu atau kelembapan kosong' });
  }

  const entry = {
    id: Date.now(),
    device_id: device_id || 'ESP32-01',
    suhu: Number(suhu),
    kelembapan: Number(kelembapan),
    waktu: new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })
  };

  sensorLogs.unshift(entry);
  if (sensorLogs.length > 30) sensorLogs.pop();

  console.log(`[MASUK] ${entry.device_id} | Suhu: ${entry.suhu}°C | Lembap: ${entry.kelembapan}%`);
  res.status(200).json({ status: 'success', data: entry });
});

app.get('/api/sensor', (req, res) => {
  res.json(sensorLogs);
});

// Halaman Dashboard Monitoring
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Monitor Telemetri ESP32</title>
      <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
        .wrap { max-width: 820px; margin: auto; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .card { background: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; }
        .label { font-size: 0.9rem; color: #94a3b8; }
        .val { font-size: 2.2rem; font-weight: 700; color: #38bdf8; margin-top: 6px; }
        table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; }
        th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #334155; }
        th { background: #334155; color: #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <h2>Dashboard Pengujian Data ESP32 (Node.js)</h2>
        <div class="grid">
          <div class="card"><div class="label">Perangkat Terakhir</div><div id="dev" class="val">-</div></div>
          <div class="card"><div class="label">Suhu (Temperature)</div><div id="temp" class="val">-- °C</div></div>
          <div class="card"><div class="label">Kelembapan (Humidity)</div><div id="hum" class="val">-- %</div></div>
        </div>
        <table>
          <thead><tr><th>Waktu (WIB)</th><th>ID Perangkat</th><th>Suhu (°C)</th><th>Kelembapan (%)</th></tr></thead>
          <tbody id="log-body"></tbody>
        </table>
      </div>
      <script>
        async function loadLogs() {
          const res = await fetch('/api/sensor');
          const data = await res.json();
          if (data.length > 0) {
            document.getElementById('dev').innerText = data[0].device_id;
            document.getElementById('temp').innerText = data[0].suhu + ' °C';
            document.getElementById('hum').innerText = data[0].kelembapan + ' %';
          }
          document.getElementById('log-body').innerHTML = data.map(r =>
            '<tr><td>' + r.waktu + '</td><td>' + r.device_id + '</td><td>' + r.suhu + '</td><td>' + r.kelembapan + '</td></tr>'
          ).join('');
        }
        setInterval(loadLogs, 2000);
        loadLogs();
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));