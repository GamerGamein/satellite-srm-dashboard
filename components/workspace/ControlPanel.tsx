'use client';

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Cpu,
  Layers,
  Sparkles,
  Check,
  ChevronDown,
  Info,
  Sliders,
  FileCheck2,
  AlertCircle,
  MapPin,
  Activity,
  Database,
} from 'lucide-react';
import {
  SatelliteTile,
  ModelVariant,
  ScaleFactor,
  SpectralBandMode
} from '@/lib/types';
import { SATELLITE_PRESETS, MODEL_PRESETS } from '@/lib/presets';
import Sen2NeonDatabaseModal from './Sen2NeonDatabaseModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ControlPanelProps {
  selectedTile: SatelliteTile;
  onSelectTile: (tile: SatelliteTile) => void;
  selectedModel: ModelVariant;
  onSelectModel: (model: ModelVariant) => void;
  scaleFactor: ScaleFactor;
  onSelectScale: (scale: ScaleFactor) => void;
  bandMode: SpectralBandMode;
  onSelectBand: (band: SpectralBandMode) => void;
  onProcessImage: () => void;
  isProcessing: boolean;
  onUploadCustomTile: (newTile: SatelliteTile) => void;
}

export default function ControlPanel({
  selectedTile,
  onSelectTile,
  selectedModel,
  onSelectModel,
  scaleFactor,
  onSelectScale,
  bandMode,
  onSelectBand,
  onProcessImage,
  isProcessing,
  onUploadCustomTile,
}: ControlPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validExtensions = ['.tif', '.tiff', '.png', '.jpg', '.jpeg'];
    const isExtensionValid = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isExtensionValid) {
      setUploadFeedback('Please upload a valid GeoTIFF (.tif) or Raster image (.png).');
      return;
    }

    setUploadFeedback(`Parsed GeoTIFF: ${file.name} (Simulated CRS: EPSG:32643, 16-bit)`);

    const customTile: SatelliteTile = {
      ...SATELLITE_PRESETS[0],
      id: `custom-${Date.now()}`,
      title: `Custom Upload: ${file.name}`,
      mission: file.name.endsWith('.tif') ? 'User GeoTIFF (EPSG:32643)' : 'Uploaded Raster Image',
      location: 'User Specified Coordinates (Simulated Lat/Lon)',
      acquisitionDate: new Date().toISOString(),
    };

    onUploadCustomTile(customTile);
    setTimeout(() => setUploadFeedback(null), 5000);
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-black/65 backdrop-blur-xl overflow-hidden relative z-10">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 bg-neutral-950/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="font-bold text-xs text-white tracking-wider uppercase font-mono">
              SRM Pipeline Configuration
            </h2>
          </div>
          <Badge variant="outline" className="text-[10px] border-cyan-500/40 text-cyan-300 font-bold bg-cyan-950/30">
            DUAL-BRANCH
          </Badge>
        </div>
        <p className="text-[11px] text-neutral-400 font-mono mt-1">
          Select benchmark tiles or upload custom GeoTIFFs to run inference.
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 text-neutral-300 pb-6">
          {/* SECTION 1: Sample Preset Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                1. Satellite Scene Preset
              </label>
              <span className="text-[10px] font-mono text-neutral-400">
                {SATELLITE_PRESETS.length} Scenes Available
              </span>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDatabaseModalOpen(true)}
                className="w-full justify-center gap-2 border-cyan-500/50 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 hover:text-white font-mono text-xs h-9 rounded-xl transition-all shadow-sm shadow-cyan-950"
              >
                <Database className="h-3.5 w-3.5 text-cyan-400" />
                <span>Browse SEN2NEON Database (2,269)</span>
              </Button>

              {SATELLITE_PRESETS.map((tile) => {
                const isSelected = selectedTile.id === tile.id;
                return (
                  <Card
                    key={tile.id}
                    onClick={() => onSelectTile(tile)}
                    className={`cursor-pointer transition-all p-2.5 rounded-xl border ${
                      isSelected
                        ? 'border-cyan-400/80 bg-neutral-900/90 shadow-lg shadow-cyan-500/10'
                        : 'border-white/10 bg-neutral-950/60 hover:bg-neutral-900/70 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-neutral-900 border border-white/10 shrink-0 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tile.highResImage}
                          alt={tile.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-white truncate">
                            {tile.title.split(':')[0]}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-neutral-300 font-mono truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0 text-neutral-400" />
                          {tile.location.split(',')[0]}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400 font-mono">
                          <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-neutral-700 text-neutral-300">
                            GSD: {tile.gsdOriginal.split(' ')[0]} → {tile.gsdSuper.split(' ')[0]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* SECTION 2: Drag and Drop Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Or Upload Raster Tile
              </label>
              <span className="text-[10px] font-mono text-neutral-400">.TIF / .PNG</span>
            </div>
            
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-cyan-400 bg-neutral-900/90 shadow-inner'
                  : 'border-white/10 hover:border-white/30 bg-neutral-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".tif,.tiff,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud className="h-6 w-6 mx-auto text-cyan-300 mb-1" />
              <p className="text-xs font-semibold text-white">
                Drop GeoTIFF raster file here
              </p>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                Supports 16-bit Multispectral Sentinel-2 &amp; Cartosat Tiles
              </p>
            </div>

            {uploadFeedback && (
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-neutral-900/80 border border-white/20 p-2 text-[11px] text-white font-mono">
                <FileCheck2 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span className="truncate">{uploadFeedback}</span>
              </div>
            )}
          </div>

          <Separator className="bg-white/10" />

          {/* SECTION 3: Deep Learning Model Variant - DUAL-BRANCH ONLY */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                2. AI Architecture Mode
              </label>
              <Badge variant="default" className="text-[9px] py-0 px-2 font-bold bg-cyan-400 text-black font-mono">
                DUAL-BRANCH ACTIVE
              </Badge>
            </div>

            <Card className="p-3.5 rounded-xl border border-cyan-500/40 bg-neutral-950/80 shadow-lg shadow-cyan-500/5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    Dual-Branch Edge-Aware ESRT
                  </span>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-snug font-mono">
                    Hybrid CNN-Transformer architecture decoupling structural edge gradients from radiometric reflectance.
                  </p>
                </div>
              </div>

              {/* Dual-Branch Architecture Pipeline breakdown */}
              <div className="space-y-1.5 pt-1 border-t border-white/10 font-mono text-[10px]">
                <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 space-y-0.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                      Branch 1: High-Freq Edge Stream
                    </span>
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-cyan-500/40 text-cyan-300 bg-cyan-950/50">
                      Sobel / Canny
                    </Badge>
                  </div>
                  <p className="text-[9.5px] text-cyan-300/80 leading-snug">
                    Extracts geometric priors for razor-sharp building footprints and transport road networks.
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 space-y-0.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      Branch 2: Spectral Context Stream
                    </span>
                    <Badge variant="outline" className="text-[8px] py-0 px-1 border-indigo-500/40 text-indigo-300 bg-indigo-950/50">
                      Self-Attention
                    </Badge>
                  </div>
                  <p className="text-[9.5px] text-indigo-300/80 leading-snug">
                    Multi-head self-attention preserves 16-bit multispectral radiometric integrity and NDVI indices.
                  </p>
                </div>

                <div className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-neutral-300 flex items-center justify-between text-[9.5px]">
                  <span className="text-neutral-400">Fusion Mechanism:</span>
                  <span className="text-white font-bold">Cross-Attention Gate</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-white/10 pt-2">
                <span>Validation PSNR: <strong className="text-white">~39.24 dB</strong></span>
                <span>SSIM: <strong className="text-white">0.952</strong></span>
              </div>
            </Card>
          </div>

          <Separator className="bg-white/10" />

          {/* SECTION 4: Scale Factor Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-white uppercase tracking-wider">
              3. Upscale Magnification (GSD Boost)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['2x', '4x', '8x'] as ScaleFactor[]).map((scale) => {
                const isSelected = scaleFactor === scale;
                return (
                  <Button
                    key={scale}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onSelectScale(scale)}
                    className="h-auto py-2 px-3 flex flex-col items-center justify-center"
                  >
                    <span className="text-xs font-bold font-mono">{scale}</span>
                    <span className={`text-[9px] font-normal mt-0.5 ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                      {scale === '2x' ? 'Fast' : scale === '4x' ? 'Hackathon' : 'Ultra'}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-neutral-800" />

          {/* SECTION 5: Spectral Band Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-white uppercase tracking-wider">
              4. Spectral Band Compositing
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rgb', label: 'True Color RGB', desc: 'Bands 4, 3, 2' },
                { id: 'cir', label: 'Color Infrared (CIR)', desc: 'Bands 8, 4, 3 (Veg)' },
                { id: 'agri', label: 'Agriculture SWIR', desc: 'Bands 11, 8, 2' },
                { id: 'ndvi', label: 'NDVI Synthesis', desc: 'Sub-pixel Index' },
              ].map((band) => {
                const isSelected = bandMode === band.id;
                return (
                  <Button
                    key={band.id}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onSelectBand(band.id as SpectralBandMode)}
                    className="h-auto p-2.5 text-left flex flex-col items-start justify-start"
                  >
                    <span className="text-[11px] font-semibold">
                      {band.label}
                    </span>
                    <span className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-neutral-700' : 'text-neutral-400'}`}>
                      {band.desc}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <Button
              disabled={isProcessing}
              onClick={onProcessImage}
              className="w-full h-11 text-xs font-bold tracking-wide"
              variant="default"
            >
              <Sparkles className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Processing Neural Tiling...' : 'Run Super-Resolution (SRM)'}</span>
            </Button>
            <p className="text-[10px] text-neutral-400 font-mono text-center mt-2 flex items-center justify-center gap-1">
              <Activity className="h-3 w-3 text-white" />
              Target Latency: ~180-250ms • CUDA TensorRT FP16
            </p>
          </div>
        </div>
      </ScrollArea>

      <Sen2NeonDatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        onSelectTile={onSelectTile}
        selectedTileId={selectedTile.id}
      />
    </aside>
  );
}
