import React from 'react';
import Link from 'next/link';
import { Satellite, Award, Cpu, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-black text-neutral-400 py-10 font-mono">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-neutral-900">
          {/* Col 1: Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white border border-neutral-700">
                <Satellite className="h-4 w-4" />
              </div>
              <span className="font-bold text-white tracking-tight">GeoSR: Deep Learning SRM Platform</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md leading-relaxed font-sans">
              Developed for the Smart India Hackathon (SIH). An enterprise-grade AI super-resolution and sub-pixel land-cover mapping engine engineered to upscale medium-resolution satellite raster tiles (Sentinel-2, Cartosat, Landsat) up to 4x/8x while strictly preserving affine georeferencing and spectral integrity.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="text-[10px] border-neutral-700 text-white">
                <Award className="h-3 w-3 mr-1 text-white" /> Smart India Hackathon
              </Badge>
              <Badge variant="outline" className="text-[10px] border-neutral-700 text-white">
                <Cpu className="h-3 w-3 mr-1 text-white" /> PyTorch &amp; TensorRT
              </Badge>
              <Badge variant="outline" className="text-[10px] border-neutral-700 text-white">
                <ShieldCheck className="h-3 w-3 mr-1 text-white" /> OGC GeoTIFF Spec
              </Badge>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Mission Overview</Link>
              </li>
              <li>
                <Link href="/workspace" className="hover:text-white transition-colors">Interactive Workspace</Link>
              </li>
              <li>
                <Link href="/benchmarks" className="hover:text-white transition-colors">Model Evaluation &amp; Benchmarks</Link>
              </li>
              <li>
                <span className="text-neutral-600 cursor-not-allowed">API &amp; Python SDK (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Specifications */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-3">Geospatial Standards</h4>
            <ul className="space-y-1.5 text-xs text-neutral-500 font-mono">
              <li>CRS: EPSG:4326 / EPSG:32643</li>
              <li>Radiometric: 16-Bit Multispectral</li>
              <li>Models: RCAN, Dual-Branch ESRT</li>
              <li>Inference Target: &lt; 250ms / Tile</li>
              <li>Tiling Engine: 512x512 Overlap</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 font-sans">
          <p>© 2026 GeoSR Team. Built for Smart India Hackathon. Compatible with ISRO Bhuvan &amp; Copernicus Data Hub.</p>
          <div className="flex gap-4">
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
