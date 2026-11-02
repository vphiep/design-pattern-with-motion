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

// Key coordinates (absolute, in the 800×480 board)
const API = { x: 60, y: 70 };
const DB = { x: 300, y: 70 };
const CT_W = 190;
const CT_H = 110;
const API_ETH = { x: API.x + CT_W / 2, y: API.y + CT_H };
const DB_ETH = { x: DB.x + CT_W / 2, y: DB.y + CT_H };
const BRIDGE_Y = 250;
const HOST_ETH = { x: 640, y: BRIDGE_Y + 12 };
const CLIENT = { x: 640, y: 440 };
const INTERNET = { x: 380, y: 440 };
const DNS = { x: API.x + 128, y: API.y + 52 };

export function BridgeDnsScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set(['.bd-pkt-dns', '.bd-pkt-in', '.bd-pkt-out'], { opacity: 0 });

      // step-0: veth pairs + bridge
      tl.addLabel('step-0');
      tl.from('.bd-ct', { opacity: 0, y: -8, stagger: 0.2, duration: 0.35 });
      tl.from('.bd-bridge', { opacity: 0, duration: 0.35 });
      tl.to('.bd-veth', { strokeDashoffset: 0, stagger: 0.2, duration: 0.5 });
      tl.from('.bd-veth-label', { opacity: 0, stagger: 0.15, duration: 0.25 });
      tl.to({}, { duration: 0.6 });

      // step-1: embedded DNS resolves "db"
      tl.addLabel('step-1');
      tl.from('.bd-dns', { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.3 });
      tl.to('.bd-pkt-dns', { opacity: 1, duration: 0.1 });
      tl.to('.bd-pkt-dns', { attr: { cx: DNS.x, cy: DNS.y }, duration: 0.5 });
      tl.from('.bd-dns-answer', { opacity: 0, duration: 0.3 });
      tl.to('.bd-pkt-dns', { attr: { cx: API_ETH.x, cy: BRIDGE_Y + 12 }, duration: 0.4 });
      tl.to('.bd-pkt-dns', { attr: { cx: DB_ETH.x }, duration: 0.5 });
      tl.to('.bd-pkt-dns', { attr: { cy: DB_ETH.y }, duration: 0.3 });
      tl.to('.bd-pkt-dns', { opacity: 0, duration: 0.15 });
      tl.to({}, { duration: 0.5 });

      // step-2: published port → DNAT
      tl.addLabel('step-2');
      tl.from('.bd-client', { opacity: 0, duration: 0.3 });
      tl.from('.bd-rule-dnat', { opacity: 0, x: 8, duration: 0.3 });
      tl.to('.bd-pkt-in', { opacity: 1, duration: 0.1 });
      tl.to('.bd-pkt-in', { attr: { cy: HOST_ETH.y }, duration: 0.5 });
      tl.to('.bd-pkt-in', { attr: { cx: API_ETH.x }, duration: 0.7 });
      tl.to('.bd-pkt-in', { attr: { cy: API_ETH.y }, duration: 0.3 });
      tl.to('.bd-pkt-in', { opacity: 0, duration: 0.15 });
      tl.to({}, { duration: 0.5 });

      // step-3: outbound → MASQUERADE
      tl.addLabel('step-3');
      tl.from('.bd-rule-masq', { opacity: 0, x: 8, duration: 0.3 });
      tl.from('.bd-internet', { opacity: 0, duration: 0.3 });
      tl.to('.bd-pkt-out', { opacity: 1, duration: 0.1 });
      tl.to('.bd-pkt-out', { attr: { cy: BRIDGE_Y + 12 }, duration: 0.3 });
      tl.to('.bd-pkt-out', { attr: { cx: HOST_ETH.x - 30 }, duration: 0.6 });
      tl.from('.bd-snat', { opacity: 0, duration: 0.25 });
      tl.to('.bd-pkt-out', { attr: { cx: INTERNET.x + 60, cy: INTERNET.y }, duration: 0.6 });
    }
  });

  const container = (
    cls: string,
    pos: { x: number; y: number },
    name: string,
    ip: string,
    note: string
  ) => (
    <g className={`bd-ct ${cls}`} data-step="0,1">
      <rect
        x={pos.x}
        y={pos.y}
        width={CT_W}
        height={CT_H}
        rx={8}
        fill="var(--surface)"
        stroke={CYAN}
        strokeWidth={1.5}
      />
      <text
        x={pos.x + 12}
        y={pos.y + 20}
        fill={CYAN}
        fontFamily={MONO}
        fontSize={11}
        fontWeight="bold"
      >
        {name}
      </text>
      <text x={pos.x + 12} y={pos.y + 36} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        net ns · {note}
      </text>
      <Chip
        x={pos.x + CT_W / 2 - 60}
        y={pos.y + CT_H - 26}
        w={120}
        h={20}
        label={`eth0 ${ip}`}
        accent={CYAN}
        fontSize={8}
      />
    </g>
  );

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>USER-DEFINED BRIDGE · VETH · EMBEDDED DNS · DNAT / MASQUERADE</SceneTitle>

      <rect
        x={24}
        y={44}
        width={752}
        height={346}
        rx={10}
        fill="none"
        stroke="var(--border)"
        strokeDasharray="6 4"
      />
      <text x={36} y={384} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        HOST · root network namespace
      </text>

      {container('bd-api', API, 'api', '172.18.0.2', 'curl db:5432')}
      {container('bd-db', DB, 'db', '172.18.0.3', 'postgres :5432')}

      {[API_ETH, DB_ETH].map((p, i) => (
        <g key={i}>
          <path
            className="bd-veth"
            d={`M ${p.x} ${p.y} L ${p.x} ${BRIDGE_Y}`}
            stroke={EMERALD}
            strokeWidth={2}
            strokeDasharray="70"
            strokeDashoffset={70}
            fill="none"
          />
          <g className="bd-veth-label">
            <text
              x={p.x + 6}
              y={(p.y + BRIDGE_Y) / 2 + 4}
              fill={EMERALD}
              fontFamily={MONO}
              fontSize={8}
            >
              veth pair
            </text>
          </g>
        </g>
      ))}

      <g className="bd-bridge" data-step="0">
        <rect
          x={60}
          y={BRIDGE_Y}
          width={460}
          height={24}
          rx={5}
          fill={EMERALD}
          fillOpacity={0.15}
          stroke={EMERALD}
        />
        <text
          x={72}
          y={BRIDGE_Y + 16}
          fill={EMERALD}
          fontFamily={MONO}
          fontSize={9}
          fontWeight="bold"
        >
          bridge br-app (app-net) · 172.18.0.1/16
        </text>
      </g>
      <line
        x1={520}
        y1={BRIDGE_Y + 12}
        x2={HOST_ETH.x - 60}
        y2={HOST_ETH.y}
        stroke="var(--border)"
        strokeWidth={1.4}
      />
      <Chip
        x={HOST_ETH.x - 60}
        y={BRIDGE_Y}
        w={126}
        h={24}
        label="eth0 203.0.113.10"
        accent={AMBER}
        fontSize={8.5}
      />

      <g className="bd-dns" data-step="1">
        <Chip
          x={DNS.x - 50}
          y={DNS.y - 10}
          w={100}
          h={20}
          label="127.0.0.11"
          accent={VIOLET}
          filled
          fontSize={8}
        />
      </g>
      <g className="bd-dns-answer" data-step="1">
        <text x={API.x} y={API.y - 8} fill={VIOLET} fontFamily={MONO} fontSize={8.5}>
          db → 172.18.0.3 (only on user-defined networks)
        </text>
      </g>

      <Panel
        x={560}
        y={60}
        w={200}
        h={160}
        accent={AMBER}
        title="nat table"
        subtitle="iptables / nftables"
        step="2,3"
      >
        <g className="bd-rule-dnat">
          <text x={12} y={58} fill="var(--text)" fontFamily={MONO} fontSize={8}>
            DOCKER: --dport 8080
          </text>
          <text x={12} y={72} fill={ROSE} fontFamily={MONO} fontSize={8}>
            -j DNAT 172.18.0.2:80
          </text>
        </g>
        <g className="bd-rule-masq">
          <text x={12} y={100} fill="var(--text)" fontFamily={MONO} fontSize={8}>
            POSTROUTING -s 172.18/16
          </text>
          <text x={12} y={114} fill={ROSE} fontFamily={MONO} fontSize={8}>
            -j MASQUERADE
          </text>
        </g>
        <text x={12} y={142} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          conntrack reverses replies
        </text>
      </Panel>

      <g className="bd-client" data-step="2">
        <Chip
          x={CLIENT.x - 70}
          y={CLIENT.y - 10}
          w={140}
          h={22}
          label="client → host:8080"
          accent={AMBER}
          fontSize={8.5}
        />
      </g>
      <g className="bd-internet" data-step="3">
        <Chip
          x={INTERNET.x - 60}
          y={INTERNET.y - 10}
          w={120}
          h={22}
          label="Internet"
          accent={VIOLET}
          fontSize={8.5}
        />
      </g>
      <g className="bd-snat" data-step="3">
        <text x={HOST_ETH.x - 220} y={BRIDGE_Y + 52} fill={ROSE} fontFamily={MONO} fontSize={8}>
          src 172.18.0.2 → 203.0.113.10
        </text>
      </g>

      <circle className="bd-pkt-dns" cx={API.x + 40} cy={API.y + 52} r={5} fill={VIOLET} />
      <circle className="bd-pkt-in" cx={CLIENT.x} cy={CLIENT.y - 10} r={5} fill={AMBER} />
      <circle className="bd-pkt-out" cx={API_ETH.x} cy={API_ETH.y} r={5} fill={ROSE} />

      <text x={24} y={470} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        EXPOSE publishes nothing · -p binds 0.0.0.0 and :: by default · localhost in a container ≠
        host
      </text>
    </SceneBoard>
  );
}
