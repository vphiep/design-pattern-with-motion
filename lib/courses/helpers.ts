import type { SceneMeta } from '../patterns/scene';
import type { LocalizedText } from '../i18n/types';
import type { CourseDefinition, CourseLevel, CourseTopic } from './types';

export function getCourseTopic<C extends string>(
  course: CourseDefinition<C>,
  id: string
): CourseTopic<C> | undefined {
  return course.topics.find((t) => t.id === id);
}

export function getAdjacentCourseTopics<C extends string>(
  course: CourseDefinition<C>,
  id: string
): { prev: CourseTopic<C> | null; next: CourseTopic<C> | null } {
  const i = course.topics.findIndex((t) => t.id === id);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? course.topics[i - 1] : null,
    next: i < course.topics.length - 1 ? course.topics[i + 1] : null
  };
}

/**
 * Builds scene meta from the topic's own steps so the walkthrough, the
 * code highlight and the illustration's `step-N` labels share one source of
 * truth. Only the caption is authored separately.
 */
export function buildSceneMeta<C extends string>(
  course: CourseDefinition<C>,
  captions: Record<string, LocalizedText>,
  spans: Record<string, number> = {}
): Record<string, SceneMeta> {
  const out: Record<string, SceneMeta> = {};
  for (const t of course.topics) {
    out[t.id] = {
      caption: captions[t.id] ?? t.tagline,
      steps: t.steps.map((s) => ({
        id: s.id,
        label: s.title.en,
        match: s.codeLineMatch,
        span: spans[t.id] ?? 2
      }))
    };
  }
  return out;
}

export const COURSE_LEVEL_LABELS: Record<CourseLevel, LocalizedText> = {
  beginner: { vi: 'Cơ bản', en: 'Beginner' },
  intermediate: { vi: 'Trung cấp', en: 'Intermediate' },
  advanced: { vi: 'Nâng cao', en: 'Advanced' }
};

/** "Cơ bản → Trung cấp" when the topic spans two roadmap levels. */
export function courseLevelLabel(topic: CourseTopic, lang: 'vi' | 'en'): string {
  const from = COURSE_LEVEL_LABELS[topic.level][lang];
  return topic.levelTo ? `${from} → ${COURSE_LEVEL_LABELS[topic.levelTo][lang]}` : from;
}

export function topicMatchesLevel(topic: CourseTopic, level: CourseLevel): boolean {
  return topic.level === level || topic.levelTo === level;
}
