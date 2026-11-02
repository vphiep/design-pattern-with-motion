'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function ChainScene({
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
      tl.from('.desk', { opacity: 0, y: 10, stagger: 0.12, duration: 0.3 });
      tl.from('.link', { opacity: 0, duration: 0.25 }, '<0.15');
      tl.addLabel('step-1');
      tl.from('.ticket', { y: 16, opacity: 0, duration: 0.35 });
      tl.to('.pass-1', { opacity: 1, duration: 0.2 });
      tl.to('.ticket', { x: 270, duration: 0.55, ease: 'power2.inOut' });
      tl.addLabel('step-2');
      tl.to('.desk-tech .node-fill', { fill: 'var(--accent)', duration: 0.3 });
      tl.to('.desk-tech text', { fill: 'var(--bg)', duration: 0.3 }, '<');
      tl.to('.done', { opacity: 1, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        A TICKET WALKS THE CHAIN
      </Caption>
      <g data-step="0">
        <g className="desk">
          <NodeBox x={40} y={190} w={170} h={64} label="Billing" sub="canHandle?" />
        </g>
        <g className="desk desk-tech">
          <NodeBox x={310} y={190} w={170} h={64} label="Tech" sub="canHandle?" />
        </g>
        <g className="desk">
          <NodeBox x={580} y={190} w={170} h={64} label="Manager" />
        </g>
      </g>
      <g className="link" data-step="0">
        <line x1={210} y1={222} x2={310} y2={222} stroke="var(--border)" strokeWidth={1.25} />
        <line x1={480} y1={222} x2={580} y2={222} stroke="var(--border)" strokeWidth={1.25} />
      </g>
      <text
        className="pass-1"
        opacity={0}
        x={250}
        y={170}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill="var(--text-soft)"
      >
        pass
      </text>
      <g className="ticket" data-step="1,2">
        <rect x={70} y={300} width={120} height={44} fill="var(--accent)" />
        <text
          x={130}
          y={328}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fill="var(--bg)"
        >
          tech: fire
        </text>
      </g>
      <text
        className="done"
        opacity={0}
        x={395}
        y={400}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={20}
        fill="var(--text)"
      >
        Tech handled it
      </text>
    </SceneBoard>
  );
}
