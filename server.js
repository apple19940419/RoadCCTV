const express = require('express');
const fetch = require('node-fetch');
const app = express();

// 台北市水利處 CCTV 即時影像 API
const CCTV_URL = 'https://data.taipei/api/v1/dataset/f0b8282e-6a8b-4961-bf6d-65eabfbf8b2c?scope=resourceAquire';

app.get('/api/nearby-cameras', async (req, res) => {
  const { lat, lng, radius = 500 } = req.query;
  try {
    const response = await fetch(CCTV_URL);
    const json = await response.json();
    const records = json.result?.results || [];
    const R = 6371000; // 地球半徑
    function distance(a, b) {
      const toRad = deg => deg * Math.PI / 180;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
      return 2 * R * Math.asin(Math.sqrt(h));
    }
    const cams = records
      .map(r => ({
        id: r._id,
        name: r.stationName,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lng),
        snapshot_url: r.url,
      }))
      .filter(c => distance({ lat: +lat, lng: +lng }, c) <= radius);
    res.json(cams);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching CCTV data');
  }
});

app.listen(3000, () => console.log('✅ RoadCCTV Proxy running on http://localhost:3000'));
