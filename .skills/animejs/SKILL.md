---
name: animejs
description: >-
  Use this skill when implementing JavaScript-driven animations, SVG path following,
  shape morphing, staggered timing, or custom timeline orchestrations using Anime.js
  in Next.js and React components.
---

# Anime.js Animation Skill

Anime.js (`https://github.com/juliangarnier/anime.git`) is a lightweight JavaScript animation engine. This project has Anime.js v4 installed along with a React integration hook `useAnime` at `lib/animations/useAnime.ts`.

## When to Use Anime.js in this Project

- Complex SVG path animation (e.g. animated tokens traveling along custom curves or bezier paths).
- Polygon / path morphing between two vector shapes (e.g. visualizing pattern transformation: Adapter changing an interface shape).
- Staggered grid or node animations with advanced easing math.
- Value tweening of JavaScript objects (counters, progress calculations).

## Integration in Next.js (App Router / React)

Use the project's native hook `useAnime` (`lib/animations/useAnime.ts`) which automatically provides:
- SSR safety via `useIsoLayoutEffect`
- Auto teardown/reversion on component unmount
- Automatic detection of `usePrefersReducedMotion()`

```typescript
'use client';
import { useRef } from 'react';
import { useAnime, animate, stagger } from '@/lib/animations/useAnime';

export function MyAnimeComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useAnime(containerRef, (scopeEl) => {
    return animate(scopeEl.querySelectorAll('.dot'), {
      translateY: [-20, 0],
      opacity: [0, 1],
      delay: stagger(80),
      ease: 'outElastic(1, .6)'
    });
  }, []);

  return (
    <div ref={containerRef}>
      <span className="dot inline-block w-3 h-3 bg-accent rounded-full mr-2" />
      <span className="dot inline-block w-3 h-3 bg-secondary rounded-full mr-2" />
    </div>
  );
}
```

## References & Examples

- Detailed API Cheatsheet: [api-cheatsheet.md](./references/api-cheatsheet.md)
- SVG Path Animation Example: [SvgPathFollower.tsx](./examples/SvgPathFollower.tsx)
- Shape Morphing Example: [ShapeMorph.tsx](./examples/ShapeMorph.tsx)
