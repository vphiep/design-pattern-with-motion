'use client';

import { useEffect, useState } from 'react';
import { PatternCanvas } from '@/components/PatternCanvas';
import { useLocale } from '@/components/LocaleProvider';
import type { SceneMeta } from '@/lib/patterns/scene';
import type { CourseTopic } from '@/lib/courses/types';
import { StepFlowScene } from './StepFlowScene';
import type { BespokeScene } from './scene-kit';

interface CourseIllustrationStageProps {
  courseName: string;
  topic: CourseTopic;
  meta: SceneMeta | undefined;
  bespoke: BespokeScene | undefined;
  accentHex: string;
  onStepChange: (index: number) => void;
  emphasizeStep: number | null;
  seekStep: number | null;
  onSeekStep: (index: number | null) => void;
  onReplay: () => void;
}

export function CourseIllustrationStage({
  courseName,
  topic,
  meta,
  bespoke,
  accentHex,
  onStepChange,
  emphasizeStep,
  seekStep,
  onSeekStep,
  onReplay
}: CourseIllustrationStageProps) {
  const { ui, tx } = useLocale();
  const [replayNonce, setReplayNonce] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && bespoke && bespoke.steps !== topic.steps.length) {
      console.warn(
        `[${courseName}] scene for "${topic.id}" defines ${bespoke.steps} step labels but the topic has ${topic.steps.length} steps.`
      );
    }
  }, [bespoke, topic, courseName]);

  const sceneProps = {
    replayNonce,
    paused,
    seekStep,
    onStepChange,
    emphasizeStep
  };
  const Bespoke = bespoke?.component;

  return (
    <PatternCanvas
      caption={meta ? tx(meta.caption) : tx(topic.tagline)}
      label={`${courseName}: ${topic.name}`}
      labels={{
        replay: ui.illustration.replay,
        pause: ui.illustration.pause,
        play: ui.illustration.play
      }}
      onReplay={() => {
        setPaused(false);
        onSeekStep(null);
        setReplayNonce((n) => n + 1);
        onReplay();
      }}
      onTogglePause={() => setPaused((p) => !p)}
      paused={paused}
    >
      {!mounted ? (
        <div className="grid h-full place-items-center">
          <p className="caption">{topic.name}</p>
        </div>
      ) : Bespoke ? (
        <Bespoke {...sceneProps} />
      ) : (
        <StepFlowScene
          {...sceneProps}
          steps={topic.steps}
          accent={accentHex}
          heading={`${courseName.toUpperCase()} · ${topic.name.toUpperCase()}`}
        />
      )}
    </PatternCanvas>
  );
}
