'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Satellite, Compass, BarChart3, Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/65 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 border border-white/10 p-0.5 shadow-lg shadow-cyan-500/10 group-hover:border-cyan-400 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-black">
                <Satellite className="h-5 w-5 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white sm:text-lg font-mono">
                  Geo<span className="text-cyan-400">SR</span>
                </span>
                <Badge variant="default" className="text-[10px] py-0 px-1.5 font-bold bg-cyan-400 text-black">
                  AI-SRM v2.4
                </Badge>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
                Sub-Pixel Satellite Super-Resolution
              </p>
            </div>
          </Link>
        </div>

        {/* Live Telemetry Status Pill */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-neutral-950/70 px-3.5 py-1 text-xs text-neutral-300 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="font-mono text-[11px] text-white font-semibold">ORBITAL LINK: ONLINE</span>
          <span className="text-neutral-600">|</span>
          <Radio className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono text-[11px] text-neutral-400">ISRO &amp; SENTINEL READY</span>
        </div>

        {/* Navigation & CTA Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-2 font-mono">
            <Link href="/">
              <Button
                variant={pathname === '/' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
              >
                Overview
              </Button>
            </Link>
            <Link href="/workspace">
              <Button
                variant={pathname === '/workspace' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs gap-1.5"
              >
                <Compass className="h-3.5 w-3.5" />
                Workspace
              </Button>
            </Link>
            <Link href="/benchmarks">
              <Button
                variant={pathname === '/benchmarks' ? 'default' : 'ghost'}
                size="sm"
                className="text-xs gap-1.5"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Benchmarks
              </Button>
            </Link>
          </nav>

          <Link href="/workspace">
            <Button
              variant="default"
              size="sm"
              className="font-bold gap-1.5 shadow-md shadow-white/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Launch Workspace</span>
              <span className="sm:hidden">Launch</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
