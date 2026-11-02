import { PlaygroundStudio } from '@/components/playground/PlaygroundStudio';

export const metadata = {
  title: 'Playground — Design Patterns, Visually',
  description: 'Interactive canvases for Observer, Decorator, Factory Method, and Strategy.'
};

export default function PlaygroundPage() {
  return <PlaygroundStudio />;
}
