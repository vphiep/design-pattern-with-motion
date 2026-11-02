'use client';

import React from 'react';

/**
 * Animated SVG architectural pipeline with animated dashed lines and packets.
 */
export function ArchitecturalFlow() {
  return (
    <svg viewBox="0 0 700 180" className="w-full h-auto max-w-2xl mx-auto">
      <defs>
        <marker
          id="arrow-end"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--text-muted)" />
        </marker>
      </defs>

      {/* Node 1: Client */}
      <rect
        x={30}
        y={60}
        width={120}
        height={60}
        rx={8}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      <text x={90} y={92} textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="600">
        Client
      </text>
      <text x={90} y={108} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
        caller
      </text>

      {/* Animated Connector Line */}
      <line
        x1={150}
        y1={90}
        x2={280}
        y2={90}
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        markerEnd="url(#arrow-end)"
        className="animate-flow-dash"
      />

      {/* Node 2: Intermediary / Proxy */}
      <rect
        x={290}
        y={50}
        width={140}
        height={80}
        rx={8}
        fill="var(--surface)"
        stroke="var(--pattern-structural)"
        strokeWidth={2}
      />
      <text x={360} y={85} textAnchor="middle" fill="var(--pattern-structural)" fontSize="13" fontWeight="bold">
        Proxy / Intermediary
      </text>
      <text x={360} y={105} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
        access-control
      </text>

      {/* Animated Connector Line 2 */}
      <line
        x1={430}
        y1={90}
        x2={540}
        y2={90}
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        strokeDasharray="5 4"
        markerEnd="url(#arrow-end)"
      />

      {/* Node 3: Real Subject */}
      <rect
        x={550}
        y={60}
        width={120}
        height={60}
        rx={8}
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth={1.5}
      />
      <text x={610} y={92} textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="600">
        RealSubject
      </text>
      <text x={610} y={108} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">
        service
      </text>
    </svg>
  );
}
