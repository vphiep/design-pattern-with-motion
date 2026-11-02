'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const CYAN = '#06b6d4';
const ROSE = '#f43f5e';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';

// Chart geometry: two 100 ms CFS periods across 640 px.
const X0 = 120;
const PERIOD_W = 320;
const RUN_W = PERIOD_W / 8; // 8 threads share a 100 ms quota → 12.5 ms of wall time
const LANE_Y = 140;
const LANE_H = 14;
const THREADS = 8;

export function CgroupThrottleScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.cg-run', { scaleX: 0, transformOrigin: '0% 50%' });
      tl.set('.cg-mem-fill', { scaleX: 0.35, transformOrigin: '0% 50%' });

      // step-0: docker run writes the limits
      tl.addLabel('step-0');
      tl.from('.cg-file', { opacity: 0, x: -8, stagger: 0.15, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-1: 8 threads burn the quota in 12.5 ms
      tl.addLabel('step-1');
      tl.to('.cg-run-p0', { scaleX: 1, duration: 0.6, ease: 'none' });
      tl.from('.cg-quota-note', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-2: frozen until the period ends, then again
      tl.addLabel('step-2');
      tl.from('.cg-throttle-p0', {
        opacity: 0,
        scaleX: 0,
        transformOrigin: '0% 50%',
        duration: 0.6
      });
      tl.to('.cg-run-p1', { scaleX: 1, duration: 0.5, ease: 'none' });
      tl.from('.cg-throttle-p1', {
        opacity: 0,
        scaleX: 0,
        transformOrigin: '0% 50%',
        duration: 0.5
      });
      tl.from('.cg-stat', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-3: memory climbs past memory.max → OOM kill
      tl.addLabel('step-3');
      tl.to('.cg-mem-fill', { scaleX: 1, duration: 0.9, ease: 'power1.in' });
      tl.to('.cg-mem-fill', { fill: ROSE, duration: 0.2 });
      tl.from('.cg-oom', { opacity: 0, scale: 0.7, transformOrigin: '50% 50%', duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>CGROUP v2 · CFS BANDWIDTH THROTTLING &amp; MEMORY OOM</SceneTitle>

      <Panel x={24} y={44} w={752} h={56} accent={CYAN} step="0">
        {[
          'cpu.max = 100000 100000   (--cpus=1)',
          'memory.max = 536870912   (-m 512m)',
          'pids.max = 512'
        ].map((l, i) => (
          <g key={l} className="cg-file">
            <text x={14 + i * 260} y={33} fill="var(--text)" fontFamily={MONO} fontSize={9}>
              {l}
            </text>
          </g>
        ))}
      </Panel>

      {/* CFS periods */}
      <text x={24} y={126} fill="var(--text-muted)" fontFamily={MONO} fontSize={9}>
        8 runnable threads
      </text>
      {[0, 1].map((p) => (
        <g key={p}>
          <rect
            x={X0 + p * PERIOD_W}
            y={LANE_Y - 8}
            width={PERIOD_W}
            height={THREADS * LANE_H + 16}
            fill="none"
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <text
            x={X0 + p * PERIOD_W + 6}
            y={LANE_Y + THREADS * LANE_H + 24}
            fill="var(--text-muted)"
            fontFamily={MONO}
            fontSize={8}
          >
            period {p + 1} · 100 ms
          </text>
          {/* data-step on the wrapper: emphasis tweens fill-opacity of [data-step] nodes */}
          <g data-step="2">
            <rect
              className={`cg-throttle-p${p}`}
              x={X0 + p * PERIOD_W + RUN_W}
              y={LANE_Y - 4}
              width={PERIOD_W - RUN_W}
              height={THREADS * LANE_H + 4}
              fill={ROSE}
              fillOpacity={0.12}
              stroke={ROSE}
              strokeOpacity={0.5}
            />
          </g>
        </g>
      ))}
      {Array.from({ length: THREADS }, (_, t) => (
        <g key={t}>
          <text
            x={X0 - 28}
            y={LANE_Y + t * LANE_H + 9}
            fill="var(--text-muted)"
            fontFamily={MONO}
            fontSize={7.5}
          >
            T{t + 1}
          </text>
          {[0, 1].map((p) => (
            <rect
              key={p}
              className={`cg-run cg-run-p${p}`}
              data-step="1"
              x={X0 + p * PERIOD_W}
              y={LANE_Y + t * LANE_H}
              width={RUN_W}
              height={LANE_H - 4}
              rx={2}
              fill={EMERALD}
            />
          ))}
        </g>
      ))}
      <g className="cg-quota-note" data-step="1">
        <text x={X0 + RUN_W + 8} y={LANE_Y - 14} fill={EMERALD} fontFamily={MONO} fontSize={8.5}>
          8 × 12.5 ms = 100 ms quota used
        </text>
      </g>
      <g className="cg-stat" data-step="2">
        <text
          x={X0 + RUN_W + 40}
          y={LANE_Y + 60}
          fill={ROSE}
          fontFamily={MONO}
          fontSize={10}
          fontWeight="bold"
        >
          THROTTLED 87.5 ms
        </text>
        <text
          x={X0 + PERIOD_W + RUN_W + 40}
          y={LANE_Y + 60}
          fill={ROSE}
          fontFamily={MONO}
          fontSize={10}
          fontWeight="bold"
        >
          THROTTLED 87.5 ms
        </text>
        <text
          x={X0}
          y={LANE_Y + THREADS * LANE_H + 42}
          fill="var(--text)"
          fontFamily={MONO}
          fontSize={9}
        >
          cpu.stat: nr_periods 2 · nr_throttled 2 · throttled_usec 175000 → request p99 +87 ms
        </text>
      </g>

      {/* Memory gauge */}
      <Panel
        x={24}
        y={340}
        w={752}
        h={92}
        accent={AMBER}
        title="memory.current vs memory.max"
        step="3"
      >
        <rect
          x={14}
          y={36}
          width={600}
          height={22}
          rx={4}
          fill="var(--bg)"
          stroke="var(--border)"
        />
        <rect
          className="cg-mem-fill"
          x={14}
          y={36}
          width={612}
          height={22}
          rx={4}
          fill={AMBER}
          fillOpacity={0.75}
        />
        <line x1={614} y1={30} x2={614} y2={64} stroke={ROSE} strokeWidth={2} />
        <text x={560} y={76} fill={ROSE} fontFamily={MONO} fontSize={8}>
          memory.max 512Mi
        </text>
        <text x={14} y={76} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          heap (MaxRAMPercentage) + metaspace + thread stacks + direct buffers
        </text>
        <g className="cg-oom">
          <Chip
            x={636}
            y={34}
            w={104}
            h={26}
            label="OOMKilled 137"
            accent={ROSE}
            filled
            fontSize={9}
          />
        </g>
      </Panel>
    </SceneBoard>
  );
}
