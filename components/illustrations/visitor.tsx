'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function VisitorScene({
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
      tl.from('.asset', { opacity: 0, y: 10, stagger: 0.1, duration: 0.3 });
      tl.addLabel('step-1');
      tl.from('.insp', { x: -30, opacity: 0, duration: 0.4 });
      tl.to('.insp', { x: 200, duration: 0.5 });
      tl.addLabel('step-2');
      tl.to('.insp', { x: 400, duration: 0.5 });
      tl.to('.report', { opacity: 1, stagger: 0.12, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        THE INSPECTOR WALKS
      </Caption>
      <g data-step="0">
        <g className="asset">
          <NodeBox x={80} y={200} w={150} h={56} label="Stock" />
        </g>
        <g className="asset">
          <NodeBox x={280} y={200} w={150} h={56} label="Bond" />
        </g>
        <g className="asset">
          <NodeBox x={480} y={200} w={150} h={56} label="Deposit" />
        </g>
      </g>
      <g className="insp" data-step="1">
        <NodeBox x={80} y={80} w={180} h={56} label="ValueReport" accent />
      </g>
      <g data-step="2">
        <text
          className="report"
          opacity={0}
          x={155}
          y={300}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fill="var(--accent)"
        >
          visit(stock)
        </text>
        <text
          className="report"
          opacity={0}
          x={355}
          y={300}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fill="var(--accent)"
        >
          visit(bond)
        </text>
        <text
          className="report"
          opacity={0}
          x={555}
          y={300}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fill="var(--accent)"
        >
          visit(deposit)
        </text>
      </g>
    </SceneBoard>
  );
}
