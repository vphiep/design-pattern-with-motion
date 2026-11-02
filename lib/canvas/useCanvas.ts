'use client';

import { useEffect, useRef } from 'react';

export interface CanvasColors {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
}

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
  colors: CanvasColors;
}

function readColors(): CanvasColors {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => s.getPropertyValue(name).trim() || fallback;
  return {
    bg: v('--bg', '#f4efe6'),
    surface: v('--surface', '#faf6ec'),
    text: v('--text', '#1a1410'),
    muted: v('--text-muted', '#5b5247'),
    accent: v('--accent', '#e85d04'),
    secondary: v('--secondary', '#2a9d8f'),
    border: v('--border', '#2a221a')
  };
}

/**
 * Resize an HTML canvas to its CSS box with devicePixelRatio, then
 * invoke `draw` whenever size, theme, or deps change.
 */
export function useCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  draw: (frame: CanvasFrame) => void,
  deps: ReadonlyArray<unknown> = []
) {
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current({ ctx, w, h, dpr, colors: readColors() });
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(resize);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { readColors };
