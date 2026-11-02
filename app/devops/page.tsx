import { DevopsHub } from '@/components/devops/DevopsCourse';

export const metadata = {
  title: 'DevOps & Cloud Orchestration — CI/CD, Kubernetes, GitOps & SLOs',
  description:
    'Signed build-once pipelines, the Kubernetes scheduler and controllers, zero-downtime rolling updates, Services and Gateway API, GitOps canaries with automated analysis, autoscaling and SLO burn-rate alerting.'
};

export default function DevopsPage() {
  return <DevopsHub />;
}
