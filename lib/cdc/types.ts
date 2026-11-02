import type { CourseTopic } from '../courses/types';

export type CdcCategory = 'cdc-foundations' | 'cdc-debezium' | 'cdc-production';

export type CdcTopic = CourseTopic<CdcCategory>;
