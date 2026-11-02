import type { DevopsTopic } from '../types';
import { DEVOPS_CITATIONS } from '../citations';

export const controllersRollingUpdateProbesTopic: DevopsTopic = {
  id: 'controllers-rolling-update-probes',
  category: 'kubernetes-core',
  level: 'intermediate',
  chapter: 'Chương 02',
  name: 'Controllers, Reconciliation & Zero-Downtime Rolling Updates',
  tagline: {
    vi: 'Vòng lặp điều hoà level-triggered, Deployment → ReplicaSet → Pod, maxSurge/maxUnavailable, readiness vs liveness vs startup probe, graceful shutdown và rollback.',
    en: 'Level-triggered reconciliation loops, Deployment → ReplicaSet → Pod, maxSurge/maxUnavailable, readiness vs liveness vs startup probes, graceful shutdown and rollback.'
  },
  difficulty: 2,
  order: 3,
  estimatedMinutes: 26,

  coreTheory: {
    problemStatement: {
      vi: 'Script deploy kiểu "stop v1, start v2" gây downtime; script tự viết cập nhật từng máy thì dừng giữa chừng khi một bước lỗi, để hệ thống ở trạng thái không ai biết. Pod mới nhận traffic trước khi warm-up xong; Pod cũ bị kill khi còn request đang xử lý.',
      en: '“Stop v1, start v2” deploy scripts cause downtime; hand-written per-machine scripts stop half-way on errors, leaving an unknown state. New Pods receive traffic before warm-up; old Pods are killed with requests in flight.'
    },
    hardwareConstraint: {
      vi: 'Node, mạng và process có thể chết bất cứ lúc nào, kể cả giữa lúc deploy. Event có thể bị mất hoặc đến trễ; một hệ thống dựa trên "xử lý từng event" sẽ lệch trạng thái.',
      en: 'Nodes, networks and processes can die at any moment, including mid-deploy. Events can be lost or delayed; a system built on “handle each event” drifts out of sync.'
    },
    fundamentalSolution: {
      vi: 'Controller pattern: liên tục so desired state (spec) với actual state (status) và hành động để thu hẹp khác biệt — level-triggered, nên mất event cũng không sao vì lần resync sau sẽ sửa. Deployment controller tạo ReplicaSet mới theo pod-template-hash và scale dần RS mới lên, RS cũ xuống, trong giới hạn maxSurge/maxUnavailable. Readiness probe quyết định Pod có nằm trong EndpointSlice nhận traffic hay không; preStop + terminationGracePeriodSeconds cho Pod cũ rút lui êm.',
      en: 'The controller pattern: continuously compare desired state (spec) with actual state (status) and act to close the gap — level-triggered, so lost events don’t matter because the next resync fixes things. The Deployment controller creates a new ReplicaSet per pod-template-hash and gradually scales the new RS up and the old one down within maxSurge/maxUnavailable. Readiness probes decide whether a Pod is in the EndpointSlice receiving traffic; preStop + terminationGracePeriodSeconds let old Pods drain gracefully.'
    },
    math: {
      formula: String.raw`R - \lfloor u \cdot R \rfloor \;\le\; \text{available}(t) \quad\wedge\quad \text{total}(t) \;\le\; R + \lceil s \cdot R \rceil`,
      description: {
        vi: 'R = replicas, u = maxUnavailable, s = maxSurge (mặc định 25%/25%, maxUnavailable làm tròn xuống, maxSurge làm tròn lên). Với R = 4: luôn có ≥ 3 Pod sẵn sàng và ≤ 5 Pod tồn tại. Đặt maxUnavailable = 0 để không bao giờ giảm capacity, đổi lại cần dư tài nguyên cho Pod surge.',
        en: 'R = replicas, u = maxUnavailable, s = maxSurge (25%/25% by default; maxUnavailable rounds down, maxSurge rounds up). With R = 4: always ≥ 3 ready Pods and ≤ 5 Pods in total. Set maxUnavailable = 0 to never lose capacity, at the cost of spare resources for surge Pods.'
      },
      timeComplexity: 'O(R / batch) rollout waves',
      spaceComplexity: 'O(R + surge) Pods during rollout'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Mọi thứ trong Kubernetes — Deployment, Job, HPA, cả operator của bạn — đều là controller theo cùng một mẫu informer + workqueue + reconcile.',
      en: 'Everything in Kubernetes — Deployments, Jobs, HPA, your own operators — is a controller following the same informer + workqueue + reconcile pattern.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Ba loại probe: startupProbe cho ứng dụng khởi động chậm (tạm tắt liveness tới khi thành công); readinessProbe — thất bại thì RÚT Pod khỏi Endpoints nhưng không restart; livenessProbe — thất bại thì RESTART container. Liveness không được phụ thuộc DB/downstream, nếu không một sự cố DB sẽ restart toàn bộ Pod theo dây chuyền.',
        en: 'Three probes: startupProbe for slow starters (suspends liveness until it succeeds); readinessProbe — failing REMOVES the Pod from Endpoints without restarting; livenessProbe — failing RESTARTS the container. Liveness must not depend on DBs/downstreams, or one DB incident restarts every Pod in a cascade.'
      },
      {
        vi: 'Khi Pod bị xoá: nó chuyển Terminating, đồng thời bị rút khỏi EndpointSlice và kubelet chạy preStop rồi gửi SIGTERM — hai việc song song, nên kube-proxy/ingress có thể vẫn gửi request vài giây. preStop sleep 5–10 s + ứng dụng graceful shutdown (ngừng nhận, xử lý nốt) tránh lỗi 502 khi deploy.',
        en: 'When a Pod is deleted it becomes Terminating; removal from the EndpointSlice and the kubelet’s preStop → SIGTERM happen in parallel, so kube-proxy/ingress may still route requests for a few seconds. A 5–10 s preStop sleep + graceful app shutdown (stop accepting, finish in-flight) avoids 502s during deploys.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Không có readinessProbe: Pod nhận traffic ngay khi process start, trước khi cache/connection pool sẵn sàng.',
        en: 'No readinessProbe: Pods receive traffic as soon as the process starts, before caches/pools are ready.'
      },
      {
        vi: 'livenessProbe gọi /health kiểm tra DB → DB chậm làm restart toàn bộ fleet.',
        en: 'A livenessProbe calling a DB-checking /health → a slow DB restarts the whole fleet.'
      },
      {
        vi: 'Không đặt progressDeadlineSeconds/alert: rollout kẹt nửa chừng hàng giờ không ai hay.',
        en: 'No progressDeadlineSeconds/alert: a rollout stuck half-way for hours unnoticed.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Rolling update với R=4, maxSurge=1, maxUnavailable=0',
      en: 'Rolling update with R=4, maxSurge=1, maxUnavailable=0'
    },
    description: {
      vi: 'Mỗi đợt thêm một Pod v2, chờ Ready, rồi bớt một Pod v1.',
      en: 'Each wave adds one v2 Pod, waits for Ready, then removes one v1 Pod.'
    },
    asciiDiagram: `
 Deployment api (spec.template.image = v2)          desired: 4 replicas
   ├─ ReplicaSet api-6d9f (v1)  4 → 3 → 2 → 1 → 0
   └─ ReplicaSet api-7c4b (v2)  0 → 1 → 2 → 3 → 4

 t0  [v1✓][v1✓][v1✓][v1✓]                 available 4
 t1  [v1✓][v1✓][v1✓][v1✓][v2…]            surge +1, v2 not ready (startup/readiness)
 t2  [v1✓][v1✓][v1✓][v1⏻][v2✓]            v2 Ready → in EndpointSlice; v1 Terminating (preStop, SIGTERM)
 t3  [v1✓][v1✓][v1✓][v2✓]                 repeat …
 t8  [v2✓][v2✓][v2✓][v2✓]                 rollout complete · old RS kept (revisionHistoryLimit) for undo
`,
    components: [
      {
        name: 'Reconcile loop',
        role: 'Controller core',
        description: {
          vi: 'Observe → diff → act, lặp vô hạn.',
          en: 'Observe → diff → act, forever.'
        }
      },
      {
        name: 'ReplicaSet',
        role: 'Revision',
        description: {
          vi: 'Mỗi template hash một RS; rollback = scale RS cũ lên.',
          en: 'One RS per template hash; rollback = scale the old RS up.'
        }
      },
      {
        name: 'readinessProbe',
        role: 'Traffic gate',
        description: {
          vi: 'Quyết định Pod có trong EndpointSlice.',
          en: 'Decides EndpointSlice membership.'
        }
      },
      {
        name: 'preStop',
        role: 'Drain',
        description: {
          vi: 'Cho load balancer kịp rút Pod trước SIGTERM.',
          en: 'Gives load balancers time to drop the Pod before SIGTERM.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'new-rs',
      title: { vi: 'Spec đổi → ReplicaSet mới', en: 'Spec changes → a new ReplicaSet' },
      phase: 'Reconcile',
      description: {
        vi: 'Đổi image tạo pod-template-hash mới; controller tạo RS v2 với 0 replica.',
        en: 'A new image creates a new pod-template-hash; the controller creates RS v2 with 0 replicas.'
      },
      systemBehavior: {
        vi: 'Deployment controller tính toán bước tiếp theo theo maxSurge/maxUnavailable.',
        en: 'The Deployment controller plans the next wave by maxSurge/maxUnavailable.'
      },
      codeLineMatch: 'image: ghcr.io/acme/api@sha256:v2'
    },
    {
      id: 'surge',
      title: { vi: 'Surge một Pod v2', en: 'Surge one v2 Pod' },
      phase: 'Surge',
      description: {
        vi: 'Tổng Pod lên 5 (≤ R + maxSurge); v2 chạy startupProbe rồi readinessProbe.',
        en: 'Pods go to 5 (≤ R + maxSurge); v2 runs its startupProbe then readinessProbe.'
      },
      systemBehavior: {
        vi: 'Pod chưa Ready không nhận traffic.',
        en: 'Not-Ready Pods receive no traffic.'
      },
      codeLineMatch: 'maxSurge: 1'
    },
    {
      id: 'ready',
      title: { vi: 'v2 Ready → vào EndpointSlice', en: 'v2 Ready → joins the EndpointSlice' },
      phase: 'Ready',
      description: {
        vi: 'readinessProbe thành công; Pod được thêm vào Service endpoints.',
        en: 'The readinessProbe succeeds; the Pod is added to Service endpoints.'
      },
      systemBehavior: {
        vi: 'kube-proxy/ingress bắt đầu gửi traffic tới v2.',
        en: 'kube-proxy/ingress start routing traffic to v2.'
      },
      codeLineMatch: 'readinessProbe:'
    },
    {
      id: 'drain-old',
      title: { vi: 'Rút một Pod v1 êm ái', en: 'Drain one v1 Pod gracefully' },
      phase: 'Drain',
      description: {
        vi: 'v1 bị xoá: rút khỏi endpoints, preStop sleep, SIGTERM, xử lý nốt request.',
        en: 'v1 is deleted: removed from endpoints, preStop sleep, SIGTERM, in-flight requests finish.'
      },
      systemBehavior: {
        vi: 'Lặp lại tới khi 4/4 là v2; RS cũ giữ lại để rollout undo.',
        en: 'Repeat until 4/4 are v2; the old RS is kept for rollout undo.'
      },
      codeLineMatch: 'preStop:'
    }
  ],

  comparison: {
    title: {
      vi: 'Readiness vs Liveness vs Startup probe',
      en: 'Readiness vs Liveness vs Startup probes'
    },
    subtitle: {
      vi: 'Ba câu hỏi khác nhau, ba hậu quả khác nhau',
      en: 'Three different questions, three different consequences'
    },
    options: [
      {
        name: 'readinessProbe',
        tag: 'Traffic',
        role: { vi: '"Có nên nhận request không?"', en: '“Should I receive requests?”' },
        keyMechanism: {
          vi: 'Fail → rút khỏi Endpoints, không restart. Được phép kiểm tra phụ thuộc thiết yếu.',
          en: 'Fail → removed from Endpoints, no restart. May check essential dependencies.'
        },
        configExample: 'httpGet: { path: /actuator/health/readiness, port: 8080 }',
        architectureNote: {
          vi: 'Cũng dùng để tự rút khi đang shutdown.',
          en: 'Also used to self-remove during shutdown.'
        }
      },
      {
        name: 'liveness / startup',
        tag: 'Restart',
        role: { vi: '"Process có bị treo không?"', en: '“Is the process wedged?”' },
        keyMechanism: {
          vi: 'Liveness fail → restart container; chỉ kiểm tra chính process. Startup bảo vệ ứng dụng khởi động chậm khỏi bị liveness giết.',
          en: 'Liveness fail → container restart; checks only the process itself. Startup shields slow starters from liveness kills.'
        },
        configExample:
          'livenessProbe: { httpGet: { path: /actuator/health/liveness, port: 8080 } }',
        architectureNote: {
          vi: 'Không bao giờ kiểm tra DB trong liveness.',
          en: 'Never check the DB in liveness.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Deploy zero-downtime tự động, tự phục hồi khi node chết giữa chừng.',
        en: 'Automatic zero-downtime deploys that self-heal if nodes die mid-way.'
      },
      { vi: 'Rollback nhanh bằng ReplicaSet cũ.', en: 'Fast rollback via the old ReplicaSet.' }
    ],
    cons: [
      {
        vi: 'v1 và v2 chạy song song — schema DB và API phải tương thích ngược.',
        en: 'v1 and v2 run side by side — DB schemas and APIs must be backward compatible.'
      },
      {
        vi: 'Rolling update không kiểm tra chất lượng bằng metric (cần canary, bài 05).',
        en: 'Rolling updates don’t gate on metrics (that needs canaries, lesson 05).'
      }
    ],
    balance: {
      vi: 'maxSurge lớn = rollout nhanh nhưng tốn tài nguyên; maxUnavailable lớn = nhanh nhưng giảm capacity khi deploy.',
      en: 'Larger maxSurge = faster rollout but more resources; larger maxUnavailable = faster but reduced capacity during deploys.'
    },
    invariant: {
      vi: 'Trong suốt rollout: available ≥ R − maxUnavailable và total ≤ R + maxSurge.',
      en: 'Throughout a rollout: available ≥ R − maxUnavailable and total ≤ R + maxSurge.'
    }
  },

  code: [
    {
      label: 'deployment.yaml',
      filename: 'deployment.yaml',
      language: 'yaml',
      code: `apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 4
  revisionHistoryLimit: 5
  progressDeadlineSeconds: 600
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0            # never drop below 4 ready Pods
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      terminationGracePeriodSeconds: 45
      containers:
        - name: api
          image: ghcr.io/acme/api@sha256:v2…
          startupProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            failureThreshold: 30
            periodSeconds: 2       # up to 60 s to start
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
            periodSeconds: 10
          lifecycle:
            preStop:
              exec: { command: ["sh", "-c", "sleep 8"] }   # let endpoints converge
# kubectl rollout status deploy/api   |   kubectl rollout undo deploy/api`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Deploy nào cũng có vài chục lỗi 502 dù đã rolling update. Nguyên nhân?',
        en: 'Every deploy produces a few dozen 502s despite rolling updates. Why?'
      },
      answer: {
        vi: 'Race giữa việc rút Pod khỏi endpoints và SIGTERM: proxy/ingress vẫn gửi request tới Pod đang tắt. Hoặc Pod mới nhận traffic trước khi sẵn sàng vì thiếu readinessProbe. Sửa: preStop sleep vài giây, graceful shutdown (server.shutdown=graceful), readinessProbe đúng, terminationGracePeriodSeconds đủ dài.',
        en: 'A race between endpoint removal and SIGTERM: proxies/ingress still route to the terminating Pod. Or new Pods take traffic before they’re ready due to a missing readinessProbe. Fix: a few seconds of preStop sleep, graceful shutdown (server.shutdown=graceful), a correct readinessProbe and a long enough terminationGracePeriodSeconds.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: '"Level-triggered" khác "edge-triggered" thế nào và vì sao Kubernetes chọn level?',
        en: 'How does “level-triggered” differ from “edge-triggered” and why does Kubernetes choose level?'
      },
      answer: {
        vi: 'Edge-triggered phản ứng với từng thay đổi (event); mất event là mất hành động. Level-triggered phản ứng với trạng thái hiện tại: mỗi lần reconcile so sánh toàn bộ desired vs actual, nên event trùng/mất/đến muộn đều vô hại và controller restart tự hội tụ. Reconcile vì vậy phải idempotent.',
        en: 'Edge-triggered reacts to each change (event); a lost event is a lost action. Level-triggered reacts to the current state: each reconcile compares full desired vs actual, so duplicated/lost/late events are harmless and restarted controllers converge. Reconcile must therefore be idempotent.'
      },
      proTip: {
        vi: 'Liên hệ với cách viết operator: reconcile không được giả định nó được gọi bao nhiêu lần.',
        en: 'Tie it to writing operators: reconcile must not assume how many times it is called.'
      }
    }
  ],

  researchCitations: [DEVOPS_CITATIONS.k8sControllers]
};
