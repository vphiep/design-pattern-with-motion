import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const tls13MtlsZeroTrustTopic: SecurityTopic = {
  id: 'tls13-mtls-zero-trust',
  roadmapId: 'SEC-03',
  category: 'sec-fundamentals',
  level: 'beginner',
  levelTo: 'intermediate',
  chapter: 'Cấp độ 1',
  name: 'TLS, HTTPS & Secure Communication',
  tagline: {
    vi: 'HTTP vs HTTPS, TLS 1.2 vs 1.3, handshake 1-RTT với ECDHE (X25519), Certificate Authority và PKI, xác minh chuỗi chứng chỉ X.509, CertificateVerify, HSTS và mTLS hai chiều.',
    en: 'HTTP vs HTTPS, TLS 1.2 vs 1.3, the 1-RTT handshake with ECDHE (X25519), Certificate Authorities and PKI, X.509 chain validation, CertificateVerify, HSTS and two-way mTLS.'
  },
  difficulty: 2,
  order: 3,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'HTTP thuần gửi mật khẩu, cookie và token dưới dạng rõ: bất kỳ ai trên đường truyền (Wi-Fi công cộng, router, proxy) đều đọc và sửa được. Ngay cả trong mạng nội bộ "tin cậy", service gọi nhau bằng HTTP và tin IP nguồn — một pod bị chiếm là đọc được mọi traffic. Và với TLS một chiều, server biết mình đang nói với "ai đó" chứ không biết là service nào.',
      en: 'Plain HTTP sends passwords, cookies and tokens in clear text: anyone on the path (public Wi-Fi, routers, proxies) can read and modify them. Even on a "trusted" internal network, services call each other over HTTP and trust source IPs — one compromised pod reads all traffic. And with one-way TLS, the server knows it talks to "someone", not which service.'
    },
    hardwareConstraint: {
      vi: 'Mỗi round-trip mạng tốn 1–100 ms; mật mã khoá công khai (ECDHE, chữ ký) tốn CPU hơn mã hoá đối xứng hàng nghìn lần. Chứng chỉ dài hạn bị lộ là thảm hoạ; xoay vòng thủ công không theo kịp hàng nghìn pod.',
      en: 'Each network round-trip costs 1–100 ms; public-key crypto (ECDHE, signatures) costs thousands of times more CPU than symmetric encryption. Leaked long-lived certificates are disasters; manual rotation cannot keep up with thousands of pods.'
    },
    fundamentalSolution: {
      vi: 'TLS 1.3: client gửi key_share (X25519) ngay trong ClientHello, server trả key_share trong ServerHello → cả hai tính cùng shared secret ECDHE và dẫn xuất khoá handshake bằng HKDF sau 1 RTT. Mọi thông điệp sau đó (kể cả chứng chỉ) đã được mã hoá. Server chứng minh sở hữu private key bằng CertificateVerify (chữ ký trên transcript). mTLS: server gửi CertificateRequest, client cũng gửi chứng chỉ + CertificateVerify. Zero trust: chứng chỉ ngắn hạn (giờ) do mesh/SPIRE cấp tự động, danh tính là SPIFFE ID trong SAN, policy dựa trên danh tính chứ không dựa trên IP.',
      en: 'TLS 1.3: the client sends a key_share (X25519) in the ClientHello, the server replies with its key_share in the ServerHello → both compute the same ECDHE secret and derive handshake keys with HKDF after 1 RTT. Everything afterwards (including certificates) is encrypted. The server proves private-key possession with CertificateVerify (a signature over the transcript). mTLS: the server sends CertificateRequest and the client also sends a certificate + CertificateVerify. Zero trust: short-lived (hours) certificates issued automatically by the mesh/SPIRE, identity is a SPIFFE ID in the SAN, policy keys on identity, not IP.'
    },
    math: {
      formula: String.raw`Z = a\cdot(bG) = b\cdot(aG), \qquad k_{hs} = \text{HKDF-Expand-Label}\big(\text{HKDF-Extract}(\text{salt}, Z),\ \text{"c hs traffic"},\ H(\text{transcript})\big)`,
      description: {
        vi: 'Mỗi bên chỉ gửi điểm công khai aG, bG; shared secret Z không bao giờ đi trên dây. Khoá ECDHE là ephemeral cho mỗi kết nối nên lộ private key chứng chỉ về sau không giải mã được traffic cũ (forward secrecy). Khoá phụ thuộc transcript hash nên mọi chỉnh sửa handshake đều bị phát hiện ở Finished.',
        en: 'Each side sends only public points aG, bG; the shared secret Z never crosses the wire. ECDHE keys are ephemeral per connection, so a later leak of the certificate key cannot decrypt past traffic (forward secrecy). Keys depend on the transcript hash, so any handshake tampering is caught at Finished.'
      },
      timeComplexity: '1-RTT full handshake (0-RTT on resumption)',
      spaceComplexity: 'O(1) session keys per connection'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'TLS 1.3 (RFC 8446) loại bỏ RSA key exchange, CBC, RC4, SHA-1, renegotiation; chỉ còn 5 cipher suite AEAD như TLS_AES_128_GCM_SHA256 và TLS_CHACHA20_POLY1305_SHA256.',
      en: 'TLS 1.3 (RFC 8446) removes RSA key exchange, CBC, RC4, SHA-1 and renegotiation; only 5 AEAD cipher suites remain, such as TLS_AES_128_GCM_SHA256 and TLS_CHACHA20_POLY1305_SHA256.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Xác minh chuỗi: leaf → intermediate → root trong trust store; mỗi chữ ký phải hợp lệ, còn hạn, đúng key usage, và hostname (hoặc SPIFFE URI) phải khớp SAN — CN không còn được dùng. Thiếu bước kiểm tra hostname là lỗi kinh điển khi tự cấu hình TrustManager.',
        en: 'Chain validation: leaf → intermediate → root in the trust store; each signature must be valid, unexpired, with the right key usage, and the hostname (or SPIFFE URI) must match the SAN — CN is no longer used. Skipping hostname verification is a classic mistake with custom TrustManagers.'
      },
      {
        vi: '0-RTT (early data) cho phép gửi dữ liệu ngay trong lần kết nối lại, nhưng dữ liệu đó có thể bị replay — chỉ dùng cho request idempotent. Trong service mesh (Istio, Linkerd), sidecar/ztunnel làm mTLS trong suốt; SPIRE/istiod cấp SVID ngắn hạn và xoay trước khi hết hạn (Zero Trust ở SEC-15).',
        en: '0-RTT (early data) sends data immediately on resumption, but it can be replayed — use it only for idempotent requests. In a service mesh (Istio, Linkerd) sidecars/ztunnel do mTLS transparently; SPIRE/istiod issue short-lived SVIDs and rotate them before expiry (Zero Trust in SEC-15).'
      },
      {
        vi: 'HTTPS = HTTP chạy trên TLS. TLS cung cấp ba thứ: bí mật (mã hoá AEAD), toàn vẹn (tag xác thực trên mỗi record) và xác thực server (chứng chỉ). TLS 1.2 cần 2 RTT cho handshake đầy đủ và còn cho phép trao đổi khoá RSA tĩnh (không có forward secrecy) cùng các cipher cũ; TLS 1.3 rút xuống 1 RTT, bắt buộc ECDHE và mã hoá cả chứng chỉ.',
        en: 'HTTPS = HTTP over TLS. TLS provides three things: secrecy (AEAD encryption), integrity (an authentication tag on every record) and server authentication (certificates). TLS 1.2 needs 2 RTTs for a full handshake and still allows static RSA key exchange (no forward secrecy) and legacy ciphers; TLS 1.3 cuts it to 1 RTT, mandates ECDHE and encrypts the certificates too.'
      },
      {
        vi: 'PKI: Certificate Authority (CA) ký chứng chỉ X.509 gắn public key với tên miền sau khi kiểm tra quyền sở hữu (ACME/Let’s Encrypt tự động hoá bước này). Trình duyệt và JVM tin một tập root CA trong trust store; root ký intermediate, intermediate ký leaf. Thu hồi chứng chỉ qua OCSP/CRL không đáng tin cậy trong thực tế, nên xu hướng là chứng chỉ ngắn hạn. HSTS (Strict-Transport-Security) buộc trình duyệt chỉ dùng HTTPS, chống tấn công hạ cấp xuống HTTP.',
        en: 'PKI: a Certificate Authority (CA) signs X.509 certificates binding a public key to a domain after checking ownership (ACME/Let’s Encrypt automates this). Browsers and the JVM trust a set of root CAs in their trust store; roots sign intermediates, intermediates sign leaves. Revocation through OCSP/CRL is unreliable in practice, so the trend is short-lived certificates. HSTS (Strict-Transport-Security) forces browsers to use HTTPS only, defeating downgrade-to-HTTP attacks.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'TrustManager "trust all" để sửa lỗi PKIX trong môi trường dev rồi lọt lên production.',
        en: 'A “trust-all” TrustManager to fix PKIX errors in dev that ships to production.'
      },
      {
        vi: 'mTLS chỉ xác thực mà không phân quyền: mọi workload có cert hợp lệ đều gọi được mọi service.',
        en: 'mTLS authentication without authorization: any workload with a valid cert can call any service.'
      },
      {
        vi: 'Chứng chỉ hết hạn ngày Chủ nhật — không có tự động xoay vòng và cảnh báo.',
        en: 'A certificate expiring on a Sunday — no automatic rotation or alerting.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'TLS 1.3 full handshake với mTLS', en: 'TLS 1.3 full handshake with mTLS' },
    description: {
      vi: 'Ngoặc {} là thông điệp đã mã hoá bằng khoá handshake.',
      en: 'Braces {} denote messages encrypted under handshake keys.'
    },
    asciiDiagram: `
 Client (orders, spiffe://corp/ns/shop/sa/orders)        Server (payments)
  ClientHello  + key_share(X25519 aG) + supported_versions(1.3)
               + signature_algorithms + server_name ───────────────▶
                                       ◀─────────────── ServerHello + key_share(bG)
                        ── both: Z = ECDHE, HKDF → handshake keys ──
                                       ◀─────────────── {EncryptedExtensions}
                                       ◀─────────────── {CertificateRequest}        (mTLS)
                                       ◀─────────────── {Certificate: payments SVID}
                                       ◀─────────────── {CertificateVerify: sig(transcript)}
                                       ◀─────────────── {Finished: HMAC(transcript)}
  verify chain + SAN = spiffe://corp/ns/shop/sa/payments
  {Certificate: orders SVID} {CertificateVerify} {Finished} ─────────▶  verify client SVID
  [Application Data  AES-128-GCM]  ◀══════════════════════════════════▶  authz: orders → POST /charge ✓
`,
    components: [
      {
        name: 'key_share',
        role: 'ECDHE public',
        description: {
          vi: 'Điểm công khai ephemeral, gửi ngay ở ClientHello.',
          en: 'An ephemeral public point, sent right in the ClientHello.'
        }
      },
      {
        name: 'CertificateVerify',
        role: 'Proof of key',
        description: {
          vi: 'Chữ ký trên transcript chứng minh sở hữu private key.',
          en: 'A signature over the transcript proving key possession.'
        }
      },
      {
        name: 'SPIFFE SVID',
        role: 'Workload identity',
        description: {
          vi: 'X.509 ngắn hạn với URI SAN spiffe://…',
          en: 'A short-lived X.509 with a spiffe://… URI SAN.'
        }
      },
      {
        name: 'AuthorizationPolicy',
        role: 'Identity-based authz',
        description: {
          vi: 'Cho phép theo principal, không theo IP.',
          en: 'Allows by principal, not by IP.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'client-hello',
      title: { vi: 'ClientHello kèm key_share', en: 'ClientHello with key_share' },
      phase: 'Hello',
      description: {
        vi: 'Client đoán nhóm X25519 và gửi luôn điểm công khai aG, cùng SNI và cipher suite.',
        en: 'The client guesses X25519 and sends its public point aG, with SNI and cipher suites.'
      },
      systemBehavior: {
        vi: 'Không cần round-trip riêng để thoả thuận khoá như TLS 1.2.',
        en: 'No separate key-agreement round-trip as in TLS 1.2.'
      },
      codeLineMatch: 'TLSv1.3'
    },
    {
      id: 'server-flight',
      title: {
        vi: 'ServerHello, khoá handshake & chứng chỉ',
        en: 'ServerHello, handshake keys & certificate'
      },
      phase: 'Key schedule',
      description: {
        vi: 'Server trả bG; hai bên tính Z và HKDF. Certificate, CertificateVerify, Finished đều đã mã hoá.',
        en: 'The server returns bG; both compute Z and run HKDF. Certificate, CertificateVerify and Finished are already encrypted.'
      },
      systemBehavior: {
        vi: 'Server gửi CertificateRequest để yêu cầu client cert (mTLS).',
        en: 'The server sends CertificateRequest to demand a client cert (mTLS).'
      },
      codeLineMatch: 'client-auth: need'
    },
    {
      id: 'mutual-verify',
      title: { vi: 'Hai chiều xác minh chứng chỉ', en: 'Both sides verify certificates' },
      phase: 'mTLS',
      description: {
        vi: 'Client kiểm chuỗi + SAN của server, rồi gửi chứng chỉ + CertificateVerify của chính nó.',
        en: 'The client checks the server chain + SAN, then sends its own certificate + CertificateVerify.'
      },
      systemBehavior: {
        vi: 'Server xác minh SVID của client theo trust bundle SPIFFE.',
        en: 'The server verifies the client SVID against the SPIFFE trust bundle.'
      },
      codeLineMatch: 'truststore:'
    },
    {
      id: 'authz',
      title: {
        vi: 'Dữ liệu mã hoá & phân quyền theo danh tính',
        en: 'Encrypted data & identity-based authorization'
      },
      phase: 'Zero trust',
      description: {
        vi: 'Traffic AES-GCM; policy chỉ cho principal orders gọi POST /charge.',
        en: 'AES-GCM traffic; policy lets only the orders principal call POST /charge.'
      },
      systemBehavior: {
        vi: 'Danh tính đến từ chứng chỉ đã xác minh, không từ IP nguồn.',
        en: 'Identity comes from the verified certificate, not the source IP.'
      },
      codeLineMatch: 'principals:'
    }
  ],

  comparison: {
    title: { vi: 'TLS 1.2 vs TLS 1.3', en: 'TLS 1.2 vs TLS 1.3' },
    subtitle: {
      vi: 'Ít round-trip hơn, ít lựa chọn nguy hiểm hơn',
      en: 'Fewer round-trips, fewer dangerous options'
    },
    options: [
      {
        name: 'TLS 1.2',
        tag: '2-RTT',
        role: { vi: 'Thoả thuận rồi mới trao khoá', en: 'Negotiate first, then exchange keys' },
        keyMechanism: {
          vi: 'Cho phép RSA key exchange (không forward secrecy), CBC, chứng chỉ gửi rõ.',
          en: 'Allows RSA key exchange (no forward secrecy), CBC, certificates in clear.'
        },
        configExample: 'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
        architectureNote: {
          vi: 'Chỉ giữ cho client cũ, với cipher ECDHE + AEAD.',
          en: 'Keep only for legacy clients, ECDHE + AEAD suites.'
        }
      },
      {
        name: 'TLS 1.3',
        tag: '1-RTT',
        role: { vi: 'key_share ngay ở hello', en: 'key_share right in the hello' },
        keyMechanism: {
          vi: 'Bắt buộc forward secrecy, mã hoá chứng chỉ, 5 cipher AEAD, 0-RTT tuỳ chọn.',
          en: 'Mandatory forward secrecy, encrypted certificates, 5 AEAD suites, optional 0-RTT.'
        },
        configExample: 'TLS_AES_128_GCM_SHA256 / TLS_CHACHA20_POLY1305_SHA256',
        architectureNote: {
          vi: 'Mặc định cho mọi hệ thống mới.',
          en: 'The default for every new system.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Mã hoá + xác thực hai chiều cho mọi kết nối nội bộ.',
        en: 'Encryption + mutual authentication for every internal connection.'
      },
      {
        vi: 'Danh tính mật mã thay cho IP — sống sót qua autoscaling, NAT.',
        en: 'Cryptographic identity instead of IPs — survives autoscaling and NAT.'
      }
    ],
    cons: [
      {
        vi: 'Hạ tầng PKI/mesh phức tạp; lỗi cert có thể làm sập toàn bộ.',
        en: 'PKI/mesh infrastructure is complex; cert failures can take everything down.'
      },
      {
        vi: 'Thêm độ trễ handshake và CPU (giảm nhờ connection pooling, resumption).',
        en: 'Handshake latency and CPU overhead (mitigated by pooling, resumption).'
      }
    ],
    balance: {
      vi: 'Chứng chỉ càng ngắn hạn càng an toàn nhưng hệ thống cấp phát càng phải tin cậy cao.',
      en: 'The shorter-lived the certificates, the safer — and the more reliable issuance must be.'
    },
    invariant: {
      vi: 'Không bên nào gửi dữ liệu ứng dụng trước khi xác minh được Finished của bên kia.',
      en: 'Neither side sends application data before verifying the other side’s Finished.'
    }
  },

  code: [
    {
      label: 'application.yml (Spring)',
      filename: 'application.yml',
      language: 'yaml',
      code: `server:
  port: 8443
  ssl:
    enabled: true
    enabled-protocols: TLSv1.3
    bundle: payments-server
    client-auth: need                # send CertificateRequest -> mTLS
spring:
  ssl:
    bundle:
      pem:
        payments-server:
          keystore:
            certificate: file:/var/run/svid/svid.pem      # rotated by SPIRE agent
            private-key: file:/var/run/svid/svid_key.pem
          truststore:
            certificate: file:/var/run/svid/bundle.pem    # SPIFFE trust bundle
          reload-on-update: true
# Authorization is identity-based, enforced by the mesh (see istio-mtls.yaml):
#   principals: ["cluster.local/ns/shop/sa/orders"] may POST /charge`
    },
    {
      label: 'istio-mtls.yaml',
      filename: 'istio-mtls.yaml',
      language: 'yaml',
      code: `apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata: { name: default, namespace: shop }
spec:
  mtls: { mode: STRICT }             # plaintext rejected
---
apiVersion: security.istio.io/v1
kind: AuthorizationPolicy
metadata: { name: payments-charge, namespace: shop }
spec:
  selector: { matchLabels: { app: payments } }
  action: ALLOW
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/shop/sa/orders"]
      to:
        - operation: { methods: ["POST"], paths: ["/charge"] }`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Forward secrecy là gì và TLS 1.3 đảm bảo nó thế nào?',
        en: 'What is forward secrecy and how does TLS 1.3 guarantee it?'
      },
      answer: {
        vi: 'Lộ private key dài hạn của server về sau không giải mã được traffic đã ghi lại. TLS 1.3 chỉ cho phép (EC)DHE ephemeral: khoá phiên dẫn xuất từ bí mật ECDHE dùng một lần rồi huỷ; private key chứng chỉ chỉ dùng để KÝ (CertificateVerify), không dùng để trao đổi khoá như RSA key exchange của TLS 1.2.',
        en: 'A later leak of the server’s long-term private key cannot decrypt recorded traffic. TLS 1.3 allows only ephemeral (EC)DHE: session keys derive from a one-time ECDHE secret that is discarded; the certificate key only SIGNS (CertificateVerify), never encrypts key material as TLS 1.2 RSA key exchange did.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'mTLS đã bật STRICT, vậy còn cần JWT giữa các service không?',
        en: 'With STRICT mTLS enabled, do services still need JWTs?'
      },
      answer: {
        vi: 'Có, chúng trả lời hai câu hỏi khác nhau: mTLS chứng minh WORKLOAD nào đang gọi (orders service); JWT mang ngữ cảnh END-USER và quyền của họ (user 42, scope orders:write). Kết hợp cả hai: policy theo principal workload + kiểm tra token user ở service đích (hoặc token exchange, SEC-15).',
        en: 'Yes, they answer different questions: mTLS proves which WORKLOAD is calling (the orders service); the JWT carries END-USER context and permissions (user 42, scope orders:write). Combine both: workload-principal policies + user-token checks at the target (or token exchange, SEC-15).'
      },
      proTip: {
        vi: 'Nêu thuật ngữ "confused deputy" — service hợp lệ bị lợi dụng gọi thay user không có quyền.',
        en: 'Mention the “confused deputy” — a legitimate service abused to act for an unauthorised user.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.rfc8446,
    SECURITY_CITATIONS.rfc5280,
    SECURITY_CITATIONS.spiffe
  ]
};
