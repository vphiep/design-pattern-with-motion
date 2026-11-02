'use client';

/**
 * Thin GSAP / ScrollTrigger wrapper that gives us a safe register/cleanup
 * context per component, mirroring the recommended gsap.context() pattern.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useGsapContext(ref, (ctx) => {
 *     gsap.from('.item', { y: 20, opacity: 0, stagger: 0.05 });
 *   }, [dependencies]);
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { usePrefersReducedMotion } from './reduced-motion';

let registered = false;
function ensureRegistered() {
  if (typeof window === 'undefined' || registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type GsapContextCallback = (ctx: gsap.Context) => void;

export function useGsapContext(
  scope: React.RefObject<HTMLElement | null>,
  setup: GsapContextCallback,
  deps: ReadonlyArray<unknown> = []
) {
  const reduced = usePrefersReducedMotion();
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useIsoLayoutEffect(() => {
    if (reduced) return;
    ensureRegistered();
    if (!scope.current) return;
    const ctx = gsap.context(setupRef.current, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);
}

export { gsap, ScrollTrigger };
