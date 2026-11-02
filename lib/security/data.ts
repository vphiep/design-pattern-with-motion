import type { CourseDefinition } from '../courses/types';
import { getCourseTopic } from '../courses/helpers';
import { ALL_SECURITY_TOPICS } from './content';
import type { SecurityCategory, SecurityTopic } from './types';

export const SECURITY_COURSE: CourseDefinition<SecurityCategory> = {
  id: 'system-security',
  basePath: '/security',
  name: 'Security, OAuth 2.0 & Auth',
  accent: 'rose',
  shortLabel: { vi: 'SECURITY · TỔNG QUAN', en: 'SECURITY OVERVIEW' },
  hero: {
    eyebrow: {
      vi: 'SEC-01 → SEC-16 · TỪ CIA TRIAD TỚI ZERO TRUST',
      en: 'SEC-01 → SEC-16 · FROM THE CIA TRIAD TO ZERO TRUST'
    },
    title: {
      vi: 'Xác thực & Uỷ quyền: Từng Bước Bắt Tay, Từng Chữ Ký',
      en: 'Authentication & Authorization: Every Handshake, Every Signature'
    },
    subtitle: {
      vi: '16 bài theo 5 cấp độ: CIA triad và mật mã học, TLS, session/cookie/token, RBAC/ABAC/ReBAC, mật khẩu và MFA, OAuth 2.0 + PKCE, JWT, OpenID Connect, OWASP Top 10, XSS/CSRF/CORS/CSP, API security, Keycloak/SSO, Zero Trust cho microservices và Spring Security internals.',
      en: '16 lessons across 5 levels: the CIA triad and cryptography, TLS, sessions/cookies/tokens, RBAC/ABAC/ReBAC, passwords and MFA, OAuth 2.0 + PKCE, JWT, OpenID Connect, the OWASP Top 10, XSS/CSRF/CORS/CSP, API security, Keycloak/SSO, Zero Trust for microservices and Spring Security internals.'
    }
  },
  pillarsHeading: {
    vi: '4 CÂU HỎI CỦA MỌI HỆ THỐNG AUTH',
    en: '4 QUESTIONS EVERY AUTH SYSTEM ANSWERS'
  },
  pillars: [
    {
      tag: 'AuthN',
      title: { vi: 'Bạn là ai?', en: 'Who are you?' },
      text: {
        vi: 'Mật khẩu + MFA, phiên, ID Token của OIDC.',
        en: 'Passwords + MFA, sessions, OIDC ID Tokens.'
      }
    },
    {
      tag: 'AuthZ',
      title: { vi: 'Được làm gì?', en: 'What may you do?' },
      text: {
        vi: 'OAuth scope, audience, policy theo danh tính.',
        en: 'OAuth scopes, audiences, identity-based policy.'
      }
    },
    {
      tag: 'Integrity',
      title: { vi: 'Có bị giả mạo?', en: 'Was it tampered with?' },
      text: {
        vi: 'Chữ ký JWS, CertificateVerify, Finished MAC.',
        en: 'JWS signatures, CertificateVerify, Finished MACs.'
      }
    },
    {
      tag: 'Possession',
      title: { vi: 'Ai đang cầm?', en: 'Who is holding it?' },
      text: {
        vi: 'PKCE verifier, DPoP proof, mTLS client cert.',
        en: 'PKCE verifiers, DPoP proofs, mTLS client certs.'
      }
    }
  ],
  categories: {
    'sec-fundamentals': {
      label: { vi: 'Security Fundamentals', en: 'Security Fundamentals' },
      chapter: 'Cấp độ 1',
      description: {
        vi: 'CIA triad, threat modeling, mật mã học (mã hoá, hash, chữ ký) và TLS/HTTPS.',
        en: 'The CIA triad, threat modeling, cryptography (encryption, hashing, signatures) and TLS/HTTPS.'
      }
    },
    'sec-authn-authz': {
      label: { vi: 'Authentication & Authorization', en: 'Authentication & Authorization' },
      chapter: 'Cấp độ 2',
      description: {
        vi: 'Session, cookie và token; RBAC, ABAC, ReBAC; bảo mật mật khẩu và MFA.',
        en: 'Sessions, cookies and tokens; RBAC, ABAC, ReBAC; password security and MFA.'
      }
    },
    'sec-oauth-jwt-oidc': {
      label: { vi: 'OAuth 2.0, JWT & OIDC', en: 'OAuth 2.0, JWT & OIDC' },
      chapter: 'Cấp độ 3',
      description: {
        vi: 'Kiến trúc OAuth 2.0, các flow và PKCE, xác minh JWT, OpenID Connect và federation.',
        en: 'OAuth 2.0 architecture, flows and PKCE, JWT validation, OpenID Connect and federation.'
      }
    },
    'sec-appsec': {
      label: { vi: 'Application Security', en: 'Application Security' },
      chapter: 'Cấp độ 4',
      description: {
        vi: 'OWASP Top 10, bảo mật trình duyệt (XSS, CSRF, CORS, CSP) và API security.',
        en: 'The OWASP Top 10, browser security (XSS, CSRF, CORS, CSP) and API security.'
      }
    },
    'sec-enterprise': {
      label: { vi: 'Enterprise & Distributed Security', en: 'Enterprise & Distributed Security' },
      chapter: 'Cấp độ 5',
      description: {
        vi: 'IAM với Keycloak/SSO/LDAP, bảo mật microservices & Zero Trust, Spring Security internals.',
        en: 'IAM with Keycloak/SSO/LDAP, microservices security & Zero Trust, Spring Security internals.'
      }
    }
  },
  labels: {
    systemBehavior: { vi: 'Hành vi IdP / Server', en: 'IdP / Server behaviour' },
    architecture: { vi: 'Luồng giao thức & Thành phần', en: 'Protocol Flow & Components' },
    code: { vi: 'Hiện thực & Cấu hình', en: 'Implementation & Configuration' },
    codeSubtitle: {
      vi: 'Spring Security 6, TypeScript và HTTP request mẫu chuẩn RFC',
      en: 'Spring Security 6, TypeScript and RFC-accurate HTTP requests'
    },
    balance: { vi: 'Bảo mật vs Trải nghiệm', en: 'Security vs Usability' },
    invariant: { vi: 'Bất biến bảo mật', en: 'Security invariant' }
  },
  topics: ALL_SECURITY_TOPICS
};

export function getSecurityTopicById(id: string): SecurityTopic | undefined {
  return getCourseTopic(SECURITY_COURSE, id);
}
