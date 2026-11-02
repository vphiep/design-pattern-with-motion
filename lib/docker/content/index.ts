import type { DockerTopic } from '../types';
import { vmVsContainersTopic } from './01-vm-vs-containers';
import { linuxNamespacesTopic } from './02-linux-namespaces-cgroups';
import { cliContainerLifecycleTopic } from './03-cli-container-lifecycle';
import { imagesLayersDockerfileTopic } from './04-images-layers-dockerfile';
import { dockerfileMultistageBuildkitTopic } from './05-production-ready-images';
import { containerNetworkingBridgeTopic } from './06-networking-service-discovery';
import { volumesBindMountsTopic } from './07-volumes-bind-mounts';
import { dockerComposeStacksTopic } from './08-docker-compose-stacks';
import { runtimeStackHardeningTopic } from './09-security-supply-chain';
import { cgroupsResourceLimitsTopic } from './10-resource-observability-troubleshooting';
import { productionWorkflowRegistryTopic } from './11-production-workflow-registry';

/** Order follows docs/roadmap-cdc-docker-security-devops.md (DOCKER-01 → DOCKER-11). */
export const ALL_DOCKER_TOPICS: DockerTopic[] = [
  // Cấp độ 1 — Fundamentals
  vmVsContainersTopic,
  linuxNamespacesTopic,
  cliContainerLifecycleTopic,
  imagesLayersDockerfileTopic,

  // Cấp độ 2 — Application & Multi-container
  dockerfileMultistageBuildkitTopic,
  containerNetworkingBridgeTopic,
  volumesBindMountsTopic,
  dockerComposeStacksTopic,

  // Cấp độ 3 — Advanced & Production
  runtimeStackHardeningTopic,
  cgroupsResourceLimitsTopic,
  productionWorkflowRegistryTopic
];
