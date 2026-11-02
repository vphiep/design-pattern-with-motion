import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const jwtValidationRotationTopic: SecurityTopic = {
  id: 'jwt-validation-rotation',
  roadmapId: 'SEC-09',
  category: 'sec-oauth-jwt-oidc',
  level: 'intermediate',
  levelTo: 'advanced',
  chapter: 'Cấp độ 3',
  name: 'JWT: Structure, Signature & Token Validation',
  tagline: {
    vi: 'header.payload.signature mã hoá Base64URL, claims iss/sub/aud/exp/iat/nbf, JWS vs JWE, HS256 vs RS256/ES256, JWKS và xoay khoá theo kid, hết hạn và thu hồi, alg=none và alg confusion — decode không có nghĩa là verify.',
    en: 'header.payload.signature in Base64URL, the iss/sub/aud/exp/iat/nbf claims, JWS vs JWE, HS256 vs RS256/ES256, JWKS and kid-based key rotation, expiry and revocation, alg=none and algorithm confusion — decoding is not verifying.'
  },
  difficulty: 3,
  order: 9,
  estimatedMinutes: 28,

  coreTheory: {
    problemStatement: {
      vi: 'Hàng chục microservice cần xác minh người gọi mà không gọi IdP mỗi request. JWT cho phép điều đó, nhưng lịch sử đầy lỗ hổng: thư viện tin trường alg trong header (chấp nhận "none"), dùng public key RSA làm secret HMAC, quên kiểm tra aud — và token ký số không thu hồi được trước khi hết hạn.',
      en: 'Dozens of microservices must verify callers without calling the IdP per request. JWTs enable that, but their history is full of holes: libraries trusting the header alg (accepting "none"), using the RSA public key as an HMAC secret, forgetting aud — and signed tokens cannot be revoked before expiry.'
    },
    hardwareConstraint: {
      vi: 'Xác minh chữ ký phải nhanh (micro giây) trên mọi request; trạng thái thu hồi tập trung sẽ phá vỡ tính stateless và thêm một round-trip mạng.',
      en: 'Signature verification must be fast (microseconds) on every request; a central revocation state breaks statelessness and adds a network round-trip.'
    },
    fundamentalSolution: {
      vi: 'JWS compact = BASE64URL(header) "." BASE64URL(payload) "." BASE64URL(signature), với signature = Sign(key, header "." payload). Dùng chữ ký bất đối xứng (ES256/RS256/EdDSA): IdP giữ private key, service chỉ có public key. Server KHÔNG tin header: chọn khoá theo kid từ JWKS tin cậy, và thuật toán được ràng buộc với khoá đó. Sau chữ ký, kiểm tra iss, aud, exp/nbf (lệch giờ ≤ 60 s). Access token sống 5–15 phút; refresh token dài hơn nhưng xoay vòng mỗi lần dùng, và dùng lại refresh token cũ sẽ thu hồi cả họ token.',
      en: 'JWS compact = BASE64URL(header) "." BASE64URL(payload) "." BASE64URL(signature), with signature = Sign(key, header "." payload). Use asymmetric signatures (ES256/RS256/EdDSA): the IdP holds the private key, services hold only public keys. The server must NOT trust the header: pick the key by kid from a trusted JWKS, with the algorithm bound to that key. After the signature, check iss, aud, exp/nbf (≤ 60 s skew). Access tokens live 5–15 minutes; refresh tokens live longer but rotate on every use, and reuse of an old refresh token revokes the whole token family.'
    },
    math: {
      formula: String.raw`\text{valid}(t) \iff \text{Verify}_{\,pk(t.\text{kid}),\ \text{alg}(pk)}\big(h \,\|\, \text{"."} \,\|\, p,\ \sigma\big) \wedge \text{iss} \wedge \text{aud} \wedge \text{nbf} - s \le \text{now} < \text{exp} + s`,
      description: {
        vi: 'Điểm mấu chốt: thuật toán là thuộc tính của KHOÁ (alg(pk)), không phải của token (t.alg). Thời gian lộ tối đa của token bị đánh cắp = TTL + s, nên TTL ngắn thay cho thu hồi.',
        en: 'The key point: the algorithm is a property of the KEY (alg(pk)), not of the token (t.alg). A stolen token’s maximum exposure = TTL + s, so a short TTL substitutes for revocation.'
      },
      timeComplexity: 'O(1): ~50 µs ES256 verify',
      spaceComplexity: 'O(keys) JWKS cache'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'JWT chỉ là định dạng; bảo mật nằm ở cách xác minh. RFC 8725 (JWT BCP) liệt kê các quy tắc bắt buộc.',
      en: 'JWT is just a format; security lives in verification. RFC 8725 (JWT BCP) lists the mandatory rules.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Alg confusion: server cấu hình RS256 với public key PEM. Kẻ tấn công tạo token header alg=HS256 và ký HMAC bằng chính chuỗi public key (ai cũng có). Thư viện ngây thơ đọc alg từ header và gọi HMAC-verify với "key" là public key → chấp nhận. Phòng: whitelist thuật toán cho từng khoá; không bao giờ để header quyết định.',
        en: 'Algorithm confusion: a server configured for RS256 with a PEM public key. The attacker crafts a token with alg=HS256 and HMAC-signs it using the public key string (which anyone has). A naive library reads alg from the header and HMAC-verifies using the public key as the secret → accepted. Defence: an algorithm allow-list per key; never let the header decide.'
      },
      {
        vi: 'Payload chỉ được base64url, KHÔNG mã hoá — ai có token đều đọc được. Không đặt PII, quyền chi tiết hay bí mật vào JWT; nếu cần bí mật dùng JWE hoặc opaque token + introspection. Refresh token rotation (RFC 9700): mỗi lần đổi refresh token cấp cặp mới và vô hiệu cái cũ; nếu cái cũ được dùng lại (dấu hiệu bị đánh cắp), thu hồi toàn bộ họ token.',
        en: 'The payload is only base64url-encoded, NOT encrypted — anyone with the token can read it. Never put PII, fine-grained permissions or secrets in a JWT; use JWE or opaque tokens + introspection when confidentiality matters. Refresh-token rotation (RFC 9700): each refresh issues a new pair and invalidates the old token; if an old one is reused (a theft signal), revoke the whole family.'
      },
      {
        vi: 'Base64URL không phải mã hoá: header và payload của JWS chỉ được encode (bảng chữ cái URL-safe, bỏ padding), ai cũng decode và đọc được — không đặt dữ liệu nhạy cảm vào claims. Decode là đọc; verify là kiểm tra chữ ký bằng khoá tin cậy rồi kiểm tra claims. JWE (RFC 7516) mới là JWT được mã hoá, dùng khi payload phải bí mật với người cầm token.',
        en: 'Base64URL is not encryption: a JWS header and payload are only encoded (URL-safe alphabet, no padding) and anyone can decode and read them — never put sensitive data in claims. Decoding is reading; verifying is checking the signature with a trusted key and then the claims. JWE (RFC 7516) is the encrypted JWT, used when the payload must stay secret from the token holder.'
      },
      {
        vi: 'Claims đăng ký (RFC 7519): iss (ai phát hành), sub (chủ thể), aud (dành cho ai), exp (hết hạn), nbf (chưa hiệu lực trước), iat (thời điểm phát hành), jti (định danh duy nhất). Theo RFC 9068, access token JWT có typ "at+jwt" và bắt buộc iss, exp, aud, sub, client_id, iat, jti; resource server phải kiểm tra typ, iss khớp chính xác, aud chứa chính nó, chữ ký, và từ chối alg "none". Spring Resource Server kiểm tra chữ ký, iss, exp, nbf mặc định nhưng KHÔNG kiểm tra aud — phải tự thêm.',
        en: 'Registered claims (RFC 7519): iss (issuer), sub (subject), aud (intended audience), exp (expiry), nbf (not before), iat (issued at), jti (unique id). Per RFC 9068, JWT access tokens have typ "at+jwt" and require iss, exp, aud, sub, client_id, iat, jti; the resource server must check typ, an exact iss match, that aud contains itself, the signature, and reject alg "none". Spring Resource Server checks signature, iss, exp and nbf by default but NOT aud — add it yourself.'
      },
      {
        vi: 'Thu hồi: JWT tự chứa không thể "gọi lại". Các lựa chọn: TTL ngắn (5–15 phút) + thu hồi refresh token; blocklist theo jti cho sự cố khẩn cấp; hoặc token opaque + introspection (RFC 7662) khi cần thu hồi tức thì, đổi lại một lần gọi mạng mỗi request. Xoay khoá ký: publish khoá mới trong JWKS trước, ký bằng khoá mới, giữ khoá cũ tới khi token cũ hết hạn.',
        en: 'Revocation: a self-contained JWT cannot be "recalled". Options: short TTLs (5–15 minutes) + refresh-token revocation; a jti blocklist for emergencies; or opaque tokens + introspection (RFC 7662) when instant revocation is needed, at the cost of a network call per request. Signing-key rotation: publish the new key in the JWKS first, sign with it, keep the old key until old tokens expire.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'jwt.decode() thay vì jwt.verify() — đọc claims mà không kiểm chữ ký.',
        en: 'jwt.decode() instead of jwt.verify() — reading claims without checking the signature.'
      },
      {
        vi: 'Bỏ qua aud: token cấp cho service A dùng được ở service B.',
        en: 'Skipping aud: a token issued for service A works at service B.'
      },
      {
        vi: 'HS256 với secret chia sẻ cho 20 service: một service bị lộ là mọi service bị giả mạo.',
        en: 'HS256 with a secret shared by 20 services: one compromised service can forge tokens for all.'
      },
      {
        vi: 'Access token TTL 24 giờ "cho đỡ phải refresh".',
        en: '24-hour access-token TTLs “to avoid refreshing”.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Pipeline xác minh JWT ở resource server',
      en: 'The JWT verification pipeline at a resource server'
    },
    description: {
      vi: 'Thứ tự kiểm tra và điểm từ chối của từng loại tấn công.',
      en: 'Check order and where each attack is rejected.'
    },
    asciiDiagram: `
 eyJhbGciOiJFUzI1NiIsImtpZCI6IjIwMjYtMTEifQ . eyJpc3MiOi…InNjb3BlIjoib3JkZXJzOnJlYWQifQ . MEUCIQ…
 └─ header {"alg":"ES256","kid":"2026-11"}    └─ payload {iss, sub, aud, exp, scope}      └─ signature

 1. split + base64url-decode            ── malformed           → 401
 2. key = JWKS[kid] (cached, trusted)   ── unknown kid         → refetch once → 401
 3. alg allowed for key? (ES256 only)   ── alg=none / HS256    → 401  (alg confusion blocked)
 4. ECDSA verify(pk, header.payload, σ) ── tampered payload    → 401
 5. iss == https://idp.example.com      ── foreign issuer      → 401
 6. aud ∋ "orders-api"                  ── token for other API → 401
 7. nbf - 60s ≤ now < exp + 60s         ── expired / not yet   → 401
 8. scope ∋ "orders:read"               ── insufficient scope  → 403
`,
    components: [
      {
        name: 'Header',
        role: 'alg + kid',
        description: {
          vi: 'Gợi ý, không phải mệnh lệnh: chỉ dùng kid để tra khoá.',
          en: 'A hint, not a command: use kid only to look up the key.'
        }
      },
      {
        name: 'Payload',
        role: 'Claims',
        description: {
          vi: 'Base64url, không mã hoá — đừng đặt bí mật.',
          en: 'Base64url, not encrypted — no secrets.'
        }
      },
      {
        name: 'JWKS',
        role: 'Trust anchor',
        description: {
          vi: 'Khoá công khai từ issuer cấu hình sẵn.',
          en: 'Public keys from the configured issuer.'
        }
      },
      {
        name: 'Refresh family',
        role: 'Rotation chain',
        description: {
          vi: 'Chuỗi refresh token; tái sử dụng → thu hồi cả chuỗi.',
          en: 'A chain of refresh tokens; reuse → revoke the chain.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'parse',
      title: { vi: 'Tách header · payload · signature', en: 'Split header · payload · signature' },
      phase: 'Parse',
      description: {
        vi: 'Base64url-decode header và payload; chưa tin bất cứ giá trị nào.',
        en: 'Base64url-decode the header and payload; trust nothing yet.'
      },
      systemBehavior: {
        vi: 'Token sai định dạng bị từ chối 401 ngay.',
        en: 'Malformed tokens are rejected with 401 immediately.'
      },
      codeLineMatch: 'NimbusJwtDecoder.withIssuerLocation'
    },
    {
      id: 'select-key',
      title: {
        vi: 'Chọn khoá theo kid & ghim thuật toán',
        en: 'Select the key by kid & pin the algorithm'
      },
      phase: 'Key',
      description: {
        vi: 'Tra JWKS cache bằng kid; chỉ chấp nhận ES256 cho khoá này.',
        en: 'Look up the JWKS cache by kid; accept only ES256 for this key.'
      },
      systemBehavior: {
        vi: 'alg=none hoặc HS256 bị loại trước khi verify — chặn alg confusion.',
        en: 'alg=none or HS256 are rejected before verification — blocking algorithm confusion.'
      },
      codeLineMatch: 'jwsAlgorithm(SignatureAlgorithm.ES256)'
    },
    {
      id: 'verify-sig',
      title: { vi: 'Xác minh chữ ký ECDSA', en: 'Verify the ECDSA signature' },
      phase: 'Signature',
      description: {
        vi: 'Verify(pk, header "." payload, σ); sửa một bit payload là thất bại.',
        en: 'Verify(pk, header "." payload, σ); flipping one payload bit fails it.'
      },
      systemBehavior: {
        vi: 'Chỉ IdP giữ private key mới tạo được chữ ký hợp lệ.',
        en: 'Only the IdP holding the private key can produce a valid signature.'
      },
      codeLineMatch: 'decoder.decode(token)'
    },
    {
      id: 'claims',
      title: { vi: 'Kiểm tra iss · aud · exp · scope', en: 'Check iss · aud · exp · scope' },
      phase: 'Claims',
      description: {
        vi: 'Issuer đúng, audience là orders-api, còn hạn (lệch ≤ 60 s), có scope cần thiết.',
        en: 'Correct issuer, audience orders-api, unexpired (≤ 60 s skew), required scope present.'
      },
      systemBehavior: {
        vi: 'Hết hạn → client dùng refresh token (xoay vòng) để lấy access token mới.',
        en: 'Expired → the client uses its (rotating) refresh token for a new access token.'
      },
      codeLineMatch: 'JwtClaimValidator<List<String>>'
    }
  ],

  comparison: {
    title: {
      vi: 'HS256 (đối xứng) vs ES256/RS256 (bất đối xứng)',
      en: 'HS256 (symmetric) vs ES256/RS256 (asymmetric)'
    },
    subtitle: {
      vi: 'Ai giữ khoá ký quyết định ai có thể giả mạo',
      en: 'Who holds the signing key decides who can forge'
    },
    options: [
      {
        name: 'HS256',
        tag: 'Shared secret',
        role: { vi: 'Cùng một secret để ký và xác minh', en: 'One secret to sign and verify' },
        keyMechanism: {
          vi: 'Nhanh, đơn giản; nhưng mọi bên xác minh đều có thể ký — chỉ hợp khi issuer = verifier.',
          en: 'Fast and simple; but every verifier can also sign — fit only when issuer = verifier.'
        },
        configExample: 'HMACSHA256(base64(h) + "." + base64(p), secret)',
        architectureNote: {
          vi: 'Không dùng giữa nhiều service.',
          en: 'Not for multi-service setups.'
        }
      },
      {
        name: 'ES256 / RS256',
        tag: 'Public key',
        role: { vi: 'IdP ký bằng private key', en: 'IdP signs with its private key' },
        keyMechanism: {
          vi: 'Service chỉ có public key nên không giả mạo được; xoay khoá qua JWKS. ES256 chữ ký 64 byte, nhỏ hơn RS256 (256 byte).',
          en: 'Services hold only public keys and cannot forge; rotate via JWKS. ES256 signatures are 64 bytes vs RS256’s 256.'
        },
        configExample: '{"kty":"EC","crv":"P-256","kid":"2026-11","x":"…","y":"…"}',
        architectureNote: {
          vi: 'Lựa chọn mặc định cho OAuth/OIDC.',
          en: 'The default for OAuth/OIDC.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Xác minh stateless, không gọi IdP mỗi request.',
        en: 'Stateless verification, no IdP call per request.'
      },
      { vi: 'Claims chuẩn hoá giữa các service.', en: 'Standardised claims across services.' }
    ],
    cons: [
      {
        vi: 'Không thu hồi tức thì; phải dựa vào TTL ngắn hoặc denylist.',
        en: 'No instant revocation; rely on short TTLs or a denylist.'
      },
      {
        vi: 'Token to (≥ 800 byte) gửi kèm mọi request.',
        en: 'Large tokens (≥ 800 bytes) on every request.'
      }
    ],
    balance: {
      vi: 'TTL ngắn = rủi ro thấp khi bị đánh cắp nhưng nhiều lần refresh hơn; TTL dài = ít tải IdP nhưng cửa sổ lạm dụng lớn.',
      en: 'Short TTL = lower theft risk but more refreshes; long TTL = less IdP load but a wide abuse window.'
    },
    invariant: {
      vi: 'Thuật toán và khoá xác minh do server quyết định, không bao giờ do token.',
      en: 'The verification algorithm and key are chosen by the server, never by the token.'
    }
  },

  code: [
    {
      label: 'ResourceServerConfig.java',
      filename: 'ResourceServerConfig.java',
      language: 'java',
      code: `@Configuration
@EnableWebSecurity
class ResourceServerConfig {

    @Bean
    JwtDecoder jwtDecoder() {
        // JWKS discovered from the issuer; keys selected by kid and cached
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withIssuerLocation("https://idp.example.com/realms/corp")
            .jwsAlgorithm(SignatureAlgorithm.ES256)        // pin: alg=none / HS256 rejected
            .build();

        OAuth2TokenValidator<Jwt> validators = new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer("https://idp.example.com/realms/corp"), // iss + exp/nbf (60s skew)
            new JwtClaimValidator<List<String>>("aud", aud -> aud != null && aud.contains("orders-api")));
        decoder.setJwtValidator(validators);
        return decoder;
    }

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))   // decoder.decode(token) per request
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.GET, "/orders/**").hasAuthority("SCOPE_orders:read")
                .anyRequest().authenticated())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .build();
    }
}`
    },
    {
      label: 'alg-confusion.txt',
      filename: 'alg-confusion.txt',
      language: 'bash',
      code: `# The classic forgery a header-trusting library accepts:
# header  {"alg":"HS256","typ":"JWT"}          <- attacker switches RS256 -> HS256
# payload {"sub":"admin","aud":"orders-api","exp":4102444800}
# sig     HMAC-SHA256(h.p, key = <the server's RSA PUBLIC key PEM>)
#
# verify(token, publicKeyPem)  // naive: uses header alg => HMAC with the public key => VALID
# verify(token, jwk, algorithms=["RS256"])   // correct: algorithm pinned per key => REJECTED`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Senior',
      question: {
        vi: 'Làm sao "logout" hoặc thu hồi một JWT ngay lập tức?',
        en: 'How do you “log out” or revoke a JWT immediately?'
      },
      answer: {
        vi: 'Không thể thu hồi một JWT tự chứa nếu chỉ xác minh offline. Các lựa chọn: TTL ngắn (5 phút) + thu hồi refresh token ở IdP; denylist theo jti/sid trong Redis cho các trường hợp khẩn (đổi lại mất tính stateless); hoặc dùng opaque token + introspection cho API nhạy cảm. Kết hợp: mặc định TTL ngắn, denylist chỉ cho sự kiện bảo mật.',
        en: 'A self-contained JWT verified offline cannot be revoked. Options: short TTLs (5 minutes) + revoke the refresh token at the IdP; a Redis denylist keyed by jti/sid for emergencies (losing statelessness); or opaque tokens + introspection for sensitive APIs. Combine: short TTLs by default, a denylist only for security events.'
      },
      trapWarning: {
        vi: 'Xoá token ở client KHÔNG thu hồi được token — bản sao bị đánh cắp vẫn dùng được.',
        en: 'Deleting the token on the client does NOT revoke it — stolen copies still work.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Giải thích refresh token rotation và reuse detection.',
        en: 'Explain refresh-token rotation and reuse detection.'
      },
      answer: {
        vi: 'Mỗi lần dùng refresh token, IdP cấp refresh token mới và vô hiệu cái cũ, cùng thuộc một "family". Nếu một refresh token đã bị vô hiệu lại được dùng, chứng tỏ có hai bên giữ nó (user và kẻ tấn công) — IdP thu hồi toàn bộ family, buộc đăng nhập lại.',
        en: 'Each use of a refresh token yields a new one and invalidates the old, within one “family”. If an invalidated token is presented again, two parties hold it (user and attacker) — the IdP revokes the whole family, forcing re-login.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.rfc7519,
    SECURITY_CITATIONS.rfc9068,
    SECURITY_CITATIONS.springResourceServer,
    SECURITY_CITATIONS.rfc9700
  ]
};
