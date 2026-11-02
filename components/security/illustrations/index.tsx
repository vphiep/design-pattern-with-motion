'use client';

import type { BespokeScene } from '@/components/courses/scene-kit';
import { CryptoPrimitivesScene } from './CryptoPrimitivesScene';
import { TlsHandshakeScene } from './TlsHandshakeScene';
import { AuthzEngineScene } from './AuthzEngineScene';
import { PkceFlowScene } from './PkceFlowScene';
import { JwtVerifyScene } from './JwtVerifyScene';
import { CorsCookieScene } from './CorsCookieScene';
import { ZeroTrustScene } from './ZeroTrustScene';
import { FilterChainScene } from './FilterChainScene';

/** Topics not listed here fall back to the data-driven StepFlowScene. */
export const SECURITY_SCENES: Record<string, BespokeScene> = {
  'cryptography-hashing-signatures': { component: CryptoPrimitivesScene, steps: 4 },
  'tls13-mtls-zero-trust': { component: TlsHandshakeScene, steps: 4 },
  'authorization-rbac-abac-rebac': { component: AuthzEngineScene, steps: 4 },
  'oauth2-authorization-code-pkce': { component: PkceFlowScene, steps: 5 },
  'jwt-validation-rotation': { component: JwtVerifyScene, steps: 4 },
  'browser-security-xss-csrf-cors-csp': { component: CorsCookieScene, steps: 4 },
  'microservices-zero-trust': { component: ZeroTrustScene, steps: 5 },
  'spring-security-internals': { component: FilterChainScene, steps: 5 }
};
