'use client';

import { useEffect, useState } from 'react';
import { PatternCanvas } from '@/components/PatternCanvas';
import { getJavaCoreIllustration } from './illustrations';
import { JAVA_CORE_SCENE_META } from '@/lib/javacore/scene-meta';
import type { JavaCoreTopic } from '@/lib/javacore/types';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils/cn';

interface JavaCoreIllustrationStageProps {
  topic: JavaCoreTopic;
  activeStep: number | null;
  onStepChange: (index: number) => void;
  emphasizeStep: number | null;
  seekStep?: number | null;
  onSeekStep?: (index: number | null) => void;
  onReplay?: () => void;
  aspect?: 'square' | 'video' | 'wide' | 'auto';
  className?: string;
}

export function JavaCoreIllustrationStage({
  topic,
  activeStep,
  onStepChange,
  emphasizeStep,
  seekStep: seekStepProp,
  onSeekStep,
  onReplay: onReplayProp,
  aspect = 'video',
  className
}: JavaCoreIllustrationStageProps) {
  const { ui, tx } = useLocale();
  const [replayNonce, setReplayNonce] = useState(0);
  const [paused, setPaused] = useState(false);
  const [internalSeekStep, setInternalSeekStep] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const Scene = getJavaCoreIllustration(topic.id);
  const meta = JAVA_CORE_SCENE_META[topic.id];

  const currentSeekStep = seekStepProp !== undefined ? seekStepProp : internalSeekStep;

  const handleSetSeekStep = (s: number | null) => {
    setInternalSeekStep(s);
    onSeekStep?.(s);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(aspect === 'auto' ? 'h-full w-full flex flex-col justify-between' : 'space-y-3', className)}>
      <PatternCanvas
        aspect={aspect}
        className={aspect === 'auto' ? 'h-full w-full flex flex-col flex-1 min-h-0 justify-between' : undefined}
        caption={meta ? tx(meta.caption) : tx(topic.tagline)}
        label={`JVM Mechanism Stage: ${topic.name}`}
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
