'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox, NodeCircle, PulseRing } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function SingletonScene({
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
      tl.from('.caller', { opacity: 0, x: -18, stagger: 0.12, duration: 0.4 });
      tl.from('.ask-line', { opacity: 0, duration: 0.25 });
      tl.addLabel('step-1');
      tl.from('.instance', { scale: 0.4, opacity: 0, svgOrigin: '400 230', duration: 0.5 });
      tl.fromTo(
        '.pulse',
        { opacity: 0.9, scale: 0.6, svgOrigin: '400 230' },
        { opacity: 0, scale: 1.6, duration: 0.7 },
        '<0.15'
      );
      tl.to('.instance .node-fill', { fill: 'var(--accent)', duration: 0.3 });
      tl.to('.instance text', { fill: 'var(--bg)', duration: 0.3 }, '<');
      tl.addLabel('step-2');
      tl.from('.beam', { opacity: 0, duration: 0.2, stagger: 0.08 });
      tl.to('.caller-dot', { fill: 'var(--accent)', stagger: 0.1, duration: 0.2 });
      tl.to('.ghost', { opacity: 0.15, duration: 0.4 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        SINGLE INSTANCE
      </Caption>
      <Caption x={760} y={36} anchor="end" muted>
        rejected copies
      </Caption>

      <g className="ghost" opacity={0.35} data-step="1">
        <NodeCircle cx={560} cy={140} r={22} label="?" />
        <NodeCircle cx={620} cy={210} r={22} label="?" />
        <NodeCircle cx={560} cy={280} r={22} label="?" />
      </g>

      <g className="instance" data-step="1,2">
        <PulseRing className="pulse" cx={400} cy={230} r={52} />
        <NodeCircle cx={400} cy={230} r={40} label="one" fill="var(--surface)" />
      </g>

      {[
        { y: 110, name: 'A' },
        { y: 200, name: 'B' },
        { y: 290, name: 'C' },
        { y: 380, name: 'D' }
      ].map((c) => (
        <g key={c.name} className="caller" data-step="0,2">
          <NodeBox x={48} y={c.y - 24} w={110} h={48} label={`caller ${c.name}`} />
          <circle className="caller-dot" cx={174} cy={c.y} r={4} fill="var(--text-soft)" />
          <line
            className="ask-line"
            x1={182}
            y1={c.y}
            x2={352}
            y2={230}
            stroke="var(--text-soft)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <line
            className="beam"
            x1={352}
            y1={230}
            x2={182}
            y2={c.y}
            stroke="var(--accent)"
            strokeWidth={1.4}
          />
        </g>
      ))}
    </SceneBoard>
  );
}
