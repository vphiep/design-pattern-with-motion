import type { DockerTopic } from '../types';
import { DOCKER_CITATIONS } from '../citations';

export const cgroupsResourceLimitsTopic: DockerTopic = {
  id: 'cgroups-resource-limits',
  roadmapId: 'DOCKER-10',
  category: 'docker-production',
  level: 'advanced',
  chapter: 'Cấp độ 3',
  name: 'Resource Management, Observability & Troubleshooting',
  tagline: {
    vi: 'CPU throttling qua cpu.max làm tăng tail latency, memory.max kích hoạt OOMKilled (exit 137), healthcheck, log driver không xoay vòng làm đầy đĩa, docker stats/events/inspect và cách chẩn đoán restart loop.',
    en: 'CPU throttling via cpu.max inflating tail latency, memory.max triggering OOMKilled (exit 137), healthchecks, non-rotating log drivers filling disks, docker stats/events/inspect and diagnosing restart loops.'
  },
  difficulty: 3,
  order: 10,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Namespace chỉ giới hạn thứ process NHÌN THẤY, không giới hạn thứ nó DÙNG. Một container bị memory leak hoặc vòng lặp nóng có thể ăn hết RAM/CPU của node và làm chết mọi container hàng xóm (noisy neighbour).',
      en: 'Namespaces limit what a process can SEE, not what it can USE. One container with a memory leak or a hot loop can consume the node’s RAM/CPU and take down every neighbour (noisy neighbour).'
    },
    hardwareConstraint: {
      vi: 'CPU là thời gian, RAM là không gian: CPU có thể chia theo lát thời gian và "trả chậm" (throttle), còn RAM không thể nén — khi hết, kernel phải giết một process.',
      en: 'CPU is time, RAM is space: CPU can be sliced and deferred (throttled), RAM cannot be compressed — when it runs out, the kernel must kill a process.'
    },
    fundamentalSolution: {
      vi: 'cgroup v2 nhóm process vào một node trong cây /sys/fs/cgroup và gắn bộ điều khiển: cpu.max = "quota period" (CFS bandwidth control), cpu.weight cho chia tỉ lệ khi tranh chấp, memory.max (giới hạn cứng → OOM kill trong cgroup), memory.high (ngưỡng mềm → reclaim/throttle), pids.max. docker run --cpus=1.5 -m 512m chỉ là ghi giá trị vào các file này.',
      en: 'cgroup v2 places processes in a node of the /sys/fs/cgroup tree and attaches controllers: cpu.max = "quota period" (CFS bandwidth control), cpu.weight for proportional sharing under contention, memory.max (hard limit → OOM kill within the cgroup), memory.high (soft threshold → reclaim/throttle), pids.max. docker run --cpus=1.5 -m 512m just writes those files.'
    },
    math: {
      formula: String.raw`t_{\text{throttled}} = P - \frac{Q}{N} \quad \text{per period, when } N \cdot P > Q`,
      description: {
        vi: 'Q = quota, P = period (100 ms mặc định), N = số thread đang chạy song song. Container --cpus=1 (Q = 100 ms) với 8 thread bận đốt hết quota trong 12,5 ms thời gian thực rồi bị đóng băng 87,5 ms — request nào rơi vào khoảng đó có p99 tăng thêm ~87 ms dù CPU trung bình chỉ 100%.',
        en: 'Q = quota, P = period (100 ms default), N = threads running in parallel. A --cpus=1 container (Q = 100 ms) with 8 busy threads burns its quota in 12.5 ms of wall time, then freezes for 87.5 ms — any request in that gap gains ~87 ms of p99 latency even though average CPU is only 100%.'
      },
      timeComplexity: 'O(1) accounting per scheduler tick',
      spaceComplexity: 'O(cgroups) kernel counters'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'cgroup v2 (unified hierarchy) là mặc định trên các distro hiện đại và Kubernetes ≥ 1.25. Mọi số liệu đều đọc được từ file: cpu.stat, memory.current, memory.events.',
      en: 'cgroup v2 (unified hierarchy) is the default on modern distros and Kubernetes ≥ 1.25. Every metric is a readable file: cpu.stat, memory.current, memory.events.'
    },
    deepDiveParagraphs: [
      {
        vi: 'CPU throttling đo bằng cpu.stat: nr_periods, nr_throttled, throttled_usec. Tỉ lệ nr_throttled/nr_periods > 5–10% là dấu hiệu limit quá chặt cho ứng dụng đa luồng. Nhiều team bỏ CPU limit (chỉ giữ request → cpu.weight) để tránh throttling, chấp nhận rủi ro tranh chấp.',
        en: 'CPU throttling shows up in cpu.stat: nr_periods, nr_throttled, throttled_usec. nr_throttled/nr_periods above 5–10% signals a limit too tight for a multi-threaded app. Many teams drop CPU limits (keeping requests → cpu.weight) to avoid throttling, accepting contention risk.'
      },
      {
        vi: 'Memory: memory.current gồm cả page cache. Khi chạm memory.max, kernel thử reclaim cache trước; nếu không đủ, OOM killer chọn process trong cgroup (memory.events: oom_kill tăng). Container thoát với exit code 137 (128 + SIGKILL 9). JVM từ JDK 10 (và 8u191) đọc giới hạn cgroup: MaxRAMPercentage tính heap theo memory.max, ActiveProcessorCount theo cpu.max.',
        en: 'Memory: memory.current includes page cache. At memory.max the kernel first reclaims cache; if that is not enough the OOM killer picks a process in the cgroup (memory.events: oom_kill increments). The container exits with code 137 (128 + SIGKILL 9). Since JDK 10 (and 8u191) the JVM reads cgroup limits: MaxRAMPercentage sizes the heap from memory.max, ActiveProcessorCount from cpu.max.'
      },
      {
        vi: 'OOMKilled vs exit 137: vượt memory.max thì kernel OOM-kill process trong cgroup; Docker ghi State.OOMKilled=true, exit code 137 và phát sự kiện oom trong docker events. Nhưng 137 cũng xuất hiện khi docker kill hay docker stop hết grace period, nên luôn kiểm tra OOMKilled và memory.events (oom_kill) trước khi kết luận. --memory-swap bằng --memory nghĩa là không có swap; --oom-kill-disable chỉ nên dùng khi đã đặt --memory.',
        en: 'OOMKilled vs exit 137: exceeding memory.max makes the kernel OOM-kill a process in the cgroup; Docker records State.OOMKilled=true, exit code 137 and emits an oom event in docker events. But 137 also appears after docker kill or a docker stop timeout, so check OOMKilled and memory.events (oom_kill) before concluding. --memory-swap equal to --memory means no swap; --oom-kill-disable should only ever be used together with --memory.'
      },
      {
        vi: 'Healthcheck và restart loop: HEALTHCHECK (mặc định interval 30s, timeout 30s, retries 3) cho trạng thái healthy/unhealthy trong docker ps và sự kiện health_status. Docker không tự restart container chỉ vì unhealthy — đó là việc của orchestrator (Swarm, Kubernetes liveness probe). Restart loop do restart policy: container crash ngay khi start, daemon khởi động lại, lặp mãi; xem RestartCount trong inspect, sự kiện die/start trong events và log của lần chạy trước.',
        en: 'Healthchecks and restart loops: HEALTHCHECK (defaults: interval 30s, timeout 30s, retries 3) yields healthy/unhealthy in docker ps and health_status events. Docker does not restart a container merely because it is unhealthy — that is the orchestrator’s job (Swarm, Kubernetes liveness probes). Restart loops come from the restart policy: the container crashes on start, the daemon restarts it, forever; check RestartCount in inspect, die/start events and the previous run’s logs.'
      },
      {
        vi: 'Log và đĩa: driver mặc định json-file KHÔNG xoay vòng log, nên một service log nhiều có thể làm đầy /var/lib/docker. Driver local xoay vòng mặc định (20 MB × 5 file, có nén), hoặc đặt max-size/max-file cho json-file trong daemon.json. docker system df cho biết dung lượng của image, container, volume và build cache; docker system prune dọn phần không dùng.',
        en: 'Logs and disk: the default json-file driver does NOT rotate logs, so a chatty service can fill /var/lib/docker. The local driver rotates by default (20 MB × 5 files, compressed), or set max-size/max-file for json-file in daemon.json. docker system df shows space used by images, containers, volumes and build cache; docker system prune removes unused data.'
      },
      {
        vi: 'Bộ công cụ chẩn đoán: docker stats (CPU %, MEM USAGE / LIMIT, NET I/O, BLOCK I/O, PIDS) cho bức tranh trực tiếp; docker inspect cho cấu hình và State; docker events --filter container=api cho dòng thời gian die/oom/kill/restart/health_status (chỉ trả về 256 sự kiện gần nhất); cpu.stat và memory.events trong cgroup cho số liệu throttling và OOM chính xác.',
        en: 'The diagnostic toolkit: docker stats (CPU %, MEM USAGE / LIMIT, NET I/O, BLOCK I/O, PIDS) for the live picture; docker inspect for configuration and State; docker events --filter container=api for the die/oom/kill/restart/health_status timeline (only the last 256 events are returned); cpu.stat and memory.events in the cgroup for exact throttling and OOM counts.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: '-Xmx bằng đúng memory limit: metaspace, thread stack, direct buffer, code cache nằm ngoài heap → OOMKilled.',
        en: '-Xmx equal to the memory limit: metaspace, thread stacks, direct buffers and code cache live outside the heap → OOMKilled.'
      },
      {
        vi: 'Đặt --cpus=0.5 cho service Java: GC và JIT thread bị throttle, thời gian khởi động tăng gấp nhiều lần.',
        en: '--cpus=0.5 for a Java service: GC and JIT threads get throttled, startup time multiplies.'
      },
      {
        vi: 'Đọc /proc/meminfo trong container để tính RAM khả dụng — nó hiển thị RAM của host.',
        en: 'Reading /proc/meminfo in a container to size memory — it shows the host’s RAM.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Cây cgroup v2 của một container', en: 'The cgroup v2 tree of a container' },
    description: {
      vi: 'Docker/systemd tạo một node cho mỗi container; giới hạn là các file text.',
      en: 'Docker/systemd creates one node per container; limits are text files.'
    },
    asciiDiagram: `
 /sys/fs/cgroup/
 └─ system.slice/
    └─ docker-3f2a…scope/                 ← one container
       ├─ cgroup.procs        48213 48250
       ├─ cpu.max             150000 100000      (--cpus=1.5)
       ├─ cpu.weight          100
       ├─ cpu.stat            nr_periods 9120  nr_throttled 1311  throttled_usec 48211931
       ├─ memory.max          536870912          (-m 512m)
       ├─ memory.high         483183820
       ├─ memory.current      529170432
       ├─ memory.events       high 42  max 7  oom 1  oom_kill 1
       └─ pids.max            512

 CFS period 100ms:  |██████████░░░░░░░░░░░░░░░░░░░░░░| 8 threads burn 150ms quota in 18.75ms
                     run 18.75ms        throttled 81.25ms → next period
`,
    components: [
      {
        name: 'cpu.max',
        role: 'Hard CPU cap',
        description: {
          vi: 'quota µs mỗi period µs; "max" = không giới hạn.',
          en: 'quota µs per period µs; "max" = unlimited.'
        }
      },
      {
        name: 'cpu.weight',
        role: 'Relative share',
        description: {
          vi: 'Chia CPU theo tỉ lệ khi tranh chấp (từ requests của K8s).',
          en: 'Proportional share under contention (from K8s requests).'
        }
      },
      {
        name: 'memory.max',
        role: 'Hard RAM cap',
        description: {
          vi: 'Vượt → reclaim → OOM kill trong cgroup.',
          en: 'Exceeded → reclaim → OOM kill inside the cgroup.'
        }
      },
      {
        name: 'pids.max',
        role: 'Fork limit',
        description: {
          vi: 'Chặn fork bomb làm cạn PID của host.',
          en: 'Stops fork bombs exhausting host PIDs.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'set-limits',
      title: {
        vi: 'docker run ghi giới hạn vào cgroup',
        en: 'docker run writes limits into the cgroup'
      },
      phase: 'Configure',
      description: {
        vi: '--cpus=1 → cpu.max "100000 100000"; -m 512m → memory.max 536870912.',
        en: '--cpus=1 → cpu.max "100000 100000"; -m 512m → memory.max 536870912.'
      },
      systemBehavior: {
        vi: 'runc tạo node cgroup và đưa PID của container vào cgroup.procs.',
        en: 'runc creates the cgroup node and adds the container PID to cgroup.procs.'
      },
      codeLineMatch: 'docker run -d --name api --cpus=1'
    },
    {
      id: 'burn-quota',
      title: {
        vi: '8 thread đốt hết quota trong 12,5 ms',
        en: '8 threads burn the quota in 12.5 ms'
      },
      phase: 'Run',
      description: {
        vi: 'Trong mỗi period 100 ms, tổng thời gian CPU của mọi thread bị giới hạn 100 ms.',
        en: 'In each 100 ms period, all threads together may use at most 100 ms of CPU.'
      },
      systemBehavior: {
        vi: 'CFS trừ runtime của mọi thread vào quota chung.',
        en: 'CFS charges every thread’s runtime to the shared quota.'
      },
      codeLineMatch: 'cat /sys/fs/cgroup/cpu.max'
    },
    {
      id: 'throttle',
      title: { vi: 'Bị throttle tới hết period', en: 'Throttled until the period ends' },
      phase: 'Throttle',
      description: {
        vi: 'Toàn bộ cgroup bị đóng băng 87,5 ms; request đang xử lý chịu thêm độ trễ.',
        en: 'The whole cgroup is frozen for 87.5 ms; in-flight requests absorb the delay.'
      },
      systemBehavior: {
        vi: 'cpu.stat nr_throttled và throttled_usec tăng.',
        en: 'cpu.stat nr_throttled and throttled_usec increase.'
      },
      codeLineMatch: 'nr_throttled'
    },
    {
      id: 'oom',
      title: { vi: 'Vượt memory.max → OOM kill', en: 'memory.max exceeded → OOM kill' },
      phase: 'OOM',
      description: {
        vi: 'Heap + off-heap vượt 512 MiB, reclaim không đủ, kernel giết JVM.',
        en: 'Heap + off-heap exceed 512 MiB, reclaim is insufficient, the kernel kills the JVM.'
      },
      systemBehavior: {
        vi: 'memory.events oom_kill +1; container exit 137 (OOMKilled).',
        en: 'memory.events oom_kill +1; container exits 137 (OOMKilled).'
      },
      codeLineMatch: 'oom_kill'
    }
  ],

  comparison: {
    title: { vi: 'CPU limit vs CPU request (weight)', en: 'CPU limit vs CPU request (weight)' },
    subtitle: {
      vi: 'Hai cơ chế khác nhau của cùng controller cpu',
      en: 'Two different mechanisms of the same cpu controller'
    },
    options: [
      {
        name: 'Limit (cpu.max)',
        tag: 'Hard cap',
        role: { vi: 'Trần tuyệt đối mỗi period', en: 'Absolute ceiling per period' },
        keyMechanism: {
          vi: 'Bị throttle ngay cả khi node đang rảnh — dự đoán được chi phí nhưng hại tail latency.',
          en: 'Throttles even when the node is idle — predictable cost, harmful to tail latency.'
        },
        configExample: 'resources:\n  limits:\n    cpu: "1"',
        architectureNote: {
          vi: 'Hợp cho batch, multi-tenant cần công bằng tuyệt đối.',
          en: 'Suits batch and strict multi-tenant fairness.'
        }
      },
      {
        name: 'Request (cpu.weight)',
        tag: 'Proportional',
        role: { vi: 'Phần chia khi tranh chấp', en: 'Share under contention' },
        keyMechanism: {
          vi: 'Dùng CPU rảnh thoải mái; chỉ khi tranh chấp mới chia theo tỉ lệ request.',
          en: 'Uses idle CPU freely; only splits by request ratio under contention.'
        },
        configExample: 'resources:\n  requests:\n    cpu: "500m"',
        architectureNote: {
          vi: 'Phổ biến cho service latency-sensitive.',
          en: 'Common for latency-sensitive services.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Chặn noisy neighbour, bảo vệ node.',
        en: 'Stops noisy neighbours, protects the node.'
      },
      {
        vi: 'Số liệu chi tiết từ cpu.stat/memory.events để chẩn đoán.',
        en: 'Detailed diagnostics from cpu.stat/memory.events.'
      }
    ],
    cons: [
      {
        vi: 'CPU limit gây throttling âm thầm, khó thấy qua CPU% trung bình.',
        en: 'CPU limits cause silent throttling invisible in average CPU%.'
      },
      {
        vi: 'Memory limit sai = OOMKilled ngẫu nhiên, mất request đang xử lý.',
        en: 'Wrong memory limits = random OOMKills and lost in-flight requests.'
      }
    ],
    balance: {
      vi: 'Giới hạn chặt tăng mật độ và công bằng nhưng tăng tail latency (CPU) và rủi ro OOM (RAM).',
      en: 'Tight limits improve density and fairness but raise tail latency (CPU) and OOM risk (RAM).'
    },
    invariant: {
      vi: 'Tổng thời gian CPU của cgroup trong một period không vượt quota; memory.current không vượt memory.max.',
      en: 'A cgroup’s CPU time per period never exceeds its quota; memory.current never exceeds memory.max.'
    }
  },

  code: [
    {
      label: 'cgroups.sh',
      filename: 'cgroups.sh',
      language: 'bash',
      code: `docker run -d --name api --cpus=1 -m 512m --pids-limit=512 my/api:1.4.2
CG=/sys/fs/cgroup/system.slice/docker-$(docker inspect -f '{{.Id}}' api).scope

cat $CG/cpu.max                 # 100000 100000  -> 100ms quota / 100ms period
# (inside the container the same file is at: cat /sys/fs/cgroup/cpu.max)
cat $CG/memory.max              # 536870912
cat $CG/pids.max                # 512

# Is the service being throttled?
grep -E 'nr_periods|nr_throttled|throttled_usec' $CG/cpu.stat
#   nr_periods 9120
#   nr_throttled 1311           -> 14% of periods throttled: limit too tight

# Was it OOM-killed?
cat $CG/memory.events           # ... oom_kill 1
docker inspect -f '{{.State.OOMKilled}} {{.State.ExitCode}}' api   # true 137`
    },
    {
      label: 'troubleshoot.sh',
      filename: 'troubleshoot.sh',
      language: 'bash',
      code: `# Live usage vs limits
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.PIDs}}'

# Timeline of what happened to the container
docker events --since 30m --filter container=api \
  --filter event=die --filter event=oom --filter event=restart --filter event=health_status

# Restart loop? Count restarts and read the last health probes
docker inspect -f 'restarts={{.RestartCount}} status={{.State.Status}}' api
docker inspect -f '{{json .State.Health}}' api | jq '.Log[-3:]'
docker logs --tail 50 api                       # logs of the last run

# Disk pressure: logs, images, build cache
docker system df
du -sh /var/lib/docker/containers/*/*-json.log | sort -h | tail -3`
    },
    {
      label: 'daemon.json (logs)',
      filename: '/etc/docker/daemon.json',
      language: 'json',
      code: `{
  "log-driver": "local",
  "log-opts": { "max-size": "20m", "max-file": "5" },
  "live-restore": true
}`
    },
    {
      label: 'JVM flags',
      filename: 'Dockerfile',
      language: 'dockerfile',
      code: `FROM eclipse-temurin:21-jre
# Size the heap from the cgroup limit, leave ~25% for metaspace, threads, direct buffers
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
COPY app.jar /app/app.jar
ENTRYPOINT ["java", "-jar", "/app/app.jar"]`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Senior',
      question: {
        vi: 'CPU trung bình của pod chỉ 40% limit nhưng p99 latency cao bất thường. Bạn nghi gì?',
        en: 'A pod averages 40% of its CPU limit yet p99 latency is abnormally high. What do you suspect?'
      },
      answer: {
        vi: 'CFS throttling: trung bình theo phút che giấu các burst ngắn. Ứng dụng đa luồng đốt quota trong vài ms đầu period rồi bị đóng băng phần còn lại. Kiểm tra cpu.stat nr_throttled/nr_periods (hoặc metric container_cpu_cfs_throttled_periods_total). Giải pháp: tăng/bỏ CPU limit, giảm số thread, hoặc đặt ActiveProcessorCount phù hợp.',
        en: 'CFS throttling: per-minute averages hide short bursts. A multi-threaded app burns its quota in the first few ms of a period and freezes for the rest. Check cpu.stat nr_throttled/nr_periods (or container_cpu_cfs_throttled_periods_total). Fix: raise/remove the CPU limit, reduce thread count, or set ActiveProcessorCount appropriately.'
      },
      trapWarning: {
        vi: 'Đừng kết luận "CPU không phải vấn đề" chỉ vì đồ thị CPU% trung bình thấp.',
        en: 'Don’t conclude “CPU isn’t the problem” from a low average CPU% graph.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Container Java bị OOMKilled dù -Xmx nhỏ hơn memory limit. Tại sao?',
        en: 'A Java container is OOMKilled though -Xmx is below the memory limit. Why?'
      },
      answer: {
        vi: 'Memory của process = heap + metaspace + code cache + thread stacks (≈1MB × số thread) + direct/mapped buffers + native (glibc arenas). Kernel đếm tất cả. Dùng MaxRAMPercentage ~70–75% và Native Memory Tracking để đo phần ngoài heap.',
        en: 'Process memory = heap + metaspace + code cache + thread stacks (≈1MB × threads) + direct/mapped buffers + native (glibc arenas). The kernel counts all of it. Use MaxRAMPercentage ~70–75% and Native Memory Tracking to measure off-heap usage.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'p99 tăng 10 lần sau khi "tối ưu chi phí" CPU limit',
      en: 'p99 up 10× after a CPU-limit “cost optimisation”'
    },
    businessContext: {
      vi: 'API checkout Java 21, 64 thread pool, chạy trên K8s.',
      en: 'A Java 21 checkout API with a 64-thread pool on Kubernetes.'
    },
    problemDescription: {
      vi: 'FinOps hạ CPU limit từ 4 xuống 1 vì CPU trung bình chỉ 0,6 core. p99 nhảy từ 80 ms lên 900 ms.',
      en: 'FinOps cut the CPU limit from 4 to 1 because average CPU was 0.6 cores. p99 jumped from 80 ms to 900 ms.'
    },
    whyNaiveFails: {
      vi: 'Trung bình 0,6 core nhưng burst 6–8 core trong vài ms khi có traffic; limit 1 core biến mỗi burst thành ~90 ms throttling.',
      en: 'Average 0.6 cores but 6–8 core bursts lasting milliseconds; a 1-core limit turns every burst into ~90 ms of throttling.'
    },
    coreSolution: {
      vi: 'Giữ request 1 core (để scheduler đặt pod), bỏ CPU limit, giới hạn thread pool theo ActiveProcessorCount, và alert trên tỉ lệ throttled periods.',
      en: 'Keep a 1-core request (for scheduling), remove the CPU limit, bound thread pools by ActiveProcessorCount and alert on the throttled-period ratio.'
    },
    productionCode: `resources:
  requests: { cpu: "1", memory: "1Gi" }
  limits:   { memory: "1Gi" }          # no CPU limit: no CFS throttling
env:
  - name: JAVA_TOOL_OPTIONS
    value: "-XX:ActiveProcessorCount=2 -XX:MaxRAMPercentage=75"`,
    productionLanguage: 'yaml',
    architectureImpact: {
      vi: 'p99 về 85 ms, chi phí node không đổi vì request giữ nguyên.',
      en: 'p99 back to 85 ms, node cost unchanged since requests stayed the same.'
    }
  },

  researchCitations: [
    DOCKER_CITATIONS.cgroupV2,
    DOCKER_CITATIONS.resourceConstraints,
    DOCKER_CITATIONS.logging,
    DOCKER_CITATIONS.events
  ]
};
