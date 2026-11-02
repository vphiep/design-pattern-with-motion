'use client';

import type { BespokeScene } from '@/components/courses/scene-kit';
import { K8sSchedulerScene } from './K8sSchedulerScene';
import { RollingUpdateScene } from './RollingUpdateScene';
import { CanaryGitOpsScene } from './CanaryGitOpsScene';

/** Topics not listed here fall back to the data-driven StepFlowScene. */
export const DEVOPS_SCENES: Record<string, BespokeScene> = {
  'kubernetes-control-plane-scheduler': { component: K8sSchedulerScene, steps: 4 },
  'controllers-rolling-update-probes': { component: RollingUpdateScene, steps: 4 },
  'gitops-progressive-delivery': { component: CanaryGitOpsScene, steps: 4 }
};
