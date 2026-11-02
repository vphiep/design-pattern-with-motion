import type { Pattern, PatternCategory } from './types';
import { allPatterns } from './content';

export { allPatterns };

/** All 23 patterns, sorted by suggested learning order. */
export function getAllPatterns(): Pattern[] {
  return [...allPatterns].sort((a, b) => a.order - b.order);
}

export function getPatternById(id: string): Pattern | undefined {
  return allPatterns.find((p) => p.id === id);
}

export function getPatternsByCategory(category: PatternCategory): Pattern[] {
  return allPatterns.filter((p) => p.category === category);
}

export function getCategoryPatterns(category: PatternCategory): Pattern[] {
  return getPatternsByCategory(category).sort((a, b) => a.order - b.order);
}

export function getAdjacentPatterns(id: string): { prev?: Pattern; next?: Pattern } {
  const all = getAllPatterns();
  const i = all.findIndex((p) => p.id === id);
  if (i < 0) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

/** Roman numerals only — labels and blurbs live in `lib/i18n/ui.ts`. */
export const CATEGORY_META: Record<PatternCategory, { number: string }> = {
  creational: { number: 'I.' },
  structural: { number: 'II.' },
  behavioral: { number: 'III.' }
};

export const CATEGORY_ORDER: PatternCategory[] = ['creational', 'structural', 'behavioral'];
