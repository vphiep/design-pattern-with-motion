'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function TemplateMethodScene({
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
      tl.from('.skel', { opacity: 0, x: -12, stagger: 0.15, duration: 0.3 });
      tl.addLabel('step-1');
      tl.from('.blank', { opacity: 0, duration: 0.3 });
      tl.addLabel('step-2');
      tl.from('.fill', { opacity: 0, y: 8, stagger: 0.12, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        FIXED ORDER
      </Caption>
      <g data-step="0">
        {['1. read()', '2. transform()', '3. write()'].map((l, i) => (
          <g key={l} className="skel">
            <NodeBox x={60} y={90 + i * 90} w={220} h={60} label={l} />
          </g>
        ))}
      </g>
      <g className="blank" data-step="1">
        <rect x={320} y={90} width={20} height={240} fill="var(--accent)" />
      </g>
      <g data-step="2">
        <g className="fill">
          <NodeBox x={380} y={90} w={280} h={60} label="read CSV" />
        </g>
        <g className="fill">
          <NodeBox x={380} y={180} w={280} h={60} label="CSV → JSON" accent />
        </g>
        <g className="fill">
          <NodeBox x={380} y={270} w={280} h={60} label="write JSON file" />
        </g>
      </g>
    </SceneBoard>
  );
}
