import type { CourseTopic } from '../courses/types';

export type DevopsCategory = 'delivery-pipeline' | 'kubernetes-core' | 'release-reliability';

export type DevopsTopic = CourseTopic<DevopsCategory>;
