'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, Line, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const EMERALD = '#10b981';
const ROSE = '#f43f5e';
const CYAN = '#06b6d4';
const VIOLET = '#8b5cf6';

export function DualWriteScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.cdc-lane', { opacity: 0.25 });
      tl.set('.dw-packet', { x: 0, y: 0, opacity: 0 });
      tl.set('.cdc-packet', { x: 0, opacity: 0 });

      // step-0: app commits to the DB
      tl.addLabel('step-0');
      tl.to('.dw-packet', { opacity: 1, duration: 0.2 });
      tl.to('.dw-packet', { x: 72, duration: 0.6, ease: 'power2.out' });
      tl.from('.dw-db-row', { opacity: 0, x: -10, duration: 0.35 });
      tl.to({}, { duration: 0.8 });

      // step-1: publish to Kafka fails
      tl.addLabel('step-1');
      tl.to('.dw-packet', { x: 302, y: -25, duration: 0.5 });
      tl.from('.dw-fail', { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.3 });
      tl.to('.dw-packet', { opacity: 0, duration: 0.2 });
      tl.from('.dw-missing', { opacity: 0, duration: 0.3 });
      tl.from('.dw-diverged', { opacity: 0, y: 6, duration: 0.3 });
      tl.to({}, { duration: 0.8 });

      // step-2: log-based CDC — single write into WAL
      tl.addLabel('step-2');
      tl.to('.dw-lane', { opacity: 0.35, duration: 0.3 });
      tl.to('.cdc-lane', { opacity: 1, duration: 0.4 }, '<');
      tl.to('.cdc-packet', { opacity: 1, duration: 0.2 });
      tl.to('.cdc-packet', { x: 176, duration: 0.5 });
      tl.to('.wal-cell-3', { fill: EMERALD, fillOpacity: 0.35, duration: 0.3 });
      tl.from('.wal-lsn', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-3: Debezium publishes, derived stores converge
      tl.addLabel('step-3');
      tl.to('.cdc-packet', { x: 346, duration: 0.45 });
      tl.to('.cdc-packet', { x: 496, duration: 0.45 });
      tl.from('.cdc-kafka-rec', { opacity: 0, duration: 0.25 });
      tl.to('.cdc-packet', { x: 629, duration: 0.4 });
      tl.from('.cdc-search-ok', {
        opacity: 0,
        scale: 0.8,
        transformOrigin: '50% 50%',
        duration: 0.35
      });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>DUAL WRITE vs LOG-BASED CDC</SceneTitle>

      {/* Top lane: dual write */}
      <g className="dw-lane">
        <text x={24} y={56} fill={ROSE} fontFamily={MONO} fontSize={10} fontWeight="bold">
          ❌ DUAL WRITE
        </text>
        <Panel
          x={24}
          y={66}
          w={150}
          h={110}
          accent={VIOLET}
          title="OrderService"
          subtitle="@Transactional"
          step="0"
        >
          <Chip x={12} y={50} w={126} label="save(order)" accent={VIOLET} />
          <Chip x={12} y={78} w={126} label="kafka.send(evt)" accent={VIOLET} />
        </Panel>
        <Line x1={174} y1={128} x2={262} y2={128} accent="var(--border)" />
        <Panel
          x={262}
          y={66}
          w={170}
          h={110}
          accent={EMERALD}
          title="PostgreSQL"
          subtitle="orders"
          step="0"
        >
          <g className="dw-db-row">
            <Chip x={12} y={52} w={146} label="#42 PAID ✓ committed" accent={EMERALD} />
          </g>
        </Panel>
        <Line x1={432} y1={110} x2={540} y2={96} accent="var(--border)" dashed />
        <Panel
          x={540}
          y={60}
          w={110}
          h={60}
          accent={CYAN}
          title="Kafka"
          subtitle="orders"
          step="1"
        />
        <Panel x={540} y={128} w={236} h={56} accent={ROSE} title="Search index" step="1">
          <g className="dw-missing">
            <text x={12} y={42} fill={ROSE} fontFamily={MONO} fontSize={9}>
              #42 missing
            </text>
          </g>
        </Panel>
        <g className="dw-fail" data-step="1">
          <circle cx={492} cy={103} r={13} fill={ROSE} />
          <text
            x={492}
            y={108}
            textAnchor="middle"
            fill="#fff"
            fontFamily={MONO}
            fontSize={14}
            fontWeight="bold"
          >
            ✕
          </text>
        </g>
        <g className="dw-diverged" data-step="1">
          <Chip x={662} y={70} w={114} label="DIVERGED" accent={ROSE} filled />
        </g>
        <g className="dw-packet">
          <circle cx={190} cy={128} r={8} fill={VIOLET} />
          <text x={190} y={131} textAnchor="middle" fill="#fff" fontFamily={MONO} fontSize={7}>
            42
          </text>
        </g>
      </g>

      {/* Bottom lane: log-based CDC */}
      <g className="cdc-lane">
        <text x={24} y={236} fill={EMERALD} fontFamily={MONO} fontSize={10} fontWeight="bold">
          ✅ LOG-BASED CDC
        </text>
        <Panel
          x={24}
          y={248}
          w={130}
          h={92}
          accent={VIOLET}
          title="OrderService"
          subtitle="save(order) only"
          step="2"
        />
        <Panel
          x={190}
          y={248}
          w={150}
          h={92}
          accent={EMERALD}
          title="PostgreSQL"
          subtitle="WAL (append-only)"
          step="2"
        >
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              className={`wal-cell-${i}`}
              x={12 + i * 32}
              y={44}
              width={28}
              height={22}
              rx={3}
              fill="var(--bg)"
              stroke={EMERALD}
              strokeOpacity={0.6}
            />
          ))}
          <g className="wal-lsn">
            <text x={12} y={82} fill="var(--text)" fontFamily={MONO} fontSize={8}>
              COMMIT xid=771 · LSN 0/16B3748
            </text>
          </g>
        </Panel>
        <Panel
          x={370}
          y={268}
          w={130}
          h={72}
          accent={EMERALD}
          title="Debezium"
          subtitle="slot · pgoutput"
          step="3"
        />
        <Panel
          x={530}
          y={268}
          w={110}
          h={72}
          accent={CYAN}
          title="Kafka"
          subtitle="shop.public.orders"
          step="3"
        >
          <g className="cdc-kafka-rec">
            <Chip x={10} y={44} w={90} h={18} label="key=42 op=u" accent={CYAN} fontSize={7.5} />
          </g>
        </Panel>
        <Panel x={660} y={268} w={116} h={72} accent={EMERALD} title="Search" step="3">
          <g className="cdc-search-ok">
            <text x={12} y={46} fill={EMERALD} fontFamily={MONO} fontSize={9} fontWeight="bold">
              #42 ✓
            </text>
            <text x={12} y={60} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
              converged
            </text>
          </g>
        </Panel>
        <Line x1={154} y1={300} x2={190} y2={300} accent="var(--border)" />
        <Line x1={340} y1={304} x2={370} y2={304} accent="var(--border)" />
        <Line x1={500} y1={304} x2={530} y2={304} accent="var(--border)" />
        <Line x1={640} y1={304} x2={660} y2={304} accent="var(--border)" />
        <Line x1={89} y1={358} x2={718} y2={358} accent="var(--border)" dashed />
        <g className="cdc-packet">
          <circle cx={89} cy={358} r={8} fill={EMERALD} />
          <text x={89} y={361} textAnchor="middle" fill="#fff" fontFamily={MONO} fontSize={7}>
            42
          </text>
        </g>
      </g>

      <g transform="translate(24 420)">
        <text x={0} y={0} fill="var(--text-muted)" fontFamily={MONO} fontSize={9}>
          P(diverge) ≈ p_db + p_mq with two writes · = 0 with one write + log tailing
          (at-least-once, idempotent upsert)
        </text>
      </g>
    </SceneBoard>
  );
}
