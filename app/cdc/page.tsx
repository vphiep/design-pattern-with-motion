import { getModuleById } from '@/lib/modules/registry';
import { ModuleLabView } from '@/components/modules/ModuleLabView';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Change Data Capture (CDC) — Visual Engineering Lab',
  description: 'Postgres WAL commit stream, Debezium connectors, and solving dual-writes with Transactional Outbox.'
};

export default function CdcModulePage() {
  const mod = getModuleById('cdc-event-driven');
  if (!mod) notFound();

  return <ModuleLabView module={mod} />;
}
