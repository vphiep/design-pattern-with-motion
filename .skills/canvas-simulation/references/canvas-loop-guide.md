# Canvas Loop & Performance Guide

Source Repositories:
- [rough-stuff/rough](https://github.com/rough-stuff/rough.git)
- Native HTML5 Canvas 2D Context

## Hook Integration (`lib/canvas/useCanvas.ts`)

```typescript
export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, frameCount: number, dt: number) => void
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      frameCount++;

      draw(ctx, frameCount, dt);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return canvasRef;
}
```

## Theme Token Synchronization
Read CSS variables directly into canvas fill styles:
```typescript
const computed = getComputedStyle(document.documentElement);
const accentColor = computed.getPropertyValue('--accent').trim();
const textColor = computed.getPropertyValue('--text').trim();
```
