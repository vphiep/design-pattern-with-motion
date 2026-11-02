'use client';

import { MONO } from './scene-kit';

/** Lifeline + message primitives for protocol sequence diagrams (OAuth, TLS…). */

export function Lifeline({
  x,
  top,
  bottom,
  label,
  sub,
  accent
}: {
  x: number;
  top: number;
  bottom: number;
  label: string;
  sub?: string;
  accent: string;
}) {
  return (
    <g>
      <rect
        x={x - 70}
        y={top}
        width={140}
        height={sub ? 38 : 28}
        rx={6}
        fill="var(--surface)"
        stroke={accent}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={top + 17}
        textAnchor="middle"
        fill={accent}
        fontFamily={MONO}
        fontSize={10}
        fontWeight="bold"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={top + 30}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontFamily={MONO}
          fontSize={7.5}
        >
          {sub}
        </text>
      )}
      <line
        x1={x}
        y1={top + (sub ? 38 : 28)}
        x2={x}
        y2={bottom}
        stroke="var(--border)"
        strokeDasharray="4 4"
      />
    </g>
  );
}

export function Message({
  from,
  to,
  y,
  label,
  accent,
  className,
  step,
  dashed = false
}: {
  from: number;
  to: number;
  y: number;
  label: string;
  accent: string;
  className?: string;
  step?: string;
  dashed?: boolean;
}) {
  const dir = to > from ? 1 : -1;
  const tip = to - dir * 2;
  const mid = (from + to) / 2;
  return (
    <g className={className} data-step={step}>
      <line
        x1={from}
        y1={y}
        x2={tip - dir * 6}
        y2={y}
        stroke={accent}
        strokeWidth={1.6}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <polygon
        points={`${tip},${y} ${tip - dir * 8},${y - 4} ${tip - dir * 8},${y + 4}`}
        fill={accent}
      />
      <text
        x={mid}
        y={y - 6}
        textAnchor="middle"
        fill="var(--text)"
        fontFamily={MONO}
        fontSize={8.5}
      >
        {label}
      </text>
    </g>
  );
}

export function SideNote({
  x,
  y,
  lines,
  accent,
  className,
  step,
  width = 170
}: {
  x: number;
  y: number;
  lines: string[];
  accent: string;
  className?: string;
  step?: string;
  width?: number;
}) {
  return (
    <g className={className} data-step={step}>
      <rect
        x={x}
        y={y}
        width={width}
        height={lines.length * 13 + 10}
        rx={4}
        fill="var(--bg)"
        stroke={accent}
        strokeOpacity={0.8}
      />
      {lines.map((l, i) => (
        <text
          key={i}
          x={x + 8}
          y={y + 16 + i * 13}
          fill="var(--text)"
          fontFamily={MONO}
          fontSize={8}
        >
          {l}
        </text>
      ))}
    </g>
  );
}
