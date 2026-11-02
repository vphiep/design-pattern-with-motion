import type { CourseTopic } from '../courses/types';

/** Roadmap levels: Cấp độ 1 Fundamentals · 2 Application & Multi-container · 3 Advanced & Production. */
export type DockerCategory = 'docker-fundamentals' | 'docker-multi-container' | 'docker-production';

export type DockerTopic = CourseTopic<DockerCategory>;
