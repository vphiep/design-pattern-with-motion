'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function FlyweightScene({
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
      tl.from('.type', { opacity: 0, y: -10, stagger: 0.12, duration: 0.35 });
      tl.addLabel('step-1');
      tl.from('.cache', { opacity: 0, duration: 0.35 });
      tl.addLabel('step-2');
      tl.from('.tree', {
        opacity: 0,
        scale: 0.4,
        stagger: 0.04,
        duration: 0.25,
        transformOrigin: '50% 50%'
      });
    }
  });

  const trees = [
    [80, 280],
    [140, 320],
    [200, 270],
    [260, 340],
    [320, 300],
    [380, 350],
    [440, 280],
    [500, 330],
    [560, 290],
    [620, 340],
    [680, 300],
    [110, 380],
    [230, 390],
    [470, 390],
    [590, 380]
  ];

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        SHARED TYPES
      </Caption>
      <g data-step="0">
        <g className="type">
          <rect
            x={60}
            y={60}
            width={120}
            height={70}
            fill="var(--accent-soft)"
            stroke="var(--border)"
          />
          <text
            x={120}
            y={102}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={12}
            fill="var(--text)"
          >
            oak
          </text>
        </g>
        <g className="type">
          <rect
            x={200}
            y={60}
            width={120}
            height={70}
            fill="var(--secondary-soft)"
            stroke="var(--border)"
          />
          <text
            x={260}
            y={102}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={12}
            fill="var(--text)"
          >
            pine
          </text>
        </g>
        <g className="type">
          <rect
            x={340}
            y={60}
            width={120}
            height={70}
            fill="var(--bg-elevated)"
            stroke="var(--border)"
          />
          <text
            x={400}
            y={102}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={12}
            fill="var(--text)"
          >
            maple
          </text>
        </g>
      </g>
      <g className="cache" data-step="1">
        <rect x={520} y={60} width={220} height={70} fill="var(--surface)" stroke="var(--accent)" />
        <text
          x={630}
          y={102}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={12}
          fill="var(--text)"
        >
          TreeFactory cache
        </text>
      </g>
      <g data-step="2">
        {trees.map(([x, y], i) => (
          <g key={i} className="tree">
            <path
              d={`M${x} ${y} l12 -28 l12 28 z`}
              fill={
                i % 3 === 0
                  ? 'var(--accent)'
                  : i % 3 === 1
                    ? 'var(--secondary)'
                    : 'var(--pattern-behavioral)'
              }
            />
            <rect x={x + 9} y={y} width={6} height={14} fill="var(--text-muted)" />
          </g>
        ))}
      </g>
    </SceneBoard>
  );
}
