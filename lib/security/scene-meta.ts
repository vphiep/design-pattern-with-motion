import type { SceneMeta } from '@/lib/patterns/scene';
import { buildSceneMeta } from '../courses/helpers';
import { SECURITY_COURSE } from './data';

/** Step metadata derives from each topic's `steps`; only captions are authored here. */
export const SECURITY_SCENE_META: Record<string, SceneMeta> = buildSceneMeta(SECURITY_COURSE, {
  'security-fundamentals-cia': {
    vi: 'Tài sản & CIA → trust boundary → STRIDE ở mỗi điểm vượt → control nhiều lớp, deny by default.',
    en: 'Assets & CIA → trust boundaries → STRIDE at each crossing → layered controls, deny by default.'
  },
  'cryptography-hashing-signatures': {
    vi: 'AES-GCM mã hoá + xác thực → hash vs HMAC → ký Ed25519 → envelope encryption với KMS.',
    en: 'AES-GCM encrypt + authenticate → hash vs HMAC → Ed25519 signatures → envelope encryption with a KMS.'
  },
  'tls13-mtls-zero-trust': {
    vi: 'ClientHello+key_share → ServerHello + chứng chỉ mã hoá → mTLS hai chiều → phân quyền theo danh tính.',
    en: 'ClientHello+key_share → ServerHello + encrypted certificate → two-way mTLS → identity-based authorization.'
  },
  'sessions-tokens-passwords': {
    vi: 'Xác minh credential → đổi session id → cookie HttpOnly/Secure/SameSite → logout huỷ phiên trên server.',
    en: 'Verify the credential → rotate the session id → HttpOnly/Secure/SameSite cookie → logout ends the server session.'
  },
  'authorization-rbac-abac-rebac': {
    vi: 'RBAC theo role → ABAC theo thuộc tính & ngữ cảnh → ReBAC theo đồ thị quan hệ → deny by default trên từng object.',
    en: 'RBAC by role → ABAC by attributes & context → ReBAC by relationship graph → deny by default per object.'
  },
  'password-security-mfa': {
    vi: 'Argon2id → độ dài + blocklist → rate limit → TOTP → passkey chống phishing.',
    en: 'Argon2id → length + blocklist → rate limits → TOTP → phishing-resistant passkeys.'
  },
  'oauth2-architecture-concepts': {
    vi: 'Đăng ký client → redirect tới AS → consent & code → đổi lấy access token → gọi Resource Server.',
    en: 'Register the client → redirect to the AS → consent & code → exchange for an access token → call the Resource Server.'
  },
  'oauth2-authorization-code-pkce': {
    vi: 'PKCE: verifier/challenge → /authorize → code + state → /token với verifier → gọi API.',
    en: 'PKCE: verifier/challenge → /authorize → code + state → /token with verifier → call the API.'
  },
  'jwt-validation-rotation': {
    vi: 'Tách JWT → chọn khoá theo kid & ghim alg → verify chữ ký → kiểm tra iss/aud/exp/scope.',
    en: 'Split the JWT → pick the key by kid & pin alg → verify the signature → check iss/aud/exp/scope.'
  },
  'openid-connect-id-token': {
    vi: 'Discovery → authorize với openid + nonce → xác minh ID Token bằng JWKS → liên kết (iss, sub).',
    en: 'Discovery → authorize with openid + nonce → verify the ID Token via JWKS → link (iss, sub).'
  },
  'owasp-top10-web-vulnerabilities': {
    vi: 'A01 owner check → A05 prepared statement → SSRF allowlist → A02 actuator tối thiểu → A10 fail closed.',
    en: 'A01 owner check → A05 prepared statements → SSRF allowlist → A02 minimal actuator → A10 fail closed.'
  },
  'browser-security-xss-csrf-cors-csp': {
    vi: 'SOP + cookie __Host- → CSRF bị chặn → CORS preflight cho origin tin cậy → CSP nonce chặn script chèn.',
    en: 'SOP + __Host- cookie → CSRF blocked → CORS preflight for a trusted origin → a CSP nonce blocks injected script.'
  },
  'api-security-secure-coding': {
    vi: 'Scope + quyền object → DTO chặn mass assignment → validation → token bucket → lỗi an toàn & audit.',
    en: 'Scope + object permission → DTOs block mass assignment → validation → token bucket → safe errors & audit.'
  },
  'iam-keycloak-sso-ldap': {
    vi: 'Realm → client OIDC → role qua group → federation từ AD → brokering tới IdP ngoài.',
    en: 'Realm → OIDC client → roles via groups → federation from AD → brokering to external IdPs.'
  },
  'microservices-zero-trust': {
    vi: 'JWT ở biên → Token Exchange → mTLS STRICT → AuthorizationPolicy theo workload → service bị chiếm bị chặn.',
    en: 'JWT at the edge → Token Exchange → STRICT mTLS → per-workload AuthorizationPolicy → the compromised service is contained.'
  },
  'spring-security-internals': {
    vi: 'FilterChainProxy chọn chain → filter xác thực + ProviderManager → SecurityContextHolder → AuthorizationFilter → @PreAuthorize.',
    en: 'FilterChainProxy picks a chain → authentication filter + ProviderManager → SecurityContextHolder → AuthorizationFilter → @PreAuthorize.'
  }
});
