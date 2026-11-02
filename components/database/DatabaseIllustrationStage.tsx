'use client';

import { useEffect, useState } from 'react';
import { PatternCanvas } from '@/components/PatternCanvas';
import { getDatabaseIllustration } from './illustrations';
import { DATABASE_SCENE_META } from '@/lib/database/scene-meta';
import type { DatabaseTopic } from '@/lib/database/types';
import { useLocale } from '@/components/LocaleProvider';

interface DatabaseIllustrationStageProps {
  topic: DatabaseTopic;
  activeStep: number | null;
  onStepChange: (index: number) => void;
  emphasizeStep: number | null;
  seekStep?: number | null;
  onSeekStep?: (index: number | null) => void;
  onReplay?: () => void;
}

export function DatabaseIllustrationStage({
  topic,
  activeStep,
  onStepChange,
  emphasizeStep,
  seekStep: seekStepProp,
  onSeekStep,
  onReplay: onReplayProp
}: DatabaseIllustrationStageProps) {
  const { ui, tx } = useLocale();
  const [replayNonce, setReplayNonce] = useState(0);
  const [paused, setPaused] = useState(false);
  const [internalSeekStep, setInternalSeekStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const Scene = getDatabaseIllustration(topic.id);
  const meta = DATABASE_SCENE_META[topic.id];

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
        caption={meta ? tx(meta.caption) : tx(topic.tagline)}
        label={`Database Mechanism Stage: ${topic.name}`}
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
            <p className="caption">{topic.name}</p>
          </div>
        )}
      </PatternCanvas>
    </div>
  );
}
