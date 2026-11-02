import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const springSecurityInternalsTopic: SecurityTopic = {
  id: 'spring-security-internals',
  roadmapId: 'SEC-16',
  category: 'sec-enterprise',
  level: 'advanced',
  chapter: 'Cấp độ 5',
  name: 'Spring Security Internals & Production Implementation',
  tagline: {
    vi: 'Request đi qua DelegatingFilterProxy → FilterChainProxy → SecurityFilterChain đầu tiên khớp; AuthenticationManager/ProviderManager và AuthenticationProvider; UserDetailsService; SecurityContextHolder; ExceptionTranslationFilter và AuthorizationFilter; method security; OAuth2 Resource Server/Client và kiểm thử bảo mật.',
    en: 'A request flows through DelegatingFilterProxy → FilterChainProxy → the first matching SecurityFilterChain; AuthenticationManager/ProviderManager and AuthenticationProviders; UserDetailsService; SecurityContextHolder; ExceptionTranslationFilter and AuthorizationFilter; method security; OAuth2 Resource Server/Client and security testing.'
  },
  difficulty: 3,
  order: 16,
  estimatedMinutes: 30,

  coreTheory: {
    problemStatement: {
      vi: 'Dev copy một SecurityConfig từ Internet, thêm .permitAll() cho tới khi hết lỗi 401, rồi không giải thích được vì sao /api/admin trả 200 cho user thường, vì sao endpoint REST bị 403 do CSRF, hay vì sao @PreAuthorize không có tác dụng khi gọi từ cùng class. Không hiểu đường đi của request thì không thể cấu hình bảo mật đúng.',
      en: 'A developer copies a SecurityConfig from the Internet, adds .permitAll() until the 401s stop, and then cannot explain why /api/admin returns 200 for regular users, why a REST endpoint gets 403 from CSRF, or why @PreAuthorize does nothing when called from the same class. Without knowing the request path, security cannot be configured correctly.'
    },
    hardwareConstraint: {
      vi: 'Servlet container chỉ biết Filter đăng ký trong vòng đời của nó, không biết bean Spring. Mỗi request chạy trên một thread; ngữ cảnh bảo mật phải đi theo thread đó (và phải được truyền tay khi chuyển sang thread khác, như @Async hay virtual thread executor).',
      en: 'The servlet container only knows Filters registered in its own lifecycle, not Spring beans. Each request runs on a thread; the security context must follow that thread (and be handed over explicitly when work moves to another thread, as with @Async or a virtual-thread executor).'
    },
    fundamentalSolution: {
      vi: 'DelegatingFilterProxy là Filter servlet bắc cầu sang ApplicationContext, uỷ thác cho bean FilterChainProxy. FilterChainProxy chọn SecurityFilterChain ĐẦU TIÊN có RequestMatcher khớp và chạy các filter của nó theo thứ tự cố định. Filter xác thực (UsernamePasswordAuthenticationFilter, BearerTokenAuthenticationFilter…) tạo Authentication chưa xác thực và giao cho AuthenticationManager — thường là ProviderManager duyệt danh sách AuthenticationProvider (DaoAuthenticationProvider dùng UserDetailsService + PasswordEncoder; JwtAuthenticationProvider dùng JwtDecoder). Kết quả được đặt vào SecurityContextHolder (ThreadLocal mặc định). AuthorizationFilter quyết định truy cập URL; ExceptionTranslationFilter đổi AuthenticationException thành 401/đăng nhập và AccessDeniedException thành 403. @EnableMethodSecurity thêm @PreAuthorize/@PostAuthorize qua AOP proxy.',
      en: 'DelegatingFilterProxy is a servlet Filter bridging into the ApplicationContext and delegating to the FilterChainProxy bean. FilterChainProxy picks the FIRST SecurityFilterChain whose RequestMatcher matches and runs its filters in a fixed order. Authentication filters (UsernamePasswordAuthenticationFilter, BearerTokenAuthenticationFilter…) build an unauthenticated Authentication and hand it to the AuthenticationManager — usually a ProviderManager iterating AuthenticationProviders (DaoAuthenticationProvider uses UserDetailsService + PasswordEncoder; JwtAuthenticationProvider uses a JwtDecoder). The result goes into the SecurityContextHolder (ThreadLocal by default). AuthorizationFilter decides URL access; ExceptionTranslationFilter turns an AuthenticationException into 401/login and an AccessDeniedException into 403. @EnableMethodSecurity adds @PreAuthorize/@PostAuthorize through AOP proxies.'
    },
    math: {
      formula: String.raw`\text{chain}(r) = \text{first}\{\, c_i \mid c_i.\text{matcher}(r) \,\}, \qquad \text{response} = (f_n \circ \cdots \circ f_2 \circ f_1)(r)`,
      description: {
        vi: 'Chỉ một chain chạy cho mỗi request: chain đầu tiên (theo @Order) có matcher khớp. Vì vậy chain bắt mọi request (không có securityMatcher) phải có thứ tự cuối cùng, nếu không các chain sau không bao giờ được dùng. Trong chain, các filter là một chuỗi hàm cố định thứ tự — authentication luôn trước authorization.',
        en: 'Exactly one chain runs per request: the first one (by @Order) whose matcher matches. A catch-all chain (no securityMatcher) must therefore come last, or later chains are never used. Within a chain, the filters form a fixed-order function pipeline — authentication always precedes authorization.'
      },
      timeComplexity: 'O(chains) to select + O(filters) per request',
      spaceComplexity: 'One SecurityContext per request thread'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Spring Security là một chuỗi Servlet Filter cộng một mô hình xác thực/phân quyền. Thứ tự filter tiêu biểu: SecurityContextHolderFilter, HeaderWriterFilter, CsrfFilter, LogoutFilter, UsernamePasswordAuthenticationFilter, BasicAuthenticationFilter, RequestCacheAwareFilter, AnonymousAuthenticationFilter, ExceptionTranslationFilter, AuthorizationFilter.',
      en: 'Spring Security is a chain of servlet Filters plus an authentication/authorization model. A typical filter order: SecurityContextHolderFilter, HeaderWriterFilter, CsrfFilter, LogoutFilter, UsernamePasswordAuthenticationFilter, BasicAuthenticationFilter, RequestCacheAwareFilter, AnonymousAuthenticationFilter, ExceptionTranslationFilter, AuthorizationFilter.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Nhiều SecurityFilterChain: tách chain cho /api/** (resource server stateless, không cookie, tắt CSRF hợp lý vì không có xác thực tự động bằng cookie) và chain cho phần web (form login, session, CSRF bật). Chain /api/** đặt @Order(1) với securityMatcher; chain web không matcher đặt sau cùng. Bật logging.level.org.springframework.security=TRACE để xem chain nào được chọn và filter nào chạy.',
        en: 'Multiple SecurityFilterChains: separate a chain for /api/** (stateless resource server, no cookies, CSRF reasonably disabled because no cookie-based automatic authentication exists) from the web chain (form login, session, CSRF on). The /api/** chain gets @Order(1) with a securityMatcher; the matcher-less web chain goes last. Turn on logging.level.org.springframework.security=TRACE to see which chain was chosen and which filters ran.'
      },
      {
        vi: 'Mô hình xác thực: Authentication gồm principal (thường là UserDetails hoặc Jwt), credentials (thường bị xoá sau khi xác thực) và authorities (GrantedAuthority như ROLE_ADMIN hay SCOPE_orders.read). ProviderManager thử lần lượt các AuthenticationProvider; không provider nào hỗ trợ thì ném ProviderNotFoundException. SecurityContextHolder mặc định MODE_THREADLOCAL; với @Async cần DelegatingSecurityContextExecutor để truyền ngữ cảnh.',
        en: 'The authentication model: an Authentication has a principal (often UserDetails or a Jwt), credentials (usually erased after authentication) and authorities (GrantedAuthority such as ROLE_ADMIN or SCOPE_orders.read). ProviderManager tries each AuthenticationProvider in turn; if none supports the token it throws ProviderNotFoundException. SecurityContextHolder defaults to MODE_THREADLOCAL; @Async needs a DelegatingSecurityContextExecutor to carry the context.'
      },
      {
        vi: 'OAuth2: Resource Server chỉ cần issuer-uri để kiểm tra chữ ký (qua JWKS), iss, exp, nbf (clock skew 60 giây); scope được map thành authority SCOPE_*; audience KHÔNG được kiểm tra mặc định — thêm audiences hoặc JwtClaimValidator. OAuth2 Client (oauth2Login) làm Authorization Code + PKCE và lưu token qua OAuth2AuthorizedClientService. Spring Authorization Server là dự án riêng để tự xây IdP khi không dùng Keycloak.',
        en: 'OAuth2: a Resource Server needs only issuer-uri to verify the signature (via JWKS), iss, exp and nbf (60-second clock skew); scopes map to SCOPE_* authorities; the audience is NOT checked by default — add audiences or a JwtClaimValidator. The OAuth2 Client (oauth2Login) runs Authorization Code + PKCE and stores tokens through OAuth2AuthorizedClientService. Spring Authorization Server is a separate project for building your own IdP when Keycloak is not used.'
      },
      {
        vi: 'Method security và kiểm thử: @EnableMethodSecurity bật @PreAuthorize/@PostAuthorize/@PreFilter/@PostFilter (Spring Boot không bật sẵn). Chúng chạy qua AOP proxy nên lời gọi nội bộ trong cùng class (this.cancel()) không đi qua proxy và không được kiểm tra. Kiểm thử bằng MockMvc: .with(jwt().authorities(...)), @WithMockUser, .with(csrf()) — viết test cho từng tổ hợp role × endpoint, kể cả trường hợp phải bị từ chối.',
        en: 'Method security and testing: @EnableMethodSecurity enables @PreAuthorize/@PostAuthorize/@PreFilter/@PostFilter (Spring Boot does not turn it on). They run through AOP proxies, so a call inside the same class (this.cancel()) bypasses the proxy and is not checked. Test with MockMvc: .with(jwt().authorities(...)), @WithMockUser, .with(csrf()) — write tests for every role × endpoint combination, including the ones that must be denied.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Hai chain mà chain catch-all lại có @Order nhỏ hơn: chain /api/** không bao giờ chạy, API dùng nhầm form login.',
        en: 'Two chains where the catch-all has the lower @Order: the /api/** chain never runs and the API uses form login by mistake.'
      },
      {
        vi: 'csrf().disable() cho cả ứng dụng web dùng session cookie "để Postman gọi được".',
        en: 'csrf().disable() for a whole cookie-session web app "so Postman can call it".'
      },
      {
        vi: '@PreAuthorize trên method private hoặc được gọi qua this: không có kiểm tra nào xảy ra.',
        en: '@PreAuthorize on private methods or methods called via this: no check happens at all.'
      },
      {
        vi: 'Đọc SecurityContextHolder trong thread pool riêng và nhận về null hoặc user của request trước.',
        en: 'Reading SecurityContextHolder in a custom thread pool and getting null — or the previous request’s user.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Đường đi của request qua Spring Security',
      en: 'A request’s path through Spring Security'
    },
    description: {
      vi: 'Container → proxy → chain được chọn → filter xác thực → context → phân quyền → controller → method security.',
      en: 'Container → proxy → selected chain → authentication filter → context → authorization → controller → method security.'
    },
    asciiDiagram: `
 Servlet container
   └─ DelegatingFilterProxy ──► FilterChainProxy
        ├─ chain @Order(1) securityMatcher("/api/**")  ◄── POST /api/orders matches → used
        │    SecurityContextHolderFilter → HeaderWriterFilter → BearerTokenAuthenticationFilter
        │        └─ ProviderManager → JwtAuthenticationProvider → JwtDecoder (JWKS, iss, exp)
        │    → SecurityContextHolder.setContext(Authentication{sub, SCOPE_orders.write})
        │    → ExceptionTranslationFilter (401 entry point / 403 access denied)
        │    → AuthorizationFilter (anyRequest().authenticated())
        └─ chain @Order(2) web (formLogin, session, CSRF)   ✗ not reached
   └─ DispatcherServlet → OrderController → [AOP proxy @PreAuthorize] → OrderService.cancel()
`,
    components: [
      {
        name: 'DelegatingFilterProxy',
        role: 'Bridge',
        description: {
          vi: 'Filter servlet uỷ thác cho bean Spring.',
          en: 'A servlet Filter delegating to a Spring bean.'
        }
      },
      {
        name: 'FilterChainProxy',
        role: 'Dispatcher',
        description: {
          vi: 'Chọn SecurityFilterChain đầu tiên khớp request.',
          en: 'Picks the first SecurityFilterChain matching the request.'
        }
      },
      {
        name: 'AuthenticationManager',
        role: 'Authentication',
        description: {
          vi: 'ProviderManager duyệt các AuthenticationProvider.',
          en: 'ProviderManager iterating AuthenticationProviders.'
        }
      },
      {
        name: 'AuthorizationFilter',
        role: 'URL authorization',
        description: {
          vi: 'Quyết định truy cập theo rule authorizeHttpRequests.',
          en: 'Decides access from the authorizeHttpRequests rules.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'select-chain',
      title: {
        vi: 'Proxy chọn chain đầu tiên khớp',
        en: 'The proxy picks the first matching chain'
      },
      phase: 'Dispatch',
      description: {
        vi: 'POST /api/orders khớp securityMatcher("/api/**") của chain @Order(1); chain web không được chạy.',
        en: 'POST /api/orders matches the @Order(1) chain’s securityMatcher("/api/**"); the web chain never runs.'
      },
      systemBehavior: {
        vi: 'FilterChainProxy chỉ gọi đúng một chain cho mỗi request.',
        en: 'FilterChainProxy invokes exactly one chain per request.'
      },
      codeLineMatch: 'securityMatcher("/api/**")'
    },
    {
      id: 'authenticate',
      title: {
        vi: 'Filter xác thực → AuthenticationManager',
        en: 'Authentication filter → AuthenticationManager'
      },
      phase: 'Authenticate',
      description: {
        vi: 'BearerTokenAuthenticationFilter lấy token, ProviderManager giao cho JwtAuthenticationProvider giải mã và kiểm tra.',
        en: 'BearerTokenAuthenticationFilter extracts the token and ProviderManager hands it to JwtAuthenticationProvider to decode and verify.'
      },
      systemBehavior: {
        vi: 'Token sai → AuthenticationException → 401 với WWW-Authenticate.',
        en: 'A bad token → AuthenticationException → 401 with WWW-Authenticate.'
      },
      codeLineMatch: 'rs.jwt(Customizer.withDefaults())'
    },
    {
      id: 'context',
      title: {
        vi: 'SecurityContextHolder giữ Authentication',
        en: 'SecurityContextHolder holds the Authentication'
      },
      phase: 'Context',
      description: {
        vi: 'Authentication đã xác thực (principal = Jwt, authorities = SCOPE_*) được đặt vào ThreadLocal.',
        en: 'The authenticated Authentication (principal = Jwt, authorities = SCOPE_*) is stored in a ThreadLocal.'
      },
      systemBehavior: {
        vi: 'Code bất kỳ trên thread đó đọc được user hiện tại; context bị xoá khi request kết thúc.',
        en: 'Any code on that thread can read the current user; the context is cleared when the request ends.'
      },
      codeLineMatch: 'SecurityContextHolder.getContext().getAuthentication()'
    },
    {
      id: 'authorize',
      title: {
        vi: 'AuthorizationFilter & ExceptionTranslationFilter',
        en: 'AuthorizationFilter & ExceptionTranslationFilter'
      },
      phase: 'Authorize',
      description: {
        vi: 'Rule URL được đánh giá; bị từ chối thì ExceptionTranslationFilter trả 403 (hoặc 401 nếu chưa xác thực).',
        en: 'URL rules are evaluated; on denial ExceptionTranslationFilter returns 403 (or 401 if unauthenticated).'
      },
      systemBehavior: {
        vi: 'Rule được duyệt theo thứ tự khai báo: rule cụ thể phải đứng trước rule chung.',
        en: 'Rules are evaluated in declaration order: specific rules must precede general ones.'
      },
      codeLineMatch: 'requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()'
    },
    {
      id: 'method',
      title: { vi: 'Method security qua AOP proxy', en: 'Method security through an AOP proxy' },
      phase: 'Domain',
      description: {
        vi: '@PreAuthorize kiểm tra scope VÀ chủ sở hữu trước khi OrderService.cancel chạy.',
        en: '@PreAuthorize checks the scope AND the owner before OrderService.cancel runs.'
      },
      systemBehavior: {
        vi: 'Gọi qua this bỏ qua proxy — kiểm tra không xảy ra.',
        en: 'Calls through this bypass the proxy — no check happens.'
      },
      codeLineMatch: "@PreAuthorize(\"hasAuthority('SCOPE_orders.write') and"
    }
  ],

  comparison: {
    title: {
      vi: 'Phân quyền theo URL vs theo method',
      en: 'URL authorization vs method authorization'
    },
    subtitle: {
      vi: 'Hai lớp, hai mức chi tiết',
      en: 'Two layers, two levels of detail'
    },
    options: [
      {
        name: 'authorizeHttpRequests',
        tag: 'URL level',
        role: { vi: 'Rule theo path và method HTTP', en: 'Rules by path and HTTP method' },
        keyMechanism: {
          vi: 'Chạy trong AuthorizationFilter trước khi vào controller; thô nhưng tập trung.',
          en: 'Runs in AuthorizationFilter before the controller; coarse but centralised.'
        },
        configExample:
          '.requestMatchers("/admin/**").hasRole("ADMIN").anyRequest().authenticated()',
        architectureNote: {
          vi: 'Lớp đầu tiên, deny-by-default bằng anyRequest().',
          en: 'The first layer, deny by default with anyRequest().'
        }
      },
      {
        name: '@PreAuthorize',
        tag: 'Method level',
        role: { vi: 'Rule trên service và tham số', en: 'Rules on services and arguments' },
        keyMechanism: {
          vi: 'SpEL thấy tham số và kết quả; phù hợp kiểm tra chủ sở hữu object.',
          en: 'SpEL sees arguments and return values; fits object-ownership checks.'
        },
        configExample: '@PreAuthorize("#order.ownerId == authentication.name")',
        architectureNote: {
          vi: 'Chỉ hiệu lực qua proxy Spring; không áp dụng cho lời gọi nội bộ.',
          en: 'Effective only through Spring proxies; not for internal calls.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Mặc định an toàn: CSRF, header bảo mật, session fixation protection bật sẵn.',
        en: 'Secure defaults: CSRF, security headers and session-fixation protection out of the box.'
      },
      {
        vi: 'Kiến trúc mở rộng được: thêm filter, provider, chain riêng cho từng phần ứng dụng.',
        en: 'An extensible architecture: add filters, providers and per-area chains.'
      }
    ],
    cons: [
      {
        vi: 'Nhiều lớp trừu tượng; lỗi cấu hình khó thấy nếu không bật TRACE log.',
        en: 'Many abstractions; configuration mistakes are hard to see without TRACE logs.'
      },
      {
        vi: 'Đổi version lớn (6 → 7) có thay đổi API cần migrate.',
        en: 'Major version changes (6 → 7) bring API changes to migrate.'
      }
    ],
    balance: {
      vi: 'Dùng DSL chuẩn và mặc định của framework, tách chain theo loại client, và biến mỗi quy tắc bảo mật thành test tự động.',
      en: 'Use the standard DSL and framework defaults, split chains by client type, and turn every security rule into an automated test.'
    },
    invariant: {
      vi: 'Mỗi request đi qua đúng một SecurityFilterChain, và authentication luôn hoàn tất trước khi authorization được đánh giá.',
      en: 'Every request passes through exactly one SecurityFilterChain, and authentication always completes before authorization is evaluated.'
    }
  },

  code: [
    {
      label: 'SecurityConfig.java',
      filename: 'SecurityConfig.java',
      language: 'java',
      code: `@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {

    // Chain 1: stateless API — first match wins, so it must be ordered first
    @Bean
    @Order(1)
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/api/**")
            .oauth2ResourceServer(rs -> rs.jwt(Customizer.withDefaults()))   // BearerTokenAuthenticationFilter
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(csrf -> csrf.disable())                 // no cookie-based auth on this chain
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .anyRequest().authenticated())
            .build();
    }

    // Chain 2: browser app — catch-all, ordered last
    @Bean
    @Order(2)
    SecurityFilterChain web(HttpSecurity http) throws Exception {
        return http
            .formLogin(Customizer.withDefaults())         // UsernamePasswordAuthenticationFilter
            .authorizeHttpRequests(a -> a.anyRequest().authenticated())
            .build();
    }

    @Bean
    UserDetailsService users(UserRepository repo) {      // used by DaoAuthenticationProvider
        return username -> repo.findByEmail(username)
            .map(u -> User.withUsername(u.email()).password(u.passwordHash()).roles(u.roles()).build())
            .orElseThrow(() -> new UsernameNotFoundException(username));
    }
}

@Service
class OrderService {
    @PreAuthorize("hasAuthority('SCOPE_orders.write') and #order.ownerId == authentication.name")
    public void cancel(Order order) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        audit.record(auth.getName(), "order.cancel", order.id());
    }
}`
    },
    {
      label: 'OrderSecurityTest.java',
      filename: 'OrderSecurityTest.java',
      language: 'java',
      code: `@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)
class OrderSecurityTest {

    @Autowired MockMvc mvc;

    @Test
    void anonymousIsRejectedWith401() throws Exception {
        mvc.perform(post("/api/orders/7/cancel")).andExpect(status().isUnauthorized());
    }

    @Test
    void missingScopeIsRejectedWith403() throws Exception {
        mvc.perform(post("/api/orders/7/cancel")
                .with(jwt().authorities(new SimpleGrantedAuthority("SCOPE_orders.read"))))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser
    void webFormNeedsCsrfToken() throws Exception {
        mvc.perform(post("/profile")).andExpect(status().isForbidden());
        mvc.perform(post("/profile").with(csrf())).andExpect(status().is3xxRedirection());
    }
}`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Mô tả đường đi của một request qua Spring Security tới controller.',
        en: 'Describe a request’s path through Spring Security to the controller.'
      },
      answer: {
        vi: 'Container gọi DelegatingFilterProxy, proxy uỷ thác cho FilterChainProxy. FilterChainProxy chọn SecurityFilterChain đầu tiên khớp request và chạy các filter: nạp context, ghi header, CSRF, filter xác thực (gọi AuthenticationManager → ProviderManager → AuthenticationProvider), đặt Authentication vào SecurityContextHolder, ExceptionTranslationFilter, rồi AuthorizationFilter. Qua hết mới tới DispatcherServlet và controller; method security chạy thêm ở proxy của service.',
        en: 'The container calls DelegatingFilterProxy, which delegates to FilterChainProxy. FilterChainProxy picks the first SecurityFilterChain matching the request and runs its filters: load the context, write headers, CSRF, the authentication filter (AuthenticationManager → ProviderManager → AuthenticationProvider), store the Authentication in SecurityContextHolder, ExceptionTranslationFilter, then AuthorizationFilter. Only then does the request reach DispatcherServlet and the controller; method security runs additionally at the service proxy.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: '@PreAuthorize trên method không có tác dụng. Những nguyên nhân có thể?',
        en: '@PreAuthorize on a method has no effect. What could cause it?'
      },
      answer: {
        vi: 'Chưa có @EnableMethodSecurity (Spring Boot không bật sẵn); method được gọi từ chính class đó qua this nên không đi qua AOP proxy; method private/final hoặc class không phải bean Spring; hoặc annotation ở interface/implementation không được proxy nhận. Kiểm chứng bằng test gọi qua bean và mong đợi AccessDeniedException.',
        en: 'No @EnableMethodSecurity (Spring Boot does not enable it); the method is called from the same class via this, bypassing the AOP proxy; the method is private/final or the class is not a Spring bean; or the annotation sits where the proxy does not see it. Verify with a test that calls through the bean and expects an AccessDeniedException.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Khi nào tắt CSRF là đúng?',
        en: 'When is disabling CSRF correct?'
      },
      answer: {
        vi: 'Khi chain đó không có xác thực tự động do trình duyệt đính kèm — ví dụ API stateless chỉ nhận Authorization: Bearer, không dùng cookie phiên. Nếu ứng dụng dùng cookie để xác thực (kể cả cookie chứa JWT) thì phải giữ CSRF. Đó là lý do nên tách chain /api/** riêng thay vì tắt CSRF toàn cục.',
        en: 'When that chain has no authentication the browser attaches automatically — e.g. a stateless API accepting only Authorization: Bearer, with no session cookie. If the app authenticates with cookies (even cookies holding a JWT), keep CSRF. That is why you split out an /api/** chain instead of disabling CSRF globally.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.springArchitecture,
    SECURITY_CITATIONS.springAuthArchitecture,
    SECURITY_CITATIONS.springMethodSecurity,
    SECURITY_CITATIONS.springResourceServer,
    SECURITY_CITATIONS.springTesting
  ]
};
