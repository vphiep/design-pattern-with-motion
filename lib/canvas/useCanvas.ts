'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/animations/reduced-motion';

export interface CanvasColors {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  secondary: string;
  border: string;
}

export interface CanvasFonts {
  display: string;
  mono: string;
}

export interface CanvasFrame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
  colors: CanvasColors;
  fonts: CanvasFonts;
  /** `performance.now()` timebase, in ms — compare against timestamps taken with `performance.now()`. */
  now: number;
  /** Seconds since the previous frame of the same animation run (0 on the first frame). */
  dt: number;
  /** Reduced motion: draw end states only; the hook will not schedule further frames. */
  reduced: boolean;
}

/** Return `true` to request another frame (the scene is still moving). */
export type CanvasDraw = (frame: CanvasFrame) => boolean | void;

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

function readFonts(): CanvasFonts {
  const s = getComputedStyle(document.documentElement);
  const display = s.getPropertyValue('--font-display').trim();
  const mono = s.getPropertyValue('--font-mono').trim();
  return {
    display: display ? `${display}, Georgia, serif` : 'Georgia, serif',
    mono: mono ? `${mono}, ui-monospace, monospace` : 'ui-monospace, monospace'
  };
}

/**
 * Keeps a canvas backing store matched to its CSS box × devicePixelRatio and
 * paints it on demand. Painting happens on `requestAnimationFrame`: once after
 * a size, theme, or deps change, and then every frame for as long as `draw`
 * returns `true`. An idle scene costs nothing. The context is cleared and
 * wrapped in `save()`/`restore()` around every `draw` call.
 */
export function useCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  draw: CanvasDraw,
  deps: ReadonlyArray<unknown> = []
) {
  const reduced = usePrefersReducedMotion();
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const kickRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let w = 1;
    let h = 1;
    let dpr = 1;
    let colors = readColors();
    let fonts = readFonts();
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const isReduced = reducedRef.current;
      let more = false;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      try {
        more =
          drawRef.current({ ctx, w, h, dpr, colors, fonts, now, dt, reduced: isReduced }) === true;
      } finally {
        ctx.restore();
      }
      if (more && !isReduced) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    // Resizing the backing store clears it, so repaint synchronously to avoid a blank frame.
    const paintNow = () => {
      if (raf) cancelAnimationFrame(raf);
      frame(performance.now());
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width !== bw) canvas.width = bw;
      if (canvas.height !== bh) canvas.height = bh;
      paintNow();
    };

    kickRef.current = kick;
    resize();
    // The CSS box (e.g. `w-full h-[380px]`) drives the size; never write inline width/height.
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const mo = new MutationObserver(() => {
      colors = readColors();
      fonts = readFonts();
      paintNow();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    // Moving the window to a screen with a different DPR does not resize the CSS box.
    const dprQuery = window.matchMedia?.(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprQuery?.addEventListener('change', resize);
    // Web fonts may land after the first paint.
    document.fonts?.ready.then(() => kickRef.current());

    return () => {
      if (raf) cancelAnimationFrame(raf);
      kickRef.current = () => {};
      ro.disconnect();
      mo.disconnect();
      dprQuery?.removeEventListener('change', resize);
    };
  }, [canvasRef]);

  useEffect(() => {
    kickRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reduced]);
}

/** 0→1 progress of an animation that started at `start` (ms) and lasts `durationMs`. */
export function progress(now: number, start: number, durationMs: number, reduced = false) {
  if (reduced || durationMs <= 0) return 1;
  return Math.min(1, Math.max(0, (now - start) / durationMs));
}

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent exponential approach of `current` toward `target`. */
export function approach(current: number, target: number, dt: number, rate = 10) {
  return target + (current - target) * Math.exp(-rate * dt);
}

/** Use `full` if it fits in `maxWidth` with the current font, else `short`. */
export function fitText(
  ctx: CanvasRenderingContext2D,
  full: string,
  short: string,
  maxWidth: number
) {
  return ctx.measureText(full).width <= maxWidth ? full : short;
}

export { readColors };
