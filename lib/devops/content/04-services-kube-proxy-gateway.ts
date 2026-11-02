import type { DevopsTopic } from '../types';
import { DEVOPS_CITATIONS } from '../citations';

export const servicesKubeProxyGatewayTopic: DevopsTopic = {
  id: 'services-kube-proxy-gateway',
  category: 'kubernetes-core',
  level: 'advanced',
  chapter: 'Chương 02',
  name: 'Services, kube-proxy, EndpointSlices & Gateway API',
  tagline: {
    vi: 'ClusterIP là IP ảo, CoreDNS phân giải tên Service, EndpointSlice chỉ chứa Pod Ready, kube-proxy DNAT bằng iptables/IPVS/nftables, và traffic từ ngoài vào qua Ingress/Gateway API.',
    en: 'ClusterIP is a virtual IP, CoreDNS resolves Service names, EndpointSlices hold only Ready Pods, kube-proxy DNATs via iptables/IPVS/nftables, and external traffic enters through Ingress/Gateway API.'
  },
  difficulty: 3,
  order: 4,
  estimatedMinutes: 24,

  coreTheory: {
    problemStatement: {
      vi: 'Pod sống ngắn: mỗi lần deploy, autoscale hay reschedule, IP Pod đổi. Client không thể giữ danh sách IP; load balancer bên ngoài không biết Pod nào đang Ready. Và mỗi team muốn tự định tuyến HTTP mà không cần quyền sửa load balancer chung.',
      en: 'Pods are ephemeral: every deploy, autoscale or reschedule changes Pod IPs. Clients can’t hold IP lists; external load balancers don’t know which Pods are Ready. And each team wants its own HTTP routing without editing a shared load balancer.'
    },
    hardwareConstraint: {
      vi: 'Không có thiết bị load balancer ở mỗi node; chuyển tiếp phải nằm trong kernel để tránh copy qua userspace. Với hàng chục nghìn Service, danh sách rule iptables tuyến tính trở thành nút cổ chai.',
      en: 'There is no LB appliance per node; forwarding must live in the kernel to avoid userspace copies. With tens of thousands of Services, linear iptables rule lists become a bottleneck.'
    },
    fundamentalSolution: {
      vi: 'Service có ClusterIP ổn định (IP ảo không gắn interface nào) và tên DNS my-svc.ns.svc.cluster.local. EndpointSlice controller theo dõi Pod khớp selector và Ready. kube-proxy trên mỗi node watch Service + EndpointSlice và lập trình kernel: iptables (chuỗi KUBE-SVC chọn ngẫu nhiên một KUBE-SEP rồi DNAT), IPVS (bảng hash, nhiều thuật toán) hoặc nftables. Traffic ngoài vào: LoadBalancer/NodePort, và L7 qua Ingress hoặc Gateway API (Gateway do platform quản lý, HTTPRoute do team ứng dụng quản lý).',
      en: 'A Service has a stable ClusterIP (a virtual IP bound to no interface) and a DNS name my-svc.ns.svc.cluster.local. The EndpointSlice controller tracks Pods matching the selector and Ready. kube-proxy on every node watches Services + EndpointSlices and programs the kernel: iptables (a KUBE-SVC chain randomly picks a KUBE-SEP then DNATs), IPVS (hash tables, several algorithms) or nftables. External traffic enters via LoadBalancer/NodePort, and L7 via Ingress or Gateway API (Gateways owned by the platform, HTTPRoutes by app teams).'
    },
    math: {
      formula: String.raw`P(\text{rule}_i \text{ matches}) = \frac{1}{n - i + 1} \;\Rightarrow\; P(\text{endpoint}_i) = \prod_{j<i}\Big(1 - \frac{1}{n-j+1}\Big)\cdot\frac{1}{n-i+1} = \frac{1}{n}`,
      description: {
        vi: 'iptables duyệt rule tuần tự; rule thứ i dùng --probability 1/(n−i+1) nên mỗi endpoint được chọn đúng 1/n. Đổi lại độ phức tạp tuyến tính theo số endpoint — lý do IPVS/nftables (tra bảng băm/map O(1)) được ưa chuộng ở cluster lớn.',
        en: 'iptables walks rules sequentially; rule i uses --probability 1/(n−i+1), so every endpoint is chosen with exactly 1/n. The cost is linear in endpoints — why IPVS/nftables (O(1) hash/map lookups) are preferred in large clusters.'
      },
      timeComplexity: 'iptables O(n) per new connection · IPVS/nftables O(1)',
      spaceComplexity: 'O(services × endpoints) rules per node'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Service là trừu tượng L4 (TCP/UDP); định tuyến theo host/path/header là việc của L7 (Ingress, Gateway API, service mesh).',
      en: 'A Service is an L4 (TCP/UDP) abstraction; host/path/header routing is L7’s job (Ingress, Gateway API, service mesh).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Cân bằng tải của kube-proxy là theo KẾT NỐI, không theo request. Client HTTP/2 hoặc gRPC giữ một kết nối lâu dài sẽ dồn mọi request vào một Pod — cần load balancing phía client (gRPC xds, headless Service) hoặc mesh/L7 proxy.',
        en: 'kube-proxy balances per CONNECTION, not per request. HTTP/2 or gRPC clients holding one long-lived connection send every request to one Pod — use client-side balancing (gRPC xDS, headless Services) or a mesh/L7 proxy.'
      },
      {
        vi: 'Gateway API (GA từ v1.0, 2023) tách vai trò: GatewayClass (nhà cung cấp), Gateway (listener, TLS — team platform), HTTPRoute (rule host/path/header, trọng số backend — team ứng dụng). Chia traffic theo weight là chuẩn trong spec, không phụ thuộc annotation riêng của từng controller như Ingress.',
        en: 'Gateway API (GA since v1.0, 2023) separates roles: GatewayClass (provider), Gateway (listeners, TLS — platform team), HTTPRoute (host/path/header rules, backend weights — app team). Weighted splitting is part of the spec rather than per-controller Ingress annotations.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Selector Service gõ sai label → EndpointSlice rỗng → "connection refused" dù Pod chạy bình thường.',
        en: 'A mistyped Service selector → empty EndpointSlice → “connection refused” although Pods are fine.'
      },
      {
        vi: 'externalTrafficPolicy: Cluster làm mất IP nguồn của client (SNAT) — dùng Local nếu cần IP thật.',
        en: 'externalTrafficPolicy: Cluster loses the client source IP (SNAT) — use Local when you need it.'
      },
      {
        vi: 'gRPC qua ClusterIP thường: một Pod nóng 100% CPU, các Pod khác rảnh.',
        en: 'gRPC over a plain ClusterIP: one Pod at 100% CPU, the others idle.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Từ tên DNS tới Pod IP', en: 'From a DNS name to a Pod IP' },
    description: {
      vi: 'DNS trả ClusterIP; kernel trên node nguồn DNAT tới một endpoint Ready.',
      en: 'DNS returns the ClusterIP; the source node’s kernel DNATs to a Ready endpoint.'
    },
    asciiDiagram: `
 checkout Pod: GET http://orders.shop.svc.cluster.local/api
   │ CoreDNS → A 10.96.41.7 (ClusterIP, bound to no NIC)
   ▼
 node kernel (programmed by kube-proxy)
   KUBE-SERVICES  -d 10.96.41.7 --dport 80 → KUBE-SVC-ORDERS
   KUBE-SVC-ORDERS
     -m statistic --probability 0.333 → KUBE-SEP-A  DNAT 10.244.1.12:8080
     -m statistic --probability 0.500 → KUBE-SEP-B  DNAT 10.244.2.31:8080
                                      → KUBE-SEP-C  DNAT 10.244.3.17:8080
   EndpointSlice orders-x7k: [10.244.1.12 ready, 10.244.2.31 ready, 10.244.3.17 ready, 10.244.3.20 NOT ready]

 Internet → LB → Gateway (listener :443, TLS) → HTTPRoute shop.example.com/orders → Service orders
`,
    components: [
      {
        name: 'ClusterIP',
        role: 'Virtual IP',
        description: {
          vi: 'Địa chỉ ổn định, chỉ tồn tại trong rule kernel.',
          en: 'A stable address that exists only in kernel rules.'
        }
      },
      {
        name: 'EndpointSlice',
        role: 'Ready backends',
        description: {
          vi: 'Tối đa 100 endpoint/slice, có điều kiện ready/serving/terminating.',
          en: 'Up to 100 endpoints per slice with ready/serving/terminating conditions.'
        }
      },
      {
        name: 'kube-proxy',
        role: 'Rule programmer',
        description: {
          vi: 'iptables, IPVS hoặc nftables mode.',
          en: 'iptables, IPVS or nftables mode.'
        }
      },
      {
        name: 'HTTPRoute',
        role: 'L7 routing',
        description: {
          vi: 'Rule host/path/header và trọng số backend.',
          en: 'Host/path/header rules and backend weights.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'dns',
      title: { vi: 'CoreDNS trả về ClusterIP', en: 'CoreDNS returns the ClusterIP' },
      phase: 'Resolve',
      description: {
        vi: 'orders.shop.svc.cluster.local → 10.96.41.7, IP ảo ổn định suốt vòng đời Service.',
        en: 'orders.shop.svc.cluster.local → 10.96.41.7, a virtual IP stable for the Service’s lifetime.'
      },
      systemBehavior: {
        vi: 'Headless Service (clusterIP: None) trả thẳng các Pod IP thay vì VIP.',
        en: 'A headless Service (clusterIP: None) returns Pod IPs directly instead of a VIP.'
      },
      codeLineMatch: 'kind: Service'
    },
    {
      id: 'endpoints',
      title: { vi: 'EndpointSlice chỉ giữ Pod Ready', en: 'EndpointSlice keeps only Ready Pods' },
      phase: 'Track',
      description: {
        vi: 'Controller chọn Pod theo selector; Pod fail readiness bị đánh dấu không ready.',
        en: 'The controller selects Pods by label; Pods failing readiness are marked not ready.'
      },
      systemBehavior: {
        vi: 'kube-proxy trên mọi node nhận cập nhật qua watch.',
        en: 'kube-proxy on every node receives updates via watch.'
      },
      codeLineMatch: 'selector: { app: orders }'
    },
    {
      id: 'dnat',
      title: { vi: 'kube-proxy DNAT tới một endpoint', en: 'kube-proxy DNATs to one endpoint' },
      phase: 'Forward',
      description: {
        vi: 'Kết nối mới chọn ngẫu nhiên đều 1/n endpoint; conntrack giữ lựa chọn cho cả kết nối.',
        en: 'New connections pick an endpoint uniformly (1/n); conntrack pins the choice for the connection.'
      },
      systemBehavior: {
        vi: 'Không có proxy userspace — chỉ rule kernel trên node nguồn.',
        en: 'No userspace proxy — only kernel rules on the source node.'
      },
      codeLineMatch: 'mode: nftables'
    },
    {
      id: 'gateway',
      title: { vi: 'Traffic ngoài vào qua Gateway API', en: 'External traffic via Gateway API' },
      phase: 'Ingress',
      description: {
        vi: 'Gateway kết thúc TLS, HTTPRoute định tuyến host/path tới Service theo trọng số.',
        en: 'The Gateway terminates TLS, the HTTPRoute routes host/path to Services by weight.'
      },
      systemBehavior: {
        vi: 'Team ứng dụng sửa HTTPRoute mà không đụng Gateway chung.',
        en: 'App teams edit HTTPRoutes without touching the shared Gateway.'
      },
      codeLineMatch: 'kind: HTTPRoute'
    }
  ],

  tradeoffs: {
    pros: [
      {
        vi: 'Tên và IP ổn định bất chấp Pod thay đổi.',
        en: 'Stable names and IPs regardless of Pod churn.'
      },
      {
        vi: 'Chuyển tiếp trong kernel, không thêm hop proxy.',
        en: 'In-kernel forwarding, no extra proxy hop.'
      }
    ],
    cons: [
      {
        vi: 'Cân bằng theo kết nối, không theo request.',
        en: 'Per-connection, not per-request, balancing.'
      },
      {
        vi: 'iptables mode chậm dần với số Service lớn.',
        en: 'iptables mode degrades with many Services.'
      }
    ],
    balance: {
      vi: 'L4 trong kernel nhanh và đơn giản; L7 (Gateway/mesh) linh hoạt và thông minh hơn nhưng thêm hop và tài nguyên.',
      en: 'In-kernel L4 is fast and simple; L7 (Gateway/mesh) is more flexible and smarter but adds a hop and resources.'
    },
    invariant: {
      vi: 'Traffic tới ClusterIP chỉ được DNAT tới endpoint đang Ready (trừ khi publishNotReadyAddresses).',
      en: 'Traffic to a ClusterIP is only DNATed to Ready endpoints (unless publishNotReadyAddresses).'
    }
  },

  code: [
    {
      label: 'service-gateway.yaml',
      filename: 'service-gateway.yaml',
      language: 'yaml',
      code: `apiVersion: v1
kind: Service
metadata: { name: orders, namespace: shop }
spec:
  selector: { app: orders }          # EndpointSlice controller tracks Ready Pods with this label
  ports: [{ port: 80, targetPort: 8080 }]
---
# kube-proxy configuration (KubeProxyConfiguration)
#   mode: nftables                   # or ipvs / iptables
---
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata: { name: orders, namespace: shop }
spec:
  parentRefs: [{ name: public-gw, namespace: infra }]   # Gateway owned by the platform team
  hostnames: ["shop.example.com"]
  rules:
    - matches: [{ path: { type: PathPrefix, value: /orders } }]
      backendRefs:
        - { name: orders, port: 80, weight: 100 }`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'ping ClusterIP không trả lời nhưng curl thì được. Vì sao?',
        en: 'Pinging a ClusterIP gets no reply but curl works. Why?'
      },
      answer: {
        vi: 'ClusterIP không gắn với interface nào; nó chỉ tồn tại trong rule DNAT cho port/protocol đã khai báo (TCP 80). ICMP không khớp rule nào nên không ai trả lời (ở mode IPVS, VIP được gắn vào kube-ipvs0 nên ping có thể trả lời).',
        en: 'A ClusterIP is bound to no interface; it exists only in DNAT rules for the declared port/protocol (TCP 80). ICMP matches no rule, so nothing answers (in IPVS mode the VIP sits on kube-ipvs0, so ping may answer).'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Service gRPC có 10 Pod nhưng chỉ một Pod nhận tải. Xử lý thế nào?',
        en: 'A gRPC Service has 10 Pods but only one receives load. How do you fix it?'
      },
      answer: {
        vi: 'kube-proxy cân bằng theo kết nối TCP; gRPC multiplex mọi request trên một kết nối HTTP/2 lâu dài. Giải pháp: headless Service + client-side round robin (gRPC dns resolver), xDS/proxyless mesh, hoặc L7 proxy (Envoy/mesh) cân bằng theo request; thêm max connection age phía server để buộc kết nối xoay vòng.',
        en: 'kube-proxy balances TCP connections; gRPC multiplexes all requests over one long-lived HTTP/2 connection. Fixes: a headless Service + client-side round robin (gRPC DNS resolver), xDS/proxyless mesh, or an L7 proxy (Envoy/mesh) balancing per request; add a server max connection age to force reconnects.'
      }
    }
  ],

  researchCitations: [DEVOPS_CITATIONS.k8sServices, DEVOPS_CITATIONS.gatewayApi]
};
