'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { usePrefersReducedMotion } from '@/lib/animations/reduced-motion';

/**
 * Animated packet traveling along a curved connector path in an architectural scene.
 * Useful for demonstrating Observer notifications, Chain of Responsibility request forwarding, etc.
 */
export function SvgPathFollower() {
  const containerRef = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!containerRef.current || reduced) return;

    const pathEl = containerRef.current.querySelector('#diagram-flow-path');
    const tokenEl = containerRef.current.querySelector('#flow-token');

    if (!pathEl || !tokenEl) return;

    const path = anime.path(pathEl as SVGPathElement);

    const animation = anime({
      targets: tokenEl,
      translateX: path('x'),
      translateY: path('y'),
      rotate: path('angle'),
      easing: 'easeInOutQuad',
      duration: 2500,
      loop: true
    });

    return () => {
      animation.pause();
      if (tokenEl) anime.remove(tokenEl);
    };
  }, [reduced]);

  return (
    <svg ref={containerRef} viewBox="0 0 600 200" className="w-full h-auto max-w-xl mx-auto">
      {/* Background connector path */}
      <path
        id="diagram-flow-path"
        d="M 50 100 C 180 20, 420 180, 550 100"
        fill="none"
        stroke="var(--border-soft)"
        strokeWidth="3"
        strokeDasharray="4 4"
      />

      {/* Animated token following curve */}
      <g id="flow-token">
        <circle r="9" fill="var(--accent)" />
        <circle r="4" fill="#ffffff" />
      </g>
    </svg>
  );
}
