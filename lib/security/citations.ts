import type { CourseCitation } from '../courses/types';

export const SECURITY_CITATIONS = {
  rfc6749: {
    source: 'IETF RFC 6749',
    title: 'The OAuth 2.0 Authorization Framework',
    url: 'https://datatracker.ietf.org/doc/html/rfc6749',
    keyTakeaway: {
      vi: 'OAuth là khung UỶ QUYỀN (delegated authorization): client nhận access token có phạm vi giới hạn thay vì mật khẩu của user.',
      en: 'OAuth is a DELEGATED AUTHORIZATION framework: the client receives a scoped access token instead of the user’s password.'
    }
  },
  rfc7636: {
    source: 'IETF RFC 7636',
    title: 'Proof Key for Code Exchange (PKCE)',
    url: 'https://datatracker.ietf.org/doc/html/rfc7636',
    keyTakeaway: {
      vi: 'code_challenge = BASE64URL(SHA256(code_verifier)); kẻ đánh cắp authorization code không có verifier thì không đổi được token.',
      en: 'code_challenge = BASE64URL(SHA256(code_verifier)); a stolen authorization code is useless without the verifier.'
    }
  },
  rfc9700: {
    source: 'IETF RFC 9700',
    title: 'Best Current Practice for OAuth 2.0 Security (2025)',
    url: 'https://datatracker.ietf.org/doc/html/rfc9700',
    keyTakeaway: {
      vi: 'Bắt buộc PKCE, so khớp redirect URI chính xác, bỏ implicit và password grant, refresh token phải sender-constrained hoặc rotate.',
      en: 'Require PKCE, exact redirect URI matching, drop the implicit and password grants, and sender-constrain or rotate refresh tokens.'
    }
  },
  oidcCore: {
    source: 'OpenID Foundation',
    title: 'OpenID Connect Core 1.0',
    url: 'https://openid.net/specs/openid-connect-core-1_0.html',
    keyTakeaway: {
      vi: 'OIDC thêm lớp XÁC THỰC lên OAuth: ID Token là JWT mô tả sự kiện đăng nhập, dành cho client chứ không phải cho API.',
      en: 'OIDC adds AUTHENTICATION on top of OAuth: the ID Token is a JWT describing the login event, meant for the client, not for APIs.'
    }
  },
  rfc7519: {
    source: 'IETF RFC 7519 / RFC 8725',
    title: 'JSON Web Token & JWT Best Current Practices',
    url: 'https://datatracker.ietf.org/doc/html/rfc8725',
    keyTakeaway: {
      vi: 'Luôn ràng buộc thuật toán theo key, không tin header alg, kiểm tra iss/aud/exp cho mọi token.',
      en: 'Always bind the algorithm to the key, never trust the alg header, validate iss/aud/exp on every token.'
    }
  },
  rfc8446: {
    source: 'IETF RFC 8446',
    title: 'The Transport Layer Security (TLS) Protocol Version 1.3',
    url: 'https://datatracker.ietf.org/doc/html/rfc8446',
    keyTakeaway: {
      vi: 'TLS 1.3 chỉ còn trao đổi khoá (EC)DHE có forward secrecy, handshake 1-RTT và mã hoá cả chứng chỉ server.',
      en: 'TLS 1.3 keeps only forward-secret (EC)DHE key exchange, a 1-RTT handshake and encrypts the server certificate.'
    }
  },
  spiffe: {
    source: 'SPIFFE / CNCF',
    title: 'SPIFFE: Secure Production Identity Framework for Everyone',
    url: 'https://spiffe.io/docs/latest/spiffe-about/overview/',
    keyTakeaway: {
      vi: 'Danh tính workload là SPIFFE ID (spiffe://domain/path) trong SAN của chứng chỉ X.509 ngắn hạn, tự động xoay vòng.',
      en: 'Workload identity is a SPIFFE ID (spiffe://domain/path) in the SAN of a short-lived, auto-rotated X.509 certificate.'
    }
  },
  dpop: {
    source: 'IETF RFC 9449 / RFC 8693',
    title: 'DPoP & OAuth 2.0 Token Exchange',
    url: 'https://datatracker.ietf.org/doc/html/rfc9449',
    keyTakeaway: {
      vi: 'DPoP gắn access token với khoá của client; token bị đánh cắp không dùng được nếu thiếu proof ký bằng khoá riêng.',
      en: 'DPoP binds an access token to the client’s key; a stolen token is useless without a proof signed by the private key.'
    }
  },
  owaspPasswords: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Password Storage & Session Management Cheat Sheets',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Dùng Argon2id (m=19 MiB, t=2, p=1) hoặc bcrypt cost ≥ 10; cookie phiên HttpOnly, Secure, SameSite và đổi session id khi đăng nhập.',
      en: 'Use Argon2id (m=19 MiB, t=2, p=1) or bcrypt cost ≥ 10; session cookies HttpOnly, Secure, SameSite, and rotate the session id at login.'
    }
  },
  nist800207: {
    source: 'NIST',
    title: 'SP 800-207 — Zero Trust Architecture',
    url: 'https://csrc.nist.gov/pubs/sp/800/207/final',
    keyTakeaway: {
      vi: 'Zero trust bảo vệ tài nguyên chứ không bảo vệ phân đoạn mạng; xác thực và phân quyền (cả chủ thể lẫn thiết bị) diễn ra trước mỗi phiên truy cập tài nguyên.',
      en: 'Zero trust protects resources, not network segments; authentication and authorization (of both subject and device) happen before each session to a resource.'
    }
  },
  nist800162: {
    source: 'NIST',
    title: 'SP 800-162 — Guide to Attribute Based Access Control (ABAC)',
    url: 'https://csrc.nist.gov/pubs/sp/800/162/upd2/final',
    keyTakeaway: {
      vi: 'ABAC quyết định quyền bằng cách đánh giá thuộc tính của subject, object, thao tác và môi trường theo policy.',
      en: 'ABAC decides access by evaluating attributes of the subject, object, requested operation and environment against policy.'
    }
  },
  zanzibar: {
    source: 'Google Research (USENIX ATC 2019)',
    title: 'Zanzibar: Google’s Consistent, Global Authorization System',
    url: 'https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/',
    keyTakeaway: {
      vi: 'Phân quyền dựa trên quan hệ (ReBAC) ở quy mô hàng nghìn tỷ ACL và hàng triệu request/giây, p95 dưới 10 ms, tôn trọng thứ tự nhân quả của thao tác người dùng.',
      en: 'Relationship-based authorization at trillions of ACLs and millions of requests per second, p95 under 10 ms, respecting the causal order of user actions.'
    }
  },
  owaspAuthorization: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Authorization Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Deny by default, least privilege, kiểm tra quyền ở MỌI request cho đúng object được truy cập; ưu tiên ABAC/ReBAC hơn RBAC thuần cho ứng dụng.',
      en: 'Deny by default, least privilege, check permissions on EVERY request for the specific object accessed; prefer ABAC/ReBAC over plain RBAC for applications.'
    }
  },
  nist80063b: {
    source: 'NIST',
    title: 'SP 800-63B-4 — Authentication and Authenticator Management',
    url: 'https://pages.nist.gov/800-63-4/sp800-63b.html',
    keyTakeaway: {
      vi: 'Mật khẩu dùng một mình tối thiểu 15 ký tự (8 nếu là một phần của MFA), không áp quy tắc thành phần, không bắt đổi định kỳ, phải so với blocklist và giới hạn số lần thử.',
      en: 'Single-factor passwords need at least 15 characters (8 within MFA), no composition rules, no periodic rotation, a blocklist check and rate limiting.'
    }
  },
  rfc6238: {
    source: 'IETF',
    title: 'RFC 6238 — TOTP: Time-Based One-Time Password Algorithm',
    url: 'https://www.rfc-editor.org/rfc/rfc6238',
    keyTakeaway: {
      vi: 'TOTP = HOTP(K, T) với T = ⌊(now − T0)/X⌋, X mặc định 30 giây; HMAC-SHA-1 mặc định; mã đã dùng thành công không được chấp nhận lần hai.',
      en: 'TOTP = HOTP(K, T) with T = ⌊(now − T0)/X⌋, X defaulting to 30 seconds; HMAC-SHA-1 by default; a code already accepted must not be accepted again.'
    }
  },
  owaspMfa: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Multifactor Authentication Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Ba nhóm yếu tố: biết, có, là; SMS bị xếp loại hạn chế; passkey có user verification là MFA chống phishing; cấp recovery code dùng một lần khi đăng ký.',
      en: 'Three factor groups: know, have, are; SMS is restricted; passkeys with user verification are phishing-resistant MFA; issue single-use recovery codes at enrolment.'
    }
  },
  webauthn: {
    source: 'W3C',
    title: 'Web Authentication Level 3 (WebAuthn)',
    url: 'https://www.w3.org/TR/webauthn-3/',
    keyTakeaway: {
      vi: 'Credential chỉ dùng được bởi origin thuộc Relying Party đã đăng ký; server chỉ lưu public key, private key không rời authenticator.',
      en: 'A credential can only be used by origins belonging to the registered Relying Party; the server stores only the public key and the private key never leaves the authenticator.'
    }
  },
  owaspCryptoStorage: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Cryptographic Storage Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'AES ≥128 bit (tốt nhất 256) ở chế độ xác thực GCM/CCM, RSA ≥2048 với OAEP, khoá nằm trong KMS/HSM theo envelope encryption, xoay khoá theo cryptoperiod.',
      en: 'AES ≥128-bit (ideally 256) in an authenticated mode such as GCM/CCM, RSA ≥2048 with OAEP, keys in a KMS/HSM via envelope encryption, rotation per cryptoperiod.'
    }
  },
  rfc8628: {
    source: 'IETF',
    title: 'RFC 8628 — OAuth 2.0 Device Authorization Grant',
    url: 'https://www.rfc-editor.org/rfc/rfc8628',
    keyTakeaway: {
      vi: 'Thiết bị nhận device_code + user_code, người dùng nhập mã ở verification_uri; client poll /token với interval mặc định 5 giây, slow_down tăng thêm 5 giây.',
      en: 'The device gets a device_code + user_code, the user enters the code at verification_uri; the client polls /token with a default 5-second interval, slow_down adds 5 seconds.'
    }
  },
  rfc8693: {
    source: 'IETF',
    title: 'RFC 8693 — OAuth 2.0 Token Exchange',
    url: 'https://www.rfc-editor.org/rfc/rfc8693',
    keyTakeaway: {
      vi: 'Đổi subject_token (và tuỳ chọn actor_token) lấy token mới cho audience khác; claim act biểu diễn chuỗi uỷ quyền (delegation).',
      en: 'Exchange a subject_token (and optionally an actor_token) for a new token for another audience; the act claim expresses the delegation chain.'
    }
  },
  rfc9068: {
    source: 'IETF',
    title: 'RFC 9068 — JWT Profile for OAuth 2.0 Access Tokens',
    url: 'https://www.rfc-editor.org/rfc/rfc9068',
    keyTakeaway: {
      vi: 'Access token JWT có typ "at+jwt" và các claim bắt buộc iss, exp, aud, sub, client_id, iat, jti; resource server phải kiểm tra typ, iss, aud, chữ ký và từ chối alg "none".',
      en: 'JWT access tokens carry typ "at+jwt" and the required claims iss, exp, aud, sub, client_id, iat, jti; resource servers must check typ, iss, aud, the signature and reject alg "none".'
    }
  },
  owaspTop10: {
    source: 'OWASP',
    title: 'OWASP Top 10:2025',
    url: 'https://owasp.org/Top10/',
    keyTakeaway: {
      vi: 'A01 Broken Access Control (đã gộp SSRF), A02 Security Misconfiguration, A03 Software Supply Chain Failures (mới), A04 Cryptographic Failures, A05 Injection … A10 Mishandling of Exceptional Conditions (mới).',
      en: 'A01 Broken Access Control (now including SSRF), A02 Security Misconfiguration, A03 Software Supply Chain Failures (new), A04 Cryptographic Failures, A05 Injection … A10 Mishandling of Exceptional Conditions (new).'
    }
  },
  owaspApiTop10: {
    source: 'OWASP',
    title: 'OWASP API Security Top 10 (2023)',
    url: 'https://owasp.org/API-Security/editions/2023/en/0x11-t10/',
    keyTakeaway: {
      vi: 'API1 Broken Object Level Authorization (BOLA) đứng đầu; tiếp theo là Broken Authentication, Broken Object Property Level Authorization, Unrestricted Resource Consumption…',
      en: 'API1 Broken Object Level Authorization (BOLA) leads, followed by Broken Authentication, Broken Object Property Level Authorization, Unrestricted Resource Consumption…'
    }
  },
  owaspSqli: {
    source: 'OWASP Cheat Sheet Series',
    title: 'SQL Injection Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Phòng thủ chính là prepared statement có tham số; tên cột/hướng sắp xếp phải qua allowlist; escaping bị "strongly discouraged".',
      en: 'The primary defence is parameterised prepared statements; column names/sort directions go through an allowlist; escaping is "strongly discouraged".'
    }
  },
  owaspSsrf: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Server-Side Request Forgery Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Ưu tiên allowlist đích; tắt follow redirect; chặn 169.254.169.254 và dải nội bộ; kiểm tra IP sau khi resolve để chống DNS rebinding.',
      en: 'Prefer destination allowlists; disable redirect following; block 169.254.169.254 and internal ranges; validate the resolved IP to resist DNS rebinding.'
    }
  },
  owaspCsrf: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Cross-Site Request Forgery Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Dùng CSRF protection của framework (synchronizer token, signed double-submit); Sec-Fetch-Site là tín hiệu chính; SameSite chỉ là lớp phòng thủ bổ sung.',
      en: 'Use the framework’s CSRF protection (synchronizer token, signed double-submit); Sec-Fetch-Site is the primary signal; SameSite is defence in depth only.'
    }
  },
  owaspXss: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Cross Site Scripting Prevention Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Encoding theo đúng ngữ cảnh (HTML, attribute, JS, CSS, URL), ưu tiên auto-escaping của framework, sanitize HTML bằng DOMPurify; CSP chỉ là lớp bổ sung.',
      en: 'Context-specific encoding (HTML, attribute, JS, CSS, URL), rely on framework auto-escaping, sanitise HTML with DOMPurify; CSP is an extra layer only.'
    }
  },
  mdnCors: {
    source: 'MDN Web Docs',
    title: 'Cross-Origin Resource Sharing (CORS)',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
    keyTakeaway: {
      vi: 'Request không phải "simple" bị preflight bằng OPTIONS; khi có credentials, Access-Control-Allow-Origin không được là "*". CORS chỉ quyết định script có đọc được response hay không.',
      en: 'Non-"simple" requests are preflighted with OPTIONS; with credentials, Access-Control-Allow-Origin must not be "*". CORS only decides whether script may read the response.'
    }
  },
  mdnCsp: {
    source: 'MDN Web Docs',
    title: 'Content Security Policy (CSP)',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP',
    keyTakeaway: {
      vi: 'Nonce ngẫu nhiên cho mỗi response + strict-dynamic; tránh unsafe-inline; Report-Only để thử trước; frame-ancestors thay X-Frame-Options.',
      en: 'A random per-response nonce + strict-dynamic; avoid unsafe-inline; Report-Only to trial first; frame-ancestors replaces X-Frame-Options.'
    }
  },
  owaspHeaders: {
    source: 'OWASP Cheat Sheet Series',
    title: 'HTTP Security Response Headers Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'HSTS, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, CSP frame-ancestors; đặt X-XSS-Protection: 0.',
      en: 'HSTS, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, CSP frame-ancestors; set X-XSS-Protection: 0.'
    }
  },
  keycloakAdmin: {
    source: 'Keycloak Documentation',
    title: 'Server Administration Guide',
    url: 'https://www.keycloak.org/docs/latest/server_admin/index.html',
    keyTakeaway: {
      vi: 'Realm cô lập user/role/client (không tạo user ở realm master); group truyền role và attribute cho thành viên; LDAP federation với chế độ READ_ONLY/WRITABLE/UNSYNCED; brokering tới IdP OIDC/SAML/social.',
      en: 'Realms isolate users/roles/clients (do not create users in master); groups pass roles and attributes to members; LDAP federation with READ_ONLY/WRITABLE/UNSYNCED modes; brokering to OIDC/SAML/social IdPs.'
    }
  },
  keycloakOidc: {
    source: 'Keycloak Documentation',
    title: 'Securing applications with OpenID Connect',
    url: 'https://www.keycloak.org/securing-apps/oidc-layers',
    keyTakeaway: {
      vi: 'Discovery tại /realms/{realm}/.well-known/openid-configuration; endpoint auth, token, userinfo, certs, logout, introspect nằm dưới /protocol/openid-connect.',
      en: 'Discovery at /realms/{realm}/.well-known/openid-configuration; the auth, token, userinfo, certs, logout and introspect endpoints sit under /protocol/openid-connect.'
    }
  },
  springArchitecture: {
    source: 'Spring Security Reference',
    title: 'Servlet Applications — Architecture',
    url: 'https://docs.spring.io/spring-security/reference/servlet/architecture.html',
    keyTakeaway: {
      vi: 'DelegatingFilterProxy → FilterChainProxy → SecurityFilterChain đầu tiên khớp request; ExceptionTranslationFilter biến lỗi xác thực/phân quyền thành 401/403.',
      en: 'DelegatingFilterProxy → FilterChainProxy → the first SecurityFilterChain matching the request; ExceptionTranslationFilter turns authentication/authorization errors into 401/403.'
    }
  },
  springAuthArchitecture: {
    source: 'Spring Security Reference',
    title: 'Servlet Authentication Architecture',
    url: 'https://docs.spring.io/spring-security/reference/servlet/authentication/architecture.html',
    keyTakeaway: {
      vi: 'SecurityContextHolder (mặc định ThreadLocal) giữ Authentication; ProviderManager uỷ thác cho danh sách AuthenticationProvider.',
      en: 'SecurityContextHolder (ThreadLocal by default) holds the Authentication; ProviderManager delegates to a list of AuthenticationProviders.'
    }
  },
  springMethodSecurity: {
    source: 'Spring Security Reference',
    title: 'Method Security',
    url: 'https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html',
    keyTakeaway: {
      vi: '@EnableMethodSecurity bật @PreAuthorize/@PostAuthorize qua Spring AOP proxy; Spring Boot không bật sẵn method security.',
      en: '@EnableMethodSecurity enables @PreAuthorize/@PostAuthorize via Spring AOP proxies; Spring Boot does not turn method security on by default.'
    }
  },
  springResourceServer: {
    source: 'Spring Security Reference',
    title: 'OAuth 2.0 Resource Server — JWT',
    url: 'https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html',
    keyTakeaway: {
      vi: 'issuer-uri đủ để kiểm tra chữ ký, iss, exp, nbf (clock skew 60 giây); scope thành authority SCOPE_*; aud KHÔNG được kiểm tra mặc định.',
      en: 'issuer-uri is enough to verify the signature, iss, exp and nbf (60-second clock skew); scopes become SCOPE_* authorities; aud is NOT checked by default.'
    }
  },
  springTesting: {
    source: 'Spring Security Reference',
    title: 'Testing — MockMvc support',
    url: 'https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/oauth2.html',
    keyTakeaway: {
      vi: '@WithMockUser, .with(jwt()) và .with(csrf()) cho phép kiểm thử rule bảo mật mà không cần IdP thật.',
      en: '@WithMockUser, .with(jwt()) and .with(csrf()) let you test security rules without a real IdP.'
    }
  },
  owaspMicroservices: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Microservices Security Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Microservices_Security_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Gateway chặn request trái phép ở biên, nhưng mỗi service vẫn phải tự kiểm tra quyền, kể cả với lời gọi nội bộ; xác thực service bằng mTLS hoặc token.',
      en: 'The gateway rejects unauthorised ingress, but every service must still enforce access, including for internal calls; authenticate services with mTLS or tokens.'
    }
  },
  owaspThreatModeling: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Threat Modeling Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Mô hình hoá hệ thống bằng data flow và trust boundary, dùng STRIDE để liệt kê mối đe doạ, rồi chọn biện pháp và kiểm chứng; làm sớm và lặp lại theo thiết kế.',
      en: 'Model the system with data flows and trust boundaries, enumerate threats with STRIDE, then choose mitigations and verify them; do it early and repeat as the design changes.'
    }
  },
  rfc5280: {
    source: 'IETF',
    title: 'RFC 5280 — Internet X.509 PKI Certificate and CRL Profile',
    url: 'https://www.rfc-editor.org/rfc/rfc5280',
    keyTakeaway: {
      vi: 'Định nghĩa cấu trúc chứng chỉ X.509 v3, extension (SAN, key usage, basic constraints) và thuật toán xác minh đường đi chứng chỉ tới trust anchor.',
      en: 'Defines the X.509 v3 certificate structure, its extensions (SAN, key usage, basic constraints) and the path-validation algorithm up to a trust anchor.'
    }
  },
  owaspSession: {
    source: 'OWASP Cheat Sheet Series',
    title: 'Session Management Cheat Sheet',
    url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
    keyTakeaway: {
      vi: 'Session ID ngẫu nhiên đủ entropy, cookie Secure/HttpOnly/SameSite, đổi ID sau đăng nhập, idle và absolute timeout, huỷ phiên phía server khi logout.',
      en: 'High-entropy random session IDs, Secure/HttpOnly/SameSite cookies, ID renewal after login, idle and absolute timeouts, server-side invalidation on logout.'
    }
  },
  rfc6750: {
    source: 'IETF',
    title: 'RFC 6750 — OAuth 2.0 Bearer Token Usage',
    url: 'https://www.rfc-editor.org/rfc/rfc6750',
    keyTakeaway: {
      vi: 'Ai cầm bearer token là dùng được; gửi qua header Authorization trên TLS, không đặt trong URL; lỗi invalid_token/insufficient_scope qua WWW-Authenticate.',
      en: 'Whoever holds a bearer token can use it; send it in the Authorization header over TLS, never in URLs; errors invalid_token/insufficient_scope via WWW-Authenticate.'
    }
  }
} satisfies Record<string, CourseCitation>;
