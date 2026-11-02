'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function StateScene({
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
      tl.from('.mode', { opacity: 0, stagger: 0.12, duration: 0.3 });
      tl.addLabel('step-1');
      tl.from('.ctx', { opacity: 0, duration: 0.35 });
      tl.from('.badge', { opacity: 0, duration: 0.25 }, '<0.1');
      tl.addLabel('step-2');
      tl.to('.badge', { x: 210, duration: 0.55, ease: 'power2.inOut' });
      tl.to('.closed', { opacity: 0.3, duration: 0.3 }, '<');
      tl.to('.open', { opacity: 1, duration: 0.3 }, '<');
      tl.to('.act', { opacity: 1, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        SAME CONNECTION · NEW RULES
      </Caption>
      <g className="ctx" data-step="1">
        <NodeBox x={80} y={160} w={220} h={88} label="Connection" sub="holds current state" />
      </g>
      <rect
        className="badge"
        x={120}
        y={270}
        width={120}
        height={36}
        fill="var(--accent)"
        data-step="1,2"
      />
      <text
        className="badge"
        x={180}
        y={294}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--bg)"
        data-step="1,2"
      >
        state →
      </text>
      <g data-step="0">
        <g className="mode closed">
          <NodeBox x={420} y={110} w={200} h={72} label="Closed" sub="cannot send" />
        </g>
        <g className="mode open" opacity={0.35}>
          <NodeBox x={420} y={220} w={200} h={72} label="Open" sub="send() works" accent />
        </g>
      </g>
      <text
        className="act"
        opacity={0}
        x={520}
        y={360}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={12}
        fill="var(--accent)"
      >
        send(“ping”) → Sent: ping
      </text>
    </SceneBoard>
  );
}
