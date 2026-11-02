import type { SceneMeta } from '@/lib/patterns/scene';
import { buildSceneMeta } from '../courses/helpers';
import { DOCKER_COURSE } from './data';

/** Step metadata derives from each topic's `steps`; only captions are authored here. */
export const DOCKER_SCENE_META: Record<string, SceneMeta> = buildSceneMeta(DOCKER_COURSE, {
  'vm-vs-containers': {
    vi: 'VM boot kernel khách trên hypervisor; container là process trên kernel host; docker run đi qua dockerd → containerd → runc.',
    en: 'VMs boot guest kernels on a hypervisor; a container is a process on the host kernel; docker run flows through dockerd → containerd → runc.'
  },
  'linux-namespaces': {
    vi: 'clone(CLONE_NEW*) → hostname & rootfs riêng → network ns chỉ có lo → docker exec = setns().',
    en: 'clone(CLONE_NEW*) → own hostname & rootfs → a net ns with only lo → docker exec = setns().'
  },
  'cli-container-lifecycle': {
    vi: 'run → logs/exec → stop (SIGTERM, chờ, SIGKILL) → đọc exit code → restart policy.',
    en: 'run → logs/exec → stop (SIGTERM, wait, SIGKILL) → read the exit code → restart policy.'
  },
  'images-layers-dockerfile': {
    vi: 'Mỗi lệnh một layer; sửa src/ làm miss COPY src và mọi bước sau, dependency vẫn cached.',
    en: 'One layer per instruction; editing src/ misses COPY src and every later step while dependencies stay cached.'
  },
  'dockerfile-multistage-buildkit': {
    vi: 'Stage build có JDK + Maven, cache mount cho ~/.m2, stage runtime distroless non-root chỉ chứa jar.',
    en: 'A build stage with JDK + Maven, a cache mount for ~/.m2, a distroless non-root runtime stage holding only the jar.'
  },
  'container-networking-bridge': {
    vi: 'veth + bridge → DNS 127.0.0.11 theo tên → DNAT cho -p → MASQUERADE ra Internet.',
    en: 'veth + bridge → name-based DNS at 127.0.0.11 → DNAT for -p → MASQUERADE to the Internet.'
  },
  'volumes-bind-mounts': {
    vi: 'Không volume: dữ liệu ở writable layer và mất khi rm; named volume đi vòng qua OverlayFS và sống sót.',
    en: 'No volume: data sits in the writable layer and dies on rm; a named volume bypasses OverlayFS and survives.'
  },
  'docker-compose-stacks': {
    vi: 'Network shop_default + DNS theo tên service → healthcheck → depends_on healthy → secret → profile debug.',
    en: 'shop_default network + service-name DNS → healthchecks → depends_on healthy → secrets → the debug profile.'
  },
  'runtime-stack-hardening': {
    vi: 'SBOM + provenance → quét CVE có gate → ký theo digest → chạy non-root, cap-drop, seccomp mặc định.',
    en: 'SBOM + provenance → gated CVE scan → sign by digest → run non-root, cap-drop, default seccomp.'
  },
  'cgroups-resource-limits': {
    vi: 'cpu.max quota/period: 8 thread đốt quota trong 12,5 ms rồi bị throttle; vượt memory.max → OOMKilled, exit 137.',
    en: 'cpu.max quota/period: 8 threads burn the quota in 12.5 ms then get throttled; exceeding memory.max → OOMKilled, exit 137.'
  },
  'production-workflow-registry': {
    vi: 'Build một lần → cache trên registry → tag release cùng digest → promote → deploy & rollback theo digest.',
    en: 'Build once → registry cache → release tag on the same digest → promote → deploy & roll back by digest.'
  }
});
