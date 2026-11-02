'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from '@/components/illustrations/shared/types';

/**
 * Small SVG vocabulary shared by the CDC / Docker / Security / DevOps scenes.
 * Colours go through CSS variables so scenes read in both themes; accents are
 * passed as hex so GSAP can tween them.
 */

export const MONO = 'var(--font-mono)';

/** A course's hand-choreographed scene plus the number of `step-N` labels it adds. */
export interface BespokeScene {
  component: ComponentType<SceneProps>;
  steps: number;
}

export function wrapText(text: string, maxChars: number, maxLines = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + ' …';
  }
  return lines;
}

export function Panel({
  x,
  y,
  w,
  h,
  title,
  subtitle,
  accent,
  className,
  step,
  dashed = false,
  children
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  subtitle?: string;
  accent: string;
  className?: string;
  step?: string;
  dashed?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <g className={className} data-step={step} transform={`translate(${x} ${y})`}>
      <rect
        className="panel-frame"
        width={w}
        height={h}
        rx={8}
        fill="var(--surface)"
        stroke={accent}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      {title && (
        <text x={12} y={20} fill={accent} fontFamily={MONO} fontSize={11} fontWeight="bold">
          {title}
        </text>
      )}
      {subtitle && (
        <text x={12} y={34} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
          {subtitle}
        </text>
      )}
      {children}
    </g>
  );
}

export function Chip({
  x,
  y,
  w,
  h = 22,
  label,
  accent,
  className,
  filled = false,
  fontSize = 8.5,
  step
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  accent: string;
  className?: string;
  filled?: boolean;
  fontSize?: number;
  step?: string;
}) {
  return (
    <g className={className} data-step={step} transform={`translate(${x} ${y})`}>
      <rect
        width={w}
        height={h}
        rx={4}
        fill={filled ? accent : 'var(--bg)'}
        fillOpacity={filled ? 0.9 : 1}
        stroke={accent}
        strokeWidth={1}
      />
      <text
        x={w / 2}
        y={h / 2 + fontSize / 2.8}
        textAnchor="middle"
        fill={filled ? '#ffffff' : 'var(--text)'}
        fontFamily={MONO}
        fontSize={fontSize}
        fontWeight={filled ? 'bold' : undefined}
      >
        {label}
      </text>
    </g>
  );
}

export function Line({
  x1,
  y1,
  x2,
  y2,
  accent,
  className,
  dashed = false,
  step
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  accent: string;
  className?: string;
  dashed?: boolean;
  step?: string;
}) {
  return (
    <line
      className={className}
      data-step={step}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={accent}
      strokeWidth={1.6}
      strokeDasharray={dashed ? '4 4' : undefined}
      strokeLinecap="round"
    />
  );
}

export function SceneTitle({ children }: { children: React.ReactNode }) {
  return (
    <text
      x={24}
      y={28}
      fill="var(--text-muted)"
      fontFamily={MONO}
      fontSize={10}
      letterSpacing={1.5}
    >
      {children}
    </text>
  );
}

/** Multi-line caption block; hidden by default so timelines can fade it in. */
export function Note({
  x,
  y,
  lines,
  className,
  color = 'var(--text-muted)',
  fontSize = 9,
  hidden = true
}: {
  x: number;
  y: number;
  lines: string[];
  className?: string;
  color?: string;
  fontSize?: number;
  hidden?: boolean;
}) {
  return (
    <g className={className} style={hidden ? { opacity: 0 } : undefined}>
      {lines.map((l, i) => (
        <text
          key={i}
          x={x}
          y={y + i * (fontSize + 4)}
          fill={color}
          fontFamily={MONO}
          fontSize={fontSize}
        >
          {l}
        </text>
      ))}
    </g>
  );
}
