'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number; // depth for parallax
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  hasSpikes?: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  speed: number;
  opacity: number;
  trail: { x: number; y: number }[];
}

const STAR_COLORS = [
  '#ffffff', // Pure white
  '#ffffff',
  '#f8fafc',
  '#93c5fd', // Cold blue
  '#bae6fd', // Sky blue
  '#a5f3fc', // Cyan tint
  '#fde68a', // Warm star
  '#e9d5ff', // Faint violet
];

export default function SpaceBackground({
  interactive = true,
  density = 450,
  showNebulae = true,
  className = '',
}: {
  interactive?: boolean;
  density?: number;
  showNebulae?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for 3D parallax
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    // Generate Stars
    const starCount = Math.floor((width * height) / 3200);
    const actualCount = Math.max(density, starCount);
    const stars: Star[] = [];

    for (let i = 0; i < actualCount; i++) {
      const z = Math.random() * 3 + 0.5; // depth between 0.5 and 3.5
      const isBright = Math.random() < 0.05;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        radius: isBright ? Math.random() * 1.6 + 1.2 : Math.random() * 0.9 + 0.3,
        baseAlpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.04 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        hasSpikes: isBright && Math.random() < 0.35,
      });
    }

    // Shooting Stars
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + Math.random() * 4000 + 2000;

    const spawnShootingStar = () => {
      const startX = Math.random() * width * 0.8;
      const startY = Math.random() * height * 0.4;
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.3; // roughly 45 degrees
      const speed = Math.random() * 9 + 11;
      shootingStars.push({
        x: startX,
        y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length: Math.random() * 80 + 70,
        speed,
        opacity: 1,
        trail: [],
      });
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      // Normalized between -1 and 1
      targetMouseX = (e.clientX / width - 0.5) * 45;
      targetMouseY = (e.clientY / height - 0.5) * 45;
    };

    window.addEventListener('resize', handleResize);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    let time = 0;

    const render = () => {
      time += 0.02;

      // Smooth camera parallax easing
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep space base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#02040a');
      bgGrad.addColorStop(0.5, '#050714');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw faint celestial coordinate lines (orbital graticules)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 12]);
      const spacing = 180;
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + (currentMouseX * 0.1), 0);
        ctx.lineTo(x + (currentMouseX * 0.1), height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + (currentMouseY * 0.1));
        ctx.lineTo(width, y + (currentMouseY * 0.1));
        ctx.stroke();
      }
      ctx.restore();

      // Draw Stars with Parallax and Twinkle
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Parallax position based on depth
        const px = star.x - (currentMouseX / star.z);
        const py = star.y - (currentMouseY / star.z);

        // Wrap around borders
        const wrappedX = ((px % width) + width) % width;
        const wrappedY = ((py % height) + height) % height;

        // Twinkle calculation
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase);
        const alpha = Math.max(0.1, Math.min(1, star.baseAlpha + twinkle * 0.35));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;

        // Draw star core
        ctx.beginPath();
        ctx.arc(wrappedX, wrappedY, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle bloom for brighter stars
        if (star.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(wrappedX, wrappedY, star.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha * 0.25;
          ctx.fill();
        }

        // Diffraction spikes for major bright stars
        if (star.hasSpikes) {
          ctx.strokeStyle = star.color;
          ctx.lineWidth = 0.6;
          ctx.globalAlpha = alpha * 0.45;
          const spikeLen = star.radius * 4.5;
          ctx.beginPath();
          ctx.moveTo(wrappedX - spikeLen, wrappedY);
          ctx.lineTo(wrappedX + spikeLen, wrappedY);
          ctx.moveTo(wrappedX, wrappedY - spikeLen);
          ctx.lineTo(wrappedX, wrappedY + spikeLen);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Check Shooting Star spawn
      const now = Date.now();
      if (now > nextShootingStarTime) {
        spawnShootingStar();
        nextShootingStarTime = now + Math.random() * 5000 + 3500;
      }

      // Update & Render Shooting Stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.trail.unshift({ x: ss.x, y: ss.y });
        if (ss.trail.length > 24) ss.trail.pop();

        ss.x += ss.dx;
        ss.y += ss.dy;
        ss.opacity -= 0.014;

        if (ss.opacity <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.lineWidth = 1.5;
        const grad = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - ss.dx * 3.5,
          ss.y - ss.dy * 3.5
        );
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        grad.addColorStop(0.3, `rgba(147, 197, 253, ${ss.opacity * 0.7})`);
        grad.addColorStop(1, 'rgba(147, 197, 253, 0)');

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.dx * 3.5, ss.y - ss.dy * 3.5);
        ctx.stroke();

        // Glowing tip head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.opacity})`;
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [density, interactive]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {/* 1. Procedural HTML5 Starfield & Meteor Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 2. Ethereal Cosmic Nebulae Gradients */}
      {showNebulae && (
        <div className="absolute inset-0 overflow-hidden mix-blend-screen opacity-70 pointer-events-none">
          {/* Deep Indigo/Violet Core Nebula */}
          <div className="absolute -top-[15%] left-[10%] w-[800px] h-[700px] rounded-full bg-radial from-violet-900/25 via-indigo-950/15 to-transparent blur-3xl animate-pulse duration-10000" />

          {/* Cyan/Aqua Stellar Cloud */}
          <div className="absolute top-[40%] -right-[10%] w-[900px] h-[800px] rounded-full bg-radial from-cyan-900/20 via-sky-950/10 to-transparent blur-3xl" />

          {/* Deep Blue Stellar Drift */}
          <div className="absolute -bottom-[20%] left-[25%] w-[850px] h-[750px] rounded-full bg-radial from-blue-900/20 via-indigo-950/10 to-transparent blur-3xl" />

          {/* Subtle Stardust Glow center */}
          <div className="absolute top-[20%] left-[45%] w-[600px] h-[600px] rounded-full bg-radial from-purple-900/10 via-transparent to-transparent blur-3xl" />
        </div>
      )}

      {/* 3. Deep Space Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/85 pointer-events-none" />
    </div>
  );
}
