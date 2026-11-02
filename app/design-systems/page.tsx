import { HomeExperience } from '@/components/home/HomeExperience';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design Patterns & Systems — Visual Interactive Atlas',
  description: 'The 23 Gang of Four design patterns explained with animated illustrations, step-by-step visual choreographies and production Java code.'
};

export default function DesignSystemsPage() {
  return <HomeExperience />;
}
