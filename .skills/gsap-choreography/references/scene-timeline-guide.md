# GSAP Scene Timeline Guide

Source Repository: [greensock/GSAP](https://github.com/greensock/GSAP.git)

## The Scene Coordinate System
- Coordinate canvas viewBox: `0 0 800 440`
- Top margin for captions: `y=36`
- Left alignment: `x=40`, Right alignment: `x=760 (anchor="end")`
- Vertical center line: `y=220`

## Step Sequence Convention

```typescript
useSceneTimeline(ref, {
  replayNonce,
  paused,
  seekStep,
  onStepChange,
  emphasizeStep,
  build: (tl) => {
    // Step 0: Initial state / request trigger
    tl.addLabel('step-0');
    tl.from('.caller', { x: -30, opacity: 0, duration: 0.4 });

    // Step 1: Mediation / Factory / Intermediary
    tl.addLabel('step-1');
    tl.from('.mediator', { opacity: 0, scale: 0.9, svgOrigin: '400 220', duration: 0.45 });
    tl.to('.link-incoming', { strokeDashoffset: 0, opacity: 1, duration: 0.3 }, '<0.1');

    // Step 2: Final dispatch / product return
    tl.addLabel('step-2');
    tl.from('.receiver', { y: 20, opacity: 0, duration: 0.4 });
    tl.to('.status-badge', { opacity: 1, duration: 0.2 });
  }
});
```

## Relative Timeline Offsets
- `'<0.1'`: Start 0.1s after the start of the previous tween.
- `'<'`: Align with the start of the previous tween.
- `'+=0.2'`: Gap of 0.2s after the previous tween ends.
- `'-=0.15'`: Overlap by 0.15s before the previous tween ends.

## Matching SVG Elements with Code Highlighting
In the SVG JSX:
```tsx
<g className="caller" data-step="0">
  <NodeBox x={40} y={192} w={140} h={56} label="Client" sub="caller" />
</g>
```
When step 0 is active, `data-step="0"` highlights the corresponding Java code match defined in `lib/patterns/scene-meta.ts`.
