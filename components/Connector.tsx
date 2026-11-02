'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ConnectorProps {
  className?: string;
  variant?: 'wave' | 'arc' | 'step';
  from?: 'left' | 'right' | 'top' | 'bottom';
  to?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Hand-drawn-feeling connector line for linking code blocks to illustrations.
 * Pure SVG so it scales crisply.
 */
export function Connector({
  className,
  variant = 'wave',
  from = 'left',
  to = 'right'
}: ConnectorProps) {
  const path = paths[variant];

  return (
    <svg
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      aria-hidden
      className={cn('text-accent', className)}
    >
      <motion.path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
      />
      <motion.circle
        cx="195"
        cy={variant === 'arc' ? 8 : 30}
        r="2.5"
        fill="currentColor"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.0, duration: 0.4 }}
      />
      {/* direction metadata for screen readers only */}
      <title>{`${from} → ${to}`}</title>
    </svg>
  );
}

const paths: Record<'wave' | 'arc' | 'step', string> = {
  wave: 'M 4 30 Q 30 8, 60 30 T 120 30 T 196 30',
  arc: 'M 4 50 Q 100 -20, 196 10',
  step: 'M 4 30 L 60 30 L 60 12 L 140 12 L 140 30 L 196 30'
};
