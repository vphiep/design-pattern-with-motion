'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function CommandScene({
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
      tl.from('.ticket', { y: -16, opacity: 0, stagger: 0.12, duration: 0.35 });
      tl.addLabel('step-1');
      tl.from('.editor', { opacity: 0, duration: 0.35 });
      tl.to('.ticket-1', { x: 380, y: 130, duration: 0.5, ease: 'power2.inOut' });
      tl.addLabel('step-2');
      tl.from('.btn', { opacity: 0, duration: 0.3 });
      tl.to('.buf', { opacity: 1, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        REQUESTS AS OBJECTS
      </Caption>
      <g className="editor" data-step="1,2">
        <NodeBox x={560} y={200} w={180} h={72} label="TextEditor" sub="receiver" />
      </g>
      <g className="ticket ticket-1" data-step="0,1">
        <NodeBox x={60} y={80} w={160} h={56} label="Append hello" />
      </g>
      <g className="ticket" data-step="0">
        <NodeBox x={60} y={160} w={160} h={56} label="Append world" />
      </g>
      <g className="ticket" data-step="0">
        <NodeBox x={60} y={240} w={160} h={56} label="Undo" />
      </g>
      <g className="btn" data-step="2">
        <NodeBox x={360} y={120} w={150} h={56} label="Button.click" />
      </g>
      <text
        className="buf"
        opacity={0}
        x={650}
        y={320}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={14}
        fill="var(--accent)"
      >
        “hello”
      </text>
    </SceneBoard>
  );
}
