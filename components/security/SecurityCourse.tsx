'use client';

import { CourseHubExperience } from '@/components/courses/CourseHubExperience';
import { CourseTopicShell } from '@/components/courses/CourseTopicShell';
import { SECURITY_COURSE, getSecurityTopicById } from '@/lib/security/data';
import { SECURITY_SCENE_META } from '@/lib/security/scene-meta';
import { SECURITY_SCENES } from './illustrations';

export function SecurityHub() {
  return <CourseHubExperience course={SECURITY_COURSE} />;
}

export function SecurityTopic({ topicId }: { topicId: string }) {
  const topic = getSecurityTopicById(topicId);
  if (!topic) return null;
  return (
    <CourseTopicShell
      key={topic.id}
      course={SECURITY_COURSE}
      topic={topic}
      sceneMeta={SECURITY_SCENE_META}
      bespokeScenes={SECURITY_SCENES}
    />
  );
}
