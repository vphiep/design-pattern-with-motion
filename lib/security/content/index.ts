import type { SecurityTopic } from '../types';
import { securityFundamentalsCiaTopic } from './01-security-fundamentals-cia';
import { cryptographyHashingSignaturesTopic } from './02-cryptography-hashing-signatures';
import { tls13MtlsZeroTrustTopic } from './03-tls-https-secure-communication';
import { sessionsTokensPasswordsTopic } from './04-sessions-cookies-tokens';
import { authorizationModelsTopic } from './05-authorization-rbac-abac-rebac';
import { passwordSecurityMfaTopic } from './06-password-security-mfa';
import { oauth2ArchitectureTopic } from './07-oauth2-architecture-concepts';
import { oauth2AuthorizationCodePkceTopic } from './08-oauth2-flows-pkce';
import { jwtValidationRotationTopic } from './09-jwt-structure-validation';
import { openidConnectIdTokenTopic } from './10-openid-connect-federation';
import { owaspTop10Topic } from './11-owasp-top10-web-vulnerabilities';
import { browserSecurityTopic } from './12-browser-security-xss-csrf-cors-csp';
import { apiSecurityTopic } from './13-api-security-secure-coding';
import { iamKeycloakTopic } from './14-iam-keycloak-sso-ldap';
import { microservicesZeroTrustTopic } from './15-microservices-zero-trust';
import { springSecurityInternalsTopic } from './16-spring-security-internals';

/** Order follows docs/roadmap-cdc-docker-security-devops.md (SEC-01 → SEC-16). */
export const ALL_SECURITY_TOPICS: SecurityTopic[] = [
  // Cấp độ 1 — Security Fundamentals
  securityFundamentalsCiaTopic,
  cryptographyHashingSignaturesTopic,
  tls13MtlsZeroTrustTopic,

  // Cấp độ 2 — Authentication & Authorization
  sessionsTokensPasswordsTopic,
  authorizationModelsTopic,
  passwordSecurityMfaTopic,

  // Cấp độ 3 — OAuth 2.0, JWT & OIDC
  oauth2ArchitectureTopic,
  oauth2AuthorizationCodePkceTopic,
  jwtValidationRotationTopic,
  openidConnectIdTokenTopic,

  // Cấp độ 4 — Application Security
  owaspTop10Topic,
  browserSecurityTopic,
  apiSecurityTopic,

  // Cấp độ 5 — Enterprise & Distributed Security
  iamKeycloakTopic,
  microservicesZeroTrustTopic,
  springSecurityInternalsTopic
];
