'use client';

import { useRef } from 'react';
import { useSvgId } from './_shared';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeCircle } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function PrototypeScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const markerId = useSvgId('proto-arr');
  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      tl.addLabel('step-0');
      tl.from('.proto', { opacity: 0, scale: 0.8, svgOrigin: '220 240', duration: 0.45 });
      tl.addLabel('step-1');
      tl.from('.ghost-copy', { x: -40, opacity: 0, duration: 0.45 });
      tl.addLabel('step-2');
      tl.from('.copy', { x: -50, opacity: 0, stagger: 0.16, duration: 0.4 });
      tl.to('.note', { opacity: 1, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        ORIGINAL
      </Caption>
      <Caption x={760} y={36} anchor="end">
        CLONES
      </Caption>
      <g className="proto" data-step="0">
        <NodeCircle cx={220} cy={240} r={70} label="template" />
        <circle cx={220} cy={240} r={48} fill="none" stroke="var(--accent)" strokeDasharray="4 4" />
      </g>
      <g className="ghost-copy" data-step="1">
        <path
          d="M310 240 H390"
          stroke="var(--accent)"
          strokeWidth={1.25}
          markerEnd={`url(#${markerId})`}
        />
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="var(--accent)" />
          </marker>
        </defs>
      </g>
      <g data-step="2">
        {[0, 1, 2].map((i) => (
          <g key={i} className="copy">
            <NodeCircle cx={480 + i * 90} cy={240} r={36} label="copy" />
          </g>
        ))}
      </g>
      <text
        className="note"
        opacity={0}
        x={400}
        y={400}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--text-muted)"
      >
        copy() — cheaper than constructing from scratch
      </text>
    </SceneBoard>
  );
}
