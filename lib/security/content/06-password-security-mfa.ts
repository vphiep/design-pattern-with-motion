import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const passwordSecurityMfaTopic: SecurityTopic = {
  id: 'password-security-mfa',
  roadmapId: 'SEC-06',
  category: 'sec-authn-authz',
  level: 'intermediate',
  chapter: 'Cấp độ 2',
  name: 'Password Security & Multi-Factor Authentication',
  tagline: {
    vi: 'Lưu mật khẩu bằng Argon2id, chính sách theo NIST 800-63B-4 (dài, không quy tắc thành phần, kiểm tra blocklist), chống brute force / credential stuffing / password spraying, TOTP theo RFC 6238, passkey (WebAuthn) chống phishing và recovery code.',
    en: 'Storing passwords with Argon2id, NIST 800-63B-4 policy (long, no composition rules, blocklist checks), defending against brute force / credential stuffing / password spraying, RFC 6238 TOTP, phishing-resistant passkeys (WebAuthn) and recovery codes.'
  },
  difficulty: 2,
  order: 6,
  estimatedMinutes: 18,

  coreTheory: {
    problemStatement: {
      vi: 'Mật khẩu là credential phổ biến nhất và yếu nhất: người dùng tái sử dụng mật khẩu giữa các site, hàng tỷ cặp email/mật khẩu đã bị lộ được dùng để credential stuffing, và trang đăng nhập giả lấy được cả mật khẩu lẫn mã OTP. Khi DB bị lộ, hash yếu biến mọi mật khẩu thành plaintext chỉ sau vài giờ.',
      en: 'Passwords are the most common and the weakest credential: users reuse them across sites, billions of leaked email/password pairs fuel credential stuffing, and fake login pages capture both the password and the OTP. When the DB leaks, a weak hash turns every password into plaintext within hours.'
    },
    hardwareConstraint: {
      vi: 'GPU tính hàng chục tỷ SHA-256 mỗi giây nên hash nhanh không bảo vệ được mật khẩu yếu; ngược lại hash chậm tốn CPU và RAM server cho mỗi lần đăng nhập. Con người chỉ nhớ được ít bí mật, và không phân biệt được domain giả trông giống thật.',
      en: 'GPUs compute tens of billions of SHA-256 hashes per second, so fast hashes cannot protect weak passwords; slow hashes in turn cost server CPU and RAM per login. Humans remember few secrets and cannot tell a look-alike domain from the real one.'
    },
    fundamentalSolution: {
      vi: 'Phòng thủ nhiều lớp. Lưu trữ: Argon2id (m=19 MiB, t=2, p=1) hoặc bcrypt cost ≥10, salt riêng mỗi mật khẩu, tuỳ chọn pepper trong vault. Chính sách (NIST 800-63B-4): tối thiểu 15 ký tự nếu chỉ dùng mật khẩu (8 nếu trong MFA), cho phép ít nhất 64 ký tự, không áp quy tắc thành phần, không bắt đổi định kỳ, so với blocklist mật khẩu đã lộ. Đăng nhập: rate limiting theo account và theo IP. Thêm yếu tố thứ hai: TOTP tốt hơn SMS; passkey (WebAuthn) chống được phishing vì credential gắn với origin. Recovery code dùng một lần, lưu dạng hash.',
      en: 'Layered defence. Storage: Argon2id (m=19 MiB, t=2, p=1) or bcrypt cost ≥10, a per-password salt, optionally a pepper in a vault. Policy (NIST 800-63B-4): at least 15 characters when the password is the only factor (8 within MFA), allow at least 64, no composition rules, no periodic rotation, check against a blocklist of breached passwords. Login: rate limiting per account and per IP. Add a second factor: TOTP beats SMS; passkeys (WebAuthn) resist phishing because the credential is bound to the origin. Single-use recovery codes, stored hashed.'
    },
    math: {
      formula: String.raw`T_{\text{crack}} = \frac{|\Sigma|^{L}}{2R_{\text{hash}}}, \qquad \text{OTP} = \operatorname{Trunc}\!\big(\text{HMAC}(K,\ \lfloor (t - T_0)/X \rfloor)\big) \bmod 10^{d}`,
      description: {
        vi: 'Bẻ offline: mật khẩu 8 ký tự chữ thường + số (36⁸ ≈ 2,8×10¹²) với SHA-256 trên GPU (~10¹⁰/s) mất ~2 phút, với Argon2id 19 MiB (~10⁴/s mỗi GPU do giới hạn bộ nhớ) mất ~4,5 năm — và độ dài tăng thời gian theo hàm mũ. TOTP (RFC 6238): bước thời gian X = 30 giây, HMAC-SHA-1 mặc định, cắt còn d chữ số (thường 6); mã đã dùng thành công không được chấp nhận lại.',
        en: 'Offline cracking: an 8-char lowercase+digit password (36⁸ ≈ 2.8×10¹²) falls in ~2 minutes to GPU SHA-256 (~10¹⁰/s) but takes ~4.5 years against 19 MiB Argon2id (~10⁴/s per GPU, memory-bound) — and length grows the time exponentially. TOTP (RFC 6238): a 30-second step X, HMAC-SHA-1 by default, truncated to d digits (usually 6); a code already accepted must not be accepted again.'
      },
      timeComplexity: 'Argon2id: O(t · m) per verification; TOTP: O(window) HMACs',
      spaceComplexity: 'Argon2id: m = 19 MiB per login attempt'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Ba câu hỏi: lưu mật khẩu sao cho DB lộ cũng không sao, chặn đoán mật khẩu trực tuyến thế nào, và yếu tố thứ hai nào chống được phishing.',
      en: 'Three questions: how to store passwords so a DB leak is survivable, how to stop online guessing, and which second factor resists phishing.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Lưu trữ: salt (ngẫu nhiên, riêng mỗi mật khẩu, lưu cùng hash) chặn rainbow table và làm hai người cùng mật khẩu có hash khác nhau. Pepper là bí mật chung lưu ngoài DB (vault/HSM), nên lộ riêng DB chưa đủ để bẻ. Tham số được lưu trong chuỗi hash ($argon2id$v=19$m=19456,t=2,p=1$…) nên có thể nâng chi phí dần: khi user đăng nhập thành công, hash lại bằng tham số mới (DelegatingPasswordEncoder của Spring làm việc này qua upgradeEncoding).',
        en: 'Storage: a salt (random, per password, stored with the hash) blocks rainbow tables and gives identical passwords different hashes. A pepper is a shared secret kept outside the DB (vault/HSM), so a DB-only leak is not enough to crack. Parameters live in the hash string ($argon2id$v=19$m=19456,t=2,p=1$…), so cost can rise over time: on a successful login, rehash with the new parameters (Spring’s DelegatingPasswordEncoder does this via upgradeEncoding).'
      },
      {
        vi: 'Tấn công trực tuyến: brute force đoán nhiều mật khẩu cho một tài khoản; credential stuffing thử các cặp email/mật khẩu bị lộ từ site khác; password spraying thử vài mật khẩu phổ biến trên rất nhiều tài khoản để né khoá tài khoản. Khoá tài khoản cứng tạo ra DoS (kẻ tấn công khoá được mọi người), nên ưu tiên throttling tăng dần theo account và theo IP, CAPTCHA/bot detection, cảnh báo đăng nhập bất thường và kiểm tra mật khẩu với blocklist đã lộ.',
        en: 'Online attacks: brute force guesses many passwords for one account; credential stuffing replays email/password pairs leaked from other sites; password spraying tries a few common passwords across many accounts to dodge lockouts. Hard lockouts become a DoS (an attacker can lock everyone out), so prefer progressive throttling per account and per IP, CAPTCHA/bot detection, alerts on anomalous logins and checking passwords against breached-password blocklists.'
      },
      {
        vi: 'MFA: ba nhóm yếu tố — thứ bạn biết, thứ bạn có, thứ bạn là. SMS OTP bị NIST xếp loại "restricted" (SIM swap, chặn tin nhắn). TOTP (Google Authenticator) tốt hơn nhưng vẫn bị phishing: trang giả chuyển tiếp mã trong 30 giây. HOTP (RFC 4226) dùng bộ đếm thay vì thời gian và cần cửa sổ look-ahead để đồng bộ lại.',
        en: 'MFA: three factor groups — something you know, have, are. NIST classes SMS OTP as "restricted" (SIM swaps, intercepted messages). TOTP (Google Authenticator) is better but still phishable: a fake page relays the code within 30 seconds. HOTP (RFC 4226) uses a counter instead of time and needs a look-ahead window to resynchronise.'
      },
      {
        vi: 'Passkey (WebAuthn/FIDO2): authenticator tạo cặp khoá riêng cho từng Relying Party; server chỉ lưu public key; khi đăng nhập, authenticator ký challenge và trình duyệt gắn origin thật vào dữ liệu được ký. Trang giả ở domain khác không thể dùng credential của domain thật, nên passkey chống phishing theo thiết kế. Passkey đồng bộ (iCloud, Google Password Manager) tiện lợi; passkey gắn thiết bị (security key) cho mức đảm bảo cao nhất. Recovery code: cấp lúc đăng ký MFA, dùng một lần, lưu dạng hash.',
        en: 'Passkeys (WebAuthn/FIDO2): the authenticator creates a key pair per Relying Party; the server stores only the public key; at login the authenticator signs a challenge and the browser binds the real origin into the signed data. A fake page on another domain cannot use the real domain’s credential, so passkeys resist phishing by design. Synced passkeys (iCloud, Google Password Manager) are convenient; device-bound passkeys (security keys) give the highest assurance. Recovery codes: issued at MFA enrolment, single-use, stored hashed.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Hash mật khẩu bằng SHA-256 + salt: salt chống rainbow table nhưng không làm chậm brute force.',
        en: 'Hashing passwords with SHA-256 + salt: the salt defeats rainbow tables but does not slow brute force.'
      },
      {
        vi: 'Quy tắc "1 chữ hoa, 1 số, 1 ký tự đặc biệt, đổi mỗi 90 ngày": người dùng tạo Password1! rồi Password2! — đúng thứ NIST khuyên bỏ.',
        en: '"1 uppercase, 1 digit, 1 symbol, change every 90 days" rules: users create Password1! then Password2! — exactly what NIST advises dropping.'
      },
      {
        vi: 'Luồng "quên mật khẩu" hoặc khôi phục MFA yếu hơn chính luồng đăng nhập (câu hỏi bí mật, SMS) trở thành cửa sau.',
        en: 'A "forgot password" or MFA recovery flow weaker than login itself (security questions, SMS) becomes the back door.'
      },
      {
        vi: 'Thông báo lỗi khác nhau cho "sai email" và "sai mật khẩu" giúp kẻ tấn công dò tài khoản tồn tại.',
        en: 'Different error messages for "unknown email" and "wrong password" let attackers enumerate accounts.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Luồng đăng nhập có MFA', en: 'A login flow with MFA' },
    description: {
      vi: 'Mỗi lớp chặn một kiểu tấn công khác nhau: throttling, hash chậm, blocklist, yếu tố thứ hai.',
      en: 'Each layer stops a different attack: throttling, slow hashing, blocklists, a second factor.'
    },
    asciiDiagram: `
 POST /login {email, password}
   │ rate limit: 5/min per account, 50/min per IP  (progressive delay, not hard lockout)
   ▼
 argon2id.verify($argon2id$v=19$m=19456,t=2,p=1$salt$hash, password)   ~50 ms, 19 MiB
   │ ok → upgradeEncoding? rehash with current params
   ▼
 second factor
   ├─ TOTP   HMAC-SHA1(K, ⌊t/30⌋) → 6 digits, ±1 step, reject reuse      (phishable)
   ├─ Passkey  challenge → authenticator signs {challenge, origin, rpId}  (phishing-resistant)
   └─ Recovery code (single use, stored as hash)
   ▼
 new session (rotate id) · audit log · new-device alert
`,
    components: [
      {
        name: 'Argon2id',
        role: 'Storage',
        description: {
          vi: 'Hash chậm, tốn bộ nhớ, tham số lưu kèm hash.',
          en: 'A slow, memory-hard hash with parameters stored alongside.'
        }
      },
      {
        name: 'Breached-password check',
        role: 'Policy',
        description: {
          vi: 'So mật khẩu mới với blocklist mật khẩu đã lộ.',
          en: 'Compares new passwords with a blocklist of breached ones.'
        }
      },
      {
        name: 'TOTP',
        role: 'Something you have',
        description: {
          vi: 'Mã 6 số theo thời gian từ secret chung; vẫn có thể bị phishing.',
          en: 'Time-based 6-digit codes from a shared secret; still phishable.'
        }
      },
      {
        name: 'Passkey',
        role: 'Phishing-resistant',
        description: {
          vi: 'Khoá riêng theo từng site, chữ ký gắn origin.',
          en: 'A per-site private key, signatures bound to the origin.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'hash',
      title: {
        vi: 'Lưu bằng Argon2id, nâng cấp dần',
        en: 'Store with Argon2id, upgrade over time'
      },
      phase: 'Storage',
      description: {
        vi: 'DelegatingPasswordEncoder ghi tiền tố {argon2}, vẫn đọc được hash {bcrypt} cũ.',
        en: 'DelegatingPasswordEncoder writes an {argon2} prefix and still reads old {bcrypt} hashes.'
      },
      systemBehavior: {
        vi: 'Đăng nhập thành công với hash cũ thì hash lại bằng thuật toán mới.',
        en: 'A successful login with an old hash rehashes it with the new algorithm.'
      },
      codeLineMatch: 'new DelegatingPasswordEncoder("argon2"'
    },
    {
      id: 'policy',
      title: {
        vi: 'Độ dài + blocklist, không quy tắc thành phần',
        en: 'Length + blocklist, no composition rules'
      },
      phase: 'Policy',
      description: {
        vi: 'Từ chối mật khẩu ngắn hơn 15 ký tự hoặc đã xuất hiện trong các vụ lộ dữ liệu.',
        en: 'Reject passwords shorter than 15 characters or seen in breaches.'
      },
      systemBehavior: {
        vi: 'Kiểm tra k-anonymity: chỉ gửi 5 ký tự đầu của SHA-1 ra ngoài.',
        en: 'A k-anonymity check: only the first 5 SHA-1 hex characters leave the server.'
      },
      codeLineMatch: 'compromisedPasswordChecker.check'
    },
    {
      id: 'throttle',
      title: { vi: 'Rate limit theo account và IP', en: 'Rate limits per account and IP' },
      phase: 'Online defence',
      description: {
        vi: 'Chặn brute force và spraying mà không khoá cứng tài khoản.',
        en: 'Stops brute force and spraying without hard-locking accounts.'
      },
      systemBehavior: {
        vi: 'Vượt ngưỡng: trả 429 và tăng độ trễ cho lần sau.',
        en: 'Over the threshold: return 429 and grow the delay for later attempts.'
      },
      codeLineMatch: 'loginLimiter.tryConsume'
    },
    {
      id: 'totp',
      title: { vi: 'Kiểm tra TOTP', en: 'Verify a TOTP' },
      phase: 'Second factor',
      description: {
        vi: 'Tính HOTP cho bước thời gian hiện tại ±1, so sánh constant-time, chặn dùng lại.',
        en: 'Compute HOTP for the current time step ±1, compare in constant time, block reuse.'
      },
      systemBehavior: {
        vi: 'Lưu bước đã dùng cuối cùng để mã không được chấp nhận hai lần.',
        en: 'Store the last used step so a code is never accepted twice.'
      },
      codeLineMatch: 'Instant.now().getEpochSecond() / 30'
    },
    {
      id: 'passkey',
      title: { vi: 'Passkey (WebAuthn)', en: 'Passkeys (WebAuthn)' },
      phase: 'Phishing-resistant',
      description: {
        vi: 'Authenticator ký challenge; trình duyệt gắn origin, server kiểm tra rpId và origin.',
        en: 'The authenticator signs a challenge; the browser binds the origin and the server checks rpId and origin.'
      },
      systemBehavior: {
        vi: 'Trang giả ở domain khác không lấy được chữ ký hợp lệ.',
        en: 'A fake page on another domain cannot obtain a valid signature.'
      },
      codeLineMatch: 'http.webAuthn('
    }
  ],

  comparison: {
    title: { vi: 'SMS OTP vs TOTP vs Passkey', en: 'SMS OTP vs TOTP vs Passkey' },
    subtitle: {
      vi: 'Không phải yếu tố thứ hai nào cũng như nhau',
      en: 'Not all second factors are equal'
    },
    options: [
      {
        name: 'SMS / voice OTP',
        tag: 'Restricted',
        role: { vi: 'Mã gửi qua mạng điện thoại', en: 'Codes sent over the phone network' },
        keyMechanism: {
          vi: 'Dễ triển khai; dính SIM swap, chặn tin nhắn và phishing.',
          en: 'Easy to deploy; exposed to SIM swaps, interception and phishing.'
        },
        configExample: 'Only as a fallback, with alternatives offered',
        architectureNote: {
          vi: 'NIST 800-63B-4 xếp loại restricted.',
          en: 'Classed as restricted by NIST 800-63B-4.'
        }
      },
      {
        name: 'TOTP app',
        tag: 'Shared secret',
        role: { vi: 'Mã 6 số mỗi 30 giây', en: 'A 6-digit code every 30 seconds' },
        keyMechanism: {
          vi: 'Hoạt động offline; secret nằm cả ở server; vẫn bị chuyển tiếp qua trang giả.',
          en: 'Works offline; the secret also lives on the server; still relayable through a fake page.'
        },
        configExample: 'otpauth://totp/Shop:alice?secret=…&period=30&digits=6',
        architectureNote: {
          vi: 'Tốt hơn SMS nhiều; không chống phishing.',
          en: 'Much better than SMS; not phishing-resistant.'
        }
      },
      {
        name: 'Passkey (WebAuthn)',
        tag: 'Phishing-resistant',
        role: { vi: 'Chữ ký khoá riêng theo site', en: 'A per-site private-key signature' },
        keyMechanism: {
          vi: 'Server chỉ có public key; chữ ký gắn origin; không có bí mật để lộ hay gõ nhầm.',
          en: 'The server holds only a public key; the signature binds the origin; no secret to leak or mistype.'
        },
        configExample: 'http.webAuthn(w -> w.rpId("shop.example.com"))',
        architectureNote: {
          vi: 'Có thể thay luôn mật khẩu (passwordless).',
          en: 'Can replace the password entirely (passwordless).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Argon2id làm brute force offline đắt gấp hàng triệu lần.',
        en: 'Argon2id makes offline brute force millions of times costlier.'
      },
      {
        vi: 'MFA chặn phần lớn tấn công credential stuffing; passkey chặn cả phishing.',
        en: 'MFA stops most credential stuffing; passkeys stop phishing as well.'
      }
    ],
    cons: [
      {
        vi: 'Hash chậm tốn CPU/RAM — thiếu rate limit thì đăng nhập thành vector tự DoS.',
        en: 'Slow hashes cost CPU/RAM — without rate limits, login becomes a self-DoS vector.'
      },
      {
        vi: 'MFA thêm ma sát và chi phí hỗ trợ khi người dùng mất thiết bị.',
        en: 'MFA adds friction and support cost when users lose devices.'
      }
    ],
    balance: {
      vi: 'Bắt buộc MFA chống phishing cho admin và thao tác rủi ro cao; với người dùng thường, khuyến khích passkey và cho phép TOTP, hạn chế SMS.',
      en: 'Require phishing-resistant MFA for admins and high-risk actions; for regular users, encourage passkeys, allow TOTP and limit SMS.'
    },
    invariant: {
      vi: 'Server không bao giờ lưu, ghi log hay trả về mật khẩu có thể khôi phục.',
      en: 'The server never stores, logs or returns a recoverable password.'
    }
  },

  code: [
    {
      label: 'PasswordAndMfaConfig.java',
      filename: 'PasswordAndMfaConfig.java',
      language: 'java',
      code: `@Bean
PasswordEncoder passwordEncoder() {
    // Argon2id m=19 MiB, t=2, p=1 (OWASP); old {bcrypt} hashes still verify and get upgraded
    Map<String, PasswordEncoder> encoders = Map.of(
        "argon2", new Argon2PasswordEncoder(16, 32, 1, 19 * 1024, 2),
        "bcrypt", new BCryptPasswordEncoder(12));
    return new DelegatingPasswordEncoder("argon2", encoders);
}

// Registration (NIST 800-63B-4): length + breached check, no composition rules, no expiry
void validateNewPassword(String raw) {
    if (raw.length() < 15 || raw.length() > 128) throw new WeakPasswordException("length");
    if (compromisedPasswordChecker.check(raw).isCompromised()) throw new WeakPasswordException("breached");
}

// Login: throttle per account AND per IP, same error message for every failure
if (!loginLimiter.tryConsume(username, clientIp)) throw new TooManyAttemptsException();

// TOTP (RFC 6238): 30 s step, accept ±1 step of drift, never accept a step twice
boolean verifyTotp(User u, String code) {
    long now = Instant.now().getEpochSecond() / 30;
    for (long t = now - 1; t <= now + 1; t++) {
        if (t > u.lastTotpStep() && MessageDigest.isEqual(hotp(u.totpSecret(), t), code.getBytes())) {
            u.setLastTotpStep(t);
            return true;
        }
    }
    return false;
}

// Passkeys (Spring Security WebAuthn support)
http.webAuthn(w -> w
    .rpName("Shop")
    .rpId("shop.example.com")
    .allowedOrigins("https://shop.example.com"));`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Junior',
      question: {
        vi: 'Vì sao không dùng SHA-256 để hash mật khẩu, kể cả có salt?',
        en: 'Why not hash passwords with SHA-256, even with a salt?'
      },
      answer: {
        vi: 'SHA-256 được thiết kế để NHANH — GPU tính hàng tỷ lần mỗi giây, nên mật khẩu yếu bị bẻ trong vài phút. Salt chỉ ngăn tính trước (rainbow table) và làm hai người trùng mật khẩu có hash khác nhau. Cần hàm chậm, điều chỉnh được chi phí và tốn bộ nhớ: Argon2id, scrypt, bcrypt.',
        en: 'SHA-256 is designed to be FAST — GPUs compute billions per second, so weak passwords fall in minutes. A salt only prevents precomputation (rainbow tables) and gives identical passwords different hashes. You need a slow, tunable, memory-hard function: Argon2id, scrypt, bcrypt.'
      }
    },
    {
      seniority: 'Mid',
      question: {
        vi: 'Credential stuffing và password spraying khác nhau thế nào, và phòng thủ ra sao?',
        en: 'How do credential stuffing and password spraying differ, and how do you defend?'
      },
      answer: {
        vi: 'Stuffing dùng các cặp email/mật khẩu thật bị lộ từ site khác, mỗi tài khoản thử ít lần. Spraying thử vài mật khẩu phổ biến trên rất nhiều tài khoản. Cả hai né được khoá theo tài khoản, nên cần rate limit theo IP/ASN và theo toàn hệ thống, bot detection, blocklist mật khẩu đã lộ, và trên hết là MFA.',
        en: 'Stuffing replays real email/password pairs leaked from other sites, a few tries per account. Spraying tries a few common passwords across many accounts. Both evade per-account lockouts, so you need rate limits per IP/ASN and globally, bot detection, breached-password blocklists and, above all, MFA.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao passkey chống được phishing còn TOTP thì không?',
        en: 'Why do passkeys resist phishing while TOTP does not?'
      },
      answer: {
        vi: 'Mã TOTP là chuỗi người dùng tự gõ; trang giả nhận mã và chuyển tiếp tới site thật trong cửa sổ 30 giây. Với passkey, trình duyệt đưa origin thật vào dữ liệu được ký và authenticator chỉ dùng credential cho đúng RP ID; trang ở domain giả không có credential nào để dùng, và chữ ký lấy ở đó không hợp lệ với site thật.',
        en: 'A TOTP code is a string the user types; a fake page captures it and relays it to the real site within the 30-second window. With a passkey, the browser puts the real origin into the signed data and the authenticator only uses the credential for the right RP ID; a page on a fake domain has no credential to use, and any signature it obtains is invalid for the real site.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.owaspPasswords,
    SECURITY_CITATIONS.nist80063b,
    SECURITY_CITATIONS.rfc6238,
    SECURITY_CITATIONS.owaspMfa,
    SECURITY_CITATIONS.webauthn
  ]
};
