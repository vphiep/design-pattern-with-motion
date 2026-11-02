'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePrefersReducedMotion } from '@/lib/animations/reduced-motion';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export type TimelineBuilder = (tl: gsap.core.Timeline) => void;

interface UseSceneTimelineOptions {
  replayNonce: number;
  paused?: boolean;
  seekStep?: number | null;
  onStepChange?: (index: number) => void;
  emphasizeStep?: number | null;
  build: TimelineBuilder;
}

function currentStepFromTimeline(tl: gsap.core.Timeline): number {
  const time = tl.time();
  let current = 0;
  for (const [name, t] of Object.entries(tl.labels)) {
    if (!name.startsWith('step-')) continue;
    const idx = Number(name.slice(5));
    if (!Number.isNaN(idx) && t <= time + 0.001) current = Math.max(current, idx);
  }
  return current;
}

export function useSceneTimeline(
  scope: React.RefObject<Element | null>,
  options: UseSceneTimelineOptions
) {
  const { replayNonce, paused, seekStep, onStepChange, emphasizeStep, build } = options;
  const reduced = usePrefersReducedMotion();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const seekTweenRef = useRef<gsap.core.Tween | null>(null);
  const buildRef = useRef(build);
  buildRef.current = build;
  const stepCb = useRef(onStepChange);
  stepCb.current = onStepChange;
  const lastStep = useRef(-1);

  useIsoLayoutEffect(() => {
    if (!scope.current) return;
    lastStep.current = -1;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' },
        onUpdate: () => {
          const step = currentStepFromTimeline(tl);
          if (step !== lastStep.current) {
            lastStep.current = step;
            stepCb.current?.(step);
          }
        }
      });
      buildRef.current(tl);
      tlRef.current = tl;
      if (reduced) {
        tl.progress(1);
        stepCb.current?.(currentStepFromTimeline(tl));
      } else if (seekStep != null) {
        const label = 'step-' + seekStep;
        if (tl.labels[label] != null) {
          tl.seek(label);
          stepCb.current?.(seekStep);
        } else {
          tl.play(0);
        }
      } else {
        tl.play(0);
      }
    }, scope);

    return () => {
      seekTweenRef.current?.kill();
      seekTweenRef.current = null;
      ctx.revert();
      tlRef.current = null;
    };
  }, [replayNonce, reduced, scope]);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || reduced) return;
    if (paused) tl.pause();
    else if (!tl.isActive() && tl.progress() < 1) tl.play();
  }, [paused, reduced]);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || seekStep == null) return;
    const label = `step-${seekStep}`;
    if (tl.labels[label] == null) return;
    const next = `step-${seekStep + 1}`;
    // Kill any in-flight seek so rapid clicks don't fight over the playhead.
    seekTweenRef.current?.kill();
    seekTweenRef.current = null;
    if (reduced) {
      tl.seek(label);
      return;
    }
    if (tl.labels[next] != null) {
      seekTweenRef.current = tl.tweenTo(next);
    } else {
      tl.play(label);
    }
  }, [seekStep, reduced]);

  // Emphasis dims via fill/stroke opacity — never `opacity`, which the scene
  // timelines animate. Using a separate channel means hovering step chips can
  // never overwrite or kill timeline tweens, and un-emphasizing restores the
  // exact timeline-driven state (including intentional partial opacities).
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const nodes = root.querySelectorAll('[data-step]');
    if (!nodes.length) return;
    const tweens: gsap.core.Tween[] = [];
    if (emphasizeStep == null) {
      tweens.push(
        gsap.to(nodes, { fillOpacity: 1, strokeOpacity: 1, duration: 0.25, overwrite: 'auto' })
      );
    } else {
      nodes.forEach((n) => {
        const raw = n.getAttribute('data-step') ?? '';
        const match = raw
          .split(',')
          .map((s) => s.trim())
          .includes(String(emphasizeStep));
        const value = match ? 1 : 0.22;
        tweens.push(
          gsap.to(n, {
            fillOpacity: value,
            strokeOpacity: value,
            duration: 0.28,
            overwrite: 'auto'
          })
        );
      });
    }
    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [emphasizeStep, scope, replayNonce]);

  return tlRef;
}
