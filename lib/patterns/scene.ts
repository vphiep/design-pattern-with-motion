import type { LocalizedText } from '../i18n/types';

export interface SceneStep {
  id: string;
  label: string;
  /** Unique substring in the pattern's Java demo. */
  match: string;
  /** How many lines to highlight starting at the match. */
  span?: number;
}

export interface SceneMeta {
  /** Short mechanism line under the canvas — localized; not the walkthrough titles. */
  caption: LocalizedText;
  steps: SceneStep[];
}

export interface SceneProps {
  replayNonce: number;
  paused?: boolean;
  /** Seek the timeline to this step index. */
  seekStep?: number | null;
  onStepChange?: (index: number) => void;
  /** Dim everything except this step's parts. */
  emphasizeStep?: number | null;
}

export function linesForMatch(code: string, match: string, span = 1): [number, number] {
  const lines = code.split('\n');
  const i = lines.findIndex((l) => l.includes(match));
  if (i < 0) return [1, Math.min(span, lines.length)];
  return [i + 1, Math.min(lines.length, i + span)];
}

export function linesForStep(code: string, step: SceneStep | undefined): [number, number] | null {
  if (!step) return null;
  return linesForMatch(code, step.match, step.span ?? 1);
}
