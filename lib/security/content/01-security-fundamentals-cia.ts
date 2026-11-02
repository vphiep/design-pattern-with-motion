import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const securityFundamentalsCiaTopic: SecurityTopic = {
  id: 'security-fundamentals-cia',
  roadmapId: 'SEC-01',
  category: 'sec-fundamentals',
  level: 'beginner',
  chapter: 'Cấp độ 1',
  name: 'Information Security Fundamentals & CIA Triad',
  tagline: {
    vi: 'Confidentiality, Integrity, Availability; Authentication vs Authorization vs Accounting; least privilege, defense in depth, attack surface, trust boundary và threat modeling bằng STRIDE.',
    en: 'Confidentiality, Integrity, Availability; Authentication vs Authorization vs Accounting; least privilege, defence in depth, attack surface, trust boundaries and threat modeling with STRIDE.'
  },
  difficulty: 1,
  order: 1,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      vi: 'Team thêm bảo mật theo kiểu "vá chỗ nào thấy lỗi": bật HTTPS, thêm một bộ lọc XSS, cài WAF. Nhưng không ai trả lời được hệ thống cần bảo vệ cái gì, khỏi ai, và chỗ nào dữ liệu đi qua ranh giới tin cậy — nên lỗ hổng nằm đúng ở nơi không ai nghĩ tới, như một endpoint admin nội bộ không kiểm tra quyền.',
      en: 'The team adds security "wherever a bug shows up": turn on HTTPS, add an XSS filter, install a WAF. But nobody can say what the system must protect, from whom, and where data crosses a trust boundary — so the hole sits exactly where nobody looked, such as an internal admin endpoint with no permission check.'
    },
    hardwareConstraint: {
      vi: 'Ngân sách bảo mật hữu hạn còn bề mặt tấn công thì lớn dần theo mỗi endpoint, dependency và tích hợp. Không có lớp phòng thủ nào hoàn hảo: mọi kiểm soát đều có xác suất bị vượt qua.',
      en: 'Security budgets are finite while the attack surface grows with every endpoint, dependency and integration. No defence is perfect: every control has some probability of being bypassed.'
    },
    fundamentalSolution: {
      vi: 'Bắt đầu từ mục tiêu: mỗi tài sản cần Confidentiality (chỉ người được phép đọc), Integrity (không bị sửa trái phép) và Availability (sẵn sàng khi cần) ở mức nào. Tách rõ AAA: Authentication xác định danh tính, Authorization quyết định quyền, Accounting ghi lại ai đã làm gì. Vẽ luồng dữ liệu và trust boundary, rồi dùng STRIDE để liệt kê mối đe doạ tại mỗi điểm vượt ranh giới. Kiểm soát được đặt theo least privilege và defense in depth: nhiều lớp độc lập, mặc định từ chối.',
      en: 'Start from goals: how much Confidentiality (only authorised readers), Integrity (no unauthorised changes) and Availability (there when needed) each asset requires. Separate AAA: Authentication establishes identity, Authorization decides permissions, Accounting records who did what. Draw the data flows and trust boundaries, then use STRIDE to enumerate threats wherever data crosses a boundary. Place controls by least privilege and defence in depth: several independent layers, deny by default.'
    },
    math: {
      formula: String.raw`\text{Risk} = \text{Likelihood} \times \text{Impact}, \qquad P(\text{breach}) = \prod_{i=1}^{n} p_{\text{bypass},\,i}`,
      description: {
        vi: 'Rủi ro được ưu tiên theo khả năng xảy ra nhân mức ảnh hưởng. Với n lớp phòng thủ độc lập, xác suất kẻ tấn công vượt qua tất cả là tích các xác suất vượt từng lớp: ba lớp, mỗi lớp bị vượt 10% thì chỉ còn 0,1%. Điều kiện quan trọng là các lớp phải độc lập — cùng một lỗi cấu hình làm hỏng cả ba lớp thì phép nhân không còn đúng.',
        en: 'Risks are prioritised by likelihood times impact. With n independent defensive layers, the chance an attacker passes them all is the product of per-layer bypass probabilities: three layers each bypassed 10% of the time leave 0.1%. The key condition is independence — one misconfiguration breaking all three layers voids the product.'
      },
      timeComplexity: 'Threat model: O(data flows × STRIDE categories)',
      spaceComplexity: 'One living document per system, updated with each design change'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Bài này là bộ từ vựng cho cả khoá: mọi cơ chế phía sau (TLS, OAuth, CSP, mTLS) đều phục vụ một hoặc nhiều thuộc tính CIA tại một trust boundary cụ thể.',
      en: 'This lesson is the vocabulary for the whole course: every later mechanism (TLS, OAuth, CSP, mTLS) serves one or more CIA properties at a specific trust boundary.'
    },
    deepDiveParagraphs: [
      {
        vi: 'CIA trong thực tế: Confidentiality được bảo vệ bằng mã hoá và kiểm soát truy cập; Integrity bằng hash, MAC, chữ ký số và kiểm tra quyền ghi; Availability bằng dư thừa, rate limiting, backup. Ba thuộc tính có thể xung đột: mã hoá toàn bộ log tăng Confidentiality nhưng khi mất khoá thì mất luôn Availability của dữ liệu.',
        en: 'CIA in practice: Confidentiality is protected by encryption and access control; Integrity by hashes, MACs, digital signatures and write-permission checks; Availability by redundancy, rate limiting and backups. The properties can conflict: encrypting all logs raises Confidentiality, but losing the key also loses the data’s Availability.'
      },
      {
        vi: 'AAA: Authentication (bạn là ai — mật khẩu, passkey, certificate) phải đi trước Authorization (bạn được làm gì — role, attribute, relationship). Accounting (audit log) giúp phát hiện và truy vết, và tạo non-repudiation khi kết hợp chữ ký. Lỗi kinh điển là nhầm hai cái đầu: "đã đăng nhập" không có nghĩa "được phép xem đơn hàng này".',
        en: 'AAA: Authentication (who you are — password, passkey, certificate) must precede Authorization (what you may do — roles, attributes, relationships). Accounting (audit logs) enables detection and forensics, and with signatures provides non-repudiation. The classic bug confuses the first two: "logged in" does not mean "allowed to see this order".'
      },
      {
        vi: 'Attack surface là tổng mọi điểm kẻ tấn công có thể tương tác: endpoint, cổng mở, file upload, dependency, người dùng nội bộ. Trust boundary là nơi dữ liệu đi từ vùng ít tin cậy sang vùng tin cậy hơn (Internet → API gateway → service → database). Mọi input vượt boundary phải được xác thực, kiểm tra quyền và validate; mọi output phải được encode cho ngữ cảnh đích.',
        en: 'The attack surface is every point an attacker can interact with: endpoints, open ports, file uploads, dependencies, insiders. A trust boundary is where data moves from a less trusted zone to a more trusted one (Internet → API gateway → service → database). Every input crossing a boundary must be authenticated, authorised and validated; every output must be encoded for its destination context.'
      },
      {
        vi: 'Threat modeling trả lời bốn câu hỏi: ta đang xây gì, điều gì có thể sai, ta sẽ làm gì với nó, và ta đã làm đủ tốt chưa. STRIDE ánh xạ mỗi loại mối đe doạ vào một thuộc tính bị vi phạm: Spoofing ↔ authentication, Tampering ↔ integrity, Repudiation ↔ non-repudiation, Information disclosure ↔ confidentiality, Denial of service ↔ availability, Elevation of privilege ↔ authorization. Security by Design nghĩa là làm việc này lúc thiết kế, khi sửa còn rẻ.',
        en: 'Threat modeling answers four questions: what are we working on, what can go wrong, what are we going to do about it, and did we do a good job. STRIDE maps each threat type to the property it violates: Spoofing ↔ authentication, Tampering ↔ integrity, Repudiation ↔ non-repudiation, Information disclosure ↔ confidentiality, Denial of service ↔ availability, Elevation of privilege ↔ authorization. Security by Design means doing this at design time, while fixes are cheap.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Tin "mạng nội bộ là an toàn": service nội bộ không xác thực, nên một máy bị chiếm là đủ đi khắp hệ thống.',
        en: 'Trusting "the internal network is safe": internal services skip authentication, so one compromised host is enough to roam the whole system.'
      },
      {
        vi: 'Chỉ kiểm tra quyền ở giao diện (ẩn nút) mà không kiểm tra ở server.',
        en: 'Checking permissions only in the UI (hiding buttons) and not on the server.'
      },
      {
        vi: 'Không có audit log cho thao tác nhạy cảm: khi sự cố xảy ra không trả lời được ai đã làm gì, lúc nào.',
        en: 'No audit log for sensitive actions: after an incident nobody can say who did what, and when.'
      },
      {
        vi: 'Service account dùng chung có quyền admin cho "tiện": một credential bị lộ là mất toàn bộ.',
        en: 'A shared admin-level service account "for convenience": one leaked credential loses everything.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Trust boundary của một ứng dụng web',
      en: 'Trust boundaries of a web application'
    },
    description: {
      vi: 'Mỗi đường đứt nét là một ranh giới tin cậy; STRIDE được áp dụng tại mỗi điểm dữ liệu đi qua.',
      en: 'Each dashed line is a trust boundary; STRIDE is applied wherever data crosses one.'
    },
    asciiDiagram: `
   UNTRUSTED                 ┊ DMZ                 ┊ INTERNAL                ┊ DATA
   Browser / mobile ─HTTPS──►┊ API gateway ──mTLS─►┊ order-service ──TLS───►┊ PostgreSQL (PII)
   attacker, bots            ┊  authN (OIDC)       ┊  authZ: owner check     ┊  encrypted at rest
                             ┊  rate limit, WAF    ┊  input validation       ┊  least-privilege DB user
                             ┊                     ┊  audit log ──────────────┼─► SIEM (accounting)
   STRIDE per crossing:  S spoofing · T tampering · R repudiation · I disclosure · D DoS · E privilege
   Defence in depth:     TLS → authN → authZ → validation → encryption → monitoring
`,
    components: [
      {
        name: 'Asset',
        role: 'What to protect',
        description: {
          vi: 'Dữ liệu và chức năng có giá trị, kèm yêu cầu C, I, A.',
          en: 'Valuable data and functions, each with C, I, A requirements.'
        }
      },
      {
        name: 'Trust boundary',
        role: 'Where to check',
        description: {
          vi: 'Nơi dữ liệu đổi mức tin cậy; đặt authN/authZ/validation tại đây.',
          en: 'Where data changes trust level; place authN/authZ/validation here.'
        }
      },
      {
        name: 'Threat (STRIDE)',
        role: 'What can go wrong',
        description: {
          vi: 'Sáu nhóm mối đe doạ ánh xạ vào sáu thuộc tính bảo mật.',
          en: 'Six threat groups mapped to six security properties.'
        }
      },
      {
        name: 'Control',
        role: 'Mitigation',
        description: {
          vi: 'Biện pháp phòng ngừa, phát hiện hoặc khắc phục, nhiều lớp độc lập.',
          en: 'Preventive, detective or corrective measures in independent layers.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'assets',
      title: { vi: 'Liệt kê tài sản & yêu cầu CIA', en: 'List assets & CIA requirements' },
      phase: 'Scope',
      description: {
        vi: 'Dữ liệu đơn hàng cần C cao (PII), I cao (số tiền), A vừa (cho phép bảo trì).',
        en: 'Order data needs high C (PII), high I (amounts) and medium A (maintenance allowed).'
      },
      systemBehavior: {
        vi: 'Yêu cầu CIA quyết định control nào đáng đầu tư.',
        en: 'CIA requirements decide which controls are worth investing in.'
      },
      codeLineMatch: 'assets:'
    },
    {
      id: 'boundaries',
      title: { vi: 'Vẽ luồng dữ liệu & trust boundary', en: 'Draw data flows & trust boundaries' },
      phase: 'Model',
      description: {
        vi: 'Đánh dấu nơi request đi từ Internet vào gateway, từ gateway vào service, từ service vào DB.',
        en: 'Mark where requests go from the Internet to the gateway, the gateway to services, services to the DB.'
      },
      systemBehavior: {
        vi: 'Mỗi điểm vượt ranh giới là nơi phải xác thực và kiểm tra quyền.',
        en: 'Every crossing is a place to authenticate and authorise.'
      },
      codeLineMatch: 'trust_boundaries:'
    },
    {
      id: 'stride',
      title: { vi: 'Áp STRIDE cho từng điểm vượt', en: 'Apply STRIDE at each crossing' },
      phase: 'Threats',
      description: {
        vi: 'Ví dụ: Elevation of privilege — user đổi orderId trong URL để xem đơn của người khác.',
        en: 'Example: Elevation of privilege — a user changes the orderId in the URL to view someone else’s order.'
      },
      systemBehavior: {
        vi: 'Mỗi mối đe doạ được chấm điểm likelihood × impact.',
        en: 'Each threat is scored by likelihood × impact.'
      },
      codeLineMatch: 'stride:'
    },
    {
      id: 'controls',
      title: {
        vi: 'Đặt control nhiều lớp, deny by default',
        en: 'Layered controls, deny by default'
      },
      phase: 'Mitigate',
      description: {
        vi: 'Owner check ở service, DB user chỉ có quyền cần thiết, audit log cho mọi thao tác ghi.',
        en: 'Owner checks in the service, a DB user with only the needed rights, audit logs for every write.'
      },
      systemBehavior: {
        vi: 'Một lớp bị vượt qua vẫn còn lớp khác chặn.',
        en: 'If one layer is bypassed, another still blocks.'
      },
      codeLineMatch: 'controls:'
    }
  ],

  comparison: {
    title: {
      vi: 'Preventive, Detective và Corrective controls',
      en: 'Preventive, Detective and Corrective controls'
    },
    subtitle: {
      vi: 'Defense in depth cần cả ba loại',
      en: 'Defence in depth needs all three kinds'
    },
    options: [
      {
        name: 'Preventive',
        tag: 'Stop it',
        role: { vi: 'Ngăn tấn công xảy ra', en: 'Stop the attack happening' },
        keyMechanism: {
          vi: 'TLS, authZ check, input validation, least privilege, MFA.',
          en: 'TLS, authZ checks, input validation, least privilege, MFA.'
        },
        configExample: 'deny by default; allow only listed roles',
        architectureNote: {
          vi: 'Lớp đầu tiên nhưng không bao giờ hoàn hảo.',
          en: 'The first layer, but never perfect.'
        }
      },
      {
        name: 'Detective',
        tag: 'See it',
        role: { vi: 'Phát hiện khi đang xảy ra', en: 'Notice it while it happens' },
        keyMechanism: {
          vi: 'Audit log, SIEM, cảnh báo đăng nhập bất thường, IDS.',
          en: 'Audit logs, SIEM, anomalous-login alerts, IDS.'
        },
        configExample: 'alert: >20 failed logins/min per account',
        architectureNote: {
          vi: 'Rút ngắn thời gian kẻ tấn công ở trong hệ thống.',
          en: 'Shortens how long an attacker stays inside.'
        }
      },
      {
        name: 'Corrective',
        tag: 'Recover',
        role: { vi: 'Khôi phục sau sự cố', en: 'Recover after an incident' },
        keyMechanism: {
          vi: 'Thu hồi credential, xoay khoá, restore backup, vá lỗi.',
          en: 'Revoke credentials, rotate keys, restore backups, patch.'
        },
        configExample: 'runbook: revoke tokens → rotate signing key → notify',
        architectureNote: {
          vi: 'Bảo vệ Availability và hạn chế thiệt hại.',
          en: 'Protects Availability and limits damage.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Đầu tư bảo mật theo rủi ro thật thay vì theo cảm tính.',
        en: 'Security spending follows real risk instead of gut feeling.'
      },
      {
        vi: 'Threat model sớm làm lỗi thiết kế lộ ra khi sửa còn rẻ.',
        en: 'Early threat models surface design flaws while fixes are cheap.'
      }
    ],
    cons: [
      {
        vi: 'Cần thời gian và phải cập nhật theo mỗi thay đổi kiến trúc.',
        en: 'Takes time and must be updated with every architecture change.'
      },
      {
        vi: 'Nhiều lớp kiểm soát tăng độ phức tạp vận hành và độ trễ.',
        en: 'More control layers add operational complexity and latency.'
      }
    ],
    balance: {
      vi: 'Mức kiểm soát tương xứng với giá trị tài sản: dữ liệu thanh toán cần nhiều lớp hơn trang marketing.',
      en: 'Match the controls to the asset’s value: payment data deserves more layers than a marketing page.'
    },
    invariant: {
      vi: 'Mọi dữ liệu vượt trust boundary đều được xác thực, kiểm tra quyền và validate trước khi được tin.',
      en: 'All data crossing a trust boundary is authenticated, authorised and validated before it is trusted.'
    }
  },

  code: [
    {
      label: 'threat-model.yaml',
      filename: 'threat-model.yaml',
      language: 'yaml',
      code: `system: order-api
assets:
  - name: orders            # PII + payment amounts
    confidentiality: high
    integrity: high
    availability: medium
  - name: admin-functions
    confidentiality: medium
    integrity: high

trust_boundaries:
  - internet -> api-gateway        # untrusted clients
  - api-gateway -> order-service   # authenticated user context
  - order-service -> postgres      # service credentials

stride:
  - id: T1
    category: Elevation of privilege
    where: api-gateway -> order-service
    threat: user changes /orders/{id} to read another user's order (IDOR)
    likelihood: high
    impact: high
  - id: T2
    category: Repudiation
    where: order-service
    threat: admin refunds an order and later denies it

controls:
  T1: [owner check on every request, deny by default, integration test per role]
  T2: [append-only audit log with actor, action, target, timestamp]
  defence_in_depth: [TLS, OIDC authN, authZ, input validation, DB least privilege, monitoring]`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Phân biệt Authentication và Authorization bằng một ví dụ.',
        en: 'Distinguish Authentication from Authorization with an example.'
      },
      answer: {
        vi: 'Authentication xác định bạn là ai: đăng nhập bằng mật khẩu + MFA chứng minh bạn là user 42. Authorization quyết định bạn được làm gì: user 42 được xem đơn hàng của chính mình nhưng không được xem đơn của user 43 hay vào trang admin. Một hệ thống có thể xác thực đúng nhưng vẫn phân quyền sai.',
        en: 'Authentication establishes who you are: logging in with a password + MFA proves you are user 42. Authorization decides what you may do: user 42 may view their own orders but not user 43’s, nor the admin page. A system can authenticate correctly and still authorise wrongly.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Defense in depth là gì, và khi nào nhiều lớp KHÔNG an toàn hơn?',
        en: 'What is defence in depth, and when are more layers NOT safer?'
      },
      answer: {
        vi: 'Là đặt nhiều lớp kiểm soát độc lập để một lớp thất bại không dẫn tới sự cố. Nhiều lớp không giúp gì khi chúng phụ thuộc cùng một điểm hỏng (cùng credential, cùng cấu hình sai, cùng thư viện có lỗ hổng), hoặc khi độ phức tạp làm người vận hành tắt bớt kiểm soát để "cho chạy được".',
        en: 'Placing several independent controls so one failure does not become an incident. More layers do not help when they share a single point of failure (the same credential, the same misconfiguration, the same vulnerable library), or when the complexity drives operators to switch controls off "to make it work".'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.owaspThreatModeling,
    SECURITY_CITATIONS.owaspAuthorization,
    SECURITY_CITATIONS.nist800207
  ]
};
