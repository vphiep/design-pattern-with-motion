import { getModuleById } from '@/lib/modules/registry';
import { ModuleLabView } from '@/components/modules/ModuleLabView';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Security, OAuth 2.0 & Auth — Visual Engineering Lab',
  description: 'OAuth 2.0 PKCE sequence handshake, JWT token lifecycles, and TLS 1.3 cryptographic key exchange.'
};

export default function SecurityModulePage() {
  const mod = getModuleById('system-security');
  if (!mod) notFound();

  return <ModuleLabView module={mod} />;
}
