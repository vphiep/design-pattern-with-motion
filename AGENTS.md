# Motion & Animation Architecture Rules

When implementing or modifying animations in this project (`design-pattern-with-motion`), follow these architectural boundaries:

## Motion Engine Responsibilities

1. **GSAP + ScrollTrigger / useSceneTimeline**:
   - Scope: `components/illustrations/*` and choreographed SVG pattern scenes.
   - Requirement: Step timelines must add labels matching `step-0`, `step-1`, `step-2`.
   - All timelines must clean up using `gsap.context()` via `useSceneTimeline` or `useGsapContext`.
   - Never alter the step count or order in `lib/patterns/scene-meta.ts` without aligning the illustration timeline.

2. **Motion (`framer-motion`)**:
   - Scope: React component UI, layout transitions (`layoutId`), route transitions (`RouteTransition`), interactive controls, and gestures.
   - Requirement: Wrap animations in `AnimatePresence` with appropriate `mode="wait"` where necessary.

3. **Anime.js**:
   - Scope: Complex JavaScript-driven SVG morphing, mathematical path calculations, and granular timeline interpolations.
   - Requirement: Must be instantiated within React `useEffect` / `useRef` hooks with an explicit cancel/revert on unmount.

4. **Animate.css & Tailwind Motion Utilities**:
   - Scope: Micro-interactions, attention badges (pulse, bounce, flash), instant entrance/exit transitions.
   - Requirement: Use `@layer utilities` or Tailwind-compatible classes. Avoid inline style animation mutations.

5. **HTML5 Canvas (`lib/canvas/useCanvas.ts`)**:
   - Scope: `/playground` simulations (Observer event dispatchers, Decorator pipelines, Factory assembly lines).
   - Requirement: DPR scaling (`window.devicePixelRatio`), clean `requestAnimationFrame` lifecycle, memory-safe event listeners.

6. **Accessibility & Reduced Motion**:
   - Always check `usePrefersReducedMotion()` or CSS `@media (prefers-reduced-motion: reduce)`.
   - Timelines should immediately snap to progress `1` when reduced motion is enabled.
