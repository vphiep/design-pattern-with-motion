import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const vmVsContainersTopic: DockerTopic = {
  id: 'vm-vs-containers',
  roadmapId: 'DOCKER-01',
  category: 'docker-fundamentals',
  level: 'beginner',
  chapter: 'Cấp độ 1',
  name: 'Virtual Machines vs Containers',
  tagline: {
    vi: 'VM ảo hoá phần cứng và boot kernel riêng; container chỉ là process chạy trên kernel của host. Image vs container instance, và chuỗi CLI → REST API → dockerd → containerd → runc.',
    en: 'A VM virtualises hardware and boots its own kernel; a container is just a process on the host kernel. Image vs container instance, and the CLI → REST API → dockerd → containerd → runc chain.'
  },
  difficulty: 1,
  order: 1,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      vi: '"Chạy được trên máy tôi": dev dùng Java 21, server cài Java 17; hai service cần hai phiên bản OpenSSL khác nhau trên cùng máy. Giải pháp truyền thống là mỗi ứng dụng một VM — nhưng mỗi VM mang theo cả một hệ điều hành, tốn hàng trăm MB RAM và hàng chục giây để boot.',
      en: '"Works on my machine": dev runs Java 21, the server has Java 17; two services need different OpenSSL versions on one host. The classic fix is one VM per app — but every VM carries a whole operating system, hundreds of MB of RAM and tens of seconds to boot.'
    },
    hardwareConstraint: {
      vi: 'Một máy vật lý có một bộ CPU, RAM, NIC. Hypervisor phải chia phần cứng này bằng VT-x/AMD-V và EPT/NPT, và mỗi VM chạy một kernel khách riêng với page cache, scheduler, driver riêng — chi phí nhân lên theo số VM.',
      en: 'A physical host has one set of CPUs, RAM and NICs. A hypervisor splits that hardware with VT-x/AMD-V and EPT/NPT, and every VM runs its own guest kernel with its own page cache, scheduler and drivers — overhead that multiplies per VM.'
    },
    fundamentalSolution: {
      vi: 'Container đóng gói ứng dụng cùng toàn bộ dependency user-space vào một image bất biến, rồi chạy nó như một process bình thường trên kernel của host — được cách ly bằng namespaces và giới hạn bằng cgroups (bài DOCKER-02). Không có kernel khách, không boot: khởi động một container là fork + exec. Docker Engine gồm CLI gọi REST API của dockerd; dockerd giao cho containerd quản lý image và vòng đời, containerd dùng runc (OCI runtime) để thực sự tạo process.',
      en: 'A container packages the app with all its user-space dependencies into an immutable image, then runs it as an ordinary process on the host kernel — isolated with namespaces and capped with cgroups (lesson DOCKER-02). No guest kernel, no boot: starting a container is a fork + exec. Docker Engine is a CLI calling dockerd’s REST API; dockerd delegates image and lifecycle management to containerd, which uses runc (the OCI runtime) to actually create the process.'
    },
    math: {
      formula: String.raw`M_{\text{VM}}(N) = N\,\big(M_{\text{kernel}} + M_{\text{OS}} + M_{\text{app}}\big) \quad\text{vs}\quad M_{\text{ctr}}(N) = M_{\text{kernel}} + N\,M_{\text{app}}`,
      description: {
        vi: 'Với N ứng dụng, VM trả chi phí kernel + userland hệ điều hành N lần; container chỉ trả một lần kernel của host. Đổi lại, mọi container chia sẻ cùng một kernel — một lỗi kernel ảnh hưởng tất cả.',
        en: 'For N apps, VMs pay for a kernel + OS userland N times; containers pay for the host kernel once. The price: every container shares that one kernel — a kernel bug affects them all.'
      },
      timeComplexity: 'Start: VM = boot a kernel (seconds); container = fork+exec (ms)',
      spaceComplexity: 'O(N · app) for containers vs O(N · (kernel + OS + app)) for VMs'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Container không phải "VM nhẹ". VM cách ly bằng phần cứng ảo; container cách ly bằng cấu trúc dữ liệu của kernel. Hiểu khác biệt này quyết định cách bạn đóng gói, bảo mật và vận hành ứng dụng.',
      en: 'A container is not a "lightweight VM". A VM isolates with virtual hardware; a container isolates with kernel data structures. That difference drives how you package, secure and operate apps.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Image vs container: image là template chỉ đọc gồm các layer filesystem + config (Entrypoint, Env, User, ExposedPorts). Container là một instance đang chạy (hoặc đã dừng) của image, có writable layer riêng và trạng thái riêng (created, running, paused, exited). Một image có thể sinh ra hàng trăm container; xoá container không ảnh hưởng image.',
        en: 'Image vs container: an image is a read-only template of filesystem layers + config (Entrypoint, Env, User, ExposedPorts). A container is a running (or stopped) instance of an image with its own writable layer and state (created, running, paused, exited). One image can spawn hundreds of containers; removing a container leaves the image untouched.'
      },
      {
        vi: 'Kiến trúc Docker Engine: lệnh docker chỉ là client gửi request REST tới dockerd qua UNIX socket /var/run/docker.sock (hoặc TCP). dockerd xử lý build, network, volume rồi gọi containerd qua gRPC. containerd kéo image, chuẩn bị snapshot rootfs, sinh containerd-shim cho mỗi container; shim gọi runc tạo namespace/cgroup theo OCI bundle rồi runc thoát. Nhờ shim đứng giữa, có thể restart dockerd hoặc containerd mà container vẫn chạy (live-restore).',
        en: 'Docker Engine architecture: the docker command is only a client sending REST requests to dockerd over the UNIX socket /var/run/docker.sock (or TCP). dockerd handles builds, networks and volumes, then calls containerd over gRPC. containerd pulls images, prepares rootfs snapshots and spawns a containerd-shim per container; the shim calls runc to create namespaces/cgroups from an OCI bundle, then runc exits. Because the shim sits in between, dockerd or containerd can restart while containers keep running (live-restore).'
      },
      {
        vi: 'Portability có giới hạn: image chứa user-space, không chứa kernel. Image linux/amd64 không chạy trên kernel Windows, và cần build multi-platform để chạy trên arm64. Docker Desktop trên macOS/Windows thực chất chạy một VM Linux nhỏ để có kernel Linux cho container.',
        en: 'Portability has limits: an image carries user space, not a kernel. A linux/amd64 image does not run on a Windows kernel, and you need multi-platform builds for arm64. Docker Desktop on macOS/Windows actually runs a small Linux VM to provide the Linux kernel containers need.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Đối xử container như VM: cài sshd, cron, systemd và nhiều process vào một container, rồi SSH vào sửa tay — mất tính bất biến và không thể tái tạo.',
        en: 'Treating a container like a VM: installing sshd, cron, systemd and many processes in one container, then SSHing in to patch it by hand — immutability and reproducibility are gone.'
      },
      {
        vi: 'Mở /var/run/docker.sock cho container khác (CI agent, dashboard): ai điều khiển được socket này là điều khiển được dockerd, tức là có quyền root trên host.',
        en: 'Mounting /var/run/docker.sock into another container (CI agent, dashboard): whoever controls that socket controls dockerd, i.e. has root on the host.'
      },
      {
        vi: 'Giả định container cách ly mạnh như VM khi chạy code không tin cậy của nhiều tenant — cần sandbox (gVisor) hoặc microVM (Kata, Firecracker).',
        en: 'Assuming VM-grade isolation when running untrusted multi-tenant code — that needs a sandbox (gVisor) or microVMs (Kata, Firecracker).'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Hai cách chia một máy', en: 'Two ways to split one host' },
    description: {
      vi: 'VM chồng kernel khách lên hypervisor; container dùng thẳng kernel của host. Bên phải là chuỗi thành phần của Docker Engine.',
      en: 'VMs stack guest kernels on a hypervisor; containers use the host kernel directly. On the right, the Docker Engine component chain.'
    },
    asciiDiagram: `
   VIRTUAL MACHINES                    CONTAINERS                 DOCKER ENGINE
 ┌──────┐ ┌──────┐ ┌──────┐     ┌──────┐ ┌──────┐ ┌──────┐     docker CLI
 │ app  │ │ app  │ │ app  │     │ app  │ │ app  │ │ app  │        │ REST over
 │ libs │ │ libs │ │ libs │     │ libs │ │ libs │ │ libs │        │ /var/run/docker.sock
 │guest │ │guest │ │guest │     └──┬───┘ └──┬───┘ └──┬───┘     dockerd
 │kernel│ │kernel│ │kernel│        └────────┼────────┘           │ gRPC
 └──┬───┘ └──┬───┘ └──┬───┘     namespaces + cgroups          containerd
 ┌──┴────────┴────────┴───┐     ┌───────────────────────┐        │ one per container
 │  hypervisor (KVM/ESXi) │     │      HOST KERNEL      │     containerd-shim
 ├────────────────────────┤     ├───────────────────────┤        │ exec, then exits
 │        hardware        │     │       hardware        │     runc ──► app process
 └────────────────────────┘     └───────────────────────┘
`,
    components: [
      {
        name: 'docker CLI',
        role: 'Client',
        description: {
          vi: 'Dịch lệnh thành request REST tới Docker API.',
          en: 'Turns commands into REST requests to the Docker API.'
        }
      },
      {
        name: 'dockerd',
        role: 'Daemon',
        description: {
          vi: 'Quản lý image, container, network, volume; build bằng BuildKit.',
          en: 'Manages images, containers, networks and volumes; builds with BuildKit.'
        }
      },
      {
        name: 'containerd',
        role: 'Lifecycle',
        description: {
          vi: 'Pull image, snapshot rootfs, giám sát container qua shim.',
          en: 'Pulls images, snapshots rootfs, supervises containers via shims.'
        }
      },
      {
        name: 'runc',
        role: 'OCI runtime',
        description: {
          vi: 'Tạo namespace, cgroup, mount theo config.json rồi exec ứng dụng.',
          en: 'Creates namespaces, cgroups and mounts from config.json, then execs the app.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'vm-stack',
      title: { vi: 'VM: kernel khách trên hypervisor', en: 'VM: guest kernels on a hypervisor' },
      phase: 'Virtualise',
      description: {
        vi: 'Mỗi VM boot một kernel và hệ điều hành đầy đủ trên phần cứng ảo.',
        en: 'Each VM boots a full kernel and OS on virtual hardware.'
      },
      systemBehavior: {
        vi: 'Hypervisor dùng VT-x/EPT để bẫy lệnh đặc quyền và dịch địa chỉ bộ nhớ khách.',
        en: 'The hypervisor uses VT-x/EPT to trap privileged instructions and translate guest memory.'
      },
      codeLineMatch: 'qemu-system-x86_64'
    },
    {
      id: 'ctr-stack',
      title: {
        vi: 'Container: process trên kernel host',
        en: 'Container: a process on the host kernel'
      },
      phase: 'Share kernel',
      description: {
        vi: 'uname -r trong container trả về đúng kernel của host — không có kernel nào khác.',
        en: 'uname -r inside the container returns the host kernel — there is no other kernel.'
      },
      systemBehavior: {
        vi: 'Kernel chỉ thấy một process bình thường có namespace và cgroup riêng.',
        en: 'The kernel just sees an ordinary process with its own namespaces and cgroup.'
      },
      codeLineMatch: 'docker exec web uname -r'
    },
    {
      id: 'engine',
      title: {
        vi: 'CLI → REST API → dockerd → containerd → runc',
        en: 'CLI → REST API → dockerd → containerd → runc'
      },
      phase: 'Engine',
      description: {
        vi: 'docker run là một chuỗi request REST tới dockerd; containerd và runc làm phần tạo process.',
        en: 'docker run is a series of REST requests to dockerd; containerd and runc do the process creation.'
      },
      systemBehavior: {
        vi: 'runc thoát sau khi exec; containerd-shim ở lại làm parent của process container.',
        en: 'runc exits after the exec; containerd-shim stays as the container process’s parent.'
      },
      codeLineMatch: '--unix-socket /var/run/docker.sock'
    },
    {
      id: 'image-instance',
      title: { vi: 'Một image, nhiều container', en: 'One image, many containers' },
      phase: 'Instantiate',
      description: {
        vi: 'Hai container từ cùng image dùng chung layer chỉ đọc, mỗi container có writable layer và trạng thái riêng.',
        en: 'Two containers from one image share its read-only layers; each has its own writable layer and state.'
      },
      systemBehavior: {
        vi: 'Container kết thúc khi process chính (PID 1) kết thúc.',
        en: 'A container ends when its main process (PID 1) ends.'
      },
      codeLineMatch: 'docker run -d --name web2'
    }
  ],

  comparison: {
    title: { vi: 'VM, Container và MicroVM', en: 'VM, Container and MicroVM' },
    subtitle: {
      vi: 'Cách ly bằng hypervisor vs bằng kernel struct',
      en: 'Isolation by hypervisor vs by kernel structures'
    },
    options: [
      {
        name: 'Virtual Machine',
        tag: 'Hypervisor',
        role: { vi: 'Kernel khách trên phần cứng ảo', en: 'Guest kernel on virtual hardware' },
        keyMechanism: {
          vi: 'Cách ly mạnh, chạy được hệ điều hành khác (Windows trên Linux); boot hàng chục giây, overhead RAM lớn.',
          en: 'Strong isolation, can run a different OS (Windows on Linux); tens of seconds to boot, large RAM overhead.'
        },
        configExample: 'virt-install --memory 2048 --vcpus 2 --disk size=20 …',
        architectureNote: {
          vi: 'Hợp với workload cần kernel riêng hoặc ranh giới tenant cứng.',
          en: 'Fits workloads that need their own kernel or a hard tenant boundary.'
        }
      },
      {
        name: 'Container',
        tag: 'Shared kernel',
        role: { vi: 'Process + namespaces + cgroups', en: 'Process + namespaces + cgroups' },
        keyMechanism: {
          vi: 'Khởi động trong ms, mật độ cao, image nhỏ; ranh giới bảo mật là bề mặt syscall của kernel.',
          en: 'Starts in ms, high density, small images; the security boundary is the kernel syscall surface.'
        },
        configExample: 'docker run --rm -it alpine:3.20 sh',
        architectureNote: {
          vi: 'Mặc định cho microservice; tăng cứng bằng seccomp/capabilities/rootless (DOCKER-09).',
          en: 'The default for microservices; harden with seccomp/capabilities/rootless (DOCKER-09).'
        }
      },
      {
        name: 'MicroVM / Sandbox',
        tag: 'Kata · Firecracker · gVisor',
        role: { vi: 'API container, cách ly kiểu VM', en: 'Container API, VM-style isolation' },
        keyMechanism: {
          vi: 'Mỗi container (hoặc Pod) có kernel khách tối giản hoặc kernel user-space chặn syscall.',
          en: 'Each container (or Pod) gets a minimal guest kernel or a user-space kernel intercepting syscalls.'
        },
        configExample: 'runtimeClassName: kata   # Kubernetes Pod spec',
        architectureNote: {
          vi: 'Dùng cho code không tin cậy, multi-tenant (serverless).',
          en: 'For untrusted, multi-tenant code (serverless).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Khởi động nhanh và mật độ cao: không có kernel khách.',
        en: 'Fast start and high density: no guest kernel.'
      },
      {
        vi: 'Image bất biến chạy giống nhau từ laptop tới production.',
        en: 'An immutable image runs the same from laptop to production.'
      },
      {
        vi: 'Mỗi container một process chính → dễ giám sát, scale và thay thế.',
        en: 'One main process per container → easy to monitor, scale and replace.'
      }
    ],
    cons: [
      {
        vi: 'Mọi container chia sẻ một kernel: ranh giới bảo mật yếu hơn VM.',
        en: 'All containers share one kernel: a weaker security boundary than a VM.'
      },
      {
        vi: 'Không chạy được image cần kernel/OS khác (Windows image trên Linux host).',
        en: 'Cannot run images that need another kernel/OS (Windows images on a Linux host).'
      }
    ],
    balance: {
      vi: 'Chọn container cho mật độ và tốc độ; khi cần ranh giới cứng giữa các tenant, thêm lớp VM/microVM bên dưới thay vì bỏ container.',
      en: 'Choose containers for density and speed; when you need a hard boundary between tenants, add a VM/microVM layer underneath rather than abandoning containers.'
    },
    invariant: {
      vi: 'Image không chứa kernel; container luôn chạy trên kernel của host.',
      en: 'An image contains no kernel; a container always runs on the host’s kernel.'
    }
  },

  code: [
    {
      label: 'vm-vs-container.sh',
      filename: 'vm-vs-container.sh',
      language: 'bash',
      code: `# 1. A VM boots a whole guest kernel + OS on virtual hardware (seconds, ~GB RAM)
qemu-system-x86_64 -enable-kvm -m 2048 -hda ubuntu.qcow2

# 2. A container is just a process on the host kernel (milliseconds)
docker run -d --name web nginx:1.27
uname -r && docker exec web uname -r      # same kernel release twice
ps -ef | grep "nginx: master"             # visible on the host as a normal process

# 3. The CLI is only a REST client of dockerd
curl --unix-socket /var/run/docker.sock http://localhost/containers/json
pstree -s "$(docker inspect -f '{{.State.Pid}}' web)"
#   systemd───containerd-shim───nginx───nginx      (runc already exited)

# 4. One image, many containers, each with its own writable layer and state
docker run -d --name web2 nginx:1.27
docker ps --format '{{.Names}}  {{.Image}}  {{.Status}}'
docker image ls nginx                     # still a single image`
    },
    {
      label: 'docker info',
      filename: 'engine-info.sh',
      language: 'bash',
      code: `# Which runtime, storage and cgroup setup is this engine using?
docker version --format 'client {{.Client.Version}} · server {{.Server.Version}}'
docker info --format '{{.OSType}}/{{.Architecture}} · runtime={{.DefaultRuntime}} · cgroup v{{.CgroupVersion}}'
docker info --format '{{.Driver}}'        # overlay2, or the containerd snapshotter

# On macOS/Windows, Docker Desktop runs a Linux VM: the kernel is the VM's
docker run --rm alpine uname -a`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Khác biệt cốt lõi giữa VM và container là gì?',
        en: 'What is the core difference between a VM and a container?'
      },
      answer: {
        vi: 'VM ảo hoá phần cứng và chạy kernel khách riêng trên hypervisor. Container là process chạy trực tiếp trên kernel của host, được cách ly bằng namespaces và giới hạn bằng cgroups. Vì vậy container khởi động trong ms và nhẹ hơn nhiều, nhưng mọi container chia sẻ một kernel nên ranh giới cách ly yếu hơn VM.',
        en: 'A VM virtualises hardware and runs its own guest kernel on a hypervisor. A container is a process running directly on the host kernel, isolated with namespaces and capped with cgroups. So containers start in ms and are far lighter, but all of them share one kernel, making the isolation boundary weaker than a VM’s.'
      },
      trapWarning: {
        vi: 'Đừng nói "container là VM nhẹ" — người phỏng vấn sẽ hỏi tiếp kernel nằm ở đâu.',
        en: 'Do not say "a container is a lightweight VM" — the interviewer will ask where the kernel is.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Có thể restart dockerd mà không làm chết container đang chạy không? Vì sao?',
        en: 'Can you restart dockerd without killing running containers? Why?'
      },
      answer: {
        vi: 'Có, khi bật live-restore. Process container không phải con của dockerd mà là con của containerd-shim; runc đã thoát sau khi tạo container. dockerd và containerd chỉ quản lý qua API, nên có thể khởi động lại rồi kết nối lại với shim.',
        en: 'Yes, with live-restore enabled. Container processes are children of containerd-shim, not dockerd, and runc has already exited after creating them. dockerd and containerd only manage via APIs, so they can restart and reattach to the shims.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao mount /var/run/docker.sock vào container CI là rủi ro nghiêm trọng?',
        en: 'Why is mounting /var/run/docker.sock into a CI container a serious risk?'
      },
      answer: {
        vi: 'Socket này là Docker API đầy đủ. Ai gọi được nó có thể docker run --privileged -v /:/host và có root trên host. Thay thế: build không cần daemon (BuildKit rootless, kaniko), dùng docker-in-docker cô lập trong VM riêng, hoặc runner tạm thời.',
        en: 'The socket is the full Docker API. Anyone who can call it can docker run --privileged -v /:/host and gain root on the host. Alternatives: daemonless builds (rootless BuildKit, kaniko), docker-in-docker isolated in a dedicated VM, or ephemeral runners.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: '"Lift-and-shift" VM vào container: sshd, cron và PID 1',
      en: '"Lift-and-shift" a VM into a container: sshd, cron and PID 1'
    },
    businessContext: {
      vi: 'Một team chuyển ứng dụng Java từ VM sang Docker bằng cách đóng gói nguyên cấu hình VM: supervisord chạy JVM, sshd, cron xoay log.',
      en: 'A team moved a Java app from a VM to Docker by packaging the whole VM setup: supervisord running the JVM, sshd and a log-rotating cron.'
    },
    problemDescription: {
      vi: 'Container báo "Up" dù JVM đã chết (supervisord vẫn sống là PID 1); log ghi vào file trong container nên docker logs trống; mỗi lần vá, kỹ sư SSH vào sửa tay và thay đổi biến mất khi container được tạo lại.',
      en: 'The container showed "Up" while the JVM was dead (supervisord stayed alive as PID 1); logs went to files inside the container so docker logs was empty; patches were applied by SSHing in and vanished whenever the container was recreated.'
    },
    whyNaiveFails: {
      vi: 'Docker theo dõi đúng một process chính. Khi một container chứa cả một "máy", orchestrator không biết ứng dụng thật còn sống không, và tính bất biến của image bị phá.',
      en: 'Docker tracks exactly one main process. When one container holds a whole "machine", the orchestrator cannot tell whether the real app is alive, and image immutability is broken.'
    },
    coreSolution: {
      vi: 'Một process mỗi container: JVM là PID 1 (exec-form ENTRYPOINT), log ra stdout/stderr, cấu hình qua env/volume, vá bằng build image mới. Thêm HEALTHCHECK để trạng thái phản ánh ứng dụng.',
      en: 'One process per container: the JVM is PID 1 (exec-form ENTRYPOINT), logs go to stdout/stderr, config comes via env/volumes, patches ship as a new image build. Add a HEALTHCHECK so status reflects the app.'
    },
    productionCode: `FROM eclipse-temurin:21-jre
COPY app.jar /app/app.jar
HEALTHCHECK --interval=15s --timeout=3s \\
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]   # JVM = PID 1, logs to stdout`,
    productionLanguage: 'dockerfile',
    architectureImpact: {
      vi: 'Trạng thái container phản ánh đúng ứng dụng, docker logs có dữ liệu, và mọi thay đổi đi qua pipeline build.',
      en: 'Container status reflects the actual app, docker logs has data, and every change goes through the build pipeline.'
    }
  },

  researchCitations: [
    DOCKER_CITATIONS.engineOverview,
    DOCKER_CITATIONS.ociRuntime,
    DOCKER_CITATIONS.namespaces
  ]
};
