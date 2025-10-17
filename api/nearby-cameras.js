const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { lat, lng, radius = 500 } = req.query;
  const CCTV_URL = 'https://traffic.taipei/api/v1/cctv';

  try {
    const response = await fetch(CCTV_URL, { redirect: "follow" });
    if (!response.ok) throw new Error(`CCTV API status ${response.status}`);
    const json = await response.json();
    const records = json.result?.results || [];
    if (!records.length) throw new Error("No CCTV records found");

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

    const parsed = records.map(r => ({
      id: r.id,
      name: r.name || '未命名監視器',
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
      snapshot_url: r.image || '',
    })).filter(c => !isNaN(c.lat) && !isNaN(c.lng) && c.snapshot_url);

    const sorted = parsed
      .map(c => ({ ...c, dist: distance({ lat: +lat, lng: +lng }, c) }))
      .sort((a, b) => a.dist - b.dist);

    const nearby = sorted.filter(c => c.dist <= radius).slice(0, 10);
    res.status(200).json(nearby);
  } catch (err) {
    console.error('❌ CCTV 抓取錯誤:', err);
    res.status(500).send('Error fetching CCTV data');
  }
};
