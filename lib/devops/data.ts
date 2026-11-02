import type { CourseDefinition } from '../courses/types';
import { getCourseTopic } from '../courses/helpers';
import { ALL_DEVOPS_TOPICS } from './content';
import type { DevopsCategory, DevopsTopic } from './types';

export const DEVOPS_COURSE: CourseDefinition<DevopsCategory> = {
  id: 'devops-orchestration',
  basePath: '/devops',
  name: 'DevOps & Cloud Orchestration',
  accent: 'amber',
  shortLabel: { vi: 'DEVOPS · TỔNG QUAN', en: 'DEVOPS OVERVIEW' },
  hero: {
    eyebrow: {
      vi: 'CI/CD · KUBERNETES · GITOPS · CANARY · SLO',
      en: 'CI/CD · KUBERNETES · GITOPS · CANARY · SLO'
    },
    title: {
      vi: 'Từ Commit tới Production: Tự động, Quan sát được, Đảo ngược được',
      en: 'From Commit to Production: Automated, Observable, Reversible'
    },
    subtitle: {
      vi: 'Pipeline build-once có ký số, control plane và scheduler của Kubernetes, vòng lặp điều hoà và rolling update zero-downtime, Service/Gateway API, GitOps + canary có phân tích tự động và autoscaling gắn với SLO.',
      en: 'Signed build-once pipelines, the Kubernetes control plane and scheduler, reconciliation loops and zero-downtime rolling updates, Services/Gateway API, GitOps + automatically analysed canaries, and SLO-driven autoscaling.'
    }
  },
  pillarsHeading: { vi: '4 NGUYÊN LÝ VẬN HÀNH', en: '4 OPERATING PRINCIPLES' },
  pillars: [
    {
      tag: 'Immutable',
      title: { vi: 'Artifact bất biến', en: 'Immutable artifacts' },
      text: {
        vi: 'Build một lần, promote cùng digest, ký và xác minh.',
        en: 'Build once, promote one digest, sign and verify.'
      }
    },
    {
      tag: 'Declarative',
      title: { vi: 'Khai báo, không ra lệnh', en: 'Declare, don’t command' },
      text: {
        vi: 'Desired state trong Git; controller tự điều hoà.',
        en: 'Desired state in Git; controllers reconcile.'
      }
    },
    {
      tag: 'Progressive',
      title: { vi: 'Từng bước nhỏ', en: 'Small steps' },
      text: {
        vi: 'Rolling, canary, analysis — giới hạn blast radius.',
        en: 'Rolling, canary, analysis — bounded blast radius.'
      }
    },
    {
      tag: 'SLO-driven',
      title: { vi: 'Đo bằng trải nghiệm user', en: 'Measured by users' },
      text: {
        vi: 'Error budget điều tiết tốc độ release và cảnh báo.',
        en: 'Error budgets govern release speed and paging.'
      }
    }
  ],
  categories: {
    'delivery-pipeline': {
      label: { vi: 'Delivery Pipeline', en: 'Delivery Pipeline' },
      chapter: 'Chương 01',
      description: {
        vi: 'CI/CD, artifact bất biến, SBOM, ký image và DORA metrics.',
        en: 'CI/CD, immutable artifacts, SBOMs, image signing and DORA metrics.'
      }
    },
    'kubernetes-core': {
      label: { vi: 'Kubernetes Core', en: 'Kubernetes Core' },
      chapter: 'Chương 02',
      description: {
        vi: 'Control plane, scheduler, controller, rolling update, probe, Service và Gateway API.',
        en: 'Control plane, scheduler, controllers, rolling updates, probes, Services and Gateway API.'
      }
    },
    'release-reliability': {
      label: { vi: 'Release & Reliability', en: 'Release & Reliability' },
      chapter: 'Chương 03',
      description: {
        vi: 'GitOps, canary/blue-green, autoscaling, observability và SLO.',
        en: 'GitOps, canary/blue-green, autoscaling, observability and SLOs.'
      }
    }
  },
  labels: {
    systemBehavior: { vi: 'Hành vi control plane', en: 'Control-plane behaviour' },
    architecture: { vi: 'Kiến trúc & Luồng điều khiển', en: 'Architecture & Control Flow' },
    code: { vi: 'Manifest & Pipeline', en: 'Manifests & Pipelines' },
    codeSubtitle: {
      vi: 'YAML Kubernetes, GitHub Actions, Argo CD/Rollouts và PrometheusRule chuẩn production',
      en: 'Production-grade Kubernetes YAML, GitHub Actions, Argo CD/Rollouts and PrometheusRules'
    },
    balance: { vi: 'Tốc độ vs Độ ổn định', en: 'Velocity vs Stability' },
    invariant: { vi: 'Bất biến vận hành', en: 'Operational invariant' }
  },
  topics: ALL_DEVOPS_TOPICS
};

export function getDevopsTopicById(id: string): DevopsTopic | undefined {
  return getCourseTopic(DEVOPS_COURSE, id);
}
