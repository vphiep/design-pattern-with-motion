import { useSvgId } from '../_shared';

export function NodeBox({
  x,
  y,
  w = 148,
  h = 56,
  label,
  sub,
  className,
  fill = 'var(--surface)',
  stroke = 'var(--border)',
  accent = false
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  className?: string;
  fill?: string;
  stroke?: string;
  accent?: boolean;
}) {
  return (
    <g className={className} transform={`translate(${x} ${y})`}>
      <rect
        className="node-fill"
        width={w}
        height={h}
        rx={2}
        fill={accent ? 'var(--accent)' : fill}
        stroke={accent ? 'var(--accent)' : stroke}
        strokeWidth={1.25}
      />
      <text
        x={w / 2}
        y={sub ? h / 2 - 4 : h / 2 + 4}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={12}
        fill={accent ? 'var(--bg)' : 'var(--text)'}
      >
        {label}
      </text>
      {sub && (
        <text
          x={w / 2}
          y={h / 2 + 14}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill={accent ? 'var(--bg)' : 'var(--text-muted)'}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

export function NodeCircle({
  cx,
  cy,
  r = 28,
  label,
  className,
  fill = 'var(--surface)',
  textFill = 'var(--text)'
}: {
  cx: number;
  cy: number;
  r?: number;
  label?: string;
  className?: string;
  fill?: string;
  /** Label color — pass var(--bg) when `fill` is the accent for contrast in both themes. */
  textFill?: string;
}) {
  return (
    <g className={className}>
      <circle
        className="node-fill"
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke="var(--border)"
        strokeWidth={1.25}
      />
      {label && (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={11}
          fill={textFill}
        >
          {label}
        </text>
      )}
    </g>
  );
}

export function Caption({
  x,
  y,
  children,
  anchor = 'start',
  muted = false
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  muted?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily="var(--font-mono)"
      fontSize={10}
      letterSpacing="0.12em"
      fill={muted ? 'var(--text-soft)' : 'var(--text-muted)'}
    >
      {children}
    </text>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  className,
  dashed = false,
  color = 'var(--text-muted)'
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  className?: string;
  dashed?: boolean;
  color?: string;
}) {
  const id = useSvgId('arr');
  return (
    <g className={className}>
      <defs>
        <marker id={id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.25}
        strokeDasharray={dashed ? '4 4' : undefined}
        markerEnd={`url(#${id})`}
      />
    </g>
  );
}

export function PulseRing({
  cx,
  cy,
  r = 36,
  className
}: {
  cx: number;
  cy: number;
  r?: number;
  className?: string;
}) {
  return (
    <circle
      className={className}
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="var(--accent)"
      strokeWidth={1.5}
      opacity={0}
    />
  );
}
