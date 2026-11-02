import type { DevopsTopic } from '../types';
import { cicdPipelineSupplyChainTopic } from './01-cicd-pipeline-supply-chain';
import { kubernetesControlPlaneSchedulerTopic } from './02-kubernetes-control-plane-scheduler';
import { controllersRollingUpdateProbesTopic } from './03-controllers-rolling-update-probes';
import { servicesKubeProxyGatewayTopic } from './04-services-kube-proxy-gateway';
import { gitopsProgressiveDeliveryTopic } from './05-gitops-progressive-delivery';
import { autoscalingObservabilitySloTopic } from './06-autoscaling-observability-slo';

export const ALL_DEVOPS_TOPICS: DevopsTopic[] = [
  // Chương 01 — Delivery pipeline
  cicdPipelineSupplyChainTopic,

  // Chương 02 — Kubernetes core
  kubernetesControlPlaneSchedulerTopic,
  controllersRollingUpdateProbesTopic,
  servicesKubeProxyGatewayTopic,

  // Chương 03 — Release & reliability
  gitopsProgressiveDeliveryTopic,
  autoscalingObservabilitySloTopic
];
