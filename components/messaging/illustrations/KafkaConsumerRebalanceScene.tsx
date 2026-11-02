'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Users, AlertTriangle, ShieldCheck, UserPlus, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ConsumerTopology = 'two' | 'three' | 'failover';
type CommitStrategy = 'after' | 'before';

export function KafkaConsumerRebalanceScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [topology, setTopology] = useState<ConsumerTopology>('two');
  const [commitStrategy, setCommitStrategy] = useState<CommitStrategy>('after');

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Stable Partition Consumption
      tl.addLabel('step-0');
      tl.from('.partition-card', { opacity: 0, y: -15, stagger: 0.08, duration: 0.35 });
      tl.from('.consumer-card', { opacity: 0, y: 15, stagger: 0.1, duration: 0.35 }, '<0.1');

      // Step 1: Incremental Cooperative Rebalance
      tl.addLabel('step-1');
      tl.from('.rebalance-pulse', { opacity: 0, scale: 0.8, duration: 0.4 });
      tl.from('.assignment-wire', { strokeDashoffset: 100, duration: 0.4 }, '<');

      // Step 2: Manual Offset Commit
      tl.addLabel('step-2');
      tl.to('.offset-marker', { fill: '#10b981', scale: 1.1, duration: 0.3 });
      tl.from('.commit-ack-badge', { opacity: 0, y: -5, duration: 0.3 }, '<');
    }
  });

  return (
    <div className="relative">
      {/* Interactive Controls Bar */}
      <div className="absolute top-2.5 right-3 z-20 flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md">
        {/* Topology Selector */}
        <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border-soft">
          <button
            type="button"
            onClick={() => setTopology('two')}
            className={cn(
              'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1',
              topology === 'two'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <Users size={11} />
            <span>2 Pods</span>
          </button>
          <button
            type="button"
            onClick={() => setTopology('three')}
            className={cn(
              'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1',
              topology === 'three'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <UserPlus size={11} />
            <span>+ C3</span>
          </button>
          <button
            type="button"
            onClick={() => setTopology('failover')}
            className={cn(
              'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1',
              topology === 'failover'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <UserMinus size={11} />
            <span>C2 Crash</span>
          </button>
        </div>

        {/* Commit Strategy */}
        <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-border-soft">
          <button
            type="button"
            onClick={() => setCommitStrategy('after')}
            className={cn(
              'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1',
              commitStrategy === 'after'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <ShieldCheck size={11} />
            <span>Commit Sau</span>
          </button>
          <button
            type="button"
            onClick={() => setCommitStrategy('before')}
            className={cn(
              'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1',
              commitStrategy === 'before'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-text-muted hover:text-text-main'
            )}
          >
            <AlertTriangle size={11} />
            <span>Commit Trước</span>
          </button>
        </div>
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          KAFKA CONSUMER GROUP · 4 PARTITIONS · COOPERATIVE REBALANCE &amp; OFFSETS
        </Caption>

        {/* 1. TOPIC: orders-v1 (4 Partitions) (X: 35, Y: 58, Width: 750, Height: 85) */}
        <g transform="translate(35, 58)">
          <rect
            x={0}
            y={0}
            width={750}
            height={85}
            rx={8}
            fill="#030712"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth={1.5}
          />
          <text x={16} y={20} fill="#06b6d4" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
            TOPIC: orders-v1 (4 PARTITIONS) · BROKER LOG END OFFSETS
          </text>

          {/* 4 Partition Cells */}
          {[0, 1, 2, 3].map((pId) => {
            const xOffset = 16 + pId * 182;
            let assignedTo = '';
            if (topology === 'two') {
              assignedTo = pId < 2 ? 'Consumer 1' : 'Consumer 2';
            } else if (topology === 'three') {
              assignedTo = pId === 0 ? 'Consumer 1' : pId === 1 ? 'Consumer 1' : pId === 2 ? 'Consumer 2' : 'Consumer 3';
            } else {
              assignedTo = 'Consumer 1 (All)';
            }

            return (
              <g key={pId} className="partition-card" transform={`translate(${xOffset}, 28)`}>
                <rect
                  x={0}
                  y={0}
                  width={172}
                  height={45}
                  rx={5}
                  fill="#0b0f19"
                  stroke="rgba(255,255,255,0.08)"
                />
                <circle cx={12} cy={15} r={4} fill="#06b6d4" />
                <text x={22} y={18} fill="#e2e8f0" fontSize={9} fontFamily="var(--font-mono)" fontWeight="bold">
                  Partition {pId}
                </text>
                <text x={22} y={34} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
                  HW: 10,480
                </text>
                {/* Assigned Tag */}
                <rect x={90} y={8} width={74} height={18} rx={3} fill="#1e293b" />
                <text x={95} y={20} fill="#38bdf8" fontSize={7} fontFamily="var(--font-mono)">
                  {assignedTo}
                </text>
              </g>
            );
          })}
        </g>

        {/* 2. REBALANCE & ASSIGNMENT CONNECTIONS (Y: 143 - 200) */}
        <g className="assignment-wire">
          {/* Partition 0 -> Consumer 1 */}
          <path d="M 120 143 L 120 170 L 160 200" stroke="#8b5cf6" strokeWidth={2} fill="none" />
          {/* Partition 1 -> Consumer 1 */}
          <path d="M 302 143 L 302 170 L 200 200" stroke="#8b5cf6" strokeWidth={2} fill="none" />

          {/* Partition 2 */}
          {topology === 'failover' ? (
            <path d="M 484 143 L 484 175 L 240 200" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" fill="none" />
          ) : (
            <path d="M 484 143 L 484 170 L 410 200" stroke="#06b6d4" strokeWidth={2} fill="none" />
          )}

          {/* Partition 3 */}
          {topology === 'three' ? (
            <path d="M 666 143 L 666 170 L 650 200" stroke="#10b981" strokeWidth={2} fill="none" />
          ) : topology === 'two' ? (
            <path d="M 666 143 L 666 170 L 450 200" stroke="#06b6d4" strokeWidth={2} fill="none" />
          ) : (
            <path d="M 666 143 L 666 175 L 270 200" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" fill="none" />
          )}
        </g>

        {/* 3. CONSUMER GROUP (X: 35, Y: 200, Width: 750, Height: 140) */}
        <g transform="translate(35, 200)">
          <rect
            x={0}
            y={0}
            width={750}
            height={140}
            rx={8}
            fill="#050811"
            stroke="rgba(139, 92, 246, 0.4)"
            strokeWidth={1.5}
          />
          <text x={16} y={20} fill="#a78bfa" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
            CONSUMER GROUP: order-group · CooperativeStickyAssignor (Rebalance Zero-Stop)
          </text>

          {/* Consumer 1 */}
          <g className="consumer-card" transform="translate(16, 28)">
            <rect x={0} y={0} width={230} height={95} rx={6} fill="#0d1424" stroke="rgba(139, 92, 246, 0.4)" />
            <text x={12} y={20} fill="#c4b5fd" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
              Consumer 1 (order-pod-1)
            </text>
            <text x={12} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Assigned: {topology === 'failover' ? 'Partitions [0, 1, 2, 3]' : 'Partitions [0, 1]'}
            </text>
            <rect x={12} y={52} width={206} height={28} rx={4} fill="#030712" />
            <circle cx={24} cy={66} r={4} className="offset-marker" fill="#10b981" />
            <text x={35} y={70} fill="#34d399" fontSize={8} fontFamily="var(--font-mono)">
              Offset Committed: 10,480
            </text>
          </g>

          {/* Consumer 2 */}
          <g
            className={cn('consumer-card transition-opacity duration-300', topology === 'failover' && 'opacity-30')}
            transform="translate(260, 28)"
          >
            <rect
              x={0}
              y={0}
              width={230}
              height={95}
              rx={6}
              fill="#0d1424"
              stroke={topology === 'failover' ? '#ef4444' : 'rgba(6, 182, 212, 0.4)'}
            />
            <text
              x={12}
              y={20}
              fill={topology === 'failover' ? '#f87171' : '#67e8f9'}
              fontSize={10}
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              Consumer 2 {topology === 'failover' ? '(CRASHED!)' : '(order-pod-2)'}
            </text>
            <text x={12} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Assigned: {topology === 'failover' ? 'None (Revoked)' : topology === 'three' ? 'Partition [2]' : 'Partitions [2, 3]'}
            </text>
            <rect x={12} y={52} width={206} height={28} rx={4} fill="#030712" />
            <circle cx={24} cy={66} r={4} fill={topology === 'failover' ? '#ef4444' : '#06b6d4'} />
            <text x={35} y={70} fill={topology === 'failover' ? '#f87171' : '#38bdf8'} fontSize={8} fontFamily="var(--font-mono)">
              {topology === 'failover' ? 'Session Timeout' : 'Offset Committed: 9,842'}
            </text>
          </g>

          {/* Consumer 3 */}
          <g
            className={cn('consumer-card transition-opacity duration-300', topology !== 'three' && 'opacity-25')}
            transform="translate(504, 28)"
          >
            <rect
              x={0}
              y={0}
              width={230}
              height={95}
              rx={6}
              fill="#0d1424"
              stroke={topology === 'three' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.06)'}
            />
            <text
              x={12}
              y={20}
              fill={topology === 'three' ? '#6ee7b7' : '#64748b'}
              fontSize={10}
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              Consumer 3 {topology === 'three' ? '(Joined Pod)' : '(Inactive)'}
            </text>
            <text x={12} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Assigned: {topology === 'three' ? 'Partition [3] (Seamless)' : 'None'}
            </text>
            <rect x={12} y={52} width={206} height={28} rx={4} fill="#030712" />
            <circle cx={24} cy={66} r={4} fill={topology === 'three' ? '#10b981' : '#475569'} />
            <text x={35} y={70} fill={topology === 'three' ? '#34d399' : '#64748b'} fontSize={8} fontFamily="var(--font-mono)">
              {topology === 'three' ? 'Cooperative Join' : 'Awaiting Scale'}
            </text>
          </g>
        </g>

        {/* 4. Strategy Consequence Analysis Bar (X: 35, Y: 355, Width: 750, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect
            x={0}
            y={0}
            width={750}
            height={95}
            rx={8}
            fill="#0f172a"
            stroke={commitStrategy === 'after' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}
          />
          <g transform="translate(16, 20)">
            <text
              x={0}
              y={10}
              fill={commitStrategy === 'after' ? '#34d399' : '#f87171'}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              COMMIT POLICY BEHAVIOR:
            </text>
            <text x={200} y={10} fill="#e2e8f0" fontSize={11} fontFamily="var(--font-mono)">
              {commitStrategy === 'after'
                ? 'At-Least-Once Delivery: An toàn, có thể trùng nếu crash trước commit.'
                : 'At-Most-Once Delivery: NGUY CƠ MẤT MÁT DỮ LIỆU nếu crash sau commit.'}
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontSize={9} fontFamily="var(--font-mono)">
              {commitStrategy === 'after'
                ? 'Giải pháp chuẩn Production: Luôn dùng manual ACK (ack.acknowledge()) sau khi ghi DB thành công kết hợp Idempotent Consumer (Redis lock / Unique key constraint).'
                : 'Cảnh báo rủi ro cao: Offset đã nhảy lên phía trước, broker không giao lại bản tin dù application chưa xử lý xong!'}
            </text>
            <text x={0} y={28} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              Giao thức Cooperative Sticky chỉ migrate partition cần thiết, tránh hoàn toàn Stop-The-World của giao thức Eager cũ.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
