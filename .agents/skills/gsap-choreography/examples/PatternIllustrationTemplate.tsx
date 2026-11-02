'use client';

import React, { useRef } from 'react';
import { useSceneTimeline } from './shared/useSceneTimeline';
import { SceneBoard } from './shared/SceneBoard';
import { Caption, NodeBox } from './shared/primitives';
import type { SceneProps } from './shared/types';

/**
 * Boilerplate illustration scene following repository architecture conventions.
 */
export default function NewPatternScene({
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
      // Step 0: Initial request/caller appears
      tl.addLabel('step-0');
      tl.from('.sender', { x: -35, opacity: 0, duration: 0.45 });

      // Step 1: Core pattern mechanism engages
      tl.addLabel('step-1');
      tl.from('.core-handler', {
        opacity: 0,
        scale: 0.9,
        svgOrigin: '400 220',
        duration: 0.45
      });
      tl.from('.line-input', { opacity: 0, duration: 0.25 }, '<0.1');

      // Step 2: Target action / result dispatched
      tl.addLabel('step-2');
      tl.from('.line-output', { opacity: 0, duration: 0.25 });
      tl.from('.result', { x: 35, opacity: 0, duration: 0.4 });
      tl.to('.core-handler .slot', { fill: 'var(--accent)', duration: 0.2 });
    }
  });

  return (
    <SceneBoard ref={ref}>
      <Caption x={40} y={36}>
        INVOCATION
      </Caption>
      <Caption x={760} y={36} anchor="end">
        EXECUTION
      </Caption>

      {/* Step 0: Caller */}
      <g className="sender" data-step="0">
        <NodeBox x={40} y={192} w={140} h={56} label="Client" sub="invoker" />
      </g>

      {/* Step 1: Intermediary Pattern Structure */}
      <line
        className="line-input"
        data-step="1"
        x1={180}
        y1={220}
        x2={320}
        y2={220}
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <g className="core-handler" data-step="1">
        <NodeBox x={320} y={180} w={160} h={80} label="PatternHandler" sub="mechanism" />
      </g>

      {/* Step 2: Target / Result */}
      <line
        className="line-output"
        data-step="2"
        x1={480}
        y1={220}
        x2={620}
        y2={220}
        stroke="var(--accent)"
        strokeWidth={1.5}
      />
      <g className="result" data-step="2">
        <NodeBox x={620} y={192} w={140} h={56} label="TargetService" sub="receiver" />
      </g>
    </SceneBoard>
  );
}
