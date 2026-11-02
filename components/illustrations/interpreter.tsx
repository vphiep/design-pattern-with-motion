'use client';

import { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeCircle } from './shared/primitives';
import type { SceneProps } from './shared/types';

export default function InterpreterScene({
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
      tl.from('.src', { opacity: 0, duration: 0.3 });
      tl.from('.num', { y: 12, opacity: 0, stagger: 0.1, duration: 0.3 });
      tl.addLabel('step-1');
      tl.from('.op-plus', { opacity: 0, scale: 0.7, svgOrigin: '400 180', duration: 0.35 });
      tl.from('.op-mul', { opacity: 0, scale: 0.7, svgOrigin: '520 260', duration: 0.35 }, '<0.12');
      tl.from('.edge', { opacity: 0, duration: 0.3 }, '<');
      tl.addLabel('step-2');
      tl.to('.answer', { opacity: 1, duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        3 + 4 × 2
      </Caption>
      <text
        className="src"
        x={400}
        y={70}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={28}
        fill="var(--text-muted)"
      >
        3 + 4 * 2
      </text>
      <g className="edge" data-step="1">
        <path
          d="M400 86 V152 M400 208 L280 292 M400 208 L520 236 M520 284 L460 338 M520 284 L580 338"
          fill="none"
          stroke="var(--border)"
        />
      </g>
      <g className="op-plus" data-step="1">
        <NodeCircle cx={400} cy={180} r={28} label="+" />
      </g>
      <g className="op-mul" data-step="1">
        <NodeCircle cx={520} cy={260} r={24} label="×" />
      </g>
      <g data-step="0">
        <g className="num">
          <NodeCircle cx={280} cy={320} r={22} label="3" />
        </g>
        <g className="num">
          <NodeCircle cx={460} cy={360} r={22} label="4" />
        </g>
        <g className="num">
          <NodeCircle cx={580} cy={360} r={22} label="2" />
        </g>
      </g>
      <text
        className="answer"
        opacity={0}
        x={400}
        y={430}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize={28}
        fill="var(--accent)"
      >
        eval() → 11
      </text>
    </SceneBoard>
  );
}
