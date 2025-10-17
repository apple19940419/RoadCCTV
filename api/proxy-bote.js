const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const url = 'https://hls.bote.gov.taipei/stream/008/index.m3u8';
  try {
    const r = await fetch(url, {
      headers: {
        'Referer': 'https://tw.live/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    const text = await r.text();
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(text);
  } catch (err) {
    console.error('Proxy fetch failed:', err);
    res.status(500).send('Proxy fetch failed');
  }
};