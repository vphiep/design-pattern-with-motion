'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeCircle, PulseRing } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function ObserverScene({
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
      tl.from('.sub', { y: 16, opacity: 0, stagger: 0.12, duration: 0.35 });
      tl.from('.wire', { opacity: 0, duration: 0.3 }, '<0.1');
      tl.addLabel('step-1');
      tl.fromTo(
        '.pulse',
        { opacity: 0.85, scale: 0.5, svgOrigin: '400 140' },
        { opacity: 0, scale: 1.8, duration: 0.7 }
      );
      tl.from('.signal', { opacity: 0, duration: 0.2 }, '<');
      tl.addLabel('step-2');
      tl.to('.obs-fill', { fill: 'var(--accent)', stagger: 0.18, duration: 0.25 });
      tl.to('.obs-name', { fill: 'var(--bg)', stagger: 0.18, duration: 0.25 }, '<');
      tl.from('.react', { opacity: 0, y: 6, stagger: 0.18, duration: 0.25 }, '<');
    }
  });

  const observers = [
    [160, 340, 'email'],
    [400, 380, 'phone'],
    [640, 340, 'log']
  ] as const;

  return (
    <SceneBoard ref={ref}>
      <Caption x={400} y={36} anchor="middle">
        SUBJECT NOTIFIES
      </Caption>
      <g data-step="0,1">
        <PulseRing className="pulse" cx={400} cy={140} r={50} />
        <NodeCircle cx={400} cy={140} r={42} label="news" fill="var(--surface)" />
      </g>
      <g className="wire" data-step="0">
        {observers.map(([x, y]) => (
          <line
            key={x}
            x1={400}
            y1={182}
            x2={x}
            y2={y - 28}
            stroke="var(--text-soft)"
            strokeWidth={1}
          />
        ))}
      </g>
      <g data-step="1">
        {observers.map(([x, y]) => (
          <line
            key={`s-${x}`}
            className="signal"
            x1={400}
            y1={182}
            x2={x}
            y2={y - 28}
            stroke="var(--accent)"
            strokeWidth={1.6}
          />
        ))}
      </g>
      <g data-step="0,2">
        {observers.map(([x, y, n]) => (
          <g key={n} className="sub">
            <circle
              className="obs-fill"
              cx={x}
              cy={y}
              r={28}
              fill="var(--surface)"
              stroke="var(--border)"
              strokeWidth={1.25}
            />
            <text
              className="obs-name"
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={11}
              fill="var(--text)"
            >
              {n}
            </text>
            <text
              className="react"
              opacity={0}
              x={x}
              y={y + 52}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10}
              fill="var(--accent)"
            >
              update()
            </text>
          </g>
        ))}
      </g>
    </SceneBoard>
  );
}
