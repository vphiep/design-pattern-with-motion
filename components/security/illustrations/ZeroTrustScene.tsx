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

const GW = { x: 150, y: 190, w: 140, h: 84 };
const ORD = { x: 340, y: 190, w: 140, h: 84 };
const PAY = { x: 566, y: 172, w: 210, h: 150 };
const IDP = { x: 340, y: 50, w: 140, h: 76 };
const REV = { x: 340, y: 360, w: 140, h: 72 };

export function ZeroTrustScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.from(['.zt-client', '.zt-gw', '.zt-orders', '.zt-pay', '.zt-rev'], {
        opacity: 0,
        stagger: 0.1,
        duration: 0.3
      });

      // step-0: edge authentication at the gateway
      tl.addLabel('step-0');
      tl.to('.zt-l-client', { strokeDashoffset: 0, duration: 0.5 });
      tl.from('.zt-gw-check', { opacity: 0, x: -4, stagger: 0.15, duration: 0.25 });
      tl.to({}, { duration: 0.6 });

      // step-1: token exchange at the IdP
      tl.addLabel('step-1');
      tl.from('.zt-idp', { opacity: 0, duration: 0.3 });
      tl.to('.zt-l-up', { strokeDashoffset: 0, duration: 0.45 });
      tl.to('.zt-l-down', { strokeDashoffset: 0, duration: 0.45 });
      tl.from('.zt-new-token', {
        opacity: 0,
        scale: 0.9,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-2: STRICT mTLS with workload identities
      tl.addLabel('step-2');
      tl.to(['.zt-l-gw', '.zt-l-pay'], { strokeDashoffset: 0, stagger: 0.2, duration: 0.45 });
      tl.from('.zt-lock', {
        opacity: 0,
        scale: 0.7,
        transformOrigin: '50% 50%',
        stagger: 0.2,
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-3: per-workload AuthorizationPolicy at payments
      tl.addLabel('step-3');
      tl.from('.zt-policy', { opacity: 0, x: -4, stagger: 0.15, duration: 0.25 });
      tl.from('.zt-allow', { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-4: compromised service contained
      tl.addLabel('step-4');
      tl.to('.zt-rev-frame', { stroke: ROSE, strokeWidth: 2.4, duration: 0.3 });
      tl.to('.zt-l-rev', { strokeDashoffset: 0, duration: 0.5 });
      tl.from('.zt-deny', { opacity: 0, scale: 0.8, transformOrigin: '50% 50%', duration: 0.3 });
      tl.from('.zt-blast', { opacity: 0, duration: 0.3 });
    }
  });

  const link = (cls: string, d: string, accent: string, len: number, dashed = false) => (
    <path
      className={cls}
      d={d}
      stroke={accent}
      strokeWidth={1.8}
      fill="none"
      strokeDasharray={dashed ? `6 4` : `${len}`}
      strokeDashoffset={dashed ? undefined : len}
    />
  );

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>ZERO TRUST MICROSERVICES · VERIFY EVERY HOP</SceneTitle>

      <g className="zt-client" data-step="0">
        <Chip x={24} y={212} w={100} h={40} label="client + JWT" accent={CYAN} fontSize={9} />
      </g>

      <Panel {...GW} accent={AMBER} className="zt-gw" title="ingress gateway" step="0,2">
        {['sig via JWKS ✓', 'iss ✓  aud=shop-api ✓', 'exp ✓'].map((c, i) => (
          <g key={c} className="zt-gw-check">
            <text x={12} y={40 + i * 14} fill="var(--text)" fontFamily={MONO} fontSize={8}>
              {c}
            </text>
          </g>
        ))}
      </Panel>

      <Panel
        {...ORD}
        accent={CYAN}
        className="zt-orders"
        title="orders"
        subtitle="sa/orders"
        step="1,2,3"
      >
        <text x={12} y={60} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          spiffe://cluster.local/
        </text>
        <text x={12} y={72} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          ns/shop/sa/orders
        </text>
      </Panel>

      <Panel
        {...IDP}
        accent={VIOLET}
        className="zt-idp"
        title="IdP /token"
        subtitle="token-exchange"
        step="1"
      >
        <g className="zt-new-token">
          <Chip
            x={8}
            y={42}
            w={124}
            h={24}
            label="aud=payments act=orders"
            accent={VIOLET}
            filled
            fontSize={7}
          />
        </g>
      </Panel>

      <Panel
        {...PAY}
        accent={EMERALD}
        className="zt-pay"
        title="payments"
        subtitle="AuthorizationPolicy (PEP)"
        step="3,4"
      >
        {[
          'from: sa/orders',
          'to: POST /charges',
          'when: aud = payments',
          'everything else: deny-all'
        ].map((p, i) => (
          <g key={p} className="zt-policy">
            <text x={12} y={56 + i * 15} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              {p}
            </text>
          </g>
        ))}
        <g className="zt-allow">
          <Chip
            x={12}
            y={118}
            w={186}
            h={22}
            label="ALLOW orders → POST /charges"
            accent={EMERALD}
            filled
            fontSize={8}
          />
        </g>
      </Panel>

      <g className="zt-rev" data-step="4">
        <rect
          className="zt-rev-frame"
          x={REV.x}
          y={REV.y}
          width={REV.w}
          height={REV.h}
          rx={8}
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth={1.5}
        />
        <text
          x={REV.x + 12}
          y={REV.y + 20}
          fill={ROSE}
          fontFamily={MONO}
          fontSize={11}
          fontWeight="bold"
        >
          reviews
        </text>
        <text x={REV.x + 12} y={REV.y + 36} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          RCE → attacker shell
        </text>
        <text x={REV.x + 12} y={REV.y + 52} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          sa/reviews
        </text>
      </g>

      {/* links */}
      <g data-step="0">{link('zt-l-client', `M 124 232 L ${GW.x} 232`, CYAN, 30)}</g>
      <g data-step="2">
        {link('zt-l-gw', `M ${GW.x + GW.w} 232 L ${ORD.x} 232`, EMERALD, 50)}
        {link('zt-l-pay', `M ${ORD.x + ORD.w} 232 L ${PAY.x} 232`, EMERALD, 90)}
        <g className="zt-lock">
          <Chip
            x={GW.x + GW.w - 6}
            y={282}
            w={62}
            h={18}
            label="mTLS · SVID"
            accent={EMERALD}
            fontSize={7.5}
          />
        </g>
        <g className="zt-lock">
          <Chip
            x={ORD.x + ORD.w + 14}
            y={282}
            w={62}
            h={18}
            label="mTLS · SVID"
            accent={EMERALD}
            fontSize={7.5}
          />
        </g>
      </g>
      <g data-step="1">
        {link('zt-l-up', `M ${ORD.x + 40} ${ORD.y} L ${ORD.x + 40} ${IDP.y + IDP.h}`, VIOLET, 70)}
        {link(
          'zt-l-down',
          `M ${ORD.x + 100} ${IDP.y + IDP.h} L ${ORD.x + 100} ${ORD.y}`,
          VIOLET,
          70
        )}
        <text x={ORD.x - 96} y={164} fill={VIOLET} fontFamily={MONO} fontSize={7.5}>
          subject_token=user JWT
        </text>
      </g>
      <g data-step="4">
        {link(
          'zt-l-rev',
          `M ${REV.x + REV.w} ${REV.y + 30} L ${PAY.x} ${PAY.y + PAY.h - 20}`,
          ROSE,
          140
        )}
        <g className="zt-deny">
          <Chip
            x={PAY.x}
            y={PAY.y + PAY.h + 12}
            w={210}
            h={24}
            label="✗ 403 RBAC: access denied"
            accent={ROSE}
            filled
            fontSize={8.5}
          />
        </g>
        <g className="zt-blast">
          <text
            x={PAY.x}
            y={PAY.y + PAY.h + 56}
            fill="var(--text-muted)"
            fontFamily={MONO}
            fontSize={8}
          >
            NetworkPolicy drops it at L3/L4 too
          </text>
          <text
            x={PAY.x}
            y={PAY.y + PAY.h + 70}
            fill="var(--text-muted)"
            fontFamily={MONO}
            fontSize={8}
          >
            blast radius = allowed edges, not N−1
          </text>
        </g>
      </g>

      <text x={24} y={466} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        user identity at the edge · workload identity on every hop · authorization at every
        destination
      </text>
    </SceneBoard>
  );
}
