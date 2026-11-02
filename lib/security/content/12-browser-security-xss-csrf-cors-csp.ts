import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const browserSecurityTopic: SecurityTopic = {
  id: 'browser-security-xss-csrf-cors-csp',
  roadmapId: 'SEC-12',
  category: 'sec-appsec',
  level: 'advanced',
  chapter: 'Cấp độ 4',
  name: 'Browser Security: XSS, CSRF, CORS & CSP',
  tagline: {
    vi: 'Same-Origin Policy và origin = (scheme, host, port); cookie HttpOnly/Secure/SameSite và tiền tố __Host-; CSRF token và Sec-Fetch-Site; CORS preflight với credentials; XSS reflected/stored/DOM, output encoding và CSP nonce + strict-dynamic; clickjacking, security headers và BFF cho SPA.',
    en: 'The Same-Origin Policy and origin = (scheme, host, port); HttpOnly/Secure/SameSite cookies and the __Host- prefix; CSRF tokens and Sec-Fetch-Site; CORS preflight with credentials; reflected/stored/DOM XSS, output encoding and CSP nonces + strict-dynamic; clickjacking, security headers and a BFF for SPAs.'
  },
  difficulty: 3,
  order: 12,
  estimatedMinutes: 22,

  coreTheory: {
    problemStatement: {
      vi: 'Trình duyệt chạy code của nhiều site trong cùng một tiến trình và tự động gửi cookie của bạn. Một trang độc hại có thể khiến trình duyệt POST tới ngân hàng kèm cookie của nạn nhân (CSRF), một bình luận chứa <script> có thể chạy với quyền của site (XSS), và một API mở CORS "*" có thể bị trang lạ đọc dữ liệu.',
      en: 'Browsers run code from many sites in one process and attach your cookies automatically. A malicious page can make the browser POST to a bank with the victim’s cookie (CSRF), a comment containing <script> can run with the site’s privileges (XSS), and an API that opens CORS to "*" can have its data read by foreign pages.'
    },
    hardwareConstraint: {
      vi: 'Server không thấy được trang nào đã kích hoạt request; nó chỉ thấy cookie, header và body. Trình duyệt là nơi duy nhất biết origin của trang, nên mọi phòng thủ phía client đều là chính sách server khai báo qua header để trình duyệt thực thi.',
      en: 'The server cannot see which page triggered a request; it only sees cookies, headers and the body. The browser is the only party that knows the page’s origin, so every client-side defence is a policy the server declares in headers for the browser to enforce.'
    },
    fundamentalSolution: {
      vi: 'Same-Origin Policy: script chỉ đọc được response cùng origin; ghi (form, link) và nhúng (img, script) cross-origin vẫn được phép. CORS là cách server nới lỏng có kiểm soát việc ĐỌC: liệt kê origin được phép, và request không "simple" phải qua preflight OPTIONS. CSRF lợi dụng việc ghi cross-site vẫn mang cookie: chặn bằng SameSite, CSRF token do framework quản lý và kiểm tra Sec-Fetch-Site/Origin. XSS phá vỡ SOP từ bên trong: chặn bằng output encoding theo ngữ cảnh, sanitize HTML (DOMPurify), cookie HttpOnly và CSP nonce + strict-dynamic như lớp bổ sung. SPA tốt nhất không giữ token: dùng BFF.',
      en: 'The Same-Origin Policy: script may only read same-origin responses; cross-origin writes (forms, links) and embedding (img, script) are still allowed. CORS is how a server relaxes READS in a controlled way: it lists allowed origins, and non-"simple" requests must pass an OPTIONS preflight. CSRF abuses the fact that cross-site writes still carry cookies: block it with SameSite, framework-managed CSRF tokens and Sec-Fetch-Site/Origin checks. XSS breaks the SOP from inside: block it with context-specific output encoding, HTML sanitising (DOMPurify), HttpOnly cookies and a CSP with nonces + strict-dynamic as an extra layer. SPAs are best off holding no tokens: use a BFF.'
    },
    math: {
      formula: String.raw`\text{origin} = (\text{scheme},\ \text{host},\ \text{port}), \qquad \text{script may read } r \iff o_{\text{page}} = o_r \;\lor\; o_{\text{page}} \in \text{Access-Control-Allow-Origin}(r)`,
      description: {
        vi: 'https://shop.com và http://shop.com, hay shop.com:443 và shop.com:8443, là các origin khác nhau. SOP và CORS chỉ quyết định script có ĐỌC được response hay không — request "simple" vẫn tới server và vẫn có tác dụng phụ, vì vậy CSRF phải được chặn ở server chứ không phải bằng CORS.',
        en: 'https://shop.com and http://shop.com, or shop.com:443 and shop.com:8443, are different origins. SOP and CORS only decide whether script can READ the response — a "simple" request still reaches the server and still has side effects, so CSRF must be stopped at the server, not by CORS.'
      },
      timeComplexity: 'Preflight: +1 round-trip, cached for Access-Control-Max-Age',
      spaceComplexity: 'Per-session CSRF token; per-response CSP nonce'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Bốn cơ chế, bốn câu hỏi: SOP/CORS — ai được đọc; cookie attributes + CSRF — request ghi có thật sự từ trang của ta không; output encoding + CSP — script nào được chạy; frame-ancestors — ai được nhúng trang của ta.',
      en: 'Four mechanisms, four questions: SOP/CORS — who may read; cookie attributes + CSRF — did this write really come from our page; output encoding + CSP — which scripts may run; frame-ancestors — who may embed our page.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Cookie: HttpOnly (JS không đọc được), Secure (chỉ HTTPS), SameSite=Strict (không gửi cross-site), Lax (chỉ gửi cross-site cho điều hướng top-level bằng method an toàn như GET), None (gửi mọi nơi, bắt buộc Secure). Tiền tố __Host- buộc cookie có Secure, Path=/ và không có Domain — chống subdomain ghi đè cookie. Lưu ý "same-site" khác "same-origin": a.shop.com và b.shop.com là cùng site.',
        en: 'Cookies: HttpOnly (no JS access), Secure (HTTPS only), SameSite=Strict (never cross-site), Lax (cross-site only for top-level navigations with safe methods such as GET), None (sent everywhere, requires Secure). The __Host- prefix forces Secure, Path=/ and no Domain — stopping subdomains from overwriting the cookie. Note "same-site" differs from "same-origin": a.shop.com and b.shop.com are the same site.'
      },
      {
        vi: 'CSRF: OWASP khuyến nghị dùng CSRF protection có sẵn của framework (synchronizer token hoặc signed double-submit cookie), coi Sec-Fetch-Site là tín hiệu chính và fallback sang Origin/Referer; SameSite chỉ là lớp bổ sung. GET không bao giờ được thay đổi trạng thái. API dùng header tuỳ biến (X-XSRF-TOKEN) dựa vào việc header đó buộc preflight, nên CORS phải chỉ cho phép origin tin cậy.',
        en: 'CSRF: OWASP recommends the framework’s built-in protection (synchronizer token or signed double-submit cookie), treats Sec-Fetch-Site as the primary signal with an Origin/Referer fallback; SameSite is defence in depth. GET must never change state. APIs using a custom header (X-XSRF-TOKEN) rely on that header forcing a preflight, so CORS must allow only trusted origins.'
      },
      {
        vi: 'CORS: request "simple" (GET/HEAD/POST, header trong danh sách an toàn, Content-Type form/multipart/text) không preflight. Request khác (PUT, JSON, header tuỳ biến) gửi trước OPTIONS với Access-Control-Request-Method/Headers. Khi có credentials, Access-Control-Allow-Origin không được là "*" và phải có Access-Control-Allow-Credentials: true. Phản chiếu nguyên header Origin của request vào ACAO là lỗi kinh điển — tương đương mở cho mọi site.',
        en: 'CORS: "simple" requests (GET/HEAD/POST, safelisted headers, form/multipart/text Content-Type) are not preflighted. Others (PUT, JSON, custom headers) first send OPTIONS with Access-Control-Request-Method/Headers. With credentials, Access-Control-Allow-Origin must not be "*" and Access-Control-Allow-Credentials: true is required. Reflecting the request’s Origin header into ACAO is a classic bug — equivalent to opening up to every site.'
      },
      {
        vi: 'XSS và CSP: reflected (payload trong URL phản chiếu vào trang), stored (lưu trong DB, ví dụ bình luận), DOM-based (JS phía client đưa dữ liệu vào innerHTML). Phòng thủ chính là encoding theo ngữ cảnh (HTML, attribute, JS, URL) — framework như React, Thymeleaf escape mặc định; nguy hiểm nằm ở dangerouslySetInnerHTML, th:utext, eval. CSP với nonce ngẫu nhiên mỗi response + strict-dynamic, object-src none, base-uri none giới hạn thiệt hại; bật Report-Only trước. Clickjacking chặn bằng frame-ancestors (thay X-Frame-Options); thêm HSTS, X-Content-Type-Options: nosniff, Referrer-Policy và đặt X-XSS-Protection: 0.',
        en: 'XSS and CSP: reflected (a URL payload echoed into the page), stored (saved in the DB, e.g. a comment), DOM-based (client JS putting data into innerHTML). The main defence is context-specific encoding (HTML, attribute, JS, URL) — frameworks such as React and Thymeleaf escape by default; danger lives in dangerouslySetInnerHTML, th:utext, eval. A CSP with a random per-response nonce + strict-dynamic, object-src none and base-uri none limits the damage; start in Report-Only. Clickjacking is blocked with frame-ancestors (replacing X-Frame-Options); add HSTS, X-Content-Type-Options: nosniff, Referrer-Policy and set X-XSS-Protection: 0.'
      },
      {
        vi: 'BFF cho SPA: SPA gọi /api cùng origin với cookie __Host-session HttpOnly SameSite; BFF (Spring Cloud Gateway…) làm Authorization Code + PKCE như confidential client, giữ access/refresh token trong session phía server và gắn token khi proxy tới API. XSS vẫn nguy hiểm, nhưng không còn lấy được token để dùng ngoài trình duyệt.',
        en: 'A BFF for SPAs: the SPA calls /api on the same origin with an HttpOnly SameSite __Host-session cookie; the BFF (Spring Cloud Gateway…) runs Authorization Code + PKCE as a confidential client, keeps access/refresh tokens in the server-side session and attaches them when proxying to APIs. XSS is still dangerous, but it can no longer steal tokens for use outside the browser.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'CORS phản chiếu header Origin kèm Allow-Credentials: true — mọi site đọc được dữ liệu của người dùng đã đăng nhập.',
        en: 'CORS reflecting the Origin header with Allow-Credentials: true — every site can read logged-in users’ data.'
      },
      {
        vi: 'Tắt CSRF protection của Spring "vì đang dùng JWT" trong khi token thực ra nằm trong cookie.',
        en: 'Disabling Spring’s CSRF protection "because we use JWTs" while the token actually lives in a cookie.'
      },
      {
        vi: 'CSP có unsafe-inline và unsafe-eval cho "chạy được": gần như vô hiệu với XSS.',
        en: 'A CSP with unsafe-inline and unsafe-eval "to make it work": nearly useless against XSS.'
      },
      {
        vi: 'Lưu access token trong localStorage của SPA: một lỗ XSS là token bị gửi ra ngoài.',
        en: 'Storing access tokens in SPA localStorage: one XSS bug and the token is exfiltrated.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Trình duyệt áp chính sách do server khai báo',
      en: 'The browser enforces server-declared policy'
    },
    description: {
      vi: 'Server gửi header; trình duyệt quyết định gửi cookie, cho đọc response, chạy script, cho nhúng.',
      en: 'The server sends headers; the browser decides whether to send cookies, allow reads, run scripts, allow framing.'
    },
    asciiDiagram: `
 https://evil.example                     https://app.shop.com (SPA)          https://api.shop.com
 ├─ <form POST /transfer> ── cookie? SameSite=Lax → not sent on cross-site POST; CSRF token missing → 403
 ├─ fetch(api.shop.com/me) ─────────────────────────────► 200 (no ACAO for evil) → script cannot read
 │                                        ├─ PUT /cart (JSON) ─ preflight OPTIONS ───────►
 │                                        │   ◄── ACAO: https://app.shop.com, Allow-Credentials: true
 │                                        ├─ actual PUT + cookie + X-XSRF-TOKEN ─────────► 200
 │                                        └─ <script nonce=r4nd0m> ✓   injected <script> ✗ (CSP)
 └─ <iframe src=app.shop.com> ✗  (frame-ancestors 'none')
 Set-Cookie: __Host-SESSION=…; HttpOnly; Secure; SameSite=Lax; Path=/
`,
    components: [
      {
        name: 'Same-Origin Policy',
        role: 'Read isolation',
        description: {
          vi: 'Script chỉ đọc response cùng (scheme, host, port).',
          en: 'Script reads only same (scheme, host, port) responses.'
        }
      },
      {
        name: 'CORS',
        role: 'Controlled sharing',
        description: {
          vi: 'Server liệt kê origin được đọc; preflight cho request không simple.',
          en: 'The server lists readable origins; preflight for non-simple requests.'
        }
      },
      {
        name: 'Cookie attributes + CSRF',
        role: 'Write intent',
        description: {
          vi: 'SameSite, CSRF token, Sec-Fetch-Site chứng minh ý định của chính site.',
          en: 'SameSite, CSRF tokens and Sec-Fetch-Site prove the site’s own intent.'
        }
      },
      {
        name: 'CSP + encoding',
        role: 'Script control',
        description: {
          vi: 'Chỉ script có nonce chạy; dữ liệu được encode theo ngữ cảnh.',
          en: 'Only nonce-bearing scripts run; data is encoded per context.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'cookies-sop',
      title: {
        vi: 'SOP & cookie __Host- HttpOnly SameSite',
        en: 'SOP & a __Host- HttpOnly SameSite cookie'
      },
      phase: 'Isolation',
      description: {
        vi: 'evil.example fetch API của ta: request đi nhưng script không đọc được response.',
        en: 'evil.example fetches our API: the request goes out but script cannot read the response.'
      },
      systemBehavior: {
        vi: 'Cookie HttpOnly không lộ cho JS, kể cả JS cùng origin.',
        en: 'The HttpOnly cookie is invisible to JS, even same-origin JS.'
      },
      codeLineMatch: '__Host-SESSION'
    },
    {
      id: 'csrf',
      title: { vi: 'CSRF bị chặn', en: 'CSRF blocked' },
      phase: 'Write intent',
      description: {
        vi: 'Form tự submit từ evil.example: SameSite=Lax không gửi cookie cho POST cross-site, thiếu CSRF token → 403.',
        en: 'An auto-submitting form on evil.example: SameSite=Lax sends no cookie on a cross-site POST, no CSRF token → 403.'
      },
      systemBehavior: {
        vi: 'CsrfFilter so token trong header với token của phiên.',
        en: 'CsrfFilter compares the header token with the session’s token.'
      },
      codeLineMatch: 'CookieCsrfTokenRepository.withHttpOnlyFalse()'
    },
    {
      id: 'cors',
      title: { vi: 'CORS preflight cho origin tin cậy', en: 'CORS preflight for a trusted origin' },
      phase: 'Sharing',
      description: {
        vi: 'PUT JSON từ app.shop.com: OPTIONS trước, server trả đúng origin và Allow-Credentials.',
        en: 'A JSON PUT from app.shop.com: OPTIONS first, the server returns the exact origin and Allow-Credentials.'
      },
      systemBehavior: {
        vi: 'Preflight được cache theo Max-Age; origin lạ không nhận được header cho phép.',
        en: 'The preflight is cached for Max-Age; unknown origins get no allowing header.'
      },
      codeLineMatch: 'setAllowCredentials(true)'
    },
    {
      id: 'csp',
      title: { vi: 'CSP nonce chặn script chèn vào', en: 'A CSP nonce blocks injected scripts' },
      phase: 'Script control',
      description: {
        vi: 'Chỉ <script> mang nonce của response này được chạy; script chèn qua bình luận bị chặn.',
        en: 'Only <script> tags carrying this response’s nonce run; a script injected via a comment is blocked.'
      },
      systemBehavior: {
        vi: 'Trình duyệt ghi vi phạm vào report endpoint.',
        en: 'The browser reports the violation to the reporting endpoint.'
      },
      codeLineMatch: "'strict-dynamic'"
    }
  ],

  comparison: {
    title: { vi: 'XSS vs CSRF', en: 'XSS vs CSRF' },
    subtitle: {
      vi: 'Hai tấn công trình duyệt hay bị nhầm lẫn',
      en: 'Two browser attacks that are often confused'
    },
    options: [
      {
        name: 'XSS',
        tag: 'Code runs in your origin',
        role: {
          vi: 'Kẻ tấn công chạy script trên site của bạn',
          en: 'The attacker runs script on your site'
        },
        keyMechanism: {
          vi: 'Dữ liệu chưa encode được hiểu là HTML/JS; script có toàn quyền của origin.',
          en: 'Unencoded data is interpreted as HTML/JS; the script has the origin’s full power.'
        },
        configExample: 'encode output · DOMPurify · CSP nonce · HttpOnly',
        architectureNote: {
          vi: 'XSS vô hiệu hoá mọi phòng thủ CSRF vì nó đọc được token.',
          en: 'XSS defeats every CSRF defence because it can read the token.'
        }
      },
      {
        name: 'CSRF',
        tag: 'Request from another site',
        role: {
          vi: 'Trang lạ khiến trình duyệt gửi request ghi',
          en: 'A foreign page makes the browser send a write'
        },
        keyMechanism: {
          vi: 'Cookie tự đính kèm; kẻ tấn công không đọc được response nhưng không cần.',
          en: 'Cookies are attached automatically; the attacker cannot read the response and does not need to.'
        },
        configExample: 'CSRF token · Sec-Fetch-Site · SameSite',
        architectureNote: {
          vi: 'Không ảnh hưởng API chỉ dùng header Authorization (không có cookie tự động).',
          en: 'Does not affect APIs using only an Authorization header (no automatic cookie).'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Phần lớn phòng thủ là header và mặc định của framework — chi phí thấp.',
        en: 'Most defences are headers and framework defaults — low cost.'
      },
      {
        vi: 'CSP Report-Only cho phép đo trước khi bật chặn.',
        en: 'CSP Report-Only lets you measure before enforcing.'
      }
    ],
    cons: [
      {
        vi: 'CSP chặt đòi hỏi bỏ inline script và cập nhật thư viện bên thứ ba.',
        en: 'A strict CSP requires removing inline scripts and updating third-party libraries.'
      },
      {
        vi: 'SameSite=Strict làm hỏng luồng đăng nhập đi vào từ link ngoài.',
        en: 'SameSite=Strict breaks login flows entered from external links.'
      }
    ],
    balance: {
      vi: 'SameSite=Lax + CSRF token cho cookie phiên, CSP nonce khởi đầu bằng Report-Only, CORS allowlist ngắn nhất có thể, và BFF thay vì token trong trình duyệt.',
      en: 'SameSite=Lax + CSRF tokens for session cookies, a nonce CSP starting in Report-Only, the shortest possible CORS allowlist, and a BFF instead of tokens in the browser.'
    },
    invariant: {
      vi: 'Không trang nào ở origin khác đọc được dữ liệu hay thực hiện thay đổi trạng thái thay mặt người dùng mà server không cho phép rõ ràng.',
      en: 'No page on another origin can read data or change state on the user’s behalf unless the server explicitly allows it.'
    }
  },

  code: [
    {
      label: 'WebSecurityConfig.java',
      filename: 'WebSecurityConfig.java',
      language: 'java',
      code: `// Session cookie: Secure + HttpOnly + SameSite, __Host- prefix (no Domain, Path=/)
ResponseCookie session = ResponseCookie.from("__Host-SESSION", sessionId)
    .httpOnly(true).secure(true).sameSite("Lax").path("/").build();

http
    // CSRF: SPA reads XSRF-TOKEN and echoes it in the X-XSRF-TOKEN header
    .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
    .cors(cors -> cors.configurationSource(corsSource()))
    .headers(h -> h
        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(63072000))
        .contentTypeOptions(Customizer.withDefaults())                    // nosniff
        .referrerPolicy(r -> r.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)));

CorsConfigurationSource corsSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("https://app.shop.com"));   // exact origins, never "*" with credentials
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    c.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
    c.setAllowCredentials(true);
    c.setMaxAge(600L);
    UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
    src.registerCorsConfiguration("/api/**", c);
    return src;
}

// CSP with a fresh nonce per response (set in a filter, used as <script nonce="...">)
String nonce = Base64.getEncoder().encodeToString(randomBytes(16));
response.setHeader("Content-Security-Policy",
    "default-src 'self'; script-src 'nonce-" + nonce + "' 'strict-dynamic'; "
    + "object-src 'none'; base-uri 'none'; frame-ancestors 'none'");`
    },
    {
      label: 'preflight.http',
      filename: 'preflight.http',
      language: 'bash',
      code: `### Preflight sent by the browser before a JSON PUT with credentials
OPTIONS https://api.shop.com/api/cart
Origin: https://app.shop.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, x-xsrf-token

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.shop.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE
Access-Control-Allow-Headers: content-type, x-xsrf-token
Access-Control-Max-Age: 600
Vary: Origin`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'CORS có chống được CSRF không?',
        en: 'Does CORS protect against CSRF?'
      },
      answer: {
        vi: 'Không. CORS chỉ quyết định script ở origin khác có ĐỌC được response hay không. Một form POST "simple" từ trang lạ vẫn tới server kèm cookie và vẫn chuyển tiền — kẻ tấn công không cần đọc response. CSRF phải chặn ở server bằng CSRF token, Sec-Fetch-Site/Origin và SameSite.',
        en: 'No. CORS only decides whether script on another origin can READ the response. A "simple" form POST from a foreign page still reaches the server with the cookie and still moves the money — the attacker does not need to read the response. CSRF must be stopped at the server with CSRF tokens, Sec-Fetch-Site/Origin checks and SameSite.'
      },
      trapWarning: {
        vi: 'Nhiều người nghĩ "CORS chặn request" — sai với request simple.',
        en: 'Many believe "CORS blocks the request" — false for simple requests.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Thiết kế CSP cho một SPA hiện có nhiều inline script mà không làm vỡ trang.',
        en: 'Design a CSP for an existing SPA full of inline scripts without breaking it.'
      },
      answer: {
        vi: 'Bắt đầu bằng Content-Security-Policy-Report-Only với script-src nonce + strict-dynamic, object-src none, base-uri none và report endpoint. Dời inline script sang file hoặc gắn nonce ở server-render; thay inline event handler bằng addEventListener. Theo dõi report, sửa nguồn vi phạm, rồi chuyển sang header enforce. Thêm frame-ancestors để chống clickjacking.',
        en: 'Start with Content-Security-Policy-Report-Only using script-src nonce + strict-dynamic, object-src none, base-uri none and a report endpoint. Move inline scripts into files or add nonces at server render; replace inline event handlers with addEventListener. Watch the reports, fix the violating sources, then switch to the enforcing header. Add frame-ancestors against clickjacking.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.mdnCors,
    SECURITY_CITATIONS.owaspCsrf,
    SECURITY_CITATIONS.owaspXss,
    SECURITY_CITATIONS.mdnCsp,
    SECURITY_CITATIONS.owaspHeaders
  ]
};
