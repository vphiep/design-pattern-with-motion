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

const NODES = [
  { id: 'a', x: 272, y: 56, used: 3.6, note: 'Insufficient cpu', score: null },
  { id: 'b', x: 530, y: 56, used: 2.4, note: '', score: 71 },
  { id: 'c', x: 272, y: 182, used: 1.2, note: '', score: 88 },
  { id: 'd', x: 530, y: 182, used: 0.8, note: 'taint gpu=true:NoSchedule', score: null }
];
const NODE_W = 246;
const NODE_H = 112;
const CPU = 4;

export function K8sSchedulerScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      // step-0: API server pipeline → etcd
      tl.addLabel('step-0');
      tl.from('.ks-stage', { opacity: 0, x: -10, stagger: 0.18, duration: 0.3 });
      tl.from('.ks-pending', { opacity: 0, y: 6, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-1: filter
      tl.addLabel('step-1');
      tl.from('.ks-new-req', { opacity: 0, duration: 0.3 });
      tl.to(['.ks-node-a', '.ks-node-d'], { opacity: 0.35, duration: 0.4 });
      tl.from(
        '.ks-reject',
        { opacity: 0, scale: 0.7, transformOrigin: '50% 50%', stagger: 0.15, duration: 0.3 },
        '<'
      );
      tl.to({}, { duration: 0.6 });

      // step-2: score + bind
      tl.addLabel('step-2');
      tl.from('.ks-score', { opacity: 0, y: -6, stagger: 0.2, duration: 0.3 });
      tl.to('.ks-node-c .ks-frame', { stroke: EMERALD, strokeWidth: 2.6, duration: 0.3 });
      tl.from('.ks-binding', { opacity: 0, duration: 0.35 });
      tl.to({}, { duration: 0.6 });

      // step-3: kubelet runs it
      tl.addLabel('step-3');
      tl.from('.ks-pod', { opacity: 0, scale: 0.7, transformOrigin: '50% 50%', duration: 0.35 });
      tl.from('.ks-kubelet', { opacity: 0, x: -6, stagger: 0.15, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>KUBERNETES SCHEDULING · FILTER → SCORE → BIND → KUBELET</SceneTitle>

      <Panel
        x={24}
        y={56}
        w={230}
        h={238}
        accent={VIOLET}
        title="kube-apiserver"
        subtitle="kubectl apply -f pod.yaml"
        step="0"
      >
        {[
          'authn  (OIDC / SA token)',
          'authz  (RBAC)',
          'mutating admission',
          'validating admission',
          'etcd write (Raft quorum)'
        ].map((s, i) => (
          <g key={s} className="ks-stage">
            <Chip x={12} y={46 + i * 28} w={206} h={22} label={s} accent={VIOLET} fontSize={8} />
          </g>
        ))}
        <g className="ks-pending">
          <Chip
            x={12}
            y={190}
            w={206}
            h={26}
            label='Pod api-7f · nodeName=""'
            accent={AMBER}
            filled
            fontSize={8.5}
          />
        </g>
      </Panel>

      {NODES.map((n) => {
        const reqW = (n.used / CPU) * 200;
        const newW = (0.5 / CPU) * 200;
        return (
          <g key={n.id} className={`ks-node-${n.id}`} data-step={n.score ? '2,3' : '1'}>
            <rect
              className="ks-frame"
              x={n.x}
              y={n.y}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              fill="var(--surface)"
              stroke={CYAN}
              strokeWidth={1.4}
            />
            <text
              x={n.x + 12}
              y={n.y + 20}
              fill={CYAN}
              fontFamily={MONO}
              fontSize={10}
              fontWeight="bold"
            >
              node-{n.id}
            </text>
            <text x={n.x + 12} y={n.y + 36} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
              allocatable cpu 4 · requested {n.used}
            </text>
            <rect
              x={n.x + 12}
              y={n.y + 44}
              width={200}
              height={12}
              rx={3}
              fill="var(--bg)"
              stroke="var(--border)"
            />
            <rect
              x={n.x + 12}
              y={n.y + 44}
              width={reqW}
              height={12}
              rx={3}
              fill={CYAN}
              fillOpacity={0.55}
            />
            <rect
              className="ks-new-req"
              x={n.x + 12 + reqW}
              y={n.y + 44}
              width={newW}
              height={12}
              fill={n.used + 0.5 > CPU ? ROSE : AMBER}
              fillOpacity={0.85}
            />
            {n.note && (
              <g className="ks-reject">
                <Chip
                  x={n.x + 12}
                  y={n.y + 66}
                  w={222}
                  h={20}
                  label={`✗ ${n.note}`}
                  accent={ROSE}
                  fontSize={8}
                />
              </g>
            )}
            {n.score !== null && (
              <g className="ks-score">
                <text
                  x={n.x + 200}
                  y={n.y + 20}
                  fill={n.score > 80 ? EMERALD : 'var(--text-muted)'}
                  fontFamily={MONO}
                  fontSize={12}
                  fontWeight="bold"
                >
                  {n.score}
                </text>
              </g>
            )}
          </g>
        );
      })}

      <g className="ks-pod" data-step="3">
        <Chip
          x={284}
          y={248}
          w={160}
          h={22}
          label="api-7f · Running · 10.244.3.17"
          accent={EMERALD}
          filled
          fontSize={7.5}
        />
      </g>

      <Panel
        x={272}
        y={310}
        w={504}
        h={120}
        accent={AMBER}
        title="kube-scheduler"
        subtitle="watch Pods{nodeName=''} → Scheduling Framework"
        step="1,2"
      >
        <text x={12} y={56} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
          filter: NodeResourcesFit · TaintToleration · NodeAffinity · PodTopologySpread
        </text>
        <text x={12} y={72} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
          score : LeastAllocated · BalancedAllocation · ImageLocality
        </text>
        <g className="ks-binding" data-step="2">
          <text x={12} y={94} fill={EMERALD} fontFamily={MONO} fontSize={9} fontWeight="bold">
            POST pods/api-7f/binding → node-c (score 88)
          </text>
        </g>
      </Panel>

      <g transform="translate(24 310)">
        {[
          'kubelet@node-c sees the Pod',
          'CRI → containerd → runc',
          'CNI → Pod IP',
          'cgroups ← limits · QoS Burstable'
        ].map((s, i) => (
          <g key={s} className="ks-kubelet" data-step="3">
            <text x={0} y={16 + i * 18} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              {i === 0 ? '▶ ' : '  '}
              {s}
            </text>
          </g>
        ))}
      </g>
      <text x={24} y={452} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        fit uses REQUESTS: Σ requests + 0.5 ≤ 4 — node-a fails even if it is idle right now
      </text>
    </SceneBoard>
  );
}
