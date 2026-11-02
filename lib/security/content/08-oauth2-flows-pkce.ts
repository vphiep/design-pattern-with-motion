import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const oauth2AuthorizationCodePkceTopic: SecurityTopic = {
  id: 'oauth2-authorization-code-pkce',
  roadmapId: 'SEC-08',
  category: 'sec-oauth-jwt-oidc',
  level: 'intermediate',
  levelTo: 'advanced',
  chapter: 'Cấp độ 3',
  name: 'OAuth 2.0 Authorization Flows & PKCE',
  tagline: {
    vi: 'Authorization Code + PKCE (code_verifier/code_challenge S256), state chống CSRF, redirect URI so khớp chính xác; Client Credentials cho M2M, Device Authorization Grant cho TV/CLI, Refresh Token Grant — và vì sao Implicit và Password grant bị loại bỏ.',
    en: 'Authorization Code + PKCE (S256 code_verifier/code_challenge), state against CSRF, exact redirect URI matching; Client Credentials for M2M, the Device Authorization Grant for TVs/CLIs, the Refresh Token Grant — and why the Implicit and Password grants are gone.'
  },
  difficulty: 3,
  order: 8,
  estimatedMinutes: 30,

  coreTheory: {
    problemStatement: {
      vi: 'Ứng dụng in ảnh muốn đọc album Google Photos của bạn. Đưa mật khẩu Google cho nó là trao toàn quyền tài khoản, không giới hạn phạm vi, không thu hồi riêng được. Còn nếu chỉ redirect và nhận token qua URL, token lộ trong history, log, Referer — và ứng dụng mobile/SPA không giữ được client secret.',
      en: 'A photo-printing app wants to read your Google Photos. Giving it your Google password hands over the whole account with no scope limits and no separate revocation. Returning tokens in the redirect URL leaks them into history, logs and Referer — and mobile apps/SPAs cannot keep a client secret.'
    },
    hardwareConstraint: {
      vi: 'Kênh front-channel (redirect qua trình duyệt) không đáng tin: URL có thể bị log, custom URI scheme trên mobile có thể bị app độc chiếm, extension đọc được. Chỉ kênh back-channel (HTTPS server-to-server) mới bảo mật.',
      en: 'The front channel (browser redirects) is untrusted: URLs get logged, mobile custom URI schemes can be hijacked by malicious apps, extensions can read them. Only the back channel (server-to-server HTTPS) is confidential.'
    },
    fundamentalSolution: {
      vi: 'Front-channel chỉ mang một authorization code ngắn hạn, dùng một lần; token chỉ được cấp qua back-channel POST /token. PKCE: client sinh code_verifier ngẫu nhiên (43–128 ký tự), gửi code_challenge = BASE64URL(SHA256(verifier)) ở bước authorize, rồi gửi verifier ở bước đổi token. Kẻ đánh cắp code không có verifier nên không đổi được token. state ngẫu nhiên gắn với phiên trình duyệt chống CSRF đăng nhập.',
      en: 'The front channel carries only a short-lived, single-use authorization code; tokens are issued only over the back-channel POST /token. PKCE: the client generates a random code_verifier (43–128 chars), sends code_challenge = BASE64URL(SHA256(verifier)) at authorize time, then sends the verifier when redeeming the code. A thief holding the code lacks the verifier and cannot obtain tokens. A random state bound to the browser session prevents login CSRF.'
    },
    math: {
      formula: String.raw`\text{code\_challenge} = \text{BASE64URL}\big(\text{SHA256}(\text{code\_verifier})\big), \quad P_{\text{forge}} \approx 2^{-256}`,
      description: {
        vi: 'Verifier 32 byte ngẫu nhiên (256 bit entropy). Từ challenge không thể suy ngược verifier (tính một chiều của SHA-256), và đoán verifier có xác suất ~2⁻²⁵⁶ — nên chỉ client đã khởi tạo flow mới đổi được code.',
        en: 'A 32-byte random verifier (256 bits of entropy). The verifier cannot be derived from the challenge (SHA-256 is one-way), and guessing it succeeds with probability ~2⁻²⁵⁶ — so only the client that started the flow can redeem the code.'
      },
      timeComplexity: 'O(1): one SHA-256 per flow',
      spaceComplexity: 'O(1) verifier kept in client session'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'RFC 9700 (OAuth 2.0 Security BCP, 2025) và bản nháp OAuth 2.1 yêu cầu Authorization Code + PKCE cho MỌI client, kể cả confidential client có secret, và loại bỏ implicit grant và password grant.',
      en: 'RFC 9700 (OAuth 2.0 Security BCP, 2025) and the OAuth 2.1 draft require Authorization Code + PKCE for EVERY client, including confidential clients with secrets, and drop the implicit and password grants.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Redirect URI phải được đăng ký trước và so khớp chính xác từng ký tự. Cho phép wildcard hoặc so khớp tiền tố từng dẫn tới lộ code sang domain kẻ tấn công (open redirect). Code có hạn sống ngắn (≤ 60 s khuyến nghị) và chỉ dùng một lần; dùng lại phải khiến AS thu hồi các token đã cấp từ code đó.',
        en: 'Redirect URIs must be pre-registered and matched exactly, character for character. Wildcards or prefix matching have repeatedly leaked codes to attacker domains (open redirects). Codes are short-lived (≤ 60 s recommended) and single-use; reuse should make the AS revoke tokens issued from that code.'
      },
      {
        vi: 'Scope là phạm vi quyền user đồng ý (photos.readonly), không phải vai trò nội bộ. Resource server phải kiểm tra cả audience (token dành cho mình) lẫn scope. Public client (SPA, mobile) không có secret; confidential client (backend) xác thực ở /token bằng client_secret hoặc tốt hơn là private_key_jwt.',
        en: 'Scopes are what the user consented to (photos.readonly), not internal roles. Resource servers must check both audience (the token is for them) and scope. Public clients (SPA, mobile) have no secret; confidential clients (backends) authenticate at /token with client_secret or, better, private_key_jwt.'
      },
      {
        vi: 'Client Credentials (RFC 6749 §4.4): không có người dùng — service tự xác thực tại /token (tốt nhất bằng private_key_jwt hoặc mTLS) và nhận access token cho chính nó. Dùng cho batch job, service-to-service. Refresh Token Grant: client gửi grant_type=refresh_token để lấy access token mới; với public client, RFC 9700 yêu cầu refresh token phải sender-constrained hoặc được xoay vòng.',
        en: 'Client Credentials (RFC 6749 §4.4): there is no user — the service authenticates itself at /token (ideally with private_key_jwt or mTLS) and gets an access token for itself. Used for batch jobs and service-to-service calls. Refresh Token Grant: the client sends grant_type=refresh_token for a new access token; for public clients, RFC 9700 requires refresh tokens to be sender-constrained or rotated.'
      },
      {
        vi: 'Device Authorization Grant (RFC 8628) cho thiết bị không có trình duyệt hoặc khó gõ (Smart TV, CLI): thiết bị nhận device_code + user_code, hiển thị verification_uri để người dùng nhập mã trên điện thoại, rồi poll /token với grant_type=urn:ietf:params:oauth:grant-type:device_code. Khoảng poll mặc định 5 giây; lỗi authorization_pending thì chờ tiếp, slow_down thì tăng thêm 5 giây cho mọi lần sau.',
        en: 'The Device Authorization Grant (RFC 8628) serves devices without a browser or a usable keyboard (smart TVs, CLIs): the device gets a device_code + user_code, shows a verification_uri where the user enters the code on their phone, then polls /token with grant_type=urn:ietf:params:oauth:grant-type:device_code. The default polling interval is 5 seconds; on authorization_pending keep waiting, on slow_down add 5 seconds to every later request.'
      },
      {
        vi: 'Các grant bị loại bỏ: Implicit (response_type=token) trả access token ngay trên URL fragment — lộ qua history, Referer và không thể gắn với client; RFC 9700 nói client SHOULD NOT dùng. Resource Owner Password Credentials đưa mật khẩu cho client, phá vỡ mục đích của OAuth và không hỗ trợ MFA; RFC 9700 nói MUST NOT dùng. OIDC thêm nonce như một lớp chống CSRF/replay cho ID Token.',
        en: 'Retired grants: Implicit (response_type=token) returns the access token in the URL fragment — exposed through history and Referer, and impossible to bind to the client; RFC 9700 says clients SHOULD NOT use it. Resource Owner Password Credentials hand the password to the client, defeating OAuth’s purpose and blocking MFA; RFC 9700 says it MUST NOT be used. OIDC adds a nonce as an extra CSRF/replay defence for the ID Token.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng code_challenge_method=plain: challenge = verifier, lộ ở front-channel là mất bảo vệ.',
        en: 'Using code_challenge_method=plain: challenge = verifier, so front-channel leakage defeats it.'
      },
      {
        vi: 'Không kiểm tra state khi callback → kẻ tấn công đăng nhập nạn nhân vào tài khoản của hắn (login CSRF).',
        en: 'Not checking state on callback → an attacker logs the victim into the attacker’s account (login CSRF).'
      },
      {
        vi: 'Lưu access token trong localStorage của SPA thay vì dùng BFF (SEC-12).',
        en: 'Keeping access tokens in SPA localStorage instead of a BFF (SEC-12).'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Front-channel chỉ mang code, back-channel mang token',
      en: 'Front channel carries the code, back channel carries tokens'
    },
    description: {
      vi: 'Năm bước của Authorization Code + PKCE.',
      en: 'The five steps of Authorization Code + PKCE.'
    },
    asciiDiagram: `
 Client (app)              Browser                Authorization Server         Resource Server
 verifier = rand(32B)
 challenge = b64url(sha256(verifier))
     │ 302 ─────────────────▶ GET /authorize?response_type=code&client_id=print-app
     │                          &redirect_uri=https://print.app/cb&scope=photos.read
     │                          &state=Xk2…&code_challenge=E9Mel…&code_challenge_method=S256
     │                         │──── login + consent ──▶│ store {code→challenge, client, uri}
     │ ◀──────── 302 https://print.app/cb?code=SplxlOB…&state=Xk2…
     │ check state == session.state
     │ POST /token  (back channel, TLS)
     │   grant_type=authorization_code&code=SplxlOB…&redirect_uri=…&code_verifier=dBjft…
     │ ─────────────────────────────────────────────▶ │ sha256(verifier) == challenge ?
     │ ◀──── { access_token, refresh_token, expires_in:300, token_type:"Bearer" }
     │ GET /v1/albums  Authorization: Bearer eyJ…  ─────────────────────────────────▶ │ verify aud, scope
`,
    components: [
      {
        name: 'Authorization Server',
        role: 'Token issuer',
        description: {
          vi: 'Xác thực user, xin consent, cấp token (Keycloak, Auth0, Entra ID).',
          en: 'Authenticates the user, gets consent, issues tokens (Keycloak, Auth0, Entra ID).'
        }
      },
      {
        name: 'Client',
        role: 'Requesting app',
        description: {
          vi: 'Public (SPA/mobile) hoặc confidential (backend).',
          en: 'Public (SPA/mobile) or confidential (backend).'
        }
      },
      {
        name: 'code_verifier',
        role: 'PKCE secret',
        description: {
          vi: 'Chỉ client biết, chỉ gửi qua back-channel.',
          en: 'Known only to the client, sent only on the back channel.'
        }
      },
      {
        name: 'state',
        role: 'CSRF binding',
        description: {
          vi: 'Gắn callback với phiên trình duyệt khởi tạo.',
          en: 'Binds the callback to the initiating browser session.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'pkce-generate',
      title: {
        vi: 'Sinh code_verifier & code_challenge',
        en: 'Generate code_verifier & code_challenge'
      },
      phase: 'Prepare',
      description: {
        vi: 'Client tạo 32 byte ngẫu nhiên, tính SHA-256 rồi base64url; lưu verifier và state vào phiên.',
        en: 'The client creates 32 random bytes, SHA-256 hashes and base64url-encodes them; stores verifier and state in the session.'
      },
      systemBehavior: {
        vi: 'Verifier không bao giờ rời client qua front-channel.',
        en: 'The verifier never leaves the client over the front channel.'
      },
      codeLineMatch: 'const verifier'
    },
    {
      id: 'authorize',
      title: { vi: 'Redirect tới /authorize', en: 'Redirect to /authorize' },
      phase: 'Front channel',
      description: {
        vi: 'URL mang client_id, redirect_uri, scope, state và code_challenge (S256).',
        en: 'The URL carries client_id, redirect_uri, scope, state and code_challenge (S256).'
      },
      systemBehavior: {
        vi: 'AS kiểm tra redirect_uri khớp chính xác danh sách đăng ký.',
        en: 'The AS checks redirect_uri exactly against the registered list.'
      },
      codeLineMatch: "code_challenge_method: 'S256'"
    },
    {
      id: 'callback',
      title: { vi: 'Đăng nhập, consent, nhận code', en: 'Login, consent, receive the code' },
      phase: 'Callback',
      description: {
        vi: 'AS redirect về /cb?code=…&state=…; client so state với phiên.',
        en: 'The AS redirects to /cb?code=…&state=…; the client compares state with the session.'
      },
      systemBehavior: {
        vi: 'AS lưu code → (challenge, client_id, redirect_uri), hết hạn sau ~60 s.',
        en: 'The AS stores code → (challenge, client_id, redirect_uri), expiring in ~60 s.'
      },
      codeLineMatch: "params.get('state') !== session.state"
    },
    {
      id: 'token',
      title: { vi: 'Đổi code + verifier lấy token', en: 'Redeem code + verifier for tokens' },
      phase: 'Back channel',
      description: {
        vi: 'POST /token qua TLS với code, redirect_uri và code_verifier.',
        en: 'POST /token over TLS with the code, redirect_uri and code_verifier.'
      },
      systemBehavior: {
        vi: 'AS tính SHA256(verifier) so với challenge đã lưu; khớp mới cấp token, code bị đánh dấu đã dùng.',
        en: 'The AS computes SHA256(verifier) against the stored challenge; only on match are tokens issued and the code marked used.'
      },
      codeLineMatch: 'code_verifier: session.verifier'
    },
    {
      id: 'call-api',
      title: { vi: 'Gọi API với Bearer token', en: 'Call the API with a Bearer token' },
      phase: 'Resource',
      description: {
        vi: 'Access token ngắn hạn (5 phút) gửi trong header Authorization.',
        en: 'A short-lived access token (5 minutes) in the Authorization header.'
      },
      systemBehavior: {
        vi: 'Resource server xác minh chữ ký, aud, exp và scope photos.read.',
        en: 'The resource server verifies the signature, aud, exp and the photos.read scope.'
      },
      codeLineMatch: 'Authorization: `Bearer'
    }
  ],

  comparison: {
    title: {
      vi: 'Implicit (đã loại bỏ) vs Authorization Code + PKCE',
      en: 'Implicit (deprecated) vs Authorization Code + PKCE'
    },
    subtitle: {
      vi: 'Vì sao OAuth 2.1 xoá implicit grant',
      en: 'Why OAuth 2.1 removes the implicit grant'
    },
    options: [
      {
        name: 'Implicit grant',
        tag: 'Deprecated',
        role: {
          vi: 'Token trả thẳng trong URL fragment',
          en: 'Token returned directly in the URL fragment'
        },
        keyMechanism: {
          vi: 'Token đi qua front-channel: lộ qua history, extension, Referer; không có refresh token an toàn.',
          en: 'Tokens cross the front channel: leaked via history, extensions, Referer; no safe refresh token.'
        },
        configExample: 'response_type=token  ✗',
        architectureNote: { vi: 'RFC 9700: không được dùng.', en: 'RFC 9700: must not be used.' }
      },
      {
        name: 'Code + PKCE',
        tag: 'Required',
        role: {
          vi: 'Code một lần + verifier ở back-channel',
          en: 'Single-use code + back-channel verifier'
        },
        keyMechanism: {
          vi: 'Token không bao giờ xuất hiện trong URL; code bị đánh cắp vô dụng nếu thiếu verifier.',
          en: 'Tokens never appear in URLs; a stolen code is useless without the verifier.'
        },
        configExample: 'response_type=code&code_challenge=…&code_challenge_method=S256',
        architectureNote: {
          vi: 'Áp dụng cho mọi loại client.',
          en: 'Applies to every client type.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Không chia sẻ mật khẩu; quyền giới hạn theo scope và thu hồi được.',
        en: 'No password sharing; scoped and revocable permissions.'
      },
      {
        vi: 'PKCE bảo vệ cả client không giữ được secret.',
        en: 'PKCE protects clients that cannot keep secrets.'
      }
    ],
    cons: [
      {
        vi: 'Nhiều round-trip và redirect; cần quản lý state/verifier phía client.',
        en: 'More round-trips and redirects; client-side state/verifier management.'
      },
      {
        vi: 'OAuth không nói gì về danh tính user — cần OIDC (SEC-10).',
        en: 'OAuth says nothing about user identity — that needs OIDC (SEC-10).'
      }
    ],
    balance: {
      vi: 'Thêm một round-trip back-channel để đổi lấy việc token không bao giờ đi qua kênh không tin cậy.',
      en: 'One extra back-channel round-trip buys tokens that never cross an untrusted channel.'
    },
    invariant: {
      vi: 'Chỉ bên giữ code_verifier mới đổi được authorization code thành token.',
      en: 'Only the holder of the code_verifier can redeem the authorization code.'
    }
  },

  code: [
    {
      label: 'pkce-client.ts',
      filename: 'pkce-client.ts',
      language: 'typescript',
      code: `const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');

export async function startLogin(session: Session) {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  session.verifier = verifier;
  session.state = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);

  const url = new URL('https://auth.example.com/oauth2/authorize');
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: 'print-app',
    redirect_uri: 'https://print.app/cb',          // must match the registration exactly
    scope: 'openid photos.read',
    state: session.state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  }).toString();
  return Response.redirect(url, 302);
}

export async function callback(req: Request, session: Session) {
  const params = new URL(req.url).searchParams;
  if (params.get('state') !== session.state) throw new Error('state mismatch (CSRF)');

  const res = await fetch('https://auth.example.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.get('code')!,
      redirect_uri: 'https://print.app/cb',
      client_id: 'print-app',
      code_verifier: session.verifier
    })
  });
  const tokens = await res.json();                  // { access_token, refresh_token, expires_in }

  return fetch('https://photos.example.com/v1/albums', {
    headers: { Authorization: \`Bearer \${tokens.access_token}\` }
  });
}`
    },
    {
      label: 'application.yml',
      filename: 'application.yml',
      language: 'yaml',
      code: `spring:
  security:
    oauth2:
      client:
        registration:
          photos:
            provider: corp-idp
            client-id: print-app
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope: openid, photos.read
            # PKCE is applied automatically for public clients (client-authentication-method: none);
            # enable it for confidential clients via OAuth2AuthorizationRequestCustomizers.withPkce()
        provider:
          corp-idp:
            issuer-uri: https://auth.example.com/realms/corp`
    },
    {
      label: 'other-grants.http',
      filename: 'other-grants.http',
      language: 'bash',
      code: `### Client Credentials (M2M, no user) — client authenticates with private_key_jwt
POST https://idp.example.com/token
grant_type=client_credentials&scope=inventory.read
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=eyJ…

### Device Authorization Grant (RFC 8628) — smart TV / CLI
POST https://idp.example.com/device_authorization
client_id=tv-app&scope=profile
=> {"device_code":"GmRh…","user_code":"WDJB-MJHT","verification_uri":"https://idp.example.com/device",
    "expires_in":1800,"interval":5}
POST https://idp.example.com/token      # poll every 5 s
grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=GmRh…&client_id=tv-app
=> {"error":"authorization_pending"}  ...  {"error":"slow_down"} (+5 s)  ...  {"access_token":"…"}

### Refresh Token Grant (rotation: a new refresh_token comes back every time)
POST https://idp.example.com/token
grant_type=refresh_token&refresh_token=8xLOxBtZp8&client_id=print-app

### Retired: response_type=token (Implicit) and grant_type=password (ROPC)`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'PKCE chống được tấn công gì mà client_secret không chống được?',
        en: 'What attack does PKCE stop that a client_secret does not?'
      },
      answer: {
        vi: 'Authorization code interception: app độc trên cùng điện thoại đăng ký cùng custom scheme, hoặc code lộ qua log/Referer. Với public client không có secret, kẻ đánh cắp code đổi được token ngay. PKCE ràng buộc code với verifier chỉ client khởi tạo biết. Với confidential client, PKCE còn chặn code injection (dùng code đánh cắp trong phiên của kẻ tấn công).',
        en: 'Authorization code interception: a malicious app on the same phone registers the same custom scheme, or the code leaks via logs/Referer. Public clients have no secret, so a thief could redeem the code. PKCE binds the code to a verifier only the initiating client knows. For confidential clients PKCE also blocks code injection (using a stolen code in the attacker’s session).'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Phân biệt state, nonce và code_verifier.',
        en: 'Distinguish state, nonce and code_verifier.'
      },
      answer: {
        vi: 'state: chống CSRF trên callback, client so với phiên trình duyệt. code_verifier: chứng minh bên đổi code chính là bên khởi tạo flow (AS kiểm tra). nonce (OIDC): gắn ID Token với request, chống replay ID Token (client kiểm tra claim nonce). Ba giá trị bảo vệ ba điểm khác nhau.',
        en: 'state: CSRF protection on the callback, checked by the client against the browser session. code_verifier: proves the redeemer started the flow (checked by the AS). nonce (OIDC): binds the ID Token to the request against replay (checked by the client in the nonce claim). Three values guarding three different points.'
      },
      proTip: {
        vi: 'Nói rõ ai kiểm tra từng giá trị — đây là điểm phân biệt ứng viên hiểu sâu.',
        en: 'State who validates each value — that separates deep understanding from memorisation.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Code bị đánh cắp qua open redirect trên trang đối tác',
      en: 'Codes stolen through an open redirect on a partner page'
    },
    businessContext: {
      vi: 'IdP nội bộ cho phép redirect_uri theo tiền tố https://partner.example.com/.',
      en: 'An in-house IdP allowed redirect_uri by prefix https://partner.example.com/.'
    },
    problemDescription: {
      vi: 'Kẻ tấn công dùng một open redirect /out?url= trên domain đối tác để chuyển code tới server của hắn, rồi đổi lấy token vì client là confidential với secret bị lộ trong app desktop.',
      en: 'An attacker used an open redirect /out?url= on the partner domain to forward codes to their server, then redeemed them because the “confidential” client’s secret was embedded in a desktop app.'
    },
    whyNaiveFails: {
      vi: 'So khớp tiền tố + secret không bí mật = không còn lớp bảo vệ nào giữa code và token.',
      en: 'Prefix matching + a secret that isn’t secret = nothing between the code and the token.'
    },
    coreSolution: {
      vi: 'So khớp redirect URI chính xác, bắt buộc PKCE S256 cho mọi client, chuyển app desktop thành public client với loopback redirect, code TTL 30 s một lần dùng.',
      en: 'Exact redirect URI matching, mandatory S256 PKCE for all clients, the desktop app re-registered as a public client with a loopback redirect, 30 s single-use codes.'
    },
    architectureImpact: {
      vi: 'Code lộ ra ngoài không còn đổi được token.',
      en: 'Leaked codes can no longer be redeemed.'
    }
  },

  researchCitations: [
    SECURITY_CITATIONS.rfc7636,
    SECURITY_CITATIONS.rfc9700,
    SECURITY_CITATIONS.rfc6749,
    SECURITY_CITATIONS.rfc8628
  ]
};
