const express = require('express');
const fetch = require('node-fetch');
const app = express();

const CCTV_URL = 'https://data.taipei/api/v1/dataset/f0b8282e-6a8b-4961-bf6d-65eabfbf8b2c?scope=resourceAquire';

app.get('/api/nearby-cameras', async (req, res) => {
  const { lat, lng, radius = 500 } = req.query;
  try {
    const response = await fetch(CCTV_URL);
    if (!response.ok) throw new Error(`CCTV API status ${response.status}`);
    const json = await response.json();
    const records = json.result?.results || [];
    if (!records.length) {
      console.log('⚠️ CCTV API 回傳空陣列');
      return res.json([]);
    }

    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;
    const distance = (a, b) => {
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const lat1 = toRad(a.lat);
      const lat2 = toRad(b.lat);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };

    // 轉換欄位名並計算距離
    const parsed = records.map(r => ({
      id: r._id || r.id,
      name: r.stationName || r.name || '未命名監視器',
      lat: parseFloat(r.lat || r.latitude),
      lng: parseFloat(r.lng || r.longitude),
      snapshot_url: r.url || r.imageUrl || '',
    })).filter(c => !isNaN(c.lat) && !isNaN(c.lng));

    // 根據距離排序
    const sorted = parsed
      .map(c => ({ ...c, dist: distance({ lat: +lat, lng: +lng }, c) }))
      .sort((a, b) => a.dist - b.dist);

    const nearby = sorted.filter(c => c.dist <= radius).slice(0, 10);
    console.log(`✅ 找到 ${nearby.length} 支監視器`);
    res.json(nearby);
  } catch (err) {
    console.error('❌ CCTV 抓取錯誤:', err);
    res.status(500).send('Error fetching CCTV data');
  }
});

app.get('/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('missing url');
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch failed ${r.status}`);
    const buffer = await r.arrayBuffer();
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('❌ Proxy image error:', err);
    res.status(500).send('proxy failed');
  }
});


app.get('/', (req, res) => res.send('RoadCCTV API ready'));
app.listen(3000, () => console.log('✅ RoadCCTV Proxy running'));
