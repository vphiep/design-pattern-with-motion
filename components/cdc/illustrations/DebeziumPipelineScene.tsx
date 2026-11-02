'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, Line, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const EMERALD = '#10b981';
const CYAN = '#06b6d4';
const AMBER = '#f59e0b';
const VIOLET = '#8b5cf6';

export function DebeziumPipelineScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.dbz-packet', { x: 0, y: 0, opacity: 0 });

      // step-0: REST registration → leader assigns the task
      tl.addLabel('step-0');
      tl.from('.dbz-rest', { opacity: 0, y: 12, duration: 0.4 });
      tl.to('.dbz-rest-arrow', { strokeDashoffset: 0, duration: 0.4 });
      tl.from('.dbz-task', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.4 });
      tl.to('.dbz-worker-1 .panel-frame', { strokeWidth: 2.6, duration: 0.3 }, '<');
      tl.to({}, { duration: 0.8 });

      // step-1: stream from the slot, build the envelope
      tl.addLabel('step-1');
      tl.to('.dbz-wal-3', { fill: EMERALD, fillOpacity: 0.4, duration: 0.3 });
      tl.to('.dbz-packet', { opacity: 1, duration: 0.15 });
      tl.to('.dbz-packet', { x: 150, duration: 0.55 });
      tl.from('.dbz-envelope', { opacity: 0, y: 10, duration: 0.4 });
      tl.to({}, { duration: 0.9 });

      // step-2: converter → produce keyed record
      tl.addLabel('step-2');
      tl.to('.dbz-packet', { x: 440, y: -26, duration: 0.6 });
      tl.from('.dbz-record', { opacity: 0, x: -10, duration: 0.3 });
      tl.to('.dbz-p1', { stroke: CYAN, strokeWidth: 2, duration: 0.3 }, '<');
      tl.to('.dbz-packet', { opacity: 0, duration: 0.2 });
      tl.to({}, { duration: 0.8 });

      // step-3: ack → offsets flushed → LSN confirmed back to the slot
      tl.addLabel('step-3');
      tl.from('.dbz-offset', { opacity: 0, x: -8, duration: 0.35 });
      tl.to('.dbz-ack-arrow', { strokeDashoffset: 0, duration: 0.6 });
      tl.to('.dbz-lsn-old', { opacity: 0, duration: 0.2 });
      tl.from('.dbz-lsn-new', { opacity: 0, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>DEBEZIUM ON KAFKA CONNECT · CHANGE EVENT ENVELOPE</SceneTitle>

      <Panel
        x={24}
        y={56}
        w={170}
        h={220}
        accent={EMERALD}
        title="PostgreSQL"
        subtitle="WAL + slot debezium"
        step="1"
      >
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(12 ${46 + i * 28})`}>
            <rect
              className={`dbz-wal-${i}`}
              width={146}
              height={22}
              rx={3}
              fill="var(--bg)"
              stroke={EMERALD}
              strokeOpacity={0.5}
            />
            <text x={8} y={15} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
              {
                [
                  '0/16B2F10 INSERT',
                  '0/16B3010 UPDATE',
                  '0/16B3500 COMMIT',
                  '0/16B3748 UPDATE #42'
                ][i]
              }
            </text>
          </g>
        ))}
        <text x={12} y={176} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          confirmed_flush_lsn
        </text>
        <text
          className="dbz-lsn-old"
          x={12}
          y={192}
          fill="var(--text)"
          fontFamily={MONO}
          fontSize={9}
        >
          0/16B3500
        </text>
        <text
          className="dbz-lsn-new"
          x={12}
          y={192}
          fill={EMERALD}
          fontFamily={MONO}
          fontSize={9}
          fontWeight="bold"
        >
          0/16B3748 ✓
        </text>
      </Panel>

      <Panel
        x={216}
        y={56}
        w={318}
        h={220}
        accent={VIOLET}
        title="Kafka Connect cluster"
        subtitle="group.id=cdc-connect"
        step="0"
      >
        <Panel
          x={12}
          y={44}
          w={92}
          h={66}
          accent={VIOLET}
          title="worker-1"
          subtitle="leader"
          className="dbz-worker-1"
        >
          <g className="dbz-task">
            <Chip
              x={8}
              y={42}
              w={76}
              h={18}
              label="orders-cdc-0"
              accent={EMERALD}
              filled
              fontSize={7.5}
            />
          </g>
        </Panel>
        <Panel x={113} y={44} w={92} h={66} accent="var(--border)" title="worker-2" />
        <Panel x={214} y={44} w={92} h={66} accent="var(--border)" title="worker-3" />
        <g className="dbz-envelope" data-step="1" transform="translate(12 120)">
          <rect width={294} height={88} rx={6} fill="var(--bg)" stroke={AMBER} />
          <text x={10} y={16} fill={AMBER} fontFamily={MONO} fontSize={9} fontWeight="bold">
            envelope · op = &quot;u&quot;
          </text>
          <text x={10} y={32} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            before: {'{'}id:42, status:&quot;NEW&quot;{'}'}
          </text>
          <text x={10} y={46} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
            after: {'{'}id:42, status:&quot;PAID&quot;{'}'}
          </text>
          <text x={10} y={60} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            source: {'{'}table:orders, lsn:0/16B3748, txId:771{'}'}
          </text>
          <text x={10} y={76} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            key = {'{'}id:42{'}'} → AvroConverter → schema id 17
          </text>
        </g>
      </Panel>

      <Panel
        x={556}
        y={56}
        w={220}
        h={220}
        accent={CYAN}
        title="Kafka"
        subtitle="shop.public.orders"
        step="2"
      >
        {[0, 1, 2].map((p) => (
          <g key={p} transform={`translate(12 ${46 + p * 30})`}>
            <rect
              className={`dbz-p${p}`}
              width={196}
              height={24}
              rx={3}
              fill="var(--bg)"
              stroke="var(--border)"
            />
            <text x={8} y={16} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
              P{p}
            </text>
          </g>
        ))}
        <g className="dbz-record">
          <Chip
            x={48}
            y={79}
            w={110}
            h={18}
            label="key=42 · op=u"
            accent={CYAN}
            filled
            fontSize={7.5}
          />
        </g>
        <text x={12} y={154} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          connect-offsets (compacted)
        </text>
        <rect
          x={12}
          y={162}
          width={196}
          height={24}
          rx={3}
          fill="var(--bg)"
          stroke={EMERALD}
          strokeOpacity={0.6}
        />
        <g className="dbz-offset" data-step="3">
          <text x={20} y={178} fill={EMERALD} fontFamily={MONO} fontSize={8}>
            {'{'}&quot;lsn&quot;:23824200,&quot;txId&quot;:771{'}'}
          </text>
        </g>
      </Panel>

      <g className="dbz-rest" data-step="0">
        <Chip
          x={216}
          y={300}
          w={318}
          h={24}
          label="PUT /connectors/orders-cdc/config  (REST :8083)"
          accent={VIOLET}
        />
      </g>
      <line
        className="dbz-rest-arrow"
        x1={300}
        y1={300}
        x2={300}
        y2={178}
        stroke={VIOLET}
        strokeWidth={1.6}
        strokeDasharray="130"
        strokeDashoffset={130}
      />

      <path
        className="dbz-ack-arrow"
        data-step="3"
        d="M 666 276 L 666 360 L 110 360 L 110 276"
        fill="none"
        stroke={EMERALD}
        strokeWidth={1.6}
        strokeDasharray="820"
        strokeDashoffset={820}
      />
      <text x={250} y={378} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        producer ack → offset flush → standby status update (flush LSN) → WAL before restart_lsn
        recycled
      </text>

      <Line x1={194} y1={176} x2={216} y2={176} accent="var(--border)" />
      <Line x1={534} y1={176} x2={556} y2={176} accent="var(--border)" />

      <g className="dbz-packet">
        <circle cx={150} cy={170} r={7} fill={EMERALD} />
      </g>

      <g transform="translate(24 420)">
        <text x={0} y={0} fill="var(--text-muted)" fontFamily={MONO} fontSize={9}>
          At-least-once: a crash between produce and offset flush replays ≤ λ ×
          offset.flush.interval.ms events.
        </text>
      </g>
    </SceneBoard>
  );
}
