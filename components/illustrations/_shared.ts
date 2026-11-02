import { useId } from 'react';

/**
 * Namespace an SVG def id (`marker`, `clipPath`, `filter`, …) so stacked
 * scenes or 23 MiniPreviews on one page never collide.
 */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/:/g, '')}`;
}
