'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { usePrefersReducedMotion } from '@/lib/animations/reduced-motion';

/**
 * Shape morphing demo: An interface transitioning between Adaptee (round) and Target (polygonal).
 */
export function ShapeMorph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!svgRef.current || reduced) return;

    const path = svgRef.current.querySelector('#morph-target');
    if (!path) return;

    const anim = anime({
      targets: path,
      d: [
        { value: 'M 100,50 L 150,150 L 50,150 Z' }, // Triangle
        { value: 'M 50,50 L 150,50 L 150,150 L 50,150 Z' }, // Square
        { value: 'M 100,50 L 150,150 L 50,150 Z' }
      ],
      easing: 'easeInOutCubic',
      duration: 3000,
      loop: true
    });

    return () => {
      anim.pause();
      if (path) anime.remove(path);
    };
  }, [reduced]);

  return (
    <svg ref={svgRef} viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
      <path
        id="morph-target"
        d="M 100,50 L 150,150 L 50,150 Z"
        fill="var(--secondary)"
        stroke="var(--border)"
        strokeWidth="2"
      />
    </svg>
  );
}
