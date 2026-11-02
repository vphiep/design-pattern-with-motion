import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const linuxNamespacesTopic: DockerTopic = {
  id: 'linux-namespaces',
  roadmapId: 'DOCKER-02',
  category: 'docker-fundamentals',
  level: 'beginner',
  levelTo: 'intermediate',
  chapter: 'Cấp độ 1',
  name: 'Linux Container Internals: Namespaces & Cgroups',
  tagline: {
    vi: 'Không có "container" trong kernel — chỉ có process được đặt vào các namespace (PID, mount, network, UTS, IPC, user, cgroup) để giới hạn thứ nó THẤY, vào cgroup để giới hạn thứ nó DÙNG, rồi bị tước capabilities và lọc syscall bằng seccomp.',
    en: 'There is no “container” in the kernel — only a process placed into namespaces (PID, mount, network, UTS, IPC, user, cgroup) that limit what it SEES, a cgroup that limits what it USES, then stripped of capabilities and syscall-filtered by seccomp.'
  },
  difficulty: 1,
  order: 2,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Nhiều ứng dụng trên cùng máy cần thấy môi trường riêng: PID riêng, hostname riêng, card mạng và cổng 8080 riêng, cây thư mục riêng. VM giải quyết bằng cách ảo hoá cả phần cứng và chạy kernel riêng — tốn hàng trăm MB RAM và hàng chục giây khởi động.',
      en: 'Many apps on one host need private views: their own PIDs, hostname, network interfaces and port 8080, their own filesystem tree. VMs solve this by virtualising hardware and booting a separate kernel — hundreds of MB of RAM and tens of seconds to start.'
    },
    hardwareConstraint: {
      vi: 'Chỉ có một kernel và một bảng process, một network stack, một mount table toàn cục. Cách ly phải được thực hiện bằng cấu trúc dữ liệu của kernel, không phải bằng phần cứng.',
      en: 'There is one kernel with one process table, one network stack, one global mount table. Isolation must come from kernel data structures, not hardware.'
    },
    fundamentalSolution: {
      vi: 'Namespace là "lăng kính" của kernel: mỗi process trỏ tới một bộ namespace (task_struct→nsproxy). Tạo process con với các cờ CLONE_NEWPID | CLONE_NEWNS | CLONE_NEWNET | CLONE_NEWUTS | CLONE_NEWIPC | CLONE_NEWUSER | CLONE_NEWCGROUP khiến nó thấy PID 1 của riêng mình, mount table riêng, lo/eth0 riêng. Container runtime chỉ là chương trình gọi các syscall này rồi exec ứng dụng.',
      en: 'A namespace is a kernel “lens”: each process points to a set of namespaces (task_struct→nsproxy). Creating a child with CLONE_NEWPID | CLONE_NEWNS | CLONE_NEWNET | CLONE_NEWUTS | CLONE_NEWIPC | CLONE_NEWUSER | CLONE_NEWCGROUP makes it see its own PID 1, mount table and lo/eth0. A container runtime is just a program that makes these syscalls and then execs the app.'
    },
    math: {
      formula: String.raw`\text{view}(p) = \big(\,ns_{pid}(p),\ ns_{mnt}(p),\ ns_{net}(p),\ ns_{uts}(p),\ ns_{ipc}(p),\ ns_{user}(p),\ ns_{cgroup}(p)\,\big)`,
      description: {
        vi: 'Hai process "cùng container" khi và chỉ khi chúng chia sẻ cùng bộ namespace. docker exec chỉ là setns() vào bộ namespace của process đã có rồi exec shell; Kubernetes Pod là nhiều container chia sẻ net + ipc (và tuỳ chọn pid).',
        en: 'Two processes are “in the same container” iff they share the same namespace tuple. docker exec is just setns() into an existing process’s namespaces then exec a shell; a Kubernetes Pod is several containers sharing net + ipc (and optionally pid).'
      },
      timeComplexity: 'O(1) per clone(): no hardware emulation',
      spaceComplexity: 'O(1) kernel structs per namespace'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Có 8 loại namespace trên Linux hiện đại. Chúng độc lập — có thể tạo container chỉ tách network mà dùng chung PID với host.',
      en: 'Modern Linux has 8 namespace types. They are independent — you can isolate only the network while sharing PIDs with the host.'
    },
    deepDiveParagraphs: [
      {
        vi: 'PID namespace lồng nhau: process có PID 1 trong container nhưng PID 48213 trên host. PID 1 có ngữ nghĩa đặc biệt — kernel không gửi tín hiệu mặc định (SIGTERM bị bỏ qua nếu không có handler) và nó phải reap zombie. Vì vậy ứng dụng chạy trực tiếp làm PID 1 thường không tắt được gọn; dùng tini (docker run --init) hoặc exec-form ENTRYPOINT.',
        en: 'PID namespaces nest: a process is PID 1 in the container but PID 48213 on the host. PID 1 is special — the kernel does not apply default signal actions (SIGTERM is ignored without a handler) and it must reap zombies. Apps run directly as PID 1 therefore often fail to shut down cleanly; use tini (docker run --init) or an exec-form ENTRYPOINT.'
      },
      {
        vi: 'Mount namespace + pivot_root: runtime mount rootfs của image, chuyển nó thành / mới bằng pivot_root, rồi umount root cũ. Network namespace bắt đầu chỉ có lo; runtime/CNI tạo cặp veth và đẩy một đầu vào namespace (DOCKER-06). User namespace ánh xạ UID 0 trong container thành UID không đặc quyền trên host — nền tảng của rootless container.',
        en: 'Mount namespace + pivot_root: the runtime mounts the image rootfs, makes it the new / via pivot_root and unmounts the old root. A network namespace starts with only lo; the runtime/CNI creates a veth pair and moves one end inside (DOCKER-06). A user namespace maps UID 0 in the container to an unprivileged host UID — the basis of rootless containers.'
      },
      {
        vi: 'Namespace giới hạn thứ process THẤY, cgroup giới hạn thứ nó DÙNG. Runtime tạo một cgroup cho mỗi container (cgroup v2 với systemd driver: /sys/fs/cgroup/system.slice/docker-<id>.scope) và ghi giới hạn vào cpu.max, memory.max, pids.max. --cpus=0.5 trở thành "50000 100000" trong cpu.max: được dùng 50 ms CPU mỗi chu kỳ 100 ms. Vượt memory.max thì OOM killer của kernel giết process trong chính cgroup đó (vận hành chi tiết ở DOCKER-10).',
        en: 'Namespaces limit what a process SEES; cgroups limit what it USES. The runtime creates a cgroup per container (cgroup v2 with the systemd driver: /sys/fs/cgroup/system.slice/docker-<id>.scope) and writes limits to cpu.max, memory.max and pids.max. --cpus=0.5 becomes "50000 100000" in cpu.max: 50 ms of CPU per 100 ms period. Exceeding memory.max makes the kernel OOM killer kill a process inside that cgroup (operations in DOCKER-10).'
      },
      {
        vi: 'Root trong container không phải root đầy đủ. Kernel chia quyền root thành capabilities (CAP_NET_ADMIN, CAP_SYS_ADMIN…); Docker chỉ giữ một allowlist nhỏ và bỏ phần còn lại. Profile seccomp mặc định chặn khoảng 44 syscall (mount, kexec_load, bpf…), và AppArmor/SELinux áp chính sách truy cập file. Runtime ghi toàn bộ cấu hình này vào config.json của OCI bundle — vì vậy mọi runtime tuân thủ OCI (runc, crun, youki) đều chạy được cùng image.',
        en: 'Root inside a container is not full root. The kernel splits root into capabilities (CAP_NET_ADMIN, CAP_SYS_ADMIN…); Docker keeps a small allowlist and drops the rest. The default seccomp profile blocks around 44 syscalls (mount, kexec_load, bpf…), and AppArmor/SELinux enforce file-access policy. The runtime writes all of this into the OCI bundle config.json — which is why any OCI-compliant runtime (runc, crun, youki) can run the same image.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Shell-form ENTRYPOINT ("java -jar app.jar") làm /bin/sh thành PID 1, SIGTERM không tới JVM → bị SIGKILL sau grace period.',
        en: 'Shell-form ENTRYPOINT ("java -jar app.jar") makes /bin/sh PID 1; SIGTERM never reaches the JVM → SIGKILL after the grace period.'
      },
      {
        vi: 'Tưởng namespace là ranh giới bảo mật như VM: mọi container dùng chung kernel, một lỗ hổng kernel là thoát được.',
        en: 'Treating namespaces as a VM-grade security boundary: all containers share the kernel; one kernel bug is an escape.'
      },
      {
        vi: '--pid=host hoặc --net=host cho tiện debug rồi quên gỡ ở production.',
        en: 'Using --pid=host or --net=host for debugging and leaving it in production.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Một kernel, nhiều lăng kính', en: 'One kernel, many lenses' },
    description: {
      vi: 'Hai container là hai process trên host với bộ namespace khác nhau.',
      en: 'Two containers are two host processes with different namespace sets.'
    },
    asciiDiagram: `
 HOST KERNEL (one task list, one network stack, one mount table)
 ┌─────────────────────────────┐   ┌─────────────────────────────┐
 │ container "api"             │   │ container "db"              │
 │  pid ns:  PID 1  java       │   │  pid ns:  PID 1  postgres   │
 │  uts ns:  hostname=api-7f   │   │  uts ns:  hostname=db-0     │
 │  net ns:  lo, eth0 10.0.0.5 │   │  net ns:  lo, eth0 10.0.0.6 │
 │  mnt ns:  / = overlay(api)  │   │  mnt ns:  / = overlay(pg)   │
 │  user ns: uid 0 → host 100000│  │  user ns: uid 0 → host 200000│
 └──────────────┬──────────────┘   └──────────────┬──────────────┘
          host PID 48213                     host PID 48390
 $ ls -l /proc/48213/ns      net -> net:[4026532718]   pid -> pid:[4026532716]
`,
    components: [
      {
        name: 'clone(CLONE_NEW*)',
        role: 'Create',
        description: {
          vi: 'Tạo process con trong namespace mới.',
          en: 'Creates a child in new namespaces.'
        }
      },
      {
        name: 'unshare()',
        role: 'Detach',
        description: {
          vi: 'Đưa process hiện tại sang namespace mới.',
          en: 'Moves the calling process into new namespaces.'
        }
      },
      {
        name: 'setns()',
        role: 'Join',
        description: {
          vi: 'Gia nhập namespace có sẵn — cơ chế của docker exec.',
          en: 'Joins an existing namespace — how docker exec works.'
        }
      },
      {
        name: '/proc/<pid>/ns',
        role: 'Handles',
        description: {
          vi: 'Symlink inode định danh từng namespace.',
          en: 'Symlinks whose inode identifies each namespace.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'clone',
      title: { vi: 'clone() với các cờ CLONE_NEW*', en: 'clone() with CLONE_NEW* flags' },
      phase: 'Create',
      description: {
        vi: 'Runtime tạo process con trong namespace PID, mount, UTS, IPC, network mới.',
        en: 'The runtime creates a child in fresh PID, mount, UTS, IPC and network namespaces.'
      },
      systemBehavior: {
        vi: 'Kernel cấp nsproxy mới; process thấy mình là PID 1.',
        en: 'The kernel allocates a new nsproxy; the process sees itself as PID 1.'
      },
      codeLineMatch: 'unshare --pid --fork'
    },
    {
      id: 'uts-mnt',
      title: { vi: 'Hostname riêng & rootfs riêng', en: 'Own hostname & own rootfs' },
      phase: 'Isolate FS',
      description: {
        vi: 'sethostname trong UTS ns; mount rootfs image và pivot_root để / trỏ vào image.',
        en: 'sethostname inside the UTS ns; mount the image rootfs and pivot_root so / is the image.'
      },
      systemBehavior: {
        vi: 'Mount trong namespace không lan ra host (mount propagation private).',
        en: 'Mounts in the namespace do not propagate to the host (private propagation).'
      },
      codeLineMatch: 'hostname container-demo'
    },
    {
      id: 'netns',
      title: { vi: 'Network namespace chỉ có lo', en: 'A network namespace with only lo' },
      phase: 'Isolate net',
      description: {
        vi: 'ip netns tạo stack mạng trống; cần veth để nối ra ngoài.',
        en: 'ip netns creates an empty network stack; a veth is needed to reach the outside.'
      },
      systemBehavior: {
        vi: 'Bảng route, iptables, port là riêng — hai container cùng listen :8080 được.',
        en: 'Routes, iptables and ports are private — two containers can both listen on :8080.'
      },
      codeLineMatch: 'ip netns add'
    },
    {
      id: 'setns',
      title: { vi: 'docker exec = setns()', en: 'docker exec = setns()' },
      phase: 'Join',
      description: {
        vi: 'nsenter gia nhập namespace của PID trên host và chạy lệnh bên trong.',
        en: 'nsenter joins the namespaces of a host PID and runs a command inside.'
      },
      systemBehavior: {
        vi: 'Không có "container" để vào — chỉ là gia nhập cùng bộ namespace.',
        en: 'There is no “container” to enter — just joining the same namespace set.'
      },
      codeLineMatch: 'nsenter --target'
    }
  ],

  comparison: {
    title: {
      vi: 'Ba lớp primitive của một container',
      en: 'The three primitive layers of a container'
    },
    subtitle: {
      vi: 'Thấy gì · Dùng bao nhiêu · Được làm gì',
      en: 'What it sees · How much it uses · What it may do'
    },
    options: [
      {
        name: 'Namespaces',
        tag: 'Visibility',
        role: { vi: 'Cách ly tầm nhìn', en: 'Isolate the view' },
        keyMechanism: {
          vi: 'PID, mount, net, UTS, IPC, user, cgroup, time — mỗi loại bọc một tài nguyên toàn cục.',
          en: 'PID, mount, net, UTS, IPC, user, cgroup, time — each wraps one global resource.'
        },
        configExample: 'docker run --pid=host --network=none …   # opt out / in per type',
        architectureNote: {
          vi: 'Không giới hạn CPU/RAM: process vẫn có thể dùng hết tài nguyên của node.',
          en: 'Does not cap CPU/RAM: the process can still exhaust the node.'
        }
      },
      {
        name: 'cgroups v2',
        tag: 'Accounting',
        role: { vi: 'Giới hạn & đo tài nguyên', en: 'Limit & account resources' },
        keyMechanism: {
          vi: 'cpu.max (quota/period), memory.max (OOM), pids.max, io.max trong một cây thống nhất.',
          en: 'cpu.max (quota/period), memory.max (OOM), pids.max, io.max in one unified tree.'
        },
        configExample: 'docker run --cpus=0.5 --memory=256m --pids-limit=200 …',
        architectureNote: {
          vi: 'Mặc định Docker KHÔNG đặt giới hạn nào — phải khai báo.',
          en: 'By default Docker sets NO limits — you must declare them.'
        }
      },
      {
        name: 'Capabilities + seccomp + LSM',
        tag: 'Privilege',
        role: { vi: 'Thu hẹp quyền & syscall', en: 'Shrink privileges & syscalls' },
        keyMechanism: {
          vi: 'Allowlist capabilities, seccomp chặn ~44 syscall, AppArmor/SELinux kiểm soát file.',
          en: 'A capability allowlist, seccomp blocking ~44 syscalls, AppArmor/SELinux controlling files.'
        },
        configExample: 'docker run --cap-drop=ALL --security-opt no-new-privileges …',
        architectureNote: {
          vi: '--privileged tắt gần hết lớp này — tránh dùng ở production.',
          en: '--privileged turns most of this layer off — avoid it in production.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Khởi động nhanh, không tốn RAM cho kernel khách.',
        en: 'Fast start, no RAM for a guest kernel.'
      },
      {
        vi: 'Ghép namespace linh hoạt (Pod chia sẻ network).',
        en: 'Composable namespaces (Pods share network).'
      }
    ],
    cons: [
      { vi: 'Ranh giới bảo mật yếu hơn VM.', en: 'Weaker security boundary than a VM.' },
      {
        vi: 'Một số tài nguyên chưa được namespace hoá (đồng hồ hệ thống trước time ns, /proc/meminfo, kernel keyring).',
        en: 'Some resources are not namespaced (system clock before time ns, /proc/meminfo, the kernel keyring).'
      }
    ],
    balance: {
      vi: 'Đổi mức độ cách ly lấy mật độ và tốc độ; khi cần cách ly mạnh, thêm lớp sandbox (gVisor, Kata) thay vì bỏ container.',
      en: 'Trade isolation strength for density and speed; when strong isolation is needed, add a sandbox layer (gVisor, Kata) rather than abandoning containers.'
    },
    invariant: {
      vi: 'Mọi container trên host đều thực thi trên cùng một kernel.',
      en: 'Every container on a host executes on the same kernel.'
    }
  },

  code: [
    {
      label: 'namespaces.sh',
      filename: 'namespaces.sh',
      language: 'bash',
      code: `# A "container" from scratch with util-linux tools (run as root)
sudo unshare --pid --fork --mount-proc --uts --ipc --mount --net /bin/bash

# --- inside the new namespaces ---
hostname container-demo        # UTS ns: host keeps its own name
ps -ef                         # PID ns: bash is PID 1, host processes invisible
mount -t tmpfs none /mnt       # mount ns: not visible on the host
ip link                        # net ns: only "lo", and it is DOWN

# --- on the host, a named network namespace + veth (see DOCKER-06) ---
sudo ip netns add demo
sudo ip link add veth-host type veth peer name veth-demo
sudo ip link set veth-demo netns demo

# --- docker exec is just setns(): join an existing container's namespaces ---
PID=$(docker inspect -f '{{.State.Pid}}' api)
ls -l /proc/$PID/ns
sudo nsenter --target "$PID" --mount --uts --ipc --net --pid -- sh

# --- cgroups: what the container may USE (cgroup v2, systemd driver) ---
docker run -d --name capped --cpus=0.5 --memory=256m --pids-limit=200 nginx:1.27
CG=/sys/fs/cgroup/system.slice/docker-$(docker inspect -f '{{.Id}}' capped).scope
cat $CG/cpu.max $CG/memory.max $CG/pids.max   # 50000 100000 / 268435456 / 200

# --- capabilities: root in a container is not full root ---
docker run --rm alpine grep CapEff /proc/1/status
docker run --rm --cap-drop=ALL alpine grep CapEff /proc/1/status   # 0000000000000000`
    },
    {
      label: 'Dockerfile (PID 1)',
      filename: 'Dockerfile',
      language: 'dockerfile',
      code: `FROM eclipse-temurin:21-jre
COPY app.jar /app/app.jar
# exec form: the JVM is PID 1 and receives SIGTERM directly
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
# or run with: docker run --init ...  (tini reaps zombies, forwards signals)`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Container Spring Boot không shutdown gọn, luôn bị kill sau 10 giây. Vì sao?',
        en: 'A Spring Boot container never shuts down gracefully and is always killed after 10 seconds. Why?'
      },
      answer: {
        vi: 'Nhiều khả năng ENTRYPOINT dạng shell nên /bin/sh là PID 1 và không chuyển tiếp SIGTERM cho JVM; hoặc JVM là PID 1 nhưng không có handler. Docker gửi SIGTERM, chờ hết timeout rồi SIGKILL. Sửa: exec-form ENTRYPOINT, hoặc --init (tini), và bật server.shutdown=graceful.',
        en: 'Most likely a shell-form ENTRYPOINT, so /bin/sh is PID 1 and does not forward SIGTERM to the JVM. Docker sends SIGTERM, waits for the timeout, then SIGKILLs. Fix: exec-form ENTRYPOINT or --init (tini), plus server.shutdown=graceful.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Pod Kubernetes chia sẻ những namespace nào giữa các container?',
        en: 'Which namespaces do containers in a Kubernetes Pod share?'
      },
      answer: {
        vi: 'Network và IPC luôn được chia sẻ (qua pause container giữ namespace), nên các container gọi nhau qua localhost. UTS chia sẻ hostname của Pod. PID chỉ chia sẻ khi shareProcessNamespace: true. Mount namespace luôn riêng, chia sẻ dữ liệu qua volume.',
        en: 'Network and IPC are always shared (held by the pause container), so containers talk over localhost. UTS shares the Pod hostname. PID is shared only with shareProcessNamespace: true. Mount namespaces are always separate; data is shared via volumes.'
      },
      proTip: {
        vi: 'Nhắc tới pause container — nó tồn tại để giữ namespace khi container ứng dụng restart.',
        en: 'Mention the pause container — it exists to hold namespaces while app containers restart.'
      }
    }
  ],

  researchCitations: [
    DOCKER_CITATIONS.namespaces,
    DOCKER_CITATIONS.cgroupV2,
    DOCKER_CITATIONS.seccomp,
    DOCKER_CITATIONS.ociRuntime
  ]
};
