'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function BuilderScene({
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
      tl.from('.base', { opacity: 0, y: 12, duration: 0.35 });
      tl.addLabel('step-1');
      tl.from('.step', { opacity: 0, x: -12, stagger: 0.18, duration: 0.3 });
      tl.to('.brick', { opacity: 1, stagger: 0.18, duration: 0.25 }, '<');
      tl.addLabel('step-2');
      tl.from('.done', { scale: 0.85, opacity: 0, svgOrigin: '640 228', duration: 0.5 });
      tl.to('.stamp', { opacity: 1, duration: 0.2 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        STEPWISE ASSEMBLY
      </Caption>
      <g className="base" data-step="0">
        <NodeBox x={40} y={80} w={220} h={56} label="POST /users" sub="required" />
      </g>
      <g data-step="1">
        {[
          ['header()', 160],
          ['body()', 230],
          ['timeoutMs()', 300]
        ].map(([label, y]) => (
          <g key={String(label)} className="step">
            <NodeBox x={40} y={Number(y)} w={220} h={52} label={String(label)} />
          </g>
        ))}
      </g>
      <g data-step="1">
        <rect
          className="brick"
          opacity={0}
          x={340}
          y={160}
          width={160}
          height={36}
          fill="var(--accent-soft)"
          stroke="var(--border)"
        />
        <rect
          className="brick"
          opacity={0}
          x={340}
          y={206}
          width={160}
          height={36}
          fill="var(--secondary-soft)"
          stroke="var(--border)"
        />
        <rect
          className="brick"
          opacity={0}
          x={340}
          y={252}
          width={160}
          height={36}
          fill="var(--bg-elevated)"
          stroke="var(--border)"
        />
      </g>
      <g className="done" data-step="2">
        <NodeBox x={540} y={188} w={200} h={80} label="HttpRequest" sub=".build()" accent />
      </g>
      <text
        className="stamp"
        opacity={0}
        x={640}
        y={300}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill="var(--text-soft)"
      >
        commit once
      </text>
    </SceneBoard>
  );
}
