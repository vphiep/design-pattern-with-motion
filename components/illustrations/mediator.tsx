'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeCircle } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function MediatorScene({
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
      tl.from('.tower', { y: -16, opacity: 0, duration: 0.4 });
      tl.addLabel('step-1');
      tl.from('.plane', { opacity: 0, stagger: 0.1, duration: 0.3 });
      tl.addLabel('step-2');
      tl.from('.spoke', { opacity: 0, duration: 0.35 });
      tl.to('.side', { opacity: 0.12, duration: 0.4 });
    }
  });

  const planes = [
    [160, 320, 'A'],
    [300, 380, 'B'],
    [500, 380, 'C'],
    [640, 320, 'D']
  ] as const;

  return (
    <SceneBoard ref={ref}>
      <Caption x={400} y={36} anchor="middle">
        TALK TO THE TOWER
      </Caption>
      <g className="tower" data-step="0">
        <NodeCircle
          cx={400}
          cy={160}
          r={46}
          label="room"
          fill="var(--accent)"
          textFill="var(--bg)"
        />
      </g>
      <g className="side" data-step="2">
        <path
          d="M160 320 L300 380 L500 380 L640 320"
          fill="none"
          stroke="var(--text-soft)"
          strokeDasharray="3 4"
        />
      </g>
      <g data-step="2">
        {planes.map(([x, y]) => (
          <line
            key={x}
            className="spoke"
            x1={400}
            y1={206}
            x2={x}
            y2={y - 28}
            stroke="var(--accent)"
            strokeWidth={1.25}
          />
        ))}
      </g>
      <g data-step="1">
        {planes.map(([x, y, n]) => (
          <g key={n} className="plane">
            <NodeCircle cx={x} cy={y} r={26} label={n} />
          </g>
        ))}
      </g>
    </SceneBoard>
  );
}
