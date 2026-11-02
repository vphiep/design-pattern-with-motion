'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function BridgeScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      tl.addLabel('step-0');
      tl.from('.impl', { y: 20, opacity: 0, stagger: 0.12, duration: 0.35 });
      tl.addLabel('step-1');
      tl.from('.abs', { y: -16, opacity: 0, duration: 0.4 });
      tl.from('.span', { strokeDashoffset: 220, duration: 0.5 });
      tl.addLabel('step-2');
      tl.to('.swap', { x: 210, duration: 0.6, ease: 'power2.inOut' });
      tl.to('.note', { opacity: 1, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        ABSTRACTION
      </Caption>
      <Caption x={760} y={36} anchor="end">
        IMPLEMENTATION
      </Caption>
      <g className="abs" data-step="1">
        <NodeBox x={80} y={80} w={200} h={64} label="Circle" sub="shape" />
        <NodeBox x={80} y={170} w={200} h={64} label="Square" sub="shape" />
      </g>
      <path
        className="span"
        d="M290 112 H500"
        stroke="var(--accent)"
        strokeWidth={1.6}
        fill="none"
        strokeDasharray="220"
        strokeDashoffset="0"
        data-step="1"
      />
      <g className="impl" data-step="0">
        <NodeBox x={500} y={80} w={200} h={64} label="VectorRenderer" />
        <NodeBox x={500} y={170} w={200} h={64} label="RasterRenderer" />
      </g>
      <g className="swap" data-step="2">
        <rect x={290} y={300} width={140} height={48} fill="var(--accent)" />
        <text
          x={360}
          y={330}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={12}
          fill="var(--bg)"
        >
          renderer →
        </text>
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
        swap either side without rewriting the other
      </text>
    </SceneBoard>
  );
}
