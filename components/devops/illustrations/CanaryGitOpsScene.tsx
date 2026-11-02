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

const BAR_X = 330;
const BAR_W = 440;
const BAR_Y = 214;

export function CanaryGitOpsScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.cg-canary', { attr: { width: 0 } });
      tl.set('.cg-w', { opacity: 0 });

      // step-0: CI commits the digest to Git
      tl.addLabel('step-0');
      tl.from('.cg-commit', { opacity: 0, x: -10, duration: 0.4 });
      tl.to({}, { duration: 0.6 });

      // step-1: Argo CD pulls and syncs
      tl.addLabel('step-1');
      tl.to('.cg-pull', { strokeDashoffset: 0, duration: 0.5 });
      tl.from('.cg-outofsync', { opacity: 0, duration: 0.25 });
      tl.to('.cg-outofsync', { opacity: 0, duration: 0.25, delay: 0.4 });
      tl.from('.cg-synced', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.5 });

      // step-2: 10% canary + analysis
      tl.addLabel('step-2');
      tl.to('.cg-canary', { attr: { width: BAR_W * 0.1 }, duration: 0.6 });
      tl.to('.cg-w-10', { opacity: 1, duration: 0.2 }, '<');
      tl.from('.cg-metric', { opacity: 0, x: -8, stagger: 0.2, duration: 0.3 });
      tl.to({}, { duration: 0.7 });

      // step-3: promote stepwise (or abort)
      tl.addLabel('step-3');
      for (const [w, prev] of [
        [25, 10],
        [50, 25],
        [100, 50]
      ] as const) {
        tl.to(`.cg-w-${prev}`, { opacity: 0, duration: 0.15 });
        tl.to('.cg-canary', { attr: { width: (BAR_W * w) / 100 }, duration: 0.5 }, '<');
        tl.to(`.cg-w-${w}`, { opacity: 1, duration: 0.2 });
        tl.to({}, { duration: 0.3 });
      }
      tl.from('.cg-promoted', {
        opacity: 0,
        scale: 0.8,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.from('.cg-abort', { opacity: 0, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>GITOPS (ARGO CD) + PROGRESSIVE DELIVERY (ARGO ROLLOUTS)</SceneTitle>

      <Panel
        x={24}
        y={50}
        w={270}
        h={110}
        accent={VIOLET}
        title="deploy-config.git"
        subtitle="envs/prod/api/rollout.yaml"
        step="0"
      >
        <text x={12} y={58} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
          - image: …api@sha256:v1
        </text>
        <g className="cg-commit">
          <Chip
            x={12}
            y={66}
            w={246}
            h={22}
            label="+ image: …api@sha256:v2  (PR #482 merged)"
            accent={VIOLET}
            fontSize={8}
          />
        </g>
      </Panel>

      <path
        className="cg-pull"
        d="M 159 220 L 159 160"
        stroke={AMBER}
        strokeWidth={1.8}
        strokeDasharray="60"
        strokeDashoffset={60}
        fill="none"
      />
      <text x={168} y={196} fill={AMBER} fontFamily={MONO} fontSize={8}>
        pull (no inbound creds)
      </text>

      <Panel
        x={24}
        y={220}
        w={270}
        h={92}
        accent={AMBER}
        title="Argo CD Application api-prod"
        subtitle="automated: prune + selfHeal"
        step="1"
      >
        <g className="cg-outofsync">
          <Chip
            x={12}
            y={50}
            w={246}
            h={24}
            label="OutOfSync · diff: image v1 → v2"
            accent={ROSE}
            fontSize={8.5}
          />
        </g>
        <g className="cg-synced">
          <Chip
            x={12}
            y={50}
            w={246}
            h={24}
            label="Synced · Rollout updated"
            accent={EMERALD}
            filled
            fontSize={8.5}
          />
        </g>
      </Panel>

      <Panel
        x={318}
        y={50}
        w={458}
        h={110}
        accent={CYAN}
        title="Argo Rollouts · canary steps"
        subtitle="HTTPRoute weights (Gateway API plugin)"
        step="2,3"
      >
        {[
          'setWeight 10',
          'pause 5m + analysis',
          'setWeight 25',
          'pause 5m',
          'setWeight 50',
          'pause 10m',
          '100%'
        ].map((s, i) => (
          <text
            key={s}
            x={12 + (i % 4) * 112}
            y={60 + Math.floor(i / 4) * 18}
            fill="var(--text)"
            fontFamily={MONO}
            fontSize={8.5}
          >
            {i + 1}. {s}
          </text>
        ))}
      </Panel>

      <g data-step="2,3">
        <text x={BAR_X} y={BAR_Y - 10} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
          live traffic split
        </text>
        <rect
          x={BAR_X}
          y={BAR_Y}
          width={BAR_W}
          height={30}
          rx={6}
          fill={CYAN}
          fillOpacity={0.35}
          stroke={CYAN}
        />
        <rect
          className="cg-canary"
          x={BAR_X}
          y={BAR_Y}
          width={0}
          height={30}
          rx={6}
          fill={VIOLET}
          fillOpacity={0.85}
        />
        {[10, 25, 50, 100].map((w) => (
          <text
            key={w}
            className={`cg-w cg-w-${w}`}
            x={BAR_X + BAR_W - 10}
            y={BAR_Y + 20}
            textAnchor="end"
            fill="var(--text)"
            fontFamily={MONO}
            fontSize={10}
            fontWeight="bold"
          >
            canary v2 {w}% · stable v1 {100 - w}%
          </text>
        ))}
      </g>

      <Panel
        x={318}
        y={262}
        w={458}
        h={110}
        accent={EMERALD}
        title="AnalysisRun · canary-only metrics (Prometheus)"
        step="2"
      >
        <g className="cg-metric">
          <text x={12} y={46} fill="var(--text)" fontFamily={MONO} fontSize={9}>
            success-rate(api-canary) = 99.7% ≥ 99% ✓
          </text>
        </g>
        <g className="cg-metric">
          <text x={12} y={64} fill="var(--text)" fontFamily={MONO} fontSize={9}>
            p99 latency(api-canary) = 212 ms &lt; 300 ms ✓
          </text>
        </g>
        <g className="cg-metric">
          <text x={12} y={82} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            failureLimit 1 → second failed measurement aborts the rollout
          </text>
        </g>
      </Panel>

      <g className="cg-promoted" data-step="3">
        <Chip
          x={318}
          y={386}
          w={220}
          h={28}
          label="✓ fully promoted · v2 = stable"
          accent={EMERALD}
          filled
          fontSize={9}
        />
      </g>
      <g className="cg-abort" data-step="3">
        <Chip
          x={556}
          y={386}
          w={220}
          h={28}
          label="✗ on failure: abort → 100% v1"
          accent={ROSE}
          fontSize={9}
        />
      </g>

      <text x={24} y={346} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        E[failed req] = w · λ · t_detect · p_err
      </text>
      <text x={24} y={362} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        10% canary ⇒ 10× smaller blast radius
      </text>
      <text x={24} y={378} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        rollback = git revert (audited)
      </text>
    </SceneBoard>
  );
}
