'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const ROSE = '#f43f5e';
const VIOLET = '#8b5cf6';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const CYAN = '#06b6d4';

const PDP_X = 264;
const PDP_W = 300;
const DEC_X = 584;

const ABAC_CHECKS = [
  'subject.dept == resource.dept   finance ✓',
  'resource.amount ≤ subject.limit 3,200 ≤ 5,000 ✓',
  'resource.submitter ≠ subject    bob ≠ alice ✓',
  'env.hour < 18                   14:20 ✓'
];

const GRAPH = [
  { id: 'user:alice', x: 12 },
  { id: 'group:eng', x: 82 },
  { id: 'folder:plans', x: 152 },
  { id: 'doc:q3', x: 222 }
];
const GRAPH_EDGES = ['member', 'viewer', 'parent'];

export function AuthzEngineScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.from('.az-request', { opacity: 0, x: -10, duration: 0.35 });

      // step-0: RBAC — role → permission
      tl.addLabel('step-0');
      tl.from('.az-rbac', { opacity: 0, duration: 0.3 });
      tl.from('.az-rbac-line', { opacity: 0, x: -6, stagger: 0.2, duration: 0.25 });
      tl.from('.az-dec-rbac', {
        opacity: 0,
        scale: 0.85,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-1: ABAC — attributes & context
      tl.addLabel('step-1');
      tl.from('.az-abac', { opacity: 0, duration: 0.3 });
      tl.from('.az-abac-line', { opacity: 0, x: -6, stagger: 0.22, duration: 0.25 });
      tl.from('.az-dec-abac', {
        opacity: 0,
        scale: 0.85,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-2: ReBAC — traverse relationship tuples
      tl.addLabel('step-2');
      tl.from('.az-rebac', { opacity: 0, duration: 0.3 });
      tl.from('.az-node', {
        opacity: 0,
        scale: 0.8,
        transformOrigin: '50% 50%',
        stagger: 0.18,
        duration: 0.25
      });
      tl.from('.az-edge', { opacity: 0, stagger: 0.2, duration: 0.25 });
      tl.from('.az-dec-rebac', {
        opacity: 0,
        scale: 0.85,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-3: object-level check, deny by default
      tl.addLabel('step-3');
      tl.from('.az-idor', { opacity: 0, y: 8, duration: 0.35 });
      tl.from('.az-dec-idor', {
        opacity: 0,
        scale: 0.85,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>PEP → PDP: RBAC · ABAC · ReBAC · DENY BY DEFAULT</SceneTitle>

      <Panel
        x={24}
        y={48}
        w={220}
        h={226}
        accent={CYAN}
        className="az-request"
        title="request (PEP)"
        subtitle="POST /expenses/77/approve"
        step="0,1,2,3"
      >
        {[
          ['subject', 'alice · roles [MANAGER]'],
          ['', 'dept finance · limit 5,000'],
          ['action', 'APPROVE'],
          ['resource', 'expense/77 · finance'],
          ['', 'amount 3,200 · by bob'],
          ['env', '14:20 Asia/Ho_Chi_Minh']
        ].map(([k, v], i) => (
          <g key={`${k}-${i}`}>
            <text
              x={12}
              y={58 + i * 24}
              fill={CYAN}
              fontFamily={MONO}
              fontSize={8}
              fontWeight="bold"
            >
              {k}
            </text>
            <text x={70} y={58 + i * 24} fill="var(--text)" fontFamily={MONO} fontSize={8}>
              {v}
            </text>
          </g>
        ))}
      </Panel>

      {/* RBAC */}
      <Panel
        x={PDP_X}
        y={48}
        w={PDP_W}
        h={86}
        accent={AMBER}
        className="az-rbac"
        title="RBAC"
        step="0"
      >
        {['alice ∈ MANAGER  (user → role)', 'MANAGER → expense:approve  (role → perm)'].map(
          (l, i) => (
            <g key={l} className="az-rbac-line">
              <text x={12} y={44 + i * 16} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
                {l}
              </text>
            </g>
          )
        )}
        <text x={12} y={78} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          coarse: any manager passes, for any expense
        </text>
      </Panel>
      <g className="az-dec-rbac" data-step="0">
        <Chip
          x={DEC_X}
          y={78}
          w={192}
          h={24}
          label="✓ functional right"
          accent={AMBER}
          fontSize={9}
        />
      </g>

      {/* ABAC */}
      <Panel
        x={PDP_X}
        y={144}
        w={PDP_W}
        h={112}
        accent={VIOLET}
        className="az-abac"
        title="ABAC"
        step="1"
      >
        {ABAC_CHECKS.map((l, i) => (
          <g key={l} className="az-abac-line">
            <text x={12} y={42 + i * 17} fill="var(--text)" fontFamily={MONO} fontSize={8}>
              {l}
            </text>
          </g>
        ))}
      </Panel>
      <g className="az-dec-abac" data-step="1">
        <Chip
          x={DEC_X}
          y={188}
          w={192}
          h={24}
          label="ALLOW approve expense/77"
          accent={EMERALD}
          filled
          fontSize={9}
        />
      </g>

      {/* ReBAC */}
      <Panel
        x={PDP_X}
        y={266}
        w={PDP_W}
        h={112}
        accent={EMERALD}
        className="az-rebac"
        title="ReBAC (Zanzibar tuples)"
        step="2"
      >
        {GRAPH.map((n, i) => (
          <g key={n.id} className="az-node">
            <Chip
              x={n.x}
              y={36}
              w={64}
              h={22}
              label={n.id}
              accent={i === 0 ? CYAN : EMERALD}
              fontSize={6.5}
            />
          </g>
        ))}
        {GRAPH_EDGES.map((e, i) => (
          <g key={e} className="az-edge">
            <line
              x1={GRAPH[i].x + 64}
              y1={47}
              x2={GRAPH[i + 1].x}
              y2={47}
              stroke={EMERALD}
              strokeWidth={1.4}
            />
            <text x={GRAPH[i].x + 46} y={72} fill={EMERALD} fontFamily={MONO} fontSize={7}>
              {e}
            </text>
          </g>
        ))}
        <text x={12} y={92} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          folder:plans#viewer@group:eng#member
        </text>
        <text x={12} y={104} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          doc:q3#parent@folder:plans → viewer inherited
        </text>
      </Panel>
      <g className="az-dec-rebac" data-step="2">
        <Chip
          x={DEC_X}
          y={310}
          w={192}
          h={24}
          label="ALLOW alice viewer doc:q3"
          accent={EMERALD}
          filled
          fontSize={9}
        />
      </g>

      {/* Object-level / deny by default */}
      <g className="az-idor" data-step="3">
        <rect
          x={24}
          y={392}
          width={540}
          height={60}
          rx={8}
          fill="var(--surface)"
          stroke={ROSE}
          strokeWidth={1.5}
        />
        <text x={36} y={414} fill={ROSE} fontFamily={MONO} fontSize={10} fontWeight="bold">
          user 42 → GET /orders/43
        </text>
        <text x={36} y={430} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
          valid token ✓ · owner(order 43) = 43 ≠ 42 ✗ · no rule allows it
        </text>
        <text x={36} y={444} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          deny by default · respond 404 so the object’s existence is not revealed
        </text>
      </g>
      <g className="az-dec-idor" data-step="3">
        <Chip
          x={DEC_X}
          y={410}
          w={192}
          h={24}
          label="DENY (IDOR / BOLA)"
          accent={ROSE}
          filled
          fontSize={9}
        />
      </g>
    </SceneBoard>
  );
}
