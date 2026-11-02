'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function ProxyScene({
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
      tl.from('.client', { x: -16, opacity: 0, duration: 0.35 });
      tl.from('.proxy', { opacity: 0, duration: 0.35 });
      tl.addLabel('step-1');
      tl.from('.real-ghost', { opacity: 0, duration: 0.3 });
      tl.addLabel('step-2');
      tl.from('.gate', { scaleY: 0, svgOrigin: '458 228', duration: 0.3 });
      tl.from('.real', { opacity: 0, x: 16, duration: 0.4 });
      tl.to('.real-ghost', { opacity: 0, duration: 0.2 }, '<');
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        CLIENT
      </Caption>
      <Caption x={760} y={36} anchor="end">
        REAL OBJECT
      </Caption>
      <g className="client" data-step="0">
        <NodeBox x={40} y={200} w={140} h={56} label="display()" />
      </g>
      <g className="proxy" data-step="0">
        <NodeBox x={260} y={186} w={180} h={84} label="LazyImageProxy" sub="same interface" />
      </g>
      <rect
        className="gate"
        data-step="2"
        x={454}
        y={200}
        width={8}
        height={56}
        fill="var(--accent)"
      />
      <g className="real-ghost" data-step="1">
        <NodeBox x={520} y={200} w={200} h={56} label="RealImage ?" />
      </g>
      <g className="real" data-step="2">
        <NodeBox x={520} y={200} w={200} h={56} label="RealImage" accent />
      </g>
      <text
        x={400}
        y={360}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--text-muted)"
      >
        built only on first display()
      </text>
    </SceneBoard>
  );
}
