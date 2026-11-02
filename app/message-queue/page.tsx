import { getModuleById } from '@/lib/modules/registry';
import { ModuleLabView } from '@/components/modules/ModuleLabView';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Message Queues & Streaming — Visual Engineering Lab',
  description: 'Kafka partition rebalancing, consumer offsets, RabbitMQ topic exchanges and backpressure handling.'
};

export default function MessageQueueModulePage() {
  const mod = getModuleById('message-queue');
  if (!mod) notFound();

  return <ModuleLabView module={mod} />;
}
