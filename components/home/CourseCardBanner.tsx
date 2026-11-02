'use client';

import React from 'react';

interface CourseCardBannerProps {
  id: string;
  name: string;
  accent: string;
}

export function CourseCardBanner({ id, name, accent }: CourseCardBannerProps) {
  return (
    <div
      className="relative w-full h-48 sm:h-52 overflow-hidden flex items-center justify-center select-none"
      style={{
        background: getCardBannerGradient(id)
      }}
    >
      {/* Blueprint Grid Texture */}
      <div className="absolute inset-0 bg-grid-fine opacity-20 pointer-events-none" />

      {/* Decorative ambient radial glow */}
      <div
        className="absolute w-36 h-36 rounded-full blur-2xl opacity-40 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* Domain Vector Schematic Artwork */}
      <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
        {renderDomainIllustration(id)}
      </div>

      {/* Bottom gradient fade for smooth transition to card body */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[var(--surface)] to-transparent pointer-events-none" />
    </div>
  );
}

function getCardBannerGradient(id: string): string {
  switch (id) {
    case 'design-patterns':
      return 'linear-gradient(135deg, #7c2d12 0%, #431407 50%, #1c0a04 100%)';
    case 'database-internals':
      return 'linear-gradient(135deg, #0c4a6e 0%, #082f49 50%, #031525 100%)';
    case 'cdc-event-driven':
      return 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #01140e 100%)';
    case 'message-queue':
      return 'linear-gradient(135deg, #581c87 0%, #3b0764 50%, #1e0338 100%)';
    case 'docker-containers':
      return 'linear-gradient(135deg, #164e63 0%, #083344 50%, #021a24 100%)';
    case 'system-security':
      return 'linear-gradient(135deg, #881337 0%, #4c0519 50%, #26020c 100%)';
    case 'devops-orchestration':
      return 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #230d01 100%)';
    default:
      return 'linear-gradient(135deg, #1f2937 0%, #111827 100%)';
  }
}

function renderDomainIllustration(id: string) {
  switch (id) {
    case 'design-patterns':
      // Gang of Four interconnected class diagram & polymorphic interface nodes
      return (
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-40" fill="none">
          {/* Connector dashed lines with glowing pulse */}
          <line x1="80" y1="45" x2="140" y2="95" stroke="#fb923c" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
          <line x1="200" y1="45" x2="140" y2="95" stroke="#fb923c" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
          <line x1="80" y1="45" x2="200" y2="45" stroke="#fdba74" strokeWidth="2.5" />

          {/* Node 1: Target Interface */}
          <g transform="translate(45, 20)">
            <rect width="70" height="42" rx="8" fill="#1c1917" stroke="#f97316" strokeWidth="2.5" />
            <text x="35" y="18" fill="#fdba74" fontSize="8" fontFamily="monospace" textAnchor="middle">&lt;&lt;interface&gt;&gt;</text>
            <text x="35" y="32" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">Strategy</text>
          </g>

          {/* Node 2: Concrete Implementation A */}
          <g transform="translate(165, 20)">
            <rect width="70" height="42" rx="8" fill="#1c1917" stroke="#f97316" strokeWidth="2.5" />
            <text x="35" y="18" fill="#fdba74" fontSize="8" fontFamily="monospace" textAnchor="middle">class</text>
            <text x="35" y="32" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">Observer</text>
          </g>

          {/* Node 3: Center Factory / Hub */}
          <g transform="translate(105, 75)">
            <rect width="70" height="42" rx="8" fill="#ea580c" stroke="#fed7aa" strokeWidth="2.5" />
            <text x="35" y="18" fill="#ffedd5" fontSize="8" fontFamily="monospace" textAnchor="middle">Singleton</text>
            <text x="35" y="32" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">Factory</text>
          </g>

          {/* Glowing connector dots */}
          <circle cx="80" cy="45" r="4" fill="#ffffff" />
          <circle cx="200" cy="45" r="4" fill="#ffffff" />
          <circle cx="140" cy="95" r="4" fill="#ffffff" />
        </svg>
      );

    case 'database-internals':
      // Database Storage: Disk Platters + B-Tree Node Branching
      return (
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-40" fill="none">
          {/* Left: Cylinder Disk Stack */}
          <g transform="translate(40, 25)">
            <ellipse cx="40" cy="18" rx="35" ry="12" fill="#0369a1" stroke="#38bdf8" strokeWidth="2.5" />
            <path d="M 5 18 V 40 C 5 48, 75 48, 75 40 V 18" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
            <path d="M 5 40 V 62 C 5 70, 75 70, 75 62 V 40" fill="#075985" stroke="#38bdf8" strokeWidth="2.5" />
            <path d="M 5 62 V 84 C 5 92, 75 92, 75 84 V 62" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="25" y1="36" x2="45" y2="36" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
            <line x1="25" y1="58" x2="45" y2="58" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
            <line x1="25" y1="80" x2="45" y2="80" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Right: B-Tree Node Branching */}
          <g transform="translate(140, 30)">
            {/* Root Node */}
            <rect x="25" y="8" width="60" height="26" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <line x1="55" y1="8" x2="55" y2="34" stroke="#38bdf8" strokeWidth="2" />
            <text x="40" y="24" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">10</text>
            <text x="70" y="24" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle">20</text>

            {/* Tree branches */}
            <path d="M 35 34 L 15 62" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
            <path d="M 75 34 L 95 62" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />

            {/* Leaf Nodes */}
            <rect x="0" y="62" width="40" height="22" rx="4" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
            <text x="20" y="77" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">5 | 8</text>

            <rect x="70" y="62" width="40" height="22" rx="4" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.5" />
            <text x="90" y="77" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">25 | 30</text>
          </g>
        </svg>
      );

    case 'cdc-event-driven':
      // Transactional Outbox & Debezium WAL Replication Pipeline
      return (
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-40" fill="none">
          {/* Database WAL Log */}
          <g transform="translate(30, 35)">
            <rect width="60" height="70" rx="6" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
            <text x="30" y="22" fill="#a7f3d0" fontSize="9" fontFamily="monospace" textAnchor="middle">WAL LOG</text>
            <rect x="10" y="30" width="40" height="8" rx="2" fill="#059669" />
            <rect x="10" y="42" width="40" height="8" rx="2" fill="#059669" />
            <rect x="10" y="54" width="40" height="8" rx="2" fill="#34d399" />
          </g>

          {/* Streaming Arrows */}
          <g transform="translate(100, 60)">
            <line x1="5" y1="10" x2="55" y2="10" stroke="#34d399" strokeWidth="3" strokeDasharray="5 3" />
            <polygon points="65,10 52,4 52,16" fill="#34d399" />
          </g>

          {/* Debezium Engine / Kafka Sink */}
          <g transform="translate(180, 35)">
            <rect width="70" height="70" rx="10" fill="#022c22" stroke="#10b981" strokeWidth="2.5" />
            <circle cx="35" cy="30" r="14" fill="#059669" />
            <path d="M 28 30 L 33 35 L 42 25" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="35" y="58" fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">DEBEZIUM</text>
          </g>
        </svg>
      );

    case 'message-queue':
      // Distributed Partition Pipes & FIFO Tokens
      return (
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-40" fill="none">
          {/* Broker Container */}
          <rect x="35" y="25" width="210" height="90" rx="12" fill="#3b0764" stroke="#c084fc" strokeWidth="2" />
          <text x="140" y="45" fill="#e9d5ff" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            KAFKA TOPIC: PARTITION 0
          </text>

          {/* Message Queue Slots */}
          <g transform="translate(55, 60)">
            <rect x="0" y="0" width="30" height="34" rx="4" fill="#7e22ce" stroke="#f3e8ff" strokeWidth="1.5" />
            <text x="15" y="21" fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle">#01</text>

            <rect x="40" y="0" width="30" height="34" rx="4" fill="#7e22ce" stroke="#f3e8ff" strokeWidth="1.5" />
            <text x="55" y="21" fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle">#02</text>

            <rect x="80" y="0" width="30" height="34" rx="4" fill="#9333ea" stroke="#f3e8ff" strokeWidth="1.5" />
            <text x="95" y="21" fill="#ffffff" fontSize="10" fontFamily="monospace" textAnchor="middle">#03</text>

            <rect x="120" y="0" width="30" height="34" rx="4" fill="#a855f7" stroke="#f3e8ff" strokeWidth="2" />
            <text x="135" y="21" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">#04</text>
          </g>

          {/* Consumer Offset pointer */}
          <path d="M 190 102 L 190 92 L 195 97 Z" fill="#facc15" />
        </svg>
      );

    case 'docker-containers':
      // Layered UnionFS & Namespace Isolation Blocks
      return (
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-40" fill="none">
          {/* Container Box */}
          <g transform="translate(60, 20)">
            {/* Upper Writable Layer */}
            <rect x="0" y="0" width="160" height="24" rx="4" fill="#0891b2" stroke="#67e8f9" strokeWidth="2" />
            <text x="80" y="16" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Container Writable Layer</text>

            {/* Application Layer */}
            <rect x="0" y="28" width="160" height="24" rx="4" fill="#0e7490" stroke="#67e8f9" strokeWidth="1.5" />
            <text x="80" y="44" fill="#e0f2fe" fontSize="9" fontFamily="monospace" textAnchor="middle">App &amp; Dependencies</text>

            {/* Base Image Layer */}
            <rect x="0" y="56" width="160" height="24" rx="4" fill="#155e75" stroke="#67e8f9" strokeWidth="1.5" />
            <text x="80" y="72" fill="#bae6fd" fontSize="9" fontFamily="monospace" textAnchor="middle">Base Image (Linux Alpine)</text>

            {/* Host Kernel */}
            <rect x="0" y="84" width="160" height="18" rx="3" fill="#083344" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="80" y="97" fill="#67e8f9" fontSize="8" fontFamily="monospace" textAnchor="middle">Host Linux Kernel (cgroups/namespaces)</text>
          </g>
        </svg>
      );

    case 'system-security':
      // OAuth 2.0 PKCE Handshake & Cryptographic Token
      return (
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-40" fill="none">
          {/* Shield Base */}
          <g transform="translate(45, 20)">
            <path
              d="M 45 5 Q 75 16 85 24 Q 85 64 45 95 Q 5 64 5 24 Q 15 16 45 5 Z"
              fill="#9f1239"
              stroke="#fb7185"
              strokeWidth="2.5"
            />
            {/* Padlock in shield */}
            <rect x="33" y="45" width="24" height="20" rx="3" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />
            <path d="M 38 45 V 36 C 38 31, 52 31, 52 36 V 45" stroke="#ffffff" strokeWidth="2" fill="none" />
            <circle cx="45" cy="54" r="2.5" fill="#ffffff" />
          </g>

          {/* JWT Token Code Box */}
          <g transform="translate(145, 35)">
            <rect width="100" height="65" rx="8" fill="#1e1b4b" stroke="#fda4af" strokeWidth="2" />
            <text x="12" y="22" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">HEADER.payload</text>
            <text x="12" y="38" fill="#38bdf8" fontSize="9" fontFamily="monospace">.signature</text>
            <text x="12" y="54" fill="#a7f3d0" fontSize="8" fontFamily="monospace">HMAC-SHA256 ✓</text>
          </g>
        </svg>
      );

    case 'devops-orchestration':
      // Kubernetes Cluster Pods & Canary Traffic Splitter
      return (
        <svg viewBox="0 0 280 140" className="w-full h-full max-h-40" fill="none">
          {/* Ingress Router */}
          <g transform="translate(30, 45)">
            <polygon points="35,10 65,45 5,45" fill="#d97706" stroke="#fde68a" strokeWidth="2" />
            <text x="35" y="38" fill="#ffffff" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">INGRESS</text>
          </g>

          {/* Traffic Split Lines */}
          <path d="M 85 55 L 140 35" stroke="#34d399" strokeWidth="2.5" />
          <text x="110" y="38" fill="#34d399" fontSize="8" fontFamily="monospace">90%</text>

          <path d="M 85 75 L 140 95" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 2" />
          <text x="110" y="96" fill="#f59e0b" fontSize="8" fontFamily="monospace">10%</text>

          {/* Stable Pods (Green) */}
          <g transform="translate(150, 20)">
            <rect width="85" height="32" rx="6" fill="#065f46" stroke="#34d399" strokeWidth="2" />
            <text x="42" y="20" fill="#a7f3d0" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Stable v1.0 (3 pods)</text>
          </g>

          {/* Canary Pods (Amber) */}
          <g transform="translate(150, 80)">
            <rect width="85" height="32" rx="6" fill="#78350f" stroke="#fbbf24" strokeWidth="2" />
            <text x="42" y="20" fill="#fef08a" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Canary v2.0 (1 pod)</text>
          </g>
        </svg>
      );

    default:
      return null;
  }
}
