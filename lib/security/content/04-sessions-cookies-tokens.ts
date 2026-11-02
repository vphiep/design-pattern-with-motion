import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const sessionsTokensPasswordsTopic: SecurityTopic = {
  id: 'sessions-tokens-passwords',
  roadmapId: 'SEC-04',
  category: 'sec-authn-authz',
  level: 'intermediate',
  chapter: 'Cấp độ 2',
  name: 'Authentication: Session, Cookie & Token',
  tagline: {
    vi: 'Stateful vs stateless authentication: session id trong cookie HttpOnly/Secure/SameSite, session fixation, bearer token, access token ngắn hạn + refresh token xoay vòng, vòng đời token và logout thật sự huỷ được phiên.',
    en: 'Stateful vs stateless authentication: a session id in an HttpOnly/Secure/SameSite cookie, session fixation, bearer tokens, short-lived access tokens + rotating refresh tokens, the token lifecycle and a logout that really ends the session.'
  },
  difficulty: 2,
  order: 4,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'HTTP không có trạng thái: mỗi request phải tự chứng minh "tôi là ai". Gửi mật khẩu ở mọi request là bất khả thi; lưu mật khẩu dạng có thể khôi phục là thảm hoạ khi DB bị lộ; còn cookie tự động đính kèm mở ra tấn công CSRF.',
      en: 'HTTP is stateless: every request must prove “who am I”. Sending the password on every request is impractical; storing recoverable passwords is a disaster when the DB leaks; and auto-attached cookies open the door to CSRF.'
    },
    hardwareConstraint: {
      vi: 'Trình duyệt tự động đính kèm cookie cho mọi request tới domain, kể cả request do trang khác kích hoạt. Token tự chứa thì không thể "gọi lại" sau khi đã phát hành: nó hợp lệ tới khi hết hạn, bất kể người dùng đã logout hay bị khoá.',
      en: 'Browsers automatically attach cookies to every request to the domain, even requests triggered by other pages. A self-contained token cannot be "recalled" once issued: it stays valid until it expires, whether or not the user has logged out or been disabled.'
    },
    fundamentalSolution: {
      vi: 'Xác thực một lần (mật khẩu + MFA, SEC-06), rồi phát hành một bằng chứng để các request sau dùng lại. Stateful: session id ngẫu nhiên ≥128 bit trỏ tới dữ liệu phiên trên server, gửi trong cookie HttpOnly (JS không đọc được), Secure (chỉ HTTPS), SameSite=Lax/Strict; đổi id khi đăng nhập để chống session fixation; logout = xoá phiên trên server. Stateless: bearer access token (thường là JWT) có thời hạn ngắn đi trong header Authorization, kèm refresh token dài hạn được xoay vòng mỗi lần dùng; logout = thu hồi refresh token và để access token tự hết hạn.',
      en: 'Authenticate once (password + MFA, SEC-06), then issue a proof that later requests reuse. Stateful: a random ≥128-bit session id pointing to session data on the server, sent in a cookie that is HttpOnly (no JS access), Secure (HTTPS only) and SameSite=Lax/Strict; rotate the id at login to stop session fixation; logout = delete the session on the server. Stateless: a short-lived bearer access token (often a JWT) in the Authorization header, plus a long-lived refresh token rotated on every use; logout = revoke the refresh token and let the access token expire.'
    },
    math: {
      formula: String.raw`W_{\text{abuse}} = \begin{cases} t_{\text{detect}} & \text{server session (deleted on logout)} \\ t_{\text{detect}} + \text{TTL}_{\text{access}} & \text{self-contained access token} \end{cases}`,
      description: {
        vi: 'Cửa sổ kẻ tấn công dùng được credential bị đánh cắp. Với session server-side, xoá phiên là chấm dứt ngay. Với access token tự chứa, sau khi phát hiện và thu hồi refresh token, access token vẫn sống tới hết TTL — vì vậy access token nên sống vài phút, không phải vài ngày.',
        en: 'The window in which an attacker can use a stolen credential. With a server-side session, deleting it ends access immediately. With a self-contained access token, after detection and refresh-token revocation the access token still lives until its TTL — so access tokens should live minutes, not days.'
      },
      timeComplexity: 'Session: one store lookup per request; JWT: one signature check',
      spaceComplexity: 'Session: O(active sessions) on the server; token: O(1) on the server'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Authentication (AuthN) trả lời "bạn là ai"; Authorization (AuthZ) trả lời "bạn được làm gì". OAuth (SEC-07, SEC-08) là AuthZ; OIDC (SEC-10) thêm AuthN.',
      en: 'Authentication (AuthN) answers “who are you”; Authorization (AuthZ) answers “what may you do”. OAuth (SEC-07, SEC-08) is AuthZ; OIDC (SEC-10) adds AuthN.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Session server-side vs token tự chứa: session id chỉ là con trỏ tới dữ liệu trên server (Redis), thu hồi tức thì bằng cách xoá. Token tự chứa (JWT) mang claims bên trong, không cần tra cứu nhưng khó thu hồi trước khi hết hạn. Với ứng dụng web truyền thống, session + cookie vẫn là lựa chọn an toàn và đơn giản nhất.',
        en: 'Server-side sessions vs self-contained tokens: a session id is a pointer to server data (Redis), revocable instantly by deletion. Self-contained tokens (JWT) carry claims inside, need no lookup but are hard to revoke before expiry. For classic web apps, sessions + cookies remain the safest and simplest choice.'
      },
      {
        vi: 'CSRF: trang độc hại khiến trình duyệt gửi POST tới bank.com kèm cookie của nạn nhân. SameSite=Lax (mặc định của Chrome cho cookie không khai báo) chặn cookie trong POST cross-site, nhưng vẫn nên có CSRF token (synchronizer hoặc double-submit) cho thao tác nhạy cảm và kiểm tra Origin header.',
        en: 'CSRF: a malicious page makes the browser POST to bank.com with the victim’s cookie. SameSite=Lax (Chrome’s default for undeclared cookies) blocks cookies on cross-site POSTs, but sensitive actions should still use a CSRF token (synchronizer or double-submit) and check the Origin header.'
      },
      {
        vi: 'Bearer token: ai cầm token là dùng được, giống tiền mặt (RFC 6750) — nên chỉ gửi qua HTTPS, không đặt trong URL (lọt vào log, Referer). Access token ngắn hạn (5–15 phút) giới hạn thiệt hại khi bị lộ; refresh token dài hạn chỉ gửi tới authorization server. Refresh token rotation: mỗi lần dùng nhận refresh token mới và vô hiệu cái cũ; nếu cái cũ bị dùng lại, server thu hồi cả "family" vì đó là dấu hiệu bị đánh cắp.',
        en: 'Bearer tokens: whoever holds the token can use it, like cash (RFC 6750) — so send them only over HTTPS and never in URLs (they leak into logs and Referer). Short-lived access tokens (5–15 minutes) limit damage when leaked; long-lived refresh tokens go only to the authorization server. Refresh token rotation: each use returns a new refresh token and invalidates the old one; if the old one is replayed, the server revokes the whole "family" because that signals theft.'
      },
      {
        vi: 'Logout và vô hiệu hoá phiên: xoá cookie phía client là chưa đủ — kẻ đã copy session id vẫn dùng được. Logout đúng phải xoá phiên trên server (session.invalidate()), thu hồi refresh token, và với SSO thì gọi end-session của IdP. Thêm idle timeout (ví dụ 30 phút không hoạt động) và absolute timeout (ví dụ 8 giờ), và huỷ mọi phiên khi người dùng đổi mật khẩu.',
        en: 'Logout and session invalidation: deleting the cookie on the client is not enough — anyone who copied the session id can still use it. A real logout deletes the server session (session.invalidate()), revokes refresh tokens and, with SSO, calls the IdP end-session endpoint. Add an idle timeout (e.g. 30 minutes inactive) and an absolute timeout (e.g. 8 hours), and kill all sessions when the user changes their password.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Lưu JWT/session trong localStorage: bất kỳ XSS nào cũng đọc được và gửi đi.',
        en: 'Storing JWTs/sessions in localStorage: any XSS can read and exfiltrate them.'
      },
      {
        vi: 'Access token sống 24 giờ "cho đỡ phải refresh": token lộ ra là dùng được cả ngày, không thu hồi được.',
        en: 'Access tokens living 24 hours "to avoid refreshing": a leaked token works all day and cannot be revoked.'
      },
      {
        vi: 'Logout chỉ xoá cookie/localStorage ở client mà không xoá phiên hay thu hồi refresh token ở server.',
        en: 'Logout that only clears the cookie/localStorage on the client without deleting the session or revoking the refresh token.'
      },
      {
        vi: 'Không đổi session id sau đăng nhập → kẻ tấn công cài sẵn id và chiếm phiên.',
        en: 'Not rotating the session id after login → an attacker plants an id and hijacks the session.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Đăng nhập bằng mật khẩu và phiên cookie',
      en: 'Password login and a cookie session'
    },
    description: {
      vi: 'Server so hash, tạo session, trả cookie có cờ bảo mật; request sau gửi cookie tự động.',
      en: 'The server verifies the hash, creates a session and returns a hardened cookie; later requests send it automatically.'
    },
    asciiDiagram: `
 Browser                                   App server                       Redis / DB
   │ POST /login {email, password}  ──────▶ │ argon2id.verify(hash, pw)  ◀──── users.password_hash
   │                                        │   $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
   │                                        │ session.invalidate(); new id (128-bit CSPRNG)
   │ ◀── Set-Cookie: SID=k3J…; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1800
   │                                        │ SET sess:k3J… {userId: 42, roles:[…]} EX 1800 ──▶
   │ GET /orders  Cookie: SID=k3J…  ───────▶ │ GET sess:k3J…  ─────────────────────────────────▶
   │ POST /transfer  + X-CSRF-Token  ──────▶ │ verify CSRF token + Origin
`,
    components: [
      {
        name: 'Argon2id',
        role: 'Password hash',
        description: {
          vi: 'Memory-hard, chống GPU/ASIC; tham số lưu cùng hash.',
          en: 'Memory-hard, GPU/ASIC resistant; parameters stored with the hash.'
        }
      },
      {
        name: 'Session store',
        role: 'Server state',
        description: {
          vi: 'Redis/DB; thu hồi tức thì bằng DEL.',
          en: 'Redis/DB; instant revocation via DEL.'
        }
      },
      {
        name: 'Cookie flags',
        role: 'Browser policy',
        description: {
          vi: 'HttpOnly, Secure, SameSite, __Host- prefix.',
          en: 'HttpOnly, Secure, SameSite, __Host- prefix.'
        }
      },
      {
        name: 'CSRF token',
        role: 'Intent proof',
        description: {
          vi: 'Chứng minh request xuất phát từ trang của chính ta.',
          en: 'Proves the request came from our own page.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'verify',
      title: { vi: 'Xác minh mật khẩu bằng Argon2id', en: 'Verify the password with Argon2id' },
      phase: 'AuthN',
      description: {
        vi: 'Lấy hash đã lưu (kèm salt, tham số) và chạy lại Argon2id với mật khẩu nhập.',
        en: 'Load the stored hash (with salt and parameters) and rerun Argon2id on the submitted password.'
      },
      systemBehavior: {
        vi: 'So sánh constant-time; tốn ~50 ms và 19 MiB mỗi lần thử.',
        en: 'Constant-time comparison; ~50 ms and 19 MiB per attempt.'
      },
      codeLineMatch: 'passwordEncoder.matches'
    },
    {
      id: 'rotate',
      title: { vi: 'Đổi session id (chống fixation)', en: 'Rotate the session id (anti-fixation)' },
      phase: 'Session',
      description: {
        vi: 'Huỷ phiên ẩn danh cũ, tạo id mới ngẫu nhiên 128 bit.',
        en: 'Invalidate the old anonymous session and create a fresh 128-bit random id.'
      },
      systemBehavior: {
        vi: 'Spring Security changeSessionId() mặc định khi đăng nhập.',
        en: 'Spring Security calls changeSessionId() at login by default.'
      },
      codeLineMatch: 'sessionFixation'
    },
    {
      id: 'cookie',
      title: {
        vi: 'Cookie HttpOnly · Secure · SameSite',
        en: 'HttpOnly · Secure · SameSite cookie'
      },
      phase: 'Transport',
      description: {
        vi: 'JS không đọc được, chỉ gửi qua HTTPS, không gửi kèm request cross-site.',
        en: 'Unreadable by JS, HTTPS only, not sent on cross-site requests.'
      },
      systemBehavior: {
        vi: 'Trình duyệt tự đính kèm cookie cho request cùng site.',
        en: 'The browser attaches the cookie to same-site requests automatically.'
      },
      codeLineMatch: 'same-site'
    },
    {
      id: 'logout',
      title: { vi: 'Logout huỷ phiên trên server', en: 'Logout ends the session on the server' },
      phase: 'Invalidate',
      description: {
        vi: 'POST /logout xoá phiên, xoá cookie và chuyển hướng; id cũ không còn dùng được.',
        en: 'POST /logout deletes the session, clears the cookie and redirects; the old id stops working.'
      },
      systemBehavior: {
        vi: 'Với token: thu hồi refresh token; access token hết hạn sau vài phút.',
        en: 'With tokens: revoke the refresh token; the access token expires within minutes.'
      },
      codeLineMatch: 'invalidateHttpSession(true)'
    }
  ],

  comparison: {
    title: {
      vi: 'Server session vs Self-contained token',
      en: 'Server session vs self-contained token'
    },
    subtitle: {
      vi: 'Trạng thái ở đâu quyết định khả năng thu hồi',
      en: 'Where state lives decides revocability'
    },
    options: [
      {
        name: 'Session cookie',
        tag: 'Stateful',
        role: { vi: 'id trỏ tới dữ liệu trên server', en: 'An id pointing to server data' },
        keyMechanism: {
          vi: 'Thu hồi tức thì, cookie nhỏ, cần store chia sẻ (Redis) khi scale ngang.',
          en: 'Instant revocation, small cookie, needs a shared store (Redis) to scale out.'
        },
        configExample: 'Set-Cookie: __Host-SID=…; HttpOnly; Secure; SameSite=Lax; Path=/',
        architectureNote: {
          vi: 'Mặc định tốt cho web app cùng domain.',
          en: 'A good default for same-domain web apps.'
        }
      },
      {
        name: 'JWT access token',
        tag: 'Stateless',
        role: {
          vi: 'Claims ký số mang theo request',
          en: 'Signed claims carried with the request'
        },
        keyMechanism: {
          vi: 'Không cần tra cứu, phù hợp API phân tán; thu hồi khó, phải TTL ngắn.',
          en: 'No lookup, suits distributed APIs; hard to revoke, needs short TTLs.'
        },
        configExample: 'Authorization: Bearer eyJhbGciOiJFUzI1NiIs…',
        architectureNote: { vi: 'Chi tiết ở SEC-09.', en: 'Details in SEC-09.' }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Session server-side thu hồi tức thì và cookie HttpOnly miễn nhiễm việc XSS đọc token.',
        en: 'Server-side sessions revoke instantly, and HttpOnly cookies are immune to XSS token theft.'
      },
      {
        vi: 'Token tự chứa không cần tra cứu, phù hợp API nhiều service và client mobile.',
        en: 'Self-contained tokens need no lookup, suiting multi-service APIs and mobile clients.'
      }
    ],
    cons: [
      {
        vi: 'Session cần store chia sẻ khi scale ngang và cookie gắn với domain.',
        en: 'Sessions need a shared store to scale out, and cookies are domain-bound.'
      },
      {
        vi: 'Token tự chứa khó thu hồi trước khi hết hạn; refresh token cần lưu trữ an toàn.',
        en: 'Self-contained tokens are hard to revoke before expiry; refresh tokens need safe storage.'
      }
    ],
    balance: {
      vi: 'Web app cùng domain: session cookie. API cho nhiều client: access token ngắn hạn + refresh token xoay vòng. SPA: để BFF giữ token, trình duyệt chỉ giữ cookie (SEC-12).',
      en: 'Same-domain web apps: session cookies. APIs for many clients: short-lived access tokens + rotating refresh tokens. SPAs: let a BFF hold the tokens while the browser holds only a cookie (SEC-12).'
    },
    invariant: {
      vi: 'Sau logout, không credential nào đã phát hành cho phiên đó còn mở được phiên mới hoặc gia hạn quyền truy cập.',
      en: 'After logout, no credential issued for that session can open a new session or extend access.'
    }
  },

  code: [
    {
      label: 'SecurityConfig.java',
      filename: 'SecurityConfig.java',
      language: 'java',
      code: `@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        // Argon2id: salt 16B, hash 32B, parallelism 1, memory 19 MiB, iterations 2 (OWASP)
        return new Argon2PasswordEncoder(16, 32, 1, 19 * 1024, 2);
    }

    @Bean
    SecurityFilterChain web(HttpSecurity http) throws Exception {
        return http
            .formLogin(Customizer.withDefaults())   // calls passwordEncoder.matches(raw, stored)
            .sessionManagement(s -> s
                .sessionFixation(f -> f.changeSessionId())       // new id after login
                .maximumSessions(3))
            .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
            .logout(l -> l
                .logoutUrl("/logout")
                .invalidateHttpSession(true)                       // server-side session gone
                .deleteCookies("JSESSIONID"))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/login", "/assets/**").permitAll()
                .anyRequest().authenticated())
            .build();
    }
}

# application.yml
# server.servlet.session.cookie.http-only: true
# server.servlet.session.cookie.secure: true
# server.servlet.session.cookie.same-site: lax
# server.servlet.session.timeout: 30m`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Stateful và stateless authentication khác nhau thế nào?',
        en: 'How do stateful and stateless authentication differ?'
      },
      answer: {
        vi: 'Stateful: server lưu phiên (Redis/DB), client chỉ giữ session id; mỗi request tra cứu phiên, thu hồi bằng cách xoá. Stateless: token tự chứa claims có chữ ký, server chỉ cần kiểm tra chữ ký và hạn; không cần tra cứu nhưng không thu hồi được trước khi hết hạn nếu không có thêm cơ chế (blocklist, introspection).',
        en: 'Stateful: the server stores the session (Redis/DB) and the client holds only a session id; each request looks it up, and revocation means deleting it. Stateless: a signed self-contained token carries the claims and the server only checks signature and expiry; no lookup, but no revocation before expiry without extra machinery (blocklists, introspection).'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'SameSite=Lax có đủ thay CSRF token không?',
        en: 'Is SameSite=Lax enough to replace CSRF tokens?'
      },
      answer: {
        vi: 'Phần lớn, nhưng không hoàn toàn: Lax vẫn gửi cookie với điều hướng top-level GET (nên GET không được thay đổi trạng thái), subdomain bị chiếm vẫn là "same-site", và trình duyệt cũ không hỗ trợ. Defense in depth: SameSite + CSRF token + kiểm tra Origin.',
        en: 'Mostly, not entirely: Lax still sends cookies on top-level GET navigations (so GETs must never change state), a compromised subdomain is still “same-site”, and old browsers lack support. Defence in depth: SameSite + CSRF token + Origin checks.'
      },
      trapWarning: {
        vi: 'Nhầm "same-site" với "same-origin": a.example.com và b.example.com là cùng site.',
        en: 'Confusing “same-site” with “same-origin”: a.example.com and b.example.com are the same site.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Refresh token rotation phát hiện token bị đánh cắp như thế nào?',
        en: 'How does refresh token rotation detect a stolen token?'
      },
      answer: {
        vi: 'Mỗi refresh token chỉ dùng được một lần và thuộc một "family". Nếu kẻ tấn công và người dùng thật cùng giữ một refresh token, ai dùng sau sẽ đưa ra token đã bị dùng; server thấy reuse, thu hồi cả family và buộc đăng nhập lại. RFC 9700 yêu cầu refresh token của public client phải sender-constrained hoặc dùng rotation.',
        en: 'Each refresh token is single-use and belongs to a "family". If an attacker and the real user both hold one, whoever uses it second presents an already-used token; the server detects the reuse, revokes the whole family and forces a new login. RFC 9700 requires public-client refresh tokens to be sender-constrained or rotated.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.owaspSession,
    SECURITY_CITATIONS.rfc6750,
    SECURITY_CITATIONS.rfc9700
  ]
};
