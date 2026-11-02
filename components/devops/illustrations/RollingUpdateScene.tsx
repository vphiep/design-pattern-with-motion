'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const AMBER = '#f59e0b';
const ROSE = '#f43f5e';
const EMERALD = '#10b981';
const CYAN = '#06b6d4';
const VIOLET = '#8b5cf6';

const SLOT_X = (i: number) => 36 + i * 146;
const SLOT_Y = 214;
const SLOT_W = 124;
const SLOT_H = 84;

export function RollingUpdateScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.ru-v2-ready', { opacity: 0 });

      // step-0: new template hash → new ReplicaSet at 0
      tl.addLabel('step-0');
      tl.from('.ru-spec-change', { opacity: 0, y: -6, duration: 0.35 });
      tl.from('.ru-rs-new', { opacity: 0, x: 10, duration: 0.35 });
      tl.to({}, { duration: 0.6 });

      // step-1: surge one v2 Pod (not ready yet)
      tl.addLabel('step-1');
      tl.from('.ru-v2', { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.4 });
      tl.to('.ru-count-new', { opacity: 0, duration: 0.15 });
      tl.from('.ru-count-new-1', { opacity: 0, duration: 0.2 });
      tl.from('.ru-bound', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-2: readiness passes → joins the EndpointSlice
      tl.addLabel('step-2');
      tl.to('.ru-v2-starting', { opacity: 0, duration: 0.2 });
      tl.to('.ru-v2-ready', { opacity: 1, duration: 0.3 });
      tl.to('.ru-v2 .ru-frame', { stroke: EMERALD, strokeDasharray: '0', duration: 0.3 }, '<');
      tl.from('.ru-link-4', { opacity: 0, duration: 0.35 });
      tl.from('.ru-ep-4', { opacity: 0, duration: 0.3 }, '<');
      tl.to({}, { duration: 0.6 });

      // step-3: drain one v1 Pod gracefully
      tl.addLabel('step-3');
      tl.to('.ru-link-3', { opacity: 0, duration: 0.3 });
      tl.to('.ru-ep-3', { opacity: 0.2, duration: 0.3 }, '<');
      tl.to('.ru-pod-3 .ru-frame', { stroke: ROSE, duration: 0.3 }, '<');
      tl.from('.ru-term', { opacity: 0, duration: 0.3 });
      tl.to('.ru-pod-3', { opacity: 0.25, duration: 0.6, delay: 0.4 });
      tl.from('.ru-repeat', { opacity: 0, y: 6, duration: 0.35 });
    }
  });

  const pod = (i: number, version: 'v1' | 'v2') => (
    <g
      className={version === 'v2' ? 'ru-v2' : `ru-pod-${i}`}
      data-step={version === 'v2' ? '1,2' : i === 3 ? '3' : undefined}
    >
      <rect
        className="ru-frame"
        x={SLOT_X(i)}
        y={SLOT_Y}
        width={SLOT_W}
        height={SLOT_H}
        rx={8}
        fill="var(--surface)"
        stroke={version === 'v2' ? AMBER : CYAN}
        strokeWidth={1.6}
        strokeDasharray={version === 'v2' ? '5 4' : undefined}
      />
      <text
        x={SLOT_X(i) + 12}
        y={SLOT_Y + 22}
        fill={version === 'v2' ? VIOLET : CYAN}
        fontFamily={MONO}
        fontSize={10}
        fontWeight="bold"
      >
        {version === 'v2' ? 'api-7c4b-x9' : `api-6d9f-${['k2', 'p8', 'z1', 'q4'][i]}`}
      </text>
      <text
        x={SLOT_X(i) + 12}
        y={SLOT_Y + 38}
        fill="var(--text-muted)"
        fontFamily={MONO}
        fontSize={8.5}
      >
        image {version}
      </text>
      {version === 'v1' && (
        <text x={SLOT_X(i) + 12} y={SLOT_Y + 56} fill={EMERALD} fontFamily={MONO} fontSize={8.5}>
          Ready ✓
        </text>
      )}
    </g>
  );

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>DEPLOYMENT ROLLING UPDATE · R=4 · maxSurge=1 · maxUnavailable=0</SceneTitle>

      <Panel
        x={24}
        y={44}
        w={752}
        h={70}
        accent={AMBER}
        title="Service api → EndpointSlice (Ready Pods only)"
        step="2,3"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} className={`ru-ep-${i}`}>
            <Chip
              x={12 + i * 146}
              y={36}
              w={124}
              h={22}
              label={i === 4 ? 'v2 10.244.3.21' : `v1 10.244.${i}.1${i}`}
              accent={i === 4 ? VIOLET : CYAN}
              fontSize={8}
            />
          </g>
        ))}
      </Panel>

      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          className={`ru-link-${i}`}
          x1={SLOT_X(i) + SLOT_W / 2}
          y1={114}
          x2={SLOT_X(i) + SLOT_W / 2}
          y2={SLOT_Y}
          stroke={i === 4 ? VIOLET : CYAN}
          strokeWidth={1.6}
          strokeOpacity={0.7}
        />
      ))}

      <g className="ru-spec-change" data-step="0">
        <Chip
          x={24}
          y={130}
          w={330}
          h={24}
          label="spec.template.image: v1 → v2  (new pod-template-hash)"
          accent={AMBER}
          fontSize={8.5}
        />
      </g>
      <g data-step="0">
        <Chip
          x={420}
          y={130}
          w={170}
          h={24}
          label="RS api-6d9f (v1) · 4"
          accent={CYAN}
          fontSize={8.5}
        />
      </g>
      <g className="ru-rs-new" data-step="0,1">
        <rect x={606} y={130} width={170} height={24} rx={4} fill="var(--bg)" stroke={VIOLET} />
        <text
          className="ru-count-new"
          x={691}
          y={145}
          textAnchor="middle"
          fill="var(--text)"
          fontFamily={MONO}
          fontSize={8.5}
        >
          RS api-7c4b (v2) · 0
        </text>
        <text
          className="ru-count-new-1"
          x={691}
          y={145}
          textAnchor="middle"
          fill={VIOLET}
          fontFamily={MONO}
          fontSize={8.5}
          fontWeight="bold"
        >
          RS api-7c4b (v2) · 1
        </text>
      </g>
      <g className="ru-bound" data-step="1">
        <text x={24} y={186} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
          total 5 ≤ R + maxSurge (5) · available 4 ≥ R − maxUnavailable (4)
        </text>
      </g>

      {[0, 1, 2, 3].map((i) => (
        <g key={i}>{pod(i, 'v1')}</g>
      ))}
      {pod(4, 'v2')}
      <g className="ru-v2-starting">
        <text x={SLOT_X(4) + 12} y={SLOT_Y + 56} fill={AMBER} fontFamily={MONO} fontSize={8.5}>
          startup/readiness…
        </text>
      </g>
      <g className="ru-v2-ready">
        <text x={SLOT_X(4) + 12} y={SLOT_Y + 56} fill={EMERALD} fontFamily={MONO} fontSize={8.5}>
          Ready ✓ (in endpoints)
        </text>
      </g>

      <g className="ru-term" data-step="3">
        <Chip x={SLOT_X(3) - 10} y={SLOT_Y + SLOT_H + 10} w={150} h={34} label="" accent={ROSE} />
        <text x={SLOT_X(3) - 2} y={SLOT_Y + SLOT_H + 24} fill={ROSE} fontFamily={MONO} fontSize={8}>
          Terminating: out of EPs
        </text>
        <text x={SLOT_X(3) - 2} y={SLOT_Y + SLOT_H + 37} fill={ROSE} fontFamily={MONO} fontSize={8}>
          preStop sleep 8 → SIGTERM
        </text>
      </g>

      <g className="ru-repeat" data-step="3">
        <text x={24} y={404} fill="var(--text)" fontFamily={MONO} fontSize={9.5}>
          repeat ×3 → RS v2 = 4, RS v1 = 0 (kept for `kubectl rollout undo`)
        </text>
        <text x={24} y={422} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
          level-triggered: if the controller restarts mid-rollout it recomputes from spec vs status
          and continues
        </text>
      </g>
    </SceneBoard>
  );
}
