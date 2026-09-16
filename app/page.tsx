'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import InteractiveEarthBackground, {
  GROUND_TARGETS,
  GroundTarget,
} from '@/components/3d/InteractiveEarthBackground';
import SpaceBackground from '@/components/ui/SpaceBackground';
import {
  Satellite,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  Compass,
  CheckCircle2,
  Award,
  Globe,
  Radio,
  BarChart3,
  MapPin,
  Maximize2
} from 'lucide-react';
import { SATELLITE_PRESETS } from '@/lib/presets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LandingPage() {
  const [heroSliderPos, setHeroSliderPos] = useState(50);
  const [activeTargetId, setActiveTargetId] = useState<string>('hyderabad');
  const [heroTeaserMode, setHeroTeaserMode] = useState<'3d-earth' | 'slider'>('3d-earth');
  const sampleTile = SATELLITE_PRESETS[0];

  const currentTarget = GROUND_TARGETS.find((t) => t.id === activeTargetId) || GROUND_TARGETS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#02040a] text-white selection:bg-cyan-400 selection:text-black relative overflow-hidden">
      <SpaceBackground interactive={false} density={350} showNebulae={true} />
      <Navbar />

      {/* HERO SECTION WITH INTERACTIVE 3D EARTH */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-neutral-900">
        {/* Living 3D Earth WebGL Background Layer */}
        <div className="absolute inset-0 z-0 opacity-40 hover:opacity-70 transition-opacity">
          <InteractiveEarthBackground
            activeTargetId={activeTargetId}
            showControls={false}
          />
        </div>

        {/* Ambient Grid pattern on top of 3D globe */}
        <div className="pointer-events-none absolute inset-0 geo-grid-pattern opacity-30" />
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full radar-sweep opacity-20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="text-center max-w-3xl mx-auto">
            {/* Telemetry status badge */}
            <div className="inline-flex items-center gap-2 mb-6 pointer-events-auto">
              <Badge variant="outline" className="px-3.5 py-1 text-xs font-mono border-neutral-700 bg-black/80 backdrop-blur-md text-white">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                </span>
                <span>SMART INDIA HACKATHON 2026 • AI GEOSPATIAL PLATFORM</span>
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight font-mono">
              Sub-Pixel Satellite Imagery{' '}
              <span className="bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
                Super-Resolution
              </span>{' '}
              &amp; Terrain Mapping
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto font-mono bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-neutral-900/60">
              Upscale medium-resolution satellite raster tiles (Sentinel-2, Cartosat, Landsat) up to <strong className="text-white">4x/8x</strong> using edge-aware neural attention transformers. Reconstruct sharp building footprints and road vectors with zero affine georeferencing distortion.
            </p>

            {/* Action Buttons via shadcn */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 pointer-events-auto">
              <Link href="/workspace">
                <Button size="lg" className="w-full sm:w-auto font-bold gap-2 text-sm h-12 px-6 bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10">
                  <Compass className="h-4 w-4" />
                  <span>Launch Interactive Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/benchmarks">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold gap-2 text-sm h-12 px-6 border-neutral-800 bg-black/80 backdrop-blur-md text-white hover:bg-neutral-900">
                  <span>View Hackathon Benchmarks</span>
                  <TrendingUp className="h-4 w-4 text-white" />
                </Button>
              </Link>
            </div>

            {/* 3D GLOBE INTERACTIVE LOCATION CHIPS */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 pointer-events-auto">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-white animate-pulse" />
                <span>ROTATE 3D GLOBE:</span>
              </span>
              {GROUND_TARGETS.map((target) => {
                const isSelected = activeTargetId === target.id;
                return (
                  <button
                    key={target.id}
                    onClick={() => setActiveTargetId(target.id)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-white text-black border-white font-bold shadow-md shadow-white/20 scale-105'
                        : 'bg-black/80 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white backdrop-blur-sm'
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    <span>{target.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Mini metrics ticker using shadcn Cards */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pointer-events-auto">
              <Card className="p-3.5 bg-neutral-950/80 backdrop-blur-md border-neutral-800">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">GSD Enhancement</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">10m → 2.5m</div>
                <div className="text-[10px] text-neutral-500 font-mono">4x Pixel Density</div>
              </Card>
              <Card className="p-3.5 bg-neutral-950/80 backdrop-blur-md border-neutral-800">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">PSNR Peak Boost</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">+7.52 dB</div>
                <div className="text-[10px] text-neutral-500 font-mono">vs Bicubic Baseline</div>
              </Card>
              <Card className="p-3.5 bg-neutral-950/80 backdrop-blur-md border-neutral-800">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">Inference Speed</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">184 ms</div>
                <div className="text-[10px] text-neutral-500 font-mono">TensorRT FP16</div>
              </Card>
              <Card className="p-3.5 bg-neutral-950/80 backdrop-blur-md border-neutral-800">
                <div className="text-[10px] font-mono text-neutral-400 uppercase">CRS Preservation</div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">100%</div>
                <div className="text-[10px] text-neutral-500 font-mono">OGC GeoTIFF Spec</div>
              </Card>
            </div>
          </div>

          {/* DUAL-MODE INTERACTIVE HERO TEASER */}
          <div className="mt-12 max-w-4xl mx-auto pointer-events-auto">
            <Card className="border-neutral-800 bg-neutral-950/95 backdrop-blur-md p-2 shadow-2xl shadow-white/5">
              {/* Header with Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-neutral-800 text-xs font-mono gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex bg-black border border-neutral-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setHeroTeaserMode('3d-earth')}
                      className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                        heroTeaserMode === '3d-earth'
                          ? 'bg-white text-black font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>3D EARTH ORBIT</span>
                    </button>
                    <button
                      onClick={() => setHeroTeaserMode('slider')}
                      className={`px-3 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                        heroTeaserMode === 'slider'
                          ? 'bg-white text-black font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>4x SPLIT SLIDER</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">
                    {heroTeaserMode === '3d-earth'
                      ? 'DRAG GLOBE TO ROTATE IN 3D'
                      : 'DRAG DIVIDER TO COMPARE 4x'}
                  </span>
                  <Badge variant="outline" className="text-[10px] border-neutral-700 text-white font-bold">
                    INTERACTIVE
                  </Badge>
                </div>
              </div>

              {/* Mode 1: Full Interactive 3D Earth Mission Control */}
              {heroTeaserMode === '3d-earth' && (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-xl bg-black mt-2 border border-neutral-800">
                  <InteractiveEarthBackground
                    activeTargetId={activeTargetId}
                    onSelectTarget={(target) => setActiveTargetId(target.id)}
                    showControls={true}
                  />
                </div>
              )}

              {/* Mode 2: 4x Super-Resolution Split-Screen Slider */}
              {heroTeaserMode === 'slider' && (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-xl bg-black mt-2 select-none border border-neutral-800">
                  {/* High-res background */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sampleTile.highResImage}
                    alt="High Res Satellite"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Low-res clipped layer */}
                  <div
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - heroSliderPos}% 0 0)` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sampleTile.lowResImage}
                      alt="Low Res Satellite"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Slider divider line and draggable bar in White */}
                  <div
                    className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
                    style={{ left: `${heroSliderPos}%` }}
                  >
                    <div className="w-0.5 h-full bg-gradient-to-b from-white via-neutral-200 to-white shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
                    <div className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-black border-2 border-white shadow-xl shadow-white/30">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>

                  {/* Range input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={heroSliderPos}
                    onChange={(e) => setHeroSliderPos(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  />

                  {/* Overlaid Badges */}
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <Badge variant="secondary" className="bg-black/85 border border-neutral-700 text-neutral-300 text-[10px]">
                      Original Medium-Res (10m)
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <Badge variant="default" className="bg-white text-black font-bold text-[10px]">
                      AI Super-Resolved (4x, 2.5m)
                    </Badge>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* KEY CAPABILITIES SECTION */}
      <section className="py-20 bg-black border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-2 text-xs border-neutral-700 text-white">
              HIGH-PRECISION NEURAL CARTOGRAPHY
            </Badge>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-mono">
              Engineered for Critical Geospatial Missions
            </h2>
            <p className="mt-4 text-sm text-neutral-400 font-mono">
              Bridging the gap between free public satellite constellations and high-cost commercial aerial orthophotos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-neutral-950 border-neutral-800 hover:border-neutral-600 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white border border-neutral-700 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-white mb-2 font-mono">
                Dual-Branch Edge-Aware Architecture
              </CardTitle>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Separates low-frequency radiometric topography from high-frequency building contours. A specialized Canny edge gradient loss branch prevents blurry roof outlines and distorted road vectors.
              </p>
            </Card>

            <Card className="p-6 bg-neutral-950 border-neutral-800 hover:border-neutral-600 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white border border-neutral-700 mb-4">
                <Globe className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-white mb-2 font-mono">
                Zero Geo-Distortion Pipeline
              </CardTitle>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Recalculates affine transformations (GDAL GeoTransform matrix) to align the upscaled pixels exactly with real Earth coordinates (WGS 84, UTM, and Indian Regional CRS).
              </p>
            </Card>

            <Card className="p-6 bg-neutral-950 border-neutral-800 hover:border-neutral-600 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white border border-neutral-700 mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-white mb-2 font-mono">
                Multi-Spectral Band Synthesis
              </CardTitle>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Not limited to standard RGB: preserves NIR (Near Infrared), Red-Edge, and SWIR channels. Enables sub-pixel NDVI computation and automated land-cover classification.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* PIPELINE ARCHITECTURE SECTION */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-2 text-xs border-neutral-700 text-white">
              INFERENCE WORKFLOW
            </Badge>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white font-mono">
              End-to-End Deep Learning SRM Flow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <Card className="p-5 bg-black border-neutral-800">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-white">STAGE 01</Badge>
              <div className="font-bold text-white text-sm mb-2">Tile Decomposition</div>
              <p className="text-neutral-400 font-sans text-xs">
                Splits large multi-gigabyte GeoTIFF rasters into 512x512 patches with 32px boundary overlap to prevent seam artifacts.
              </p>
            </Card>

            <Card className="p-5 bg-black border-neutral-800">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-white">STAGE 02</Badge>
              <div className="font-bold text-white text-sm mb-2">Channel Attention</div>
              <p className="text-neutral-400 font-sans text-xs">
                RCAN and ESRT backbones dynamically re-weight spectral interdependencies across RGB, NIR, and SWIR bands.
              </p>
            </Card>

            <Card className="p-5 bg-black border-neutral-800">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-white">STAGE 03</Badge>
              <div className="font-bold text-white text-sm mb-2">Sub-Pixel PixelShuffle</div>
              <p className="text-neutral-400 font-sans text-xs">
                Rearranges multi-channel latent feature maps into 4x/8x high-resolution spatial dimensions without interpolation blur.
              </p>
            </Card>

            <Card className="p-5 bg-black border-neutral-800">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-white">STAGE 04</Badge>
              <div className="font-bold text-white text-sm mb-2">OGC Geo-Referencing</div>
              <p className="text-neutral-400 font-sans text-xs">
                Reconstructs full Cloud-Optimized GeoTIFF (COG) with updated pixel scale and boundary projection headers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 bg-black">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono">
            Ready to Evaluate the Super-Resolution Engine?
          </h2>
          <p className="mt-3 text-sm text-neutral-400 max-w-xl mx-auto font-mono">
            Test pre-loaded Sentinel-2, Cartosat, and Landsat scenes, drag the interactive split slider, and inspect objective PSNR/SSIM metrics.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/workspace">
              <Button size="lg" className="font-bold gap-2 text-sm px-6 bg-white text-black hover:bg-neutral-200">
                <Compass className="h-4 w-4" />
                <span>Enter Workspace Now</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
