'use client';

import React from 'react';

interface ModuleGraphicProps {
  moduleId: string;
  accent: string;
  className?: string;
}

export function ModuleCardGraphic({ moduleId, accent, className = '' }: ModuleGraphicProps) {
  return (
    <div className={`relative w-full h-32 overflow-hidden rounded-md border border-[var(--border-soft)] bg-bg/60 ${className}`}>
      {renderGraphic(moduleId, accent)}
    </div>
  );
}

function renderGraphic(id: string, accent: string) {
  switch (id) {
    case 'design-patterns':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full text-text" fill="none">
          {/* Subtle grid */}
          <line x1="0" y1="60" x2="300" y2="60" stroke="var(--border-soft)" strokeDasharray="3 3" />
          <line x1="150" y1="0" x2="150" y2="120" stroke="var(--border-soft)" strokeDasharray="3 3" />

          {/* Connected shapes */}
          <rect x="35" y="38" width="50" height="44" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="60" y="64" textAnchor="middle" fill="var(--text)" fontSize="10" fontFamily="monospace">Client</text>

          {/* Flow dashed connector */}
          <line x1="85" y1="60" x2="125" y2="60" stroke={accent} strokeWidth="1.5" className="animate-flow-dash" strokeDasharray="4 3" />

          {/* Central pattern node */}
          <rect x="125" y="32" width="60" height="56" rx="6" fill="var(--surface)" stroke={accent} strokeWidth="2" />
          <rect x="140" y="44" width="30" height="12" rx="2" fill={accent} opacity="0.8" className="animate-pulse" />
          <text x="155" y="74" textAnchor="middle" fill="var(--text)" fontSize="9" fontFamily="monospace" fontWeight="bold">Pattern</text>

          {/* Output connectors */}
          <path d="M 185 60 C 205 60, 205 40, 225 40" stroke="var(--text-muted)" strokeWidth="1.25" />
          <path d="M 185 60 C 205 60, 205 80, 225 80" stroke="var(--text-muted)" strokeWidth="1.25" />

          {/* Concrete Products */}
          <rect x="225" y="26" width="46" height="26" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.25" />
          <text x="248" y="42" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">Part A</text>

          <rect x="225" y="68" width="46" height="26" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.25" />
          <text x="248" y="84" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">Part B</text>
        </svg>
      );

    case 'database-internals':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" fill="none">
          {/* B-Tree root node */}
          <rect x="110" y="16" width="80" height="26" rx="4" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
          <line x1="150" y1="16" x2="150" y2="42" stroke="var(--border-soft)" />
          <text x="130" y="33" textAnchor="middle" fill="var(--text)" fontSize="10" fontFamily="monospace">20</text>
          <text x="170" y="33" textAnchor="middle" fill={accent} fontSize="10" fontFamily="monospace" fontWeight="bold">50</text>

          {/* Tree branching lines */}
          <line x1="125" y1="42" x2="60" y2="70" stroke="var(--border-soft)" strokeWidth="1.25" />
          <line x1="150" y1="42" x2="150" y2="70" stroke={accent} strokeWidth="1.5" strokeDasharray="3 2" className="animate-flow-dash" />
          <line x1="175" y1="42" x2="240" y2="70" stroke="var(--border-soft)" strokeWidth="1.25" />

          {/* Child Leaf Nodes */}
          <g>
            <rect x="25" y="70" width="70" height="26" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
            <text x="60" y="86" textAnchor="middle" fill="var(--text-soft)" fontSize="9" fontFamily="monospace">[5, 12]</text>
          </g>

          <g>
            {/* Active matched node */}
            <rect x="115" y="70" width="70" height="26" rx="3" fill="var(--surface)" stroke={accent} strokeWidth="1.8" />
            <rect x="145" y="74" width="28" height="18" rx="2" fill={accent} opacity="0.25" />
            <text x="150" y="86" textAnchor="middle" fill={accent} fontSize="9" fontFamily="monospace" fontWeight="bold">[25, 42]</text>
          </g>

          <g>
            <rect x="205" y="70" width="70" height="26" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
            <text x="240" y="86" textAnchor="middle" fill="var(--text-soft)" fontSize="9" fontFamily="monospace">[60, 95]</text>
          </g>

          {/* Leaf linking pointer */}
          <path d="M 95 83 H 115 M 185 83 H 205" stroke={accent} strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'cdc-event-driven':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" fill="none">
          {/* Database cylinder */}
          <g transform="translate(30, 25)">
            <ellipse cx="28" cy="12" rx="28" ry="9" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
            <rect x="0" y="12" width="56" height="42" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
            <ellipse cx="28" cy="54" rx="28" ry="9" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
            <line x1="0" y1="26" x2="56" y2="26" stroke="var(--border-soft)" />
            <line x1="0" y1="40" x2="56" y2="40" stroke="var(--border-soft)" />
            <text x="28" y="38" textAnchor="middle" fill="var(--text)" fontSize="8" fontFamily="monospace">WAL</text>
          </g>

          {/* Commit log stream arrow */}
          <path d="M 95 56 H 145" stroke={accent} strokeWidth="2" strokeDasharray="5 3" className="animate-flow-dash" />

          {/* Outbox Connector Engine */}
          <g transform="translate(145, 34)">
            <rect width="60" height="44" rx="4" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
            <text x="30" y="22" textAnchor="middle" fill={accent} fontSize="9" fontFamily="monospace" fontWeight="bold">Outbox</text>
            <text x="30" y="34" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">Debezium</text>
          </g>

          {/* Forwarding stream */}
          <path d="M 205 56 H 240" stroke={accent} strokeWidth="1.5" />
          <circle cx="222" cy="56" r="4" fill={accent} className="animate-ping" />

          {/* Destination Kafka / Elastic */}
          <rect x="240" y="38" width="45" height="36" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
          <text x="262" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="monospace">Stream</text>
        </svg>
      );

    case 'message-queue':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" fill="none">
          {/* Producer node */}
          <rect x="25" y="44" width="45" height="32" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="47" y="64" textAnchor="middle" fill="var(--text)" fontSize="8" fontFamily="monospace">Pub</text>

          {/* Animated Queue Pipe */}
          <g transform="translate(80, 40)">
            <rect width="130" height="40" rx="6" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
            {/* Slot partitions */}
            <line x1="32" y1="0" x2="32" y2="40" stroke="var(--border-soft)" strokeDasharray="2 2" />
            <line x1="64" y1="0" x2="64" y2="40" stroke="var(--border-soft)" strokeDasharray="2 2" />
            <line x1="96" y1="0" x2="96" y2="40" stroke="var(--border-soft)" strokeDasharray="2 2" />

            {/* Traveling packet tokens */}
            <circle cx="16" cy="20" r="7" fill={accent} />
            <circle cx="48" cy="20" r="7" fill={accent} opacity="0.8" />
            <circle cx="80" cy="20" r="7" fill={accent} opacity="0.5" />
            <circle cx="112" cy="20" r="7" fill={accent} opacity="0.25" />
          </g>

          {/* Connecting lines to Consumers */}
          <path d="M 210 50 C 225 50, 225 36, 240 36" stroke={accent} strokeWidth="1.25" strokeDasharray="3 2" className="animate-flow-dash" />
          <path d="M 210 70 C 225 70, 225 84, 240 84" stroke={accent} strokeWidth="1.25" strokeDasharray="3 2" className="animate-flow-dash" />

          {/* Consumer Workers */}
          <rect x="240" y="24" width="46" height="24" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
          <text x="263" y="39" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">Sub 1</text>

          <rect x="240" y="72" width="46" height="24" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
          <text x="263" y="87" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">Sub 2</text>
        </svg>
      );

    case 'docker-containers':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" fill="none">
          {/* 3 Isometric Layered Blocks */}
          {/* Layer 1: Base Linux OS */}
          <g transform="translate(60, 72)">
            <polygon points="90,0 170,16 90,32 10,16" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
            <polygon points="10,16 90,32 90,44 10,28" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1.2" />
            <polygon points="90,32 170,16 170,28 90,44" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
            <text x="90" y="20" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">Kernel / OS</text>
          </g>

          {/* Layer 2: Dependencies & Runtime */}
          <g transform="translate(60, 44)">
            <polygon points="90,0 170,16 90,32 10,16" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
            <polygon points="10,16 90,32 90,42 10,26" fill="var(--bg-elevated)" stroke={accent} strokeWidth="1.2" />
            <polygon points="90,32 170,16 170,26 90,42" fill="var(--surface)" stroke={accent} strokeWidth="1.2" />
            <text x="90" y="19" textAnchor="middle" fill={accent} fontSize="8" fontFamily="monospace">OverlayFS Layer</text>
          </g>

          {/* Layer 3: Container Isolated App */}
          <g transform="translate(60, 16)">
            <polygon points="90,0 170,16 90,32 10,16" fill={accent} opacity="0.18" stroke={accent} strokeWidth="1.8" />
            <polygon points="10,16 90,32 90,40 10,24" fill={accent} opacity="0.3" stroke={accent} strokeWidth="1.2" />
            <polygon points="90,32 170,16 170,24 90,40" fill={accent} opacity="0.2" stroke={accent} strokeWidth="1.2" />
            <text x="90" y="19" textAnchor="middle" fill={accent} fontSize="9" fontFamily="monospace" fontWeight="bold">Container (veth)</text>
          </g>
        </svg>
      );

    case 'system-security':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" fill="none">
          {/* Central Shield */}
          <g transform="translate(125, 20)">
            <path
              d="M 25 0 L 50 12 V 45 C 50 68, 25 80, 25 80 C 25 80, 0 68, 0 45 V 12 Z"
              fill="var(--surface)"
              stroke={accent}
              strokeWidth="2"
            />
            {/* Keyhole icon */}
            <circle cx="25" cy="35" r="7" fill={accent} />
            <polygon points="22,38 28,38 30,55 20,55" fill={accent} />
          </g>

          {/* Pulse radiation rings */}
          <circle cx="150" cy="55" r="48" stroke={accent} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="150" cy="55" r="58" stroke={accent} strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />

          {/* Token labels */}
          <g transform="translate(30, 48)">
            <rect width="65" height="24" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
            <text x="32" y="63" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">OAuth PKCE</text>
          </g>

          <g transform="translate(205, 48)">
            <rect width="65" height="24" rx="3" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.2" />
            <text x="32" y="63" textAnchor="middle" fill="var(--text-soft)" fontSize="8" fontFamily="monospace">JWT · TLS 1.3</text>
          </g>

          {/* Handshake connector lines */}
          <line x1="95" y1="60" x2="125" y2="60" stroke={accent} strokeWidth="1.2" strokeDasharray="3 2" className="animate-flow-dash" />
          <line x1="175" y1="60" x2="205" y2="60" stroke={accent} strokeWidth="1.2" strokeDasharray="3 2" className="animate-flow-dash" />
        </svg>
      );

    case 'devops-orchestration':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" fill="none">
          {/* Ingress / Load Balancer */}
          <rect x="25" y="44" width="60" height="32" rx="4" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="55" y="63" textAnchor="middle" fill="var(--text)" fontSize="8" fontFamily="monospace">Ingress</text>

          {/* Traffic split curves */}
          {/* 90% Stable Route (Blue/Main) */}
          <path d="M 85 54 C 130 54, 150 30, 200 30" stroke="var(--secondary)" strokeWidth="2.5" />
          <text x="145" y="32" fill="var(--secondary)" fontSize="8" fontFamily="monospace" fontWeight="bold">90% v1.0</text>

          {/* 10% Canary Route (Accent/Gold) */}
          <path d="M 85 66 C 130 66, 150 90, 200 90" stroke={accent} strokeWidth="1.5" strokeDasharray="4 2" className="animate-flow-dash" />
          <text x="145" y="86" fill={accent} fontSize="8" fontFamily="monospace" fontWeight="bold">10% Canary</text>

          {/* Stable Pod Cluster */}
          <g transform="translate(200, 18)">
            <rect width="70" height="24" rx="3" fill="var(--surface)" stroke="var(--secondary)" strokeWidth="1.5" />
            <circle cx="210" cy="30" r="3" fill="var(--secondary)" />
            <text x="240" y="33" textAnchor="middle" fill="var(--text)" fontSize="8" fontFamily="monospace">Stable Pods</text>
          </g>

          {/* Canary Pod */}
          <g transform="translate(200, 78)">
            <rect width="70" height="24" rx="3" fill="var(--surface)" stroke={accent} strokeWidth="1.5" />
            <circle cx="210" cy="90" r="3" fill={accent} className="animate-pulse" />
            <text x="240" y="93" textAnchor="middle" fill={accent} fontSize="8" fontFamily="monospace">Canary v2.0</text>
          </g>
        </svg>
      );

    default:
      return null;
  }
}
