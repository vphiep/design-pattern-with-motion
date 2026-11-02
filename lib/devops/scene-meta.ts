import type { SceneMeta } from '@/lib/patterns/scene';
import { buildSceneMeta } from '../courses/helpers';
import { DEVOPS_COURSE } from './data';

/** Step metadata derives from each topic's `steps`; only captions are authored here. */
export const DEVOPS_SCENE_META: Record<string, SceneMeta> = buildSceneMeta(DEVOPS_COURSE, {
  'cicd-pipeline-supply-chain': {
    vi: 'Kiểm tra nhanh → build một lần theo digest → SBOM + ký → promote cùng digest qua admission.',
    en: 'Fast checks → build once by digest → SBOM + sign → promote the same digest through admission.'
  },
  'kubernetes-control-plane-scheduler': {
    vi: 'API server lưu Pod → scheduler filter → score & bind → kubelet chạy qua CRI/CNI.',
    en: 'API server stores the Pod → scheduler filters → scores & binds → kubelet runs it via CRI/CNI.'
  },
  'controllers-rolling-update-probes': {
    vi: 'ReplicaSet mới → surge một Pod → Ready vào endpoints → rút Pod cũ êm ái, lặp lại.',
    en: 'New ReplicaSet → surge one Pod → Ready joins endpoints → drain an old Pod gracefully, repeat.'
  },
  'services-kube-proxy-gateway': {
    vi: 'DNS → ClusterIP → EndpointSlice Ready → DNAT 1/n → Gateway API cho traffic ngoài.',
    en: 'DNS → ClusterIP → Ready EndpointSlice → 1/n DNAT → Gateway API for external traffic.'
  },
  'gitops-progressive-delivery': {
    vi: 'Commit Git → Argo CD sync → canary 10% + analysis → promote hoặc tự rollback.',
    en: 'Git commit → Argo CD sync → 10% canary + analysis → promote or auto-rollback.'
  },
  'autoscaling-observability-slo': {
    vi: 'Đo RED → HPA tính replicas → thêm node cho Pod Pending → cảnh báo burn rate SLO.',
    en: 'Measure RED → HPA computes replicas → add nodes for Pending Pods → SLO burn-rate alert.'
  }
});
