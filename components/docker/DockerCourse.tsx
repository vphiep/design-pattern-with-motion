'use client';

import { CourseHubExperience } from '@/components/courses/CourseHubExperience';
import { CourseTopicShell } from '@/components/courses/CourseTopicShell';
import { DOCKER_COURSE, getDockerTopicById } from '@/lib/docker/data';
import { DOCKER_SCENE_META } from '@/lib/docker/scene-meta';
import { DOCKER_SCENES } from './illustrations';

export function DockerHub() {
  return <CourseHubExperience course={DOCKER_COURSE} />;
}

export function DockerTopic({ topicId }: { topicId: string }) {
  const topic = getDockerTopicById(topicId);
  if (!topic) return null;
  return (
    <CourseTopicShell
      key={topic.id}
      course={DOCKER_COURSE}
      topic={topic}
      sceneMeta={DOCKER_SCENE_META}
      bespokeScenes={DOCKER_SCENES}
    />
  );
}
