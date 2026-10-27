Field Shift: TerraTech

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-ESP32%20%7C%20Node.js%20%7C%20PHP-green)

**TerraTech** is a smart agricultural Decision Support System (DSS) that combines real-time IoT field telemetry from **ESP32** sensors with satellite data parameters (inspired by NASA MERRA-2 climate data) to optimize crop rotation, prevent soil degradation, and improve water efficiency.

---

## 🌟 Key Features

- **Live IoT Telemetry Dashboard:** Displays real-time temperature, soil moisture, and humidity data sent directly from ESP32 microcontrollers.
- **Smart Crop Rotation Algorithm:** Recommends optimal multi-stage crop succession based on soil moisture trends and previous crop history.
- **Interactive Spatial & Satellite Map View:** GIS spatial visualization for tracking field coordinates and agro-climatic boundaries.
- **Climate Risk & Drought Monitoring:** Tracks Consecutive Dry Days (CDD) and Consecutive Wet Days (CWD) to mitigate climate risk.
- **Dual-Backend Support:** Lightweight architecture ready for deployment using either **Node.js (Express)** or single-file **PHP**.

---

## 🏗 System Architecture

```
┌───────────────┐     HTTP POST (JSON)     ┌────────────────────────────────┐
│   ESP32 IoT   │ ───────────────────────► │    Backend Server (API)        │
│   Sensors     │  (WiFi / HTTPS Client)   │   (Node.js Express / PHP)      │
└───────────────┘                          └───────────────┬────────────────┘
                                                           │
                                                           │ Serving Data / JSON
                                                           ▼
                                           ┌────────────────────────────────┐
                                           │ Dynamic Web Dashboard (UI/UX)  │
                                           │ Tailwind CSS + JS Fetch API    │
                                           └────────────────────────────────┘
```

---

## 🚀 Getting Started

### 1. Backend Setup

#### Option A: Node.js (Express)
1. Navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install express cors
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

#### Option B: PHP (Shared Hosting / cPanel)
Upload `index.php` directly to your `public_html` or hosting root folder. Data will automatically persist to `sensor_log.json`.

---

### 2. ESP32 Firmware Configuration

1. Open the `.ino` sketch in **Arduino IDE**.
2. Update your WiFi credentials and backend endpoint:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* serverUrl = "https://your-domain.onrender.com/api/sensor";
   ```
3. Flash the sketch to your ESP32 board.

---

## 📡 API Endpoints

### `POST /api/sensor`
Receives sensor telemetry from the ESP32.

**Request Payload:**
```json
{
  "device_id": "ESP32-LAB-01",
  "suhu": 28.5,
  "kelembapan": 82.0
}
```

**Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "id": 1711234567890,
    "device_id": "ESP32-LAB-01",
    "suhu": 28.5,
    "kelembapan": 82.0,
    "waktu": "14:30:00"
  }
}
```

### `GET /api/sensor`
Fetches the latest recorded sensor log history in JSON format.

---

## 🛠 Tech Stack

- **Frontend:** HTML5, Tailwind CSS, JavaScript (ES6+), FontAwesome
- **Backend:** Node.js (Express.js) / PHP 8.x
- **Hardware / IoT:** ESP32 Microcontroller, HTTPClient, Arduino C++
- **Deployment Platform Options:** Render.com, Vercel, Cloudflare Workers, Shared Hosting (cPanel)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
