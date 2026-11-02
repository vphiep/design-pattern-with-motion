# SVG Diagram & Architecture Motion Conventions

## Typography & Positioning
- ViewBox standard: `0 0 800 440`
- Monospace font family: `font-mono text-xs` for technical names and method signatures.
- Labels: `fill="var(--text)" font-weight="600"`.
- Subtitles / stereotypes: `fill="var(--text-muted)" font-size="10" font-family="monospace"`.

## Standard Shapes
```tsx
// Node box
<rect
  x={x}
  y={y}
  width={w}
  height={h}
  rx={8}
  fill="var(--surface)"
  stroke="var(--border)"
  strokeWidth={1.25}
/>

// Badge pill
<rect
  x={x}
  y={y}
  width={60}
  height={20}
  rx={10}
  fill="var(--accent-soft)"
/>
```

## Animation Flow Speeds
- Packet traversal: `0.35s – 0.5s` per hop.
- Node reveal / scale: `0.4s` with `power2.out` or `ease-out`.
- Step transition buffer: `0.2s` between labels.
