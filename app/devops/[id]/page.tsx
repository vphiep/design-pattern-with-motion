import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DevopsTopic } from '@/components/devops/DevopsCourse';
import { DEVOPS_COURSE, getDevopsTopicById } from '@/lib/devops/data';
import { pickText } from '@/lib/i18n/types';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return DEVOPS_COURSE.topics.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getDevopsTopicById(params.id);
  if (!t) return { title: 'Topic Not Found — DevOps & Cloud Orchestration' };
  return {
    title: `${t.name} — DevOps & Cloud Orchestration`,
    description: pickText(t.tagline, 'en')
  };
}

export default function DevopsTopicPage({ params }: PageProps) {
  if (!getDevopsTopicById(params.id)) notFound();
  return (
    <Suspense fallback={null}>
      <DevopsTopic topicId={params.id} />
    </Suspense>
  );
}
