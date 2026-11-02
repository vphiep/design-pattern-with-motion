'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const CYAN = '#06b6d4';
const VIOLET = '#8b5cf6';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const ROSE = '#f43f5e';

const STACK_W = 104;
const CHAIN = ['docker CLI', 'REST API', 'dockerd', 'containerd', 'shim', 'runc', 'nginx PID 1'];
const CHAIN_X = 24;
const CHAIN_STEP = 108;
const CHAIN_W = 96;
const CHAIN_Y = 322;

function Bar({
  x,
  y,
  w,
  label,
  accent,
  filled = false
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  accent: string;
  filled?: boolean;
}) {
  return (
    <Chip x={x} y={y} w={w} h={24} label={label} accent={accent} filled={filled} fontSize={8.5} />
  );
}

export function VmVsContainerScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.vv-packet', { opacity: 0 });

      // step-0: VMs — a guest kernel per VM on a hypervisor
      tl.addLabel('step-0');
      tl.from('.vv-vm-base', { opacity: 0, y: 8, stagger: 0.15, duration: 0.3 });
      tl.from('.vv-vm', { opacity: 0, y: -10, stagger: 0.18, duration: 0.35 });
      tl.from('.vv-vm-note', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-1: containers — processes on one shared kernel
      tl.addLabel('step-1');
      tl.from('.vv-ct-base', { opacity: 0, y: 8, stagger: 0.15, duration: 0.3 });
      tl.from('.vv-ns', { opacity: 0, duration: 0.3 });
      tl.from('.vv-ct', { opacity: 0, y: -10, stagger: 0.15, duration: 0.3 });
      tl.from('.vv-ct-note', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-2: docker run through the engine chain
      tl.addLabel('step-2');
      tl.from('.vv-chain', { opacity: 0, x: -8, stagger: 0.1, duration: 0.25 });
      tl.to('.vv-packet', { opacity: 1, duration: 0.15 });
      tl.to('.vv-packet', {
        attr: { cx: CHAIN_X + 6 * CHAIN_STEP + CHAIN_W / 2 },
        duration: 1.4,
        ease: 'none'
      });
      tl.to('.vv-chain-runc', { opacity: 0.3, duration: 0.3 });
      tl.from('.vv-runc-note', { opacity: 0, duration: 0.3 }, '<');
      tl.to({}, { duration: 0.6 });

      // step-3: one image, many containers
      tl.addLabel('step-3');
      tl.from('.vv-image', { opacity: 0, x: -10, duration: 0.35 });
      tl.from('.vv-link', { opacity: 0, stagger: 0.15, duration: 0.3 });
      tl.from('.vv-inst', {
        opacity: 0,
        scale: 0.9,
        transformOrigin: '50% 50%',
        stagger: 0.2,
        duration: 0.3
      });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>VIRTUAL MACHINES VS CONTAINERS · DOCKER ENGINE</SceneTitle>

      {/* VMs */}
      <Panel
        x={24}
        y={44}
        w={360}
        h={256}
        accent={VIOLET}
        title="Virtual machines"
        subtitle="hardware is virtualised"
        step="0"
      >
        {[0, 1, 2].map((i) => (
          <g key={i} className="vv-vm" transform={`translate(${12 + i * 114} 46)`}>
            <Bar x={0} y={0} w={STACK_W} label={['api', 'worker', 'db'][i]} accent={CYAN} />
            <Bar x={0} y={28} w={STACK_W} label="libs + JRE" accent={CYAN} />
            <Bar x={0} y={56} w={STACK_W} label="guest OS" accent={VIOLET} />
            <Bar x={0} y={84} w={STACK_W} label="guest kernel" accent={VIOLET} filled />
          </g>
        ))}
        <g className="vv-vm-base">
          <Bar x={12} y={164} w={336} label="hypervisor (KVM · VT-x / EPT)" accent={AMBER} />
        </g>
        <g className="vv-vm-base">
          <Bar x={12} y={194} w={336} label="hardware: CPU · RAM · NIC" accent="var(--border)" />
        </g>
        <g className="vv-vm-note">
          <text x={12} y={240} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            3 kernels booted · seconds to start · RAM per guest OS
          </text>
        </g>
      </Panel>

      {/* Containers */}
      <Panel
        x={416}
        y={44}
        w={360}
        h={256}
        accent={CYAN}
        title="Containers"
        subtitle="the host kernel is shared"
        step="1"
      >
        <g className="vv-ns">
          <rect
            x={8}
            y={42}
            width={344}
            height={112}
            rx={6}
            fill="none"
            stroke={EMERALD}
            strokeDasharray="5 4"
          />
          <text x={16} y={150} fill={EMERALD} fontFamily={MONO} fontSize={8}>
            namespaces + cgroups (per process)
          </text>
        </g>
        {[0, 1, 2].map((i) => (
          <g key={i} className="vv-ct" transform={`translate(${12 + i * 114} 50)`}>
            <Bar x={0} y={0} w={STACK_W} label={['api', 'worker', 'db'][i]} accent={CYAN} />
            <Bar x={0} y={28} w={STACK_W} label="libs + JRE" accent={CYAN} />
            <text
              x={STACK_W / 2}
              y={72}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontFamily={MONO}
              fontSize={8}
            >
              PID {[48213, 48390, 48577][i]}
            </text>
          </g>
        ))}
        <g className="vv-ct-base">
          <Bar x={12} y={164} w={336} label="ONE HOST KERNEL (shared)" accent={EMERALD} filled />
        </g>
        <g className="vv-ct-base">
          <Bar x={12} y={194} w={336} label="hardware: CPU · RAM · NIC" accent="var(--border)" />
        </g>
        <g className="vv-ct-note">
          <text x={12} y={240} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            no guest kernel · fork+exec in ms · uname -r = host
          </text>
        </g>
      </Panel>

      {/* Engine chain */}
      <g data-step="2">
        <text x={24} y={CHAIN_Y - 8} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
          docker run -d --name web nginx:1.27
        </text>
        {CHAIN.map((c, i) => (
          <g key={c} className={`vv-chain ${c === 'runc' ? 'vv-chain-runc' : ''}`}>
            <Chip
              x={CHAIN_X + i * CHAIN_STEP}
              y={CHAIN_Y}
              w={CHAIN_W}
              h={24}
              label={c}
              accent={i === CHAIN.length - 1 ? EMERALD : i < 2 ? VIOLET : AMBER}
              filled={i === CHAIN.length - 1}
              fontSize={8.5}
            />
            {i < CHAIN.length - 1 && (
              <line
                x1={CHAIN_X + i * CHAIN_STEP + CHAIN_W}
                y1={CHAIN_Y + 12}
                x2={CHAIN_X + (i + 1) * CHAIN_STEP}
                y2={CHAIN_Y + 12}
                stroke="var(--text-muted)"
                strokeWidth={1.2}
              />
            )}
          </g>
        ))}
        <circle
          className="vv-packet"
          cx={CHAIN_X + CHAIN_W / 2}
          cy={CHAIN_Y + 12}
          r={5}
          fill={ROSE}
        />
        <g className="vv-runc-note">
          <text
            x={CHAIN_X + 5 * CHAIN_STEP + CHAIN_W / 2}
            y={CHAIN_Y + 40}
            textAnchor="middle"
            fill={ROSE}
            fontFamily={MONO}
            fontSize={8}
          >
            runc exits after exec
          </text>
          <text
            x={CHAIN_X + 4 * CHAIN_STEP + CHAIN_W / 2}
            y={CHAIN_Y + 40}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontFamily={MONO}
            fontSize={8}
          >
            shim = parent
          </text>
        </g>
      </g>

      {/* One image, many containers */}
      <g data-step="3">
        <g className="vv-image">
          <Chip
            x={24}
            y={392}
            w={230}
            h={30}
            label="image nginx:1.27 · ro layers"
            accent={VIOLET}
            filled
            fontSize={9}
          />
        </g>
        {[0, 1].map((i) => (
          <g key={i}>
            <line
              className="vv-link"
              x1={254}
              y1={407}
              x2={330}
              y2={390 + i * 36}
              stroke={VIOLET}
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />
            <g className="vv-inst">
              <Chip
                x={330}
                y={377 + i * 36}
                w={230}
                h={26}
                label={`${['web', 'web2'][i]} · own rw layer · Up`}
                accent={CYAN}
                fontSize={9}
              />
            </g>
          </g>
        ))}
        <text x={24} y={462} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
          docker rm web2 deletes only its writable layer · the image stays · a container ends when
          PID 1 ends
        </text>
      </g>
    </SceneBoard>
  );
}
