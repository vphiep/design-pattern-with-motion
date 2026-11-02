export function CornerCrosshair({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={`absolute text-accent ${className}`}
    >
      <path d="M7 0 V14 M0 7 H14" stroke="currentColor" strokeWidth="1" />
      <circle cx="7" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}
