'use client';

import { CourseHubExperience } from '@/components/courses/CourseHubExperience';
import { CourseTopicShell } from '@/components/courses/CourseTopicShell';
import { DEVOPS_COURSE, getDevopsTopicById } from '@/lib/devops/data';
import { DEVOPS_SCENE_META } from '@/lib/devops/scene-meta';
import { DEVOPS_SCENES } from './illustrations';

export function DevopsHub() {
  return <CourseHubExperience course={DEVOPS_COURSE} />;
}

export function DevopsTopic({ topicId }: { topicId: string }) {
  const topic = getDevopsTopicById(topicId);
  if (!topic) return null;
  return (
    <CourseTopicShell
      key={topic.id}
      course={DEVOPS_COURSE}
      topic={topic}
      sceneMeta={DEVOPS_SCENE_META}
      bespokeScenes={DEVOPS_SCENES}
    />
  );
}
