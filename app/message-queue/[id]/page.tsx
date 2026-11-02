import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MessagingTopicShell } from '@/components/messaging/MessagingTopicShell';
import { getAllMessagingTopics, getMessagingTopicById } from '@/lib/messaging/data';
import { pickText } from '@/lib/i18n/types';
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllMessagingTopics().map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const t = getMessagingTopicById(params.id);
  if (!t) return { title: 'Topic Not Found — Messaging & Distributed Streaming' };
  return {
    title: `${t.name} — Apache Kafka vs RabbitMQ Distributed Systems`,
    description: pickText(t.tagline, 'en')
  };
}

export default function MessageQueueTopicPage({ params }: PageProps) {
  const topic = getMessagingTopicById(params.id);
  if (!topic) notFound();

  return (
    <Suspense fallback={null}>
      <MessagingTopicShell topic={topic} />
    </Suspense>
  );
}
