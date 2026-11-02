import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const apiSecurityTopic: SecurityTopic = {
  id: 'api-security-secure-coding',
  roadmapId: 'SEC-13',
  category: 'sec-appsec',
  level: 'advanced',
  chapter: 'Cấp độ 4',
  name: 'API Security & Secure Coding',
  tagline: {
    vi: 'OWASP API Security Top 10: xác thực và phân quyền từng endpoint, chống mass assignment bằng DTO, input validation, rate limiting bằng token bucket, xử lý lỗi an toàn với ProblemDetail, API key vs OAuth token, quản lý secret, audit log, quét dependency và versioning.',
    en: 'The OWASP API Security Top 10: per-endpoint authentication and authorization, DTOs against mass assignment, input validation, token-bucket rate limiting, safe error handling with ProblemDetail, API keys vs OAuth tokens, secrets management, audit logging, dependency scanning and versioning.'
  },
  difficulty: 3,
  order: 13,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'API public cho mobile và đối tác: client có thể gửi bất kỳ field nào (kể cả "role":"ADMIN" hay "price":0), gọi 10.000 lần mỗi giây, đổi ID trong path, và đọc stack trace để biết phiên bản thư viện. API không có giao diện để "ẩn nút" — mọi quy tắc phải được thực thi ở server.',
      en: 'A public API for mobile apps and partners: clients can send any field (including "role":"ADMIN" or "price":0), call 10,000 times a second, change IDs in paths and read stack traces to learn library versions. An API has no UI to "hide buttons" — every rule must be enforced on the server.'
    },
    hardwareConstraint: {
      vi: 'CPU, connection pool database và quota của dịch vụ bên thứ ba có hạn; một client lạm dụng có thể làm cạn tài nguyên của tất cả. Mọi byte request đều do client kiểm soát, và client có thể là script tự động chứ không phải app của bạn.',
      en: 'CPU, database connection pools and third-party quotas are finite; one abusive client can exhaust them for everyone. Every request byte is client-controlled, and the client may be an automated script rather than your app.'
    },
    fundamentalSolution: {
      vi: 'Mỗi endpoint: xác thực (OAuth access token cho người dùng, credential riêng cho máy), phân quyền theo scope VÀ theo object (API1 BOLA, API5 function level). Chỉ nhận đúng các field được phép qua DTO riêng cho từng thao tác (API3 property level) và validate kiểu, độ dài, khoảng giá trị. Giới hạn tài nguyên: rate limit theo client, giới hạn kích thước request và page size (API4). Lỗi trả về dạng ProblemDetail không lộ chi tiết nội bộ. Secret nằm trong vault, dependency được quét, mọi thao tác nhạy cảm có audit log, và inventory API được quản lý kể cả version cũ (API9).',
      en: 'Every endpoint: authenticate (OAuth access tokens for users, dedicated credentials for machines), authorise by scope AND by object (API1 BOLA, API5 function level). Accept only allowed fields through per-operation DTOs (API3 property level) and validate type, length and range. Limit resources: per-client rate limits, request-size and page-size caps (API4). Errors come back as ProblemDetail without internal details. Secrets live in a vault, dependencies are scanned, sensitive actions are audit-logged, and the API inventory is managed, old versions included (API9).'
    },
    math: {
      formula: String.raw`\text{tokens}(t) = \min\!\big(B,\ \text{tokens}(t_0) + r\,(t - t_0)\big), \qquad \text{allow} \iff \text{tokens}(t) \ge 1`,
      description: {
        vi: 'Token bucket: bucket dung lượng B được nạp r token mỗi giây; mỗi request tiêu một token. B cho phép burst ngắn, r là tốc độ bền vững. Ví dụ B = 20, r = 5/s: client gửi được 20 request ngay lập tức rồi 5 request mỗi giây; hết token thì trả 429 kèm Retry-After.',
        en: 'Token bucket: a bucket of capacity B refills r tokens per second; each request spends one. B allows short bursts, r is the sustained rate. With B = 20 and r = 5/s a client can send 20 requests at once, then 5 per second; when empty, return 429 with Retry-After.'
      },
      timeComplexity: 'O(1) per request (bucket check), O(fields) validation',
      spaceComplexity: 'O(active clients) buckets, usually in Redis'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'OWASP API Security Top 10 (2023): API1 BOLA, API2 Broken Authentication, API3 Broken Object Property Level Authorization, API4 Unrestricted Resource Consumption, API5 Broken Function Level Authorization, API6 Unrestricted Access to Sensitive Business Flows, API7 SSRF, API8 Security Misconfiguration, API9 Improper Inventory Management, API10 Unsafe Consumption of APIs.',
      en: 'The OWASP API Security Top 10 (2023): API1 BOLA, API2 Broken Authentication, API3 Broken Object Property Level Authorization, API4 Unrestricted Resource Consumption, API5 Broken Function Level Authorization, API6 Unrestricted Access to Sensitive Business Flows, API7 SSRF, API8 Security Misconfiguration, API9 Improper Inventory Management, API10 Unsafe Consumption of APIs.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Mass assignment và property-level authorization: bind thẳng JSON vào entity JPA cho phép client ghi những field không được phép (role, ownerId, price, isVerified). Dùng DTO riêng cho từng thao tác (CreateOrderRequest chỉ có productId và quantity), map tường minh sang entity. Ngược lại, response cũng dùng DTO để không trả ra field nhạy cảm (passwordHash, internalNotes).',
        en: 'Mass assignment and property-level authorization: binding JSON straight into a JPA entity lets clients write fields they must not (role, ownerId, price, isVerified). Use a DTO per operation (CreateOrderRequest has only productId and quantity) and map explicitly to the entity. Likewise, responses use DTOs so sensitive fields (passwordHash, internalNotes) never leave.'
      },
      {
        vi: 'Input validation và output encoding: validate theo allowlist (kiểu, độ dài, định dạng, khoảng giá trị) bằng Bean Validation ở biên; validation không thay thế prepared statement hay output encoding mà là lớp bổ sung. Giới hạn kích thước body, số phần tử mảng và page size để không bị "trả hết bảng" hay làm cạn bộ nhớ.',
        en: 'Input validation and output encoding: validate against an allowlist (type, length, format, range) with Bean Validation at the edge; validation does not replace prepared statements or output encoding — it is an extra layer. Cap body size, array lengths and page sizes so nobody can "dump the whole table" or exhaust memory.'
      },
      {
        vi: 'API key vs OAuth token: API key là secret dài hạn định danh một ứng dụng, không mang danh tính người dùng, khó giới hạn scope và thời hạn — chỉ hợp cho định danh/đo đếm client, không phải xác thực người dùng. OAuth access token ngắn hạn, có scope, audience và gắn với người dùng hoặc client cụ thể. Secret (API key, mật khẩu DB) lưu trong vault/secret manager, không trong Git hay log, và được xoay định kỳ.',
        en: 'API keys vs OAuth tokens: an API key is a long-lived secret identifying an application, carrying no user identity and hard to limit by scope or lifetime — fine for identifying/metering clients, not for authenticating users. An OAuth access token is short-lived, scoped, audience-bound and tied to a specific user or client. Secrets (API keys, DB passwords) live in a vault/secret manager, never in Git or logs, and are rotated regularly.'
      },
      {
        vi: 'Lỗi, log và vòng đời: trả lỗi theo RFC 9457 ProblemDetail với thông điệp chung, log chi tiết ở server kèm correlation ID. Audit log ghi ai, làm gì, trên object nào, kết quả. Quét dependency (SCA) trong mọi pipeline. Versioning: khi phát hành v2, giữ v1 trong inventory với cùng mức bảo vệ và lịch tắt rõ ràng — API cũ bị lãng quên là cửa sau phổ biến (API9).',
        en: 'Errors, logs and lifecycle: return RFC 9457 ProblemDetail errors with generic messages and log the details server-side with a correlation ID. Audit logs record who did what to which object, with the outcome. Run dependency scanning (SCA) in every pipeline. Versioning: when shipping v2, keep v1 in the inventory with the same protection and a clear sunset date — forgotten old APIs are a common back door (API9).'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng entity JPA làm request body: client tự đặt "role":"ADMIN" hoặc "ownerId" của người khác.',
        en: 'Using a JPA entity as the request body: clients set "role":"ADMIN" or someone else’s "ownerId".'
      },
      {
        vi: 'Endpoint ?size=1000000 không giới hạn: một request đọc cả bảng và làm sập service.',
        en: 'An unbounded ?size=1000000: one request reads the whole table and takes the service down.'
      },
      {
        vi: 'API key người dùng nằm trong URL query: lọt vào access log, proxy log và lịch sử trình duyệt.',
        en: 'User API keys in the URL query: leaked into access logs, proxy logs and browser history.'
      },
      {
        vi: 'Phiên bản /v1 cũ không còn ai bảo trì nhưng vẫn chạy với kiểm tra quyền lỏng hơn /v2.',
        en: 'An old, unmaintained /v1 still running with weaker permission checks than /v2.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Pipeline bảo vệ của một API request',
      en: 'The protection pipeline of an API request'
    },
    description: {
      vi: 'Mỗi tầng loại bỏ một nhóm rủi ro trước khi request chạm tới logic nghiệp vụ.',
      en: 'Each layer removes a class of risk before the request reaches business logic.'
    },
    asciiDiagram: `
 POST /v2/orders  Authorization: Bearer …  {"productId":7,"quantity":2,"price":0,"role":"ADMIN"}
   │
   ├─ size limit 1 MB · TLS · gateway                         API8 misconfig
   ├─ rate limit (token bucket per client)  ── 429 ──►        API4 resource consumption
   ├─ authN: JWT signature, iss, aud, exp                     API2 broken authentication
   ├─ authZ: scope orders.write + owner/tenant check          API1 BOLA · API5 function level
   ├─ DTO binding: only productId, quantity  (price, role ignored)   API3 property level
   ├─ Bean Validation: quantity 1..50, productId > 0  ── 400 ProblemDetail
   ├─ business logic (prepared statements, idempotency key)
   └─ audit log {actor, action, target, result, correlationId}
`,
    components: [
      {
        name: 'AuthN + AuthZ',
        role: 'API1 · API2 · API5',
        description: {
          vi: 'Token hợp lệ, scope đúng, object thuộc về caller.',
          en: 'A valid token, the right scope, an object owned by the caller.'
        }
      },
      {
        name: 'DTO + validation',
        role: 'API3',
        description: {
          vi: 'Chỉ nhận và trả các field được phép, đúng kiểu và khoảng.',
          en: 'Accept and return only allowed fields, with the right types and ranges.'
        }
      },
      {
        name: 'Rate limiter',
        role: 'API4 · API6',
        description: {
          vi: 'Token bucket theo client và theo luồng nghiệp vụ nhạy cảm.',
          en: 'Token buckets per client and per sensitive business flow.'
        }
      },
      {
        name: 'Errors + audit',
        role: 'Observability',
        description: {
          vi: 'ProblemDetail chung cho client, chi tiết và audit ở server.',
          en: 'Generic ProblemDetail for clients, details and audit on the server.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'authz',
      title: { vi: 'Scope + quyền trên object', en: 'Scope + object-level permission' },
      phase: 'Authorize',
      description: {
        vi: 'Endpoint đòi scope orders.write; service kiểm tra khách hàng thuộc tenant của caller.',
        en: 'The endpoint requires orders.write; the service checks the customer belongs to the caller’s tenant.'
      },
      systemBehavior: {
        vi: 'Thiếu scope → 403; object của tenant khác → 404.',
        en: 'Missing scope → 403; another tenant’s object → 404.'
      },
      codeLineMatch: '@PreAuthorize("hasAuthority(\'SCOPE_orders.write\')")'
    },
    {
      id: 'dto',
      title: { vi: 'DTO chặn mass assignment', en: 'DTOs block mass assignment' },
      phase: 'Bind',
      description: {
        vi: 'Record chỉ có productId và quantity; "price" và "role" trong JSON bị bỏ qua.',
        en: 'The record has only productId and quantity; "price" and "role" in the JSON are ignored.'
      },
      systemBehavior: {
        vi: 'Giá luôn lấy từ catalog phía server.',
        en: 'The price always comes from the server-side catalog.'
      },
      codeLineMatch: 'record CreateOrderRequest('
    },
    {
      id: 'validate',
      title: { vi: 'Validate theo allowlist', en: 'Allowlist validation' },
      phase: 'Validate',
      description: {
        vi: '@Valid kiểm tra quantity 1..50 và productId dương trước khi vào logic.',
        en: '@Valid checks quantity 1..50 and a positive productId before any logic runs.'
      },
      systemBehavior: {
        vi: 'Sai → 400 ProblemDetail liệt kê field lỗi, không kèm stack trace.',
        en: 'Invalid → 400 ProblemDetail listing bad fields, no stack trace.'
      },
      codeLineMatch: '@Valid @RequestBody CreateOrderRequest'
    },
    {
      id: 'rate-limit',
      title: { vi: 'Rate limit token bucket', en: 'Token-bucket rate limiting' },
      phase: 'Throttle',
      description: {
        vi: 'Mỗi client 20 burst, 5 request/giây; vượt thì 429 kèm Retry-After.',
        en: 'Each client gets a burst of 20 and 5 requests/second; over that, 429 with Retry-After.'
      },
      systemBehavior: {
        vi: 'Bucket lưu trong Redis để mọi replica dùng chung.',
        en: 'Buckets live in Redis so every replica shares them.'
      },
      codeLineMatch: 'bucket.tryConsume(1)'
    },
    {
      id: 'errors-audit',
      title: { vi: 'Lỗi an toàn & audit log', en: 'Safe errors & audit log' },
      phase: 'Respond',
      description: {
        vi: 'Exception nội bộ → ProblemDetail 500 chung chung kèm correlation ID; chi tiết chỉ ở log server.',
        en: 'Internal exceptions → a generic 500 ProblemDetail with a correlation ID; details only in server logs.'
      },
      systemBehavior: {
        vi: 'Audit log ghi actor, action, target, result cho thao tác ghi.',
        en: 'The audit log records actor, action, target and result for writes.'
      },
      codeLineMatch: 'ProblemDetail.forStatus'
    }
  ],

  comparison: {
    title: { vi: 'API key vs OAuth access token', en: 'API key vs OAuth access token' },
    subtitle: {
      vi: 'Định danh ứng dụng hay uỷ quyền có giới hạn',
      en: 'Identifying an application vs bounded delegation'
    },
    options: [
      {
        name: 'API key',
        tag: 'Static secret',
        role: { vi: 'Định danh ứng dụng client', en: 'Identifies a client application' },
        keyMechanism: {
          vi: 'Dài hạn, không có người dùng, khó giới hạn scope; xoay thủ công.',
          en: 'Long-lived, no user, hard to scope; rotated manually.'
        },
        configExample: 'X-Api-Key: <key>   (header, never the URL)',
        architectureNote: {
          vi: 'Hợp cho metering, quota, định danh đối tác; kết hợp với allowlist IP/mTLS.',
          en: 'Fits metering, quotas, partner identification; combine with IP allowlists/mTLS.'
        }
      },
      {
        name: 'OAuth access token',
        tag: 'Scoped, short-lived',
        role: {
          vi: 'Uỷ quyền thay mặt người dùng/client',
          en: 'Delegation on behalf of a user/client'
        },
        keyMechanism: {
          vi: 'Có scope, audience, hạn ngắn; phát hành và thu hồi tập trung.',
          en: 'Scoped, audience-bound, short-lived; issued and revoked centrally.'
        },
        configExample: 'Authorization: Bearer <JWT aud=orders-api scope=orders.write>',
        architectureNote: {
          vi: 'Mặc định cho API có người dùng hoặc giữa các service.',
          en: 'The default for user-facing and service-to-service APIs.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Mỗi lớp chặn một nhóm rủi ro của API Top 10 ở đúng chỗ.',
        en: 'Each layer stops one API Top 10 risk class at the right place.'
      },
      {
        vi: 'DTO và validation còn làm hợp đồng API rõ ràng hơn.',
        en: 'DTOs and validation also make the API contract clearer.'
      }
    ],
    cons: [
      {
        vi: 'Nhiều DTO và mapping hơn — thêm code phải bảo trì.',
        en: 'More DTOs and mapping — more code to maintain.'
      },
      {
        vi: 'Rate limit quá chặt làm hỏng client hợp lệ khi có đột biến.',
        en: 'Overly tight rate limits break legitimate clients during spikes.'
      }
    ],
    balance: {
      vi: 'Đặt giới hạn theo phân tích lưu lượng thật, riêng cho từng loại client và luồng nghiệp vụ nhạy cảm (đăng nhập, thanh toán, gửi OTP).',
      en: 'Set limits from real traffic analysis, separately per client type and per sensitive business flow (login, payment, OTP sending).'
    },
    invariant: {
      vi: 'Server không bao giờ tin field, giá hay quyền do client gửi lên; mọi quyết định dựa trên dữ liệu phía server.',
      en: 'The server never trusts client-supplied fields, prices or permissions; every decision uses server-side data.'
    }
  },

  code: [
    {
      label: 'OrderApi.java',
      filename: 'OrderApi.java',
      language: 'java',
      code: `// Request DTO: only the fields a client may set (no price, ownerId, role, status)
record CreateOrderRequest(
    @NotNull @Positive Long productId,
    @NotNull @Min(1) @Max(50) Integer quantity) {}

@RestController
@RequestMapping("/v2/orders")
class OrderApi {

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_orders.write')")
    ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req,
                                         @AuthenticationPrincipal Jwt jwt) {
        Bucket bucket = limiter.bucketFor(jwt.getClaimAsString("client_id"));   // B=20, r=5/s
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(429).header("Retry-After", "1").build();
        }
        Product p = catalog.require(req.productId());                 // price from the server
        Order o = orders.place(jwt.getSubject(), p, req.quantity());
        audit.record(jwt.getSubject(), "order.create", o.id(), "SUCCESS");
        return ResponseEntity.status(201).body(OrderResponse.from(o)); // response DTO, no internals
    }
}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception e) {
        String correlationId = MDC.get("traceId");
        log.error("unhandled error correlationId={}", correlationId, e);  // details stay server-side
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setDetail("Unexpected error. Reference: " + correlationId);
        return pd;
    }
}`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Mass assignment là gì và phòng thủ thế nào trong Spring?',
        en: 'What is mass assignment and how do you defend against it in Spring?'
      },
      answer: {
        vi: 'Khi framework bind tự động mọi field JSON vào object, client có thể đặt field không được phép như role, price, ownerId. Phòng thủ: DTO riêng cho từng thao tác chỉ chứa field được phép (record), map tường minh sang entity, không bao giờ dùng entity làm @RequestBody; và với response cũng trả DTO để không lộ field nội bộ.',
        en: 'When the framework auto-binds every JSON field into an object, clients can set forbidden fields such as role, price or ownerId. Defence: a per-operation DTO (a record) with only the allowed fields, explicit mapping to the entity, never an entity as @RequestBody; and DTOs for responses too, so internal fields do not leak.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Thiết kế rate limiting cho API công khai chạy 20 replica.',
        en: 'Design rate limiting for a public API running 20 replicas.'
      },
      answer: {
        vi: 'Token bucket theo khoá client (client_id, API key, hoặc IP cho request chưa xác thực) lưu trong Redis với thao tác atomic (Lua/Bucket4j) để mọi replica dùng chung. Giới hạn riêng cho luồng nhạy cảm (đăng nhập, gửi OTP, thanh toán), trả 429 + Retry-After, và đặt giới hạn thô ở gateway để chặn sớm. Theo dõi tỷ lệ 429 để chỉnh B và r.',
        en: 'Token buckets keyed by client (client_id, API key, or IP for unauthenticated calls) stored in Redis with atomic operations (Lua/Bucket4j) so all replicas share them. Separate limits for sensitive flows (login, OTP sending, payments), return 429 + Retry-After, and put a coarse limit at the gateway to reject early. Monitor the 429 rate to tune B and r.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.owaspApiTop10,
    SECURITY_CITATIONS.owaspAuthorization,
    SECURITY_CITATIONS.springMethodSecurity
  ]
};
