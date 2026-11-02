import type { DevopsTopic } from '../types';
import { DEVOPS_CITATIONS } from '../citations';

export const gitopsProgressiveDeliveryTopic: DevopsTopic = {
  id: 'gitops-progressive-delivery',
  category: 'release-reliability',
  level: 'intermediate',
  chapter: 'Chương 03',
  name: 'GitOps & Progressive Delivery: Canary, Analysis, Blue/Green',
  tagline: {
    vi: 'Git là nguồn sự thật, Argo CD kéo và liên tục điều hoà; Argo Rollouts tăng trọng số canary theo bước, chạy phân tích Prometheus và tự động rollback khi vượt ngưỡng.',
    en: 'Git is the source of truth, Argo CD pulls and continuously reconciles; Argo Rollouts steps canary weights, runs Prometheus analysis and automatically rolls back past thresholds.'
  },
  difficulty: 2,
  order: 5,
  estimatedMinutes: 26,

  coreTheory: {
    problemStatement: {
      vi: 'Pipeline CI có kubeconfig admin để kubectl apply vào production: bí mật nhạy cảm nằm ở CI, trạng thái cluster lệch khỏi Git sau mỗi lần ai đó sửa tay, và mỗi lần deploy là 100% user nhận phiên bản mới cùng lúc — lỗi chỉ phát hiện khi đã ảnh hưởng mọi người.',
      en: 'The CI pipeline holds an admin kubeconfig to kubectl apply into production: a sensitive secret lives in CI, cluster state drifts from Git after every manual edit, and each deploy sends 100% of users to the new version at once — bugs are discovered only after hitting everyone.'
    },
    hardwareConstraint: {
      vi: 'Nhiều cluster/region, mạng giữa CI và cluster có thể bị chặn; lỗi production thường chỉ lộ ra dưới traffic thật (dữ liệu, tải, tích hợp) mà staging không tái hiện được.',
      en: 'Many clusters/regions, and CI-to-cluster networking may be blocked; production bugs often only surface under real traffic (data, load, integrations) that staging can’t reproduce.'
    },
    fundamentalSolution: {
      vi: 'GitOps: trạng thái mong muốn khai báo trong repo cấu hình (versioned, immutable); agent trong cluster (Argo CD/Flux) KÉO Git, so với trạng thái thực và điều hoà liên tục — drift bị phát hiện và tự sửa (self-heal). CI chỉ commit digest mới vào Git, không cần quyền cluster. Progressive delivery: Argo Rollouts thay Deployment, chuyển 10% → 25% → 50% → 100% traffic sang canary, mỗi bước chạy AnalysisRun trên metric thật (success rate, p99); vượt ngưỡng thì abort và đưa 100% về stable.',
      en: 'GitOps: desired state is declared in a config repo (versioned, immutable); an in-cluster agent (Argo CD/Flux) PULLS Git, compares with live state and reconciles continuously — drift is detected and self-healed. CI only commits new digests to Git and needs no cluster credentials. Progressive delivery: Argo Rollouts replaces the Deployment, shifting 10% → 25% → 50% → 100% of traffic to the canary, each step running an AnalysisRun on real metrics (success rate, p99); breaching thresholds aborts and returns 100% to stable.'
    },
    math: {
      formula: String.raw`\mathbb{E}[\text{failed requests}] = w \cdot \lambda \cdot t_{\text{detect}} \cdot p_{\text{err}}`,
      description: {
        vi: 'Với λ = 2.000 req/s, phiên bản lỗi p_err = 30%, phát hiện sau 2 phút: big-bang (w = 100%) ⇒ ~72.000 request lỗi; canary 10% ⇒ ~7.200. Canary nhỏ hơn và analysis nhanh hơn thu hẹp blast radius theo cấp số nhân.',
        en: 'With λ = 2,000 req/s, a bad version with p_err = 30% detected after 2 minutes: big-bang (w = 100%) ⇒ ~72,000 failed requests; a 10% canary ⇒ ~7,200. Smaller canaries and faster analysis shrink the blast radius multiplicatively.'
      },
      timeComplexity: 'Σ (pause + analysis) per step',
      spaceComplexity: 'O(stable + canary) ReplicaSets'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'OpenGitOps định nghĩa 4 nguyên tắc: declarative, versioned & immutable, pulled automatically, continuously reconciled. Progressive delivery là bước tự nhiên tiếp theo: khai báo cả CÁCH rollout trong Git.',
      en: 'OpenGitOps defines 4 principles: declarative, versioned & immutable, pulled automatically, continuously reconciled. Progressive delivery is the natural next step: declare HOW to roll out in Git too.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Argo CD Application trỏ tới repo/path/revision; trạng thái Synced/OutOfSync và Healthy/Degraded. Với selfHeal, sửa tay bằng kubectl bị hoàn tác trong vài phút; prune xoá tài nguyên đã bị xoá khỏi Git. Rollback = git revert — có lịch sử, có review.',
        en: 'An Argo CD Application points at repo/path/revision; status is Synced/OutOfSync and Healthy/Degraded. With selfHeal, manual kubectl edits are reverted within minutes; prune removes resources deleted from Git. Rollback = git revert — with history and review.'
      },
      {
        vi: 'Canary cần phân chia traffic chính xác: chỉ dựa trên số replica (1/10 Pod) thì thô; tích hợp với Gateway API/Istio/NGINX để đặt weight độc lập với số Pod. Blue/green chạy song song hai môi trường đầy đủ và lật một lần — rollback tức thì nhưng tốn gấp đôi tài nguyên và không giảm blast radius khi đã lật.',
        en: 'Canaries need precise traffic splitting: replica ratios (1 of 10 Pods) are coarse; integrate with Gateway API/Istio/NGINX to set weights independent of Pod counts. Blue/green runs two full environments and flips once — instant rollback but double resources and no reduced blast radius after the flip.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Analysis dùng metric toàn service (gộp stable + canary) → lỗi của canary 10% bị pha loãng, không vượt ngưỡng.',
        en: 'Analysis on service-wide metrics (stable + canary combined) → the 10% canary’s errors are diluted below thresholds.'
      },
      {
        vi: 'Migration DB không tương thích ngược chạy cùng canary — rollback app không rollback được schema.',
        en: 'Backward-incompatible DB migrations shipped with the canary — rolling back the app can’t roll back the schema.'
      },
      {
        vi: 'Argo CD auto-sync nhưng không bật selfHeal: drift tồn tại im lặng.',
        en: 'Argo CD auto-sync without selfHeal: drift persists silently.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Git → Argo CD → Argo Rollouts → traffic split',
      en: 'Git → Argo CD → Argo Rollouts → traffic split'
    },
    description: {
      vi: 'CI chỉ ghi Git; cluster tự kéo và tự rollout an toàn.',
      en: 'CI only writes Git; the cluster pulls and rolls out safely by itself.'
    },
    asciiDiagram: `
 CI ── commit image digest ──▶ deploy-config.git (envs/prod/api/rollout.yaml)
                                       ▲  pull every 3 min / webhook
                                       │
                               Argo CD (in cluster)  OutOfSync → sync → Synced/Healthy
                                       │ applies Rollout spec
                                       ▼
                               Argo Rollouts controller
                         steps: setWeight 10 → pause 5m + analysis → 25 → 50 → 100
                                       │ HTTPRoute weights
            ┌──────────────────────────┴───────────────────────────┐
     stable RS (v1)  90% ─────────────────────────────  canary RS (v2) 10%
                                       │
            AnalysisRun: success-rate(canary) ≥ 99% ∧ p99(canary) < 300ms
                 pass → next step      fail ×2 → ABORT → 100% stable (auto rollback)
`,
    components: [
      {
        name: 'Config repo',
        role: 'Desired state',
        description: {
          vi: 'Manifest theo môi trường; PR = thay đổi production.',
          en: 'Per-environment manifests; a PR = a production change.'
        }
      },
      {
        name: 'Argo CD',
        role: 'Pull reconciler',
        description: {
          vi: 'So Git với cluster, sync, self-heal, prune.',
          en: 'Diffs Git vs cluster, syncs, self-heals, prunes.'
        }
      },
      {
        name: 'Rollout',
        role: 'Progressive Deployment',
        description: {
          vi: 'Thay Deployment, khai báo các bước canary.',
          en: 'Replaces Deployment, declaring canary steps.'
        }
      },
      {
        name: 'AnalysisTemplate',
        role: 'Automated judge',
        description: {
          vi: 'Query Prometheus, quyết định pass/fail.',
          en: 'Queries Prometheus, decides pass/fail.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'commit',
      title: { vi: 'CI commit digest mới vào Git', en: 'CI commits the new digest to Git' },
      phase: 'Declare',
      description: {
        vi: 'PR đổi image trong rollout.yaml được review và merge.',
        en: 'A PR changing the image in rollout.yaml is reviewed and merged.'
      },
      systemBehavior: {
        vi: 'Không ai cần kubeconfig production.',
        en: 'Nobody needs a production kubeconfig.'
      },
      codeLineMatch: 'image: ghcr.io/acme/api@sha256:v2'
    },
    {
      id: 'sync',
      title: {
        vi: 'Argo CD phát hiện OutOfSync và kéo về',
        en: 'Argo CD detects OutOfSync and pulls'
      },
      phase: 'Reconcile',
      description: {
        vi: 'Agent trong cluster so Git với trạng thái sống, apply thay đổi.',
        en: 'The in-cluster agent diffs Git with live state and applies the change.'
      },
      systemBehavior: {
        vi: 'selfHeal hoàn tác mọi chỉnh tay khác Git.',
        en: 'selfHeal reverts any manual edits that differ from Git.'
      },
      codeLineMatch: 'selfHeal: true'
    },
    {
      id: 'canary',
      title: { vi: 'Canary 10% + phân tích', en: 'Canary 10% + analysis' },
      phase: 'Canary',
      description: {
        vi: 'HTTPRoute chia 90/10; AnalysisRun đo success rate và p99 của riêng canary.',
        en: 'The HTTPRoute splits 90/10; an AnalysisRun measures the canary’s own success rate and p99.'
      },
      systemBehavior: {
        vi: 'Rollouts controller chờ pause và kết quả analysis trước bước kế.',
        en: 'The Rollouts controller waits for the pause and analysis result before the next step.'
      },
      codeLineMatch: 'setWeight: 10'
    },
    {
      id: 'promote-or-abort',
      title: { vi: 'Promote dần hoặc tự động abort', en: 'Promote stepwise or auto-abort' },
      phase: 'Decide',
      description: {
        vi: 'Đạt → 25 → 50 → 100%; fail 2 lần → abort, 100% về stable.',
        en: 'Pass → 25 → 50 → 100%; two failures → abort, 100% back to stable.'
      },
      systemBehavior: {
        vi: 'Rollback không cần người trực, chỉ vài giây đổi weight.',
        en: 'Rollback needs no human on-call — just seconds to change weights.'
      },
      codeLineMatch: 'failureLimit: 1'
    }
  ],

  comparison: {
    title: { vi: 'Canary vs Blue/Green', en: 'Canary vs Blue/Green' },
    subtitle: {
      vi: 'Giới hạn blast radius vs rollback tức thì',
      en: 'Bounded blast radius vs instant rollback'
    },
    options: [
      {
        name: 'Canary',
        tag: 'Gradual',
        role: { vi: 'Tăng dần % traffic có phân tích', en: 'Gradual traffic % with analysis' },
        keyMechanism: {
          vi: 'Lỗi chỉ chạm một phần nhỏ user; cần metric tách riêng canary và traffic splitting.',
          en: 'Bugs hit only a small slice of users; needs canary-specific metrics and traffic splitting.'
        },
        configExample: 'steps: [setWeight: 10, pause: {duration: 5m}, setWeight: 50, …]',
        architectureNote: {
          vi: 'Mặc định cho service stateless traffic cao.',
          en: 'Default for high-traffic stateless services.'
        }
      },
      {
        name: 'Blue/Green',
        tag: 'Switch',
        role: { vi: 'Hai môi trường đầy đủ, lật một lần', en: 'Two full environments, one flip' },
        keyMechanism: {
          vi: 'Preview đầy đủ trước khi lật, rollback tức thì; tốn 2× tài nguyên, lật là 100% user cùng lúc.',
          en: 'Full preview before the flip, instant rollback; 2× resources and 100% of users at once after flipping.'
        },
        configExample:
          'strategy.blueGreen: { activeService: api, previewService: api-preview, autoPromotionEnabled: false }',
        architectureNote: {
          vi: 'Hợp khi không chia nhỏ traffic được.',
          en: 'Fits when traffic can’t be split finely.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Audit trail đầy đủ qua Git; rollback = revert.',
        en: 'Full audit trail via Git; rollback = revert.'
      },
      {
        vi: 'Blast radius giới hạn, rollback tự động dựa trên dữ liệu.',
        en: 'Bounded blast radius, data-driven automatic rollback.'
      }
    ],
    cons: [
      {
        vi: 'Rollout chậm hơn (phút–giờ) so với big-bang.',
        en: 'Slower rollouts (minutes to hours) than big-bang.'
      },
      {
        vi: 'Phiên bản cũ và mới chạy song song — cần tương thích ngược.',
        en: 'Old and new run side by side — backward compatibility required.'
      }
    ],
    balance: {
      vi: 'Bước nhỏ và pause dài = an toàn hơn nhưng lead time dài hơn; điều chỉnh theo mức rủi ro của thay đổi.',
      en: 'Small steps and long pauses = safer but longer lead time; tune to the change’s risk.'
    },
    invariant: {
      vi: 'Trạng thái cluster hội tụ về đúng commit trong Git; canary không vượt bước khi analysis chưa đạt.',
      en: 'Cluster state converges to the Git commit; a canary never advances past a failed analysis.'
    }
  },

  code: [
    {
      label: 'rollout.yaml',
      filename: 'rollout.yaml',
      language: 'yaml',
      code: `apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata: { name: api }
spec:
  replicas: 10
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/api@sha256:v2…        # the only line CI changes
  strategy:
    canary:
      canaryService: api-canary
      stableService: api-stable
      trafficRouting:
        plugins:
          argoproj-labs/gatewayAPI: { httpRoute: api, namespace: shop }
      analysis:
        templates: [{ templateName: success-rate }]
        startingStep: 1
      steps:
        - setWeight: 10
        - pause: { duration: 5m }
        - setWeight: 25
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: { duration: 10m }
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata: { name: success-rate }
spec:
  metrics:
    - name: success-rate
      interval: 1m
      failureLimit: 1                               # 2nd failure aborts -> 100% stable
      successCondition: result[0] >= 0.99
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(http_requests_total{service="api-canary",code!~"5.."}[2m]))
            / sum(rate(http_requests_total{service="api-canary"}[2m]))
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata: { name: api-prod, namespace: argocd }
spec:
  source: { repoURL: https://github.com/acme/deploy-config, path: envs/prod/api, targetRevision: main }
  destination: { server: https://kubernetes.default.svc, namespace: shop }
  syncPolicy:
    automated: { prune: true, selfHeal: true }`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Pull-based GitOps an toàn hơn push-based CI deploy ở điểm nào?',
        en: 'How is pull-based GitOps safer than push-based CI deploys?'
      },
      answer: {
        vi: 'Credential cluster không rời khỏi cluster — CI chỉ cần quyền ghi Git. Mọi thay đổi đi qua PR có review và lịch sử. Agent liên tục điều hoà nên drift do sửa tay bị phát hiện/hoàn tác. Cluster ở mạng riêng vẫn deploy được vì kết nối đi ra (tới Git), không đi vào.',
        en: 'Cluster credentials never leave the cluster — CI only needs Git write access. Every change goes through a reviewed PR with history. The agent reconciles continuously, so manual drift is detected/reverted. Private clusters still deploy because connections go outbound (to Git), not inbound.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Canary analysis báo xanh nhưng sau 100% thì lỗi tăng vọt. Có thể do đâu?',
        en: 'Canary analysis was green but errors spiked at 100%. What could explain it?'
      },
      answer: {
        vi: 'Metric không tách riêng canary (bị pha loãng); traffic canary không đại diện (sticky session, chỉ một region, không có tenant lớn); lỗi phụ thuộc tải (pool cạn, lock) chỉ lộ ở 100%; thời gian pause quá ngắn với lỗi rò rỉ bộ nhớ/cache. Khắc phục: metric theo service canary, bước 50% đủ lâu, thêm metric bão hoà (CPU, pool, GC).',
        en: 'Metrics weren’t canary-specific (diluted); canary traffic wasn’t representative (sticky sessions, one region, no large tenants); load-dependent bugs (pool exhaustion, locks) appear only at 100%; pauses too short for leaks/cache effects. Fix: canary-scoped metrics, a long enough 50% step, saturation metrics (CPU, pools, GC).'
      }
    }
  ],

  researchCitations: [DEVOPS_CITATIONS.openGitops, DEVOPS_CITATIONS.argoRollouts]
};
