'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Power } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function KafkaPartitionsReplicationScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [broker1Alive, setBroker1Alive] = useState(true);

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Hash Key & Route to Partition 0 Leader
      tl.addLabel('step-0');
      tl.from('.producer-card', { opacity: 0, x: -20, duration: 0.4 });
      tl.from('.hash-indicator', { opacity: 0, scale: 0.8, duration: 0.3 });

      // Step 1: Append to Leader Commit Log
      tl.addLabel('step-1');
      tl.from('.leader-log-cell', { fill: '#06b6d4', scale: 1.05, duration: 0.4 });
      tl.from('.offset-badge', { opacity: 0, y: 5, duration: 0.3 }, '<');

      // Step 2: Follower fetch & ISR synchronization
      tl.addLabel('step-2');
      tl.from('.sync-arrow', { strokeDashoffset: 50, duration: 0.4 });
      tl.to('.follower-log-cell', { fill: 'rgba(6, 182, 212, 0.25)', duration: 0.35 });

      // Step 3: High-Watermark Confirmed
      tl.addLabel('step-3');
      tl.to('.hw-line', { stroke: '#10b981', strokeWidth: 2.5, duration: 0.4 });
      tl.from('.producer-ack-alert', { opacity: 0, scale: 0.9, duration: 0.3 }, '<');
    }
  });

  return (
    <div className="relative">
      {/* Interactive Broker 1 Toggle Button */}
      <div className="absolute top-2.5 right-3 z-20 flex items-center">
        <button
          type="button"
          onClick={() => setBroker1Alive(!broker1Alive)}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shadow-sm border',
            broker1Alive
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600'
          )}
        >
          <Power size={12} />
          <span>{broker1Alive ? 'Tắt Broker 1' : 'Khôi phục Broker 1'}</span>
        </button>
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          KAFKA PARTITIONS &amp; REPLICATION · LEADER ELECTION &amp; ISR CONSENSUS
        </Caption>

        {/* 1. BROKER 1 (X: 35, Y: 65, Width: 235, Height: 275) */}
        <g
          className={cn(
            'broker-1-group transition-opacity duration-300',
            !broker1Alive && 'opacity-40'
          )}
        >
          <rect
            x={35}
            y={65}
            width={235}
            height={275}
            rx={10}
            fill="#080c16"
            stroke={broker1Alive ? '#06b6d4' : '#ef4444'}
            strokeWidth={1.8}
          />
          <text x={50} y={92} fill={broker1Alive ? '#06b6d4' : '#ef4444'} fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            {broker1Alive ? 'BROKER 1 (ID: 101)' : 'BROKER 1 (OFFLINE!)'}
          </text>
          <text x={50} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
            Rack: US-East-1a · Controller: No
          </text>

          {/* Partition 0 Replica */}
          <g transform="translate(50, 122)">
            <rect
              x={0}
              y={0}
              width={205}
              height={85}
              rx={6}
              fill={broker1Alive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(239, 68, 68, 0.1)'}
              stroke={broker1Alive ? '#06b6d4' : '#ef4444'}
              strokeWidth={1.2}
              className="leader-log-cell"
            />
            <text x={12} y={22} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Topic: orders [Partition 0]
            </text>
            <text x={12} y={40} fill={broker1Alive ? '#06b6d4' : '#ef4444'} fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              {broker1Alive ? '★ LEADER REPLICA' : '💀 FAILED / DEAD'}
            </text>
            <rect x={12} y={50} width={180} height={22} rx={4} fill="#030712" />
            <text x={20} y={65} fill="#34d399" fontFamily="var(--font-mono)" fontSize={9}>
              HW: 10,480 · LEO: 10,480
            </text>
          </g>

          {/* Partition 2 Follower Replica */}
          <g transform="translate(50, 220)">
            <rect x={0} y={0} width={205} height={85} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" className="follower-log-cell" />
            <text x={12} y={22} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={10}>
              Topic: orders [Partition 2]
            </text>
            <text x={12} y={40} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
              Follower (In-Sync ISR)
            </text>
            <rect x={12} y={50} width={180} height={22} rx={4} fill="#080c16" />
            <text x={20} y={65} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
              HW: 8,920 · Fetch Lag: 0ms
            </text>
          </g>
        </g>

        {/* 2. BROKER 2 (X: 290, Y: 65, Width: 235, Height: 275) */}
        <g className="broker-2-group">
          <rect
            x={290}
            y={65}
            width={235}
            height={275}
            rx={10}
            fill="#080c16"
            stroke={!broker1Alive ? '#10b981' : '#06b6d4'}
            strokeWidth={!broker1Alive ? 2 : 1.8}
          />
          <text x={305} y={92} fill={!broker1Alive ? '#10b981' : '#06b6d4'} fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            {!broker1Alive ? 'BROKER 2 (★ NEW LEADER P0)' : 'BROKER 2 (ID: 102)'}
          </text>
          <text x={305} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
            Rack: US-East-1b · Controller: No
          </text>

          {/* Partition 0 Replica (Follower or New Leader) */}
          <g transform="translate(305, 122)">
            <rect
              x={0}
              y={0}
              width={205}
              height={85}
              rx={6}
              fill={!broker1Alive ? 'rgba(16, 185, 129, 0.18)' : '#030712'}
              stroke={!broker1Alive ? '#10b981' : 'rgba(255,255,255,0.08)'}
              strokeWidth={!broker1Alive ? 1.5 : 1}
            />
            <text x={12} y={22} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Topic: orders [Partition 0]
            </text>
            <text x={12} y={40} fill={!broker1Alive ? '#10b981' : '#38bdf8'} fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              {!broker1Alive ? '★ ELECTED LEADER (via ISR)' : 'Follower Replica (ISR)'}
            </text>
            <rect x={12} y={50} width={180} height={22} rx={4} fill="#080c16" />
            <text x={20} y={65} fill={!broker1Alive ? '#34d399' : '#94a3b8'} fontFamily="var(--font-mono)" fontSize={9}>
              HW: 10,480 · Zero Data Loss
            </text>
          </g>

          {/* Partition 2 Leader Replica */}
          <g transform="translate(305, 220)">
            <rect x={0} y={0} width={205} height={85} rx={6} fill="rgba(6, 182, 212, 0.12)" stroke="#06b6d4" strokeWidth={1.2} />
            <text x={12} y={22} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Topic: orders [Partition 2]
            </text>
            <text x={12} y={40} fill="#06b6d4" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              ★ LEADER REPLICA
            </text>
            <rect x={12} y={50} width={180} height={22} rx={4} fill="#030712" />
            <text x={20} y={65} fill="#34d399" fontFamily="var(--font-mono)" fontSize={9}>
              HW: 8,920 · LEO: 8,920
            </text>
          </g>
        </g>

        {/* 3. BROKER 3 (X: 545, Y: 65, Width: 235, Height: 275) */}
        <g className="broker-3-group">
          <rect x={545} y={65} width={235} height={275} rx={10} fill="#080c16" stroke="#06b6d4" strokeWidth={1.8} />
          <text x={560} y={92} fill="#06b6d4" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
            BROKER 3 (ID: 103 · KRaft)
          </text>
          <text x={560} y={108} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
            Rack: US-East-1c · Active Controller
          </text>

          {/* Partition 1 Leader Replica */}
          <g transform="translate(560, 122)">
            <rect x={0} y={0} width={205} height={85} rx={6} fill="rgba(6, 182, 212, 0.12)" stroke="#06b6d4" strokeWidth={1.2} />
            <text x={12} y={22} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              Topic: orders [Partition 1]
            </text>
            <text x={12} y={40} fill="#06b6d4" fontFamily="var(--font-mono)" fontSize={10} fontWeight="bold">
              ★ LEADER REPLICA
            </text>
            <rect x={12} y={50} width={180} height={22} rx={4} fill="#030712" />
            <text x={20} y={65} fill="#34d399" fontFamily="var(--font-mono)" fontSize={9}>
              HW: 14,210 · LEO: 14,210
            </text>
          </g>

          {/* Partition 1 Follower Replica */}
          <g transform="translate(560, 220)">
            <rect x={0} y={0} width={205} height={85} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <text x={12} y={22} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={10}>
              Topic: orders [Partition 1]
            </text>
            <text x={12} y={40} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
              Follower (In-Sync ISR)
            </text>
            <rect x={12} y={50} width={180} height={22} rx={4} fill="#080c16" />
            <text x={20} y={65} fill="#64748b" fontFamily="var(--font-mono)" fontSize={9}>
              HW: 14,210 · Sync: 0ms
            </text>
          </g>
        </g>

        {/* CLUSTER ISR & QUORUM STATUS FOOTER (X: 35, Y: 355, Width: 745, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect x={0} y={0} width={745} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(16, 20)">
            <text x={0} y={10} fill="#06b6d4" fontFamily="var(--font-mono)" fontSize={11} fontWeight="bold">
              QUORUM &amp; ISR STATUS:
            </text>
            <text x={170} y={10} fill="#e2e8f0" fontFamily="var(--font-mono)" fontSize={11}>
              Partition 0 ISR: <tspan fill={broker1Alive ? '#34d399' : '#f87171'}>{broker1Alive ? '[Broker 1, Broker 2]' : '[Broker 2 (100% In-Sync)]'}</tspan> ·
              P1 ISR: <tspan fill="#34d399">[Broker 3, Broker 1]</tspan> ·
              P2 ISR: <tspan fill="#34d399">[Broker 2, Broker 3]</tspan>
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontFamily="var(--font-mono)" fontSize={9}>
              {broker1Alive
                ? 'min.insync.replicas=2 thỏa mãn: Khi Producer cấu hình acks=all, Leader ghi nhận ACK ngay khi Follower replicate xong.'
                : 'Cơ chế phục hồi sự cố: Khi Broker 1 sập, KRaft Controller lập tức loại Broker 1 khỏi ISR và bầu Broker 2 làm Leader mới mà không làm gián đoạn ghi.'}
            </text>
            <text x={0} y={28} fill="#64748b" fontFamily="var(--font-mono)" fontSize={8}>
              MurmurHash2(order_id) % 3 đảm bảo các sự kiện cùng ID luôn rơi vào đúng 1 partition cố định, bảo toàn thứ tự FIFO nghiêm ngặt.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
