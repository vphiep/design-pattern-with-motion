'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, Line, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const EMERALD = '#10b981';
const CYAN = '#06b6d4';
const AMBER = '#f59e0b';
const ROSE = '#f43f5e';
const VIOLET = '#8b5cf6';

export function OutboxRouterScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.ob-packet', { x: 0, y: 0, opacity: 0 });
      tl.set('.ob-dup', { x: 0, opacity: 0 });

      // step-0: one local transaction writes order + outbox
      tl.addLabel('step-0');
      tl.from('.ob-order-row', { opacity: 0, x: -10, duration: 0.35 });
      tl.from('.ob-outbox-row', { opacity: 0, x: -10, duration: 0.35 });
      tl.from('.ob-commit', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.8 });

      // step-1: outbox row deleted, WAL still carries the INSERT → Debezium captures
      tl.addLabel('step-1');
      tl.to('.ob-outbox-row', { opacity: 0.35, duration: 0.3 });
      tl.from('.ob-deleted', { opacity: 0, duration: 0.3 }, '<');
      tl.to('.ob-packet', { opacity: 1, duration: 0.15 });
      tl.to('.ob-packet', { x: 250, duration: 0.6 });
      tl.from('.ob-captured', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.7 });

      // step-2: EventRouter SMT derives topic, key, header
      tl.addLabel('step-2');
      tl.from('.ob-map', { opacity: 0, x: -8, stagger: 0.2, duration: 0.3 });
      tl.to('.ob-packet', { x: 470, y: -70, duration: 0.6 });
      tl.from('.ob-record', { opacity: 0, scale: 0.8, transformOrigin: '50% 50%', duration: 0.3 });
      tl.to('.ob-packet', { opacity: 0, duration: 0.2 });
      tl.to({}, { duration: 0.7 });

      // step-3: idempotent consumer; redelivery is a no-op
      tl.addLabel('step-3');
      tl.from('.ob-processed', { opacity: 0, y: 6, duration: 0.35 });
      tl.from('.ob-applied', { opacity: 0, duration: 0.3 });
      tl.to('.ob-dup', { opacity: 1, duration: 0.2 });
      tl.to('.ob-dup', { x: 120, duration: 0.5 });
      tl.from('.ob-skip', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>TRANSACTIONAL OUTBOX · DEBEZIUM EVENT ROUTER · IDEMPOTENT CONSUMER</SceneTitle>

      <Panel
        x={24}
        y={56}
        w={226}
        h={230}
        accent={VIOLET}
        title="order-service DB"
        subtitle="BEGIN … COMMIT (one local TX)"
        step="0"
      >
        <text x={12} y={60} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          orders
        </text>
        <g className="ob-order-row">
          <Chip x={12} y={66} w={200} label="42 · PAID · 129.90" accent={VIOLET} />
        </g>
        <text x={12} y={110} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          outbox
        </text>
        <g className="ob-outbox-row">
          <Chip x={12} y={116} w={200} label="9f1c · Order · 42 · OrderPlaced" accent={AMBER} />
        </g>
        <g className="ob-deleted" data-step="1">
          <text x={12} y={156} fill={ROSE} fontFamily={MONO} fontSize={8}>
            DELETE in same TX → table stays empty
          </text>
        </g>
        <g className="ob-commit">
          <Chip
            x={12}
            y={168}
            w={200}
            label="COMMIT → WAL keeps the INSERT"
            accent={EMERALD}
            filled
          />
        </g>
      </Panel>

      <Panel
        x={276}
        y={56}
        w={230}
        h={230}
        accent={EMERALD}
        title="Debezium"
        subtitle="table.include.list=public.outbox"
        step="1,2"
      >
        <g className="ob-captured">
          <Chip x={12} y={48} w={206} label="op=c  outbox 9f1c (from WAL)" accent={EMERALD} />
        </g>
        <text x={12} y={96} fill={AMBER} fontFamily={MONO} fontSize={9} fontWeight="bold">
          EventRouter SMT
        </text>
        {[
          'aggregatetype → topic outbox.event.Order',
          'aggregateid   → key "42"',
          'id            → header id=9f1c',
          'payload       → value OrderPlacedV1'
        ].map((l, i) => (
          <g key={l} className="ob-map" data-step="2">
            <text x={12} y={116 + i * 16} fill="var(--text)" fontFamily={MONO} fontSize={8}>
              {l}
            </text>
          </g>
        ))}
      </Panel>

      <Panel
        x={532}
        y={56}
        w={244}
        h={84}
        accent={CYAN}
        title="Kafka"
        subtitle="outbox.event.Order (key → partition)"
        step="2"
      >
        <g className="ob-record">
          <Chip
            x={12}
            y={46}
            w={220}
            h={22}
            label="key=42 · id=9f1c · OrderPlaced"
            accent={CYAN}
            filled
            fontSize={8}
          />
        </g>
      </Panel>

      <Panel
        x={532}
        y={156}
        w={244}
        h={180}
        accent={EMERALD}
        title="payment-service"
        subtitle="@Transactional listener"
        step="3"
      >
        <text x={12} y={60} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          processed_events (PK id)
        </text>
        <g className="ob-processed">
          <Chip x={12} y={66} w={220} label="9f1c ✓ inserted" accent={EMERALD} />
        </g>
        <g className="ob-applied">
          <text x={12} y={110} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
            authorize(order 42, 129.90) — once
          </text>
        </g>
        <g className="ob-skip">
          <Chip x={12} y={126} w={220} label="redelivered 9f1c → conflict → skip" accent={ROSE} />
        </g>
      </Panel>

      <Line x1={250} y1={170} x2={276} y2={170} accent="var(--border)" />
      <Line x1={506} y1={98} x2={532} y2={98} accent="var(--border)" />
      <Line x1={654} y1={140} x2={654} y2={156} accent="var(--border)" />

      <g className="ob-packet">
        <circle cx={140} cy={170} r={7} fill={AMBER} />
      </g>
      <g className="ob-dup">
        <circle cx={420} cy={300} r={7} fill={ROSE} />
        <text x={420} y={320} textAnchor="middle" fill={ROSE} fontFamily={MONO} fontSize={8}>
          dup
        </text>
      </g>

      <g transform="translate(24 420)">
        <text x={0} y={0} fill="var(--text-muted)" fontFamily={MONO} fontSize={9}>
          Event exists ⇔ business change committed · key=aggregateid keeps per-order ordering ·
          effects applied exactly once
        </text>
      </g>
    </SceneBoard>
  );
}
