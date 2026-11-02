'use client';

import { CourseHubExperience } from '@/components/courses/CourseHubExperience';
import { CourseTopicShell } from '@/components/courses/CourseTopicShell';
import { CDC_COURSE, getCdcTopicById } from '@/lib/cdc/data';
import { CDC_SCENE_META } from '@/lib/cdc/scene-meta';
import { CDC_SCENES } from './illustrations';

export function CdcHub() {
  return <CourseHubExperience course={CDC_COURSE} />;
}

export function CdcTopic({ topicId }: { topicId: string }) {
  const topic = getCdcTopicById(topicId);
  if (!topic) return null;
  return (
    <CourseTopicShell
      key={topic.id}
      course={CDC_COURSE}
      topic={topic}
      sceneMeta={CDC_SCENE_META}
      bespokeScenes={CDC_SCENES}
    />
  );
}
