import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { DatabaseTopicShell } from '@/components/database/DatabaseTopicShell';
import { getAllDatabaseTopics, getTopicById } from '@/lib/database/data';
import { pickText } from '@/lib/i18n/types';
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllDatabaseTopics().map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getTopicById(params.id);
  if (!t) return { title: 'Database Topic Not Found' };
  return {
    title: `${t.name} — Database Internals & Storage Architecture`,
    description: pickText(t.tagline, 'en')
  };
}

export default function DatabaseTopicPage({ params }: PageProps) {
  const topic = getTopicById(params.id);
  if (!topic) notFound();

  return (
    <Suspense fallback={null}>
      <DatabaseTopicShell topic={topic} />
    </Suspense>
  );
}
