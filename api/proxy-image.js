const fetch = require('node-fetch');

module.exports = async (req, res) => {
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
};
