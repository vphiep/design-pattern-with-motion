'use client';

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

/**
 * 60FPS particle event dispatcher simulation (Observer Pattern simulation demo).
 */
export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;
    const width = 600;
    const height = 300;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = Array.from({ length: 24 }, () => ({
      x: width / 2,
      y: height / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 4 + 3,
      color: Math.random() > 0.5 ? '#e85d04' : '#2a9d8f'
    }));

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Central dispatcher node
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1410';
      ctx.fill();
      ctx.strokeStyle = '#e85d04';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emit particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full flex justify-center p-4 bg-[var(--surface)] border border-[var(--border-soft)] rounded-xl">
      <canvas ref={canvasRef} style={{ width: 600, height: 300 }} className="max-w-full" />
    </div>
  );
}
