export type ModelVariant = 'rcan-geo' | 'dual-branch-esrt' | 'swinir-satellite' | 'bicubic';

export type ScaleFactor = '2x' | '4x' | '8x';

export type SpectralBandMode = 'rgb' | 'cir' | 'agri' | 'ndvi';

export type ViewMode = 'split' | 'side-by-side' | 'dissolve';

export type ActiveOverlay = 'none' | 'grid' | 'edges' | 'classification' | 'heatmap';

export interface TileBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  utmEasting: string;
  utmNorthing: string;
}

export interface TileMetrics {
  psnr: number;
  ssim: number;
  latencyMs: number;
  samDeg: number;
  ergas: number;
  mosScore: number;
  bicubicPsnr: number;
  bicubicSsim: number;
}

export interface SatelliteTile {
  id: string;
  title: string;
  mission: string;
  location: string;
  region: string;
  crs: string;
  gsdOriginal: string;
  gsdSuper: string;
  inputDimensions: string;
  outputDimensions: string;
  acquisitionDate: string;
  sunElevation: string;
  radiometricDepth: string;
  cloudCover: string;
  bounds: TileBounds;
  availableBands: string[];
  description: string;
  lowResImage: string;
  highResImage: string;
  edgesImage: string;
  classificationImage: string;
  errorHeatmapImage: string;
  defaultMetrics: TileMetrics;
  landCoverClass?: string;
  landCoverSuperclass?: string;
  temporalDiffDays?: number;
  neonDate?: string;
  isSen2Neon?: boolean;
  datasetSource?: string;
}

export interface ModelPresetInfo {
  id: ModelVariant;
  name: string;
  badge: string;
  description: string;
  parameters: string;
  backbone: string;
  recommendedFor: string;
  psnrAvg: number;
  ssimAvg: number;
}

export interface ModelProcessingState {
  isProcessing: boolean;
  stepIndex: number;
  stepName: string;
  progress: number;
}

export interface BenchmarkRecord {
  id: string;
  dataset: string;
  mission: string;
  scale: string;
  bicubicPsnr: number;
  bicubicSsim: number;
  srcnnPsnr: number;
  srcnnSsim: number;
  rcanPsnr: number;
  rcanSsim: number;
  dualBranchPsnr: number;
  dualBranchSsim: number;
  swinIrPsnr: number;
  swinIrSsim: number;
  latencyMs: number;
}
