'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EarthHeroSection from '@/components/ui/earth-hero-section';
import { GROUND_TARGETS } from '@/components/3d/InteractiveEarthBackground';
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

/** True while viewport is narrow (< 768px). Drives responsive layout swap. */
function useNarrow(query = '(max-width: 767px)') {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener('change', sync);
    return () => m.removeEventListener('change', sync);
  }, [query]);
  return narrow;
}

export default function LandingPage() {
  const narrow = useNarrow();
  const [heroSliderPos, setHeroSliderPos] = useState(50);
  const [activeTargetId, setActiveTargetId] = useState<string>('hyderabad');
  const sampleTile = SATELLITE_PRESETS[0];

  const currentTarget = GROUND_TARGETS.find((t) => t.id === activeTargetId) || GROUND_TARGETS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#02040a] text-white selection:bg-cyan-400 selection:text-black relative overflow-hidden">
      <SpaceBackground interactive={false} density={250} showNebulae={true} />
      <Navbar />

      {/* FULL-BLEED CINEMATIC EARTH HERO SECTION (BLACKHOLE PAGE AESTHETICS WITH 3D EARTH) */}
      <section className="relative min-h-[92svh] w-full border-b border-neutral-900 md:min-h-[760px]">
        <EarthHeroSection
          focus={narrow ? [0.5, 0.78] : [0.72, 0.46]}
          scrim={narrow ? 'top' : 'left'}
          scrimStrength={narrow ? 0.95 : 0.88}
          activeTargetId={activeTargetId}
          onSelectTarget={(target) => setActiveTargetId(target.id)}
          enableZoom={false}
        >
          <div className="flex h-full min-h-[92svh] items-start px-6 pt-12 sm:px-10 md:min-h-[760px] md:items-center md:pt-0 lg:px-20 pointer-events-none">
            <div className="max-w-[40rem] pointer-events-none">
              {/* Mission telemetry status badge */}
              <div className="inline-flex items-center gap-2 mb-6 pointer-events-auto">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                </span>
                <span className="font-mono text-xs text-cyan-300 tracking-wider font-semibold">
                  SMART INDIA HACKATHON 2026 • AI GEOSPATIAL PLATFORM
                </span>
              </div>

              {/* Minimalist Cinematic Headline */}
              <h1 className="text-[2.65rem] font-light leading-[1.04] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.25rem]">
                Every meter of Earth,
                <br />
                <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-sky-400">
                  resolved from orbit
                </span>
              </h1>

              {/* Elegant Sub-headline */}
              <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-white/70 md:mt-7 font-sans">
                Neural sub-pixel super-resolution for Sentinel-2, Cartosat, and Landsat raster tiles. Upscale medium-resolution satellite imagery up to <strong className="text-white font-medium">4x/8x</strong> with dual-branch edge-aware attention and zero affine georeferencing distortion.
              </p>

              {/* Pill-shaped action buttons from Blackhole design */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5 md:mt-10 pointer-events-auto">
                <Link
                  href="/workspace"
                  className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200 shadow-xl shadow-white/10 flex items-center gap-2"
                >
                  <Compass className="h-4 w-4" />
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/benchmarks"
                  className="rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-6 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/50 hover:text-white flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span>View Benchmarks</span>
                </Link>
              </div>

              {/* Interactive 3D Earth Location Chips */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-2.5 pointer-events-auto">
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  <Globe className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <span>ROTATE 3D GLOBE TO TARGET:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {GROUND_TARGETS.map((target) => {
                    const isSelected = activeTargetId === target.id;
                    return (
                      <button
                        key={target.id}
                        onClick={() => setActiveTargetId(target.id)}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-cyan-400 text-black border-cyan-300 font-bold shadow-md shadow-cyan-500/25 scale-105'
                            : 'bg-black/60 text-neutral-300 border-white/10 hover:border-cyan-400/50 hover:text-white backdrop-blur-sm'
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                        <span>{target.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Telemetry Metrics Ticker */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl">
                <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-2.5">
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">GSD BOOST</div>
                  <div className="text-base font-bold font-mono text-white">10m → 2.5m</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-2.5">
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">PSNR GAIN</div>
                  <div className="text-base font-bold font-mono text-cyan-400">+7.52 dB</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-2.5">
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">LATENCY</div>
                  <div className="text-base font-bold font-mono text-white">184 ms</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-2.5">
                  <div className="text-[9px] font-mono text-neutral-400 uppercase">CRS ALIGN</div>
                  <div className="text-base font-bold font-mono text-white">100%</div>
                </div>
              </div>
            </div>
          </div>
        </EarthHeroSection>
      </section>

      {/* INTERACTIVE 4x SUPER-RESOLUTION SPLIT COMPARISON */}
      <section className="py-20 bg-neutral-950/60 border-b border-neutral-900 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="mb-2 text-xs border-neutral-700 text-white font-mono">
              INTERACTIVE INFERENCE TEASER
            </Badge>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-mono">
              Real-Time 4x Resolution Comparison
            </h2>
            <p className="mt-3 text-sm text-neutral-400 font-mono">
              Drag the interactive slider below to inspect sub-pixel roof contours and road vectors against raw 10m Sentinel-2 raster inputs.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-neutral-800 bg-neutral-950/95 backdrop-blur-md p-3 shadow-2xl shadow-cyan-500/5">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden rounded-xl bg-black select-none border border-neutral-800">
                {/* High-res AI upscaled background */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sampleTile.highResImage}
                  alt="AI Super-Resolved High Res Satellite"
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
                    alt="Original Low Res Satellite"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                {/* Slider divider line and draggable handle */}
                <div
                  className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
                  style={{ left: `${heroSliderPos}%` }}
                >
                  <div className="w-0.5 h-full bg-gradient-to-b from-cyan-300 via-white to-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.9)]" />
                  <div className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-black border-2 border-cyan-400 shadow-xl shadow-cyan-500/40">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-cyan-300" />
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
                  aria-label="Compare Super-Resolution Slider"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  <Badge variant="secondary" className="bg-black/85 border border-neutral-700 text-neutral-300 text-[10px] font-mono">
                    Original Medium-Res (10m GSD)
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 pointer-events-none">
                  <Badge variant="default" className="bg-cyan-400 text-black font-bold text-[10px] font-mono shadow-md shadow-cyan-500/30">
                    AI Super-Resolved (4x, 2.5m GSD)
                  </Badge>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between px-2 text-xs font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Scene: {currentTarget.name}</span>
                </span>
                <span className="text-neutral-500">Drag divider left/right to compare</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* KEY CAPABILITIES SECTION */}
      <section className="py-20 bg-black border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="mb-2 text-xs border-neutral-700 text-cyan-300 font-mono">
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
            <Card className="p-6 bg-neutral-950 border-neutral-800 hover:border-cyan-500/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-cyan-400 border border-neutral-700 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-white mb-2 font-mono">
                Dual-Branch Edge-Aware Architecture
              </CardTitle>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Separates low-frequency radiometric topography from high-frequency building contours. A specialized Canny edge gradient loss branch prevents blurry roof outlines and distorted road vectors.
              </p>
            </Card>

            <Card className="p-6 bg-neutral-950 border-neutral-800 hover:border-cyan-500/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-cyan-400 border border-neutral-700 mb-4">
                <Globe className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg font-bold text-white mb-2 font-mono">
                Zero Geo-Distortion Pipeline
              </CardTitle>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Recalculates affine transformations (GDAL GeoTransform matrix) to align the upscaled pixels exactly with real Earth coordinates (WGS 84, UTM, and Indian Regional CRS).
              </p>
            </Card>

            <Card className="p-6 bg-neutral-950 border-neutral-800 hover:border-cyan-500/50 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-cyan-400 border border-neutral-700 mb-4">
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
            <Badge variant="outline" className="mb-2 text-xs border-neutral-700 text-cyan-300 font-mono">
              INFERENCE WORKFLOW
            </Badge>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white font-mono">
              End-to-End Deep Learning SRM Flow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <Card className="p-5 bg-black border-neutral-800 hover:border-neutral-700 transition-colors">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-cyan-400">STAGE 01</Badge>
              <div className="font-bold text-white text-sm mb-2">Tile Decomposition</div>
              <p className="text-neutral-400 font-sans text-xs">
                Splits large multi-gigabyte GeoTIFF rasters into 512x512 patches with 32px boundary overlap to prevent seam artifacts.
              </p>
            </Card>

            <Card className="p-5 bg-black border-neutral-800 hover:border-neutral-700 transition-colors">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-cyan-400">STAGE 02</Badge>
              <div className="font-bold text-white text-sm mb-2">Channel Attention</div>
              <p className="text-neutral-400 font-sans text-xs">
                RCAN and ESRT backbones dynamically re-weight spectral interdependencies across RGB, NIR, and SWIR bands.
              </p>
            </Card>

            <Card className="p-5 bg-black border-neutral-800 hover:border-neutral-700 transition-colors">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-cyan-400">STAGE 03</Badge>
              <div className="font-bold text-white text-sm mb-2">Sub-Pixel PixelShuffle</div>
              <p className="text-neutral-400 font-sans text-xs">
                Rearranges multi-channel latent feature maps into 4x/8x high-resolution spatial dimensions without interpolation blur.
              </p>
            </Card>

            <Card className="p-5 bg-black border-neutral-800 hover:border-neutral-700 transition-colors">
              <Badge variant="outline" className="text-[10px] mb-2 border-neutral-700 text-cyan-400">STAGE 04</Badge>
              <div className="font-bold text-white text-sm mb-2">OGC Geo-Referencing</div>
              <p className="text-neutral-400 font-sans text-xs">
                Reconstructs full Cloud-Optimized GeoTIFF (COG) with updated pixel scale and boundary projection headers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-black">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-mono">
            Ready to Evaluate the Super-Resolution Engine?
          </h2>
          <p className="mt-4 text-sm text-neutral-400 max-w-xl mx-auto font-mono">
            Test pre-loaded Sentinel-2, Cartosat, and Landsat scenes, drag the interactive split slider, and inspect objective PSNR/SSIM metrics.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/workspace">
              <Button size="lg" className="font-bold gap-2 text-sm px-7 py-3 rounded-full bg-white text-black hover:bg-neutral-200 shadow-xl shadow-white/10">
                <Compass className="h-4 w-4" />
                <span>Enter Workspace Now</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
