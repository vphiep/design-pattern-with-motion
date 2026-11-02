'use client';

import { MotionConfig } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/animations/reduced-motion';

export function MotionConfigProvider({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  return (
    <MotionConfig
      reducedMotion={reduced ? 'always' : 'never'}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
