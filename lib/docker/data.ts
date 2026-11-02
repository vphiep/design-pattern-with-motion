import type { CourseDefinition } from '../courses/types';
import { getCourseTopic } from '../courses/helpers';
import { ALL_DOCKER_TOPICS } from './content';
import type { DockerCategory, DockerTopic } from './types';

export const DOCKER_COURSE: CourseDefinition<DockerCategory> = {
  id: 'docker-containers',
  basePath: '/docker',
  name: 'Docker & Containerization',
  accent: 'cyan',
  shortLabel: { vi: 'DOCKER · TỔNG QUAN', en: 'DOCKER OVERVIEW' },
  hero: {
    eyebrow: {
      vi: 'DOCKER-01 → DOCKER-11 · TỪ LINUX PRIMITIVES ĐẾN PRODUCTION',
      en: 'DOCKER-01 → DOCKER-11 · FROM LINUX PRIMITIVES TO PRODUCTION'
    },
    title: {
      vi: 'Container Không Phải Hộp Đen: Chỉ Là Process + Kernel Primitives',
      en: 'Containers Are Not Black Boxes: Just Processes + Kernel Primitives'
    },
    subtitle: {
      vi: '11 bài theo 3 cấp độ: namespace và cgroup bên dưới container, vòng đời qua CLI, layer và cache của Dockerfile, image production-ready, mạng bridge/DNS, volume, Compose, bảo mật supply chain, troubleshooting tài nguyên và quy trình registry build-once-deploy-many.',
      en: '11 lessons across 3 levels: the namespaces and cgroups beneath a container, the CLI lifecycle, Dockerfile layers and caching, production-ready images, bridge/DNS networking, volumes, Compose, supply-chain security, resource troubleshooting and the build-once-deploy-many registry workflow.'
    }
  },
  pillarsHeading: { vi: '4 PRIMITIVE TẠO NÊN CONTAINER', en: '4 PRIMITIVES BEHIND A CONTAINER' },
  pillars: [
    {
      tag: 'Namespaces',
      title: { vi: 'Thấy gì', en: 'What it sees' },
      text: {
        vi: 'PID, mount, net, UTS, IPC, user, cgroup — mỗi process một lăng kính.',
        en: 'PID, mount, net, UTS, IPC, user, cgroup — a lens per process.'
      }
    },
    {
      tag: 'cgroups',
      title: { vi: 'Dùng bao nhiêu', en: 'How much it uses' },
      text: {
        vi: 'cpu.max, memory.max, pids.max — trần tài nguyên do kernel thực thi.',
        en: 'cpu.max, memory.max, pids.max — kernel-enforced ceilings.'
      }
    },
    {
      tag: 'Union FS',
      title: { vi: 'Đứng trên gì', en: 'What it stands on' },
      text: {
        vi: 'Layer bất biến theo digest + upperdir ghi được.',
        en: 'Immutable digest-addressed layers + a writable upperdir.'
      }
    },
    {
      tag: 'Least privilege',
      title: { vi: 'Được làm gì', en: 'What it may do' },
      text: {
        vi: 'Capabilities, seccomp, no-new-privileges, user namespace.',
        en: 'Capabilities, seccomp, no-new-privileges, user namespaces.'
      }
    }
  ],
  categories: {
    'docker-fundamentals': {
      label: { vi: 'Fundamentals', en: 'Fundamentals' },
      chapter: 'Cấp độ 1',
      description: {
        vi: 'VM vs container, namespaces & cgroups, vòng đời container qua CLI, image/layer và Dockerfile.',
        en: 'VMs vs containers, namespaces & cgroups, the container lifecycle via the CLI, images/layers and the Dockerfile.'
      }
    },
    'docker-multi-container': {
      label: { vi: 'Application & Multi-container', en: 'Application & Multi-container' },
      chapter: 'Cấp độ 2',
      description: {
        vi: 'Image production-ready, networking & service discovery, volumes và Docker Compose.',
        en: 'Production-ready images, networking & service discovery, volumes and Docker Compose.'
      }
    },
    'docker-production': {
      label: { vi: 'Advanced & Production', en: 'Advanced & Production' },
      chapter: 'Cấp độ 3',
      description: {
        vi: 'Bảo mật & supply chain, quản lý tài nguyên & troubleshooting, registry và quy trình build-once-deploy-many.',
        en: 'Security & supply chain, resource management & troubleshooting, registries and the build-once-deploy-many workflow.'
      }
    }
  },
  labels: {
    systemBehavior: { vi: 'Hành vi kernel / runtime', en: 'Kernel / runtime behaviour' },
    architecture: { vi: 'Kiến trúc & Cấu trúc kernel', en: 'Architecture & Kernel Structures' },
    code: { vi: 'Lệnh & Cấu hình thực hành', en: 'Hands-on Commands & Config' },
    codeSubtitle: {
      vi: 'Shell, Dockerfile và manifest có thể chạy thử trên máy Linux',
      en: 'Shell, Dockerfiles and manifests you can run on a Linux box'
    },
    balance: { vi: 'Cách ly vs Hiệu năng', en: 'Isolation vs Performance' },
    invariant: { vi: 'Bất biến kernel', en: 'Kernel invariant' }
  },
  topics: ALL_DOCKER_TOPICS
};

export function getDockerTopicById(id: string): DockerTopic | undefined {
  return getCourseTopic(DOCKER_COURSE, id);
}
