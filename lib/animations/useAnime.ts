'use client';

/**
 * Idiomatic Anime.js hook for Next.js App Router & React 18+.
 * Handles SSR safety, scope reference cleanup, and reduced-motion preferences.
 *
 * Usage:
 *   const ref = useRef<SVGSVGElement>(null);
 *   useAnime(ref, (scopeEl) => {
 *     return animate(scopeEl.querySelectorAll('.node'), {
 *       translateX: 50,
 *       ease: 'outQuad'
 *     });
 *   }, [deps]);
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, createTimeline, stagger, svg } from 'animejs';
import { usePrefersReducedMotion } from './reduced-motion';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface ReversibleAnimation {
  pause?: () => void;
  revert?: () => void;
}

export type AnimeCallback = (
  scopeElement: HTMLElement | SVGSVGElement
) => ReversibleAnimation | void;

export function useAnime<T extends HTMLElement | SVGSVGElement>(
  scope: React.RefObject<T | null>,
  setup: AnimeCallback,
  deps: ReadonlyArray<unknown> = []
) {
  const reduced = usePrefersReducedMotion();
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useIsoLayoutEffect(() => {
    if (reduced || !scope.current) return;

    const el = scope.current;
    const instance = setupRef.current(el);

    return () => {
      if (instance) {
        if (typeof instance.revert === 'function') {
          instance.revert();
        } else if (typeof instance.pause === 'function') {
          instance.pause();
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);
}

export { animate, createTimeline, stagger, svg };
