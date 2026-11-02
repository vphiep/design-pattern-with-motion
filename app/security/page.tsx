import { SecurityHub } from '@/components/security/SecurityCourse';

export const metadata = {
  title: 'Security, OAuth 2.0 & Auth — From the CIA Triad to Zero Trust',
  description:
    '16 lessons (SEC-01 → SEC-16): CIA and threat modeling, cryptography, TLS, sessions and tokens, RBAC/ABAC/ReBAC, MFA, OAuth 2.0 + PKCE, JWT, OIDC, the OWASP Top 10, browser and API security, Keycloak SSO, Zero Trust and Spring Security internals.'
};

export default function SecurityPage() {
  return <SecurityHub />;
}
