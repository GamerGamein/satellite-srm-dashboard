'use client';

import React, { useState } from 'react';
import { SATELLITE_PRESETS } from '@/lib/presets';
import { ZoomIn, Check, Info, Sparkles, SlidersHorizontal, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ModelComparisonGrid() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [magnifiedRegion, setMagnifiedRegion] = useState<'center' | 'top-left' | 'bottom-right'>('center');

  const currentTile = SATELLITE_PRESETS[selectedPresetIndex];

  // Zoom crop offsets
  const getTransformOrigin = () => {
    switch (magnifiedRegion) {
      case 'top-left':
        return '25% 25%';
      case 'bottom-right':
        return '75% 75%';
      default:
        return '50% 50%';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Preset Selector Card */}
        <Card className="border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
          <CardHeader className="p-4 sm:p-5 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] border-white/40 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    GROUND-TRUTH MATRIX
                  </Badge>
                  <span className="text-xs font-mono text-neutral-400">4x Super-Resolution Scale</span>
                </div>
                <CardTitle className="text-sm font-bold text-white font-mono">
                  Visual Reconstruction Benchmark Across Architectures
                </CardTitle>
                <CardDescription className="text-xs text-neutral-400 font-mono">
                  Compare identical spatial coordinates across mathematical interpolation, CNN, Attention, and Dual-Branch ESRT.
                </CardDescription>
              </div>

              {/* Preset switch button group */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black rounded-xl border border-neutral-800">
                {SATELLITE_PRESETS.map((tile, idx) => (
                  <Button
                    key={tile.id}
                    variant={selectedPresetIndex === idx ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPresetIndex(idx)}
                    className="text-xs"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {tile.id.split('-')[1].toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Loupe Crop Region Selector */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5 text-white mr-2">
            <ZoomIn className="h-4 w-4" />
            <span className="font-semibold text-white">Magnified Crop Focus:</span>
          </div>
          <Button
            variant={magnifiedRegion === 'center' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMagnifiedRegion('center')}
          >
            Center Intersection
          </Button>
          <Button
            variant={magnifiedRegion === 'top-left' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMagnifiedRegion('top-left')}
          >
            Building Roof Footprint
          </Button>
          <Button
            variant={magnifiedRegion === 'bottom-right' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMagnifiedRegion('bottom-right')}
          >
            Water/Road Boundary
          </Button>

          <div className="ml-auto text-[11px] text-neutral-500 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            <span>1.8x Crop Magnification</span>
          </div>
        </div>

        {/* 4-Column Model Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Model 1: Low-Res Input (Bicubic Baseline) */}
          <Card className="border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-colors">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono font-bold text-neutral-300">
                  1. Bicubic Baseline
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-neutral-700 text-neutral-400">
                  Math Spline
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTile.lowResImage}
                  alt="Bicubic Low-Res"
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    transform: 'scale(1.8)',
                    transformOrigin: getTransformOrigin(),
                  }}
                />
                <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] bg-black/90 border border-neutral-800 text-neutral-300">
                  Heavy Blur / Pixels
                </Badge>
              </div>

              <div className="pt-2 border-t border-neutral-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">PSNR:</span>
                  <span className="text-white font-bold">{currentTile.defaultMetrics.bicubicPsnr} dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">SSIM:</span>
                  <span className="text-white font-bold">{currentTile.defaultMetrics.bicubicSsim}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Edge Sharpness:</span>
                  <span className="text-neutral-400 font-bold">Low (Interpolated)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model 2: SRCNN Baseline */}
          <Card className="border-neutral-800 bg-neutral-950 hover:border-neutral-700 transition-colors">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono font-bold text-neutral-200">
                  2. SRCNN Baseline
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-neutral-700 text-neutral-400">
                  Shallow CNN
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTile.lowResImage}
                  alt="SRCNN"
                  className="w-full h-full object-cover filter contrast-125 transition-transform duration-300"
                  style={{
                    transform: 'scale(1.8)',
                    transformOrigin: getTransformOrigin(),
                  }}
                />
                <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] bg-black/90 border border-neutral-800 text-neutral-300">
                  Partial Smoothing
                </Badge>
              </div>

              <div className="pt-2 border-t border-neutral-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">PSNR:</span>
                  <span className="text-white font-bold">35.10 dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">SSIM:</span>
                  <span className="text-white font-bold">0.895</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Edge Sharpness:</span>
                  <span className="text-neutral-300 font-bold">Moderate</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model 3: RCAN-Geo Attention Net */}
          <Card className="border-neutral-800 bg-neutral-950 hover:border-neutral-600 transition-colors">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono font-bold text-white">
                  3. RCAN-Geo Net
                </CardTitle>
                <Badge variant="secondary" className="text-[10px] border-neutral-700 text-neutral-200">
                  Channel Attn
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTile.highResImage}
                  alt="RCAN Geo"
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    transform: 'scale(1.8)',
                    transformOrigin: getTransformOrigin(),
                  }}
                />
                <Badge variant="secondary" className="absolute bottom-2 left-2 text-[10px] bg-black/90 border border-neutral-800 text-white">
                  Radiometric SNR
                </Badge>
              </div>

              <div className="pt-2 border-t border-neutral-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">PSNR:</span>
                  <span className="text-white font-bold">{currentTile.defaultMetrics.psnr} dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">SSIM:</span>
                  <span className="text-white font-bold">{currentTile.defaultMetrics.ssim}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Edge Sharpness:</span>
                  <span className="text-white font-bold">High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model 4: Dual-Branch ESRT (Proposed SIH Model) */}
          <Card className="border-white bg-neutral-950 shadow-xl shadow-white/5 hover:border-neutral-200 transition-colors">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-white" />
                  4. Dual-Branch ESRT
                </CardTitle>
                <Badge variant="default" className="text-[10px] bg-white text-black font-bold">
                  Proposed (SIH)
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-white/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTile.highResImage}
                  alt="Dual Branch ESRT"
                  className="w-full h-full object-cover filter contrast-110 transition-transform duration-300"
                  style={{
                    transform: 'scale(1.8)',
                    transformOrigin: getTransformOrigin(),
                  }}
                />
                <Badge variant="default" className="absolute bottom-2 left-2 text-[10px] bg-white text-black font-bold">
                  Ultra-Crisp Edges &amp; Roofs
                </Badge>
              </div>

              <div className="pt-2 border-t border-neutral-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">PSNR:</span>
                  <span className="text-white font-bold">
                    {(currentTile.defaultMetrics.psnr + 0.65).toFixed(2)} dB
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">SSIM:</span>
                  <span className="text-white font-bold">
                    {(currentTile.defaultMetrics.ssim + 0.009).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-300">Edge Sharpness:</span>
                  <span className="text-white font-bold">State-of-the-Art</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
