import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const authorizationModelsTopic: SecurityTopic = {
  id: 'authorization-rbac-abac-rebac',
  roadmapId: 'SEC-05',
  category: 'sec-authn-authz',
  level: 'intermediate',
  chapter: 'Cấp độ 2',
  name: 'Authorization Models: RBAC, ABAC & ReBAC',
  tagline: {
    vi: 'User, role, permission, resource, policy; RBAC theo vai trò, ABAC theo thuộc tính của subject/resource/môi trường, ReBAC theo quan hệ kiểu Zanzibar; resource-level authorization, role hierarchy, least privilege và deny-by-default.',
    en: 'Users, roles, permissions, resources, policies; role-based RBAC, attribute-based ABAC over subject/resource/environment, Zanzibar-style relationship-based ReBAC; resource-level authorization, role hierarchies, least privilege and deny by default.'
  },
  difficulty: 2,
  order: 5,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Ứng dụng bắt đầu với hai role USER và ADMIN. Sau một năm: "manager chỉ duyệt chi phí của phòng mình, dưới hạn mức, không tự duyệt của chính mình", "người được share tài liệu được xem, người được share thư mục cha cũng được xem". Kết quả là hàng trăm role như FINANCE_MANAGER_UNDER_5000 và các if rải khắp controller — và một endpoint quên kiểm tra quyền trên đúng object.',
      en: 'The app starts with two roles, USER and ADMIN. A year later: "managers approve expenses only for their own department, under their limit, never their own", "people a document is shared with may view it, and so may people the parent folder is shared with". The result is hundreds of roles like FINANCE_MANAGER_UNDER_5000 and ifs scattered through controllers — plus one endpoint that forgets to check access on the specific object.'
    },
    hardwareConstraint: {
      vi: 'Quyết định phân quyền nằm trên đường nóng của mọi request nên phải nhanh (micro tới mili giây), nhưng dữ liệu cần để quyết định (thuộc tính, quan hệ) nằm rải rác ở nhiều service và thay đổi liên tục.',
      en: 'Authorization decisions sit on the hot path of every request and must be fast (micro- to milliseconds), yet the data they need (attributes, relationships) is spread across services and changes constantly.'
    },
    fundamentalSolution: {
      vi: 'Chọn mô hình theo hình dạng của quy tắc. RBAC: user được gán role, role gom permission — đơn giản, dễ audit, hợp cho quyền chức năng thô. ABAC: policy đánh giá thuộc tính của subject (phòng ban, hạn mức), resource (chủ sở hữu, số tiền), hành động và môi trường (giờ, IP) — biểu diễn quy tắc ngữ cảnh mà không bùng nổ role. ReBAC: quyền suy ra từ đồ thị quan hệ (user là member của group, group là viewer của folder, folder là parent của document) — hợp cho chia sẻ và phân cấp. Trong mọi trường hợp: deny by default, kiểm tra quyền trên đúng object ở mọi request, least privilege.',
      en: 'Pick the model that fits the shape of the rules. RBAC: users get roles, roles bundle permissions — simple, auditable, good for coarse functional rights. ABAC: a policy evaluates attributes of the subject (department, limit), resource (owner, amount), action and environment (time, IP) — expressing contextual rules without a role explosion. ReBAC: permissions follow a relationship graph (user is a member of a group, the group is a viewer of a folder, the folder is the parent of a document) — ideal for sharing and hierarchies. In every case: deny by default, check access on the specific object on every request, least privilege.'
    },
    math: {
      formula: String.raw`\text{RBAC: } \exists r\,[(u,r)\in UA \wedge (r,p)\in PA] \quad \text{ABAC: } f(s,o,a,e) \quad \text{ReBAC: } u \xrightarrow{\;\text{rel}^{*}\;} o`,
      description: {
        vi: 'RBAC cho phép khi tồn tại role nối user (UA) với permission (PA). ABAC là hàm boolean trên thuộc tính của subject, object, action, environment. ReBAC cho phép khi có đường đi trong đồ thị quan hệ từ user tới object qua các quan hệ được policy định nghĩa (viewer ⊇ editor ⊇ owner, kế thừa qua parent).',
        en: 'RBAC allows when some role links the user (UA) to the permission (PA). ABAC is a boolean function of subject, object, action and environment attributes. ReBAC allows when a path exists in the relationship graph from the user to the object through relations the policy defines (viewer ⊇ editor ⊇ owner, inherited through parent).'
      },
      timeComplexity: 'RBAC O(roles); ABAC O(rules); ReBAC O(graph depth) with caching',
      spaceComplexity: 'RBAC O(users·roles); ReBAC O(relationship tuples)'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Authorization trả lời "subject S có được thực hiện action A trên resource R trong ngữ cảnh E không?". Các mô hình khác nhau ở chỗ lấy dữ liệu gì để trả lời.',
      en: 'Authorization answers "may subject S perform action A on resource R in context E?". The models differ in which data they use to answer.'
    },
    deepDiveParagraphs: [
      {
        vi: 'RBAC: user → role → permission. Role hierarchy cho phép role cao kế thừa quyền của role thấp (ADMIN ⊇ EDITOR ⊇ VIEWER); separation of duty cấm một người giữ hai role xung đột (người tạo và người duyệt thanh toán). Giới hạn của RBAC là nó không biết gì về resource cụ thể: "EDITOR được sửa tài liệu" không trả lời được "tài liệu NÀO".',
        en: 'RBAC: user → role → permission. Role hierarchies let higher roles inherit lower ones (ADMIN ⊇ EDITOR ⊇ VIEWER); separation of duty forbids one person holding two conflicting roles (payment creator and approver). RBAC’s limit is that it knows nothing about the specific resource: "EDITOR may edit documents" cannot say WHICH documents.'
      },
      {
        vi: 'ABAC (NIST SP 800-162): quyết định dựa trên thuộc tính của subject, object, thao tác và môi trường so với policy. Kiến trúc chuẩn tách PEP (điểm chặn request, ví dụ filter hoặc gateway) khỏi PDP (engine đánh giá policy, ví dụ OPA, Cedar) và PIP (nơi lấy thuộc tính). Policy viết tách khỏi code nên đổi quy tắc không cần deploy lại service.',
        en: 'ABAC (NIST SP 800-162): decisions evaluate subject, object, operation and environment attributes against policy. The standard architecture separates the PEP (where the request is intercepted, e.g. a filter or gateway) from the PDP (the policy engine, e.g. OPA, Cedar) and the PIP (where attributes come from). Policies live outside the code, so rule changes need no service redeploy.'
      },
      {
        vi: 'ReBAC: Google Zanzibar lưu quyền dưới dạng tuple quan hệ object#relation@subject, ví dụ document:roadmap#viewer@group:eng#member. Kiểm tra quyền là duyệt đồ thị; schema định nghĩa quan hệ suy ra (editor kéo theo viewer, viewer của folder cha kéo theo viewer của document). OpenFGA, SpiceDB là hiện thực mã nguồn mở. ReBAC giải tự nhiên bài toán chia sẻ và phân cấp mà RBAC/ABAC phải mô phỏng rất vất vả.',
        en: 'ReBAC: Google Zanzibar stores permissions as relation tuples object#relation@subject, e.g. document:roadmap#viewer@group:eng#member. A check is a graph traversal; the schema defines derived relations (editor implies viewer, a viewer of the parent folder is a viewer of the document). OpenFGA and SpiceDB are open-source implementations. ReBAC naturally solves sharing and hierarchy, which RBAC/ABAC model only awkwardly.'
      },
      {
        vi: 'Resource-level authorization: lỗ hổng phổ biến nhất (OWASP A01, API1 BOLA) là kiểm tra "đã đăng nhập" mà không kiểm tra "được truy cập object này". Mỗi request phải kiểm tra quyền trên đúng object được yêu cầu; đổi ID sang UUID không thay thế được kiểm tra này. Deny by default nghĩa là route hay action không có rule nào khớp thì bị từ chối.',
        en: 'Resource-level authorization: the most common hole (OWASP A01, API1 BOLA) is checking "logged in" without checking "allowed to access this object". Every request must check access on the specific object requested; switching IDs to UUIDs does not replace that check. Deny by default means a route or action with no matching rule is rejected.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Role explosion: tạo role cho từng tổ hợp phòng ban × hạn mức × khu vực thay vì dùng thuộc tính.',
        en: 'Role explosion: a role for every department × limit × region combination instead of attributes.'
      },
      {
        vi: 'IDOR: GET /orders/{id} chỉ kiểm tra token hợp lệ, không kiểm tra order thuộc về user.',
        en: 'IDOR: GET /orders/{id} checks only that the token is valid, not that the order belongs to the user.'
      },
      {
        vi: 'Quyết định phân quyền dựa trên dữ liệu client gửi lên (role trong body, isAdmin trong localStorage).',
        en: 'Authorization decisions based on client-supplied data (a role in the body, isAdmin in localStorage).'
      },
      {
        vi: 'Cache quyết định phân quyền quá lâu: user bị thu hồi quyền vẫn truy cập được hàng giờ.',
        en: 'Caching authorization decisions too long: a user whose access was revoked keeps it for hours.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'PEP, PDP và ba mô hình', en: 'PEP, PDP and three models' },
    description: {
      vi: 'Service chặn request (PEP), hỏi engine (PDP) với subject, action, resource, context.',
      en: 'The service intercepts the request (PEP) and asks the engine (PDP) with subject, action, resource and context.'
    },
    asciiDiagram: `
 request: alice APPROVE expense/77                         PDP (OPA · Cedar · OpenFGA)
 ┌──────────────────────┐   check(s, a, r, ctx)   ┌─────────────────────────────────────────┐
 │ PEP: filter /        │ ──────────────────────► │ RBAC   alice ∈ MANAGER, MANAGER→approve ✓│
 │ @PreAuthorize        │                         │ ABAC   dept = dept ✓ amount ≤ limit ✓    │
 │ (deny by default)    │ ◄────── ALLOW / DENY ── │        submitter ≠ alice ✓ 09–18h ✓      │
 └──────────────────────┘                         │ ReBAC  doc:q3#viewer@group:eng#member    │
            ▲ attributes, tuples (PIP)            │        alice ∈ group:eng → viewer ✓      │
            └─────────── HR system · DB · FGA store └─────────────────────────────────────────┘
`,
    components: [
      {
        name: 'Subject / Resource',
        role: 'Who · what',
        description: {
          vi: 'User/service và object được truy cập, kèm thuộc tính.',
          en: 'The user/service and the accessed object, with attributes.'
        }
      },
      {
        name: 'PEP',
        role: 'Enforcement',
        description: {
          vi: 'Chặn request và áp dụng quyết định — filter, interceptor, gateway.',
          en: 'Intercepts the request and applies the decision — filter, interceptor, gateway.'
        }
      },
      {
        name: 'PDP',
        role: 'Decision',
        description: {
          vi: 'Đánh giá policy, trả ALLOW/DENY.',
          en: 'Evaluates policy and returns ALLOW/DENY.'
        }
      },
      {
        name: 'Policy / tuples',
        role: 'Rules',
        description: {
          vi: 'Quy tắc ABAC hoặc tuple quan hệ ReBAC, quản lý tách khỏi code.',
          en: 'ABAC rules or ReBAC relation tuples, managed outside the code.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'rbac',
      title: { vi: 'RBAC: role → permission', en: 'RBAC: role → permission' },
      phase: 'Coarse',
      description: {
        vi: 'alice có role MANAGER, MANAGER có quyền expense:approve — kiểm tra thô theo chức năng.',
        en: 'alice has MANAGER and MANAGER holds expense:approve — a coarse functional check.'
      },
      systemBehavior: {
        vi: 'Chưa biết expense nào: mọi manager đều qua bước này.',
        en: 'It does not know which expense: every manager passes this step.'
      },
      codeLineMatch: 'hasRole("MANAGER")'
    },
    {
      id: 'abac',
      title: { vi: 'ABAC: thuộc tính & ngữ cảnh', en: 'ABAC: attributes & context' },
      phase: 'Fine',
      description: {
        vi: 'Cùng phòng ban, số tiền ≤ hạn mức, không tự duyệt của mình, trong giờ làm việc.',
        en: 'Same department, amount ≤ limit, not one’s own expense, within working hours.'
      },
      systemBehavior: {
        vi: 'Một quy tắc thay cho hàng chục role tổ hợp.',
        en: 'One rule replaces dozens of combinatorial roles.'
      },
      codeLineMatch: '@abac.canApprove'
    },
    {
      id: 'rebac',
      title: { vi: 'ReBAC: duyệt đồ thị quan hệ', en: 'ReBAC: traverse the relationship graph' },
      phase: 'Relations',
      description: {
        vi: 'alice là member của group:eng, group:eng là viewer của document → alice được xem.',
        en: 'alice is a member of group:eng and group:eng is a viewer of the document → alice may view.'
      },
      systemBehavior: {
        vi: 'Engine (OpenFGA/SpiceDB) trả lời check bằng cách duyệt tuple.',
        en: 'The engine (OpenFGA/SpiceDB) answers the check by traversing tuples.'
      },
      codeLineMatch: 'fga.check('
    },
    {
      id: 'object-level',
      title: { vi: 'Deny by default trên từng object', en: 'Deny by default on each object' },
      phase: 'Enforce',
      description: {
        vi: 'User 42 gọi GET /orders/43: không khớp chủ sở hữu → từ chối, dù token hợp lệ.',
        en: 'User 42 calls GET /orders/43: owner mismatch → denied, even with a valid token.'
      },
      systemBehavior: {
        vi: 'Route không có rule khớp cũng bị từ chối (denyAll).',
        en: 'Routes with no matching rule are rejected too (denyAll).'
      },
      codeLineMatch: 'o.ownerId().equals(userId)'
    }
  ],

  comparison: {
    title: { vi: 'RBAC vs ABAC vs ReBAC', en: 'RBAC vs ABAC vs ReBAC' },
    subtitle: {
      vi: 'Ba cách mô hình hoá cùng một câu hỏi',
      en: 'Three ways to model the same question'
    },
    options: [
      {
        name: 'RBAC',
        tag: 'Roles',
        role: { vi: 'Quyền theo chức danh', en: 'Rights by job function' },
        keyMechanism: {
          vi: 'User → role → permission; dễ audit "ai có quyền gì".',
          en: 'User → role → permission; easy to audit "who can do what".'
        },
        configExample: '.requestMatchers("/admin/**").hasRole("ADMIN")',
        architectureNote: {
          vi: 'Hợp cho quyền chức năng thô; không biết về object cụ thể.',
          en: 'Fits coarse functional rights; blind to specific objects.'
        }
      },
      {
        name: 'ABAC',
        tag: 'Attributes',
        role: { vi: 'Quyền theo ngữ cảnh', en: 'Rights by context' },
        keyMechanism: {
          vi: 'Policy trên thuộc tính subject, resource, action, environment.',
          en: 'Policies over subject, resource, action and environment attributes.'
        },
        configExample:
          'permit when principal.dept == resource.dept && resource.amount <= principal.limit',
        architectureNote: {
          vi: 'Linh hoạt nhưng khó trả lời "ai có thể truy cập R?".',
          en: 'Flexible, but hard to answer "who can access R?".'
        }
      },
      {
        name: 'ReBAC',
        tag: 'Relationships',
        role: { vi: 'Quyền theo quan hệ', en: 'Rights by relationship' },
        keyMechanism: {
          vi: 'Tuple object#relation@subject, quyền suy ra qua đồ thị.',
          en: 'Tuples object#relation@subject, permissions derived through the graph.'
        },
        configExample: 'document:q3#viewer@group:eng#member',
        architectureNote: {
          vi: 'Chia sẻ, thư mục, tổ chức nhiều cấp (Google Drive, GitHub).',
          en: 'Sharing, folders, multi-level orgs (Google Drive, GitHub).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Mô hình rõ ràng giúp audit và kiểm thử phân quyền theo bảng.',
        en: 'An explicit model makes authorization auditable and table-testable.'
      },
      {
        vi: 'Policy tách khỏi code: đổi quy tắc không cần sửa từng controller.',
        en: 'Policies outside the code: rule changes do not touch every controller.'
      }
    ],
    cons: [
      {
        vi: 'Engine tập trung thêm một phụ thuộc trên đường nóng — cần cache và phương án khi engine sập.',
        en: 'A central engine adds a hot-path dependency — it needs caching and a plan for outages.'
      },
      {
        vi: 'ABAC/ReBAC khó lý giải hơn; cần công cụ giải thích vì sao ALLOW/DENY.',
        en: 'ABAC/ReBAC are harder to reason about; you need tooling that explains each ALLOW/DENY.'
      }
    ],
    balance: {
      vi: 'Kết hợp: RBAC cho quyền chức năng, ABAC cho ràng buộc ngữ cảnh, ReBAC cho chia sẻ; khi engine không trả lời được thì fail closed.',
      en: 'Combine them: RBAC for functional rights, ABAC for contextual constraints, ReBAC for sharing; when the engine cannot answer, fail closed.'
    },
    invariant: {
      vi: 'Không có rule cho phép rõ ràng thì từ chối, và quyền luôn được kiểm tra trên đúng object ở mỗi request.',
      en: 'Without an explicit allow rule the answer is deny, and access is always checked on the specific object on each request.'
    }
  },

  code: [
    {
      label: 'Authorization.java',
      filename: 'Authorization.java',
      language: 'java',
      code: `// 1) RBAC — coarse functional rights, deny by default
http.authorizeHttpRequests(a -> a
    .requestMatchers(HttpMethod.POST, "/api/expenses/*/approve").hasRole("MANAGER")
    .requestMatchers("/api/**").authenticated()
    .anyRequest().denyAll());

// 2) ABAC — subject, resource and environment attributes
@PreAuthorize("@abac.canApprove(authentication, #expense)")
public void approve(Expense expense) { /* ... */ }

@Component("abac")
class ExpensePolicy {
    boolean canApprove(Authentication auth, Expense e) {
        Jwt u = (Jwt) auth.getPrincipal();
        return u.getClaimAsString("department").equals(e.department())
            && e.amount().compareTo(new BigDecimal(u.getClaimAsString("approval_limit"))) <= 0
            && !e.submitterId().equals(u.getSubject())                   // separation of duty
            && LocalTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).getHour() < 18;
    }
}

// 3) ReBAC — relation tuples in OpenFGA: document:q3#viewer@group:eng#member
boolean canView = fga.check("user:" + userId, "viewer", "document:" + docId);

// 4) Object-level check on every request (prevents IDOR / BOLA)
Order order = orders.findById(id)
    .filter(o -> o.ownerId().equals(userId))
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));`
    },
    {
      label: 'model.fga',
      filename: 'model.fga',
      language: 'typescript',
      code: `model
  schema 1.1

type user
type group
  relations
    define member: [user]
type folder
  relations
    define viewer: [user, group#member]
type document
  relations
    define parent: [folder]
    define owner: [user]
    define editor: [user, group#member] or owner
    define viewer: [user, group#member] or editor or viewer from parent`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Khi nào RBAC không còn đủ và bạn chuyển sang ABAC hoặc ReBAC?',
        en: 'When is RBAC no longer enough, and when do you move to ABAC or ReBAC?'
      },
      answer: {
        vi: 'Khi quy tắc phụ thuộc vào thuộc tính của resource hoặc ngữ cảnh (cùng phòng ban, dưới hạn mức, giờ làm việc) thì chuyển sang ABAC thay vì tạo role tổ hợp. Khi quyền đến từ quan hệ và kế thừa (chia sẻ tài liệu, thư mục cha, thành viên team) thì ReBAC mô hình tự nhiên hơn. RBAC vẫn giữ cho quyền chức năng thô.',
        en: 'When rules depend on resource or context attributes (same department, under a limit, working hours), move to ABAC instead of creating combinatorial roles. When access comes from relationships and inheritance (document sharing, parent folders, team membership), ReBAC models it naturally. RBAC remains for coarse functional rights.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Endpoint GET /invoices/{id} trả hoá đơn của người khác. Sửa thế nào cho cả hệ thống?',
        en: 'GET /invoices/{id} returns other people’s invoices. How do you fix it system-wide?'
      },
      answer: {
        vi: 'Đây là BOLA/IDOR. Sửa endpoint bằng kiểm tra quyền trên đúng object (truy vấn theo id VÀ owner, hoặc gọi policy check). Cho cả hệ thống: đặt kiểm tra ở tầng chung (repository có scope theo tenant/user, policy engine), deny by default, test tự động cho từng role × resource, và trả 404 thay vì 403 khi không muốn lộ sự tồn tại của object.',
        en: 'This is BOLA/IDOR. Fix the endpoint with an access check on the specific object (query by id AND owner, or call a policy check). System-wide: put the check in a shared layer (tenant/user-scoped repositories, a policy engine), deny by default, add automated tests per role × resource, and return 404 rather than 403 when you do not want to reveal the object exists.'
      },
      trapWarning: {
        vi: 'Đổi ID sang UUID không phải bản vá — ID vẫn lộ qua URL, log, chia sẻ.',
        en: 'Switching IDs to UUIDs is not a fix — IDs still leak through URLs, logs and sharing.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.owaspAuthorization,
    SECURITY_CITATIONS.nist800162,
    SECURITY_CITATIONS.zanzibar
  ]
};
