import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const oauth2ArchitectureTopic: SecurityTopic = {
  id: 'oauth2-architecture-concepts',
  roadmapId: 'SEC-07',
  category: 'sec-oauth-jwt-oidc',
  level: 'intermediate',
  chapter: 'Cấp độ 3',
  name: 'OAuth 2.0 Architecture & Core Concepts',
  tagline: {
    vi: 'OAuth 2.0 giải bài toán uỷ quyền truy cập mà không đưa mật khẩu: bốn vai trò Resource Owner, Client, Authorization Server, Resource Server; client confidential vs public; client ID/secret, scope, consent, redirect URI, authorization grant và access token — và vì sao OAuth không phải giao thức xác thực.',
    en: 'OAuth 2.0 solves delegated access without sharing passwords: the four roles Resource Owner, Client, Authorization Server and Resource Server; confidential vs public clients; client ID/secret, scopes, consent, redirect URIs, authorization grants and access tokens — and why OAuth is not an authentication protocol.'
  },
  difficulty: 2,
  order: 7,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Một app in ảnh muốn đọc album Google Photos của bạn. Cách cũ: bạn đưa mật khẩu Google cho app. App có toàn quyền (đọc mail, xoá ảnh), giữ mật khẩu mãi mãi, và bạn chỉ thu hồi được bằng cách đổi mật khẩu — làm hỏng mọi app khác. Không ai biết request nào do app làm, request nào do bạn.',
      en: 'A photo-printing app wants to read your Google Photos album. The old way: you hand it your Google password. The app gets full power (read mail, delete photos), keeps the password forever, and you can only revoke it by changing your password — breaking every other app. Nobody can tell which requests the app made and which you made.'
    },
    hardwareConstraint: {
      vi: 'Client chạy ở nơi không tin cậy được (trình duyệt, điện thoại) không thể giữ bí mật. Resource server phải quyết định từ một request duy nhất: ai gửi, thay mặt ai, được làm gì — mà không cần biết mật khẩu người dùng.',
      en: 'Clients running in untrusted places (browsers, phones) cannot keep secrets. A resource server must decide from a single request who sent it, on whose behalf, and what is allowed — without ever knowing the user’s password.'
    },
    fundamentalSolution: {
      vi: 'OAuth 2.0 (RFC 6749) tách bốn vai trò. Resource Owner (người dùng) cấp quyền; Client (app) yêu cầu truy cập thay mặt họ; Authorization Server xác thực người dùng, hỏi consent và phát hành access token; Resource Server (API) chấp nhận request có access token. Client được đăng ký trước với client_id, redirect URI chính xác và (nếu là confidential client) một credential. Người dùng chỉ nhập mật khẩu ở Authorization Server; client nhận một authorization grant rồi đổi lấy access token có scope giới hạn, thời hạn ngắn, thu hồi riêng được.',
      en: 'OAuth 2.0 (RFC 6749) separates four roles. The Resource Owner (the user) grants access; the Client (the app) requests access on their behalf; the Authorization Server authenticates the user, asks for consent and issues access tokens; the Resource Server (the API) accepts requests bearing access tokens. The client is registered up front with a client_id, exact redirect URIs and (for confidential clients) a credential. The user types the password only at the Authorization Server; the client receives an authorization grant and exchanges it for an access token that is scope-limited, short-lived and separately revocable.'
    },
    math: {
      formula: String.raw`\text{scope}_{\text{granted}} \subseteq \text{scope}_{\text{requested}} \cap \text{scope}_{\text{client}}, \qquad \text{access} = \text{scope}_{\text{granted}} \cap \text{perm}(\text{owner})`,
      description: {
        vi: 'Token không bao giờ cho client nhiều quyền hơn người dùng có: scope được cấp là tập con của thứ client xin, thứ client được đăng ký và thứ người dùng đồng ý; quyền thực tế tại API còn bị giao với quyền của chính người dùng trên resource đó.',
        en: 'A token never gives the client more power than the user has: the granted scope is a subset of what the client asked for, what it is registered for and what the user consented to; effective access at the API is further intersected with the user’s own permissions on that resource.'
      },
      timeComplexity: 'One redirect round-trip + one back-channel token call',
      spaceComplexity: 'Per token: subject, client, scopes, audience, expiry'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'OAuth là authorization framework: nó trả lời "client này được làm gì thay mặt người dùng", không trả lời "người dùng là ai". Phần xác thực được thêm bởi OpenID Connect (SEC-10).',
      en: 'OAuth is an authorization framework: it answers "what may this client do on the user’s behalf", not "who is the user". Authentication is added by OpenID Connect (SEC-10).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Loại client: confidential client chạy trên server (backend Spring, BFF) giữ được credential (client secret, hoặc tốt hơn là private_key_jwt/mTLS). Public client (SPA, mobile, CLI) không giữ được bí mật — mọi thứ trong app đều có thể bị trích xuất — nên dựa vào PKCE thay cho secret. client_id là định danh công khai, không phải bí mật.',
        en: 'Client types: a confidential client runs on a server (a Spring backend, a BFF) and can hold a credential (a client secret, or better private_key_jwt/mTLS). A public client (SPA, mobile, CLI) cannot keep secrets — anything in the app can be extracted — so it relies on PKCE instead of a secret. The client_id is a public identifier, not a secret.'
      },
      {
        vi: 'Scope, consent và redirect URI: scope (orders.read, photos.readonly) mô tả quyền client xin; màn hình consent cho người dùng thấy và đồng ý. Redirect URI là nơi Authorization Server gửi grant về; RFC 9700 yêu cầu so khớp chính xác chuỗi (trừ port của localhost cho native app) vì một redirect URI lỏng lẻo cho phép kẻ tấn công nhận code của nạn nhân.',
        en: 'Scopes, consent and redirect URIs: scopes (orders.read, photos.readonly) describe what the client asks for; the consent screen shows them to the user for approval. The redirect URI is where the Authorization Server sends the grant; RFC 9700 requires exact string matching (except localhost ports for native apps) because a loose redirect URI lets an attacker receive the victim’s code.'
      },
      {
        vi: 'Grant và token: authorization grant là bằng chứng người dùng đã đồng ý (authorization code là phổ biến nhất); access token là credential client dùng để gọi API, thường ngắn hạn và có audience; refresh token dùng để lấy access token mới mà không làm phiền người dùng. Resource Server kiểm tra token (chữ ký JWT hoặc introspection), audience và scope trên mỗi request.',
        en: 'Grants and tokens: an authorization grant is proof the user consented (the authorization code is the most common); an access token is the credential the client uses to call APIs, usually short-lived and audience-bound; a refresh token obtains new access tokens without bothering the user. The Resource Server checks the token (JWT signature or introspection), audience and scope on every request.'
      },
      {
        vi: 'OAuth không phải authentication: access token dành cho Resource Server, không phải cho client. Dùng "có access token Facebook hợp lệ" làm bằng chứng đăng nhập dẫn tới tấn công thay token: kẻ tấn công lấy token cấp cho app khác của chính họ và đăng nhập vào app của bạn dưới danh nghĩa nạn nhân. Muốn biết người dùng là ai, dùng ID Token của OIDC với aud là client của bạn.',
        en: 'OAuth is not authentication: the access token is meant for the Resource Server, not the client. Treating "holds a valid Facebook access token" as proof of login enables token substitution: an attacker uses a token issued to a different app and logs into yours as the victim. To learn who the user is, use an OIDC ID Token whose aud is your client.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Nhúng client secret vào SPA hoặc app mobile: ai cũng trích xuất được, coi như không có secret.',
        en: 'Embedding a client secret in an SPA or mobile app: anyone can extract it, so it is no secret at all.'
      },
      {
        vi: 'Đăng ký redirect URI dạng wildcard (https://*.example.com/*): một subdomain bị chiếm là nhận được code.',
        en: 'Registering wildcard redirect URIs (https://*.example.com/*): one taken-over subdomain receives codes.'
      },
      {
        vi: 'Xin scope rộng "cho tiện" (full_access): token lộ ra gây thiệt hại tối đa và người dùng quen bấm Allow.',
        en: 'Requesting broad scopes "for convenience" (full_access): a leaked token does maximum damage and users learn to click Allow.'
      },
      {
        vi: 'Resource Server chỉ kiểm tra chữ ký token mà không kiểm tra audience: token cấp cho API khác cũng được chấp nhận.',
        en: 'A Resource Server that checks only the token signature, not the audience: tokens issued for other APIs are accepted.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Bốn vai trò của OAuth 2.0', en: 'The four OAuth 2.0 roles' },
    description: {
      vi: 'Mật khẩu chỉ đi tới Authorization Server; client chỉ cầm grant và token có giới hạn.',
      en: 'The password only reaches the Authorization Server; the client only holds a limited grant and token.'
    },
    asciiDiagram: `
   Resource Owner (alice)                                Authorization Server (idp.example.com)
        │  ① uses the app                                 · authenticates alice (password + MFA)
        ▼                                                 · shows consent: "Shop: read your orders"
   Client "shop-web" ── ② redirect: client_id, scope, ──► · issues grant → access token
   (confidential, has      redirect_uri, state, PKCE      · knows registered clients + redirect URIs
    client credential)  ◄─ ③ code via redirect_uri ─────
        │ ④ code + client auth (back channel) ──────────►  {access_token, expires_in, scope}
        │ ⑤ Authorization: Bearer <access_token>
        ▼
   Resource Server (api.example.com/orders) · checks signature/introspection, aud, scope, owner
`,
    components: [
      {
        name: 'Resource Owner',
        role: 'Grants access',
        description: {
          vi: 'Người dùng sở hữu dữ liệu và đồng ý cấp quyền.',
          en: 'The user who owns the data and consents.'
        }
      },
      {
        name: 'Client',
        role: 'Requests access',
        description: {
          vi: 'App gọi API thay mặt người dùng; confidential hoặc public.',
          en: 'The app calling APIs on the user’s behalf; confidential or public.'
        }
      },
      {
        name: 'Authorization Server',
        role: 'Issues tokens',
        description: {
          vi: 'Xác thực người dùng, quản lý consent, phát hành và thu hồi token.',
          en: 'Authenticates users, manages consent, issues and revokes tokens.'
        }
      },
      {
        name: 'Resource Server',
        role: 'Serves data',
        description: {
          vi: 'API chấp nhận access token và kiểm tra audience, scope.',
          en: 'The API that accepts access tokens and checks audience and scope.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'register',
      title: { vi: 'Đăng ký client', en: 'Register the client' },
      phase: 'Setup',
      description: {
        vi: 'client_id công khai, loại client, redirect URI chính xác, scope được phép.',
        en: 'A public client_id, the client type, exact redirect URIs, allowed scopes.'
      },
      systemBehavior: {
        vi: 'Authorization Server từ chối mọi redirect URI không khớp chính xác.',
        en: 'The Authorization Server rejects any redirect URI that does not match exactly.'
      },
      codeLineMatch: 'client_id=shop-web   type=confidential'
    },
    {
      id: 'authorize',
      title: {
        vi: 'Chuyển người dùng tới Authorization Server',
        en: 'Send the user to the Authorization Server'
      },
      phase: 'Front channel',
      description: {
        vi: 'Client chỉ nêu mình là ai và muốn scope gì; không chạm vào mật khẩu.',
        en: 'The client only states who it is and which scopes it wants; it never touches the password.'
      },
      systemBehavior: {
        vi: 'Authorization Server xác thực người dùng (mật khẩu + MFA).',
        en: 'The Authorization Server authenticates the user (password + MFA).'
      },
      codeLineMatch: 'GET https://idp.example.com/authorize'
    },
    {
      id: 'consent',
      title: { vi: 'Consent → authorization grant', en: 'Consent → authorization grant' },
      phase: 'Grant',
      description: {
        vi: 'Người dùng đồng ý scope; code được gửi về đúng redirect URI đã đăng ký.',
        en: 'The user approves the scopes; a code is sent back to the registered redirect URI.'
      },
      systemBehavior: {
        vi: 'Code ngắn hạn, dùng một lần, gắn với client và redirect URI.',
        en: 'The code is short-lived, single-use, bound to the client and redirect URI.'
      },
      codeLineMatch: 'Location: https://shop.example.com/login/oauth2/code/idp?code='
    },
    {
      id: 'token',
      title: { vi: 'Đổi grant lấy access token', en: 'Exchange the grant for an access token' },
      phase: 'Back channel',
      description: {
        vi: 'Client xác thực chính nó và gửi code qua kênh server-to-server.',
        en: 'The client authenticates itself and sends the code server to server.'
      },
      systemBehavior: {
        vi: 'Trả access token ngắn hạn kèm scope thực sự được cấp.',
        en: 'Returns a short-lived access token with the scope actually granted.'
      },
      codeLineMatch: 'grant_type=authorization_code'
    },
    {
      id: 'call-api',
      title: { vi: 'Gọi Resource Server', en: 'Call the Resource Server' },
      phase: 'Use',
      description: {
        vi: 'API kiểm tra token, audience, scope rồi mới tới quyền của người dùng trên dữ liệu.',
        en: 'The API checks token, audience and scope, then the user’s own rights on the data.'
      },
      systemBehavior: {
        vi: 'Thiếu scope → 403 insufficient_scope; token sai → 401 invalid_token.',
        en: 'Missing scope → 403 insufficient_scope; bad token → 401 invalid_token.'
      },
      codeLineMatch: 'Authorization: Bearer eyJ'
    }
  ],

  comparison: {
    title: {
      vi: 'Confidential client vs Public client',
      en: 'Confidential client vs Public client'
    },
    subtitle: {
      vi: 'Client có giữ được bí mật hay không quyết định cách xác thực nó',
      en: 'Whether a client can keep a secret decides how it authenticates'
    },
    options: [
      {
        name: 'Confidential client',
        tag: 'Server-side',
        role: { vi: 'Backend, BFF, service', en: 'Backends, BFFs, services' },
        keyMechanism: {
          vi: 'Xác thực tại /token bằng client secret, private_key_jwt hoặc mTLS; vẫn nên dùng PKCE.',
          en: 'Authenticates at /token with a client secret, private_key_jwt or mTLS; PKCE still recommended.'
        },
        configExample: 'client-authentication-method: private_key_jwt',
        architectureNote: {
          vi: 'Token không bao giờ tới trình duyệt nếu dùng BFF.',
          en: 'With a BFF, tokens never reach the browser.'
        }
      },
      {
        name: 'Public client',
        tag: 'SPA · mobile · CLI',
        role: { vi: 'Không giữ được bí mật', en: 'Cannot keep a secret' },
        keyMechanism: {
          vi: 'Không có client secret; PKCE là bắt buộc theo RFC 9700.',
          en: 'No client secret; PKCE is mandatory per RFC 9700.'
        },
        configExample: 'client-authentication-method: none  # + PKCE S256',
        architectureNote: {
          vi: 'Refresh token phải sender-constrained hoặc xoay vòng.',
          en: 'Refresh tokens must be sender-constrained or rotated.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Không chia sẻ mật khẩu; quyền giới hạn theo scope và thời gian.',
        en: 'No password sharing; access limited by scope and time.'
      },
      {
        vi: 'Thu hồi từng client riêng lẻ mà không ảnh hưởng client khác.',
        en: 'Revoke one client without affecting the others.'
      },
      {
        vi: 'Tập trung xác thực và MFA tại một Authorization Server.',
        en: 'Authentication and MFA centralised at one Authorization Server.'
      }
    ],
    cons: [
      {
        vi: 'Nhiều thành phần và redirect hơn đăng nhập trực tiếp.',
        en: 'More components and redirects than direct login.'
      },
      {
        vi: 'Đặc tả là framework nhiều lựa chọn; cấu hình sai rất dễ (xem RFC 9700).',
        en: 'The spec is a framework with many options; misconfiguration is easy (see RFC 9700).'
      }
    ],
    balance: {
      vi: 'Chi phí phức tạp đổi lấy uỷ quyền có giới hạn và xác thực tập trung; tuân theo RFC 9700 để chọn đúng một tập con an toàn.',
      en: 'Complexity buys bounded delegation and centralised authentication; follow RFC 9700 to pick the safe subset.'
    },
    invariant: {
      vi: 'Mật khẩu của người dùng chỉ được nhập tại Authorization Server, không bao giờ tại client.',
      en: 'The user’s password is only entered at the Authorization Server, never at the client.'
    }
  },

  code: [
    {
      label: 'oauth-roles.http',
      filename: 'oauth-roles.http',
      language: 'bash',
      code: `### 0. One-time: register the client at the Authorization Server
#   client_id=shop-web   type=confidential   auth=private_key_jwt
#   redirect_uri=https://shop.example.com/login/oauth2/code/idp   (exact match)
#   allowed scopes: orders.read orders.write

### 1. Client redirects the Resource Owner's browser to the Authorization Server
GET https://idp.example.com/authorize?response_type=code&client_id=shop-web
    &redirect_uri=https%3A%2F%2Fshop.example.com%2Flogin%2Foauth2%2Fcode%2Fidp
    &scope=orders.read&state=af0ifjsldkj&code_challenge=E9Melhoa…&code_challenge_method=S256

### 2. alice logs in at the AS and consents: "Shop wants to read your orders"
HTTP/1.1 302 Found
Location: https://shop.example.com/login/oauth2/code/idp?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj

### 3. Client exchanges the grant on the back channel (client authenticated)
POST https://idp.example.com/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA&code_verifier=dBjftJeZ4CVP…
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=eyJ…

{"access_token":"eyJhbGciOiJFUzI1NiIs…","token_type":"Bearer","expires_in":300,"scope":"orders.read"}

### 4. Client calls the Resource Server
GET https://api.example.com/orders
Authorization: Bearer eyJhbGciOiJFUzI1NiIs…`
    },
    {
      label: 'application.yml',
      filename: 'application.yml',
      language: 'yaml',
      code: `# The Client (Spring Boot backend, confidential)
spring:
  security:
    oauth2:
      client:
        registration:
          idp:
            client-id: shop-web
            authorization-grant-type: authorization_code
            scope: orders.read
        provider:
          idp:
            issuer-uri: https://idp.example.com
# The Resource Server (separate app)
#     resourceserver:
#       jwt:
#         issuer-uri: https://idp.example.com
#         audiences: https://api.example.com`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Kể tên bốn vai trò của OAuth 2.0 trong ví dụ "app Shop đọc đơn hàng của alice".',
        en: 'Name the four OAuth 2.0 roles in "the Shop app reads alice’s orders".'
      },
      answer: {
        vi: 'Resource Owner là alice; Client là app Shop; Authorization Server là IdP (Keycloak, Auth0…) nơi alice đăng nhập và đồng ý; Resource Server là Orders API chấp nhận access token.',
        en: 'The Resource Owner is alice; the Client is the Shop app; the Authorization Server is the IdP (Keycloak, Auth0…) where alice logs in and consents; the Resource Server is the Orders API that accepts the access token.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Vì sao nói OAuth 2.0 không phải giao thức xác thực?',
        en: 'Why is OAuth 2.0 said not to be an authentication protocol?'
      },
      answer: {
        vi: 'Access token nói "người mang token được làm X trên API Y", không nói người dùng là ai, và nó dành cho Resource Server chứ không phải cho client. Client dùng access token làm bằng chứng đăng nhập có thể bị lừa bằng token cấp cho app khác. OpenID Connect bổ sung ID Token có aud là client, nonce và claim về sự kiện xác thực.',
        en: 'An access token says "the bearer may do X on API Y", not who the user is, and it is meant for the Resource Server, not the client. A client using an access token as proof of login can be fooled with a token issued to another app. OpenID Connect adds an ID Token whose aud is the client, a nonce and claims about the authentication event.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'client_id có phải bí mật không? SPA có nên giữ client secret không?',
        en: 'Is the client_id a secret? Should an SPA hold a client secret?'
      },
      answer: {
        vi: 'client_id là định danh công khai, xuất hiện trong URL. SPA là public client: mọi thứ trong bundle JS đều đọc được, nên client secret ở đó vô nghĩa. SPA dùng Authorization Code + PKCE, hoặc tốt hơn là BFF giữ token phía server.',
        en: 'The client_id is a public identifier that appears in URLs. An SPA is a public client: everything in the JS bundle is readable, so a client secret there is meaningless. SPAs use Authorization Code + PKCE, or better, a BFF that keeps tokens server-side.'
      }
    }
  ],

  researchCitations: [SECURITY_CITATIONS.rfc6749, SECURITY_CITATIONS.rfc9700]
};
