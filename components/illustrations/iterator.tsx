'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

const CELLS = ['8', '3', '10', '1'] as const;

export default function IteratorScene({
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
      tl.from('.cursor', { opacity: 0, duration: 0.3 });
      tl.addLabel('step-1');
      [0, 1, 2, 3].forEach((i) => {
        if (i > 0) tl.to('.cursor', { x: 150 * i, duration: 0.4 });
        tl.to(`.cell-${i}`, { fill: 'var(--accent)', duration: 0.15 });
        tl.to(`.cell-t-${i}`, { fill: 'var(--bg)', duration: 0.15 }, '<');
      });
      tl.addLabel('step-2');
      tl.to('.veil', { opacity: 0.5, duration: 0.35 });
      tl.to('.note', { opacity: 1, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        NEXT · NEXT · NEXT
      </Caption>
      <g data-step="0,1">
        {CELLS.map((n, i) => (
          <rect
            key={n}
            className={`cell-${i}`}
            x={80 + i * 150}
            y={180}
            width={100}
            height={80}
            fill="var(--surface)"
            stroke="var(--border)"
          />
        ))}
        {CELLS.map((n, i) => (
          <text
            key={`t-${n}`}
            className={`cell-t-${i}`}
            x={130 + i * 150}
            y={228}
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize={22}
            fill="var(--text)"
          >
            {n}
          </text>
        ))}
      </g>
      <rect
        className="cursor"
        x={80}
        y={170}
        width={100}
        height={100}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        data-step="0,1"
      />
      <g className="veil" opacity={0} data-step="2">
        <rect x={60} y={120} width={620} height={200} fill="var(--bg)" />
        <NodeBox x={280} y={180} w={200} h={64} label="hasNext() / next()" />
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
        the tree stays private
      </text>
    </SceneBoard>
  );
}
