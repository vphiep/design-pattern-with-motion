'use client';

import { useEffect, useState } from 'react';
import { PatternCanvas } from './PatternCanvas';
import { getIllustration } from '@/lib/patterns/illustrations';
import { SCENE_META } from '@/lib/patterns/scene-meta';
import { cn } from '@/lib/utils/cn';
import type { Pattern } from '@/lib/patterns/types';
import { useLocale } from './LocaleProvider';

interface IllustrationStageProps {
  pattern: Pattern;
  activeStep: number | null;
  onStepChange: (index: number) => void;
  emphasizeStep: number | null;
  seekStep?: number | null;
  onSeekStep?: (index: number | null) => void;
  onReplay?: () => void;
}

export function IllustrationStage({
  pattern,
  activeStep,
  onStepChange,
  emphasizeStep,
  seekStep: seekStepProp,
  onSeekStep,
  onReplay: onReplayProp
}: IllustrationStageProps) {
  const { ui, tx } = useLocale();
  const [replayNonce, setReplayNonce] = useState(0);
  const [paused, setPaused] = useState(false);
  const [internalSeekStep, setInternalSeekStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const Scene = getIllustration(pattern.id);
  const meta = SCENE_META[pattern.id];

  const currentSeekStep = seekStepProp !== undefined ? seekStepProp : internalSeekStep;

  const handleSetSeekStep = (s: number | null) => {
    setInternalSeekStep(s);
    onSeekStep?.(s);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-3">
      <PatternCanvas
        caption={meta ? tx(meta.caption) : ui.illustration.mechanismFallback(pattern.name)}
        label={ui.illustration.stageAria(pattern.name)}
        labels={{
          replay: ui.illustration.replay,
          pause: ui.illustration.pause,
          play: ui.illustration.play
        }}
        onReplay={() => {
          setPaused(false);
          handleSetSeekStep(null);
          setReplayNonce((n) => n + 1);
          onReplayProp?.();
        }}
        onTogglePause={() => setPaused((p) => !p)}
        paused={paused}
      >
        {mounted && Scene ? (
          <Scene
            replayNonce={replayNonce}
            paused={paused}
            seekStep={currentSeekStep}
            onStepChange={onStepChange}
            emphasizeStep={emphasizeStep}
          />
        ) : (
          <div className="grid h-full place-items-center">
            <p className="caption">{pattern.name}</p>
          </div>
        )}
      </PatternCanvas>

      {meta && (
        <ol className="flex flex-wrap gap-2">
          {meta.steps.map((step, i) => {
            const active = activeStep === i;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    onStepChange(i);
                    handleSetSeekStep(i);
                    setPaused(false);
                  }}
                  onMouseEnter={() => onStepChange(i)}
                  className={cn(
                    'border-hairline bg-surface px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest',
                    'transition-colors hover:bg-accent hover:text-bg',
                    active && 'bg-accent text-bg'
                  )}
                >
                  {String(i + 1).padStart(2, '0')} ·{' '}
                  {pattern.steps[i] ? tx(pattern.steps[i].title) : step.label}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
