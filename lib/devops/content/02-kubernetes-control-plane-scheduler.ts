import type { DevopsTopic } from '../types';
import { DEVOPS_CITATIONS } from '../citations';

export const kubernetesControlPlaneSchedulerTopic: DevopsTopic = {
  id: 'kubernetes-control-plane-scheduler',
  category: 'kubernetes-core',
  level: 'intermediate',
  chapter: 'Chương 02',
  name: 'Kubernetes Control Plane & the Scheduler',
  tagline: {
    vi: 'Đường đi của một Pod: kubectl → API server (authn, authz, admission) → etcd → scheduler (filter → score → bind) → kubelet → CRI/CNI; requests vs limits và QoS class.',
    en: 'A Pod’s journey: kubectl → API server (authn, authz, admission) → etcd → scheduler (filter → score → bind) → kubelet → CRI/CNI; requests vs limits and QoS classes.'
  },
  difficulty: 2,
  order: 2,
  estimatedMinutes: 26,

  coreTheory: {
    problemStatement: {
      vi: 'Có 200 node với CPU/RAM, zone, GPU, taint khác nhau và 5.000 Pod với yêu cầu khác nhau. Đặt Pod thủ công không thể; đặt ngẫu nhiên gây quá tải node, dồn mọi replica vào một zone, hoặc Pod Pending vĩnh viễn.',
      en: 'There are 200 nodes with different CPU/RAM, zones, GPUs and taints, and 5,000 Pods with different needs. Manual placement is impossible; random placement overloads nodes, packs every replica into one zone, or leaves Pods Pending forever.'
    },
    hardwareConstraint: {
      vi: 'Tài nguyên node hữu hạn và không chia nhỏ tuỳ ý; quyết định phải nhanh (ms/Pod) dù cluster lớn. Mọi thành phần phải chịu lỗi: node, scheduler, thậm chí API server có thể restart.',
      en: 'Node resources are finite and not arbitrarily divisible; decisions must be fast (ms per Pod) even in large clusters. Every component must tolerate failure: nodes, the scheduler, even the API server can restart.'
    },
    fundamentalSolution: {
      vi: 'Mọi trạng thái nằm trong etcd, chỉ truy cập qua API server; các thành phần khác là controller độc lập watch API. Scheduler watch Pod có spec.nodeName rỗng, chạy filter plugins (NodeResourcesFit theo requests, NodeAffinity, TaintToleration, PodTopologySpread…) để loại node không đạt, score plugins để xếp hạng, rồi ghi Binding. Kubelet trên node đó thấy Pod, gọi CRI (containerd) tạo sandbox + container, CNI cấp IP, và áp cgroup từ limits.',
      en: 'All state lives in etcd and is accessed only via the API server; everything else is an independent controller watching the API. The scheduler watches Pods with an empty spec.nodeName, runs filter plugins (NodeResourcesFit on requests, NodeAffinity, TaintToleration, PodTopologySpread…) to drop infeasible nodes, score plugins to rank the rest, then writes a Binding. The kubelet on that node sees the Pod, calls CRI (containerd) to create the sandbox + containers, CNI assigns an IP, and limits become cgroups.'
    },
    math: {
      formula: String.raw`\text{feasible}(n) \iff \sum_{p \in n} \text{req}_p + \text{req}_{\text{new}} \le \text{allocatable}_n, \qquad n^{*} = \arg\max_{n \in \text{feasible}} \sum_k w_k \cdot \text{score}_k(n)`,
      description: {
        vi: 'Scheduler dùng REQUESTS (không phải mức dùng thực tế) để kiểm tra vừa. Một node 4 CPU đã có Pod request tổng 3,5 CPU sẽ từ chối Pod request 1 CPU dù đang rảnh 90% — vì vậy request sai làm lãng phí hoặc gây Pending.',
        en: 'The scheduler uses REQUESTS (not actual usage) to check fit. A 4-CPU node already holding 3.5 CPU of requests rejects a 1-CPU Pod even while 90% idle — wrong requests waste capacity or cause Pending.'
      },
      timeComplexity: 'O(nodes × plugins) per Pod (with percentageOfNodesToScore sampling)',
      spaceComplexity: 'O(cluster) informer cache'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Kiến trúc Kubernetes là "hub and spoke": API server là trung tâm duy nhất; scheduler, controller-manager, kubelet đều không nói chuyện trực tiếp với nhau.',
      en: 'Kubernetes is hub-and-spoke: the API server is the only hub; the scheduler, controller-manager and kubelets never talk to each other directly.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Request API đi qua: authentication (cert, OIDC token, ServiceAccount token) → authorization (RBAC) → mutating admission (inject sidecar, default) → schema validation → validating admission (Kyverno, Pod Security) → ghi etcd (Raft, cần quorum). Mọi controller dùng watch + informer cache nên không poll etcd.',
        en: 'An API request passes: authentication (certs, OIDC tokens, ServiceAccount tokens) → authorization (RBAC) → mutating admission (sidecar injection, defaults) → schema validation → validating admission (Kyverno, Pod Security) → etcd write (Raft, needs quorum). Controllers use watch + informer caches so they never poll etcd.'
      },
      {
        vi: 'QoS class do requests/limits quyết định: Guaranteed (mọi container requests = limits cho CPU và RAM), Burstable (có request nhưng không bằng limit), BestEffort (không có gì). Khi node thiếu RAM, kubelet evict BestEffort trước, rồi Burstable vượt request; Guaranteed bị đụng sau cùng.',
        en: 'QoS class follows from requests/limits: Guaranteed (every container has requests = limits for CPU and memory), Burstable (requests below limits), BestEffort (none). Under memory pressure the kubelet evicts BestEffort first, then Burstable pods exceeding requests; Guaranteed last.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Không đặt requests: scheduler coi Pod tốn 0, nhồi quá nhiều vào một node → OOM, eviction dây chuyền.',
        en: 'No requests: the scheduler treats the Pod as free, overpacks nodes → OOMs and cascading evictions.'
      },
      {
        vi: 'Ba replica cùng một zone vì không có topologySpreadConstraints — mất zone là mất service.',
        en: 'Three replicas in one zone without topologySpreadConstraints — lose the zone, lose the service.'
      },
      {
        vi: 'Pod Pending với "0/50 nodes are available: Insufficient cpu" dù dashboard CPU thấp — request quá lớn.',
        en: 'Pods Pending with “0/50 nodes are available: Insufficient cpu” while CPU graphs are low — requests too large.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Từ kubectl apply tới container đang chạy',
      en: 'From kubectl apply to a running container'
    },
    description: {
      vi: 'Mỗi mũi tên là một watch hoặc một ghi qua API server.',
      en: 'Each arrow is a watch or a write through the API server.'
    },
    asciiDiagram: `
 kubectl apply ─▶ kube-apiserver ── authn → RBAC → mutating → validate → validating ──▶ etcd (Raft)
                        ▲   │ watch Pods{nodeName=""}
                        │   ▼
                 kube-scheduler
                   filter: NodeResourcesFit · NodeAffinity · TaintToleration · PodTopologySpread
                       node-a ✗ (cpu)  node-b ✓  node-c ✓  node-d ✗ (taint gpu)
                   score : LeastAllocated · BalancedAllocation · ImageLocality
                       node-b 71   node-c 88  ⇒ POST pods/api-7f/binding {node-c}
                        │
                        ▼ watch Pods{nodeName=node-c}
                 kubelet@node-c ─ CRI ─▶ containerd ─▶ runc (cgroups from limits)
                               └ CNI ─▶ Pod IP 10.244.3.17 ─ status: Running
`,
    components: [
      {
        name: 'kube-apiserver',
        role: 'Single gateway',
        description: {
          vi: 'Xác thực, phân quyền, admission, lưu etcd.',
          en: 'Authn, authz, admission, persists to etcd.'
        }
      },
      {
        name: 'etcd',
        role: 'Source of truth',
        description: {
          vi: 'KV store Raft; mất quorum = cluster read-only.',
          en: 'A Raft KV store; losing quorum = read-only cluster.'
        }
      },
      {
        name: 'kube-scheduler',
        role: 'Placement',
        description: {
          vi: 'Filter → score → bind theo Scheduling Framework.',
          en: 'Filter → score → bind via the Scheduling Framework.'
        }
      },
      {
        name: 'kubelet',
        role: 'Node agent',
        description: {
          vi: 'Đưa Pod về trạng thái mong muốn qua CRI/CNI/CSI.',
          en: 'Drives Pods to desired state via CRI/CNI/CSI.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'api-admission',
      title: {
        vi: 'API server: authn → RBAC → admission → etcd',
        en: 'API server: authn → RBAC → admission → etcd'
      },
      phase: 'Persist',
      description: {
        vi: 'Pod được xác thực, phân quyền, mutate/validate rồi lưu với nodeName rỗng.',
        en: 'The Pod is authenticated, authorised, mutated/validated and stored with an empty nodeName.'
      },
      systemBehavior: {
        vi: 'etcd commit qua Raft; watch event gửi tới scheduler.',
        en: 'etcd commits via Raft; a watch event reaches the scheduler.'
      },
      codeLineMatch: 'kind: Pod'
    },
    {
      id: 'filter',
      title: { vi: 'Filter: loại node không đạt', en: 'Filter: drop infeasible nodes' },
      phase: 'Filter',
      description: {
        vi: 'Thiếu CPU theo requests, taint không tolerate, vi phạm topology spread → loại.',
        en: 'Insufficient CPU by requests, untolerated taints, topology-spread violations → removed.'
      },
      systemBehavior: {
        vi: 'Không còn node nào → Pod Pending với lý do chi tiết trong Events.',
        en: 'No nodes left → Pod Pending with detailed reasons in Events.'
      },
      codeLineMatch: 'requests:'
    },
    {
      id: 'score-bind',
      title: { vi: 'Score & Bind', en: 'Score & Bind' },
      phase: 'Score',
      description: {
        vi: 'Xếp hạng node còn lại, chọn điểm cao nhất, ghi Binding.',
        en: 'Rank remaining nodes, pick the highest score, write a Binding.'
      },
      systemBehavior: {
        vi: 'spec.nodeName được set; scheduler xử lý Pod tiếp theo.',
        en: 'spec.nodeName is set; the scheduler moves to the next Pod.'
      },
      codeLineMatch: 'topologySpreadConstraints'
    },
    {
      id: 'kubelet',
      title: { vi: 'Kubelet chạy Pod qua CRI/CNI', en: 'The kubelet runs the Pod via CRI/CNI' },
      phase: 'Run',
      description: {
        vi: 'Tạo sandbox, cấp IP, pull image, start container với cgroup từ limits.',
        en: 'Create the sandbox, assign an IP, pull the image, start containers with cgroups from limits.'
      },
      systemBehavior: {
        vi: 'QoS class quyết định thứ tự bị evict khi node thiếu RAM.',
        en: 'The QoS class decides eviction order under memory pressure.'
      },
      codeLineMatch: 'limits:'
    }
  ],

  comparison: {
    title: { vi: 'Requests vs Limits', en: 'Requests vs Limits' },
    subtitle: {
      vi: 'Một cho scheduler, một cho kernel',
      en: 'One for the scheduler, one for the kernel'
    },
    options: [
      {
        name: 'requests',
        tag: 'Scheduling',
        role: { vi: 'Đặt chỗ khi xếp lịch', en: 'A reservation at scheduling time' },
        keyMechanism: {
          vi: 'Scheduler cộng requests để kiểm tra vừa; cũng thành cpu.weight khi tranh chấp.',
          en: 'The scheduler sums requests for fit; also becomes cpu.weight under contention.'
        },
        configExample: 'requests: { cpu: 500m, memory: 512Mi }',
        architectureNote: { vi: 'Đặt theo p95 mức dùng thực tế.', en: 'Set near p95 actual usage.' }
      },
      {
        name: 'limits',
        tag: 'Enforcement',
        role: { vi: 'Trần do cgroup thực thi', en: 'A cgroup-enforced ceiling' },
        keyMechanism: {
          vi: 'CPU vượt → throttle; RAM vượt → OOMKilled. Không ảnh hưởng xếp lịch.',
          en: 'CPU over → throttled; memory over → OOMKilled. Irrelevant to scheduling.'
        },
        configExample: 'limits: { memory: 512Mi }   # often no CPU limit',
        architectureNote: {
          vi: 'Memory limit = request cho workload quan trọng.',
          en: 'Memory limit = request for critical workloads.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Xếp lịch tự động theo ràng buộc khai báo.',
        en: 'Automatic placement from declared constraints.'
      },
      {
        vi: 'Thành phần độc lập, chịu lỗi nhờ trạng thái tập trung ở etcd.',
        en: 'Independent, fault-tolerant components thanks to state in etcd.'
      }
    ],
    cons: [
      {
        vi: 'Quyết định dựa trên requests — khai báo sai là xếp sai.',
        en: 'Decisions rely on requests — wrong declarations, wrong placement.'
      },
      {
        vi: 'etcd và API server là điểm nghẽn ở cluster rất lớn.',
        en: 'etcd and the API server bottleneck very large clusters.'
      }
    ],
    balance: {
      vi: 'Requests cao = an toàn, ít tranh chấp nhưng lãng phí; requests thấp = mật độ cao nhưng rủi ro OOM/throttle.',
      en: 'High requests = safe, low contention but wasteful; low requests = dense but OOM/throttle risk.'
    },
    invariant: {
      vi: 'Tổng requests của các Pod trên một node không vượt allocatable của node.',
      en: 'The sum of Pod requests on a node never exceeds its allocatable.'
    }
  },

  code: [
    {
      label: 'pod.yaml',
      filename: 'pod.yaml',
      language: 'yaml',
      code: `apiVersion: v1
kind: Pod
metadata:
  name: api-7f
  labels: { app: api }
spec:
  containers:
    - name: api
      image: ghcr.io/acme/api@sha256:9c1e…
      resources:
        requests:                     # used by the scheduler's NodeResourcesFit filter
          cpu: 500m
          memory: 512Mi
        limits:                       # enforced by cgroups on the node
          memory: 512Mi               # = request -> predictable; no CPU limit
  tolerations:
    - { key: dedicated, operator: Equal, value: api, effect: NoSchedule }
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions: [{ key: kubernetes.io/arch, operator: In, values: [amd64] }]
  topologySpreadConstraints:          # spread replicas across zones
    - maxSkew: 1
      topologyKey: topology.kubernetes.io/zone
      whenUnsatisfiable: DoNotSchedule
      labelSelector: { matchLabels: { app: api } }`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Pod Pending với "Insufficient memory" trong khi node chỉ dùng 30% RAM. Giải thích.',
        en: 'A Pod is Pending with “Insufficient memory” while nodes use only 30% RAM. Explain.'
      },
      answer: {
        vi: 'Scheduler so sánh tổng REQUESTS với allocatable, không xem mức dùng thực. Các Pod hiện có khai request lớn hơn nhiều so với dùng thật nên node "đầy trên giấy". Giải pháp: chỉnh requests theo số liệu (VPA recommendation), hoặc thêm node.',
        en: 'The scheduler compares summed REQUESTS with allocatable, ignoring actual usage. Existing Pods request far more than they use, so nodes are “full on paper”. Fix: right-size requests from data (VPA recommendations) or add nodes.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Nếu kube-scheduler chết, chuyện gì xảy ra với các Pod đang chạy?',
        en: 'If kube-scheduler dies, what happens to running Pods?'
      },
      answer: {
        vi: 'Không gì cả — Pod đã bind tiếp tục chạy, kubelet vẫn quản lý chúng. Chỉ Pod mới (hoặc Pod cần tạo lại) sẽ Pending tới khi scheduler (thường chạy nhiều bản với leader election) phục hồi. Đây là hệ quả của thiết kế controller độc lập qua API server.',
        en: 'Nothing — bound Pods keep running and kubelets keep managing them. Only new (or re-created) Pods stay Pending until a scheduler (usually several replicas with leader election) recovers. A consequence of independent controllers communicating via the API server.'
      }
    }
  ],

  researchCitations: [DEVOPS_CITATIONS.k8sScheduler]
};
