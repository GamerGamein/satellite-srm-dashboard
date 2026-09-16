'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ControlPanel from '@/components/workspace/ControlPanel';
import ComparisonViewer from '@/components/workspace/ComparisonViewer';
import AnalyticsPanel from '@/components/workspace/AnalyticsPanel';
import ProcessingModal from '@/components/workspace/ProcessingModal';
import SpaceBackground from '@/components/ui/SpaceBackground';
import { SATELLITE_PRESETS } from '@/lib/presets';
import { SatelliteTile, ModelVariant, ScaleFactor, SpectralBandMode } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WorkspacePage() {
  const [selectedTile, setSelectedTile] = useState<SatelliteTile>(SATELLITE_PRESETS[0]);
  const [selectedModel, setSelectedModel] = useState<ModelVariant>('dual-branch-esrt');
  const [scaleFactor, setScaleFactor] = useState<ScaleFactor>('4x');
  const [bandMode, setBandMode] = useState<SpectralBandMode>('rgb');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleStartProcessing = () => {
    setIsProcessing(true);
  };

  const handleCompleteProcessing = () => {
    setIsProcessing(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleCancelProcessing = () => {
    setIsProcessing(false);
  };

  const handleCustomUpload = (newTile: SatelliteTile) => {
    setSelectedTile(newTile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#02040a] text-white selection:bg-cyan-400 selection:text-black relative overflow-hidden">
      {/* Living Cosmic Space Background with procedural stars, twinkling, 3D parallax, and nebulae */}
      <SpaceBackground interactive={true} density={500} showNebulae={true} />

      <Navbar />

      {/* Main Workspace Layout: 3 Columns (Controls, Canvas, Analytics) */}
      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] min-h-[700px] overflow-hidden relative z-10">
        {/* Left Column: Control Panel */}
        <ControlPanel
          selectedTile={selectedTile}
          onSelectTile={setSelectedTile}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          scaleFactor={scaleFactor}
          onSelectScale={setScaleFactor}
          bandMode={bandMode}
          onSelectBand={setBandMode}
          onProcessImage={handleStartProcessing}
          isProcessing={isProcessing}
          onUploadCustomTile={handleCustomUpload}
        />

        {/* Center Column: Interactive Canvas & Comparison Viewer */}
        <ComparisonViewer
          tile={selectedTile}
          model={selectedModel}
          scale={scaleFactor}
        />

        {/* Right Column: Analytics & Geospatial Metadata */}
        <AnalyticsPanel
          tile={selectedTile}
          model={selectedModel}
          scale={scaleFactor}
        />
      </main>

      {/* Multi-stage AI Pipeline Modal */}
      <ProcessingModal
        isOpen={isProcessing}
        model={selectedModel}
        scale={scaleFactor}
        onComplete={handleCompleteProcessing}
        onCancel={handleCancelProcessing}
      />

      {/* Success Notification Toast with cosmic styling */}
      {showToast && (
        <Card className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-black/90 border-cyan-400/80 p-4 shadow-2xl shadow-cyan-500/20 text-white animate-bounce backdrop-blur-xl">
          <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-[10px] py-0 px-1.5 font-bold bg-cyan-400 text-black">
                DUAL-BRANCH SRM COMPLETE
              </Badge>
            </div>
            <p className="text-[11px] text-neutral-300 font-mono mt-1">
              Raster tile upscaled via Dual-Branch ESRT with georeferencing matrix preserved.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
