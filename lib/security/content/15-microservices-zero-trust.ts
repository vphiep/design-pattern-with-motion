import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const microservicesZeroTrustTopic: SecurityTopic = {
  id: 'microservices-zero-trust',
  roadmapId: 'SEC-15',
  category: 'sec-enterprise',
  level: 'advanced',
  chapter: 'Cấp độ 5',
  name: 'Microservices Security & Zero Trust',
  tagline: {
    vi: 'Gateway xác thực ở biên nhưng mỗi service vẫn tự phân quyền; Token Exchange (RFC 8693) thu hẹp audience, mTLS + danh tính SPIFFE cho service-to-service, AuthorizationPolicy theo workload, default deny, network segmentation và DPoP — để một service bị chiếm không đi được khắp hệ thống.',
    en: 'The gateway authenticates at the edge but every service still authorises; Token Exchange (RFC 8693) narrows audiences, mTLS + SPIFFE identity secures service-to-service calls, per-workload AuthorizationPolicies, default deny, network segmentation and DPoP — so one compromised service cannot roam the system.'
  },
  difficulty: 3,
  order: 15,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Hệ thống 40 service: gateway kiểm tra JWT rồi mọi thứ phía sau "tin nhau" — service gọi nhau bằng HTTP thuần, chuyển tiếp nguyên token user có scope rộng, và mạng phẳng cho phép mọi pod gọi mọi pod. Một lỗ hổng RCE trong service reviews ít quan trọng là đủ để gọi thẳng payments và đọc database đơn hàng.',
      en: 'A 40-service system: the gateway checks the JWT and everything behind it "trusts each other" — services call each other over plain HTTP, forward the raw broad-scope user token, and a flat network lets every pod reach every pod. An RCE in the unimportant reviews service is enough to call payments directly and read the orders database.'
    },
    hardwareConstraint: {
      vi: 'Vị trí mạng không còn là danh tính: IP pod thay đổi liên tục, autoscaling tạo và xoá workload mỗi phút, và một mạng nội bộ đủ lớn chắc chắn có máy bị chiếm. Mỗi hop thêm vào chuỗi gọi là một chỗ token có thể bị lạm dụng.',
      en: 'Network location is no longer identity: pod IPs change constantly, autoscaling creates and removes workloads every minute, and any large enough internal network certainly contains a compromised host. Every hop in the call chain is another place a token can be abused.'
    },
    fundamentalSolution: {
      vi: 'Zero Trust (NIST SP 800-207): không tin vì vị trí mạng; mọi truy cập được xác thực và phân quyền theo từng request, dựa trên danh tính và policy động. Áp vào microservices: gateway xác thực người dùng ở biên; mỗi service vẫn tự kiểm tra quyền (OWASP: gateway bổ sung chứ không thay thế). Service xác thực nhau bằng mTLS với danh tính workload ngắn hạn (SPIFFE ID); AuthorizationPolicy chỉ cho phép đúng cặp caller → callee và method/path cần thiết, còn lại default deny. Khi gọi tiếp, đổi token user lấy token có audience và scope hẹp (Token Exchange) thay vì chuyển tiếp nguyên token. NetworkPolicy phân đoạn mạng như lớp thứ hai; DPoP/mTLS gắn token với khoá để token bị đánh cắp vô dụng.',
      en: 'Zero Trust (NIST SP 800-207): no trust based on network location; every access is authenticated and authorised per request, based on identity and dynamic policy. Applied to microservices: the gateway authenticates the user at the edge; every service still checks permissions itself (OWASP: the gateway complements, not replaces). Services authenticate each other with mTLS and short-lived workload identities (SPIFFE IDs); AuthorizationPolicies allow only the needed caller → callee pairs and methods/paths, with default deny for the rest. On onward calls, exchange the user token for one with a narrow audience and scope (Token Exchange) instead of forwarding it as is. NetworkPolicies segment the network as a second layer; DPoP/mTLS bind tokens to keys so stolen tokens are useless.'
    },
    math: {
      formula: String.raw`\text{blast}(s) = \big|\{\, t \mid (s,t) \in E_{\text{allowed}} \,\}\big| \;\ll\; N-1 \quad (\text{flat network: } N-1)`,
      description: {
        vi: 'Bán kính ảnh hưởng của một service bị chiếm là số service nó gọi được. Mạng phẳng: N−1 (mọi service). Với default deny và allow theo cặp, chỉ còn các cạnh thật sự cần trong đồ thị gọi — thường 1–3 — và mỗi cạnh còn bị giới hạn method, path và audience của token.',
        en: 'The blast radius of a compromised service is the number of services it can call. Flat network: N−1 (all of them). With default deny and per-pair allows, only the edges the call graph actually needs remain — usually 1–3 — and each edge is further limited by method, path and token audience.'
      },
      timeComplexity: 'mTLS handshake per connection (pooled); policy check O(rules) per request',
      spaceComplexity: 'One short-lived certificate per workload, rotated automatically'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Câu hỏi trung tâm đổi từ "request có đến từ bên trong mạng không" sang "workload nào, thay mặt người dùng nào, đang làm gì, có được phép không".',
      en: 'The central question shifts from "did the request come from inside the network" to "which workload, on behalf of which user, is doing what, and is it allowed".'
    },
    deepDiveParagraphs: [
      {
        vi: 'Nguyên tắc của NIST 800-207: mọi nguồn dữ liệu và dịch vụ đều là tài nguyên; mọi giao tiếp được bảo vệ bất kể vị trí mạng; truy cập cấp theo từng phiên; quyết định dựa trên policy động (danh tính, trạng thái thiết bị/workload, ngữ cảnh); liên tục giám sát và đánh giá. Kiến trúc tách Policy Decision Point (Policy Engine + Policy Administrator) khỏi Policy Enforcement Point — trong mesh, PEP là sidecar/ztunnel, PDP là control plane với policy.',
        en: 'NIST 800-207 tenets: all data sources and services are resources; all communication is secured regardless of network location; access is granted per session; decisions follow dynamic policy (identity, device/workload state, context); assets are continuously monitored and assessed. The architecture separates the Policy Decision Point (Policy Engine + Policy Administrator) from the Policy Enforcement Point — in a mesh, the PEP is the sidecar/ztunnel and the PDP is the control plane with its policies.'
      },
      {
        vi: 'Service identity: SPIFFE gán mỗi workload một ID dạng spiffe://cluster.local/ns/shop/sa/orders, chứng minh bằng chứng chỉ X.509 ngắn hạn (SVID) do SPIRE hoặc istiod cấp và xoay tự động. mTLS STRICT từ chối mọi kết nối plaintext; AuthorizationPolicy viết theo principal (danh tính) thay vì IP. Có danh tính rồi mới nói tới phân quyền: mTLS chỉ trả lời "ai đang gọi", không trả lời "có được gọi không".',
        en: 'Service identity: SPIFFE gives each workload an ID like spiffe://cluster.local/ns/shop/sa/orders, proven by a short-lived X.509 certificate (SVID) issued and rotated automatically by SPIRE or istiod. STRICT mTLS rejects every plaintext connection; AuthorizationPolicies are written against principals (identities) rather than IPs. Identity comes first, then authorization: mTLS only answers "who is calling", not "may they call".'
      },
      {
        vi: 'Lan truyền danh tính người dùng: chuyển tiếp nguyên token user có aud rộng cho mọi service nghĩa là bất kỳ service nào cũng dùng lại được token đó ở chỗ khác. Token Exchange (RFC 8693): orders gửi subject_token (token của user) — tuỳ chọn kèm actor_token của chính nó — để nhận token aud=payments, scope tối thiểu, claim act ghi lại service đang hành động thay. Payments thấy cả user lẫn service trung gian, và token không dùng được ở nơi khác.',
        en: 'Propagating the user identity: forwarding the raw broad-audience user token to every service means any of them can replay it elsewhere. Token Exchange (RFC 8693): orders sends the subject_token (the user’s token) — optionally with its own actor_token — and receives a token with aud=payments, minimal scope and an act claim recording the acting service. Payments sees both the user and the intermediary, and the token is useless anywhere else.'
      },
      {
        vi: 'Sender-constrained token và lateral movement: DPoP (RFC 9449) buộc client ký một proof JWT cho mỗi request (htm, htu, jti, iat, hash access token) bằng khoá riêng; access token mang cnf.jkt là thumbprint của khoá đó, nên token bị đánh cắp mà thiếu khoá thì vô dụng. mTLS-bound token (RFC 8705) làm điều tương tự bằng chứng chỉ client. Kết hợp với NetworkPolicy (phân đoạn L3/L4), egress allowlist và audit log, kẻ đã chiếm một pod không đi xa được.',
        en: 'Sender-constrained tokens and lateral movement: DPoP (RFC 9449) makes the client sign a proof JWT per request (htm, htu, jti, iat, access-token hash) with its private key; the access token carries cnf.jkt, that key’s thumbprint, so a stolen token without the key is useless. mTLS-bound tokens (RFC 8705) do the same with the client certificate. Combined with NetworkPolicies (L3/L4 segmentation), egress allowlists and audit logs, an attacker who takes one pod cannot get far.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Chỉ kiểm tra JWT ở gateway; service nội bộ nhận mọi request không cần token — ai vào được mạng là gọi được.',
        en: 'Checking the JWT only at the gateway; internal services accept any request without a token — anyone on the network can call them.'
      },
      {
        vi: 'Bật mTLS nhưng không có AuthorizationPolicy: mọi workload có chứng chỉ hợp lệ đều gọi được mọi service.',
        en: 'Enabling mTLS without AuthorizationPolicies: every workload with a valid certificate can call every service.'
      },
      {
        vi: 'Một client_id "service-account" dùng chung với scope admin cho mọi job và service.',
        en: 'One shared "service-account" client_id with admin scope for every job and service.'
      },
      {
        vi: 'Để mTLS ở chế độ PERMISSIVE vĩnh viễn sau khi migrate: plaintext vẫn được chấp nhận.',
        en: 'Leaving mTLS in PERMISSIVE mode forever after the migration: plaintext is still accepted.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Các lớp Zero Trust trong một service mesh',
      en: 'Zero Trust layers in a service mesh'
    },
    description: {
      vi: 'Danh tính người dùng ở biên, danh tính workload giữa các service, policy default deny ở mỗi đích.',
      en: 'User identity at the edge, workload identity between services, default-deny policy at every destination.'
    },
    asciiDiagram: `
 client ──JWT(aud=shop-api)──► ingress gateway  [RequestAuthentication: iss, aud, exp, JWKS]
                                   │ mTLS (SVID spiffe://cluster.local/ns/shop/sa/gateway)
                                   ▼
                               orders ── token exchange ──► IdP: subject_token=user JWT, audience=payments
                                   │                        ◄── JWT aud=payments, scope=payments.charge,
                                   │ mTLS                        act={sub: orders}
                                   ▼
                               payments [AuthorizationPolicy: from sa/orders, POST /charges, aud=payments]
                                   ▲
 reviews (compromised) ──── ✗ ─────┘  no ALLOW rule → 403 (RBAC: access denied); NetworkPolicy drops it too
`,
    components: [
      {
        name: 'Ingress gateway',
        role: 'Edge authN',
        description: {
          vi: 'Xác thực JWT người dùng, rate limit, chặn request trái phép ở biên.',
          en: 'Authenticates the user JWT, rate-limits, rejects unauthorised ingress.'
        }
      },
      {
        name: 'SPIFFE / mTLS',
        role: 'Workload identity',
        description: {
          vi: 'Chứng chỉ ngắn hạn cho mỗi workload; kết nối plaintext bị từ chối.',
          en: 'Short-lived certificates per workload; plaintext connections refused.'
        }
      },
      {
        name: 'AuthorizationPolicy',
        role: 'Per-service authZ',
        description: {
          vi: 'Allow theo principal, method, path, claim; mặc định từ chối.',
          en: 'Allow by principal, method, path and claim; deny by default.'
        }
      },
      {
        name: 'Token Exchange',
        role: 'Downscoped tokens',
        description: {
          vi: 'Đổi token user lấy token audience hẹp kèm claim act.',
          en: 'Swaps the user token for a narrow-audience token with an act claim.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'edge',
      title: { vi: 'Biên: xác thực người dùng', en: 'Edge: authenticate the user' },
      phase: 'Edge',
      description: {
        vi: 'Gateway kiểm tra chữ ký JWT qua JWKS, iss, aud=shop-api và exp.',
        en: 'The gateway checks the JWT signature via JWKS, iss, aud=shop-api and exp.'
      },
      systemBehavior: {
        vi: 'Token sai → 401 ngay ở biên; nhưng các service phía sau vẫn tự phân quyền.',
        en: 'A bad token → 401 at the edge; services behind it still authorise themselves.'
      },
      codeLineMatch: 'kind: RequestAuthentication'
    },
    {
      id: 'token-exchange',
      title: { vi: 'Token Exchange cho lời gọi tiếp', en: 'Token Exchange for the onward call' },
      phase: 'Propagate',
      description: {
        vi: 'orders đổi token user lấy token aud=payments, scope payments.charge, act={sub: orders}.',
        en: 'orders swaps the user token for one with aud=payments, scope payments.charge, act={sub: orders}.'
      },
      systemBehavior: {
        vi: 'Token mới không dùng được ở service nào khác ngoài payments.',
        en: 'The new token is useless anywhere but payments.'
      },
      codeLineMatch: 'grant-type:token-exchange'
    },
    {
      id: 'mtls',
      title: { vi: 'mTLS STRICT giữa mọi service', en: 'STRICT mTLS between all services' },
      phase: 'Identity',
      description: {
        vi: 'Mỗi kết nối chứng minh danh tính workload bằng SVID ngắn hạn.',
        en: 'Every connection proves the workload identity with a short-lived SVID.'
      },
      systemBehavior: {
        vi: 'Kết nối plaintext bị từ chối; chứng chỉ xoay tự động.',
        en: 'Plaintext connections are refused; certificates rotate automatically.'
      },
      codeLineMatch: 'mode: STRICT'
    },
    {
      id: 'authz',
      title: { vi: 'Chỉ orders được gọi POST /charges', en: 'Only orders may call POST /charges' },
      phase: 'Authorize',
      description: {
        vi: 'Policy tại payments: principal sa/orders, method POST, path /charges, claim aud=payments.',
        en: 'The policy at payments: principal sa/orders, method POST, path /charges, claim aud=payments.'
      },
      systemBehavior: {
        vi: 'Sidecar/ztunnel (PEP) đánh giá policy trước khi request tới ứng dụng.',
        en: 'The sidecar/ztunnel (PEP) evaluates the policy before the request reaches the app.'
      },
      codeLineMatch: 'principals: ["cluster.local/ns/shop/sa/orders"]'
    },
    {
      id: 'contain',
      title: { vi: 'Service bị chiếm bị chặn lại', en: 'A compromised service is contained' },
      phase: 'Contain',
      description: {
        vi: 'reviews gọi payments: không có rule ALLOW nào khớp → default deny; NetworkPolicy chặn thêm ở L3/L4.',
        en: 'reviews calls payments: no ALLOW rule matches → default deny; the NetworkPolicy blocks it at L3/L4 too.'
      },
      systemBehavior: {
        vi: 'Lateral movement dừng ở cạnh đầu tiên; audit log ghi lại lần thử.',
        en: 'Lateral movement stops at the first edge; the audit log records the attempt.'
      },
      codeLineMatch: 'name: deny-all'
    }
  ],

  comparison: {
    title: { vi: 'Perimeter security vs Zero Trust', en: 'Perimeter security vs Zero Trust' },
    subtitle: {
      vi: 'Tin vị trí mạng hay tin danh tính đã kiểm chứng',
      en: 'Trusting network location vs verified identity'
    },
    options: [
      {
        name: 'Perimeter ("castle and moat")',
        tag: 'Legacy',
        role: { vi: 'Bên trong mạng là tin cậy', en: 'Inside the network is trusted' },
        keyMechanism: {
          vi: 'Firewall ở biên, VPN; service nội bộ tin IP nguồn.',
          en: 'Edge firewalls, VPNs; internal services trust source IPs.'
        },
        configExample: 'allow 10.0.0.0/8 → any',
        architectureNote: {
          vi: 'Một máy bị chiếm = toàn bộ mạng nội bộ.',
          en: 'One compromised host = the whole internal network.'
        }
      },
      {
        name: 'Zero Trust',
        tag: 'Identity-based',
        role: { vi: 'Không tin mặc định', en: 'Nothing trusted by default' },
        keyMechanism: {
          vi: 'Xác thực + phân quyền mỗi request theo danh tính người dùng và workload, policy động.',
          en: 'Authenticate + authorise every request by user and workload identity, with dynamic policy.'
        },
        configExample: 'from: sa/orders  to: POST /charges  when: aud=payments',
        architectureNote: {
          vi: 'Blast radius giới hạn ở các cạnh được phép.',
          en: 'Blast radius limited to allowed edges.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Một service bị chiếm không đi được khắp hệ thống.',
        en: 'One compromised service cannot roam the system.'
      },
      {
        vi: 'Danh tính và policy rõ ràng tạo audit trail cho mọi lời gọi.',
        en: 'Explicit identities and policies create an audit trail for every call.'
      },
      {
        vi: 'Mesh làm mTLS và xoay chứng chỉ trong suốt với ứng dụng.',
        en: 'The mesh makes mTLS and certificate rotation transparent to applications.'
      }
    ],
    cons: [
      {
        vi: 'Thêm thành phần vận hành (mesh, SPIRE, IdP) và độ trễ cho mỗi hop.',
        en: 'More operational components (mesh, SPIRE, IdP) and latency per hop.'
      },
      {
        vi: 'Policy sai có thể làm gãy luồng nghiệp vụ; cần test và rollout dần.',
        en: 'Wrong policies can break business flows; they need tests and gradual rollout.'
      }
    ],
    balance: {
      vi: 'Bắt đầu bằng mTLS PERMISSIVE để quan sát, chuyển STRICT, rồi viết AuthorizationPolicy từ đồ thị gọi thực tế và bật default deny theo từng namespace.',
      en: 'Start with PERMISSIVE mTLS to observe, move to STRICT, then write AuthorizationPolicies from the observed call graph and enable default deny namespace by namespace.'
    },
    invariant: {
      vi: 'Không request nào được chấp nhận chỉ vì nó đến từ bên trong mạng.',
      en: 'No request is accepted merely because it comes from inside the network.'
    }
  },

  code: [
    {
      label: 'zero-trust.yaml',
      filename: 'zero-trust.yaml',
      language: 'yaml',
      code: `# 1) Edge: validate the user's JWT at the ingress gateway
apiVersion: security.istio.io/v1
kind: RequestAuthentication
metadata: { name: user-jwt, namespace: shop }
spec:
  jwtRules:
  - issuer: https://idp.example.com/realms/shop
    jwksUri: https://idp.example.com/realms/shop/protocol/openid-connect/certs
    audiences: ["shop-api"]
# 2) orders exchanges the user token before calling payments (RFC 8693):
#    POST /realms/shop/protocol/openid-connect/token
#    grant_type=urn:ietf:params:oauth:grant-type:token-exchange
#    &subject_token=<user JWT>&audience=payments&scope=payments.charge
---
# 3) Workload identity: mTLS everywhere, plaintext refused
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata: { name: default, namespace: shop }
spec:
  mtls:
    mode: STRICT
---
# 4) Least privilege: only orders may POST /charges, with a payments-scoped token
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: payments-allow-orders, namespace: shop }
spec:
  selector: { matchLabels: { app: payments } }
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/shop/sa/orders"]
    to:
    - operation: { methods: ["POST"], paths: ["/charges"] }
    when:
    - key: request.auth.claims[aud]
      values: ["payments"]
---
# 5) Default deny for the namespace: an empty spec allows nothing
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: deny-all, namespace: shop }
spec: {}`
    },
    {
      label: 'network-policy.yaml',
      filename: 'network-policy.yaml',
      language: 'yaml',
      code: `# Second layer at L3/L4: payments accepts traffic only from orders pods
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: payments-ingress, namespace: shop }
spec:
  podSelector: { matchLabels: { app: payments } }
  policyTypes: ["Ingress"]
  ingress:
  - from:
    - podSelector: { matchLabels: { app: orders } }
    ports:
    - { protocol: TCP, port: 8080 }`
    },
    {
      label: 'dpop.http',
      filename: 'dpop.http',
      language: 'bash',
      code: `### Sender-constrained access token (RFC 9449): the proof is signed per request
GET https://api.example.com/charges/77
Authorization: DPoP eyJhbGciOiJFUzI1NiIs…          # access token with cnf.jkt = key thumbprint
DPoP: eyJ0eXAiOiJkcG9wK2p3dCIsImFsZyI6IkVTMjU2Iiwiandr…
#  proof claims: { htm: "GET", htu: "https://api.example.com/charges/77",
#                  iat: 1798886400, jti: "e1j3V_bKic8-LAEB", ath: base64url(sha256(access_token)) }`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Gateway đã kiểm tra JWT rồi, vì sao service phía sau vẫn phải kiểm tra quyền?',
        en: 'The gateway already validated the JWT — why must the services behind it still check permissions?'
      },
      answer: {
        vi: 'Gateway chỉ biết request đã xác thực và có thể kiểm tra quyền thô. Quyền chi tiết cần ngữ cảnh nghiệp vụ (order này có thuộc user không) chỉ service mới biết. Ngoài ra kẻ tấn công trong mạng có thể đi vòng qua gateway. OWASP: gateway bổ sung chứ không chứng minh được lời gọi phía sau là hợp lệ.',
        en: 'The gateway only knows the request is authenticated and can check coarse rights. Fine-grained rights need business context (does this order belong to the user) that only the service has. Also, an attacker inside the network can bypass the gateway. OWASP: the gateway complements, it does not establish that a downstream operation is authorised.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Đã có mTLS thì còn cần JWT giữa các service không?',
        en: 'With mTLS in place, do you still need JWTs between services?'
      },
      answer: {
        vi: 'Có, chúng trả lời hai câu hỏi khác nhau. mTLS chứng minh WORKLOAD nào đang gọi (orders). JWT mang ngữ cảnh NGƯỜI DÙNG và quyền của họ (user 42, scope payments.charge). Policy tốt kết hợp cả hai: principal phải là orders VÀ token phải có aud=payments; Token Exchange giữ token hẹp ở mỗi hop.',
        en: 'Yes — they answer different questions. mTLS proves which WORKLOAD is calling (orders). The JWT carries the END-USER context and their rights (user 42, scope payments.charge). A good policy combines both: the principal must be orders AND the token must have aud=payments; Token Exchange keeps tokens narrow at each hop.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        vi: 'Bạn triển khai default deny cho 40 service đang chạy production thế nào mà không gây sự cố?',
        en: 'How do you roll out default deny across 40 production services without an outage?'
      },
      answer: {
        vi: 'Quan sát trước: bật mTLS PERMISSIVE và telemetry để có đồ thị gọi thật. Sinh AuthorizationPolicy ALLOW từ đồ thị đó, chạy ở chế độ audit/dry-run (Istio hỗ trợ action AUDIT và annotation dry-run) để xem request nào sẽ bị chặn. Chuyển STRICT và bật deny-all theo từng namespace, có cảnh báo 403 tăng đột biến và đường rollback bằng GitOps.',
        en: 'Observe first: enable PERMISSIVE mTLS and telemetry to capture the real call graph. Generate ALLOW AuthorizationPolicies from it and run them in audit/dry-run mode (Istio supports the AUDIT action and a dry-run annotation) to see what would be blocked. Then switch to STRICT and enable deny-all namespace by namespace, with alerts on 403 spikes and a GitOps rollback path.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'RCE ở service phụ dẫn tới gọi thẳng payments',
      en: 'An RCE in a minor service leads to direct payments calls'
    },
    businessContext: {
      vi: 'Nền tảng thương mại điện tử với gateway kiểm tra JWT, các service nội bộ không xác thực nhau.',
      en: 'An e-commerce platform whose gateway checks JWTs while internal services do not authenticate each other.'
    },
    problemDescription: {
      vi: 'Lỗ hổng deserialization trong reviews cho kẻ tấn công shell trong pod. Từ đó chúng gọi http://payments:8080/refunds trực tiếp và hoàn tiền vào thẻ của mình.',
      en: 'A deserialization bug in reviews gave the attacker a shell in the pod. From there they called http://payments:8080/refunds directly and refunded money to their own card.'
    },
    whyNaiveFails: {
      vi: 'payments tin mọi request trong cluster; mạng phẳng; không có danh tính workload nào để phân biệt reviews với orders.',
      en: 'payments trusted every in-cluster request; the network was flat; there was no workload identity to tell reviews from orders.'
    },
    coreSolution: {
      vi: 'mTLS STRICT, AuthorizationPolicy chỉ cho orders gọi /charges và chỉ cho refund-service gọi /refunds kèm token aud=payments có scope refunds.write, deny-all mặc định, NetworkPolicy, và cảnh báo khi xuất hiện 403 từ principal lạ.',
      en: 'STRICT mTLS, AuthorizationPolicies letting only orders call /charges and only refund-service call /refunds with an aud=payments token holding refunds.write, default deny-all, NetworkPolicies, and alerts on 403s from unexpected principals.'
    },
    architectureImpact: {
      vi: 'Pod bị chiếm chỉ còn gọi được những gì reviews thật sự cần; lần thử gọi payments để lại dấu vết trong audit log.',
      en: 'A compromised pod can only call what reviews genuinely needs; attempts to call payments leave an audit trail.'
    }
  },

  researchCitations: [
    SECURITY_CITATIONS.nist800207,
    SECURITY_CITATIONS.owaspMicroservices,
    SECURITY_CITATIONS.rfc8693,
    SECURITY_CITATIONS.spiffe,
    SECURITY_CITATIONS.dpop
  ]
};
