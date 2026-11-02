'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function CompositeScene({
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
      tl.from('.root', { opacity: 0, y: -12, duration: 0.35 });
      tl.addLabel('step-1');
      tl.from('.leaf', { opacity: 0, y: 12, stagger: 0.1, duration: 0.3 });
      tl.from('.edge', { opacity: 0, duration: 0.3 }, '<');
      tl.addLabel('step-2');
      tl.from('.pulse', { opacity: 0, duration: 0.15 });
      tl.to('.pulse', { y: 80, opacity: 0, duration: 0.7, stagger: 0.12 });
      tl.to('.sum', { opacity: 1, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        ONE CALL · WHOLE TREE
      </Caption>
      <g className="root" data-step="0">
        <NodeBox x={300} y={60} w={200} h={52} label="folder /src" accent />
      </g>
      <g className="edge" data-step="1">
        <path
          d="M400 112 V160 M400 160 H220 V200 M400 160 H580 V200 M400 160 V200 M400 248 V300"
          fill="none"
          stroke="var(--border)"
        />
      </g>
      <g data-step="1">
        <g className="leaf">
          <NodeBox x={130} y={200} w={160} h={48} label="file a" sub="12 kb" />
        </g>
        <g className="leaf">
          <NodeBox x={320} y={200} w={160} h={48} label="folder /lib" />
        </g>
        <g className="leaf">
          <NodeBox x={510} y={200} w={160} h={48} label="file b" sub="8 kb" />
        </g>
        <g className="leaf">
          <NodeBox x={320} y={300} w={160} h={48} label="file c" sub="5 kb" />
        </g>
      </g>
      <g data-step="2">
        <rect className="pulse" x={396} y={112} width={8} height={8} fill="var(--accent)" />
        <rect className="pulse" x={216} y={160} width={8} height={8} fill="var(--accent)" />
        <rect className="pulse" x={576} y={160} width={8} height={8} fill="var(--accent)" />
      </g>
      <text
        className="sum"
        opacity={0}
        x={400}
        y={420}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={22}
        fill="var(--text)"
      >
        sizeBytes() → 25 kb
      </text>
    </SceneBoard>
  );
}
