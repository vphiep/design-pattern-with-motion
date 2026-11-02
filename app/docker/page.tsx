import { getModuleById } from '@/lib/modules/registry';
import { ModuleLabView } from '@/components/modules/ModuleLabView';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Docker & Containerization — Visual Engineering Lab',
  description: 'Linux Namespaces, Cgroups resource limits, OverlayFS layer unions, and virtual bridge networking.'
};

export default function DockerModulePage() {
  const mod = getModuleById('docker-containers');
  if (!mod) notFound();

  return <ModuleLabView module={mod} />;
}
