---
name: gsap-choreography
description: >-
  Use this skill when authoring or updating SVG illustration scenes, multi-step timelines,
  GSAP ScrollTrigger choreographies, or step-seeking logic in the design patterns visualizer.
---

# GSAP Choreography Skill

GSAP (`https://github.com/greensock/GSAP.git`) is the core animation engine in this codebase for orchestrating multi-step architectural diagrams across all 23 GoF design pattern scenes.

## Core Architectural Rules in This Repo

1. **Step Labels**: Every timeline must insert step labels matching the pattern step index:
   ```typescript
   tl.addLabel('step-0');
   // ... tweens for step 0 ...
   tl.addLabel('step-1');
   // ... tweens for step 1 ...
   tl.addLabel('step-2');
   // ... tweens for step 2 ...
   ```
2. **Metadata Count Alignment**: The step count in `build(tl)` must strictly correspond with `SCENE_META[patternId].steps` in `lib/patterns/scene-meta.ts`.
3. **SVG Origin**: Always specify `svgOrigin: 'x y'` (absolute coordinate in the 800x440 viewBox) when scaling or rotating SVG elements, not `transformOrigin`.
4. **Context Cleanup**: Use `useSceneTimeline` or `useGsapContext`. These manage `gsap.context()` to ensure clean teardown without memory leaks or race conditions during fast React unmounts.
5. **Reduced Motion**: Automatically handled by `useSceneTimeline`, which jumps immediately to `tl.progress(1)` when reduced motion is preferred.

## Scene Component Structure

All pattern illustrations are located in `components/illustrations/{id}.tsx`.
They share:
- `SceneBoard`: Standard SVG canvas (viewBox="0 0 800 440") with blueprint grid.
- `Caption`: Architectural section captions (e.g., `REQUEST IN`, `PRODUCTS OUT`).
- `NodeBox`: Standardized boxed components with title and subtitle.
- `useSceneTimeline`: Hook managing play, pause, step seeking, and replay.

## References & Examples

- Complete Timeline Architecture Guide: [scene-timeline-guide.md](./references/scene-timeline-guide.md)
- Pattern Scene Boilerplate: [PatternIllustrationTemplate.tsx](./examples/PatternIllustrationTemplate.tsx)
