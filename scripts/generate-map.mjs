import fs from 'fs';

async function run() {
  console.log('Fetching Natural Earth 110m land polygons...');
  const res = await fetch('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/physical/ne_110m_land.json');
  const geojson = await res.json();

  const paths = [];
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    const rings = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    for (const polygon of rings) {
      for (const ring of polygon) {
        if (!ring || ring.length === 0) continue;
        const d = ring.map((pt, i) => {
          const x = (pt[0] + 180).toFixed(2);
          const y = (90 - pt[1]).toFixed(2);
          return (i === 0 ? 'M' : 'L') + x + ' ' + y;
        }).join(' ') + ' Z';
        paths.push(d);
      }
    }
  }

  // Lat/Lon Graticule lines
  const graticules = [];
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = (90 - lat).toFixed(2);
    graticules.push(`<line x1="0" y1="${y}" x2="360" y2="${y}" stroke="#1f1f1f" stroke-width="0.5" stroke-dasharray="1 1" />`);
  }
  // Equator
  graticules.push('<line x1="0" y1="90" x2="360" y2="90" stroke="#404040" stroke-width="0.8" />');

  for (let lon = -180; lon <= 180; lon += 30) {
    const x = (lon + 180).toFixed(2);
    graticules.push(`<line x1="${x}" y1="0" x2="${x}" y2="180" stroke="#1f1f1f" stroke-width="0.5" stroke-dasharray="1 1" />`);
  }
  // Prime meridian
  graticules.push('<line x1="180" y1="0" x2="180" y2="180" stroke="#404040" stroke-width="0.8" />');

  // Continents in crisp white and subtle topographic shading
  const pathElements = paths.map(d => `<path d="${d}" fill="#d4d4d4" stroke="#ffffff" stroke-width="0.4" stroke-linejoin="round" />`).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 180" width="2048" height="1024" preserveAspectRatio="none">
  <rect width="360" height="180" fill="#050505" />
  <g id="graticule">
    ${graticules.join('\n    ')}
  </g>
  <g id="continents">
    ${pathElements}
  </g>
</svg>`;

  fs.writeFileSync('public/earth-monochrome.svg', svg);
  console.log('Saved public/earth-monochrome.svg! File size:', fs.statSync('public/earth-monochrome.svg').size);
}

run().catch(console.error);
