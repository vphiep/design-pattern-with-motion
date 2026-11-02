'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function FacadeScene({
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
      tl.from('.gear', { opacity: 0, y: 10, stagger: 0.08, duration: 0.3 });
      tl.addLabel('step-1');
      tl.from('.door', { y: 30, opacity: 0, duration: 0.45 });
      tl.to('.curtain', { opacity: 0.55, duration: 0.4 });
      tl.addLabel('step-2');
      tl.from('.client', { x: -20, opacity: 0, duration: 0.35 });
      tl.from('.one', { opacity: 0, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        SUBSYSTEM
      </Caption>
      <g data-step="0">
        {['BitrateReader', 'CodecFactory', 'AudioMixer', 'Muxer'].map((n, i) => (
          <g key={n} className="gear">
            <NodeBox
              x={80 + (i % 2) * 180}
              y={80 + Math.floor(i / 2) * 90}
              w={160}
              h={52}
              label={n}
            />
          </g>
        ))}
      </g>
      <rect
        className="curtain"
        opacity={0}
        x={60}
        y={60}
        width={400}
        height={250}
        fill="var(--bg)"
        data-step="1"
      />
      <g className="door" data-step="1">
        <NodeBox x={500} y={150} w={220} h={80} label="VideoConverter" sub="convert()" accent />
      </g>
      <g className="client" data-step="2">
        <NodeBox x={500} y={280} w={220} h={52} label="client" />
      </g>
      <line
        className="one"
        data-step="2"
        x1={610}
        y1={280}
        x2={610}
        y2={230}
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
    </SceneBoard>
  );
}
