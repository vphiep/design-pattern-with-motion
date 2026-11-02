import { DatabasePlayground } from '@/components/database/DatabasePlayground';

export const metadata = {
  title: 'Database Internals Playground — Live B+ Tree, Clock & Hash Ring Simulator',
  description: 'Interactive sandbox for B+ Tree page splits, Buffer Pool Clock Eviction, and Consistent Hashing partition rings.'
};

export default function DatabasePlaygroundPage() {
  return <DatabasePlayground />;
}
