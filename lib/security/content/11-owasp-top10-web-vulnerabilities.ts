import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const owaspTop10Topic: SecurityTopic = {
  id: 'owasp-top10-web-vulnerabilities',
  roadmapId: 'SEC-11',
  category: 'sec-appsec',
  level: 'advanced',
  chapter: 'Cấp độ 4',
  name: 'OWASP Top 10 & Common Web Vulnerabilities',
  tagline: {
    vi: 'OWASP Top 10:2025 qua code Spring Boot thật: Broken Access Control và IDOR/BOLA, SSRF (nay thuộc A01), SQL/NoSQL Injection, Security Misconfiguration, Cryptographic và Authentication Failures, Software Supply Chain, Logging & Alerting và xử lý ngoại lệ fail-open.',
    en: 'The OWASP Top 10:2025 through real Spring Boot code: Broken Access Control and IDOR/BOLA, SSRF (now under A01), SQL/NoSQL injection, Security Misconfiguration, Cryptographic and Authentication Failures, the Software Supply Chain, Logging & Alerting and fail-open exception handling.'
  },
  difficulty: 3,
  order: 11,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Phần lớn sự cố web không đến từ kỹ thuật tấn công mới mà từ những lỗi lặp đi lặp lại: một endpoint quên kiểm tra quyền trên object, một câu SQL ghép chuỗi, actuator để lộ /env, một URL do người dùng gửi khiến server gọi vào metadata cloud. Đội phát triển cần một danh sách ưu tiên để biết nhìn vào đâu trước.',
      en: 'Most web incidents do not come from novel techniques but from the same mistakes over and over: an endpoint that forgets the object-level permission check, a concatenated SQL string, an actuator exposing /env, a user-supplied URL that makes the server call the cloud metadata service. Teams need a prioritised list of where to look first.'
    },
    hardwareConstraint: {
      vi: 'Mọi input từ request (path, query, header, body, file, URL) đều do kẻ tấn công kiểm soát. Interpreter (SQL, shell, template, trình duyệt) không phân biệt được đâu là lệnh do dev viết và đâu là dữ liệu chèn vào, nếu hai thứ bị ghép thành một chuỗi.',
      en: 'Every request input (path, query, header, body, file, URL) is attacker-controlled. Interpreters (SQL, shells, templates, browsers) cannot tell developer-written commands from injected data once the two are concatenated into one string.'
    },
    fundamentalSolution: {
      vi: 'OWASP Top 10:2025 là danh sách nhận thức: A01 Broken Access Control (đã gộp SSRF), A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging & Alerting Failures, A10 Mishandling of Exceptional Conditions. Phòng thủ tương ứng: kiểm tra quyền trên từng object và deny by default; tách code khỏi dữ liệu (prepared statement, output encoding); cấu hình an toàn mặc định; allowlist đích cho mọi request ra ngoài; dependency có SBOM và được quét; log các sự kiện bảo mật có cảnh báo; và khi có lỗi thì fail closed.',
      en: 'The OWASP Top 10:2025 is an awareness list: A01 Broken Access Control (now including SSRF), A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging & Alerting Failures, A10 Mishandling of Exceptional Conditions. The matching defences: object-level access checks and deny by default; separating code from data (prepared statements, output encoding); secure-by-default configuration; destination allowlists for every outbound request; dependencies with SBOMs that get scanned; logged, alerting security events; and failing closed on errors.'
    },
    math: {
      formula: String.raw`\text{concat: } \operatorname{parse}(q \,\Vert\, x) \qquad \text{prepared: } \operatorname{bind}\big(\operatorname{parse}(q),\ x\big)`,
      description: {
        vi: 'Injection xảy ra khi dữ liệu x được ghép vào chuỗi lệnh q trước khi parse: x có thể thay đổi cây cú pháp (thêm OR 1=1, UNION, ; DROP). Prepared statement parse q trước với các placeholder, rồi mới bind x như một giá trị — x không bao giờ trở thành cú pháp, bất kể nội dung.',
        en: 'Injection happens when data x is concatenated into the command string q before parsing: x can change the syntax tree (add OR 1=1, UNION, ; DROP). A prepared statement parses q first with placeholders and only then binds x as a value — x never becomes syntax, whatever it contains.'
      },
      timeComplexity: 'Per request: O(1) extra checks (ownership, allowlist, bind)',
      spaceComplexity: 'Security logs grow with events; retain per policy'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Top 10 không phải checklist đầy đủ (dùng OWASP ASVS cho việc đó) mà là bản đồ rủi ro phổ biến nhất. Bản 2025 thêm A03 Supply Chain và A10 Exceptional Conditions, và gộp SSRF vào A01.',
      en: 'The Top 10 is not a complete checklist (use OWASP ASVS for that) but a map of the most common risks. The 2025 edition adds A03 Supply Chain and A10 Exceptional Conditions, and folds SSRF into A01.'
    },
    deepDiveParagraphs: [
      {
        vi: 'A01 Broken Access Control: IDOR/BOLA — GET /orders/43 trả đơn của người khác vì chỉ kiểm tra "đã đăng nhập". Sửa bằng truy vấn theo id VÀ owner hoặc policy check trên object (SEC-05). SSRF giờ cũng thuộc A01: server tải một URL do người dùng gửi (avatar, webhook) và bị lừa gọi http://169.254.169.254 để lấy credential cloud. Phòng thủ: allowlist đích, tắt follow redirect, kiểm tra IP sau khi resolve (chống DNS rebinding), chặn dải nội bộ, dùng IMDSv2.',
        en: 'A01 Broken Access Control: IDOR/BOLA — GET /orders/43 returns someone else’s order because only "logged in" was checked. Fix with a query by id AND owner or a policy check on the object (SEC-05). SSRF now belongs to A01 too: the server fetches a user-supplied URL (avatar, webhook) and is tricked into calling http://169.254.169.254 for cloud credentials. Defences: destination allowlists, no redirect following, checking the resolved IP (against DNS rebinding), blocking internal ranges, IMDSv2.'
      },
      {
        vi: 'A05 Injection: SQL injection sửa bằng prepared statement có tham số; tên cột và hướng sắp xếp không bind được nên phải map qua allowlist; escaping thủ công bị OWASP "strongly discouraged". Stored procedure không tự động an toàn nếu bên trong ghép chuỗi động. NoSQL injection: gửi {"$ne": null} thay cho chuỗi mật khẩu trong MongoDB — validate kiểu dữ liệu và dùng query builder có kiểu.',
        en: 'A05 Injection: fix SQL injection with parameterised prepared statements; column names and sort directions cannot be bound, so map them through an allowlist; hand-written escaping is "strongly discouraged" by OWASP. Stored procedures are not automatically safe if they build dynamic SQL inside. NoSQL injection: sending {"$ne": null} instead of a password string to MongoDB — validate types and use typed query builders.'
      },
      {
        vi: 'A02 Misconfiguration và A04/A07: actuator lộ /env, /heapdump; stack trace trả về client; CORS cho phép mọi origin kèm credentials; tài khoản mặc định. A04 Cryptographic Failures: dữ liệu nhạy cảm không mã hoá, thuật toán yếu (SEC-02). A07 Authentication Failures: không rate limit, cho phép mật khẩu đã lộ, không MFA, session không hết hạn (SEC-04, SEC-06). A03 Supply Chain và A08 Integrity: dependency có lỗ hổng, artifact không ký, pipeline không kiểm soát (DOCKER-09).',
        en: 'A02 Misconfiguration and A04/A07: an actuator exposing /env and /heapdump; stack traces returned to clients; CORS allowing every origin with credentials; default accounts. A04 Cryptographic Failures: unencrypted sensitive data, weak algorithms (SEC-02). A07 Authentication Failures: no rate limits, breached passwords allowed, no MFA, sessions that never expire (SEC-04, SEC-06). A03 Supply Chain and A08 Integrity: vulnerable dependencies, unsigned artifacts, uncontrolled pipelines (DOCKER-09).'
      },
      {
        vi: 'A09 Logging & Alerting và A10 Exceptional Conditions: log mà không có cảnh báo thì không ai biết đang bị tấn công — ghi đăng nhập thất bại, lỗi phân quyền, thay đổi quyền, kèm cảnh báo theo ngưỡng; không ghi mật khẩu, token, PII. A10 là các lỗi khi xử lý ngoại lệ: code phân quyền bắt exception rồi "cho qua" (fail open), lộ thông tin qua thông báo lỗi, hoặc để trạng thái dở dang khi giao dịch lỗi. Nguyên tắc: khi không chắc thì từ chối.',
        en: 'A09 Logging & Alerting and A10 Exceptional Conditions: logs without alerts mean nobody notices an attack — record failed logins, authorization failures and permission changes, with threshold alerts; never log passwords, tokens or PII. A10 covers mishandled errors: authorization code that catches an exception and "lets it through" (fail open), information leaked in error messages, or half-finished state after a failed transaction. The rule: when unsure, deny.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng WAF thay cho sửa code: WAF chặn payload phổ biến nhưng không biết order 43 thuộc về ai.',
        en: 'Using a WAF instead of fixing code: a WAF blocks common payloads but cannot know who order 43 belongs to.'
      },
      {
        vi: 'Đổi ID tuần tự sang UUID và coi như đã sửa IDOR.',
        en: 'Switching sequential IDs to UUIDs and calling IDOR fixed.'
      },
      {
        vi: 'Blocklist "127.0.0.1" và "localhost" để chống SSRF: bị vượt qua bằng 0x7f000001, IPv6, DNS rebinding, redirect.',
        en: 'Blocklisting "127.0.0.1" and "localhost" against SSRF: bypassed with 0x7f000001, IPv6, DNS rebinding or redirects.'
      },
      {
        vi: 'Quét bảo mật chỉ chạy trước release lớn thay vì trong mọi pipeline.',
        en: 'Security scans that run only before major releases instead of in every pipeline.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Một request, nhiều điểm có thể vỡ', en: 'One request, many places to break' },
    description: {
      vi: 'Mỗi tầng ứng với một nhóm Top 10; phòng thủ phải có ở đúng tầng đó.',
      en: 'Each layer maps to a Top 10 group; the defence must sit at that layer.'
    },
    asciiDiagram: `
 GET /orders/43?sort=name  +  POST /avatar {url}  +  /actuator/env
   │
   ├─ A07 authN ─────── session/token valid? MFA? rate limit?
   ├─ A01 authZ ─────── owner(order 43) == user?  (IDOR/BOLA)      deny by default
   ├─ A01 SSRF ──────── url host ∈ allowlist? resolved IP not internal? no redirects
   ├─ A05 injection ─── prepared statement; sort ∈ {name, date} allowlist
   ├─ A02 misconfig ─── actuator exposes only health,info; no stack traces to clients
   ├─ A10 exceptions ── catch → DENY (fail closed), generic error to client
   └─ A09 logging ───── audit authZ failures → alert on spikes; never log secrets
 build time: A03 supply chain / A08 integrity → SBOM, scan, signed artifacts (DOCKER-09)
`,
    components: [
      {
        name: 'Access control (A01)',
        role: 'Most common',
        description: {
          vi: 'IDOR/BOLA, thiếu kiểm tra quyền chức năng, SSRF.',
          en: 'IDOR/BOLA, missing function-level checks, SSRF.'
        }
      },
      {
        name: 'Injection (A05)',
        role: 'Code vs data',
        description: {
          vi: 'SQL, NoSQL, OS command, LDAP, template injection.',
          en: 'SQL, NoSQL, OS command, LDAP, template injection.'
        }
      },
      {
        name: 'Misconfiguration (A02)',
        role: 'Defaults',
        description: {
          vi: 'Endpoint quản trị lộ ra, header thiếu, CORS quá rộng.',
          en: 'Exposed admin endpoints, missing headers, overly broad CORS.'
        }
      },
      {
        name: 'Logging & exceptions (A09/A10)',
        role: 'Detect · fail safe',
        description: {
          vi: 'Phát hiện tấn công và fail closed khi lỗi.',
          en: 'Detect attacks and fail closed on errors.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'idor',
      title: { vi: 'A01: kiểm tra chủ sở hữu object', en: 'A01: check the object owner' },
      phase: 'Access control',
      description: {
        vi: 'Truy vấn theo id VÀ owner; order của người khác trả 404.',
        en: 'Query by id AND owner; someone else’s order returns 404.'
      },
      systemBehavior: {
        vi: 'Không còn đọc được đơn hàng chỉ bằng cách đổi số trong URL.',
        en: 'Changing the number in the URL no longer reveals orders.'
      },
      codeLineMatch: 'orders.findByIdAndOwnerId(id, userId)'
    },
    {
      id: 'injection',
      title: {
        vi: 'A05: prepared statement + allowlist',
        en: 'A05: prepared statement + allowlist'
      },
      phase: 'Injection',
      description: {
        vi: 'Giá trị tìm kiếm được bind; cột sắp xếp được map qua allowlist.',
        en: 'The search value is bound; the sort column is mapped through an allowlist.'
      },
      systemBehavior: {
        vi: "' OR 1=1 -- chỉ là một chuỗi tìm kiếm vô hại.",
        en: "' OR 1=1 -- is just a harmless search string."
      },
      codeLineMatch: 'jdbc.query("SELECT id, name FROM products WHERE name LIKE ? ORDER BY "'
    },
    {
      id: 'ssrf',
      title: { vi: 'A01/SSRF: allowlist đích', en: 'A01/SSRF: destination allowlist' },
      phase: 'Outbound',
      description: {
        vi: 'Chỉ tải avatar từ host được phép, không follow redirect, kiểm tra IP sau khi resolve.',
        en: 'Fetch avatars only from allowed hosts, follow no redirects, check the resolved IP.'
      },
      systemBehavior: {
        vi: 'URL trỏ tới 169.254.169.254 hoặc dải nội bộ bị từ chối.',
        en: 'URLs pointing at 169.254.169.254 or internal ranges are refused.'
      },
      codeLineMatch: 'ALLOWED_AVATAR_HOSTS.contains'
    },
    {
      id: 'misconfig',
      title: { vi: 'A02: chỉ lộ health và info', en: 'A02: expose only health and info' },
      phase: 'Configuration',
      description: {
        vi: 'Actuator chỉ public health/info; lỗi trả về không kèm stack trace.',
        en: 'The actuator publishes only health/info; errors carry no stack traces.'
      },
      systemBehavior: {
        vi: '/actuator/env và /heapdump không còn truy cập được từ ngoài.',
        en: '/actuator/env and /heapdump are no longer reachable from outside.'
      },
      codeLineMatch: 'management.endpoints.web.exposure.include=health,info'
    },
    {
      id: 'fail-closed',
      title: { vi: 'A10 + A09: fail closed và cảnh báo', en: 'A10 + A09: fail closed and alert' },
      phase: 'Exceptions',
      description: {
        vi: 'Lỗi khi kiểm tra quyền → DENY, ghi audit log và đếm cho cảnh báo.',
        en: 'An error while checking permissions → DENY, write an audit log and count it for alerting.'
      },
      systemBehavior: {
        vi: 'Không có đường đi nào biến lỗi thành "cho phép".',
        en: 'No code path turns an error into "allow".'
      },
      codeLineMatch: 'return Decision.DENY;'
    }
  ],

  comparison: {
    title: { vi: 'OWASP Top 10:2025 so với 2021', en: 'OWASP Top 10:2025 vs 2021' },
    subtitle: {
      vi: 'Những thay đổi đáng chú ý',
      en: 'The notable changes'
    },
    options: [
      {
        name: 'New in 2025',
        tag: 'A03 · A10',
        role: { vi: 'Hai hạng mục mới', en: 'Two new categories' },
        keyMechanism: {
          vi: 'A03 Software Supply Chain Failures (mở rộng từ Vulnerable and Outdated Components) và A10 Mishandling of Exceptional Conditions.',
          en: 'A03 Software Supply Chain Failures (expanded from Vulnerable and Outdated Components) and A10 Mishandling of Exceptional Conditions.'
        },
        configExample: 'SBOM + signed artifacts; catch → deny',
        architectureNote: {
          vi: 'Pipeline và xử lý lỗi giờ là bề mặt tấn công chính thức.',
          en: 'Pipelines and error handling are now formally attack surface.'
        }
      },
      {
        name: 'Moved / merged',
        tag: 'A01 · A02',
        role: { vi: 'Thứ hạng thay đổi', en: 'Rankings changed' },
        keyMechanism: {
          vi: 'SSRF gộp vào A01 Broken Access Control; Security Misconfiguration lên A02; Cryptographic Failures xuống A04; Injection xuống A05.',
          en: 'SSRF merged into A01 Broken Access Control; Security Misconfiguration rose to A02; Cryptographic Failures fell to A04; Injection fell to A05.'
        },
        configExample: 'A01 still #1',
        architectureNote: {
          vi: 'Phân quyền vẫn là lỗi phổ biến nhất.',
          en: 'Access control remains the most common failure.'
        }
      },
      {
        name: 'Renamed',
        tag: 'A07 · A09',
        role: { vi: 'Đổi tên cho chính xác hơn', en: 'Renamed for precision' },
        keyMechanism: {
          vi: 'A07 thành Authentication Failures; A09 thành Security Logging & Alerting Failures — nhấn mạnh cảnh báo chứ không chỉ log.',
          en: 'A07 became Authentication Failures; A09 became Security Logging & Alerting Failures — stressing alerting, not just logging.'
        },
        configExample: 'alert on authZ-failure spikes',
        architectureNote: {
          vi: 'Log không ai đọc không phải là phát hiện.',
          en: 'Logs nobody reads are not detection.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Ngôn ngữ chung giữa dev, QA, security để ưu tiên việc sửa.',
        en: 'A shared language between dev, QA and security to prioritise fixes.'
      },
      {
        vi: 'Phần lớn phòng thủ là mặc định của framework nếu không tắt chúng.',
        en: 'Most defences are framework defaults if you do not turn them off.'
      }
    ],
    cons: [
      {
        vi: 'Không phải checklist đầy đủ; dễ tạo cảm giác "đã an toàn".',
        en: 'Not a complete checklist; it can create a false sense of safety.'
      },
      {
        vi: 'Lỗi thiết kế (A06) không bắt được bằng scanner.',
        en: 'Design flaws (A06) cannot be caught by scanners.'
      }
    ],
    balance: {
      vi: 'Dùng Top 10 để định hướng đào tạo và review, ASVS để đặt yêu cầu kiểm chứng, threat modeling (SEC-01) để bắt lỗi thiết kế.',
      en: 'Use the Top 10 to steer training and reviews, ASVS for verifiable requirements, and threat modeling (SEC-01) for design flaws.'
    },
    invariant: {
      vi: 'Dữ liệu từ người dùng không bao giờ được thực thi như code, và lỗi không bao giờ dẫn tới "cho phép".',
      en: 'User data is never executed as code, and errors never lead to "allow".'
    }
  },

  code: [
    {
      label: 'VulnerableVsFixed.java',
      filename: 'VulnerableVsFixed.java',
      language: 'java',
      code: `// A01 Broken Access Control (IDOR/BOLA)
// ✗ orders.findById(id)                     — any logged-in user reads any order
Order order = orders.findByIdAndOwnerId(id, userId)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

// A05 Injection — bind values, allowlist identifiers
// ✗ "SELECT ... WHERE name LIKE '%" + q + "%' ORDER BY " + sort
String column = Map.of("name", "name", "date", "created_at").getOrDefault(sort, "name");
List<Product> found = jdbc.query("SELECT id, name FROM products WHERE name LIKE ? ORDER BY " + column,
    productMapper, "%" + q + "%");

// A01 SSRF — the server fetches a user-supplied URL
URI uri = URI.create(avatarUrl);
InetAddress ip = InetAddress.getByName(uri.getHost());
if (!"https".equals(uri.getScheme()) || !ALLOWED_AVATAR_HOSTS.contains(uri.getHost())
        || ip.isSiteLocalAddress() || ip.isLoopbackAddress() || ip.isLinkLocalAddress()) {
    throw new BadRequestException("avatar host not allowed");
}
HttpClient client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();

// A02 Security Misconfiguration (application.properties)
// management.endpoints.web.exposure.include=health,info
// server.error.include-stacktrace=never

// A10 Exceptional conditions + A09 logging: fail closed, alert on spikes
Decision decide(Request r) {
    try {
        return policy.evaluate(r);
    } catch (Exception e) {
        auditLog.warn("authz_error user={} resource={}", r.userId(), r.resource());   // no secrets
        metrics.counter("authz.errors").increment();
        return Decision.DENY;
    }
}`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Vì sao escaping thủ công không phải cách chống SQL injection được khuyến nghị?',
        en: 'Why is hand-written escaping not the recommended SQL injection defence?'
      },
      answer: {
        vi: 'Escaping phụ thuộc vào database, charset và ngữ cảnh (chuỗi, số, identifier); bỏ sót một trường hợp là đủ. Prepared statement tách hẳn câu lệnh khỏi dữ liệu ở tầng giao thức nên dữ liệu không bao giờ thành cú pháp. Phần không bind được (tên cột, ASC/DESC) thì map qua allowlist.',
        en: 'Escaping depends on the database, the charset and the context (string, number, identifier); missing one case is enough. Prepared statements separate the statement from the data at the protocol level, so data never becomes syntax. Parts that cannot be bound (column names, ASC/DESC) are mapped through an allowlist.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Tính năng "nhập URL ảnh đại diện" cần những biện pháp gì để không thành SSRF?',
        en: 'What does an "enter an avatar URL" feature need so it does not become SSRF?'
      },
      answer: {
        vi: 'Chỉ cho phép https và allowlist host; resolve DNS và chặn IP nội bộ, loopback, link-local (169.254.169.254); kết nối tới chính IP đã kiểm tra để chống DNS rebinding; tắt follow redirect; giới hạn kích thước và thời gian; chạy fetcher trong mạng egress hạn chế; trên cloud bật IMDSv2. Tốt nhất là để người dùng upload file thay vì nhập URL.',
        en: 'Allow only https and an allowlist of hosts; resolve DNS and block internal, loopback and link-local IPs (169.254.169.254); connect to the exact IP you validated to resist DNS rebinding; disable redirects; cap size and time; run the fetcher in a restricted-egress network; enable IMDSv2 on the cloud. Better still, have users upload the file instead of entering a URL.'
      },
      trapWarning: {
        vi: 'Kiểm tra hostname bằng regex rồi để HTTP client tự resolve lại là vẫn bị DNS rebinding.',
        en: 'Checking the hostname with a regex and then letting the HTTP client resolve it again is still vulnerable to DNS rebinding.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.owaspTop10,
    SECURITY_CITATIONS.owaspSqli,
    SECURITY_CITATIONS.owaspSsrf,
    SECURITY_CITATIONS.owaspAuthorization
  ]
};
