import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CdcTopic } from '@/components/cdc/CdcCourse';
import { CDC_COURSE, getCdcTopicById } from '@/lib/cdc/data';
import { pickText } from '@/lib/i18n/types';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return CDC_COURSE.topics.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getCdcTopicById(params.id);
  if (!t) return { title: 'Topic Not Found — Change Data Capture' };
  return { title: `${t.name} — Change Data Capture`, description: pickText(t.tagline, 'en') };
}

export default function CdcTopicPage({ params }: PageProps) {
  if (!getCdcTopicById(params.id)) notFound();
  return (
    <Suspense fallback={null}>
      <CdcTopic topicId={params.id} />
    </Suspense>
  );
}
