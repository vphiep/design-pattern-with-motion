'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function StrategyScene({
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
      tl.from('.card', { y: 16, opacity: 0, stagger: 0.12, duration: 0.35 });
      tl.addLabel('step-1');
      tl.from('.slot', { opacity: 0, duration: 0.3 });
      tl.to('.card-bulk', { y: -152, x: 190, duration: 0.55, ease: 'power2.inOut' });
      tl.addLabel('step-2');
      tl.to('.out', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        INTERCHANGEABLE PLANS
      </Caption>
      <g className="slot" data-step="1">
        <rect
          x={420}
          y={80}
          width={220}
          height={88}
          fill="none"
          stroke="var(--accent)"
          strokeDasharray="5 4"
        />
        <text
          x={530}
          y={128}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fill="var(--text-soft)"
        >
          Checkout.pricing
        </text>
      </g>
      <g data-step="0">
        <g className="card">
          <NodeBox x={60} y={260} w={160} h={60} label="NoDiscount" />
        </g>
        <g className="card card-bulk">
          <NodeBox x={240} y={260} w={160} h={60} label="BulkDiscount" accent />
        </g>
        <g className="card">
          <NodeBox x={420} y={260} w={180} h={60} label="Seasonal" />
        </g>
      </g>
      <text
        className="out"
        opacity={0}
        x={530}
        y={220}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={22}
        fill="var(--text)"
      >
        $10 × 12 → $96
      </text>
    </SceneBoard>
  );
}
