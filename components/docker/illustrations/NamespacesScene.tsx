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

const NS_ROWS = [
  { cls: 'ns-pid', label: 'pid ns', value: 'PID 1  java  (host PID 48213)' },
  { cls: 'ns-uts', label: 'uts ns', value: 'hostname = api-7f' },
  { cls: 'ns-mnt', label: 'mnt ns', value: '/ = overlay(my/api)  pivot_root' },
  { cls: 'ns-net', label: 'net ns', value: 'lo only → + eth0 via veth' }
];

export function NamespacesScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.ns-row', { opacity: 0.2 });

      // step-0: runc calls clone(CLONE_NEW*) — a new pid namespace
      tl.addLabel('step-0');
      tl.to('.ns-clone-arrow', { strokeDashoffset: 0, duration: 0.5 });
      tl.from('.ns-container', {
        opacity: 0,
        scale: 0.96,
        transformOrigin: '50% 50%',
        duration: 0.4
      });
      tl.to('.ns-pid', { opacity: 1, duration: 0.3 });
      tl.from('.ns-host-pid', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.8 });

      // step-1: hostname + rootfs
      tl.addLabel('step-1');
      tl.to('.ns-uts', { opacity: 1, duration: 0.3 });
      tl.to('.ns-mnt', { opacity: 1, duration: 0.3 });
      tl.from('.ns-rootfs', { opacity: 0, y: 8, duration: 0.35 });
      tl.to({}, { duration: 0.8 });

      // step-2: empty network namespace, then the veth
      tl.addLabel('step-2');
      tl.to('.ns-net', { opacity: 1, duration: 0.3 });
      tl.from('.ns-veth', { opacity: 0, duration: 0.5 });
      tl.from('.ns-bridge', { opacity: 0, duration: 0.3 }, '<0.2');
      tl.to({}, { duration: 0.8 });

      // step-3: docker exec = setns()
      tl.addLabel('step-3');
      tl.from('.ns-exec', { opacity: 0, x: -10, duration: 0.3 });
      tl.to('.ns-setns-arrow', { strokeDashoffset: 0, duration: 0.6 });
      tl.from('.ns-shell', { opacity: 0, scale: 0.8, transformOrigin: '50% 50%', duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>A CONTAINER IS A PROCESS · LINUX NAMESPACES</SceneTitle>

      <Panel
        x={24}
        y={56}
        w={230}
        h={300}
        accent="var(--border)"
        title="HOST (initial namespaces)"
        subtitle="one kernel · one task list"
        step="0,3"
      >
        {[
          'PID 1     systemd',
          'PID 812   containerd',
          'PID 48190 containerd-shim',
          'PID 48211 runc create'
        ].map((l, i) => (
          <text
            key={l}
            x={12}
            y={62 + i * 18}
            fill="var(--text-muted)"
            fontFamily={MONO}
            fontSize={8.5}
          >
            {l}
          </text>
        ))}
        <g className="ns-host-pid">
          <Chip x={12} y={136} w={206} label="PID 48213 java  ← same process" accent={VIOLET} />
        </g>
        <g className="ns-bridge" data-step="2">
          <Chip x={12} y={196} w={206} label="br-app 172.18.0.1 (bridge)" accent={CYAN} />
        </g>
        <g className="ns-exec" data-step="3">
          <Chip x={12} y={250} w={206} label="$ docker exec -it api sh" accent={AMBER} />
          <text x={12} y={290} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
            = nsenter --target 48213 (setns ×5)
          </text>
        </g>
      </Panel>

      <path
        className="ns-clone-arrow"
        d="M 230 130 C 280 130, 290 110, 330 110"
        fill="none"
        stroke={VIOLET}
        strokeWidth={1.6}
        strokeDasharray="120"
        strokeDashoffset={120}
      />
      <text x={262} y={102} fill={VIOLET} fontFamily={MONO} fontSize={8}>
        clone(CLONE_NEW*)
      </text>

      <g className="ns-container" data-step="0,1,2">
        <Panel
          x={330}
          y={56}
          w={446}
          h={300}
          accent={CYAN}
          title="container “api” = same process, new lenses"
          subtitle="task_struct → nsproxy (pid, uts, mnt, net, ipc, user, cgroup)"
        >
          {NS_ROWS.map((r, i) => (
            <g key={r.cls} className={`ns-row ${r.cls}`} transform={`translate(12 ${50 + i * 40})`}>
              <rect
                width={420}
                height={30}
                rx={5}
                fill="var(--bg)"
                stroke={CYAN}
                strokeOpacity={0.5}
              />
              <text x={10} y={19} fill={CYAN} fontFamily={MONO} fontSize={9} fontWeight="bold">
                {r.label}
              </text>
              <text x={80} y={19} fill="var(--text)" fontFamily={MONO} fontSize={9}>
                {r.value}
              </text>
            </g>
          ))}
          <g className="ns-rootfs">
            <text x={12} y={226} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
              ps -ef inside → only PID 1 and its children · host processes invisible
            </text>
          </g>
          <g className="ns-shell" data-step="3">
            <Chip
              x={12}
              y={240}
              w={200}
              label="PID 7  sh  (joined via setns)"
              accent={AMBER}
              filled
            />
          </g>
        </Panel>
      </g>

      <path
        className="ns-veth"
        data-step="2"
        d="M 218 208 L 300 208 L 300 241 L 342 241"
        fill="none"
        stroke={CYAN}
        strokeWidth={1.6}
        strokeDasharray="6 4"
      />
      <path
        className="ns-setns-arrow"
        d="M 218 262 C 280 262, 290 306, 342 306"
        fill="none"
        stroke={AMBER}
        strokeWidth={1.6}
        strokeDasharray="160"
        strokeDashoffset={160}
      />

      <rect
        x={24}
        y={376}
        width={752}
        height={30}
        rx={6}
        fill="var(--surface)"
        stroke={EMERALD}
        strokeOpacity={0.5}
      />
      <text x={36} y={395} fill={EMERALD} fontFamily={MONO} fontSize={9}>
        LINUX KERNEL — shared by host and every container (namespaces are views, not machines)
      </text>
      <text x={24} y={432} fill="var(--text-muted)" fontFamily={MONO} fontSize={9}>
        /proc/48213/ns/net → net:[4026532718] · two processes share a container ⇔ they share these
        inode ids
      </text>
    </SceneBoard>
  );
}
