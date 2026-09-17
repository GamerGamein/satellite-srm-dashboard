'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlackHoleHeroSectionDemo from '@/components/ui/demo';

export default function BlackHoleDemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1">
        <BlackHoleHeroSectionDemo />
      </main>
      <Footer />
    </div>
  );
}
