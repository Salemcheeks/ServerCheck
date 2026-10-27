// TerraTech dashboard page, served by server.js on route "/".
// Note: do not use backticks or dollar-curly-brace sequences inside this string.
module.exports = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TerraTech - Decision Support System</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script>
tailwind.config = {
  theme: { extend: {
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
    boxShadow: {
      card: '0 2px 12px -2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
      'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)'
    }
  } }
};
</script>
<style>
  .map-grid-bg { background-color:#f1f8f5; background-image:radial-gradient(#10b981 0.8px, transparent 0.8px), radial-gradient(#059669 0.8px, #f1f8f5 0.8px); background-size:28px 28px; background-position:0 0, 14px 14px; }
  @keyframes radar-pulse { 0%{transform:scale(0.9);opacity:0.9} 50%{transform:scale(2.2);opacity:0.25} 100%{transform:scale(3.4);opacity:0} }
  .radar-ping { animation: radar-pulse 2.2s cubic-bezier(0.2,0.8,0.2,1) infinite; }
  .tab-panel { display:none; }
  .tab-panel.active { display:block; animation: fadeUp .3s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  @media print { header, footer, .no-print { display:none !important; } .tab-panel { display:block !important; } }
</style>
</head>
<body class="bg-slate-100/80 font-sans text-slate-800 antialiased min-h-screen flex flex-col">

<!-- ================= HEADER ================= -->
<header class="bg-white/95 border-b border-slate-200/80 sticky top-0 z-50 shadow-sm backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
        <i class="fa-solid fa-earth-asia text-lg"></i>
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-extrabold text-lg tracking-tight text-slate-900">TerraTech</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">v1.1 • DSS</span>
        </div>
        <p class="text-[11px] text-slate-400 font-medium truncate">Crop Rotation Decision Support • ESP32 Sensor + Satellite</p>
      </div>
    </div>

    <div class="hidden md:flex items-center gap-3">
      <div class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs">
        <span class="relative flex h-2.5 w-2.5">
          <span id="live-ping" class="absolute inline-flex h-full w-full rounded-full bg-slate-300 opacity-75"></span>
          <span id="live-dot" class="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
        </span>
        <span id="live-label" class="font-bold text-slate-700">Connecting...</span>
        <span id="live-device" class="text-slate-500 font-mono text-[11px]"></span>
      </div>
      <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-3 py-1.5 text-xs">
        <i class="fa-solid fa-location-dot text-emerald-600"></i>
        <select id="region-select" onchange="updateLocation(this.value)" class="bg-transparent border-none font-bold text-xs outline-none cursor-pointer">
          <option value="kalianda">Kalianda, South Lampung</option>
          <option value="metro">West Metro, Metro City</option>
          <option value="pringsewu">Pringsewu, Pringsewu</option>
          <option value="natar">Natar, South Lampung</option>
        </select>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button onclick="window.print()" class="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
        <i class="fa-solid fa-print"></i> Print
      </button>
      <button id="sync-btn" onclick="manualSync()" class="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition active:scale-95">
        <i id="sync-icon" class="fa-solid fa-rotate"></i><span>Sync</span>
      </button>
    </div>
  </div>

  <div class="bg-white border-t border-slate-100">
    <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex overflow-x-auto">
      <button onclick="switchTab('dashboard')" id="tab-btn-dashboard" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-emerald-600 text-emerald-700"><i class="fa-solid fa-table-columns"></i><span>Overview</span></button>
      <button onclick="switchTab('map')" id="tab-btn-map" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800"><i class="fa-solid fa-map-location-dot"></i><span>Field Map</span></button>
      <button onclick="switchTab('parameters')" id="tab-btn-parameters" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800"><i class="fa-solid fa-sliders"></i><span>Parameters</span></button>
      <button onclick="switchTab('recommendation')" id="tab-btn-recommendation" class="nav-tab shrink-0 flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-800"><i class="fa-solid fa-calendar-check"></i><span>Rotation Plan</span></button>
    </div>
  </div>
</header>

<main class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

<!-- ================= TAB 1: OVERVIEW ================= -->
<section id="tab-dashboard" class="tab-panel active space-y-6">
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

    <!-- Humidity -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
      <div class="flex items-center justify-between text-xs mb-3">
        <span class="font-bold uppercase tracking-wider text-slate-400">Humidity (ESP32)</span>
        <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><i class="fa-solid fa-droplet text-sm"></i></div>
      </div>
      <div class="flex items-baseline gap-2 mb-2 flex-wrap">
        <span id="hum-val" class="text-3xl font-black text-slate-900">--%</span>
        <span id="hum-badge" class="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">Waiting for data</span>
      </div>
      <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div id="hum-bar" class="h-full bg-slate-300 rounded-full transition-all duration-500" style="width:0%"></div></div>
      <p id="hum-note" class="text-[11px] text-slate-400 mt-2">No data from the ESP32 yet.</p>
    </div>

    <!-- Temperature -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
      <div class="flex items-center justify-between text-xs mb-3">
        <span class="font-bold uppercase tracking-wider text-slate-400">Temperature (ESP32)</span>
        <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><i class="fa-solid fa-temperature-half text-sm"></i></div>
      </div>
      <div class="flex items-baseline gap-2 mb-2">
        <span id="temp-val" class="text-3xl font-black text-slate-900">-- °C</span>
      </div>
      <div id="temp-status" class="flex items-center gap-1.5 text-xs text-slate-500 font-bold"><i class="fa-solid fa-circle-question"></i><span>Waiting for data</span></div>
      <p id="temp-range" class="text-[11px] text-slate-400 mt-2">Range of last 30 readings: -</p>
    </div>

    <!-- Satellite climate indices (static) -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all">
      <div class="flex items-center justify-between text-xs mb-3">
        <span class="font-bold uppercase tracking-wider text-slate-400">Climate Indices (MERRA-2)</span>
        <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><i class="fa-solid fa-satellite text-sm"></i></div>
      </div>
      <div class="grid grid-cols-2 gap-3 mb-2">
        <div><div class="text-2xl font-black text-slate-900">4</div><div class="text-[11px] font-semibold text-slate-500">CDD (dry days)</div></div>
        <div><div class="text-2xl font-black text-slate-900">3</div><div class="text-[11px] font-semibold text-slate-500">CWD (wet days)</div></div>
      </div>
      <p class="text-[11px] text-slate-400 mt-2">Static satellite data • statM_2d_edi_Nx</p>
    </div>

    <!-- Recommendation -->
    <div class="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between text-emerald-200 text-xs mb-2">
          <span class="font-bold uppercase tracking-wider">Top Recommendation</span><i class="fa-solid fa-star text-sm"></i>
        </div>
        <div id="rec-main" class="text-2xl font-black tracking-tight">-</div>
        <p id="rec-main-note" class="text-xs text-emerald-100 mt-1">-</p>
      </div>
      <button onclick="switchTab('recommendation')" class="mt-4 w-full bg-white/20 hover:bg-white/30 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
        <span>View Rotation Timeline</span><i class="fa-solid fa-arrow-right text-[10px]"></i>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 space-y-6">

      <!-- Live trend -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Real-time Humidity Trend</h3>
            <p class="text-xs text-slate-500">Latest ESP32 readings compared against the optimal crop threshold.</p>
          </div>
          <div class="flex items-center gap-3 text-xs font-semibold flex-wrap">
            <span class="flex items-center gap-1.5 text-emerald-700"><span class="w-3 h-3 rounded bg-emerald-500"></span>Optimal (&ge;75%)</span>
            <span class="flex items-center gap-1.5 text-amber-700"><span class="w-3 h-3 rounded bg-amber-400"></span>Dry</span>
            <span class="flex items-center gap-1.5 text-blue-700"><span class="w-3 h-3 rounded bg-blue-500"></span>Saturated</span>
          </div>
        </div>
        <div id="trend-chart" class="h-48 bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-end justify-between gap-1.5 sm:gap-3 relative"></div>
        <div class="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span><i class="fa-solid fa-circle-info text-emerald-500 mr-1"></i><span id="trend-note">Waiting for sensor data.</span></span>
          <span id="trend-status" class="font-bold text-slate-500">-</span>
        </div>
      </div>

      <!-- Sensor log -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">ESP32 Telemetry Log</h3>
            <p class="text-xs text-slate-500">10 most recent readings • auto-refreshes every 3 seconds</p>
          </div>
          <span id="log-count" class="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">0 readings</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead><tr class="text-left text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <th class="py-2 pr-4 font-bold">Time (WIB)</th><th class="py-2 pr-4 font-bold">Device</th><th class="py-2 pr-4 font-bold">Temp</th><th class="py-2 pr-4 font-bold">Humidity</th><th class="py-2 font-bold">Status</th>
            </tr></thead>
            <tbody id="log-body"><tr><td colspan="5" class="py-6 text-center text-slate-400">No data received yet.</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Active crop -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-extrabold text-base text-slate-900">Current Crop</h3>
          <button onclick="switchTab('parameters')" class="text-xs text-emerald-600 font-bold hover:underline">Change</button>
        </div>
        <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5 mb-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shrink-0"><i id="active-icon" class="fa-solid fa-seedling"></i></div>
          <div>
            <div id="active-name" class="font-extrabold text-sm text-emerald-950">-</div>
            <div id="active-ket" class="text-xs text-emerald-700 mt-0.5">-</div>
          </div>
        </div>
        <div class="space-y-2.5 text-xs text-slate-600">
          <div class="flex justify-between gap-3 py-1 border-b border-slate-100"><span class="text-slate-400">Priorities:</span><span id="active-prio" class="font-bold text-slate-800 text-right">-</span></div>
          <div class="flex justify-between gap-3 py-1 border-b border-slate-100"><span class="text-slate-400">Family:</span><span id="active-fam" class="font-bold text-slate-800">-</span></div>
          <div class="flex justify-between gap-3 py-1"><span class="text-slate-400">Next:</span><span id="active-next" class="font-bold text-emerald-600 text-right">-</span></div>
        </div>
      </div>

      <!-- Dynamic alerts -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
        <h3 class="font-extrabold text-base text-slate-900 mb-3">Field Condition Alerts</h3>
        <div id="alerts" class="space-y-3"></div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400">Last reading:</span>
          <span id="last-feed" class="font-bold text-slate-700">-</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ================= TAB 2: MAP ================= -->
<section id="tab-map" class="tab-panel space-y-6">
  <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-card">
    <div class="mb-4">
      <h2 class="text-lg font-extrabold text-slate-900">Field Map</h2>
      <p class="text-xs text-slate-500">Active field location with humidity status from the ESP32 sensor.</p>
    </div>
    <div class="h-[460px] map-grid-bg rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-center shadow-inner">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#0596691a_1px,transparent_1px),linear-gradient(to_bottom,#0596691a_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div class="absolute top-4 left-4 bg-white/95 p-3.5 rounded-2xl border border-slate-200 shadow-md text-xs space-y-1.5 max-w-[240px] z-20">
        <div class="font-extrabold text-slate-800 flex items-center gap-1.5"><i class="fa-solid fa-microchip text-emerald-600"></i>Field Sensor</div>
        <div class="text-[11px] text-slate-500 leading-snug">
          Device: <span id="map-device" class="font-semibold text-slate-700">-</span><br>
          Humidity: <span id="map-hum" class="font-semibold text-slate-700">-</span><br>
          Temperature: <span id="map-temp" class="font-semibold text-slate-700">-</span>
        </div>
      </div>

      <div class="absolute top-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-[11px] font-mono z-20" id="map-coord">-</div>

      <div class="relative flex flex-col items-center justify-center z-10">
        <div id="map-ring" class="absolute w-32 h-32 rounded-full bg-emerald-500/20 radar-ping"></div>
        <div id="map-pin" class="w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-center text-xl"><i class="fa-solid fa-location-dot"></i></div>
        <div id="map-label" class="mt-2 bg-slate-900/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">-</div>
      </div>

      <div class="absolute bottom-4 left-4 right-4 bg-white/95 p-3.5 rounded-2xl border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-3 z-20">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
          <span class="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Legend:</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span>Optimal (75-95%)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-400"></span>Dry (40-75%)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500"></span>Saturated (&gt;95%)</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500"></span>Critical (&lt;40%)</span>
        </div>
        <button onclick="switchTab('parameters')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition">Use This Location <i class="fa-solid fa-arrow-right ml-1"></i></button>
      </div>
    </div>
  </div>
</section>

<!-- ================= TAB 3: PARAMETERS ================= -->
<section id="tab-parameters" class="tab-panel space-y-6">
  <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card">
    <div class="border-b border-slate-100 pb-5 mb-6">
      <h2 class="text-lg font-extrabold text-slate-900">Field Parameters</h2>
      <p class="text-xs text-slate-500">Choose the last crop and your rotation priorities. The recommendation is recalculated with the latest sensor data.</p>
    </div>

    <div class="mb-8">
      <label class="font-extrabold text-sm text-slate-900 flex items-center gap-2 mb-4">
        <span class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">1</span>Last / Current Crop
      </label>
      <div id="crop-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"></div>
    </div>

    <div class="mb-8">
      <div class="flex items-center justify-between mb-4 gap-2">
        <label class="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>Rotation Priorities
        </label>
        <span class="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">Multi-select</span>
      </div>
      <div id="prio-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>
    </div>

    <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
      <button onclick="switchTab('dashboard')" class="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
      <button onclick="renderAll(); switchTab('recommendation')" class="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition active:scale-95 flex items-center gap-2">
        <span>Calculate Rotation Plan</span><i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  </div>
</section>

<!-- ================= TAB 4: ROTATION PLAN ================= -->
<section id="tab-recommendation" class="tab-panel space-y-6">
  <div class="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold mb-3 border border-white/20">
        <i class="fa-solid fa-wand-magic-sparkles"></i>Recommendation
      </div>
      <h2 class="text-2xl sm:text-3xl font-black tracking-tight">3-Stage Rotation Plan</h2>
      <p id="rec-summary" class="text-sm text-emerald-100/90 mt-1 max-w-2xl">-</p>
    </div>
    <button onclick="window.print()" class="no-print px-5 py-3 text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl shadow-lg transition flex items-center gap-2 self-start md:self-auto">
      <i class="fa-solid fa-download"></i> Export PDF
    </button>
  </div>

  <div id="rec-metrics" class="grid grid-cols-1 sm:grid-cols-3 gap-4"></div>
  <div id="rec-timeline" class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6"></div>
</section>

</main>

<footer class="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
    <div><span class="font-extrabold text-slate-800">TerraTech DSS</span> • ESP32 Sensor + NASA MERRA-2 Satellite Data</div>
    <div>Target Region: Lampung Province, Indonesia</div>
  </div>
</footer>

<script>
var API = '/api/sensor';
var POLL_MS = 3000;
var ONLINE_WINDOW_S = 60;

var REGIONS = {
  kalianda:  { label: 'Kalianda, South Lampung', short: 'Kalianda',   lat: -5.722, lon: 105.589 },
  metro:     { label: 'West Metro, Metro City',  short: 'West Metro', lat: -5.117, lon: 105.300 },
  pringsewu: { label: 'Pringsewu, Pringsewu',    short: 'Pringsewu',  lat: -5.358, lon: 104.974 },
  natar:     { label: 'Natar, South Lampung',    short: 'Natar',      lat: -5.315, lon: 105.205 }
};

// Crop traits used by the rotation rule engine
var CROPS = {
  Terong: { nama: 'Eggplant', latin: 'Solanum melongena', famili: 'Solanaceae', akar: 'deep', akarCm: '40 - 60 cm', hari: [90, 120], air: 'medium', tahanKering: false, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-seedling', ket: 'Deep Roots • Heavy Feeder' },
  Sawi:   { nama: 'Mustard Greens', latin: 'Brassica rapa', famili: 'Brassicaceae', akar: 'shallow', akarCm: '10 - 20 cm', hari: [30, 40], air: 'medium', tahanKering: false, tahanPanas: false, beratHara: false, legum: false, icon: 'fa-leaf', ket: 'Shallow Roots • Fast Harvest' },
  Selada: { nama: 'Lettuce', latin: 'Lactuca sativa', famili: 'Asteraceae', akar: 'shallow', akarCm: '10 - 20 cm', hari: [35, 45], air: 'high', tahanKering: false, tahanPanas: false, beratHara: false, legum: false, icon: 'fa-leaf', ket: 'Shallow Roots • Needs Water' },
  Bayam:  { nama: 'Amaranth Spinach', latin: 'Amaranthus spp.', famili: 'Amaranthaceae', akar: 'shallow', akarCm: '15 - 25 cm', hari: [25, 35], air: 'medium', tahanKering: false, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-plant-wilt', ket: 'High Nitrogen Demand' },
  Cabai:  { nama: "Bird's Eye Chili", latin: 'Capsicum frutescens', famili: 'Solanaceae', akar: 'deep', akarCm: '30 - 50 cm', hari: [90, 120], air: 'low', tahanKering: true, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-pepper-hot', ket: 'Moderately Drought Tolerant' },
  Jagung: { nama: 'Sweet Corn', latin: 'Zea mays saccharata', famili: 'Poaceae', akar: 'deep', akarCm: '60 - 90 cm', hari: [70, 85], air: 'medium', tahanKering: true, tahanPanas: true, beratHara: true, legum: false, icon: 'fa-wheat-awn', ket: 'Heavy Biomass' },
  Kacang: { nama: 'Peanut', latin: 'Arachis hypogaea', famili: 'Fabaceae', akar: 'medium', akarCm: '30 - 40 cm', hari: [90, 110], air: 'low', tahanKering: true, tahanPanas: true, beratHara: false, legum: true, icon: 'fa-seedling', ket: 'Legume • Nitrogen Fixing', hanyaKandidat: true }
};

var PRIORITIES = [
  { key: 'air',   icon: 'fa-droplet',     title: 'Water Efficiency',       desc: 'Favor drought-tolerant crops when sensor humidity drops.' },
  { key: 'cepat', icon: 'fa-bolt',        title: 'Fast Harvest',           desc: 'Favor crops that can be harvested in under 45 days.' },
  { key: 'tanah', icon: 'fa-arrows-spin', title: 'Soil Health & Structure', desc: 'Alternate root depth and plant family, and add nitrogen-fixing legumes.' }
];

var AIR_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

var state = { logs: [], crop: 'Terong', pr: { air: true, cepat: false, tanah: true }, region: 'kalianda', error: false };

// ---------- utils ----------
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmt(v) { return Math.round(Number(v) * 10) / 10; }
function latest() { return state.logs.length ? state.logs[0] : null; }
function ageSeconds(r) { var t = r.ts || r.id; return t ? Math.max(0, Math.round((Date.now() - t) / 1000)) : null; }
function ageText(s) {
  if (s == null) return '-';
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  return Math.floor(s / 3600) + ' h ago';
}

function moistStatus(h) {
  if (h == null) return { label: 'Waiting for data', badge: 'bg-slate-100 text-slate-600 border-slate-200', bar: 'bg-slate-300', pin: 'bg-slate-500', ring: 'bg-slate-400/20', text: 'text-slate-500', skor: '-', note: 'No data from the ESP32 yet.' };
  if (h > 95)  return { label: 'Saturated', badge: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'bg-blue-500', pin: 'bg-blue-600', ring: 'bg-blue-500/20', text: 'text-blue-700', skor: 3, note: 'Waterlogging risk; make sure drainage is clear.' };
  if (h >= 75) return { label: 'Optimal', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', pin: 'bg-emerald-600', ring: 'bg-emerald-500/20', text: 'text-emerald-700', skor: 5, note: 'Enough for leafy greens without intensive irrigation.' };
  if (h >= 60) return { label: 'Adequate', badge: 'bg-lime-50 text-lime-700 border-lime-200', bar: 'bg-lime-500', pin: 'bg-lime-600', ring: 'bg-lime-500/20', text: 'text-lime-700', skor: 4, note: 'Still suitable for planting; monitor irrigation needs.' };
  if (h >= 40) return { label: 'Slightly Dry', badge: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-400', pin: 'bg-amber-500', ring: 'bg-amber-400/20', text: 'text-amber-700', skor: 3, note: 'Consider drought-tolerant crops or extra irrigation.' };
  return { label: 'Critically Dry', badge: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500', pin: 'bg-red-600', ring: 'bg-red-500/20', text: 'text-red-700', skor: 1, note: 'Irrigate before planting.' };
}

function tempStatus(t) {
  if (t == null) return { label: 'Waiting for data', cls: 'text-slate-500', icon: 'fa-circle-question' };
  if (t > 35) return { label: 'Extreme Heat', cls: 'text-red-600', icon: 'fa-fire' };
  if (t > 32) return { label: 'Hot', cls: 'text-amber-600', icon: 'fa-sun' };
  if (t < 18) return { label: 'Cold', cls: 'text-blue-600', icon: 'fa-snowflake' };
  return { label: 'Normal (ideal tropical)', cls: 'text-emerald-600', icon: 'fa-circle-check' };
}

// ---------- rotation rule engine ----------
function scoreCrop(c, prev, ctx) {
  var s = 0, alasan = [];
  if (c.famili === prev.famili) { s -= 10; }
  else { s += 3; alasan.push('Different family from ' + prev.nama + ' (' + prev.famili + ' &rarr; ' + c.famili + '), breaking soil pest and pathogen cycles.'); }
  if (c.akar !== prev.akar) { s += ctx.pr.tanah ? 3 : 1; alasan.push('Alternating root depth (' + prev.akar + ' &rarr; ' + c.akar + ') lets a different soil layer recover.'); }
  if (ctx.pr.tanah && c.legum && prev.beratHara) { s += 3; alasan.push('Legume fixes nitrogen after a heavy-feeding crop.'); }
  if (ctx.pr.tanah && c.beratHara && prev.beratHara) s -= 2;
  if (ctx.pr.cepat) {
    if (c.hari[1] <= 45) { s += 3; alasan.push('Fast harvest (' + c.hari[0] + '-' + c.hari[1] + ' days) for quick capital turnover.'); }
    else s -= 1;
  }
  if (ctx.h != null) {
    if (ctx.h < 60) {
      if (c.tahanKering) { s += ctx.pr.air ? 3 : 1; alasan.push('Drought tolerant, suited to the current sensor humidity of ' + fmt(ctx.h) + '%.'); }
      if (c.air === 'high') s -= ctx.pr.air ? 3 : 1;
    } else if (ctx.h <= 95) {
      if (c.air !== 'low') { s += 1; alasan.push('Sensor humidity of ' + fmt(ctx.h) + '% is enough without intensive irrigation.'); }
    } else if (c.air === 'high') {
      s += 1;
    }
  } else if (ctx.pr.air && c.tahanKering) {
    s += 1;
  }
  if (ctx.t != null && ctx.t > 32) {
    if (c.tahanPanas) { s += 1; alasan.push('Tolerates high temperature (' + fmt(ctx.t) + ' &deg;C).'); }
    else s -= 2;
  }
  return { s: s, alasan: alasan };
}

function buildPlan() {
  var prev = CROPS[state.crop];
  var used = {}; used[state.crop] = true;
  var last = latest();
  var plan = [];
  for (var i = 0; i < 3; i++) {
    var ctx = { pr: state.pr, h: (i === 0 && last) ? last.kelembapan : null, t: (i === 0 && last) ? last.suhu : null };
    var best = null;
    Object.keys(CROPS).forEach(function (k) {
      if (used[k]) return;
      var r = scoreCrop(CROPS[k], prev, ctx);
      if (!best || r.s > best.s) best = { key: k, s: r.s, alasan: r.alasan };
    });
    used[best.key] = true;
    plan.push(best);
    prev = CROPS[best.key];
  }
  return plan;
}

// ---------- render ----------
function renderLive() {
  var last = latest();
  var age = last ? ageSeconds(last) : null;
  var online = last && age != null && age <= ONLINE_WINDOW_S;

  $('live-ping').className = 'absolute inline-flex h-full w-full rounded-full opacity-75 ' + (online ? 'bg-emerald-400 animate-ping' : (state.error ? 'bg-red-400' : 'bg-slate-300'));
  $('live-dot').className = 'relative inline-flex rounded-full h-2.5 w-2.5 ' + (online ? 'bg-emerald-500' : (state.error ? 'bg-red-500' : 'bg-slate-400'));
  $('live-label').textContent = state.error ? 'Server unreachable' : (online ? 'ESP32 Live' : (last ? 'ESP32 Offline' : 'Waiting for ESP32'));
  $('live-device').textContent = last ? last.device_id + ' • ' + ageText(age) : '';

  var h = last ? last.kelembapan : null;
  var t = last ? last.suhu : null;
  var ms = moistStatus(h);
  $('hum-val').textContent = h == null ? '--%' : fmt(h) + '%';
  $('hum-badge').className = 'text-xs font-bold px-2 py-0.5 rounded-full border ' + ms.badge;
  $('hum-badge').textContent = h == null ? ms.label : ms.label + ' (Score ' + ms.skor + ')';
  $('hum-bar').className = 'h-full rounded-full transition-all duration-500 ' + ms.bar;
  $('hum-bar').style.width = (h == null ? 0 : Math.max(0, Math.min(100, h))) + '%';
  $('hum-note').textContent = ms.note;

  var ts = tempStatus(t);
  $('temp-val').textContent = t == null ? '-- °C' : fmt(t) + ' °C';
  $('temp-status').className = 'flex items-center gap-1.5 text-xs font-bold ' + ts.cls;
  $('temp-status').innerHTML = '<i class="fa-solid ' + ts.icon + '"></i><span>' + ts.label + '</span>';
  if (state.logs.length) {
    var temps = state.logs.map(function (r) { return r.suhu; });
    $('temp-range').textContent = 'Range of last ' + state.logs.length + ' readings: ' + fmt(Math.min.apply(null, temps)) + ' - ' + fmt(Math.max.apply(null, temps)) + ' °C';
  } else {
    $('temp-range').textContent = 'Range of last 30 readings: -';
  }

  $('last-feed').textContent = last ? last.waktu + ' WIB (' + ageText(age) + ')' : '-';

  // Map
  $('map-device').textContent = last ? last.device_id : '-';
  $('map-hum').textContent = h == null ? '-' : fmt(h) + '% (' + ms.label + ')';
  $('map-temp').textContent = t == null ? '-' : fmt(t) + ' °C';
  $('map-pin').className = 'w-12 h-12 rounded-2xl text-white shadow-xl flex items-center justify-center text-xl ' + ms.pin;
  $('map-ring').className = 'absolute w-32 h-32 rounded-full radar-ping ' + ms.ring;

  renderTrend();
  renderLog();
  renderAlerts(h, t, online, last);
}

function renderTrend() {
  var box = $('trend-chart');
  var n = window.innerWidth < 640 ? 6 : 12;
  var data = state.logs.slice(0, n).reverse();
  if (!data.length) {
    box.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-xs text-slate-400"><i class="fa-solid fa-satellite-dish mr-2"></i>Waiting for sensor data...</div>';
    $('trend-note').textContent = 'Waiting for sensor data.';
    $('trend-status').textContent = '-';
    $('trend-status').className = 'font-bold text-slate-500';
    return;
  }
  var BAR_MAX = 110;
  var html = '<div class="absolute left-4 right-4 border-b border-dashed border-emerald-400 z-0 flex justify-end" style="bottom:' + (32 + 0.75 * BAR_MAX) + 'px"><span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded -translate-y-2">Optimal Threshold (75%)</span></div>';
  data.forEach(function (r, i) {
    var isLast = i === data.length - 1;
    var hgt = Math.max(4, Math.min(100, r.kelembapan)) / 100 * BAR_MAX;
    var st = moistStatus(r.kelembapan);
    html += '<div class="flex flex-col items-center justify-end gap-1 flex-1 h-full z-10 min-w-0">' +
      '<span class="text-[10px] font-bold ' + (isLast ? 'text-emerald-800 bg-emerald-100 px-1 rounded' : 'text-slate-500') + '">' + fmt(r.kelembapan) + '%</span>' +
      '<div class="w-full max-w-[40px] rounded-t-lg transition-all ' + st.bar + (isLast ? ' shadow-md' : '') + '" style="height:' + hgt + 'px" title="' + esc(r.waktu) + ' • ' + fmt(r.suhu) + ' °C"></div>' +
      '<span class="text-[9px] font-semibold ' + (isLast ? 'text-emerald-800' : 'text-slate-400') + ' truncate max-w-full">' + esc(String(r.waktu).slice(0, 5)) + '</span></div>';
  });
  box.innerHTML = html;

  var avg = data.reduce(function (a, r) { return a + r.kelembapan; }, 0) / data.length;
  var diff = data.length > 1 ? data[data.length - 1].kelembapan - data[0].kelembapan : 0;
  var arah = Math.abs(diff) < 1 ? 'stable' : (diff > 0 ? 'up ' + fmt(diff) + ' pts' : 'down ' + fmt(Math.abs(diff)) + ' pts');
  var ms = moistStatus(avg);
  $('trend-note').textContent = 'Average of ' + data.length + ' readings: ' + fmt(avg) + '%, trend ' + arah + '.';
  $('trend-status').textContent = 'Status: ' + ms.label;
  $('trend-status').className = 'font-bold ' + ms.text;
}

function renderLog() {
  var rows = state.logs.slice(0, 10);
  $('log-count').textContent = state.logs.length + (state.logs.length === 1 ? ' reading' : ' readings');
  if (!rows.length) { $('log-body').innerHTML = '<tr><td colspan="5" class="py-6 text-center text-slate-400">No data received yet.</td></tr>'; return; }
  $('log-body').innerHTML = rows.map(function (r, i) {
    var st = moistStatus(r.kelembapan);
    return '<tr class="border-b border-slate-50 ' + (i === 0 ? 'bg-emerald-50/40' : '') + '">' +
      '<td class="py-2 pr-4 font-mono text-slate-600">' + esc(r.waktu) + '</td>' +
      '<td class="py-2 pr-4 font-semibold text-slate-700">' + esc(r.device_id) + '</td>' +
      '<td class="py-2 pr-4">' + fmt(r.suhu) + ' °C</td>' +
      '<td class="py-2 pr-4">' + fmt(r.kelembapan) + '%</td>' +
      '<td class="py-2"><span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ' + st.badge + '">' + st.label + '</span></td></tr>';
  }).join('');
}

function alertBox(kind, icon, title, body) {
  var c = { ok: ['bg-emerald-50', 'border-emerald-200/80', 'text-emerald-600', 'text-emerald-900', 'text-emerald-700'],
            info: ['bg-blue-50', 'border-blue-200/80', 'text-blue-600', 'text-blue-900', 'text-blue-700'],
            warn: ['bg-amber-50', 'border-amber-200/80', 'text-amber-600', 'text-amber-900', 'text-amber-700'],
            bad: ['bg-red-50', 'border-red-200/80', 'text-red-600', 'text-red-900', 'text-red-700'] }[kind];
  return '<div class="flex items-start gap-3 p-3 rounded-xl border ' + c[0] + ' ' + c[1] + '"><i class="fa-solid ' + icon + ' ' + c[2] + ' text-base mt-0.5"></i><div><div class="text-xs font-bold ' + c[3] + '">' + title + '</div><div class="text-[11px] mt-0.5 ' + c[4] + '">' + body + '</div></div></div>';
}

function renderAlerts(h, t, online, last) {
  var out = [];
  if (state.error) out.push(alertBox('bad', 'fa-plug-circle-xmark', 'Server unreachable', 'The dashboard could not fetch data from the API. Retrying automatically.'));
  else if (!last) out.push(alertBox('info', 'fa-satellite-dish', 'Waiting for ESP32', 'No readings have reached /api/sensor yet.'));
  else if (!online) out.push(alertBox('warn', 'fa-wifi', 'Sensor not sending data', 'Last reading was ' + ageText(ageSeconds(last)) + '. Check the ESP32 power or WiFi connection.'));

  if (t != null) {
    if (t > 35) out.push(alertBox('bad', 'fa-fire', 'Heat wave', 'Temperature ' + fmt(t) + ' &deg;C. Delay seedling transplanting and add shade.'));
    else if (t > 32) out.push(alertBox('warn', 'fa-sun', 'High temperature', 'Temperature ' + fmt(t) + ' &deg;C. Leafy greens may wilt; favor heat-tolerant crops.'));
    else out.push(alertBox('ok', 'fa-shield-halved', 'Stable temperature', 'Temperature ' + fmt(t) + ' &deg;C is within the safe range for tropical crops.'));
  }
  if (h != null) {
    if (h < 40) out.push(alertBox('bad', 'fa-droplet-slash', 'Critically dry', 'Humidity ' + fmt(h) + '%. Irrigation is needed before planting.'));
    else if (h < 60) out.push(alertBox('warn', 'fa-droplet', 'Low humidity', 'Humidity ' + fmt(h) + '%. Recommendations shift toward drought-tolerant crops.'));
    else if (h > 95) out.push(alertBox('info', 'fa-water', 'Saturated conditions', 'Humidity ' + fmt(h) + '%. Watch for root rot and standing water.'));
    else out.push(alertBox('ok', 'fa-cloud-rain', 'Water supply adequate', 'Humidity ' + fmt(h) + '% supports healthy crop growth.'));
  }
  $('alerts').innerHTML = out.join('');
}

function renderParams() {
  $('crop-grid').innerHTML = Object.keys(CROPS).filter(function (k) { return !CROPS[k].hanyaKandidat; }).map(function (k) {
    var c = CROPS[k], on = k === state.crop;
    return '<div onclick="selectCrop(\'' + k + '\')" class="cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center transition ' + (on ? 'border-2 border-emerald-500 bg-emerald-50/70 shadow-sm' : 'border border-slate-200 bg-white hover:border-slate-300') + '">' +
      '<div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2.5 ' + (on ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500') + '"><i class="fa-solid ' + c.icon + '"></i></div>' +
      '<div class="font-extrabold text-xs ' + (on ? 'text-emerald-950' : 'text-slate-800') + '">' + c.nama + '</div>' +
      '<div class="text-[10px] font-medium mt-0.5 ' + (on ? 'text-emerald-700' : 'text-slate-400') + '">' + c.ket + '</div>' +
      '<span class="mt-2 text-[9px] ' + (on ? 'font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full' : 'font-semibold text-slate-400') + '">' + (on ? 'Selected' : 'Select') + '</span></div>';
  }).join('');

  $('prio-grid').innerHTML = PRIORITIES.map(function (p) {
    var on = state.pr[p.key];
    return '<div onclick="togglePriority(\'' + p.key + '\')" class="cursor-pointer rounded-2xl p-5 flex items-start gap-4 transition ' + (on ? 'border-2 border-blue-500 bg-blue-50/60 shadow-sm' : 'border border-slate-200 bg-white hover:border-slate-300') + '">' +
      '<div class="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ' + (on ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500') + '"><i class="fa-solid ' + p.icon + '"></i></div>' +
      '<div class="flex-grow"><div class="flex items-center justify-between gap-2"><h4 class="font-extrabold text-sm ' + (on ? 'text-blue-950' : 'text-slate-800') + '">' + p.title + '</h4>' +
      '<i class="' + (on ? 'fa-solid fa-circle-check text-blue-600' : 'fa-regular fa-circle text-slate-300') + ' text-lg"></i></div>' +
      '<p class="text-xs mt-1 ' + (on ? 'text-blue-800/80' : 'text-slate-500') + '">' + p.desc + '</p></div></div>';
  }).join('');
}

function renderRecommendation() {
  var cur = CROPS[state.crop];
  var plan = buildPlan();
  var first = CROPS[plan[0].key];
  var last = latest();
  var reg = REGIONS[state.region];
  var prioNames = PRIORITIES.filter(function (p) { return state.pr[p.key]; }).map(function (p) { return p.title; });

  // Overview cards
  $('rec-main').textContent = first.nama;
  $('rec-main-note').innerHTML = 'Rotates after <strong>' + cur.nama + '</strong> (' + cur.akar + ' roots, ' + cur.famili + ').';
  $('active-icon').className = 'fa-solid ' + cur.icon;
  $('active-name').textContent = cur.nama + ' (' + cur.latin + ')';
  $('active-ket').textContent = cur.ket;
  $('active-prio').textContent = prioNames.length ? prioNames.join(', ') : 'None';
  $('active-fam').textContent = cur.famili;
  $('active-next').textContent = first.nama + ' (' + first.akar + ' roots)';

  $('rec-summary').innerHTML = 'Based on ' + (last ? 'sensor humidity of <strong>' + fmt(last.kelembapan) + '%</strong> and temperature of <strong>' + fmt(last.suhu) + ' &deg;C</strong>' : '<strong>no sensor data yet</strong> (crop history only)') +
    ' in <strong>' + reg.short + '</strong>, last crop <strong>' + cur.nama + '</strong>' + (prioNames.length ? ', priorities <strong>' + prioNames.join(', ') + '</strong>.' : '.');

  $('rec-metrics').innerHTML = [
    ['bg-blue-100 text-blue-600', 'fa-water', 'Stage 1 Water Need', AIR_LABEL[first.air]],
    ['bg-emerald-100 text-emerald-600', 'fa-bug-slash', 'Family Rotation', first.famili !== cur.famili ? 'Different family ✓' : 'Same family ✗'],
    ['bg-amber-100 text-amber-600', 'fa-layer-group', 'Root Depth Change', cur.akar + ' → ' + first.akar]
  ].map(function (m) {
    return '<div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ' + m[0] + '"><i class="fa-solid ' + m[1] + '"></i></div><div><div class="text-xs text-slate-400 font-semibold">' + m[2] + '</div><div class="text-lg font-black text-slate-900 capitalize">' + m[3] + '</div></div></div>';
  }).join('');

  var styles = [
    { line: 'border-l-2 border-emerald-500 pb-6', dot: 'bg-emerald-500 ring-emerald-100', tag: 'text-emerald-800 bg-emerald-100', badge: 'text-emerald-600 bg-emerald-50 border-emerald-200', badgeText: 'Plant Next' },
    { line: 'border-l-2 border-dashed border-amber-400 pb-6', dot: 'bg-amber-400 ring-amber-100', tag: 'text-amber-800 bg-amber-100', badge: 'text-amber-700 bg-amber-50 border-amber-200', badgeText: 'Follow-up' },
    { line: '', dot: 'bg-slate-300 ring-slate-100', tag: 'text-slate-600 bg-slate-200', badge: 'text-slate-500 bg-slate-100 border-slate-200', badgeText: 'Cycle Restoration' }
  ];
  var startDay = 0;
  $('rec-timeline').innerHTML = plan.map(function (p, i) {
    var c = CROPS[p.key], st = styles[i];
    var when = i === 0 ? 'Start Now' : 'Start ~Day ' + startDay;
    startDay += c.hari[1];
    var alasan = p.alasan.length ? p.alasan : ['Best remaining option to keep the rotation diverse.'];
    return '<div class="relative pl-8 sm:pl-10 ' + st.line + '">' +
      '<div class="absolute -left-[11px] top-0 w-5 h-5 rounded-full ring-4 shadow ' + st.dot + '"></div>' +
      '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2"><div class="flex flex-wrap items-center gap-2">' +
      '<span class="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ' + st.tag + '">Stage ' + (i + 1) + ' • ' + when + '</span>' +
      '<span class="text-xs font-bold px-2 py-0.5 rounded-full border ' + st.badge + '">' + st.badgeText + '</span></div>' +
      '<span class="text-xs font-semibold text-slate-400">Duration: ' + c.hari[0] + ' - ' + c.hari[1] + ' Days</span></div>' +
      '<div class="bg-slate-50 border border-slate-200/90 rounded-2xl p-5">' +
      '<div class="flex items-center gap-3 mb-2"><h3 class="text-base font-extrabold text-slate-900">Plant ' + c.nama + ' (<i>' + c.latin + '</i>)</h3><span class="text-emerald-600"><i class="fa-solid ' + c.icon + '"></i></span></div>' +
      '<ul class="text-xs sm:text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-1">' + alasan.map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul>' +
      '<div class="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200">' +
      '<span class="text-xs font-semibold text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-lg"><i class="fa-solid fa-droplet mr-1"></i>Water: ' + AIR_LABEL[c.air] + '</span>' +
      '<span class="text-xs font-semibold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-lg"><i class="fa-solid fa-seedling mr-1"></i>Roots: ' + c.akarCm + '</span>' +
      '<span class="text-xs font-semibold text-slate-700 bg-slate-200/80 px-2.5 py-1 rounded-lg">' + c.famili + '</span>' +
      (c.tahanKering ? '<span class="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg"><i class="fa-solid fa-sun mr-1"></i>Drought Tolerant</span>' : '') +
      (c.legum ? '<span class="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">Fixes Nitrogen</span>' : '') +
      '</div></div></div>';
  }).join('');
}

function renderLocation() {
  var r = REGIONS[state.region];
  $('map-label').textContent = 'Active Field: ' + r.short;
  $('map-coord').textContent = 'Lat: ' + r.lat.toFixed(3) + ' | Lon: ' + r.lon.toFixed(3);
}

function renderAll() { renderLive(); renderParams(); renderRecommendation(); renderLocation(); }

// ---------- interaction ----------
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
  var target = $('tab-' + tabId); if (target) target.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(function (b) { b.classList.remove('border-emerald-600', 'text-emerald-700'); b.classList.add('border-transparent', 'text-slate-500'); });
  var btn = $('tab-btn-' + tabId); if (btn) { btn.classList.remove('border-transparent', 'text-slate-500'); btn.classList.add('border-emerald-600', 'text-emerald-700'); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function updateLocation(v) { state.region = v; savePrefs(); renderLocation(); renderRecommendation(); }
function selectCrop(k) { state.crop = k; savePrefs(); renderParams(); renderRecommendation(); }
function togglePriority(k) { state.pr[k] = !state.pr[k]; savePrefs(); renderParams(); renderRecommendation(); }

function savePrefs() { try { localStorage.setItem('terratech', JSON.stringify({ crop: state.crop, pr: state.pr, region: state.region })); } catch (e) {} }
function loadPrefs() {
  try {
    var p = JSON.parse(localStorage.getItem('terratech') || 'null');
    if (p) {
      if (CROPS[p.crop]) state.crop = p.crop;
      if (p.pr) state.pr = p.pr;
      if (REGIONS[p.region]) state.region = p.region;
    }
  } catch (e) {}
  $('region-select').value = state.region;
}

// ---------- data ----------
function loadLogs() {
  return fetch(API, { cache: 'no-store' })
    .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(function (data) {
      state.error = false;
      var prevTop = state.logs.length ? state.logs[0].id : null;
      state.logs = Array.isArray(data) ? data : [];
      var newTop = state.logs.length ? state.logs[0].id : null;
      renderLive();
      if (prevTop !== newTop) renderRecommendation();
    })
    .catch(function () { state.error = true; renderLive(); });
}

function manualSync() {
  var icon = $('sync-icon');
  icon.classList.add('fa-spin');
  loadLogs().then(function () { setTimeout(function () { icon.classList.remove('fa-spin'); }, 400); });
}

loadPrefs();
renderAll();
loadLogs();
setInterval(loadLogs, POLL_MS);
setInterval(renderLive, 10000); // refresh "x ago" labels even without new data
window.addEventListener('resize', renderTrend);
</script>
</body>
</html>`;
