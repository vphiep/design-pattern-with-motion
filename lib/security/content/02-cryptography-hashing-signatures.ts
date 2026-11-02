import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const cryptographyHashingSignaturesTopic: SecurityTopic = {
  id: 'cryptography-hashing-signatures',
  roadmapId: 'SEC-02',
  category: 'sec-fundamentals',
  level: 'beginner',
  levelTo: 'intermediate',
  chapter: 'Cấp độ 1',
  name: 'Cryptography: Encryption, Hashing & Digital Signatures',
  tagline: {
    vi: 'AES-GCM cho bí mật + toàn vẹn, RSA/ECC cho trao đổi khoá và chữ ký, SHA-256 và HMAC, chữ ký số Ed25519, salt/pepper cho mật khẩu, và quản lý khoá bằng KMS theo envelope encryption.',
    en: 'AES-GCM for secrecy + integrity, RSA/ECC for key exchange and signatures, SHA-256 and HMAC, Ed25519 digital signatures, salt/pepper for passwords, and KMS key management with envelope encryption.'
  },
  difficulty: 1,
  order: 2,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Dev cần "bảo mật dữ liệu" nhưng chọn sai công cụ: Base64 để "mã hoá" token, MD5 để lưu mật khẩu, AES-ECB cho số thẻ, so sánh chữ ký webhook bằng equals(), và hard-code khoá AES trong application.yml. Mỗi lựa chọn trông như mật mã học nhưng không bảo vệ được gì.',
      en: 'Developers need to "secure data" but pick the wrong tool: Base64 to "encrypt" tokens, MD5 to store passwords, AES-ECB for card numbers, comparing webhook signatures with equals(), and an AES key hard-coded in application.yml. Each choice looks like cryptography yet protects nothing.'
    },
    hardwareConstraint: {
      vi: 'Kẻ tấn công có GPU và cloud để thử khoá, nhưng không gian khoá 2^128 vẫn ngoài tầm. Điểm yếu thực tế vì vậy hiếm khi là thuật toán mà là cách dùng: nonce lặp lại, khoá bị lộ, so sánh không constant-time, chế độ không xác thực.',
      en: 'Attackers have GPUs and clouds to try keys, yet a 2^128 key space stays out of reach. The practical weakness is therefore rarely the algorithm but its use: reused nonces, leaked keys, non-constant-time comparisons, unauthenticated modes.'
    },
    fundamentalSolution: {
      vi: 'Chọn primitive theo mục tiêu. Bí mật + toàn vẹn dữ liệu: mã hoá đối xứng có xác thực (AES-GCM, khoá ≥128 bit, nonce không bao giờ lặp với cùng khoá). Trao đổi khoá với người lạ: mật mã bất đối xứng (ECDHE trong TLS, RSA-OAEP ≥2048). Kiểm tra toàn vẹn công khai: hash (SHA-256). Xác thực thông điệp giữa hai bên chung bí mật: HMAC. Chứng minh ai đã ký mà ai cũng kiểm tra được: chữ ký số (Ed25519, ECDSA, RSA-PSS). Mật khẩu: hàm băm chậm có salt (SEC-06). Khoá nằm trong KMS/HSM, dữ liệu được mã hoá bằng data key bọc bởi key-encryption key.',
      en: 'Pick the primitive by goal. Data secrecy + integrity: authenticated symmetric encryption (AES-GCM, ≥128-bit keys, a nonce never reused with the same key). Key exchange with strangers: asymmetric cryptography (ECDHE in TLS, RSA-OAEP ≥2048). Public integrity checks: a hash (SHA-256). Authenticating messages between parties sharing a secret: HMAC. Proving who signed, verifiable by anyone: digital signatures (Ed25519, ECDSA, RSA-PSS). Passwords: a slow salted hash (SEC-06). Keys live in a KMS/HSM, and data is encrypted with a data key wrapped by a key-encryption key.'
    },
    math: {
      formula: String.raw`T_{\text{brute}} = \frac{2^{k-1}}{R}, \qquad P_{\text{nonce collision}} \approx \frac{q^2}{2^{97}} \;\; (q \text{ random 96-bit nonces})`,
      description: {
        vi: 'Với khoá k = 128 bit, trung bình phải thử 2^127 khoá — ngoài tầm mọi phần cứng. Rủi ro thật nằm ở nonce: GCM dùng nonce ngẫu nhiên 96 bit, sau q thông điệp xác suất trùng ≈ q²/2^97; vì vậy NIST SP 800-38D giới hạn 2^32 lần mã hoá với IV ngẫu nhiên cho mỗi khoá. Trùng nonce với cùng khoá làm lộ XOR của hai plaintext và cho phép giả mạo tag.',
        en: 'With a k = 128-bit key, an attacker must try 2^127 keys on average — beyond any hardware. The real risk is the nonce: GCM uses random 96-bit nonces, and after q messages the collision probability is ≈ q²/2^97; that is why NIST SP 800-38D caps random-IV encryptions at 2^32 per key. A repeated nonce under the same key leaks the XOR of two plaintexts and enables tag forgery.'
      },
      timeComplexity: 'AES-GCM, SHA-256, HMAC: O(n) in message size; signatures: O(1) per message',
      spaceComplexity: 'Keys: 16–32 bytes symmetric, 32-byte Ed25519 public keys'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Bốn thao tác cần phân biệt: encrypt/decrypt (đảo ngược được với khoá), hash (một chiều, ai cũng tính được), MAC (một chiều, cần bí mật chung), sign/verify (khoá riêng ký, khoá công khai kiểm tra).',
      en: 'Four operations to tell apart: encrypt/decrypt (reversible with a key), hash (one-way, anyone can compute), MAC (one-way, needs a shared secret), sign/verify (private key signs, public key verifies).'
    },
    deepDiveParagraphs: [
      {
        vi: 'Mã hoá đối xứng: AES với khoá 128 hoặc 256 bit ở chế độ có xác thực (GCM, CCM) cho cả bí mật lẫn toàn vẹn — giải mã thất bại nếu ciphertext hoặc AAD bị sửa. ECB để lộ cấu trúc dữ liệu (khối giống nhau cho ciphertext giống nhau); CBC/CTR không xác thực nên phải kèm MAC (encrypt-then-MAC). Encoding như Base64 hay hex không phải mã hoá: ai cũng giải được.',
        en: 'Symmetric encryption: AES with 128- or 256-bit keys in an authenticated mode (GCM, CCM) provides both secrecy and integrity — decryption fails if the ciphertext or AAD was modified. ECB leaks data structure (equal blocks give equal ciphertext); CBC/CTR are unauthenticated and need a MAC (encrypt-then-MAC). Encodings such as Base64 or hex are not encryption: anyone can decode them.'
      },
      {
        vi: 'Mật mã bất đối xứng: mỗi bên có cặp khoá công khai/bí mật. Dùng để trao đổi khoá (ECDH/X25519 — TLS 1.3 chỉ dùng trao đổi khoá ephemeral), mã hoá khoá nhỏ (RSA-OAEP ≥2048 bit; với dữ liệu thì dùng HPKE) và chữ ký số. Chậm hơn đối xứng nhiều bậc, nên thực tế luôn là hybrid: bất đối xứng để thống nhất khoá, đối xứng để mã hoá dữ liệu.',
        en: 'Asymmetric cryptography: each party has a public/private key pair. It is used for key exchange (ECDH/X25519 — TLS 1.3 uses only ephemeral key exchange), wrapping small keys (RSA-OAEP ≥2048-bit; for data use HPKE) and digital signatures. It is orders of magnitude slower than symmetric crypto, so real systems are hybrid: asymmetric to agree on a key, symmetric to encrypt the data.'
      },
      {
        vi: 'Hash, HMAC và chữ ký: SHA-256/SHA-3 cho checksum và định danh nội dung (digest của Docker image). HMAC-SHA256 xác thực webhook giữa hai bên chung secret — phải so sánh bằng hàm constant-time (MessageDigest.isEqual) để không rò thời gian. Chữ ký số cho non-repudiation: chỉ người giữ khoá riêng ký được, ai có khoá công khai cũng kiểm tra được (JWT RS256/ES256, ký image bằng cosign, chứng chỉ X.509).',
        en: 'Hashes, HMACs and signatures: SHA-256/SHA-3 for checksums and content identity (a Docker image digest). HMAC-SHA256 authenticates webhooks between parties sharing a secret — compare with a constant-time function (MessageDigest.isEqual) to avoid timing leaks. Digital signatures give non-repudiation: only the private-key holder can sign, anyone with the public key can verify (JWT RS256/ES256, cosign image signatures, X.509 certificates).'
      },
      {
        vi: 'Mật khẩu và khoá: hash nhanh như SHA-256 không phù hợp cho mật khẩu; dùng Argon2id/bcrypt có salt riêng mỗi mật khẩu, tuỳ chọn thêm pepper lưu ngoài DB (SEC-06). Khoá không nằm trong code, Git hay biến môi trường: dùng KMS/HSM với envelope encryption — KMS sinh data key (DEK) để mã hoá dữ liệu, chỉ lưu DEK đã được bọc bởi KEK; xoay KEK định kỳ hoặc khi nghi bị lộ.',
        en: 'Passwords and keys: fast hashes such as SHA-256 do not suit passwords; use Argon2id/bcrypt with a per-password salt and optionally a pepper kept outside the DB (SEC-06). Keys never live in code, Git or environment variables: use a KMS/HSM with envelope encryption — the KMS generates a data key (DEK) that encrypts the data, and only the DEK wrapped by the KEK is stored; rotate the KEK on a schedule or on suspected compromise.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng lại cùng IV/nonce với cùng khoá GCM (ví dụ IV cố định trong config): mất cả bí mật lẫn toàn vẹn.',
        en: 'Reusing the same GCM IV/nonce with the same key (e.g. a fixed IV in config): both secrecy and integrity are lost.'
      },
      {
        vi: 'So sánh HMAC/chữ ký bằng Arrays.equals hoặc String.equals: thời gian phản hồi rò rỉ vị trí byte sai đầu tiên.',
        en: 'Comparing HMACs/signatures with Arrays.equals or String.equals: response time leaks the first wrong byte’s position.'
      },
      {
        vi: 'Tự thiết kế thuật toán hoặc giao thức "cho an toàn hơn" thay vì dùng thư viện đã kiểm chứng (JCA, Tink, libsodium).',
        en: 'Rolling your own algorithm or protocol "for extra safety" instead of vetted libraries (JCA, Tink, libsodium).'
      },
      {
        vi: 'Mã hoá DB bằng khoá nằm ngay cạnh DB: lộ backup là lộ luôn khoá.',
        en: 'Encrypting the DB with a key stored right next to it: a leaked backup leaks the key too.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Bốn primitive, bốn mục tiêu', en: 'Four primitives, four goals' },
    description: {
      vi: 'Chọn primitive theo câu hỏi bảo mật cần trả lời, và giữ khoá trong KMS.',
      en: 'Pick the primitive by the security question it answers, and keep keys in a KMS.'
    },
    asciiDiagram: `
 ENCRYPT   plaintext ──AES-256-GCM(K, nonce, AAD)──► ciphertext ‖ tag ──decrypt(K)──► plaintext
           goal: confidentiality + integrity        (tampering → decrypt fails)
 HASH      file ──SHA-256──► 9f86d0…                 anyone recomputes; detects accidental change
 MAC       body ──HMAC-SHA256(secret)──► tag         only secret holders create/verify
 SIGN      doc ──Ed25519.sign(private)──► sig ──verify(public)──► ✓ / ✗   non-repudiation
 KEYS      KMS: KEK (never leaves) ──wraps──► DEK ──encrypts──► data   store: enc(DEK) ‖ ciphertext
`,
    components: [
      {
        name: 'AES-GCM',
        role: 'Symmetric AEAD',
        description: {
          vi: 'Mã hoá có xác thực; nonce 96 bit không lặp với cùng khoá.',
          en: 'Authenticated encryption; a 96-bit nonce never repeated per key.'
        }
      },
      {
        name: 'SHA-256 / HMAC',
        role: 'Integrity',
        description: {
          vi: 'Hash công khai; HMAC cần bí mật chung.',
          en: 'A public hash; HMAC needs a shared secret.'
        }
      },
      {
        name: 'Ed25519 / ECDSA / RSA-PSS',
        role: 'Signatures',
        description: {
          vi: 'Khoá riêng ký, khoá công khai kiểm tra.',
          en: 'Private key signs, public key verifies.'
        }
      },
      {
        name: 'KMS / HSM',
        role: 'Key management',
        description: {
          vi: 'Sinh, bọc, xoay và kiểm soát truy cập khoá; ghi audit.',
          en: 'Generates, wraps, rotates and access-controls keys; audits use.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'encrypt',
      title: { vi: 'AES-GCM: mã hoá có xác thực', en: 'AES-GCM: authenticated encryption' },
      phase: 'Confidentiality',
      description: {
        vi: 'Khoá 256 bit, nonce ngẫu nhiên 96 bit, AAD gắn ngữ cảnh; kết quả gồm ciphertext và tag 128 bit.',
        en: 'A 256-bit key, a random 96-bit nonce, AAD binding the context; the output is ciphertext plus a 128-bit tag.'
      },
      systemBehavior: {
        vi: 'Sửa một bit ciphertext hoặc AAD làm giải mã ném AEADBadTagException.',
        en: 'Flipping one ciphertext or AAD bit makes decryption throw AEADBadTagException.'
      },
      codeLineMatch: 'Cipher.getInstance("AES/GCM/NoPadding")'
    },
    {
      id: 'hash-mac',
      title: { vi: 'Hash vs HMAC', en: 'Hash vs HMAC' },
      phase: 'Integrity',
      description: {
        vi: 'SHA-256 ai cũng tính lại được; HMAC chỉ người có secret tạo được — dùng cho webhook.',
        en: 'Anyone can recompute SHA-256; only secret holders can create an HMAC — used for webhooks.'
      },
      systemBehavior: {
        vi: 'So sánh tag bằng MessageDigest.isEqual (constant-time).',
        en: 'Tags are compared with MessageDigest.isEqual (constant time).'
      },
      codeLineMatch: 'Mac.getInstance("HmacSHA256")'
    },
    {
      id: 'sign',
      title: { vi: 'Ký & kiểm tra chữ ký', en: 'Sign & verify' },
      phase: 'Authenticity',
      description: {
        vi: 'Khoá riêng Ed25519 ký tài liệu; bất kỳ ai có khoá công khai đều kiểm tra được.',
        en: 'The Ed25519 private key signs the document; anyone with the public key can verify.'
      },
      systemBehavior: {
        vi: 'Đổi một byte tài liệu làm verify trả false.',
        en: 'Changing one document byte makes verify return false.'
      },
      codeLineMatch: 'Signature.getInstance("Ed25519")'
    },
    {
      id: 'envelope',
      title: { vi: 'Envelope encryption với KMS', en: 'Envelope encryption with a KMS' },
      phase: 'Key management',
      description: {
        vi: 'KMS sinh data key; bản rõ dùng để mã hoá rồi xoá, bản đã bọc được lưu cạnh dữ liệu.',
        en: 'The KMS generates a data key; the plaintext copy encrypts then is wiped, the wrapped copy is stored with the data.'
      },
      systemBehavior: {
        vi: 'KEK không bao giờ rời KMS; mọi lần giải bọc đều có audit log.',
        en: 'The KEK never leaves the KMS; every unwrap is audit-logged.'
      },
      codeLineMatch: 'kms.generateDataKey'
    }
  ],

  comparison: {
    title: { vi: 'Encrypt vs Hash vs MAC vs Signature', en: 'Encrypt vs Hash vs MAC vs Signature' },
    subtitle: {
      vi: 'Mỗi primitive trả lời một câu hỏi khác nhau',
      en: 'Each primitive answers a different question'
    },
    options: [
      {
        name: 'Encryption (AES-GCM)',
        tag: 'Reversible',
        role: { vi: 'Ai được đọc?', en: 'Who may read it?' },
        keyMechanism: {
          vi: 'Cùng khoá để mã hoá và giải mã; AEAD kèm toàn vẹn.',
          en: 'The same key encrypts and decrypts; AEAD adds integrity.'
        },
        configExample: 'AES/GCM/NoPadding, 256-bit key, 96-bit nonce',
        architectureNote: {
          vi: 'Dữ liệu lưu trữ và truyền tải.',
          en: 'Data at rest and in transit.'
        }
      },
      {
        name: 'Hash (SHA-256)',
        tag: 'One-way, public',
        role: { vi: 'Có thay đổi không?', en: 'Did it change?' },
        keyMechanism: {
          vi: 'Không có khoá; ai cũng tính được — không chống được kẻ cố ý sửa cả dữ liệu lẫn hash.',
          en: 'No key; anyone computes it — cannot stop an attacker who changes both data and hash.'
        },
        configExample: 'sha256sum app.jar',
        architectureNote: {
          vi: 'Checksum, content addressing; không dùng cho mật khẩu.',
          en: 'Checksums, content addressing; not for passwords.'
        }
      },
      {
        name: 'MAC (HMAC-SHA256)',
        tag: 'Shared secret',
        role: { vi: 'Có phải từ bên có secret?', en: 'Is it from a secret holder?' },
        keyMechanism: {
          vi: 'Hai bên cùng secret; không phân biệt được bên nào đã tạo.',
          en: 'Both sides share the secret; cannot tell which side produced it.'
        },
        configExample: 'X-Signature: sha256=<hex HMAC of body>',
        architectureNote: {
          vi: 'Webhook, cookie ký, HS256 nội bộ.',
          en: 'Webhooks, signed cookies, internal HS256.'
        }
      },
      {
        name: 'Signature (Ed25519)',
        tag: 'Public verify',
        role: { vi: 'Ai đã ký, chứng minh được?', en: 'Who signed, provably?' },
        keyMechanism: {
          vi: 'Khoá riêng ký, khoá công khai kiểm tra; non-repudiation.',
          en: 'Private key signs, public key verifies; non-repudiation.'
        },
        configExample: 'JWT ES256 · cosign · X.509',
        architectureNote: {
          vi: 'Token phát hành cho nhiều bên kiểm tra, chứng chỉ, artifact.',
          en: 'Tokens verified by many parties, certificates, artifacts.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Primitive chuẩn với tham số đúng cho độ an toàn đã được chứng minh.',
        en: 'Standard primitives with correct parameters give proven security.'
      },
      {
        vi: 'Envelope encryption giúp xoay khoá mà không phải mã hoá lại toàn bộ dữ liệu ngay.',
        en: 'Envelope encryption allows key rotation without immediately re-encrypting all data.'
      }
    ],
    cons: [
      {
        vi: 'Mất khoá là mất dữ liệu: Availability phụ thuộc vào quản lý khoá.',
        en: 'Lose the key, lose the data: Availability depends on key management.'
      },
      {
        vi: 'RSA và ECC không an toàn trước máy tính lượng tử; cần lộ trình sang ML-KEM/hybrid.',
        en: 'RSA and ECC are not quantum-safe; a roadmap to ML-KEM/hybrid schemes is needed.'
      }
    ],
    balance: {
      vi: 'Dùng thư viện cấp cao (Tink, libsodium, JCA với cấu hình chuẩn) để giảm số quyết định dễ sai, đổi lại ít linh hoạt hơn.',
      en: 'Use high-level libraries (Tink, libsodium, JCA with standard settings) to reduce error-prone decisions, at the cost of flexibility.'
    },
    invariant: {
      vi: 'Bảo mật nằm ở khoá, không nằm ở việc giữ bí mật thuật toán (nguyên lý Kerckhoffs).',
      en: 'Security rests in the key, never in keeping the algorithm secret (Kerckhoffs’s principle).'
    }
  },

  code: [
    {
      label: 'CryptoBasics.java',
      filename: 'CryptoBasics.java',
      language: 'java',
      code: `SecureRandom rng = new SecureRandom();

// 1) Symmetric AEAD: AES-256-GCM = confidentiality + integrity
KeyGenerator kg = KeyGenerator.getInstance("AES");
kg.init(256);
SecretKey key = kg.generateKey();
byte[] nonce = new byte[12];
rng.nextBytes(nonce);                                  // 96-bit, never reused with this key
Cipher enc = Cipher.getInstance("AES/GCM/NoPadding");
enc.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, nonce));
enc.updateAAD("order:42".getBytes(UTF_8));             // authenticated, not encrypted
byte[] ciphertext = enc.doFinal(plaintext);            // ciphertext || 128-bit tag

// 2) Hash vs MAC
byte[] digest = MessageDigest.getInstance("SHA-256").digest(fileBytes);  // anyone can recompute
Mac mac = Mac.getInstance("HmacSHA256");
mac.init(new SecretKeySpec(webhookSecret, "HmacSHA256"));
byte[] expected = mac.doFinal(body);
boolean authentic = MessageDigest.isEqual(expected, receivedTag);  // constant-time compare

// 3) Digital signature: private key signs, public key verifies
KeyPair kp = KeyPairGenerator.getInstance("Ed25519").generateKeyPair();
Signature sig = Signature.getInstance("Ed25519");
sig.initSign(kp.getPrivate());
sig.update(document);
byte[] signature = sig.sign();
sig.initVerify(kp.getPublic());
sig.update(document);
boolean valid = sig.verify(signature);

// 4) Key management: envelope encryption, no keys in code or env vars
GenerateDataKeyResponse dk = kms.generateDataKey(r -> r.keyId("alias/orders").keySpec(DataKeySpec.AES_256));
// encrypt with dk.plaintext(), then wipe it; persist dk.ciphertextBlob() next to the ciphertext`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Base64, hash và mã hoá khác nhau thế nào?',
        en: 'How do Base64, hashing and encryption differ?'
      },
      answer: {
        vi: 'Base64 là encoding: đổi biểu diễn, không có khoá, ai cũng giải được. Hash là hàm một chiều: không đảo ngược, cùng input cho cùng output, dùng kiểm tra toàn vẹn. Mã hoá đảo ngược được nhưng chỉ với khoá đúng, dùng để giữ bí mật.',
        en: 'Base64 is an encoding: it changes representation, has no key and anyone can decode it. A hash is one-way: irreversible, the same input gives the same output, used for integrity checks. Encryption is reversible but only with the right key, used for secrecy.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Khi nào dùng HMAC, khi nào dùng chữ ký số?',
        en: 'When do you use an HMAC and when a digital signature?'
      },
      answer: {
        vi: 'HMAC khi chỉ hai bên tin nhau cùng giữ một secret (webhook giữa bạn và Stripe): nhanh, nhưng ai giữ secret cũng tạo được tag nên không có non-repudiation. Chữ ký số khi nhiều bên cần kiểm tra mà không được phép tạo (JWT do IdP ký và hàng chục API kiểm tra, ký artifact): chỉ khoá riêng ký được.',
        en: 'An HMAC when only two mutually trusting parties share a secret (webhooks between you and Stripe): fast, but anyone holding the secret can create tags, so there is no non-repudiation. A signature when many parties must verify without being able to create (JWTs signed by an IdP and checked by dozens of APIs, artifact signing): only the private key can sign.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao trùng nonce trong AES-GCM nghiêm trọng, và bạn tránh nó thế nào ở hệ thống phân tán?',
        en: 'Why is a repeated AES-GCM nonce serious, and how do you avoid it in a distributed system?'
      },
      answer: {
        vi: 'Trùng (khoá, nonce) làm keystream lặp lại, lộ XOR của hai plaintext, và lộ khoá xác thực GHASH, cho phép giả mạo tag. Tránh bằng nonce ngẫu nhiên 96 bit và giới hạn số thông điệp mỗi khoá (≈2^32), xoay khoá thường xuyên qua envelope encryption (mỗi bản ghi một DEK), hoặc dùng AES-GCM-SIV chịu được trùng nonce.',
        en: 'Repeating (key, nonce) repeats the keystream, leaks the XOR of the two plaintexts and exposes the GHASH authentication key, enabling tag forgery. Avoid it with random 96-bit nonces and a per-key message limit (≈2^32), frequent rotation through envelope encryption (a DEK per record), or AES-GCM-SIV, which tolerates nonce reuse.'
      }
    }
  ],

  researchCitations: [SECURITY_CITATIONS.owaspCryptoStorage, SECURITY_CITATIONS.owaspPasswords]
};
