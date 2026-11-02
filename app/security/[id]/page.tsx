import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SecurityTopic } from '@/components/security/SecurityCourse';
import { SECURITY_COURSE, getSecurityTopicById } from '@/lib/security/data';
import { pickText } from '@/lib/i18n/types';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return SECURITY_COURSE.topics.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getSecurityTopicById(params.id);
  if (!t) return { title: 'Topic Not Found — Security, OAuth 2.0 & Auth' };
  return {
    title: `${t.name} — Security, OAuth 2.0 & Auth`,
    description: pickText(t.tagline, 'en')
  };
}

export default function SecurityTopicPage({ params }: PageProps) {
  if (!getSecurityTopicById(params.id)) notFound();
  return (
    <Suspense fallback={null}>
      <SecurityTopic topicId={params.id} />
    </Suspense>
  );
}
