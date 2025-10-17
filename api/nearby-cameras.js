const cameras = [
  {
    id: "taipei_101_skyline",
    name: "台北101全景 (SkylineWebcams)",
    lat: 25.033964,
    lng: 121.564468,
    snapshot_url: "https://www.skylinewebcams.com/en/webcam/taiwan/new-taipei-city/taipei-city/taipei-taiwan.html"
  },
  {
    id: "dadaocheng_riverside",
    name: "大稻埕河濱公園 (WebCamtaxi)",
    lat: 25.057366,
    lng: 121.509052,
    snapshot_url: "https://www.webcamtaxi.com/en/taiwan/taipei/dadaocheng-riverside.html"
  },
  {
    id: "taipei_main_station",
    name: "台北車站周邊 (YouTube Live)",
    lat: 25.047924,
    lng: 121.517081,
    snapshot_url: "https://www.youtube.com/embed/qYF8hG0LqfM"
  }
];

module.exports = async (req, res) => {
  const { lat, lng, radius = 10000 } = req.query;
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const distance = (a, b) => {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const nearby = cameras
    .map(c => ({ ...c, dist: distance({lat:+lat, lng:+lng}, c) }))
    .sort((a,b) => a.dist - b.dist);
    //.filter(c => c.dist <= radius);

  res.status(200).json(nearby);
};