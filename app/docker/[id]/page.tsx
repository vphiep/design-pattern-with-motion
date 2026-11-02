import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DockerTopic } from '@/components/docker/DockerCourse';
import { DOCKER_COURSE, getDockerTopicById } from '@/lib/docker/data';
import { pickText } from '@/lib/i18n/types';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return DOCKER_COURSE.topics.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getDockerTopicById(params.id);
  if (!t) return { title: 'Topic Not Found — Docker & Containerization' };
  return { title: `${t.name} — Docker & Containerization`, description: pickText(t.tagline, 'en') };
}

export default function DockerTopicPage({ params }: PageProps) {
  if (!getDockerTopicById(params.id)) notFound();
  return (
    <Suspense fallback={null}>
      <DockerTopic topicId={params.id} />
    </Suspense>
  );
}
