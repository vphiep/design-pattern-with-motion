'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function AbstractFactoryScene({
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
      tl.from('.contract', { y: -16, opacity: 0, duration: 0.4 });
      tl.addLabel('step-1');
      tl.from('.kit-l', { x: -24, opacity: 0, duration: 0.4 });
      tl.from('.kit-d', { x: 24, opacity: 0, duration: 0.4 }, '<');
      tl.addLabel('step-2');
      tl.from('.part', { y: 16, opacity: 0, stagger: 0.1, duration: 0.35 });
      tl.to('.mismatch', { opacity: 1, duration: 0.4 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={400} y={32} anchor="middle">
        FAMILIES MUST STAY TOGETHER
      </Caption>
      <g className="contract" data-step="0">
        <NodeBox x={276} y={50} w={248} h={48} label="UIFactory" sub="button + checkbox" />
      </g>

      <g className="kit-l" data-step="1">
        <rect
          x={70}
          y={140}
          width={280}
          height={280}
          fill="var(--surface)"
          stroke="var(--border)"
        />
        <text
          x={210}
          y={172}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize={18}
          fill="var(--text)"
        >
          Light kit
        </text>
      </g>
      <g className="kit-d" data-step="1">
        <rect
          x={450}
          y={140}
          width={280}
          height={280}
          fill="var(--bg-elevated)"
          stroke="var(--border)"
        />
        <text
          x={590}
          y={172}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize={18}
          fill="var(--text)"
        >
          Dark kit
        </text>
      </g>

      <g className="part" data-step="2">
        <NodeBox x={110} y={210} w={200} h={52} label="LightButton" />
        <NodeBox x={110} y={290} w={200} h={52} label="LightCheckbox" />
        <NodeBox x={490} y={210} w={200} h={52} label="DarkButton" accent />
        <NodeBox x={490} y={290} w={200} h={52} label="DarkCheckbox" />
      </g>
      <text
        className="mismatch"
        opacity={0}
        x={400}
        y={450}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--text-soft)"
      >
        no LightButton + DarkCheckbox
      </text>
    </SceneBoard>
  );
}
