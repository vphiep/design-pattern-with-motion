import { getModuleById } from '@/lib/modules/registry';
import { ModuleLabView } from '@/components/modules/ModuleLabView';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'DevOps & Cloud Orchestration — Visual Engineering Lab',
  description: 'Canary vs Blue/Green traffic splitting, Kubernetes Pod controllers, Ingress routing, and auto-scaling.'
};

export default function DevOpsModulePage() {
  const mod = getModuleById('devops-orchestration');
  if (!mod) notFound();

  return <ModuleLabView module={mod} />;
}
