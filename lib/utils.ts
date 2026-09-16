import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ModelVariant, ScaleFactor, TileMetrics } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

export function calculateDynamicMetrics(
  baseMetrics: TileMetrics,
  model: ModelVariant,
  scale: ScaleFactor
): TileMetrics {
  let psnrFactor = 0;
  let ssimFactor = 0;
  let latencyMultiplier = 1;

  // Scale factor adjustments
  if (scale === '2x') {
    psnrFactor += 2.1;
    ssimFactor += 0.022;
    latencyMultiplier = 0.55;
  } else if (scale === '4x') {
    psnrFactor += 0;
    ssimFactor += 0;
    latencyMultiplier = 1.0;
  } else if (scale === '8x') {
    psnrFactor -= 2.6;
    ssimFactor -= 0.038;
    latencyMultiplier = 2.4;
  }

  // Model variant adjustments
  switch (model) {
    case 'dual-branch-esrt':
      psnrFactor += 0.65;
      ssimFactor += 0.009;
      latencyMultiplier *= 1.15;
      break;
    case 'rcan-geo':
      psnrFactor += 0.40;
      ssimFactor += 0.005;
      latencyMultiplier *= 1.0;
      break;
    case 'swinir-satellite':
      psnrFactor += 1.10;
      ssimFactor += 0.015;
      latencyMultiplier *= 1.45;
      break;
    case 'bicubic':
      return {
        ...baseMetrics,
        psnr: baseMetrics.bicubicPsnr,
        ssim: baseMetrics.bicubicSsim,
        latencyMs: 12,
        samDeg: 3.85,
        ergas: 4.90,
        mosScore: 2.80,
      };
  }

  const computedPsnr = Number((baseMetrics.psnr + psnrFactor).toFixed(2));
  const computedSsim = Math.min(0.999, Number((baseMetrics.ssim + ssimFactor).toFixed(3)));
  const computedLatency = Math.round(baseMetrics.latencyMs * latencyMultiplier);

  return {
    ...baseMetrics,
    psnr: computedPsnr,
    ssim: computedSsim,
    latencyMs: computedLatency,
  };
}

export function triggerDownload(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateMockGeoTiffTfw(
  pixelSizeX: number,
  pixelSizeY: number,
  originX: number,
  originY: number
): string {
  // Standard ESRI Worldfile (.tfw) format
  return `${pixelSizeX.toFixed(8)}
0.00000000
0.00000000
${(-pixelSizeY).toFixed(8)}
${originX.toFixed(8)}
${originY.toFixed(8)}
`;
}
