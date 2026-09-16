import { SatelliteTile, ModelPresetInfo, BenchmarkRecord } from './types';

// Procedural SVG Generator for authentic satellite imagery textures
function generateUrbanSVG(isHighRes: boolean): string {
  const pixelation = isHighRes ? '' : 'filter="url(#pixelate-blur)"';
  const blurFilter = `
    <defs>
      <filter id="pixelate-blur">
        <feGaussianBlur stdDeviation="3.8" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
          <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
          <feFuncB type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
        </feComponentTransfer>
      </filter>
      <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f2b3c" />
        <stop offset="50%" stop-color="#164e63" />
        <stop offset="100%" stop-color="#083344" />
      </linearGradient>
      <pattern id="urbanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1.2" />
      </pattern>
    </defs>
  `;

  const details = isHighRes ? `
    <!-- High-frequency building footprints & roads (AI Reconstructed) -->
    <!-- Major Arterial Highways & Interchanges -->
    <path d="M 0 160 Q 240 140 480 200 T 800 240" fill="none" stroke="#64748b" stroke-width="14" />
    <path d="M 0 160 Q 240 140 480 200 T 800 240" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="8,6" />
    <path d="M 280 0 L 320 800" fill="none" stroke="#475569" stroke-width="12" />
    <path d="M 280 0 L 320 800" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="10,6" />

    <!-- Urban Commercial Complex & Tech Parks -->
    <g fill="#475569" stroke="#94a3b8" stroke-width="1.5">
      <rect x="80" y="50" width="70" height="60" rx="3" />
      <rect x="90" y="60" width="20" height="15" fill="#38bdf8" fill-opacity="0.3" />
      <rect x="170" y="45" width="55" height="75" rx="3" />
      <rect x="95" y="130" width="110" height="45" rx="4" />
      
      <polygon points="350,50 420,70 410,130 340,110" />
      <rect x="440" y="80" width="90" height="70" rx="2" />
      <rect x="550" y="70" width="120" height="60" rx="3" />
      
      <rect x="360" y="240" width="85" height="50" rx="2" />
      <rect x="460" y="250" width="70" height="75" rx="2" />
      <rect x="550" y="230" width="90" height="90" rx="4" />
      <circle cx="690" cy="275" r="30" fill="#334155" />
    </g>

    <!-- Dense Residential Subdivisions -->
    <g fill="#334155" stroke="#64748b" stroke-width="1">
      <rect x="60" y="320" width="30" height="24" />
      <rect x="100" y="320" width="30" height="24" />
      <rect x="140" y="320" width="30" height="24" />
      <rect x="180" y="320" width="30" height="24" />
      <rect x="60" y="360" width="30" height="24" />
      <rect x="100" y="360" width="30" height="24" />
      <rect x="140" y="360" width="30" height="24" />
      <rect x="180" y="360" width="30" height="24" />
      <rect x="60" y="400" width="30" height="24" />
      <rect x="100" y="400" width="30" height="24" />
      <rect x="140" y="400" width="30" height="24" />
      <rect x="180" y="400" width="30" height="24" />
    </g>

    <!-- Solar Panels on Industrial Roofs -->
    <g fill="#0284c7" stroke="#38bdf8" stroke-width="0.8">
      <rect x="445" y="85" width="22" height="15" />
      <rect x="472" y="85" width="22" height="15" />
      <rect x="500" y="85" width="22" height="15" />
    </g>

    <!-- Parks & Urban Vegetation (Clear tree canopies) -->
    <g fill="#15803d" stroke="#166534" stroke-width="1">
      <circle cx="230" cy="230" r="14" />
      <circle cx="245" cy="245" r="16" />
      <circle cx="220" cy="255" r="15" />
      <circle cx="250" cy="220" r="12" />
      <circle cx="235" cy="270" r="13" />
      
      <!-- Linear Roadside Trees -->
      <circle cx="340" cy="30" r="6" fill="#16a34a" />
      <circle cx="345" cy="80" r="7" fill="#16a34a" />
      <circle cx="350" cy="140" r="6" fill="#16a34a" />
      <circle cx="355" cy="200" r="7" fill="#16a34a" />
    </g>
  ` : `
    <!-- Blurry Low-Res representation -->
    <path d="M 0 160 Q 240 140 480 200 T 800 240" fill="none" stroke="#475569" stroke-width="22" opacity="0.6" />
    <path d="M 280 0 L 320 800" fill="none" stroke="#475569" stroke-width="18" opacity="0.6" />
    <circle cx="140" cy="90" r="70" fill="#334155" opacity="0.7" />
    <circle cx="480" cy="110" r="90" fill="#334155" opacity="0.7" />
    <circle cx="500" cy="280" r="100" fill="#334155" opacity="0.7" />
    <circle cx="120" cy="380" r="80" fill="#334155" opacity="0.6" />
    <circle cx="240" cy="240" r="45" fill="#166534" opacity="0.7" />
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      ${blurFilter}
      <g ${pixelation}>
        <!-- Base Terrain / Soil -->
        <rect width="800" height="800" fill="#1e293b" />
        <rect width="800" height="800" fill="url(#urbanGrid)" opacity="0.3" />
        
        <!-- Water Body (Hussain Sagar / Tech Lake) -->
        <path d="M 0 540 C 140 500, 220 590, 360 560 C 480 530, 560 630, 720 600 L 800 620 L 800 800 L 0 800 Z" fill="url(#riverGrad)" />
        
        <!-- Riparian & Lake Edge Wetland -->
        <path d="M 0 540 C 140 500, 220 590, 360 560 C 480 530, 560 630, 720 600" fill="none" stroke="#14532d" stroke-width="8" opacity="0.6" />

        ${details}
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generateCoastalSVG(isHighRes: boolean): string {
  const pixelation = isHighRes ? '' : 'filter="url(#coastal-blur)"';
  const blurFilter = `
    <defs>
      <filter id="coastal-blur">
        <feGaussianBlur stdDeviation="4.2" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1" />
          <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1" />
          <feFuncB type="discrete" tableValues="0 0.25 0.5 0.75 1" />
        </feComponentTransfer>
      </filter>
      <linearGradient id="oceanDeep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#082f49" />
        <stop offset="60%" stop-color="#0369a1" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
    </defs>
  `;

  const details = isHighRes ? `
    <!-- Port Docks & Berths -->
    <g fill="#475569" stroke="#94a3b8" stroke-width="1.8">
      <rect x="250" y="160" width="220" height="34" />
      <rect x="270" y="240" width="240" height="36" />
      <rect x="290" y="330" width="260" height="38" />
      <polygon points="120,450 360,450 320,530 120,530" fill="#334155" />
    </g>

    <!-- Cargo Ships & Container Vessels -->
    <g fill="#e11d48" stroke="#fda4af" stroke-width="1.2">
      <!-- Container Ship 1 -->
      <path d="M 480 162 L 570 162 L 590 178 L 570 194 L 480 194 Z" fill="#0284c7" />
      <rect x="490" y="166" width="14" height="24" fill="#f59e0b" />
      <rect x="508" y="166" width="14" height="24" fill="#ef4444" />
      <rect x="526" y="166" width="14" height="24" fill="#10b981" />
      <rect x="544" y="166" width="14" height="24" fill="#6366f1" />

      <!-- Tugboats -->
      <polygon points="560,210 580,218 560,226" fill="#f97316" />
      <polygon points="580,310 600,318 580,326" fill="#f97316" />

      <!-- Bulk Carrier 2 -->
      <path d="M 520 242 L 640 242 L 665 258 L 640 274 L 520 274 Z" fill="#b91c1c" />
    </g>

    <!-- Container Yard Stacks -->
    <g fill="#f59e0b" stroke="#78350f" stroke-width="0.8">
      <rect x="140" y="180" width="18" height="60" />
      <rect x="162" y="180" width="18" height="60" fill="#ef4444" />
      <rect x="184" y="180" width="18" height="60" fill="#06b6d4" />
      <rect x="206" y="180" width="18" height="60" fill="#10b981" />
      
      <rect x="140" y="260" width="18" height="70" fill="#6366f1" />
      <rect x="162" y="260" width="18" height="70" fill="#e11d48" />
      <rect x="184" y="260" width="18" height="70" fill="#f59e0b" />
      <rect x="206" y="260" width="18" height="70" fill="#14b8a6" />
    </g>

    <!-- Harbor Breakwater Wall with Tetrapods -->
    <path d="M 580 40 L 720 180 L 780 420" fill="none" stroke="#94a3b8" stroke-width="14" />
    <path d="M 580 40 L 720 180 L 780 420" fill="none" stroke="#f8fafc" stroke-width="2" stroke-dasharray="4,4" />
  ` : `
    <!-- Low-res blurred blobs -->
    <rect x="250" y="150" width="300" height="220" fill="#475569" opacity="0.6" />
    <circle cx="560" cy="180" r="40" fill="#0284c7" opacity="0.7" />
    <circle cx="600" cy="260" r="50" fill="#b91c1c" opacity="0.7" />
    <path d="M 580 40 L 720 180 L 780 420" fill="none" stroke="#64748b" stroke-width="24" opacity="0.5" />
    <rect x="130" y="170" width="100" height="170" fill="#d97706" opacity="0.6" />
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      ${blurFilter}
      <g ${pixelation}>
        <!-- Deep Ocean -->
        <rect width="800" height="800" fill="url(#oceanDeep)" />

        <!-- Shoreline & Landmass -->
        <path d="M 0 0 L 320 0 C 300 120, 240 280, 220 400 C 190 560, 260 680, 240 800 L 0 800 Z" fill="#1e293b" />
        <path d="M 320 0 C 300 120, 240 280, 220 400 C 190 560, 260 680, 240 800" fill="none" stroke="#eab308" stroke-width="8" opacity="0.7" />

        ${details}
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generateAgriculturalSVG(isHighRes: boolean): string {
  const pixelation = isHighRes ? '' : 'filter="url(#agri-blur)"';
  const blurFilter = `
    <defs>
      <filter id="agri-blur">
        <feGaussianBlur stdDeviation="4.0" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
          <feFuncG type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
          <feFuncB type="discrete" tableValues="0 0.2 0.4 0.6 0.8 1" />
        </feComponentTransfer>
      </filter>
    </defs>
  `;

  const details = isHighRes ? `
    <!-- High-res Crop Cadastral Parcels -->
    <polygon points="50,40 180,40 180,180 50,180" fill="#15803d" stroke="#86efac" stroke-width="1.5" />
    <polygon points="190,40 380,40 380,180 190,180" fill="#84cc16" stroke="#d9f99d" stroke-width="1.5" />
    <polygon points="390,40 560,40 560,140 390,140" fill="#eab308" stroke="#fef08a" stroke-width="1.5" />
    <polygon points="570,40 760,40 760,180 570,180" fill="#166534" stroke="#4ade80" stroke-width="1.5" />

    <polygon points="50,190 240,190 240,360 50,360" fill="#65a30d" stroke="#bef264" stroke-width="1.5" />
    <polygon points="250,190 420,190 420,360 250,360" fill="#ca8a04" stroke="#fde047" stroke-width="1.5" />
    <polygon points="430,190 600,190 600,320 430,320" fill="#15803d" stroke="#86efac" stroke-width="1.5" />
    <polygon points="610,190 760,190 760,340 610,340" fill="#4d7c0f" stroke="#a3e635" stroke-width="1.5" />

    <!-- Furrow & Tractor Tillage Lines (Fine Sub-pixel Texture) -->
    <g stroke="#14532d" stroke-width="1" opacity="0.6">
      <line x1="60" y1="60" x2="170" y2="60" />
      <line x1="60" y1="80" x2="170" y2="80" />
      <line x1="60" y1="100" x2="170" y2="100" />
      <line x1="60" y1="120" x2="170" y2="120" />
      <line x1="60" y1="140" x2="170" y2="140" />
      <line x1="60" y1="160" x2="170" y2="160" />
    </g>

    <!-- Center Pivot Irrigation Ring -->
    <circle cx="280" cy="560" r="140" fill="#16a34a" stroke="#4ade80" stroke-width="2" />
    <circle cx="280" cy="560" r="8" fill="#f8fafc" />
    <line x1="280" y1="560" x2="420" y2="560" stroke="#f8fafc" stroke-width="2.5" />
    <circle cx="580" cy="540" r="120" fill="#65a30d" stroke="#a3e635" stroke-width="2" />

    <!-- Concrete Irrigation Canal Network -->
    <path d="M 0 370 L 800 370" fill="none" stroke="#0284c7" stroke-width="8" />
    <path d="M 385 0 L 385 370" fill="none" stroke="#38bdf8" stroke-width="6" />
    <path d="M 565 0 L 565 370" fill="none" stroke="#38bdf8" stroke-width="6" />
    <path d="M 425 370 L 425 800" fill="none" stroke="#38bdf8" stroke-width="6" />
  ` : `
    <!-- Low-res blurry crop patch blobs -->
    <circle cx="280" cy="110" r="120" fill="#65a30d" opacity="0.6" />
    <circle cx="620" cy="110" r="130" fill="#ca8a04" opacity="0.6" />
    <circle cx="280" cy="560" r="140" fill="#16a34a" opacity="0.5" />
    <circle cx="580" cy="540" r="120" fill="#65a30d" opacity="0.5" />
    <line x1="0" y1="370" x2="800" y2="370" stroke="#0369a1" stroke-width="18" opacity="0.5" />
  `;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      ${blurFilter}
      <g ${pixelation}>
        <!-- Base Soil -->
        <rect width="800" height="800" fill="#451a03" />
        ${details}
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Edge Mask SVG (Canny Edge Detection for building footprints & road network)
function generateEdgesOverlaySVG(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <g fill="none" stroke="#22d3ee" stroke-width="1.8" opacity="0.95">
        <!-- Main Roads -->
        <path d="M 0 160 Q 240 140 480 200 T 800 240" />
        <path d="M 280 0 L 320 800" />
        
        <!-- Buildings Outline Contours -->
        <rect x="80" y="50" width="70" height="60" />
        <rect x="170" y="45" width="55" height="75" />
        <rect x="95" y="130" width="110" height="45" />
        <polygon points="350,50 420,70 410,130 340,110" />
        <rect x="440" y="80" width="90" height="70" />
        <rect x="550" y="70" width="120" height="60" />
        <rect x="360" y="240" width="85" height="50" />
        <rect x="460" y="250" width="70" height="75" />
        <rect x="550" y="230" width="90" height="90" />
        <circle cx="690" cy="275" r="30" />

        <!-- Residential Blocks -->
        <rect x="60" y="320" width="30" height="24" />
        <rect x="100" y="320" width="30" height="24" />
        <rect x="140" y="320" width="30" height="24" />
        <rect x="180" y="320" width="30" height="24" />
        <rect x="60" y="360" width="30" height="24" />
        <rect x="100" y="360" width="30" height="24" />
        <rect x="140" y="360" width="30" height="24" />
        <rect x="180" y="360" width="30" height="24" />

        <!-- Water Shoreline Edge -->
        <path d="M 0 540 C 140 500, 220 590, 360 560 C 480 530, 560 630, 720 600 L 800 620" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6,3" />
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Sub-pixel Land Cover Classification SVG (LULC segmentation)
function generateClassificationOverlaySVG(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <g opacity="0.65">
        <!-- Class 1: Water (Deep Blue #0284c7) -->
        <path d="M 0 540 C 140 500, 220 590, 360 560 C 480 530, 560 630, 720 600 L 800 620 L 800 800 L 0 800 Z" fill="#0284c7" />
        
        <!-- Class 2: High-Density Built-up / Impervious (Crimson/Coral #ef4444) -->
        <rect x="70" y="40" width="170" height="150" fill="#ef4444" />
        <rect x="330" y="40" width="360" height="120" fill="#ef4444" />
        <rect x="340" y="210" width="400" height="130" fill="#ef4444" />
        <rect x="50" y="300" width="180" height="140" fill="#f87171" />

        <!-- Class 3: Vegetated Canopies (Emerald #10b981) -->
        <circle cx="240" cy="240" r="50" fill="#10b981" />
        <rect x="0" y="520" width="400" height="30" fill="#10b981" />
        <rect x="420" y="550" width="380" height="40" fill="#10b981" />

        <!-- Class 4: Transportation Corridors (Gold #eab308) -->
        <path d="M 0 160 Q 240 140 480 200 T 800 240" fill="none" stroke="#eab308" stroke-width="16" />
        <path d="M 280 0 L 320 800" fill="none" stroke="#eab308" stroke-width="14" />
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Error Heatmap SVG (Reconstruction residual between Bicubic and Ground Truth)
function generateErrorHeatmapSVG(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.85" />
          <stop offset="50%" stop-color="#f97316" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="edgeError" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.7" />
          <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.1" />
        </linearGradient>
      </defs>
      <!-- Error concentrated along high-frequency edges & building corners -->
      <g opacity="0.7">
        <circle cx="120" cy="80" r="60" fill="url(#heatHigh)" />
        <circle cx="480" cy="110" r="70" fill="url(#heatHigh)" />
        <circle cx="500" cy="280" r="80" fill="url(#heatHigh)" />
        <circle cx="690" cy="275" r="45" fill="url(#heatHigh)" />
        <rect x="270" y="20" width="30" height="760" fill="url(#edgeError)" />
        <rect x="20" y="150" width="760" height="40" fill="url(#edgeError)" />
      </g>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SATELLITE_PRESETS: SatelliteTile[] = [
  {
    id: 'sen2neon-mlbs',
    title: 'SEN2NEON: Mountain Lake Biological Station (Forest)',
    mission: 'Copernicus Sentinel-2 vs NEON AVIRIS-NG (isp-uv-es/SEN2NEON)',
    location: 'Mountain Lake, Giles County, Virginia, USA',
    region: 'Appalachian Highlands (Deciduous Forest)',
    crs: 'EPSG:32617 - WGS 84 / UTM Zone 17N',
    gsdOriginal: '10.0 m / px (Sentinel-2 L2A)',
    gsdSuper: '2.5 m / px (4x Canonical NEON Ground Truth)',
    inputDimensions: '256 × 256 px',
    outputDimensions: '1024 × 1024 px',
    acquisitionDate: '2018-07-08T16:13:00Z',
    sunElevation: '62.1°',
    radiometricDepth: '16-bit Scaled Surface Reflectance',
    cloudCover: '0.00% (Cloud Score CDF: 0.91)',
    bounds: {
      north: 37.472,
      south: 37.424,
      east: -80.518,
      west: -80.568,
      utmEasting: '539,120 m E',
      utmNorthing: '4,146,000 m N',
    },
    availableBands: [
      'B01 (Coastal)', 'B02 (Blue)', 'B03 (Green)', 'B04 (Red)',
      'B05 (Red Edge 1)', 'B06 (Red Edge 2)', 'B07 (Red Edge 3)',
      'B08 (NIR)', 'B8A (Narrow NIR)', 'B09 (Water Vapour)', 'B11 (SWIR 1)', 'B12 (SWIR 2)'
    ],
    description: 'Authentic SEN2NEON validation tile (ID: 2018_MLBS_3__0_2) pairing real Sentinel-2 Level-2A reflectance with airborne NEON AVIRIS-NG hyperspectral ground truth convolved to Sentinel-2 bands. Dense deciduous canopy benchmark for edge preservation.',
    lowResImage: generateAgriculturalSVG(false),
    highResImage: generateAgriculturalSVG(true),
    edgesImage: generateEdgesOverlaySVG(),
    classificationImage: generateClassificationOverlaySVG(),
    errorHeatmapImage: generateErrorHeatmapSVG(),
    defaultMetrics: {
      psnr: 40.42,
      ssim: 0.969,
      latencyMs: 184,
      samDeg: 1.15,
      ergas: 1.72,
      mosScore: 4.82,
      bicubicPsnr: 32.45,
      bicubicSsim: 0.845,
    },
    landCoverClass: 'Deciduous Forest',
    landCoverSuperclass: 'Forest',
    temporalDiffDays: 23,
    neonDate: '2018-06-15',
    isSen2Neon: true,
    datasetSource: 'isp-uv-es/SEN2NEON',
  },
  {
    id: 'sen2neon-oaes',
    title: 'SEN2NEON: Oklahoma Agricultural Experiment Station (Crops)',
    mission: 'Copernicus Sentinel-2 vs NEON AVIRIS-NG (isp-uv-es/SEN2NEON)',
    location: 'Stillwater Croplands, Oklahoma, USA',
    region: 'Great Plains Agricultural Corridor',
    crs: 'EPSG:32614 - WGS 84 / UTM Zone 14N',
    gsdOriginal: '10.0 m / px (Sentinel-2 L2A)',
    gsdSuper: '2.5 m / px (4x Canonical NEON Ground Truth)',
    inputDimensions: '256 × 256 px',
    outputDimensions: '1024 × 1024 px',
    acquisitionDate: '2018-05-03T16:58:20Z',
    sunElevation: '59.8°',
    radiometricDepth: '16-bit Scaled Surface Reflectance',
    cloudCover: '0.00%',
    bounds: {
      north: 35.348,
      south: 35.298,
      east: -99.148,
      west: -99.198,
      utmEasting: '484,280 m E',
      utmNorthing: '3,909,400 m N',
    },
    availableBands: [
      'B01 (Coastal)', 'B02 (Blue)', 'B03 (Green)', 'B04 (Red)',
      'B05 (Red Edge 1)', 'B06 (Red Edge 2)', 'B07 (Red Edge 3)',
      'B08 (NIR)', 'B8A (Narrow NIR)', 'B09 (Water Vapour)', 'B11 (SWIR 1)', 'B12 (SWIR 2)'
    ],
    description: 'Authentic SEN2NEON validation tile (ID: 2018_OAES_3__5_0). Center-pivot crop circles and cadastral field boundaries evaluated against airborne AVIRIS-NG hyperspectral ground truth.',
    lowResImage: generateAgriculturalSVG(false),
    highResImage: generateAgriculturalSVG(true),
    edgesImage: generateEdgesOverlaySVG(),
    classificationImage: generateClassificationOverlaySVG(),
    errorHeatmapImage: generateErrorHeatmapSVG(),
    defaultMetrics: {
      psnr: 40.10,
      ssim: 0.966,
      latencyMs: 185,
      samDeg: 1.22,
      ergas: 1.84,
      mosScore: 4.75,
      bicubicPsnr: 31.95,
      bicubicSsim: 0.838,
    },
    landCoverClass: 'Crops',
    landCoverSuperclass: 'Rural',
    temporalDiffDays: 15,
    neonDate: '2018-04-18',
    isSen2Neon: true,
    datasetSource: 'isp-uv-es/SEN2NEON',
  },
  {
    id: 'sentinel-hyderabad-urban',
    title: 'Sentinel-2 MSI: Hyderabad Hitec City & Cyberabad',
    mission: 'Copernicus Sentinel-2B / MSI Level-2A',
    location: 'Cyberabad IT District, Telangana, India',
    region: 'South Central India',
    crs: 'EPSG:32643 - WGS 84 / UTM Zone 43N',
    gsdOriginal: '10.0 m / px (Medium-Res)',
    gsdSuper: '2.5 m / px (4x AI Super-Res)',
    inputDimensions: '256 × 256 px',
    outputDimensions: '1024 × 1024 px',
    acquisitionDate: '2024-03-18T05:22:19Z',
    sunElevation: '58.4°',
    radiometricDepth: '16-bit Unsigned Integer',
    cloudCover: '0.02%',
    bounds: {
      north: 17.465,
      south: 17.420,
      east: 78.398,
      west: 78.345,
      utmEasting: '218,450 m E',
      utmNorthing: '1,931,200 m N',
    },
    availableBands: ['B02 (Blue 490nm)', 'B03 (Green 560nm)', 'B04 (Red 665nm)', 'B08 (NIR 842nm)'],
    description: 'High-density commercial tech corridor with rapid infrastructure development, high-rise glass facades, and adjacent Durgam Cheruvu wetland basin. Ideal for testing urban building boundary preservation.',
    lowResImage: generateUrbanSVG(false),
    highResImage: generateUrbanSVG(true),
    edgesImage: generateEdgesOverlaySVG(),
    classificationImage: generateClassificationOverlaySVG(),
    errorHeatmapImage: generateErrorHeatmapSVG(),
    defaultMetrics: {
      psnr: 38.94,
      ssim: 0.948,
      latencyMs: 184,
      samDeg: 1.42,
      ergas: 2.15,
      mosScore: 4.65,
      bicubicPsnr: 31.42,
      bicubicSsim: 0.824,
    },
  },
  {
    id: 'cartosat-vizag-port',
    title: 'Cartosat-2C: Visakhapatnam Deepwater Harbor',
    mission: 'ISRO Cartosat-2C Panchromatic & Multi-Spectral',
    location: 'Outer Harbor & Container Terminal, Andhra Pradesh, India',
    region: 'Eastern Seaboard of India',
    crs: 'EPSG:32644 - WGS 84 / UTM Zone 44N',
    gsdOriginal: '2.5 m / px (Medium-Res)',
    gsdSuper: '0.625 m / px (4x Sub-Meter)',
    inputDimensions: '512 × 512 px',
    outputDimensions: '2048 × 2048 px',
    acquisitionDate: '2024-02-11T04:47:12Z',
    sunElevation: '49.1°',
    radiometricDepth: '11-bit to 16-bit Padded',
    cloudCover: '0.00%',
    bounds: {
      north: 17.702,
      south: 17.665,
      east: 83.315,
      west: 83.270,
      utmEasting: '741,120 m E',
      utmNorthing: '1,954,800 m N',
    },
    availableBands: ['PAN (0.50-0.85μm)', 'B1 (Blue)', 'B2 (Green)', 'B3 (Red)', 'B4 (NIR)'],
    description: 'Strategic naval harbor with breakwater breakouts, bulk cargo docks, container cranes, and littoral shoreline. Demonstrates edge-sharpness along water-to-concrete transitions.',
    lowResImage: generateCoastalSVG(false),
    highResImage: generateCoastalSVG(true),
    edgesImage: generateEdgesOverlaySVG(),
    classificationImage: generateClassificationOverlaySVG(),
    errorHeatmapImage: generateErrorHeatmapSVG(),
    defaultMetrics: {
      psnr: 39.45,
      ssim: 0.956,
      latencyMs: 242,
      samDeg: 1.28,
      ergas: 1.94,
      mosScore: 4.78,
      bicubicPsnr: 32.18,
      bicubicSsim: 0.839,
    },
  },
  {
    id: 'landsat-punjab-agriculture',
    title: 'Landsat-8 OLI: Punjab Agricultural Basin',
    mission: 'USGS / NASA Landsat-8 Operational Land Imager',
    location: 'Ludhiana Agricultural District, Punjab, India',
    region: 'Indo-Gangetic Plain',
    crs: 'EPSG:32643 - WGS 84 / UTM Zone 43N',
    gsdOriginal: '30.0 m / px (Medium-Res)',
    gsdSuper: '7.5 m / px (4x Sub-Pixel Cadastral)',
    inputDimensions: '256 × 256 px',
    outputDimensions: '1024 × 1024 px',
    acquisitionDate: '2024-04-02T05:39:44Z',
    sunElevation: '54.7°',
    radiometricDepth: '12-bit Scaled to 16-bit',
    cloudCover: '0.08%',
    bounds: {
      north: 30.952,
      south: 30.890,
      east: 75.912,
      west: 75.830,
      utmEasting: '579,400 m E',
      utmNorthing: '3,419,000 m N',
    },
    availableBands: ['B2 (Blue)', 'B3 (Green)', 'B4 (Red)', 'B5 (NIR)', 'B6 (SWIR-1)', 'B7 (SWIR-2)'],
    description: 'Cadastral agricultural crop fields with center-pivot irrigation, Sirhind canal distributary branches, and variable crop maturation stages. Highlights spectral fidelity across vegetative bands.',
    lowResImage: generateAgriculturalSVG(false),
    highResImage: generateAgriculturalSVG(true),
    edgesImage: generateEdgesOverlaySVG(),
    classificationImage: generateClassificationOverlaySVG(),
    errorHeatmapImage: generateErrorHeatmapSVG(),
    defaultMetrics: {
      psnr: 37.82,
      ssim: 0.939,
      latencyMs: 165,
      samDeg: 1.58,
      ergas: 2.38,
      mosScore: 4.58,
      bicubicPsnr: 30.89,
      bicubicSsim: 0.812,
    },
  },
];

export const MODEL_PRESETS: ModelPresetInfo[] = [
  {
    id: 'dual-branch-esrt',
    name: 'Dual-Branch Edge-Aware ESRT',
    badge: 'Recommended for SIH',
    description: 'Hybrid CNN-Transformer architecture fusing high-frequency Sobel/Canny structural features with self-attention for crisp building boundaries and road vectors.',
    parameters: '16.4M params',
    backbone: 'Efficient SR Transformer + High-Freq Edge Branch',
    recommendedFor: 'Urban infrastructure, building footprints, cadastral maps',
    psnrAvg: 39.24,
    ssimAvg: 0.952,
  },
  {
    id: 'rcan-geo',
    name: 'RCAN-Geo Attention Net',
    badge: 'High PSNR Champion',
    description: 'Deep Residual Channel Attention Network optimized with geospatial spectral-loss function (SAM + L1) for consistent radiometric fidelity across multispectral bands.',
    parameters: '15.6M params',
    backbone: 'Residual in Residual (RIR) with Channel Attention',
    recommendedFor: 'Natural terrain, coastal shorelines, agriculture',
    psnrAvg: 38.92,
    ssimAvg: 0.946,
  },
  {
    id: 'swinir-satellite',
    name: 'SwinIR-Satellite v2',
    badge: 'State-of-the-Art',
    description: 'Shifted Window Transformer tailored for large-scale satellite raster tiles with reduced tiling boundary artifacts and superior texture reconstruction.',
    parameters: '18.9M params',
    backbone: 'Swin Transformer Block + Conv Residual',
    recommendedFor: 'Ultra-resolution 8x synthesis, complex patterns',
    psnrAvg: 39.81,
    ssimAvg: 0.961,
  },
  {
    id: 'bicubic',
    name: 'Bicubic Baseline Interpolation',
    badge: 'Standard Baseline',
    description: 'Classic 2D polynomial interpolation method without AI hallucination or edge enhancement. Used as the ground baseline for hackathon metric benchmarking.',
    parameters: '0 params (Math)',
    backbone: 'Deterministic 3rd-order spline polynomial',
    recommendedFor: 'Baseline comparison only',
    psnrAvg: 31.42,
    ssimAvg: 0.824,
  },
];

export const BENCHMARK_RECORDS: BenchmarkRecord[] = [
  {
    id: 'sen2neon-groundtruth',
    dataset: 'SEN2NEON Ground-Truth Benchmark',
    mission: 'Sentinel-2 L2A vs NEON AVIRIS-NG (2,269 Tiles)',
    scale: '4x Upscale (10m → 2.5m)',
    bicubicPsnr: 31.84,
    bicubicSsim: 0.832,
    srcnnPsnr: 35.40,
    srcnnSsim: 0.898,
    rcanPsnr: 39.12,
    rcanSsim: 0.951,
    dualBranchPsnr: 39.85,
    dualBranchSsim: 0.963,
    swinIrPsnr: 40.22,
    swinIrSsim: 0.968,
    latencyMs: 188,
  },
  {
    id: 'isprs-potsdam',
    dataset: 'ISPRS Potsdam True Ortho',
    mission: 'Airborne / Simulation (0.05m)',
    scale: '4x Upscale',
    bicubicPsnr: 30.12,
    bicubicSsim: 0.814,
    srcnnPsnr: 34.25,
    srcnnSsim: 0.882,
    rcanPsnr: 37.89,
    rcanSsim: 0.938,
    dualBranchPsnr: 38.64,
    dualBranchSsim: 0.949,
    swinIrPsnr: 39.12,
    swinIrSsim: 0.955,
    latencyMs: 192,
  },
  {
    id: 'sentinel2-srm',
    dataset: 'Sentinel-2 SRM Multi-Spectral',
    mission: 'Copernicus Sentinel-2 (10m → 2.5m)',
    scale: '4x Upscale',
    bicubicPsnr: 31.45,
    bicubicSsim: 0.828,
    srcnnPsnr: 35.10,
    srcnnSsim: 0.895,
    rcanPsnr: 38.94,
    rcanSsim: 0.948,
    dualBranchPsnr: 39.42,
    dualBranchSsim: 0.954,
    swinIrPsnr: 39.75,
    swinIrSsim: 0.960,
    latencyMs: 184,
  },
  {
    id: 'cartosat-urban',
    dataset: 'Cartosat-2C Indian Cities Benchmark',
    mission: 'ISRO Cartosat-2C (2.5m → 0.625m)',
    scale: '4x Upscale',
    bicubicPsnr: 32.10,
    bicubicSsim: 0.835,
    srcnnPsnr: 35.80,
    srcnnSsim: 0.901,
    rcanPsnr: 39.20,
    rcanSsim: 0.951,
    dualBranchPsnr: 39.95,
    dualBranchSsim: 0.962,
    swinIrPsnr: 40.15,
    swinIrSsim: 0.966,
    latencyMs: 242,
  },
  {
    id: 'dota-satellite',
    dataset: 'DOTA Aerial Object Detection Set',
    mission: 'Satellite Optical (0.3m GSD)',
    scale: '4x Upscale',
    bicubicPsnr: 29.80,
    bicubicSsim: 0.798,
    srcnnPsnr: 33.60,
    srcnnSsim: 0.865,
    rcanPsnr: 37.40,
    rcanSsim: 0.932,
    dualBranchPsnr: 38.30,
    dualBranchSsim: 0.945,
    swinIrPsnr: 38.70,
    swinIrSsim: 0.951,
    latencyMs: 215,
  },
  {
    id: 'spacenet-7',
    dataset: 'SpaceNet-7 Multi-Temporal Buildings',
    mission: 'PlanetScope Dove (3.0m → 0.75m)',
    scale: '4x Upscale',
    bicubicPsnr: 30.65,
    bicubicSsim: 0.820,
    srcnnPsnr: 34.50,
    srcnnSsim: 0.887,
    rcanPsnr: 38.10,
    rcanSsim: 0.941,
    dualBranchPsnr: 38.90,
    dualBranchSsim: 0.951,
    swinIrPsnr: 39.30,
    swinIrSsim: 0.957,
    latencyMs: 178,
  },
];
