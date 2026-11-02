import { getModuleById } from '@/lib/modules/registry';
import { ModuleLabView } from '@/components/modules/ModuleLabView';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Database Internals & Storage — Visual Engineering Lab',
  description: 'B-Tree traversal, LSM-Tree compaction, MVCC concurrency, and write-ahead logs (WAL).'
};

export default function DatabaseModulePage() {
  const mod = getModuleById('database-internals');
  if (!mod) notFound();

  return <ModuleLabView module={mod} />;
}
