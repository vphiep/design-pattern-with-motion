import { cn } from '@/lib/utils/cn';

/**
 * Decorative blueprint grid background. Sits at the very back of the page.
 * Marked aria-hidden because it conveys no information.
 *
 * The grid is intentionally subtle — use it for atmosphere, not for layout.
 */
export function BlueprintGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
    >
      {/* base paper */}
      <div className="absolute inset-0 bg-bg" />

      {/* large grid */}
      <div className="absolute inset-0 bg-grid opacity-90" />

      {/* fine grid overlay */}
      <div className="absolute inset-0 bg-grid-fine opacity-50" />

      {/* warm radial glow (top-left) */}
      <div
        className="absolute -left-32 -top-40 h-[40rem] w-[40rem] rounded-full opacity-[0.18]"
        style={{
          background: 'radial-gradient(closest-side, var(--accent) 0%, transparent 70%)'
        }}
      />
      {/* cool radial (bottom-right) */}
      <div
        className="absolute -bottom-40 -right-32 h-[36rem] w-[36rem] rounded-full opacity-[0.12]"
        style={{
          background: 'radial-gradient(closest-side, var(--secondary) 0%, transparent 70%)'
        }}
      />

      {/* paper grain */}
      <div className="grain absolute inset-0" />

      {/* top edge horizontal hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-border" />
    </div>
  );
}
