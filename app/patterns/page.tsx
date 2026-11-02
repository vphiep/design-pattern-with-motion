import type { Metadata } from 'next';
import { CatalogExperience } from '@/components/catalog/CatalogExperience';

export const metadata: Metadata = {
  title: 'All Patterns — Design Patterns, Visually',
  description: 'The full 23-pattern catalog.'
};

export default function PatternsIndexPage() {
  return <CatalogExperience />;
}
