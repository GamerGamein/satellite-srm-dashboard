'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Sparkles, Layers, ShieldCheck, X } from 'lucide-react';
import { ModelVariant, ScaleFactor } from '@/lib/types';
import { MODEL_PRESETS } from '@/lib/presets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProcessingModalProps {
  isOpen: boolean;
  model: ModelVariant;
  scale: ScaleFactor;
  onComplete: () => void;
  onCancel: () => void;
}

const PIPELINE_STAGES = [
  { name: 'Raster Tiling & Radiometric Normalization (512x512 with 32px overlap)', duration: 400 },
  { name: 'Multispectral Band Alignment & CUDA Tensor Allocation (FP16)', duration: 600 },
  { name: 'Deep Latent Feature Extraction & Edge Branch Processing', duration: 700 },
  { name: 'Sub-Pixel Convolutional Upsampling (PixelShuffle 4x/8x)', duration: 500 },
  { name: 'Georeferencing Affine Matrix Update & Cloud-Optimized GeoTIFF Packaging', duration: 400 },
];

export default function ProcessingModal({
  isOpen,
  model,
  scale,
  onComplete,
  onCancel,
}: ProcessingModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const selectedModel = MODEL_PRESETS.find((m) => m.id === model) || MODEL_PRESETS[0];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    let currentStep = 0;
    const totalDuration = PIPELINE_STAGES.reduce((acc, curr) => acc + curr.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);

      let accumulated = 0;
      for (let i = 0; i < PIPELINE_STAGES.length; i++) {
        accumulated += PIPELINE_STAGES[i].duration;
        if (elapsed <= accumulated) {
          currentStep = i;
          break;
        }
      }
      setCurrentStage(currentStep);

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="border-white/10 bg-neutral-950/95 shadow-2xl shadow-cyan-500/10 max-w-lg backdrop-blur-2xl">
        <DialogHeader className="pb-3 border-b border-white/10 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-cyan-300 border border-cyan-500/30 shadow-inner">
              <Cpu className="h-5 w-5 animate-pulse text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white font-mono flex items-center gap-2">
                Running Dual-Branch SRM
                <Badge variant="default" className="text-[10px] py-0 px-1.5 bg-cyan-400 text-black font-bold">
                  {scale}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-400 font-mono mt-0.5">
                Dual-Branch Edge-Aware ESRT • Deep TensorRT Pipeline
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Animated Progress Bar */}
        <div className="py-2 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-white font-semibold">INFERENCE PROGRESS</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5 bg-neutral-900 border border-neutral-800" />
        </div>

        {/* Pipeline Stages checklist */}
        <div className="space-y-2 pb-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isFinished = idx < currentStage || progress === 100;
            const isCurrent = idx === currentStage && progress < 100;

            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 rounded-xl p-2.5 text-xs transition-colors border ${
                  isCurrent
                    ? 'bg-neutral-900 border-white text-white shadow-sm'
                    : isFinished
                    ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                    : 'border-transparent text-neutral-600 opacity-60'
                }`}
              >
                {isFinished ? (
                  <CheckCircle2 className="h-4 w-4 text-white shrink-0 mt-0.5" />
                ) : isCurrent ? (
                  <div className="h-4 w-4 shrink-0 mt-0.5">
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-white"></span>
                    </span>
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border border-neutral-700 shrink-0 mt-0.5" />
                )}
                <span className="font-mono text-[11px] leading-relaxed">{stage.name}</span>
              </div>
            );
          })}
        </div>

        {/* Footer telemetry */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>GEO-TRANSFORM PRESERVED</span>
          </div>
          <span className="text-white font-bold">CUDA FP16</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
