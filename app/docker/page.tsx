import { DockerHub } from '@/components/docker/DockerCourse';

export const metadata = {
  title: 'Docker & Containerization — From Linux Primitives to Production',
  description:
    '11 lessons (DOCKER-01 → DOCKER-11): VMs vs containers, namespaces & cgroups, the CLI lifecycle, image layers and build cache, production-ready images, networking, volumes, Compose, supply-chain security, resource troubleshooting and the registry workflow.'
};

export default function DockerPage() {
  return <DockerHub />;
}
