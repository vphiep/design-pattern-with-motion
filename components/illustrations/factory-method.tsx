'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function FactoryMethodScene({
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
      tl.from('.req', { x: -40, opacity: 0, duration: 0.45 });
      tl.addLabel('step-1');
      tl.from('.factory', { opacity: 0, scale: 0.92, svgOrigin: '360 230', duration: 0.4 });
      tl.from('.link-in', { opacity: 0, duration: 0.25 }, '<0.1');
      tl.to('.slot', { fill: 'var(--accent)', duration: 0.25 });
      tl.to('.slot-label', { fill: 'var(--bg)', duration: 0.25 }, '<');
      tl.addLabel('step-2');
      tl.from('.link-out', { opacity: 0, duration: 0.25 });
      tl.from('.out-a', { x: -30, opacity: 0, duration: 0.4 });
      tl.from('.out-b', { x: -30, opacity: 0, duration: 0.4 }, '+=0.15');
      tl.to('.stamp', { opacity: 1, duration: 0.2 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        REQUEST IN
      </Caption>
      <Caption x={760} y={36} anchor="end">
        PRODUCTS OUT
      </Caption>

      <g className="req" data-step="0">
        <NodeBox x={40} y={200} w={130} h={56} label="log()" sub="caller" />
      </g>

      <line
        className="link-in"
        data-step="1"
        x1={178}
        y1={228}
        x2={250}
        y2={228}
        stroke="var(--text-muted)"
        strokeWidth={1.25}
      />

      <g className="factory" data-step="1">
        <rect
          x={250}
          y={130}
          width={220}
          height={200}
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth={1.5}
        />
        <text
          x={360}
          y={168}
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize={20}
          fill="var(--text)"
        >
          Factory
        </text>
        <text
          x={360}
          y={190}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill="var(--text-muted)"
        >
          createDestination()
        </text>
        <rect
          className="slot"
          x={292}
          y={214}
          width={136}
          height={44}
          fill="var(--bg-elevated)"
          stroke="var(--border)"
        />
        <text
          className="slot-label"
          x={360}
          y={241}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fill="var(--text)"
        >
          decide type
        </text>
      </g>

      <line
        className="link-out"
        data-step="2"
        x1={470}
        y1={200}
        x2={540}
        y2={160}
        stroke="var(--accent)"
        strokeWidth={1.25}
      />
      <line
        className="link-out"
        data-step="2"
        x1={470}
        y1={256}
        x2={540}
        y2={300}
        stroke="var(--secondary)"
        strokeWidth={1.25}
      />

      <g className="out-a" data-step="2">
        <NodeBox x={548} y={132} w={150} h={56} label="StdoutDest" accent />
      </g>
      <g className="out-b" data-step="2">
        <NodeBox x={548} y={272} w={150} h={56} label="FileDest" />
      </g>
      <text
        className="stamp"
        opacity={0}
        x={624}
        y={420}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill="var(--text-soft)"
      >
        subclass picks which door opens
      </text>
    </SceneBoard>
  );
}
