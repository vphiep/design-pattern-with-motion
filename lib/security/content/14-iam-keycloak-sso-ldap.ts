import type { SecurityTopic } from '../types';
import { SECURITY_CITATIONS } from '../citations';

export const iamKeycloakTopic: SecurityTopic = {
  id: 'iam-keycloak-sso-ldap',
  roadmapId: 'SEC-14',
  category: 'sec-enterprise',
  level: 'advanced',
  chapter: 'Cấp độ 5',
  name: 'IAM, Keycloak, SSO & LDAP',
  tagline: {
    vi: 'Identity and Access Management với Keycloak: realm, client, user, realm role vs client role, group; SSO qua OIDC và SAML 2.0; user federation từ LDAP/Active Directory; identity brokering tới Google hay IdP đối tác; SSO session idle/max và single logout.',
    en: 'Identity and Access Management with Keycloak: realms, clients, users, realm roles vs client roles, groups; SSO via OIDC and SAML 2.0; user federation from LDAP/Active Directory; identity brokering to Google or partner IdPs; SSO session idle/max timeouts and single logout.'
  },
  difficulty: 3,
  order: 14,
  estimatedMinutes: 25,

  coreTheory: {
    problemStatement: {
      vi: 'Công ty có 12 ứng dụng nội bộ, mỗi app một bảng users, một form đăng nhập, một chính sách mật khẩu. Nhân viên nghỉ việc thì phải xoá tay ở 12 nơi (và luôn sót một nơi); MFA chỉ có ở 2 app; đối tác cần truy cập portal nhưng không có tài khoản AD; còn audit "ai có quyền gì" mất cả tuần.',
      en: 'A company runs 12 internal apps, each with its own users table, login form and password policy. When someone leaves, accounts are deleted by hand in 12 places (one is always missed); only 2 apps have MFA; partners need the portal but have no AD accounts; and auditing "who can do what" takes a week.'
    },
    hardwareConstraint: {
      vi: 'Danh tính gốc đã nằm ở nơi khác (Active Directory, Google Workspace, IdP của đối tác) và không thể di chuyển. Mỗi ứng dụng lại nói một giao thức (OIDC, SAML, LDAP bind) và có vòng đời phiên riêng.',
      en: 'The source of identity already lives elsewhere (Active Directory, Google Workspace, partner IdPs) and cannot be moved. Every app speaks its own protocol (OIDC, SAML, LDAP bind) with its own session lifecycle.'
    },
    fundamentalSolution: {
      vi: 'Đặt một Identity Provider trung tâm (Keycloak) làm nơi duy nhất xác thực. Realm cô lập một tập user, role, client (không tạo user ở realm master). Mỗi ứng dụng là một client OIDC hoặc SAML và chỉ tin token/assertion do realm phát hành. User đến từ LDAP/AD qua user federation (mật khẩu vẫn được kiểm tra ở LDAP), hoặc từ IdP ngoài qua identity brokering. Role gán qua group (người trong group kế thừa role và attribute) để khi user đổi phòng ban chỉ cần đổi group. Một lần đăng nhập tạo SSO session dùng cho mọi app; logout tập trung kết thúc phiên ở tất cả.',
      en: 'Put one central Identity Provider (Keycloak) in charge of authentication. A realm isolates a set of users, roles and clients (do not create users in the master realm). Every app is an OIDC or SAML client trusting only tokens/assertions from the realm. Users come from LDAP/AD through user federation (passwords are still checked by LDAP) or from external IdPs through identity brokering. Roles are assigned through groups (members inherit roles and attributes) so a department change is just a group change. One login creates an SSO session used by every app; central logout ends it everywhere.'
    },
    math: {
      formula: String.raw`\text{SSO valid}(t) \iff \big(t - t_{\text{last activity}} < T_{\text{idle}}\big) \;\wedge\; \big(t - t_{\text{login}} < T_{\text{max}}\big)`,
      description: {
        vi: 'Phiên SSO sống khi người dùng còn hoạt động trong khoảng SSO Session Idle và chưa vượt SSO Session Max kể từ lần đăng nhập. Ví dụ idle 30 phút, max 10 giờ: dùng liên tục cả ngày vẫn phải đăng nhập lại sau 10 giờ; bỏ máy 30 phút là phải đăng nhập lại. Offline session (refresh token offline) có cấu hình idle/max riêng.',
        en: 'An SSO session lives while the user stays active within SSO Session Idle and has not exceeded SSO Session Max since login. With idle 30 minutes and max 10 hours, continuous use still requires a new login after 10 hours; walking away for 30 minutes does too. Offline sessions (offline refresh tokens) have their own idle/max settings.'
      },
      timeComplexity: 'One interactive login per SSO session for N apps (instead of N)',
      spaceComplexity: 'One SSO session + one client session per app the user touched'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'IAM gồm ba câu hỏi vòng đời: ai tồn tại (provisioning/deprovisioning), họ chứng minh danh tính thế nào (authentication, SSO, MFA), và họ được làm gì (role, group, policy) — Keycloak là một hiện thực mã nguồn mở của cả ba.',
      en: 'IAM covers three lifecycle questions: who exists (provisioning/deprovisioning), how they prove identity (authentication, SSO, MFA), and what they may do (roles, groups, policies) — Keycloak is an open-source implementation of all three.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Khái niệm Keycloak: realm là không gian cô lập quản lý user, credential, role, group; realm master chỉ dùng để tạo các realm khác. Client là ứng dụng yêu cầu Keycloak xác thực người dùng. Realm role là role toàn realm; client role nằm trong namespace của một client (shop-web: orders.approve). Composite role chứa role khác. Group gom user, mang role mapping và attribute, và subgroup kế thừa từ group cha. Client scope là gói cấu hình tái sử dụng quyết định claim nào vào token.',
        en: 'Keycloak concepts: a realm is an isolated space managing users, credentials, roles and groups; the master realm is only for creating other realms. A client is an app asking Keycloak to authenticate users. Realm roles are realm-wide; client roles live in a client’s namespace (shop-web: orders.approve). Composite roles contain other roles. Groups bundle users, carry role mappings and attributes, and subgroups inherit from their parent. Client scopes are reusable configuration deciding which claims go into tokens.'
      },
      {
        vi: 'SAML 2.0 vs OAuth 2.0 vs OIDC: SAML là giao thức SSO dựa trên XML assertion có chữ ký, phổ biến trong doanh nghiệp và SaaS cũ, chủ yếu cho ứng dụng web qua trình duyệt. OAuth 2.0 là framework uỷ quyền cho API. OIDC thêm lớp danh tính lên OAuth bằng ID Token JSON, phù hợp cả web, mobile, SPA. Keycloak nói được cả OIDC và SAML, nên ứng dụng cũ dùng SAML và ứng dụng mới dùng OIDC cùng chia sẻ một SSO session.',
        en: 'SAML 2.0 vs OAuth 2.0 vs OIDC: SAML is an SSO protocol based on signed XML assertions, common in enterprises and older SaaS, mainly for browser-based web apps. OAuth 2.0 is an authorization framework for APIs. OIDC adds an identity layer on top of OAuth with a JSON ID Token, suiting web, mobile and SPAs alike. Keycloak speaks both OIDC and SAML, so legacy SAML apps and new OIDC apps share one SSO session.'
      },
      {
        vi: 'User federation với LDAP/AD: Keycloak tra cứu user trong LDAP khi đăng nhập; với Import Users bật, user được copy vào DB của Keycloak nhưng mật khẩu không bao giờ được import — việc kiểm tra vẫn diễn ra ở LDAP. Edit mode READ_ONLY (không sửa được từ Keycloak), WRITABLE (sửa đồng bộ ngược về LDAP) hoặc UNSYNCED (lưu cục bộ). Mapper ánh xạ attribute, group và role từ LDAP; đồng bộ toàn bộ một lần lúc đầu rồi đồng bộ thay đổi định kỳ.',
        en: 'User federation with LDAP/AD: Keycloak looks users up in LDAP at login; with Import Users on, users are copied into Keycloak’s DB but passwords are never imported — validation still happens in LDAP. Edit mode is READ_ONLY (no changes from Keycloak), WRITABLE (changes sync back to LDAP) or UNSYNCED (stored locally). Mappers translate LDAP attributes, groups and roles; run one full sync at setup, then periodic changed-user syncs.'
      },
      {
        vi: 'Identity brokering và phiên: Keycloak có thể uỷ thác việc xác thực cho IdP ngoài (OIDC, SAML 2.0, Google, GitHub…); lần đầu user đến từ IdP ngoài, first broker login flow quyết định tạo user mới hay liên kết với tài khoản sẵn có. Ứng dụng chỉ thấy token của realm — đổi IdP phía sau không ảnh hưởng ứng dụng. SSO Session Idle/Max và Client Session Idle/Max kiểm soát thời gian phiên; logout OIDC (front-channel/back-channel) thông báo cho các client để kết thúc phiên của chúng.',
        en: 'Identity brokering and sessions: Keycloak can delegate authentication to external IdPs (OIDC, SAML 2.0, Google, GitHub…); the first time a user arrives from one, the first broker login flow decides whether to create a new user or link an existing account. Apps only ever see the realm’s tokens — swapping the IdP behind it does not affect them. SSO Session Idle/Max and Client Session Idle/Max bound session lifetimes; OIDC logout (front-channel/back-channel) notifies clients so they end their own sessions.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Tạo user và client nghiệp vụ trong realm master: admin của ứng dụng có thể chạm tới quyền quản trị toàn Keycloak.',
        en: 'Creating business users and clients in the master realm: app admins get close to Keycloak-wide administration.'
      },
      {
        vi: 'Gán role trực tiếp cho từng user thay vì qua group: không ai audit nổi, và người đổi phòng ban giữ quyền cũ.',
        en: 'Assigning roles directly to each user instead of via groups: nobody can audit it, and people who change departments keep old rights.'
      },
      {
        vi: 'Tự động liên kết tài khoản theo email từ IdP ngoài chưa xác minh email: kẻ tấn công đăng ký email của nạn nhân ở IdP khác và chiếm tài khoản.',
        en: 'Automatically linking accounts by email from an external IdP that does not verify emails: an attacker registers the victim’s email elsewhere and takes over the account.'
      },
      {
        vi: 'Mỗi ứng dụng tự giữ phiên dài hạn riêng: logout ở Keycloak không thực sự đăng xuất người dùng khỏi ứng dụng.',
        en: 'Each app keeping its own long-lived session: logging out of Keycloak does not really log the user out of the apps.'
      }
    ]
  },

  physicalArchitecture: {
    title: { vi: 'Keycloak làm IdP trung tâm', en: 'Keycloak as the central IdP' },
    description: {
      vi: 'Danh tính đến từ LDAP và IdP ngoài; ứng dụng chỉ tin realm.',
      en: 'Identities come from LDAP and external IdPs; applications trust only the realm.'
    },
    asciiDiagram: `
   Active Directory ──LDAPS (federation, READ_ONLY)──┐        Google / partner SAML IdP
                                                     ▼              │ identity brokering
                         ┌─────────────── Keycloak realm "shop" ◄───┘ (first broker login)
                         │ users · groups(finance → role manager) · realm + client roles
                         │ SSO session: idle 30m, max 10h · MFA policy · password policy
                         │ /realms/shop/.well-known/openid-configuration
                         └──────┬──────────────┬───────────────┬──────────
                        OIDC    │       OIDC   │        SAML 2.0│
                     shop-web (BFF)   admin-console (SPA+PKCE)   legacy-hr (SAML SP)
                     one login → all three; logout → back-channel logout to each client
`,
    components: [
      {
        name: 'Realm',
        role: 'Isolation',
        description: {
          vi: 'Tập user, role, client, chính sách riêng biệt.',
          en: 'A separate set of users, roles, clients and policies.'
        }
      },
      {
        name: 'Client',
        role: 'Application',
        description: {
          vi: 'Ứng dụng OIDC hoặc SAML tin vào realm.',
          en: 'An OIDC or SAML application trusting the realm.'
        }
      },
      {
        name: 'Groups & roles',
        role: 'Authorization data',
        description: {
          vi: 'Realm/client role gán qua group; group truyền role và attribute.',
          en: 'Realm/client roles assigned via groups, which pass roles and attributes down.'
        }
      },
      {
        name: 'Federation & brokering',
        role: 'Identity sources',
        description: {
          vi: 'LDAP/AD cho nhân viên, IdP ngoài cho đối tác và social login.',
          en: 'LDAP/AD for employees, external IdPs for partners and social login.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'realm',
      title: { vi: 'Tạo realm riêng cho tổ chức', en: 'Create a realm for the organisation' },
      phase: 'Tenant',
      description: {
        vi: 'Realm shop với chính sách phiên, mật khẩu, MFA riêng; master chỉ để quản trị.',
        en: 'Realm shop with its own session, password and MFA policy; master is for administration only.'
      },
      systemBehavior: {
        vi: 'Mọi endpoint OIDC nằm dưới /realms/shop/protocol/openid-connect.',
        en: 'Every OIDC endpoint lives under /realms/shop/protocol/openid-connect.'
      },
      codeLineMatch: '"realm": "shop"'
    },
    {
      id: 'client',
      title: { vi: 'Đăng ký client OIDC', en: 'Register an OIDC client' },
      phase: 'Applications',
      description: {
        vi: 'shop-web là confidential client, redirect URI chính xác, bật PKCE S256.',
        en: 'shop-web is a confidential client with an exact redirect URI and S256 PKCE.'
      },
      systemBehavior: {
        vi: 'Client chỉ nhận token có aud và role liên quan tới nó.',
        en: 'The client only receives tokens with its own audience and relevant roles.'
      },
      codeLineMatch: '"clientId": "shop-web"'
    },
    {
      id: 'groups',
      title: { vi: 'Role qua group', en: 'Roles via groups' },
      phase: 'Authorization',
      description: {
        vi: 'Group finance mang realm role manager và client role orders.approve.',
        en: 'The finance group carries the realm role manager and the client role orders.approve.'
      },
      systemBehavior: {
        vi: 'User vào group là nhận role; rời group là mất role.',
        en: 'Joining the group grants the roles; leaving removes them.'
      },
      codeLineMatch: '"groups": ['
    },
    {
      id: 'ldap',
      title: { vi: 'Federation từ Active Directory', en: 'Federation from Active Directory' },
      phase: 'Identity source',
      description: {
        vi: 'Nhân viên đăng nhập bằng tài khoản AD; mật khẩu kiểm tra ở AD, chế độ READ_ONLY.',
        en: 'Employees log in with AD accounts; passwords are checked by AD in READ_ONLY mode.'
      },
      systemBehavior: {
        vi: 'Vô hiệu hoá trong AD là mất quyền truy cập mọi ứng dụng.',
        en: 'Disabling the account in AD removes access to every app.'
      },
      codeLineMatch: '"providerId": "ldap"'
    },
    {
      id: 'broker',
      title: { vi: 'Brokering tới IdP ngoài', en: 'Brokering to external IdPs' },
      phase: 'Federation',
      description: {
        vi: 'Đối tác đăng nhập qua SAML IdP của họ, khách hàng qua Google; ứng dụng vẫn chỉ thấy token của realm.',
        en: 'Partners log in through their SAML IdP and customers through Google; apps still see only realm tokens.'
      },
      systemBehavior: {
        vi: 'First broker login flow quyết định tạo mới hay liên kết tài khoản.',
        en: 'The first broker login flow decides whether to create or link an account.'
      },
      codeLineMatch: '"identityProviders": ['
    }
  ],

  comparison: {
    title: { vi: 'SAML 2.0 vs OAuth 2.0 vs OIDC', en: 'SAML 2.0 vs OAuth 2.0 vs OIDC' },
    subtitle: {
      vi: 'Ba giao thức thường gặp trong IAM doanh nghiệp',
      en: 'The three protocols you meet in enterprise IAM'
    },
    options: [
      {
        name: 'SAML 2.0',
        tag: 'XML · SSO',
        role: { vi: 'SSO web doanh nghiệp', en: 'Enterprise web SSO' },
        keyMechanism: {
          vi: 'Assertion XML có chữ ký đi qua trình duyệt (POST/Redirect binding).',
          en: 'Signed XML assertions carried through the browser (POST/Redirect bindings).'
        },
        configExample: 'SP metadata + IdP metadata exchange',
        architectureNote: {
          vi: 'Phổ biến ở SaaS và hệ thống cũ; không hợp cho API và mobile.',
          en: 'Common in SaaS and legacy systems; a poor fit for APIs and mobile.'
        }
      },
      {
        name: 'OAuth 2.0',
        tag: 'Authorization',
        role: { vi: 'Uỷ quyền truy cập API', en: 'Delegated API access' },
        keyMechanism: {
          vi: 'Access token có scope cho Resource Server; không định nghĩa danh tính.',
          en: 'Scoped access tokens for Resource Servers; defines no identity.'
        },
        configExample: 'scope=orders.read',
        architectureNote: {
          vi: 'Dùng cho API, M2M, uỷ quyền bên thứ ba.',
          en: 'For APIs, M2M and third-party delegation.'
        }
      },
      {
        name: 'OpenID Connect',
        tag: 'JSON · identity',
        role: { vi: 'Danh tính trên nền OAuth', en: 'Identity on top of OAuth' },
        keyMechanism: {
          vi: 'ID Token JWT, discovery, JWKS, UserInfo.',
          en: 'JWT ID Tokens, discovery, JWKS, UserInfo.'
        },
        configExample: 'scope=openid profile email',
        architectureNote: {
          vi: 'Mặc định cho ứng dụng mới: web, SPA, mobile.',
          en: 'The default for new apps: web, SPA, mobile.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Một nơi để bật MFA, chính sách mật khẩu và thu hồi quyền cho mọi ứng dụng.',
        en: 'One place to enable MFA, password policy and revocation for every app.'
      },
      {
        vi: 'Người dùng đăng nhập một lần; offboarding một thao tác.',
        en: 'Users log in once; offboarding is a single action.'
      },
      {
        vi: 'Ứng dụng không còn lưu mật khẩu.',
        en: 'Applications no longer store passwords.'
      }
    ],
    cons: [
      {
        vi: 'IdP trở thành điểm lỗi đơn lẻ: cần cluster, backup và kế hoạch sự cố.',
        en: 'The IdP becomes a single point of failure: it needs clustering, backups and an incident plan.'
      },
      {
        vi: 'Chiếm được IdP là chiếm mọi ứng dụng — cần bảo vệ admin console rất chặt.',
        en: 'Compromising the IdP compromises every app — the admin console needs very tight protection.'
      }
    ],
    balance: {
      vi: 'Tập trung xác thực để kiểm soát và audit tốt hơn, đổi lại phải vận hành IdP như hệ thống quan trọng nhất: HA, MFA cho admin, giám sát và nâng cấp đều đặn.',
      en: 'Centralise authentication for better control and audit, at the price of running the IdP as your most critical system: HA, admin MFA, monitoring and regular upgrades.'
    },
    invariant: {
      vi: 'Ứng dụng chỉ chấp nhận danh tính do realm phát hành, và vô hiệu hoá một user tại nguồn sẽ chặn truy cập ở mọi ứng dụng.',
      en: 'Applications accept only identities issued by the realm, and disabling a user at the source blocks access in every app.'
    }
  },

  code: [
    {
      label: 'realm-shop.json',
      filename: 'realm-shop.json',
      language: 'json',
      code: `{
  "realm": "shop",
  "enabled": true,
  "ssoSessionIdleTimeout": 1800,
  "ssoSessionMaxLifespan": 36000,
  "clients": [
    {
      "clientId": "shop-web",
      "protocol": "openid-connect",
      "publicClient": false,
      "standardFlowEnabled": true,
      "redirectUris": ["https://shop.example.com/login/oauth2/code/keycloak"],
      "attributes": { "pkce.code.challenge.method": "S256" }
    }
  ],
  "roles": {
    "realm": [{ "name": "manager" }],
    "client": { "shop-web": [{ "name": "orders.approve" }] }
  },
  "groups": [
    {
      "name": "finance",
      "realmRoles": ["manager"],
      "clientRoles": { "shop-web": ["orders.approve"] },
      "attributes": { "department": ["finance"] }
    }
  ],
  "components": {
    "org.keycloak.storage.UserStorageProvider": [
      {
        "name": "corp-ad",
        "providerId": "ldap",
        "config": {
          "vendor": ["ad"],
          "connectionUrl": ["ldaps://ad.corp.example:636"],
          "usersDn": ["OU=Staff,DC=corp,DC=example"],
          "editMode": ["READ_ONLY"],
          "importEnabled": ["true"]
        }
      }
    ]
  },
  "identityProviders": [
    { "alias": "google", "providerId": "google", "enabled": true,
      "config": { "clientId": "123.apps.googleusercontent.com", "clientSecret": "\${vault.google_secret}" } },
    { "alias": "partner", "providerId": "saml", "enabled": true,
      "config": { "singleSignOnServiceUrl": "https://idp.partner.example/saml/sso" } }
  ]
}`
    },
    {
      label: 'application.yml',
      filename: 'application.yml',
      language: 'yaml',
      code: `# Every Spring app trusts the same realm
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: shop-web
            scope: openid, profile
        provider:
          keycloak:
            issuer-uri: https://sso.example.com/realms/shop
# discovery: https://sso.example.com/realms/shop/.well-known/openid-configuration`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Realm role, client role và group khác nhau thế nào trong Keycloak?',
        en: 'How do realm roles, client roles and groups differ in Keycloak?'
      },
      answer: {
        vi: 'Realm role có phạm vi toàn realm (manager). Client role nằm trong namespace của một client (shop-web: orders.approve) và chỉ có nghĩa với client đó. Group là tập user mang role mapping và attribute; thành viên (và subgroup) kế thừa chúng. Thực hành tốt: gán role cho group, đưa user vào group.',
        en: 'A realm role is realm-wide (manager). A client role lives in one client’s namespace (shop-web: orders.approve) and only means something to that client. A group is a set of users carrying role mappings and attributes; members (and subgroups) inherit them. Good practice: assign roles to groups and put users in groups.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Federation LDAP và identity brokering khác nhau thế nào?',
        en: 'How does LDAP federation differ from identity brokering?'
      },
      answer: {
        vi: 'Federation: Keycloak tự hiển thị form đăng nhập, tra user trong LDAP và nhờ LDAP kiểm tra mật khẩu — user là của Keycloak, nguồn dữ liệu là LDAP. Brokering: Keycloak chuyển người dùng sang IdP khác (OIDC/SAML/social) để xác thực rồi nhận khẳng định trả về, liên kết với user cục bộ qua first broker login. Cả hai đều để ứng dụng chỉ thấy token của realm.',
        en: 'Federation: Keycloak shows its own login form, looks the user up in LDAP and has LDAP check the password — the user is Keycloak’s, LDAP is the data source. Brokering: Keycloak sends the user to another IdP (OIDC/SAML/social) to authenticate and receives an assertion back, linking it to a local user through the first broker login. Either way, apps only see realm tokens.'
      }
    }
  ],

  researchCitations: [
    SECURITY_CITATIONS.keycloakAdmin,
    SECURITY_CITATIONS.keycloakOidc,
    SECURITY_CITATIONS.oidcCore
  ]
};
