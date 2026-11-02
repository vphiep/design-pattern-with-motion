'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface SceneBoardProps {
  children: React.ReactNode;
  className?: string;
  viewBox?: string;
}

export const SceneBoard = forwardRef<SVGSVGElement, SceneBoardProps>(function SceneBoard(
  { children, className, viewBox = '0 0 800 480' },
  ref
) {
  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className={cn('h-full w-full text-text', className)}
      role="presentation"
    >
      <rect width="100%" height="100%" fill="transparent" />
      {children}
    </svg>
  );
});
