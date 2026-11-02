import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const openidConnectIdTokenTopic: SecurityTopic = {
  id: 'openid-connect-id-token',
  roadmapId: 'SEC-10',
  category: 'sec-oauth-jwt-oidc',
  level: 'advanced',
  chapter: 'Cấp độ 3',
  name: 'OpenID Connect & Identity Federation',
  tagline: {
    vi: 'OAuth trả lời "được làm gì", OIDC trả lời "là ai": scope openid, ID Token vs Access Token, UserInfo, discovery và JWKS, state và nonce, social login, Identity Provider vs Relying Party và identity federation.',
    en: 'OAuth answers “what may it do”, OIDC answers “who is it”: the openid scope, ID Token vs Access Token, UserInfo, discovery and JWKS, state and nonce, social login, Identity Provider vs Relying Party and identity federation.'
  },
  difficulty: 3,
  order: 10,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Nhiều hệ thống từng dùng access token OAuth để "đăng nhập bằng Facebook": gọi /me và tin user id trả về. Nhưng access token không dành cho client đọc, không nói ai là audience — một token cấp cho app A bị app B đem dùng sẽ đăng nhập B dưới danh nghĩa nạn nhân (token substitution).',
      en: 'Many systems once used OAuth access tokens for “Login with Facebook”: call /me and trust the returned user id. But access tokens are not meant for clients to read and say nothing about the intended audience — a token issued to app A replayed at app B logs into B as the victim (token substitution).'
    },
    hardwareConstraint: {
      vi: 'Client phải xác minh danh tính offline, nhanh, không gọi IdP cho mỗi request; khoá ký của IdP xoay vòng định kỳ và client có thể có hàng nghìn instance.',
      en: 'Clients must verify identity offline and fast, without calling the IdP per request; IdP signing keys rotate periodically and clients may have thousands of instances.'
    },
    fundamentalSolution: {
      vi: 'OIDC thêm scope openid và một ID Token — JWT ký bởi IdP, khẳng định "user sub đã xác thực lúc auth_time, cho client aud". Client xác minh chữ ký bằng khoá công khai lấy từ jwks_uri (tìm qua /.well-known/openid-configuration), kiểm tra iss, aud == client_id, exp, và nonce khớp với request. Access token vẫn dành cho API; ID Token chỉ dành cho client.',
      en: 'OIDC adds the openid scope and an ID Token — a JWT signed by the IdP asserting “user sub authenticated at auth_time, for client aud”. The client verifies the signature with public keys from jwks_uri (found via /.well-known/openid-configuration), checks iss, aud == client_id, exp, and that nonce matches the request. Access tokens remain for APIs; the ID Token is only for the client.'
    },
    math: {
      formula: String.raw`\text{accept}(\text{id\_token}) \iff \text{Verify}_{pk_{kid}}(\sigma) \wedge \text{iss} = I \wedge \text{client\_id} \in \text{aud} \wedge \text{now} < \text{exp} \wedge \text{nonce} = n`,
      description: {
        vi: 'Mỗi điều kiện chặn một lớp tấn công: chữ ký (giả mạo), iss (IdP giả), aud (token cho app khác), exp (token cũ), nonce (replay ID Token).',
        en: 'Each clause blocks an attack class: signature (forgery), iss (rogue IdP), aud (token for another app), exp (stale token), nonce (ID Token replay).'
      },
      timeComplexity: 'O(1) signature verify with cached JWKS',
      spaceComplexity: 'O(keys) cached JWKS'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'OIDC = OAuth 2.0 + ID Token + UserInfo endpoint + Discovery + chuẩn hoá claims (sub, email, name…). Đăng nhập doanh nghiệp (Entra ID, Okta, Keycloak, Google) đều dựa trên OIDC.',
      en: 'OIDC = OAuth 2.0 + ID Token + UserInfo endpoint + Discovery + standard claims (sub, email, name…). Enterprise login (Entra ID, Okta, Keycloak, Google) is all OIDC.'
    },
    deepDiveParagraphs: [
      {
        vi: 'sub là định danh ổn định, duy nhất trong phạm vi issuer — khoá chính để liên kết tài khoản là cặp (iss, sub), KHÔNG phải email (email có thể đổi hoặc chưa xác minh). auth_time và acr/amr cho biết user đăng nhập lúc nào, bằng phương thức gì (mật khẩu, MFA) — dùng để đòi re-auth cho thao tác nhạy cảm.',
        en: 'sub is a stable identifier unique within the issuer — the account-linking key is the pair (iss, sub), NOT email (emails change or may be unverified). auth_time and acr/amr state when and how the user authenticated (password, MFA) — use them to demand re-auth for sensitive actions.'
      },
      {
        vi: 'Discovery (/.well-known/openid-configuration) liệt kê authorization_endpoint, token_endpoint, jwks_uri, thuật toán hỗ trợ. JWKS chứa nhiều khoá với kid; khi IdP xoay khoá, nó công bố khoá mới trước, ký bằng khoá mới, rồi mới gỡ khoá cũ. Client cache JWKS và chỉ refetch khi gặp kid lạ (có giới hạn tần suất).',
        en: 'Discovery (/.well-known/openid-configuration) lists authorization_endpoint, token_endpoint, jwks_uri and supported algorithms. The JWKS holds several keys by kid; when rotating, the IdP publishes the new key first, signs with it, then retires the old one. Clients cache the JWKS and refetch only on an unknown kid (rate-limited).'
      },
      {
        vi: 'Identity Provider (IdP) và Relying Party (RP): IdP xác thực người dùng và phát hành ID Token (Keycloak, Entra ID, Google); RP là ứng dụng tin vào khẳng định đó. UserInfo endpoint trả thêm claims hồ sơ khi gọi bằng access token. state chống CSRF trên redirect, nonce gắn ID Token với đúng phiên đăng nhập để chống replay.',
        en: 'Identity Provider (IdP) and Relying Party (RP): the IdP authenticates the user and issues the ID Token (Keycloak, Entra ID, Google); the RP is the application that trusts that assertion. The UserInfo endpoint returns more profile claims when called with an access token. state defends the redirect against CSRF; nonce binds the ID Token to the right login session to stop replay.'
      },
      {
        vi: 'Social login và federation: "Đăng nhập bằng Google" là OIDC với Google làm IdP. Federation nghĩa là tin danh tính do tổ chức khác xác thực: Keycloak có thể làm broker, nhận đăng nhập từ Google, Entra ID hoặc IdP SAML của đối tác rồi phát hành token của chính nó cho ứng dụng (SEC-14). Định danh người dùng ổn định là cặp (iss, sub) — không phải email, vì email có thể đổi hoặc chưa được xác minh ở IdP khác.',
        en: 'Social login and federation: "Sign in with Google" is OIDC with Google as the IdP. Federation means trusting identities authenticated by another organisation: Keycloak can act as a broker, accept logins from Google, Entra ID or a partner’s SAML IdP and issue its own tokens to applications (SEC-14). The stable user identifier is the (iss, sub) pair — not the email, which can change or be unverified at another IdP.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Liên kết tài khoản theo email từ IdP không xác minh email → chiếm tài khoản.',
        en: 'Linking accounts by email from an IdP that does not verify emails → account takeover.'
      },
      {
        vi: 'Gửi ID Token tới backend API như bearer token — API phải chỉ chấp nhận access token có aud là chính nó.',
        en: 'Sending the ID Token to backend APIs as a bearer token — APIs must accept only access tokens whose aud is themselves.'
      },
      {
        vi: 'Hard-code public key thay vì JWKS: lần xoay khoá đầu tiên làm sập đăng nhập.',
        en: 'Hard-coding the public key instead of using JWKS: the first key rotation breaks login.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Discovery → Login → ID Token → xác minh offline',
      en: 'Discovery → login → ID Token → offline verification'
    },
    description: {
      vi: 'Client cấu hình bằng issuer URL duy nhất; mọi thứ khác tự khám phá.',
      en: 'The client is configured with a single issuer URL; everything else is discovered.'
    },
    asciiDiagram: `
 GET https://idp.example.com/.well-known/openid-configuration
   { issuer, authorization_endpoint, token_endpoint, userinfo_endpoint,
     jwks_uri: ".../protocol/openid-connect/certs", id_token_signing_alg_values_supported: ["RS256","ES256"] }

 /token response:
   access_token  → for the Resource Server (aud = "orders-api")
   id_token      → for the Client           (aud = "web-portal")
   refresh_token → for the Client, back to the AS only

 id_token payload:
   { "iss":"https://idp.example.com", "sub":"248289761001", "aud":"web-portal",
     "exp":1730540100, "iat":1730539800, "auth_time":1730539790,
     "nonce":"n-0S6_WzA2Mj", "amr":["pwd","otp"], "email":"an@corp.vn", "email_verified":true }
`,
    components: [
      {
        name: 'ID Token',
        role: 'Authentication assertion',
        description: {
          vi: 'JWT cho client biết ai đăng nhập.',
          en: 'A JWT telling the client who logged in.'
        }
      },
      {
        name: 'Discovery',
        role: 'Metadata',
        description: {
          vi: 'Endpoint và thuật toán của IdP.',
          en: 'The IdP’s endpoints and algorithms.'
        }
      },
      {
        name: 'JWKS',
        role: 'Public keys',
        description: {
          vi: 'Tập khoá công khai theo kid để xác minh chữ ký.',
          en: 'Public keys by kid for signature verification.'
        }
      },
      {
        name: 'UserInfo',
        role: 'Profile API',
        description: {
          vi: 'Claims bổ sung, gọi bằng access token.',
          en: 'Extra claims, called with the access token.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'discover',
      title: { vi: 'Đọc discovery document', en: 'Read the discovery document' },
      phase: 'Discover',
      description: {
        vi: 'Từ issuer-uri, client lấy endpoint và jwks_uri.',
        en: 'From the issuer-uri the client gets endpoints and the jwks_uri.'
      },
      systemBehavior: {
        vi: 'IdP trả metadata JSON; client kiểm tra issuer khớp chính xác.',
        en: 'The IdP returns JSON metadata; the client checks the issuer matches exactly.'
      },
      codeLineMatch: 'issuer-uri'
    },
    {
      id: 'auth-request',
      title: {
        vi: 'Authorize với scope openid + nonce',
        en: 'Authorize with scope openid + nonce'
      },
      phase: 'Login',
      description: {
        vi: 'Code flow + PKCE như SEC-08, thêm nonce ngẫu nhiên gắn với phiên.',
        en: 'Code flow + PKCE as in SEC-08, plus a random nonce bound to the session.'
      },
      systemBehavior: {
        vi: 'IdP xác thực user (có thể MFA) và nhúng nonce vào ID Token.',
        en: 'The IdP authenticates the user (maybe MFA) and embeds the nonce in the ID Token.'
      },
      codeLineMatch: 'scope: openid'
    },
    {
      id: 'verify-id-token',
      title: { vi: 'Xác minh ID Token bằng JWKS', en: 'Verify the ID Token with JWKS' },
      phase: 'Verify',
      description: {
        vi: 'Chọn khoá theo kid, kiểm tra chữ ký, iss, aud, exp, nonce.',
        en: 'Pick the key by kid, check signature, iss, aud, exp, nonce.'
      },
      systemBehavior: {
        vi: 'Không cần gọi IdP; JWKS được cache.',
        en: 'No IdP call needed; the JWKS is cached.'
      },
      codeLineMatch: 'OidcIdTokenValidator'
    },
    {
      id: 'link-account',
      title: { vi: 'Liên kết tài khoản theo (iss, sub)', en: 'Link the account by (iss, sub)' },
      phase: 'Session',
      description: {
        vi: 'Tạo phiên ứng dụng; user nội bộ khoá theo iss + sub, không theo email.',
        en: 'Create the app session; internal users keyed by iss + sub, not email.'
      },
      systemBehavior: {
        vi: 'Access token chỉ được gửi tới API; ID Token ở lại client.',
        en: 'The access token goes only to APIs; the ID Token stays with the client.'
      },
      codeLineMatch: 'findByIssuerAndSubject'
    }
  ],

  comparison: {
    title: { vi: 'ID Token vs Access Token', en: 'ID Token vs Access Token' },
    subtitle: {
      vi: 'Hai token, hai đối tượng nhận khác nhau',
      en: 'Two tokens, two different audiences'
    },
    options: [
      {
        name: 'ID Token',
        tag: 'For the client',
        role: { vi: 'Chứng nhận sự kiện đăng nhập', en: 'Attests the login event' },
        keyMechanism: {
          vi: 'Luôn là JWT; aud = client_id; client phải đọc và xác minh.',
          en: 'Always a JWT; aud = client_id; the client must parse and verify it.'
        },
        configExample: '{"aud":"web-portal","nonce":"n-0S6…","sub":"2482…"}',
        architectureNote: { vi: 'Không bao giờ gửi tới API.', en: 'Never send it to APIs.' }
      },
      {
        name: 'Access Token',
        tag: 'For the API',
        role: { vi: 'Uỷ quyền gọi resource server', en: 'Authorises calls to a resource server' },
        keyMechanism: {
          vi: 'Có thể là JWT hoặc opaque; client coi như chuỗi mờ, API xác minh aud/scope.',
          en: 'JWT or opaque; clients treat it as opaque, APIs verify aud/scope.'
        },
        configExample: 'Authorization: Bearer <access_token>',
        architectureNote: {
          vi: 'Client không nên phụ thuộc nội dung của nó.',
          en: 'Clients should not depend on its contents.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'SSO chuẩn hoá, xác minh offline nhanh.',
        en: 'Standardised SSO with fast offline verification.'
      },
      {
        vi: 'Discovery + JWKS cho phép xoay khoá không downtime.',
        en: 'Discovery + JWKS enable zero-downtime key rotation.'
      }
    ],
    cons: [
      {
        vi: 'Nhiều claim và kiểm tra dễ bỏ sót nếu tự hiện thực.',
        en: 'Many claims and checks, easy to miss when hand-rolled.'
      },
      {
        vi: 'Logout phân tán (front/back-channel logout) phức tạp.',
        en: 'Distributed logout (front/back-channel logout) is complex.'
      }
    ],
    balance: {
      vi: 'Xác minh offline nhanh nhưng phiên IdP bị thu hồi không phản ánh ngay vào client cho tới khi token hết hạn.',
      en: 'Offline verification is fast, but IdP-side revocation does not reach the client until tokens expire.'
    },
    invariant: {
      vi: 'Danh tính người dùng = (iss, sub) từ một ID Token đã xác minh đầy đủ.',
      en: 'User identity = (iss, sub) from a fully verified ID Token.'
    }
  },

  code: [
    {
      label: 'OidcLoginConfig.java',
      filename: 'OidcLoginConfig.java',
      language: 'java',
      code: `// application.yml
//   spring.security.oauth2.client.provider.corp.issuer-uri: https://idp.example.com/realms/corp
//   spring.security.oauth2.client.registration.corp.scope: openid, profile, email
//   -> scope: openid triggers OIDC; discovery + JWKS are fetched from the issuer

@Configuration
class OidcLoginConfig {

    @Bean
    SecurityFilterChain web(HttpSecurity http, AccountLinker linker) throws Exception {
        return http
            .oauth2Login(o -> o.userInfoEndpoint(u -> u.oidcUserService(linker)))
            .build();
    }

    // Spring's OidcIdTokenValidator checks iss, aud (client_id), exp/iat and azp;
    // the nonce is generated per request and compared automatically.
    @Bean
    JwtDecoderFactory<ClientRegistration> idTokenDecoderFactory() {
        OidcIdTokenDecoderFactory f = new OidcIdTokenDecoderFactory();
        f.setJwsAlgorithmResolver(reg -> SignatureAlgorithm.ES256); // pin the algorithm
        return f;
    }
}

@Component
@RequiredArgsConstructor
class AccountLinker extends OidcUserService {
    private final UserRepository users;

    @Override
    public OidcUser loadUser(OidcUserRequest req) {
        OidcUser oidc = super.loadUser(req);
        String iss = oidc.getIssuer().toString();
        users.findByIssuerAndSubject(iss, oidc.getSubject())       // never key by email
             .orElseGet(() -> users.save(User.from(iss, oidc.getSubject(), oidc.getEmail())));
        return oidc;
    }
}`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Frontend gửi ID Token tới API để xác thực có sao không?',
        en: 'Is it OK for the frontend to send the ID Token to the API for authentication?'
      },
      answer: {
        vi: 'Không. ID Token có aud = client_id, không dành cho API; API không thể biết token đó được cấp cho mình. Dùng access token có aud = API và scope phù hợp. Chấp nhận ID Token ở API mở đường cho việc dùng token của app khác.',
        en: 'No. The ID Token’s aud is the client_id, not the API; the API cannot tell it was meant for it. Use an access token with aud = the API and appropriate scopes. Accepting ID Tokens at APIs enables replaying tokens issued to other apps.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Thiết kế việc xử lý xoay khoá ký của IdP ở phía API có hàng trăm pod.',
        en: 'Design handling of IdP signing-key rotation for an API with hundreds of pods.'
      },
      answer: {
        vi: 'Cache JWKS theo Cache-Control; khi gặp kid lạ thì refetch một lần (có debounce, rate limit) rồi thử lại; không fallback sang khoá khác khi kid không khớp. IdP công bố khoá mới trước khi ký, giữ khoá cũ tới khi token cũ hết hạn. Theo dõi lỗi "unknown kid".',
        en: 'Cache the JWKS per Cache-Control; on an unknown kid refetch once (debounced, rate-limited) and retry; never fall back to other keys when the kid mismatches. The IdP publishes the new key before signing with it and keeps the old one until old tokens expire. Monitor “unknown kid” errors.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.oidcCore,
    SECURITY_CITATIONS.keycloakOidc,
    SECURITY_CITATIONS.rfc7519
  ]
};
