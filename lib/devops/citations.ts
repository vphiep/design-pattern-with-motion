import type { CourseCitation } from '../courses/types';

export const DEVOPS_CITATIONS = {
  dora: {
    source: 'DORA (Google Cloud)',
    title: 'DORA metrics: the four keys of software delivery performance',
    url: 'https://dora.dev/guides/dora-metrics-four-keys/',
    keyTakeaway: {
      vi: 'Tần suất deploy, lead time, tỉ lệ thay đổi lỗi và thời gian khôi phục đo cả tốc độ lẫn độ ổn định — chúng không mâu thuẫn nhau.',
      en: 'Deployment frequency, lead time, change failure rate and recovery time measure both speed and stability — they are not at odds.'
    }
  },
  slsa: {
    source: 'OpenSSF SLSA',
    title: 'Supply-chain Levels for Software Artifacts',
    url: 'https://slsa.dev/spec/v1.0/',
    keyTakeaway: {
      vi: 'Provenance ký số chứng minh artifact được build từ commit nào, bằng builder nào — nền tảng để admission chặn image lạ.',
      en: 'Signed provenance proves which commit and builder produced an artifact — the basis for admission control rejecting unknown images.'
    }
  },
  k8sScheduler: {
    source: 'Kubernetes Documentation',
    title: 'Kubernetes Scheduler & Scheduling Framework',
    url: 'https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/',
    keyTakeaway: {
      vi: 'Scheduler chọn node qua hai pha: filtering loại node không đủ điều kiện, scoring xếp hạng node còn lại, rồi bind.',
      en: 'The scheduler picks a node in two phases: filtering removes infeasible nodes, scoring ranks the rest, then it binds.'
    }
  },
  k8sControllers: {
    source: 'Kubernetes Documentation',
    title: 'Controllers & Deployments',
    url: 'https://kubernetes.io/docs/concepts/architecture/controller/',
    keyTakeaway: {
      vi: 'Controller là vòng lặp điều hoà: quan sát trạng thái thực, so với trạng thái mong muốn, hành động để thu hẹp khác biệt.',
      en: 'A controller is a reconciliation loop: observe actual state, compare with desired state, act to close the gap.'
    }
  },
  k8sServices: {
    source: 'Kubernetes Documentation',
    title: 'Service, EndpointSlices & Virtual IPs',
    url: 'https://kubernetes.io/docs/reference/networking/virtual-ips/',
    keyTakeaway: {
      vi: 'ClusterIP là IP ảo không gắn vào interface nào; kube-proxy lập trình iptables/IPVS/nftables để DNAT tới endpoint sẵn sàng.',
      en: 'A ClusterIP is a virtual IP bound to no interface; kube-proxy programs iptables/IPVS/nftables to DNAT to ready endpoints.'
    }
  },
  gatewayApi: {
    source: 'Kubernetes SIG Network',
    title: 'Gateway API',
    url: 'https://gateway-api.sigs.k8s.io/',
    keyTakeaway: {
      vi: 'Tách vai trò: hạ tầng sở hữu Gateway, team ứng dụng sở hữu HTTPRoute; hỗ trợ chia traffic theo trọng số chuẩn hoá.',
      en: 'Role separation: infrastructure owns the Gateway, app teams own HTTPRoutes; standardised weighted traffic splitting.'
    }
  },
  openGitops: {
    source: 'OpenGitOps (CNCF)',
    title: 'GitOps Principles v1.0',
    url: 'https://opengitops.dev/',
    keyTakeaway: {
      vi: 'Khai báo, có phiên bản & bất biến, được kéo tự động, liên tục điều hoà.',
      en: 'Declarative, versioned & immutable, pulled automatically, continuously reconciled.'
    }
  },
  argoRollouts: {
    source: 'Argo Project',
    title: 'Argo Rollouts — Canary & Analysis',
    url: 'https://argo-rollouts.readthedocs.io/en/stable/features/canary/',
    keyTakeaway: {
      vi: 'Canary tăng trọng số theo bước, chạy AnalysisRun trên metric thật và tự động abort/rollback khi vượt ngưỡng.',
      en: 'Canaries step up weights, run AnalysisRuns on real metrics and automatically abort/roll back past thresholds.'
    }
  },
  hpa: {
    source: 'Kubernetes Documentation',
    title: 'Horizontal Pod Autoscaling',
    url: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
    keyTakeaway: {
      vi: 'desiredReplicas = ceil(currentReplicas × currentMetric / desiredMetric), có tolerance 10% và cửa sổ ổn định khi scale down.',
      en: 'desiredReplicas = ceil(currentReplicas × currentMetric / desiredMetric), with a 10% tolerance and a scale-down stabilisation window.'
    }
  },
  sreWorkbook: {
    source: 'Google SRE Workbook',
    title: 'Alerting on SLOs (multiwindow, multi-burn-rate)',
    url: 'https://sre.google/workbook/alerting-on-slos/',
    keyTakeaway: {
      vi: 'Cảnh báo theo burn rate của error budget trên hai cửa sổ (dài + ngắn) để vừa nhạy vừa ít báo động giả.',
      en: 'Alert on error-budget burn rate over two windows (long + short) for both sensitivity and low false-positive rates.'
    }
  }
} satisfies Record<string, CourseCitation>;
