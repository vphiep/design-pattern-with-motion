import type { DevopsTopic } from '../types';
import { DEVOPS_CITATIONS } from '../citations';

export const autoscalingObservabilitySloTopic: DevopsTopic = {
  id: 'autoscaling-observability-slo',
  category: 'release-reliability',
  level: 'advanced',
  chapter: 'Chương 03',
  name: 'Autoscaling, Observability & SLO Burn-Rate Alerting',
  tagline: {
    vi: 'Công thức HPA, tolerance và stabilization window, Cluster Autoscaler/Karpenter khi Pod Pending, metrics–logs–traces với OpenTelemetry, SLO, error budget và cảnh báo burn rate đa cửa sổ.',
    en: 'The HPA formula, tolerance and stabilisation windows, Cluster Autoscaler/Karpenter for Pending Pods, metrics–logs–traces with OpenTelemetry, SLOs, error budgets and multiwindow burn-rate alerts.'
  },
  difficulty: 3,
  order: 6,
  estimatedMinutes: 26,

  coreTheory: {
    problemStatement: {
      vi: 'Traffic flash sale tăng 8 lần trong 2 phút; số Pod cố định thì sập, cấp dư thường trực thì đốt tiền. Khi sự cố xảy ra, team bị ngập 300 alert CPU > 80% không nói gì về trải nghiệm user, trong khi lỗi thật (checkout 5xx tăng chậm) không ai báo.',
      en: 'Flash-sale traffic jumps 8× in 2 minutes; fixed Pod counts fall over, permanent over-provisioning burns money. During incidents the team drowns in 300 “CPU > 80%” alerts that say nothing about users, while the real problem (slowly rising checkout 5xx) pages nobody.'
    },
    hardwareConstraint: {
      vi: 'Pod mới cần 20–60 s (pull image, JVM warm-up); node mới cần 1–3 phút. Metric thu thập theo chu kỳ (15–30 s) nên autoscaler luôn phản ứng trễ; scale quá nhạy gây dao động (thrashing).',
      en: 'New Pods take 20–60 s (image pull, JVM warm-up); new nodes 1–3 minutes. Metrics are scraped periodically (15–30 s), so autoscalers always lag; over-sensitive scaling causes thrashing.'
    },
    fundamentalSolution: {
      vi: 'HPA: desired = ceil(current × currentMetric / targetMetric), bỏ qua nếu lệch < 10% (tolerance), scale down chỉ theo khuyến nghị cao nhất trong 5 phút (stabilization). Pod Pending vì thiếu node → Cluster Autoscaler/Karpenter thêm node. Quan sát bằng ba tín hiệu: metrics (RED/USE), logs có cấu trúc, traces phân tán qua OpenTelemetry với trace_id xuyên suốt. Cảnh báo theo SLO: đặt mục tiêu (99,9% request thành công/30 ngày), error budget = 0,1%, và page khi burn rate cao trên cả cửa sổ dài lẫn ngắn.',
      en: 'HPA: desired = ceil(current × currentMetric / targetMetric), skipped within 10% (tolerance), scaling down only to the highest recommendation of the last 5 minutes (stabilisation). Pending Pods for lack of nodes → Cluster Autoscaler/Karpenter add nodes. Observe with three signals: metrics (RED/USE), structured logs, distributed traces via OpenTelemetry with a shared trace_id. Alert on SLOs: set an objective (99.9% successful requests/30 days), error budget = 0.1%, and page when burn rate is high over both a long and a short window.'
    },
    math: {
      formula: String.raw`\text{desired} = \Big\lceil \text{current} \cdot \frac{m_{\text{current}}}{m_{\text{target}}} \Big\rceil, \qquad \text{burn rate} = \frac{\text{error ratio}}{1 - \text{SLO}}`,
      description: {
        vi: 'Ví dụ: 4 Pod, CPU trung bình 180% request, target 60% ⇒ ceil(4 × 3) = 12 Pod. Burn rate 14,4 với SLO 99,9% (error ratio 1,44%) đốt 2% budget 30 ngày chỉ trong 1 giờ — ngưỡng page kinh điển của Google SRE Workbook khi xét cửa sổ 1h và 5m.',
        en: 'Example: 4 Pods at 180% of CPU request on average, target 60% ⇒ ceil(4 × 3) = 12 Pods. A burn rate of 14.4 at a 99.9% SLO (1.44% error ratio) consumes 2% of the 30-day budget in just 1 hour — the classic Google SRE Workbook page threshold over 1h and 5m windows.'
      },
      timeComplexity: 'HPA sync every 15 s; reaction ≈ scrape + sync + Pod startup',
      spaceComplexity: 'O(series) in the metrics store'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Autoscaling và observability là hai mặt của cùng vòng phản hồi: không đo đúng thì không scale đúng, không cảnh báo đúng.',
      en: 'Autoscaling and observability are two sides of one feedback loop: without the right measurements you can’t scale or alert correctly.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Scale theo CPU kém cho workload I/O-bound hoặc consumer queue; dùng custom/external metric (RPS mỗi Pod, consumer lag) qua Prometheus Adapter hoặc KEDA. HPA và VPA không nên cùng điều khiển CPU/RAM của một workload. Karpenter chọn loại instance phù hợp Pod Pending thay vì chỉ mở rộng node group cố định.',
        en: 'CPU-based scaling is poor for I/O-bound workloads or queue consumers; use custom/external metrics (RPS per Pod, consumer lag) via Prometheus Adapter or KEDA. HPA and VPA should not both control the same workload’s CPU/memory. Karpenter picks instance types to fit Pending Pods instead of only growing fixed node groups.'
      },
      {
        vi: 'RED (Rate, Errors, Duration) cho service; USE (Utilization, Saturation, Errors) cho tài nguyên. Alert trên triệu chứng mà user cảm nhận (SLO), còn nguyên nhân (CPU, GC) để dashboard điều tra. Multiwindow multi-burn-rate: page khi burn rate > 14,4 trên 1h VÀ 5m; ticket khi > 6 trên 6h VÀ 30m — cửa sổ ngắn giúp alert tự tắt nhanh khi đã hết lỗi.',
        en: 'RED (Rate, Errors, Duration) for services; USE (Utilization, Saturation, Errors) for resources. Alert on user-facing symptoms (SLOs) and leave causes (CPU, GC) to investigation dashboards. Multiwindow multi-burn-rate: page when burn rate > 14.4 over 1h AND 5m; ticket when > 6 over 6h AND 30m — the short window makes alerts reset quickly once errors stop.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'HPA target CPU khi container không có CPU request — HPA không tính được phần trăm.',
        en: 'An HPA CPU target with no CPU request on the container — HPA can’t compute utilisation.'
      },
      {
        vi: 'Label cardinality bùng nổ (user_id, request_id làm label) làm sập Prometheus.',
        en: 'Label cardinality explosions (user_id, request_id as labels) taking down Prometheus.'
      },
      {
        vi: 'SLO 100% — không còn error budget, mọi deploy đều "vi phạm".',
        en: 'A 100% SLO — no error budget, every deploy is a “violation”.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Vòng phản hồi: đo → scale → cảnh báo',
      en: 'The feedback loop: measure → scale → alert'
    },
    description: {
      vi: 'Cùng một nguồn metric cấp cho autoscaler và hệ thống SLO.',
      en: 'One metric source feeds both the autoscaler and the SLO system.'
    },
    asciiDiagram: `
 Pods ──OTel SDK──▶ OTel Collector ──▶ Prometheus (metrics) · Loki (logs) · Tempo (traces)
                                         │
     ┌───────────────────────────────────┼────────────────────────────────────┐
     ▼                                   ▼                                    ▼
 HPA (every 15s)                    SLO recording rules                  Dashboards
 desired = ceil(4 × 180/60) = 12    error_ratio[5m|1h|6h]                RED / USE
     │ Pods Pending (no capacity)    burn = ratio / 0.001
     ▼                                   │
 Karpenter / Cluster Autoscaler      page if burn>14.4 on 1h AND 5m
 + 3 nodes (~90 s)                   ticket if burn>6 on 6h AND 30m
`,
    components: [
      {
        name: 'HPA',
        role: 'Pod scaling',
        description: {
          vi: 'Điều chỉnh replicas theo metric, có tolerance và stabilization.',
          en: 'Adjusts replicas by metrics with tolerance and stabilisation.'
        }
      },
      {
        name: 'Karpenter / CA',
        role: 'Node scaling',
        description: {
          vi: 'Thêm node khi có Pod Pending, gỡ node rảnh.',
          en: 'Adds nodes for Pending Pods, removes idle nodes.'
        }
      },
      {
        name: 'OpenTelemetry',
        role: 'Telemetry standard',
        description: {
          vi: 'SDK + Collector cho metrics, logs, traces.',
          en: 'SDK + Collector for metrics, logs, traces.'
        }
      },
      {
        name: 'Error budget',
        role: 'Release governor',
        description: {
          vi: '1 − SLO; hết budget thì ưu tiên độ ổn định.',
          en: '1 − SLO; when exhausted, prioritise reliability.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'measure',
      title: {
        vi: 'Thu thập metric RED qua OpenTelemetry',
        en: 'Collect RED metrics via OpenTelemetry'
      },
      phase: 'Measure',
      description: {
        vi: 'Rate, errors, duration cho mỗi route; trace_id gắn vào log.',
        en: 'Rate, errors and duration per route; trace_id attached to logs.'
      },
      systemBehavior: {
        vi: 'Prometheus scrape mỗi 15 s; recording rule tính error ratio.',
        en: 'Prometheus scrapes every 15 s; recording rules compute the error ratio.'
      },
      codeLineMatch: 'kind: HorizontalPodAutoscaler'
    },
    {
      id: 'hpa',
      title: { vi: 'HPA tính desired replicas', en: 'HPA computes desired replicas' },
      phase: 'Scale Pods',
      description: {
        vi: 'ceil(4 × 180/60) = 12; scale up nhanh, scale down chờ 300 s ổn định.',
        en: 'ceil(4 × 180/60) = 12; scale up fast, scale down after a 300 s stabilisation.'
      },
      systemBehavior: {
        vi: 'Bỏ qua thay đổi trong ngưỡng tolerance 10%.',
        en: 'Changes within the 10% tolerance are ignored.'
      },
      codeLineMatch: 'averageUtilization: 60'
    },
    {
      id: 'nodes',
      title: { vi: 'Pod Pending → thêm node', en: 'Pending Pods → add nodes' },
      phase: 'Scale nodes',
      description: {
        vi: '8 Pod mới không vừa node hiện có; Karpenter tạo node phù hợp trong ~90 s.',
        en: '8 new Pods don’t fit current nodes; Karpenter launches fitting nodes in ~90 s.'
      },
      systemBehavior: {
        vi: 'Scheduler bind Pod khi node mới Ready.',
        en: 'The scheduler binds Pods once new nodes are Ready.'
      },
      codeLineMatch: 'stabilizationWindowSeconds: 300'
    },
    {
      id: 'burn-alert',
      title: { vi: 'Cảnh báo burn rate theo SLO', en: 'SLO burn-rate alerting' },
      phase: 'Alert',
      description: {
        vi: 'Page khi burn rate > 14,4 trên cả 1h và 5m; không page vì CPU cao.',
        en: 'Page when burn rate > 14.4 over both 1h and 5m; never page on high CPU alone.'
      },
      systemBehavior: {
        vi: 'Error budget còn lại quyết định tốc độ release tiếp theo.',
        en: 'The remaining error budget governs release velocity.'
      },
      codeLineMatch: '14.4 * 0.001'
    }
  ],

  tradeoffs: {
    pros: [
      {
        vi: 'Chi phí theo tải thực, chịu được đột biến.',
        en: 'Cost follows real load and absorbs spikes.'
      },
      {
        vi: 'Alert theo SLO ít ồn, phản ánh trải nghiệm user.',
        en: 'SLO alerts are quiet and reflect user experience.'
      }
    ],
    cons: [
      {
        vi: 'Luôn có độ trễ phản ứng; cần headroom hoặc scale theo lịch cho sự kiện biết trước.',
        en: 'Reaction always lags; keep headroom or schedule scaling for known events.'
      },
      {
        vi: 'Hạ tầng observability tốn chi phí lưu trữ đáng kể.',
        en: 'Observability infrastructure carries significant storage cost.'
      }
    ],
    balance: {
      vi: 'Target utilization thấp = nhiều headroom, an toàn nhưng tốn tiền; cao = rẻ nhưng dễ quá tải khi spike.',
      en: 'Low utilisation targets = more headroom, safe but costly; high = cheap but fragile under spikes.'
    },
    invariant: {
      vi: 'Replicas luôn nằm trong [minReplicas, maxReplicas]; page chỉ khi error budget đang bị đốt nhanh.',
      en: 'Replicas stay within [minReplicas, maxReplicas]; pages fire only when the error budget burns fast.'
    }
  },

  code: [
    {
      label: 'hpa-slo.yaml',
      filename: 'hpa-slo.yaml',
      language: 'yaml',
      code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: checkout }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: checkout }
  minReplicas: 4
  maxReplicas: 60
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 60 }   # % of CPU *request*
  behavior:
    scaleUp:   { policies: [{ type: Percent, value: 200, periodSeconds: 30 }] }
    scaleDown: { stabilizationWindowSeconds: 300 }
---
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata: { name: checkout-slo }
spec:
  groups:
    - name: checkout-availability          # SLO 99.9% -> error budget 0.001
      rules:
        - alert: CheckoutErrorBudgetFastBurn
          expr: |
            job:checkout_error_ratio:rate1h > (14.4 * 0.001)
            and
            job:checkout_error_ratio:rate5m > (14.4 * 0.001)
          labels: { severity: page }
          annotations:
            summary: "Checkout burning 2% of the 30-day error budget per hour"`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'HPA đặt target 60% CPU — 60% của cái gì?',
        en: 'An HPA targets 60% CPU — 60% of what?'
      },
      answer: {
        vi: 'Của CPU REQUEST trung bình trên các Pod, không phải của node hay limit. Pod request 500m đang dùng 450m là 90%. Không có request thì HPA không tính được utilization.',
        en: 'Of the average CPU REQUEST across Pods — not of the node or the limit. A Pod requesting 500m and using 450m is at 90%. Without requests the HPA cannot compute utilisation.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao cảnh báo burn rate cần hai cửa sổ thời gian?',
        en: 'Why do burn-rate alerts need two time windows?'
      },
      answer: {
        vi: 'Cửa sổ dài (1h) đảm bảo đã đốt đáng kể budget, tránh báo động vì spike ngắn; cửa sổ ngắn (5m) đảm bảo lỗi VẪN ĐANG xảy ra, nên alert tự tắt nhanh sau khi khắc phục thay vì kéo dài cả giờ. Kết hợp cho cả precision lẫn reset time tốt.',
        en: 'The long window (1h) ensures meaningful budget has burned, avoiding pages for brief spikes; the short window (5m) ensures the problem is STILL happening, so the alert resets quickly after a fix instead of lingering for an hour. Together they give good precision and reset time.'
      },
      proTip: {
        vi: 'Nêu ngưỡng 14,4 = tiêu 2% budget 30 ngày trong 1 giờ.',
        en: 'Quote 14.4 = spending 2% of a 30-day budget in 1 hour.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Flash sale: HPA scale nhưng checkout vẫn sập',
      en: 'Flash sale: HPA scaled but checkout still fell over'
    },
    businessContext: {
      vi: 'Sàn TMĐT chạy flash sale 0h, traffic tăng 10× trong 90 giây.',
      en: 'A marketplace midnight flash sale, traffic up 10× in 90 seconds.'
    },
    problemDescription: {
      vi: 'HPA quyết định lên 40 Pod nhưng 28 Pod Pending vì hết node; node mới mất 3 phút; Pod Java cần thêm 45 s warm-up. 5 phút đầu tỉ lệ lỗi 35%.',
      en: 'HPA decided on 40 Pods but 28 stayed Pending for lack of nodes; new nodes took 3 minutes; Java Pods needed another 45 s to warm up. Error rate was 35% for the first 5 minutes.'
    },
    whyNaiveFails: {
      vi: 'Autoscaling phản ứng sau khi tải đến; tổng độ trễ scrape + HPA + node + startup lớn hơn thời gian tải tăng.',
      en: 'Autoscaling reacts after load arrives; scrape + HPA + node + startup latency exceeded the ramp time.'
    },
    coreSolution: {
      vi: 'Scale theo lịch (KEDA cron) lên 30 Pod lúc 23h50, overprovisioning bằng Pod "placeholder" priority thấp giữ sẵn node, CRaC/AppCDS giảm warm-up, và SLO burn-rate alert thay cho alert CPU.',
      en: 'Scheduled scaling (KEDA cron) to 30 Pods at 23:50, low-priority “placeholder” Pods to keep spare nodes, CRaC/AppCDS to cut warm-up, and SLO burn-rate alerts instead of CPU alerts.'
    },
    architectureImpact: {
      vi: 'Lỗi trong flash sale kế tiếp < 0,1%, chi phí thêm ~2 giờ node dư mỗi sự kiện.',
      en: 'Errors in the next flash sale < 0.1%, at ~2 extra node-hours per event.'
    }
  },

  researchCitations: [DEVOPS_CITATIONS.hpa, DEVOPS_CITATIONS.sreWorkbook]
};
