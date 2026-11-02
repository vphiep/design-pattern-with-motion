'use client';

import { useRef, useState } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import { Caption } from '@/components/illustrations/shared/primitives';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Activity, Cpu, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function BackpressureFlowControlScene({
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep
}: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  // Interactive rates
  const [lambda, setLambda] = useState(6000); // msg/s
  const [muPerPod, setMuPerPod] = useState(1200); // msg/s per pod
  const [kedaAutoscale, setKedaAutoscale] = useState(true);
  const [manualPods, setManualPods] = useState(2);

  const activePods = kedaAutoscale ? Math.min(8, Math.max(1, Math.ceil(lambda / muPerPod))) : manualPods;
  const totalMu = activePods * muPerPod;
  const dQdt = lambda - totalMu; // msg/s
  const lagDepth = Math.max(0, Math.min(100, 30 + (dQdt / 100)));

  useSceneTimeline(ref, {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep,
    build: (tl) => {
      // Step 0: Producer Spike Ingestion (λ)
      tl.addLabel('step-0');
      tl.from('.producer-rate-box', { opacity: 0, x: -20, duration: 0.35 });
      tl.from('.intake-pipe', { strokeDashoffset: 50, duration: 0.3 }, '<');

      // Step 1: Consumer Lag Accumulation
      tl.addLabel('step-1');
      tl.to('.lag-fill-tank', { height: 110, y: 30, duration: 0.4 });
      tl.from('.formula-display', { opacity: 0, scale: 0.9, duration: 0.3 }, '<');

      // Step 2: KEDA Auto-Scales Consumer Pods
      tl.addLabel('step-2');
      tl.from('.keda-controller', { stroke: '#10b981', duration: 0.35 });
      tl.from('.scaled-pod', { opacity: 0, scale: 0.7, stagger: 0.08, duration: 0.35 }, '<');

      // Step 3: Batch DB Writes -> Backlog Drained
      tl.addLabel('step-3');
      tl.to('.lag-fill-tank', { height: 40, y: 100, fill: '#10b981', duration: 0.4 });
      tl.from('.drain-metric-badge', { opacity: 0, y: 5, duration: 0.3 }, '<');
    }
  });

  return (
    <div className="relative">
      {/* Interactive Controls Bar */}
      <div className="absolute top-2.5 right-3 z-20 flex flex-wrap items-center gap-2 p-1 rounded-xl border border-border-soft bg-surface/90 backdrop-blur-md">
        {/* Lambda Slider */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-cyan-400">λ:</span>
          <input
            type="range"
            min={1000}
            max={10000}
            step={500}
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="w-16 accent-cyan-400 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-cyan-300 font-semibold">{lambda}/s</span>
        </div>

        {/* Mu Per Pod Slider */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-purple-400">μ:</span>
          <input
            type="range"
            min={800}
            max={2000}
            step={200}
            value={muPerPod}
            onChange={(e) => setMuPerPod(Number(e.target.value))}
            className="w-14 accent-purple-400 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-purple-300 font-semibold">{muPerPod}/s</span>
        </div>

        {/* KEDA Switcher */}
        <button
          type="button"
          onClick={() => setKedaAutoscale(!kedaAutoscale)}
          className={cn(
            'px-2 py-0.5 text-xs font-mono font-medium rounded transition-all flex items-center gap-1 border',
            kedaAutoscale
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-surface-subtle text-text-muted border-border-soft'
          )}
        >
          <Cpu size={11} />
          <span>{kedaAutoscale ? `KEDA (${activePods} Pods)` : 'KEDA OFF'}</span>
        </button>
      </div>

      <SceneBoard ref={ref} viewBox="0 0 820 480">
        <Caption x={35} y={32}>
          BACKPRESSURE &amp; CONSUMER LAG · GOVERNING DYNAMICS: dQ/dt = λ - μ
        </Caption>

        {/* 1. Producer Rate (X: 35, Y: 65, Width: 180, Height: 275) */}
        <g className="producer-rate-box" transform="translate(35, 65)">
          <rect
            x={0}
            y={0}
            width={180}
            height={275}
            rx={8}
            fill="#080c16"
            stroke="rgba(6, 182, 212, 0.4)"
            strokeWidth={1.5}
          />
          <text x={14} y={22} fill="#06b6d4" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
            PRODUCER INTAKE (λ)
          </text>
          <text x={14} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            Ingress Traffic Rate
          </text>

          <g transform="translate(14, 52)">
            <rect x={0} y={0} width={152} height={46} rx={5} fill="#030712" />
            <text x={10} y={18} fill="#67e8f9" fontSize={9} fontFamily="var(--font-mono)">
              Rate λ:
            </text>
            <text x={10} y={36} fill="#38bdf8" fontSize={14} fontFamily="var(--font-mono)" fontWeight="bold">
              {lambda.toLocaleString()} msg/s
            </text>
          </g>

          <g transform="translate(14, 115)">
            <text x={0} y={14} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              Flow Control Mode:
            </text>
            <text x={0} y={28} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Non-blocking reactive
            </text>
            <text x={0} y={42} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              TCP Window: Optimal
            </text>
          </g>

          {/* Pipe Arrow */}
          <path d="M 180 80 L 230 80" className="intake-pipe" stroke="#06b6d4" strokeWidth={2.5} markerEnd="url(#arrow-cyan)" />
        </g>

        {/* 2. Buffer / Queue Depth Tank (X: 230, Y: 65, Width: 230, Height: 275) */}
        <g transform="translate(230, 65)">
          <rect
            x={0}
            y={0}
            width={230}
            height={275}
            rx={8}
            fill="#040711"
            stroke={dQdt > 0 ? 'rgba(244, 63, 94, 0.5)' : 'rgba(16, 185, 129, 0.4)'}
            strokeWidth={1.5}
          />
          <text
            x={14}
            y={22}
            fill={dQdt > 0 ? '#f43f5e' : '#10b981'}
            fontSize={10}
            fontFamily="var(--font-mono)"
            fontWeight="bold"
          >
            BUFFER / CONSUMER LAG
          </text>
          <text x={14} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            Partition Queue Tank
          </text>

          {/* Tank Visual Frame */}
          <rect x={14} y={48} width={202} height={145} rx={5} fill="#090d16" stroke="rgba(255,255,255,0.08)" />

          {/* Liquid Fill Level */}
          <rect
            className="lag-fill-tank"
            x={15}
            y={49 + (143 - (lagDepth * 1.43))}
            width={200}
            height={lagDepth * 1.43}
            rx={4}
            fill={dQdt > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.35)'}
          />

          {/* Live Rate Label Inside Tank */}
          <text x={22} y={72} fill="#f1f5f9" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
            Lag: {Math.round(lagDepth * 350).toLocaleString()} msgs
          </text>
          <text
            x={22}
            y={88}
            fill={dQdt > 0 ? '#fca5a5' : '#6ee7b7'}
            fontSize={9}
            fontFamily="var(--font-mono)"
            fontWeight="bold"
          >
            dQ/dt = {dQdt > 0 ? `+${dQdt.toLocaleString()}` : dQdt.toLocaleString()} msg/s
          </text>

          {/* Drain Status */}
          <g transform="translate(14, 206)">
            <text x={0} y={14} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Status: {dQdt > 0 ? '⚠️ TÍCH TỤ LAG' : '✅ TIÊU THỤ CÂN BẰNG'}
            </text>
            <text x={0} y={28} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              Drain estimate: {dQdt > 0 ? 'Infinite (Accumulating)' : '< 12 seconds'}
            </text>
          </g>
        </g>

        {/* 3. Consumer Cluster & KEDA (X: 475, Y: 65, Width: 310, Height: 275) */}
        <g className="keda-controller" transform="translate(475, 65)">
          <rect
            x={0}
            y={0}
            width={310}
            height={275}
            rx={8}
            fill="#080c16"
            stroke="rgba(139, 92, 246, 0.4)"
            strokeWidth={1.5}
          />
          <text x={14} y={22} fill="#a78bfa" fontSize={10} fontFamily="var(--font-mono)" fontWeight="bold">
            CONSUMER CLUSTER (Total μ = {totalMu.toLocaleString()}/s)
          </text>
          <text x={14} y={38} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
            KEDA: kafka-lag-trigger
          </text>

          {/* Consumer Pod Grid */}
          <g transform="translate(14, 48)">
            {Array.from({ length: 8 }).map((_, idx) => {
              const isActive = idx < activePods;
              const row = Math.floor(idx / 4);
              const col = idx % 4;
              return (
                <g
                  key={idx}
                  className="scaled-pod"
                  transform={`translate(${col * 70}, ${row * 55})`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={64}
                    height={46}
                    rx={4}
                    fill={isActive ? '#131d33' : '#090d16'}
                    stroke={isActive ? '#10b981' : 'rgba(255,255,255,0.06)'}
                    strokeWidth={1.2}
                    opacity={isActive ? 1 : 0.3}
                  />
                  <text
                    x={6}
                    y={15}
                    fill={isActive ? '#34d399' : '#64748b'}
                    fontSize={7}
                    fontFamily="var(--font-mono)"
                    fontWeight="bold"
                  >
                    Pod #{idx + 1}
                  </text>
                  <text
                    x={6}
                    y={28}
                    fill={isActive ? '#e2e8f0' : '#475569'}
                    fontSize={7}
                    fontFamily="var(--font-mono)"
                  >
                    {isActive ? `${muPerPod}/s` : 'Idle'}
                  </text>
                  <circle cx={54} cy={12} r={3} fill={isActive ? '#10b981' : '#475569'} />
                </g>
              );
            })}
          </g>

          {/* Scale Summary */}
          <g transform="translate(14, 175)">
            <rect x={0} y={0} width={282} height={42} rx={4} fill="#030712" stroke="rgba(255,255,255,0.06)" />
            <text x={10} y={16} fill="#94a3b8" fontSize={8} fontFamily="var(--font-mono)">
              Active Workers: <tspan fill="#34d399" fontWeight="bold">{activePods} Pods</tspan> · Capacity: <tspan fill="#38bdf8" fontWeight="bold">{totalMu.toLocaleString()} msg/s</tspan>
            </text>
            <text x={10} y={30} fill="#64748b" fontSize={7} fontFamily="var(--font-mono)">
              pods = ceil(λ / μ_pod) = ceil({lambda} / {muPerPod}) = {activePods}
            </text>
          </g>
        </g>

        {/* 4. Bottom Differential Equation Dashboard Bar (X: 35, Y: 355, Width: 750, Height: 95) */}
        <g transform="translate(35, 355)">
          <rect x={0} y={0} width={750} height={95} rx={8} fill="#0f172a" stroke="rgba(255,255,255,0.08)" />
          <g transform="translate(16, 20)">
            <text x={0} y={10} fill="#e2e8f0" fontSize={11} fontFamily="var(--font-mono)" fontWeight="bold">
              ĐỊNH LUẬT BẢO TOÀN LƯU LƯỢNG:
            </text>
            <text x={260} y={10} fill="#a78bfa" fontSize={12} fontFamily="var(--font-mono)" fontWeight="bold">
              dQ/dt = λ - μ = {lambda} - {totalMu} = {dQdt} msg/s
            </text>
          </g>
          <g transform="translate(16, 52)">
            <text x={0} y={12} fill="#94a3b8" fontSize={9} fontFamily="var(--font-mono)">
              {dQdt > 0
                ? '❌ Khi λ > μ: Hàng đợi phình to vô hạn theo thời gian. Nếu không scale consumer hoặc áp dụng Backpressure/Rate Limiting ở Producer, Broker sẽ cạn kiệt Disk Space hoặc gây OOM.'
                : '✅ Khi λ ≤ μ: Hệ thống đạt trạng thái cân bằng bền vững. Mọi đột biến lưu lượng (Spike) được hấp thu vào hàng đợi và giải phóng hoàn toàn trong thời gian ngắn.'}
            </text>
            <text x={0} y={28} fill="#64748b" fontSize={8} fontFamily="var(--font-mono)">
              KEDA ScaledObject theo dõi consumer lag và tự động điều chỉnh số lượng replica Pods từ 1 đến N theo tải thực tế.
            </text>
          </g>
        </g>
      </SceneBoard>
    </div>
  );
}
