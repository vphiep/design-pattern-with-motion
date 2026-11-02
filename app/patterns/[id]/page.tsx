import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PatternPageShell } from '@/components/PatternPageShell';
import { getAllPatterns, getPatternById } from '@/lib/patterns/data';
import { pickText } from '@/lib/i18n/types';
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return getAllPatterns().map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const p = getPatternById(params.id);
  if (!p) return { title: 'Pattern not found' };
  return {
    title: `${p.name} — Design Patterns, Visually`,
    description: pickText(p.tagline, 'en')
  };
}

export default function PatternPage({ params }: PageProps) {
  const pattern = getPatternById(params.id);
  if (!pattern) notFound();

  return (
    <Suspense fallback={null}>
      <PatternPageShell pattern={pattern} />
    </Suspense>
  );
}
