'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function MementoScene({
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
      tl.from('.ed', { opacity: 0, duration: 0.3 });
      tl.to('.t1', { opacity: 1, duration: 0.25 });
      tl.from('.snap1', { y: -12, opacity: 0, duration: 0.35 });
      tl.addLabel('step-1');
      tl.to('.t2', { opacity: 1, duration: 0.25 });
      tl.from('.snap2', { y: -12, opacity: 0, duration: 0.35 });
      tl.addLabel('step-2');
      tl.to('.t2', { opacity: 0, duration: 0.3 });
      tl.to('.snap2', { opacity: 0.25, duration: 0.3 }, '<');
      tl.to('.restored', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        SAVE FILE
      </Caption>
      <g className="ed" data-step="0">
        <NodeBox x={80} y={140} w={260} h={48} label="TextEditor" />
        <rect x={80} y={196} width={260} height={80} fill="var(--surface)" stroke="var(--border)" />
        <text
          className="t1"
          opacity={0}
          x={210}
          y={232}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={14}
          fill="var(--text)"
        >
          hello
        </text>
        <text
          className="t2"
          opacity={0}
          x={210}
          y={256}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={14}
          fill="var(--accent)"
        >
          world
        </text>
      </g>
      <g className="snap1" data-step="0">
        <NodeBox x={460} y={120} w={200} h={56} label="memento 1" />
      </g>
      <g className="snap2" data-step="1">
        <NodeBox x={460} y={200} w={200} h={56} label="memento 2" />
      </g>
      <text
        className="restored"
        opacity={0}
        x={210}
        y={308}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={12}
        fill="var(--secondary)"
      >
        restore() → hello
      </text>
    </SceneBoard>
  );
}
