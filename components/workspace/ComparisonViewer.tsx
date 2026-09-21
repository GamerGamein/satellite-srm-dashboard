'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
  Columns2,
  Blend,
  Grid3X3,
  Eye,
  Activity,
  Layers,
  Flame,
  MousePointer,
  Crosshair,
  MapPin
} from 'lucide-react';
import {
  SatelliteTile,
  ViewMode,
  ActiveOverlay,
  ModelVariant,
  ScaleFactor
} from '@/lib/types';
import { MODEL_PRESETS } from '@/lib/presets';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ComparisonViewerProps {
  tile: SatelliteTile;
  model: ModelVariant;
  scale: ScaleFactor;
}

export default function ComparisonViewer({
  tile,
  model,
  scale,
}: ComparisonViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewer State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>('none');
  const [dissolveOpacity, setDissolveOpacity] = useState(50);

  // Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mouse Telemetry State
  const [mouseCoords, setMouseCoords] = useState<{
    lat: number;
    lon: number;
    utmEasting: string;
    utmNorthing: string;
    dnValue: number;
    normalizedX: number;
    normalizedY: number;
  }>({
    lat: (tile.bounds.north + tile.bounds.south) / 2,
    lon: (tile.bounds.east + tile.bounds.west) / 2,
    utmEasting: tile.bounds.utmEasting,
    utmNorthing: tile.bounds.utmNorthing,
    dnValue: 142,
    normalizedX: 50,
    normalizedY: 50,
  });

  const selectedModel = MODEL_PRESETS.find((m) => m.id === model) || MODEL_PRESETS[0];

  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) {
        handleSliderMove(e.clientX);
      } else if (isPanning) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    };

    const onMouseUp = () => {
      setIsDraggingSlider(false);
      setIsPanning(false);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    const onTouchEnd = () => {
      setIsDraggingSlider(false);
    };

    if (isDraggingSlider || isPanning) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDraggingSlider, isPanning, dragStart, handleSliderMove]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.35, 0.7));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPosition(50);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const normX = x / rect.width;
    const normY = y / rect.height;

    const currentLat = tile.bounds.north - normY * (tile.bounds.north - tile.bounds.south);
    const currentLon = tile.bounds.west + normX * (tile.bounds.east - tile.bounds.west);
    const simulatedDN = Math.round(110 + normX * 80 + normY * 65) % 255;

    setMouseCoords({
      lat: currentLat,
      lon: currentLon,
      utmEasting: tile.bounds.utmEasting,
      utmNorthing: tile.bounds.utmNorthing,
      dnValue: simulatedDN,
      normalizedX: Math.round(normX * 100),
      normalizedY: Math.round(normY * 100),
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden z-10">
        {/* Top Interactive Canvas Bar */}
        <div className="h-12 border-b border-white/10 bg-neutral-950/70 px-4 flex items-center justify-between gap-2 z-20 backdrop-blur-xl">
          {/* Tile Title & Model Info */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-xs font-semibold text-white truncate font-mono">
              {tile.title}
            </span>
            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] py-0 px-2 border-cyan-500/40 bg-cyan-950/40 text-cyan-200 font-mono">
              Dual-Branch ESRT ({scale})
            </Badge>
            {tile.isSen2Neon && (
              <Badge variant="outline" className="hidden lg:inline-flex text-[10px] py-0 px-2 border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono">
                SEN2NEON (10m → 2.5m)
              </Badge>
            )}
          </div>

          {/* View Mode Switcher via shadcn Tabs */}
          <Tabs
            value={viewMode}
            onValueChange={(val) => setViewMode(val as ViewMode)}
            className="h-8"
          >
            <TabsList className="h-8 bg-black border border-neutral-800 p-0.5">
              <TabsTrigger value="split" className="h-7 px-2.5 text-[11px] gap-1">
                <SlidersHorizontal className="h-3 w-3" />
                <span className="hidden md:inline">Split Slider</span>
              </TabsTrigger>
              <TabsTrigger value="side-by-side" className="h-7 px-2.5 text-[11px] gap-1">
                <Columns2 className="h-3 w-3" />
                <span className="hidden md:inline">Side-by-Side</span>
              </TabsTrigger>
              <TabsTrigger value="dissolve" className="h-7 px-2.5 text-[11px] gap-1">
                <Blend className="h-3 w-3" />
                <span className="hidden md:inline">Dissolve</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Zoom & Viewport Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>

            <span className="text-[11px] font-mono text-neutral-400 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleResetZoom}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Canvas</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main Interactive Canvas Area */}
        <div
          ref={containerRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={(e) => {
            if (e.button === 1 || e.shiftKey) {
              setIsPanning(true);
              setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            }
          }}
          className="flex-1 relative flex items-center justify-center overflow-hidden cursor-crosshair space-reticle-pattern select-none bg-transparent"
        >
          {/* TRANSFORM WRAPPER for Zoom & Pan */}
          <div
            className="relative max-w-full max-h-full aspect-square w-[750px] h-[750px] transition-transform duration-75 ease-out shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.12)] rounded-2xl overflow-hidden border border-white/20"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* VIEW MODE: SPLIT SLIDER */}
            {viewMode === 'split' && (
              <>
                {/* Layer 1: High-Res AI Output */}
                <div className="absolute inset-0 w-full h-full bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.highResImage}
                    alt="Super Resolution Output"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Layer 2: Medium-Res Input (Clipped to slider percentage) */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.lowResImage}
                    alt="Original Medium-Res"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Slider Curtain Bar & Draggable Handle in Pure Black & White */}
                <div
                  className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  {/* Glowing vertical line in pure white */}
                  <div className="w-0.5 h-full bg-gradient-to-b from-white via-neutral-200 to-white shadow-[0_0_15px_rgba(255,255,255,0.9)]" />

                  {/* Handle circle */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setIsDraggingSlider(true);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setIsDraggingSlider(true);
                    }}
                    className="absolute pointer-events-auto cursor-ew-resize flex h-9 w-9 items-center justify-center rounded-full bg-black border-2 border-white shadow-xl shadow-white/30 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <div className="flex gap-1">
                      <span className="w-0.5 h-3.5 bg-white rounded-full" />
                      <span className="w-0.5 h-3.5 bg-white rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Visual Labels on canvas */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <Badge variant="secondary" className="bg-black/85 backdrop-blur-md shadow-lg text-[11px] border border-neutral-700 text-neutral-300">
                    Original Medium-Res ({tile.gsdOriginal.split(' ')[0]})
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                  <Badge variant="default" className="bg-white text-black font-bold backdrop-blur-md shadow-lg text-[11px]">
                    AI Super-Resolved ({tile.gsdSuper.split(' ')[0]})
                  </Badge>
                </div>
              </>
            )}

            {/* VIEW MODE: SIDE BY SIDE */}
            {viewMode === 'side-by-side' && (
              <div className="absolute inset-0 grid grid-cols-2 gap-1 bg-black">
                <div className="relative overflow-hidden border-r border-neutral-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.lowResImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/80 text-[10px] border border-neutral-700 text-neutral-300">
                      Original Medium-Res
                    </Badge>
                  </div>
                </div>
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.highResImage}
                    alt="Super Resolution"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="bg-white text-black font-bold text-[10px]">
                      AI Super-Resolved ({scale})
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW MODE: DISSOLVE / CROSSFADE */}
            {viewMode === 'dissolve' && (
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.lowResImage}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.highResImage}
                  alt="AI Output"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity"
                  style={{ opacity: dissolveOpacity / 100 }}
                />
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="outline" className="bg-black/90 text-[11px] border-white text-white">
                    Crossfade Blend: {dissolveOpacity}% AI
                  </Badge>
                </div>
              </div>
            )}

            {/* OVERLAYS */}
            {/* Overlay 1: Coordinate Reticle Grid */}
            {activeOverlay === 'grid' && (
              <div className="absolute inset-0 pointer-events-none z-15">
                <svg className="w-full h-full opacity-60">
                  <defs>
                    <pattern id="reticle-grid" width="75" height="75" patternUnits="userSpaceOnUse">
                      <path d="M 75 0 L 0 0 0 75" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="3,3" />
                      <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#reticle-grid)" />
                </svg>
                <Badge variant="outline" className="absolute bottom-2 left-2 text-[9px] bg-black/90 border-neutral-700 text-neutral-300">
                  MGRS / UTM 100m GRID OVERLAY
                </Badge>
              </div>
            )}

            {/* Overlay 2: Spectral Edges */}
            {activeOverlay === 'edges' && (
              <div className="absolute inset-0 pointer-events-none z-15 mix-blend-screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.edgesImage}
                  alt="Edges Overlay"
                  className="w-full h-full object-cover filter contrast-150 grayscale"
                />
              </div>
            )}

            {/* Overlay 3: Land Cover Mask */}
            {activeOverlay === 'classification' && (
              <div className="absolute inset-0 pointer-events-none z-15">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.classificationImage}
                  alt="Classification Overlay"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md p-2.5 rounded-xl border border-neutral-800 text-[10px] font-mono space-y-1 shadow-lg">
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-[#0284c7]" /> Water Bodies
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> High-Density Built-up
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-[#10b981]" /> Vegetated Canopy
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-200">
                    <span className="h-2 w-2 rounded-full bg-[#eab308]" /> Transport Road Network
                  </div>
                </div>
              </div>
            )}

            {/* Overlay 4: Error Residual Heatmap */}
            {activeOverlay === 'heatmap' && (
              <div className="absolute inset-0 pointer-events-none z-15 mix-blend-screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.errorHeatmapImage}
                  alt="Error Heatmap"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md p-2 rounded-xl border border-neutral-800 text-[10px] font-mono">
                  <span className="text-white font-bold">● High Residual Error</span>
                  <span className="text-neutral-400 ml-2">● High Confidence</span>
                </div>
              </div>
            )}
          </div>

          {/* Dissolve Slider Control floating when in dissolve mode */}
          {viewMode === 'dissolve' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/90 backdrop-blur-md border border-neutral-800 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
              <span className="text-xs font-mono text-neutral-400">Low-Res</span>
              <div className="w-40">
                <Slider
                  value={[dissolveOpacity]}
                  onValueChange={([val]) => setDissolveOpacity(val)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              <span className="text-xs font-mono text-white font-bold">AI {scale}</span>
            </div>
          )}

          {/* Quick percentage buttons for split slider */}
          {viewMode === 'split' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-1 bg-black/80 backdrop-blur-md border border-neutral-800 rounded-full p-1 text-[10px] font-mono shadow-lg">
              <Button
                variant={sliderPosition === 25 ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setSliderPosition(25)}
              >
                25%
              </Button>
              <Button
                variant={sliderPosition === 50 ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setSliderPosition(50)}
              >
                50% Split
              </Button>
              <Button
                variant={sliderPosition === 75 ? 'default' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setSliderPosition(75)}
              >
                75%
              </Button>
            </div>
          )}
        </div>

        {/* Floating Bottom Toolbar: Spectral Overlays & Telemetry */}
        <div className="border-t border-white/10 bg-neutral-950/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-xl">
          {/* Overlay toggles */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-neutral-400 mr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-white" /> Overlays:
            </span>
            <Button
              variant={activeOverlay === 'none' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-mono"
              onClick={() => setActiveOverlay('none')}
            >
              Raw
            </Button>
            <Button
              variant={activeOverlay === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-mono gap-1"
              onClick={() => setActiveOverlay(activeOverlay === 'grid' ? 'none' : 'grid')}
            >
              <Grid3X3 className="h-3 w-3" />
              Grid
            </Button>
            <Button
              variant={activeOverlay === 'edges' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-mono gap-1"
              onClick={() => setActiveOverlay(activeOverlay === 'edges' ? 'none' : 'edges')}
            >
              <Activity className="h-3 w-3" />
              Edges
            </Button>
            <Button
              variant={activeOverlay === 'classification' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-mono gap-1"
              onClick={() => setActiveOverlay(activeOverlay === 'classification' ? 'none' : 'classification')}
            >
              <Eye className="h-3 w-3" />
              Land-Cover Mask
            </Button>
            <Button
              variant={activeOverlay === 'heatmap' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs font-mono gap-1"
              onClick={() => setActiveOverlay(activeOverlay === 'heatmap' ? 'none' : 'heatmap')}
            >
              <Flame className="h-3 w-3" />
              Error Heatmap
            </Button>
          </div>

          {/* Real-time Cursor Telemetry Readout */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-1 text-white font-semibold">
              <Crosshair className="h-3.5 w-3.5" />
              <span>
                {mouseCoords.lat.toFixed(4)}° N, {mouseCoords.lon.toFixed(4)}° E
              </span>
            </div>
            <span className="text-neutral-700 hidden sm:inline">|</span>
            <span className="hidden md:inline">
              DN: <strong className="text-white">{mouseCoords.dnValue}</strong>
            </span>
            <span className="text-neutral-700 hidden md:inline">|</span>
            <span className="text-neutral-400 hidden lg:inline">
              CRS: <strong className="text-white">{tile.crs.split(' ')[0]}</strong>
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
