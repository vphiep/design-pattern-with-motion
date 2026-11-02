import type { CourseTopic } from '../courses/types';

/** Roadmap levels 1–5 (docs/roadmap-cdc-docker-security-devops.md, SEC-01 → SEC-16). */
export type SecurityCategory =
  | 'sec-fundamentals'
  | 'sec-authn-authz'
  | 'sec-oauth-jwt-oidc'
  | 'sec-appsec'
  | 'sec-enterprise';

export type SecurityTopic = CourseTopic<SecurityCategory>;
