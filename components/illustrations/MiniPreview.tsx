'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Tiny looping CSS preview used on the landing atlas and cards.
 * No GSAP, no SVG def ids — cheap and collision-free when 23 mount at once.
 * Colors are CSS variables so both themes stay contrast-safe.
 */
export function MiniPreview({ id, className }: { id: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 90"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-full w-full text-text', className)}
      aria-hidden
    >
      <rect width="160" height="90" fill="transparent" />
      {preview(id)}
    </svg>
  );
}

function preview(id: string) {
  switch (id) {
    case 'singleton':
      return (
        <>
          <circle cx="80" cy="45" r="14" fill="var(--accent)" className="animate-pulse-soft" />
          <circle cx="28" cy="24" r="5" fill="var(--text-soft)" />
          <circle cx="28" cy="45" r="5" fill="var(--text-soft)" />
          <circle cx="28" cy="66" r="5" fill="var(--text-soft)" />
        </>
      );
    case 'factory-method':
      return (
        <>
          <rect x="20" y="32" width="36" height="26" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="62"
            y="22"
            width="40"
            height="46"
            fill="var(--bg-elevated)"
            stroke="currentColor"
          />
          <rect
            x="110"
            y="28"
            width="30"
            height="16"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'abstract-factory':
      return (
        <>
          <rect x="14" y="22" width="60" height="50" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="86"
            y="22"
            width="60"
            height="50"
            fill="var(--bg-elevated)"
            stroke="currentColor"
          />
          <rect
            x="24"
            y="40"
            width="18"
            height="10"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
          <rect x="96" y="40" width="18" height="10" fill="var(--secondary)" />
        </>
      );
    case 'builder':
      return (
        <>
          <rect
            x="20"
            y="20"
            width="40"
            height="12"
            fill="var(--accent-soft)"
            stroke="currentColor"
          />
          <rect
            x="20"
            y="38"
            width="40"
            height="12"
            fill="var(--secondary-soft)"
            stroke="currentColor"
          />
          <rect
            x="20"
            y="56"
            width="40"
            height="12"
            fill="var(--bg-elevated)"
            stroke="currentColor"
          />
          <rect
            x="90"
            y="30"
            width="50"
            height="30"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'prototype':
      return (
        <>
          <circle cx="42" cy="45" r="18" fill="none" stroke="var(--accent)" strokeDasharray="3 3" />
          <circle cx="96" cy="45" r="12" fill="var(--surface)" stroke="currentColor" />
          <circle
            cx="128"
            cy="45"
            r="12"
            fill="var(--surface)"
            stroke="currentColor"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'adapter':
      return (
        <>
          <rect x="14" y="34" width="36" height="22" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="58"
            y="28"
            width="44"
            height="34"
            fill="none"
            stroke="var(--accent)"
            className="animate-pulse-soft"
          />
          <circle cx="130" cy="45" r="12" fill="var(--secondary)" />
        </>
      );
    case 'bridge':
      return (
        <>
          <rect x="16" y="22" width="44" height="18" fill="var(--surface)" stroke="currentColor" />
          <rect x="16" y="50" width="44" height="18" fill="var(--surface)" stroke="currentColor" />
          <line
            x1="60"
            y1="31"
            x2="100"
            y2="31"
            stroke="var(--accent)"
            className="animate-pulse-soft"
          />
          <rect
            x="100"
            y="22"
            width="44"
            height="18"
            fill="var(--bg-elevated)"
            stroke="currentColor"
          />
          <rect
            x="100"
            y="50"
            width="44"
            height="18"
            fill="var(--bg-elevated)"
            stroke="currentColor"
          />
        </>
      );
    case 'composite':
      return (
        <>
          <rect x="60" y="10" width="40" height="16" fill="var(--accent)" />
          <rect x="18" y="50" width="32" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="64" y="50" width="32" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="110" y="50" width="32" height="16" fill="var(--surface)" stroke="currentColor" />
          <path d="M80 26 V40 M80 40 H34 V50 M80 40 H126 V50" fill="none" stroke="currentColor" />
        </>
      );
    case 'decorator':
      return (
        <>
          <rect
            x="28"
            y="12"
            width="104"
            height="66"
            fill="none"
            stroke="var(--accent)"
            className="animate-pulse-soft"
          />
          <rect x="46" y="26" width="68" height="38" fill="none" stroke="var(--secondary)" />
          <rect x="62" y="36" width="36" height="18" fill="var(--surface)" stroke="currentColor" />
        </>
      );
    case 'facade':
      return (
        <>
          <rect x="14" y="18" width="28" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="46" y="18" width="28" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="14" y="40" width="28" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="46" y="40" width="28" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="92"
            y="28"
            width="50"
            height="28"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'flyweight':
      return (
        <>
          <rect
            x="14"
            y="12"
            width="28"
            height="16"
            fill="var(--accent-soft)"
            stroke="currentColor"
          />
          <rect
            x="46"
            y="12"
            width="28"
            height="16"
            fill="var(--secondary-soft)"
            stroke="currentColor"
          />
          <path
            d="M30 70 l6 -16 l6 16 z M60 76 l6 -16 l6 16 z M90 68 l6 -16 l6 16 z M120 74 l6 -16 l6 16 z"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'proxy':
      return (
        <>
          <rect x="14" y="34" width="36" height="22" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="58"
            y="28"
            width="40"
            height="34"
            fill="var(--bg-elevated)"
            stroke="currentColor"
          />
          <rect
            x="108"
            y="32"
            width="38"
            height="26"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'chain-of-responsibility':
      return (
        <>
          <rect x="10" y="28" width="36" height="20" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="62"
            y="28"
            width="36"
            height="20"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
          <rect x="114" y="28" width="36" height="20" fill="var(--surface)" stroke="currentColor" />
          <line x1="46" y1="38" x2="62" y2="38" stroke="currentColor" />
          <line x1="98" y1="38" x2="114" y2="38" stroke="currentColor" />
        </>
      );
    case 'command':
      return (
        <>
          <rect x="14" y="16" width="40" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="14" y="38" width="40" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="14" y="60" width="40" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="90"
            y="34"
            width="50"
            height="22"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'interpreter':
      return (
        <>
          <circle cx="80" cy="22" r="8" fill="var(--accent)" className="animate-pulse-soft" />
          <circle cx="50" cy="58" r="7" fill="var(--surface)" stroke="currentColor" />
          <circle cx="110" cy="58" r="7" fill="var(--surface)" stroke="currentColor" />
          <path d="M80 30 L50 51 M80 30 L110 51" fill="none" stroke="currentColor" />
        </>
      );
    case 'iterator':
      return (
        <>
          <rect
            x="14"
            y="32"
            width="28"
            height="26"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
          <rect x="48" y="32" width="28" height="26" fill="var(--surface)" stroke="currentColor" />
          <rect x="82" y="32" width="28" height="26" fill="var(--surface)" stroke="currentColor" />
          <rect x="116" y="32" width="28" height="26" fill="var(--surface)" stroke="currentColor" />
        </>
      );
    case 'mediator':
      return (
        <>
          <circle cx="80" cy="28" r="10" fill="var(--accent)" className="animate-pulse-soft" />
          <circle cx="28" cy="68" r="7" fill="var(--surface)" stroke="currentColor" />
          <circle cx="80" cy="74" r="7" fill="var(--surface)" stroke="currentColor" />
          <circle cx="132" cy="68" r="7" fill="var(--surface)" stroke="currentColor" />
          <line x1="80" y1="38" x2="28" y2="61" stroke="var(--accent)" />
          <line x1="80" y1="38" x2="80" y2="67" stroke="var(--accent)" />
          <line x1="80" y1="38" x2="132" y2="61" stroke="var(--accent)" />
        </>
      );
    case 'memento':
      return (
        <>
          <rect x="16" y="24" width="56" height="42" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="88"
            y="20"
            width="52"
            height="18"
            fill="var(--bg-elevated)"
            stroke="currentColor"
          />
          <rect
            x="88"
            y="48"
            width="52"
            height="18"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'observer':
      return (
        <>
          <circle cx="80" cy="22" r="10" fill="var(--accent)" className="animate-pulse-soft" />
          <line x1="80" y1="32" x2="30" y2="70" stroke="var(--accent)" />
          <line x1="80" y1="32" x2="80" y2="74" stroke="var(--accent)" />
          <line x1="80" y1="32" x2="130" y2="70" stroke="var(--accent)" />
          <circle cx="30" cy="72" r="6" fill="var(--surface)" stroke="currentColor" />
          <circle cx="80" cy="76" r="6" fill="var(--surface)" stroke="currentColor" />
          <circle cx="130" cy="72" r="6" fill="var(--surface)" stroke="currentColor" />
        </>
      );
    case 'state':
      return (
        <>
          <rect x="14" y="30" width="44" height="30" fill="var(--surface)" stroke="currentColor" />
          <rect x="68" y="18" width="36" height="22" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="110"
            y="48"
            width="36"
            height="22"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'strategy':
      return (
        <>
          <rect x="18" y="50" width="36" height="22" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="62"
            y="18"
            width="36"
            height="22"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
          <rect x="106" y="50" width="36" height="22" fill="var(--surface)" stroke="currentColor" />
        </>
      );
    case 'template-method':
      return (
        <>
          <rect x="16" y="16" width="52" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="16" y="38" width="52" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect x="16" y="60" width="52" height="16" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="86"
            y="38"
            width="56"
            height="16"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    case 'visitor':
      return (
        <>
          <rect x="14" y="48" width="36" height="18" fill="var(--surface)" stroke="currentColor" />
          <rect x="62" y="48" width="36" height="18" fill="var(--surface)" stroke="currentColor" />
          <rect x="110" y="48" width="36" height="18" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="54"
            y="14"
            width="52"
            height="18"
            fill="var(--accent)"
            className="animate-pulse-soft"
          />
        </>
      );
    default:
      return (
        <>
          <rect x="24" y="28" width="44" height="34" fill="var(--surface)" stroke="currentColor" />
          <rect
            x="86"
            y="22"
            width="50"
            height="46"
            fill="none"
            stroke="var(--accent)"
            className="animate-pulse-soft"
          />
          <line x1="68" y1="45" x2="86" y2="45" stroke="var(--accent)" />
        </>
      );
  }
}
