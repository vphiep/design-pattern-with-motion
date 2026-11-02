'use client';

import React from 'react';
import { clsx } from 'clsx';

interface AttentionBadgeProps {
  label: string;
  active?: boolean;
  type?: 'creational' | 'structural' | 'behavioral';
}

/**
 * Attention badge providing CSS-driven focus indication when a step activates.
 */
export function AttentionBadge({
  label,
  active = false,
  type = 'creational'
}: AttentionBadgeProps) {
  const typeColor = {
    creational: 'bg-[var(--pattern-creational)] text-white',
    structural: 'bg-[var(--pattern-structural)] text-white',
    behavioral: 'bg-[var(--pattern-behavioral)] text-white'
  }[type];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full transition-transform',
        typeColor,
        active && 'animate-pulse scale-105 shadow-md'
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
      {label}
    </span>
  );
}
