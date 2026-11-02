'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function AdapterScene({
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
      tl.from('.need', { x: -20, opacity: 0, duration: 0.4 });
      tl.addLabel('step-1');
      tl.from('.have', { x: 20, opacity: 0, duration: 0.4 });
      tl.to('.clash', { opacity: 1, duration: 0.3 });
      tl.addLabel('step-2');
      tl.from('.sleeve', { scaleY: 0.2, opacity: 0, svgOrigin: '400 228', duration: 0.45 });
      tl.to('.clash', { opacity: 0, duration: 0.25 });
      tl.from('.flow', { opacity: 0, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        YOUR INTERFACE
      </Caption>
      <Caption x={760} y={36} anchor="end">
        THIRD-PARTY
      </Caption>
      <g className="need" data-step="0">
        <NodeBox x={48} y={190} w={180} h={72} label="charge(cents)" sub="PaymentGateway" />
        <rect x={236} y={214} width={28} height={28} fill="var(--accent)" />
      </g>
      <g className="have" data-step="1">
        <circle cx={700} cy={228} r={16} fill="var(--secondary)" />
        <NodeBox x={572} y={190} w={180} h={72} label="createCharge()" sub="StripeApi" />
      </g>
      <text
        className="clash"
        opacity={0}
        x={400}
        y={140}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={22}
        fill="var(--accent)"
      >
        won’t fit
      </text>
      <g className="sleeve" data-step="2">
        <rect
          x={320}
          y={168}
          width={160}
          height={120}
          fill="var(--surface)"
          stroke="var(--accent)"
          strokeWidth={1.6}
        />
        <text
          x={400}
          y={220}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={12}
          fill="var(--text)"
        >
          StripeAdapter
        </text>
        <text
          x={400}
          y={242}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill="var(--text-muted)"
        >
          square → round
        </text>
      </g>
      <line
        className="flow animate-flow-dash"
        data-step="2"
        x1={264}
        y1={228}
        x2={320}
        y2={228}
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <line
        className="flow animate-flow-dash"
        data-step="2"
        x1={480}
        y1={228}
        x2={572}
        y2={228}
        stroke="var(--secondary)"
        strokeWidth={1.5}
      />
    </SceneBoard>
  );
}
