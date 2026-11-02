'use client';

import type { BespokeScene } from '@/components/courses/scene-kit';
import { VmVsContainerScene } from './VmVsContainerScene';
import { NamespacesScene } from './NamespacesScene';
import { LayerCacheScene } from './LayerCacheScene';
import { BridgeDnsScene } from './BridgeDnsScene';
import { VolumeLifecycleScene } from './VolumeLifecycleScene';
import { CgroupThrottleScene } from './CgroupThrottleScene';

/** Topics not listed here fall back to the data-driven StepFlowScene. */
export const DOCKER_SCENES: Record<string, BespokeScene> = {
  'vm-vs-containers': { component: VmVsContainerScene, steps: 4 },
  'linux-namespaces': { component: NamespacesScene, steps: 4 },
  'images-layers-dockerfile': { component: LayerCacheScene, steps: 4 },
  'container-networking-bridge': { component: BridgeDnsScene, steps: 4 },
  'volumes-bind-mounts': { component: VolumeLifecycleScene, steps: 4 },
  'cgroups-resource-limits': { component: CgroupThrottleScene, steps: 4 }
};
