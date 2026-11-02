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

const COL_X = 24;
const COL_W = 380;
const ROW_H = 24;

const FILTERS = [
  { name: 'SecurityContextHolderFilter', note: '' },
  { name: 'HeaderWriterFilter', note: '' },
  { name: 'CsrfFilter', note: 'disabled on this chain' },
  { name: 'BearerTokenAuthenticationFilter', note: 'authentication' },
  { name: 'ExceptionTranslationFilter', note: '401 / 403' },
  { name: 'AuthorizationFilter', note: 'URL rules' }
];
const FILTER_Y0 = 156;
const FILTER_GAP = 30;
const filterY = (i: number) => FILTER_Y0 + i * FILTER_GAP;

export function FilterChainScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.fc-pkt', { opacity: 0 });

      // step-0: DelegatingFilterProxy → FilterChainProxy → first matching chain
      tl.addLabel('step-0');
      tl.from('.fc-top', { opacity: 0, y: -6, stagger: 0.15, duration: 0.3 });
      tl.from('.fc-chain', { opacity: 0, stagger: 0.15, duration: 0.3 });
      tl.to('.fc-chain-web', { opacity: 0.3, duration: 0.3 });
      tl.from('.fc-filter', { opacity: 0, x: -6, stagger: 0.08, duration: 0.2 });
      tl.to({}, { duration: 0.5 });

      // step-1: authentication filter → ProviderManager → provider
      tl.addLabel('step-1');
      tl.to('.fc-pkt', { opacity: 1, duration: 0.1 });
      tl.to('.fc-pkt', { attr: { cy: filterY(3) + ROW_H / 2 }, duration: 0.8 });
      tl.from('.fc-authn', { opacity: 0, x: 8, duration: 0.35 });
      tl.to('.fc-l-authn', { strokeDashoffset: 0, duration: 0.4 });
      tl.from('.fc-provider', { opacity: 0, x: -4, stagger: 0.15, duration: 0.25 });
      tl.to({}, { duration: 0.6 });

      // step-2: SecurityContextHolder holds the Authentication
      tl.addLabel('step-2');
      tl.from('.fc-context', { opacity: 0, x: 8, duration: 0.35 });
      tl.from('.fc-ctx-line', { opacity: 0, x: -4, stagger: 0.15, duration: 0.25 });
      tl.to({}, { duration: 0.6 });

      // step-3: ExceptionTranslationFilter + AuthorizationFilter
      tl.addLabel('step-3');
      tl.to('.fc-pkt', { attr: { cy: filterY(5) + ROW_H / 2 }, duration: 0.6 });
      tl.from('.fc-etf', { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.3 });
      tl.from('.fc-authz-ok', {
        opacity: 0,
        scale: 0.85,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-4: DispatcherServlet → controller → @PreAuthorize proxy
      tl.addLabel('step-4');
      tl.to('.fc-pkt', { attr: { cy: 360 + ROW_H / 2 }, duration: 0.5 });
      tl.from('.fc-dispatch', { opacity: 0, duration: 0.3 });
      tl.from('.fc-method', { opacity: 0, x: 8, duration: 0.35 });
      tl.from('.fc-method-line', { opacity: 0, x: -4, stagger: 0.15, duration: 0.25 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>SPRING SECURITY · A REQUEST THROUGH THE FILTER CHAIN</SceneTitle>

      <g data-step="0">
        <g className="fc-top">
          <Chip
            x={COL_X}
            y={44}
            w={COL_W}
            h={ROW_H}
            label="POST /api/orders/7/cancel · Authorization: Bearer eyJ…"
            accent={CYAN}
            fontSize={8}
          />
        </g>
        <g className="fc-top">
          <Chip
            x={COL_X}
            y={76}
            w={COL_W}
            h={ROW_H}
            label="Servlet container → DelegatingFilterProxy → FilterChainProxy"
            accent={VIOLET}
            fontSize={8}
          />
        </g>
        <g className="fc-chain">
          <Chip
            x={COL_X}
            y={112}
            w={186}
            h={ROW_H}
            label="@Order(1) /api/** ✓ first match"
            accent={EMERALD}
            filled
            fontSize={7.5}
          />
        </g>
        <g className="fc-chain fc-chain-web">
          <Chip
            x={COL_X + 194}
            y={112}
            w={186}
            h={ROW_H}
            label="@Order(2) web chain ✗ skipped"
            accent="var(--border)"
            fontSize={7.5}
          />
        </g>
      </g>

      {FILTERS.map((f, i) => (
        <g key={f.name} className="fc-filter" data-step={i === 3 ? '1' : i >= 4 ? '3' : '0'}>
          <rect
            x={COL_X + 16}
            y={filterY(i)}
            width={COL_W - 16}
            height={ROW_H}
            rx={4}
            fill="var(--surface)"
            stroke={i === 3 ? AMBER : i === 2 ? 'var(--border)' : CYAN}
            strokeDasharray={i === 2 ? '4 3' : undefined}
          />
          <text
            x={COL_X + 28}
            y={filterY(i) + 16}
            fill={i === 2 ? 'var(--text-muted)' : 'var(--text)'}
            fontFamily={MONO}
            fontSize={8.5}
            fontWeight="bold"
          >
            {f.name}
          </text>
          <text
            x={COL_X + COL_W - 8}
            y={filterY(i) + 16}
            textAnchor="end"
            fill="var(--text-muted)"
            fontFamily={MONO}
            fontSize={7.5}
          >
            {f.note}
          </text>
        </g>
      ))}

      <g className="fc-dispatch" data-step="4">
        <Chip
          x={COL_X + 16}
          y={360}
          w={COL_W - 16}
          h={ROW_H}
          label="DispatcherServlet → OrderController.cancel(7)"
          accent={VIOLET}
          fontSize={8.5}
        />
      </g>

      <circle className="fc-pkt" cx={COL_X + 8} cy={filterY(0) + ROW_H / 2} r={5} fill={AMBER} />

      {/* Authentication */}
      <path
        className="fc-l-authn"
        d={`M ${COL_X + COL_W} ${filterY(3) + 12} L 424 ${filterY(3) + 12} L 424 100 L 440 100`}
        stroke={AMBER}
        strokeWidth={1.5}
        fill="none"
        strokeDasharray="200"
        strokeDashoffset={200}
      />
      <Panel
        x={440}
        y={44}
        w={336}
        h={110}
        accent={AMBER}
        className="fc-authn"
        title="AuthenticationManager"
        step="1"
      >
        {[
          'ProviderManager',
          '→ JwtAuthenticationProvider',
          '→ JwtDecoder: JWKS sig · iss · exp · nbf',
          '→ JwtAuthenticationToken(SCOPE_*)'
        ].map((l, i) => (
          <g key={l} className="fc-provider">
            <text x={12} y={40 + i * 16} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              {l}
            </text>
          </g>
        ))}
      </Panel>

      {/* SecurityContext */}
      <Panel
        x={440}
        y={168}
        w={336}
        h={96}
        accent={CYAN}
        className="fc-context"
        title="SecurityContextHolder (ThreadLocal)"
        step="2"
      >
        {[
          'SecurityContext',
          '└ Authentication principal = Jwt(sub=alice)',
          '  authorities = [SCOPE_orders.write]'
        ].map((l, i) => (
          <g key={l} className="fc-ctx-line">
            <text x={12} y={42 + i * 16} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              {l}
            </text>
          </g>
        ))}
      </Panel>

      {/* ExceptionTranslation + Authorization */}
      <g data-step="3">
        <g className="fc-etf">
          <Chip
            x={440}
            y={filterY(4)}
            w={164}
            h={ROW_H}
            label="no auth → 401 entry point"
            accent={ROSE}
            fontSize={7.5}
          />
          <Chip
            x={612}
            y={filterY(4)}
            w={164}
            h={ROW_H}
            label="denied → 403 handler"
            accent={ROSE}
            fontSize={7.5}
          />
        </g>
        <g className="fc-authz-ok">
          <Chip
            x={440}
            y={filterY(5)}
            w={336}
            h={ROW_H}
            label="✓ anyRequest().authenticated()"
            accent={EMERALD}
            filled
            fontSize={8}
          />
        </g>
      </g>

      {/* Method security */}
      <Panel
        x={440}
        y={346}
        w={336}
        h={96}
        accent={VIOLET}
        className="fc-method"
        title="AOP proxy · @PreAuthorize"
        step="4"
      >
        {[
          "hasAuthority('SCOPE_orders.write') ✓",
          '#order.ownerId == authentication.name ✓',
          '→ OrderService.cancel()   (this.cancel() skips it)'
        ].map((l, i) => (
          <g key={l} className="fc-method-line">
            <text x={12} y={40 + i * 16} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              {l}
            </text>
          </g>
        ))}
      </Panel>

      <text x={24} y={466} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        exactly one chain per request · authentication before authorization · first matching rule
        wins
      </text>
    </SceneBoard>
  );
}
