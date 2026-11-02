import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { JavaCoreTopicShell } from '@/components/javacore/JavaCoreTopicShell';
import { getAllJavaCoreTopics, getJavaCoreTopicById } from '@/lib/javacore/data';
import { pickText } from '@/lib/i18n/types';
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllJavaCoreTopics().map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getJavaCoreTopicById(params.id);
  if (!t) return { title: 'Java Core Topic Not Found' };
  return {
    title: `${t.name} — Java Core & JVM Internals Architecture`,
    description: pickText(t.tagline, 'en')
  };
}

export default function JavaCoreTopicPage({ params }: PageProps) {
  const topic = getJavaCoreTopicById(params.id);
  if (!topic) notFound();

  return (
    <Suspense fallback={null}>
      <JavaCoreTopicShell topic={topic} />
    </Suspense>
  );
}
