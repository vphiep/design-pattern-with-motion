import type { CourseAccent, CourseLevel } from '@/lib/courses/types';

/**
 * Literal Tailwind class bundles per accent. Kept as full strings (never
 * interpolated) so the JIT compiler can see every class.
 */
export interface CourseTheme {
  hex: string;
  text: string;
  textStrong: string;
  groupHoverText: string;
  hoverText: string;
  badge: string;
  softPanel: string;
  border: string;
  cardHover: string;
  pillActive: string;
  solidButton: string;
  outlineButton: string;
  dot: string;
  quoteBorder: string;
  focus: string;
  minimap: 'sky' | 'rose' | 'emerald' | 'amber' | 'purple';
}

export const COURSE_THEMES: Record<CourseAccent, CourseTheme> = {
  emerald: {
    hex: '#10b981',
    text: 'text-emerald-400',
    textStrong: 'text-emerald-300',
    groupHoverText: 'group-hover:text-emerald-300',
    hoverText: 'hover:text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    softPanel: 'border-emerald-500/30 bg-emerald-500/5',
    border: 'border-emerald-500/30',
    cardHover: 'hover:border-emerald-500/50',
    pillActive: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    solidButton: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25',
    outlineButton:
      'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
    dot: 'bg-emerald-400',
    quoteBorder: 'border-emerald-500/40',
    focus: 'focus:border-emerald-500/60',
    minimap: 'emerald'
  },
  cyan: {
    hex: '#06b6d4',
    text: 'text-cyan-400',
    textStrong: 'text-cyan-300',
    groupHoverText: 'group-hover:text-cyan-300',
    hoverText: 'hover:text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    softPanel: 'border-cyan-500/30 bg-cyan-500/5',
    border: 'border-cyan-500/30',
    cardHover: 'hover:border-cyan-500/50',
    pillActive: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    solidButton: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/25',
    outlineButton: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20',
    dot: 'bg-cyan-400',
    quoteBorder: 'border-cyan-500/40',
    focus: 'focus:border-cyan-500/60',
    minimap: 'sky'
  },
  rose: {
    hex: '#f43f5e',
    text: 'text-rose-400',
    textStrong: 'text-rose-300',
    groupHoverText: 'group-hover:text-rose-300',
    hoverText: 'hover:text-rose-400',
    badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    softPanel: 'border-rose-500/30 bg-rose-500/5',
    border: 'border-rose-500/30',
    cardHover: 'hover:border-rose-500/50',
    pillActive: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
    solidButton: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25',
    outlineButton: 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20',
    dot: 'bg-rose-400',
    quoteBorder: 'border-rose-500/40',
    focus: 'focus:border-rose-500/60',
    minimap: 'rose'
  },
  amber: {
    hex: '#f59e0b',
    text: 'text-amber-400',
    textStrong: 'text-amber-300',
    groupHoverText: 'group-hover:text-amber-300',
    hoverText: 'hover:text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    softPanel: 'border-amber-500/30 bg-amber-500/5',
    border: 'border-amber-500/30',
    cardHover: 'hover:border-amber-500/50',
    pillActive: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    solidButton: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25',
    outlineButton: 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
    dot: 'bg-amber-400',
    quoteBorder: 'border-amber-500/40',
    focus: 'focus:border-amber-500/60',
    minimap: 'amber'
  }
};

export const LEVEL_BADGES: Record<CourseLevel, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  intermediate: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
  advanced: 'bg-violet-500/15 text-violet-400 border border-violet-500/30'
};
