'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function DecoratorScene({
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
      tl.from('.core', { scale: 0.7, opacity: 0, svgOrigin: '400 240', duration: 0.4 });
      tl.addLabel('step-1');
      tl.from('.shell-1', { scale: 0.85, opacity: 0, svgOrigin: '400 240', duration: 0.45 });
      tl.to('.label-1', { opacity: 1, duration: 0.2 });
      tl.addLabel('step-2');
      tl.from('.shell-2', { scale: 0.85, opacity: 0, svgOrigin: '400 240', duration: 0.45 });
      tl.to('.label-2', { opacity: 1, duration: 0.2 });
      tl.to('.label-out', { opacity: 1, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={400} y={36} anchor="middle">
        LAYERS WRAP THE SAME OBJECT
      </Caption>
      <rect
        className="shell-2"
        data-step="2"
        x={170}
        y={90}
        width={460}
        height={300}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
      />
      <rect
        className="shell-1"
        data-step="1"
        x={240}
        y={140}
        width={320}
        height={200}
        fill="none"
        stroke="var(--secondary)"
        strokeWidth={2}
      />
      <rect
        className="core"
        data-step="0"
        x={320}
        y={190}
        width={160}
        height={100}
        fill="var(--surface)"
        stroke="var(--border)"
      />
      <text
        className="core"
        x={400}
        y={248}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={18}
        fill="var(--text)"
      >
        PlainText
      </text>
      <text
        className="label-2"
        data-step="2"
        opacity={0}
        x={400}
        y={128}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--accent)"
      >
        Bold
      </text>
      <text
        className="label-1"
        data-step="1"
        opacity={0}
        x={400}
        y={172}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--secondary)"
      >
        Italic
      </text>
      <text
        className="label-out"
        data-step="2"
        opacity={0}
        x={400}
        y={430}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={12}
        fill="var(--text-muted)"
      >
        {'<b><i>hi</i></b>'}
      </text>
    </SceneBoard>
  );
}
