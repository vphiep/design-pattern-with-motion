---
name: canvas-simulation
description: >-
  Use this skill when developing or debugging interactive 60FPS HTML5 Canvas simulations,
  particle systems, or algorithmic interactive playgrounds in /playground.
---

# Canvas Simulation Skill

The `/playground` section of this project provides interactive simulations for design patterns (Observer event dispatchers, Decorator pipeline wrappers, Factory production lines, Strategy algorithm switches) rendered via HTML5 Canvas.

## Core Rules for Canvas in Next.js

1. **High-DPI / Retina Crispness**: Always scale the canvas backing store by `window.devicePixelRatio` while keeping CSS layout size constant (`lib/canvas/useCanvas.ts`).
2. **Animation Loop (`requestAnimationFrame`)**:
   - Manage the loop with a timestamp delta (`dt = (now - last) / 1000`) for frame-rate independent physics.
   - Always cancel the request on unmount (`cancelAnimationFrame`).
3. **Hit-Testing & Interaction**:
   - Translate mouse/touch client coordinates by bounding client rect: `(e.clientX - rect.left) * (canvas.width / rect.width)`.
4. **Clean Canvas State**:
   - Always pair `ctx.save()` with `ctx.restore()`.
   - Never leak untracked state transformations.

## References & Examples

- Canvas Architecture & Performance: [canvas-loop-guide.md](./references/canvas-loop-guide.md)
- Complete Simulation Component: [SimulationCanvas.tsx](./examples/SimulationCanvas.tsx)
