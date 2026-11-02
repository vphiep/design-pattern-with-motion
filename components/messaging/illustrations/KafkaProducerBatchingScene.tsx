'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Layers, Zap, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function KafkaProducerBatchingScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<'batch' | 'single'>('batch');

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Thread Appends to RecordBuffer
      tl.addLabel('step-0');
      tl.from('.producer-app-box', { opacity: 0, x: -20, duration: 0.35 });
      tl.from('.buffer-pool-box', { opacity: 0, scale: 0.95, duration: 0.35 }, '<0.1');

      // Step 1: Accumulate Batch (linger.ms)
      tl.addLabel('step-1');
      tl.from('.batch-slot', { opacity: 0, scale: 0.8, stagger: 0.08, duration: 0.4 });
      tl.from('.linger-timer-ring', { strokeDashoffset: 100, duration: 0.4 }, '<');

      // Step 2: LZ4 Compression & Single Dispatch
      tl.addLabel('step-2');
      tl.to('.batch-slot', { scale: 0.95, fill: '#06b6d4', duration: 0.3 });
      tl.from('.compression-badge', { opacity: 0, y: -5, duration: 0.3 }, '<');
      tl.from('.dispatch-flight-packet', { opacity: 0, x: -30, duration: 0.4 });

      // Step 3: All In-Sync Replicas ACK
      tl.addLabel('step-3');
      tl.from('.broker-network-box', { stroke: '#10b981', duration: 0.35 });
      tl.from('.ack-all-beacon', { opacity: 0, scale: 0.8, duration: 0.3 }, '<');
    }
  });

  return (
    <div className="relative">
      {/* Interactive Mode Switcher */}
      <div className="absolute top-2.5 right-3 z-20 flex items-center gap-1.5 p-1 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border-soft">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={cn(
              'px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all flex items-center gap-1.5',
              mode === 'single'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <Zap size={12} />
            <span>Single (linger=0)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={cn(
              'px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all flex items-center gap-1.5',
              mode === 'batch'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <Layers size={12} />
            <span>Batch 64KB (LZ4)</span>
          </button>
        </div>
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          KAFKA PRODUCER · RECORD ACCUMULATOR, LINGER.MS &amp; COMPRESSION PIPELINE
        </Caption>

        {/* 1. App Threads (X: 35, Y: 65, Width: 165, Height: 275) */}
        <g className="producer-app-box">
          <rect
            x={35}
            y={65}
            width={165}
            height={275}
            rx={10}
            fill="#080c16"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1.5}
          />
          <text x={48} y={92} fill="#94a3b8" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            APP THREADS (JVM)
          </text>
          <text x={48} y={108} fill="#64748b" fontSize={9} fontFamily="var(--font-mono)">
            kafkaTemplate.send()
          </text>

          {/* Simulated Thread Invocations */}
          {[0, 1, 2, 3].map((idx) => (
            <g key={idx} transform={`translate(48, ${122 + idx * 46})`}>
              <rect x={0} y={0} width={138} height={36} rx={5} fill="#030712" stroke="rgba(255,255,255,0.06)" />
              <circle cx={14} cy={18} r={4} fill="#8b5cf6" />
              <text x={26} y={16} fill="#e2e8f0" fontSize={9} fontFamily="var(--font-mono)">
                Thread #{idx + 1}
              </text>
              <text x={26} y={28} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
                Event #{1024 + idx * 3}
              </text>
            </g>
          ))}

          <g transform="translate(48, 315)">
            <text x={0} y={10} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              Non-blocking future append
            </text>
          </g>
        </g>

        {/* 2. RecordAccumulator (X: 215, Y: 65, Width: 340, Height: 275) */}
        <g className="buffer-pool-box">
          <rect
            x={215}
            y={65}
            width={340}
            height={275}
            rx={10}
            fill="#090d18"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth={1.5}
          />
          <text x={230} y={92} fill="#06b6d4" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            RECORD ACCUMULATOR (32MB BUFFER POOL)
          </text>
          <text x={230} y={108} fill="#64748b" fontSize={9} fontFamily="var(--font-mono)">
            linger.ms = {mode === 'batch' ? '20ms' : '0ms'} · batch.size = {mode === 'batch' ? '65,536 B' : '1 B'}
          </text>

          {/* Batch Slots Frame */}
          <g transform="translate(230, 122)">
            <rect x={0} y={0} width={310} height={120} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <text x={12} y={20} fill="#94a3b8" fontSize={9} fontFamily="var(--font-mono)" fontWeight="bold">
              Partition 0 Deque Batch (In Memory)
            </text>

            {mode === 'batch' ? (
              <g>
                {[0, 1, 2, 3, 4, 5].map((slot) => (
                  <rect
                    key={slot}
                    className="batch-slot"
                    x={12 + slot * 48}
                    y={32}
                    width={42}
                    height={65}
                    rx={4}
                    fill="rgba(6, 182, 212, 0.18)"
                    stroke="#06b6d4"
                    strokeWidth={1.2}
                  />
                ))}
                <text x={12} y={110} fill="#06b6d4" fontSize={8} fontFamily="var(--font-mono)">
                  Accumulated 6 records (62.4 KB / 64 KB capacity)
                </text>
              </g>
            ) : (
              <g>
                <rect
                  className="batch-slot"
                  x={12}
                  y={32}
                  width={42}
                  height={65}
                  rx={4}
                  fill="rgba(245, 158, 11, 0.2)"
                  stroke="#f59e0b"
                  strokeWidth={1.2}
                />
                <text x={12} y={110} fill="#f59e0b" fontSize={8} fontFamily="var(--font-mono)">
                  Single record mode (Immediate flush, no batching)
                </text>
              </g>
            )}
          </g>

          {/* Compression Badge */}
          <g className="compression-badge" transform="translate(230, 255)">
            <rect
              x={0}
              y={0}
              width={160}
              height={26}
              rx={5}
              fill={mode === 'batch' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
              stroke={mode === 'batch' ? '#10b981' : '#ef4444'}
              strokeWidth={1}
            />
            <text
              x={10}
              y={17}
              fill={mode === 'batch' ? '#34d399' : '#f87171'}
              fontSize={9}
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              {mode === 'batch' ? 'LZ4 COMPRESSED: -62%' : 'UNCOMPRESSED'}
            </text>
          </g>

          <g transform="translate(400, 255)">
            <rect x={0} y={0} width={140} height={26} rx={5} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <text x={10} y={17} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Syscalls: {mode === 'batch' ? '1 per 64KB' : '1 per msg'}
            </text>
          </g>
        </g>

        {/* 3. Kafka Broker Cluster (X: 575, Y: 65, Width: 205, Height: 275) */}
        <g className="broker-network-box">
          <rect
            x={575}
            y={65}
            width={205}
            height={275}
            rx={10}
            fill="#080c16"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth={1.5}
          />
          <text x={590} y={92} fill="#10b981" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            KAFKA BROKER CLUSTER
          </text>
          <text x={590} y={108} fill="#64748b" fontSize={9} fontFamily="var(--font-mono)">
            acks = all · Zero-Copy
          </text>

          {/* Broker Commit Log */}
          <g transform="translate(590, 122)">
            <rect x={0} y={0} width={175} height={95} rx={6} fill="#030712" stroke="rgba(255,255,255,0.08)" />
            <text x={10} y={20} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Partition 0 Commit Log
            </text>
            <rect x={10} y={32} width={155} height={20} rx={4} fill="#0f172a" />
            <rect x={10} y={32} width={mode === 'batch' ? 120 : 25} height={20} rx={4} fill="#10b981" opacity={0.3} />
            <text x={16} y={46} fill="#34d399" fontSize={8} fontFamily="var(--font-mono)">
              Offset: 489,102 → {mode === 'batch' ? '108' : '103'}
            </text>
            <text x={10} y={75} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              Append-only PageCache
            </text>
          </g>

          {/* Ack Beacon */}
          <g className="ack-all-beacon" transform="translate(590, 230)">
            <rect x={0} y={0} width={175} height={45} rx={6} fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" strokeWidth={1} />
            <text x={10} y={18} fill="#10b981" fontSize={9} fontFamily="var(--font-mono)" fontWeight="bold">
              ACKS=ALL CONFIRMED
            </text>
            <text x={10} y={34} fill="#6ee7b7" fontSize={8} fontFamily="var(--font-mono)">
              {mode === 'batch' ? '1 RTT for 6 messages' : '6 Network RTTs'}
            </text>
          </g>
        </g>

        {/* 4. Bottom Performance Dashboard (X: 35, Y: 355, Width: 745, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect x={0} y={0} width={745} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(16, 20)">
            <text x={0} y={10} fill="#e2e8f0" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
              PRODUCTION METRICS:
            </text>
            <text x={160} y={10} fill="#94a3b8" fontSize={10} fontFamily="var(--font-mono)">
              Network Packets: <tspan fill={mode === 'batch' ? '#34d399' : '#f87171'}>{mode === 'batch' ? '1,560 pkt/s' : '100,000 pkt/s'}</tspan> ·
              Throughput: <tspan fill="#34d399">{mode === 'batch' ? '180,000 msg/s' : '12,500 msg/s'}</tspan> ·
              P99 Latency: <tspan fill={mode === 'batch' ? '#60a5fa' : '#34d399'}>{mode === 'batch' ? '24 ms' : '6 ms'}</tspan>
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontSize={9} fontFamily="var(--font-mono)">
              {mode === 'batch'
                ? 'Tối ưu throughput cao: gom nhóm bản tin trong 20ms giúp giảm 90% chi phí network syscall và nén LZ4 đạt hiệu quả tối đa.'
                : 'Tối ưu độ trễ siêu thấp: gửi tức thời không chờ đợi nhưng lãng phí IOPS, băng thông TCP header chiếm tới 70% dữ liệu truyền.'}
            </text>
            <text x={0} y={28} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              Kinh nghiệm: Trong e-commerce hoặc financial feed, cấu hình linger.ms=20 và batch.size=64KB là tỷ lệ vàng giữa độ trễ và thông lượng.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
