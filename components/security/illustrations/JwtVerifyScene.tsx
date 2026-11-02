'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const ROSE = '#f43f5e';
const VIOLET = '#8b5cf6';
const CYAN = '#06b6d4';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';

const CLAIMS = [
  ['iss', '== https://idp.example.com'],
  ['aud', '∋ "orders-api"'],
  ['exp', 'now < exp + 60s'],
  ['scope', '∋ "orders:read"']
];

export function JwtVerifyScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      // step-0: split + decode
      tl.addLabel('step-0');
      tl.from('.jw-token', { opacity: 0, y: -8, duration: 0.35 });
      tl.to('.jw-seg-h', { x: -12, duration: 0.35 });
      tl.to('.jw-seg-s', { x: 12, duration: 0.35 }, '<');
      tl.from('.jw-decoded', { opacity: 0, y: 10, stagger: 0.15, duration: 0.35 });
      tl.to({}, { duration: 0.6 });

      // step-1: kid → JWKS, algorithm pinned per key
      tl.addLabel('step-1');
      tl.from('.jw-jwks', { opacity: 0, x: 12, duration: 0.35 });
      tl.to('.jw-kid-link', { strokeDashoffset: 0, duration: 0.5 });
      tl.to('.jw-key-match rect', { stroke: EMERALD, strokeWidth: 2, duration: 0.3 });
      tl.from('.jw-reject-alg', {
        opacity: 0,
        scale: 0.8,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-2: signature verification
      tl.addLabel('step-2');
      tl.from('.jw-verify', { opacity: 0, duration: 0.35 });
      tl.from('.jw-tamper', { opacity: 0, x: -8, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-3: claims → decision
      tl.addLabel('step-3');
      tl.from('.jw-claim', { opacity: 0, x: -8, stagger: 0.18, duration: 0.3 });
      tl.from('.jw-ok', { opacity: 0, scale: 0.7, transformOrigin: '50% 50%', duration: 0.35 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>JWT VERIFICATION PIPELINE · KEY BY kid, ALGORITHM BY KEY</SceneTitle>

      <g className="jw-token" data-step="0">
        <g className="jw-seg-h">
          <Chip
            x={40}
            y={50}
            w={200}
            h={26}
            label="eyJhbGciOiJFUzI1NiIs…"
            accent={ROSE}
            filled
            fontSize={8.5}
          />
        </g>
        <g className="jw-seg-p">
          <Chip
            x={250}
            y={50}
            w={300}
            h={26}
            label=".eyJpc3MiOiJodHRwczovL2lkcC…"
            accent={VIOLET}
            filled
            fontSize={8.5}
          />
        </g>
        <g className="jw-seg-s">
          <Chip
            x={560}
            y={50}
            w={200}
            h={26}
            label=".MEUCIQDx3c9…"
            accent={CYAN}
            filled
            fontSize={8.5}
          />
        </g>
      </g>

      <g className="jw-decoded" data-step="0">
        <Panel x={28} y={92} w={212} h={70} accent={ROSE} title="header (untrusted hint)">
          <text x={12} y={42} fill="var(--text)" fontFamily={MONO} fontSize={9}>
            {'{ "alg": "ES256",'}
          </text>
          <text x={12} y={56} fill="var(--text)" fontFamily={MONO} fontSize={9}>
            {'  "kid": "2026-11" }'}
          </text>
        </Panel>
      </g>
      <g className="jw-decoded" data-step="0,3">
        <Panel
          x={250}
          y={92}
          w={300}
          h={70}
          accent={VIOLET}
          title="payload (base64url — not encrypted)"
        >
          <text x={12} y={42} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
            {'{ iss, sub:"42", aud:["orders-api"],'}
          </text>
          <text x={12} y={56} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
            {'  exp:1730540100, scope:"orders:read" }'}
          </text>
        </Panel>
      </g>
      <g className="jw-decoded" data-step="0,2">
        <Panel x={560} y={92} w={212} h={70} accent={CYAN} title="signature σ">
          <text x={12} y={42} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            ECDSA P-256 over
          </text>
          <text x={12} y={56} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            ASCII(header.payload)
          </text>
        </Panel>
      </g>

      <g className="jw-jwks" data-step="1">
        <Panel
          x={28}
          y={184}
          w={360}
          h={112}
          accent={EMERALD}
          title="trusted JWKS (cached from issuer)"
          subtitle="algorithm is a property of the key"
        >
          <g className="jw-key-match">
            <rect
              x={12}
              y={44}
              width={336}
              height={22}
              rx={4}
              fill="var(--bg)"
              stroke="var(--border)"
            />
            <text x={20} y={59} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              kid 2026-11 · kty EC P-256 · allowed: ES256
            </text>
          </g>
          <rect
            x={12}
            y={72}
            width={336}
            height={22}
            rx={4}
            fill="var(--bg)"
            stroke="var(--border)"
          />
          <text x={20} y={87} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
            kid 2026-08 · kty EC P-256 · allowed: ES256 (retiring)
          </text>
        </Panel>
      </g>
      <path
        className="jw-kid-link"
        d="M 134 162 L 134 228"
        stroke={EMERALD}
        strokeWidth={1.6}
        strokeDasharray="70"
        strokeDashoffset={70}
        fill="none"
      />
      <g className="jw-reject-alg" data-step="1">
        <Chip
          x={28}
          y={306}
          w={360}
          h={24}
          label='header alg "none" / "HS256" for this key → 401 ✗'
          accent={ROSE}
          fontSize={8.5}
        />
      </g>

      <g className="jw-verify" data-step="2">
        <Panel
          x={412}
          y={184}
          w={360}
          h={70}
          accent={CYAN}
          title="Verify(pk[2026-11], header.payload, σ)"
        >
          <text x={12} y={46} fill={EMERALD} fontFamily={MONO} fontSize={10} fontWeight="bold">
            ✓ signature valid
          </text>
          <text x={150} y={46} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
            only the IdP holds the private key
          </text>
        </Panel>
      </g>
      <g className="jw-tamper" data-step="2">
        <Chip
          x={412}
          y={262}
          w={360}
          h={24}
          label='payload edited "scope":"orders:write" → σ mismatch ✗'
          accent={ROSE}
          fontSize={8.5}
        />
      </g>

      <g data-step="3">
        {CLAIMS.map(([k, v], i) => (
          <g key={k} className="jw-claim" transform={`translate(412 ${302 + i * 26})`}>
            <rect
              width={250}
              height={22}
              rx={4}
              fill="var(--bg)"
              stroke={AMBER}
              strokeOpacity={0.7}
            />
            <text x={10} y={15} fill={AMBER} fontFamily={MONO} fontSize={8.5} fontWeight="bold">
              {k}
            </text>
            <text x={58} y={15} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              {v} ✓
            </text>
          </g>
        ))}
        <g className="jw-ok">
          <Chip
            x={672}
            y={340}
            w={100}
            h={30}
            label="200 OK"
            accent={EMERALD}
            filled
            fontSize={11}
          />
        </g>
      </g>

      <text x={28} y={360} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        never: jwt.decode() without verify
      </text>
      <text x={28} y={374} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        never: one HMAC secret shared by N services
      </text>
      <text x={28} y={388} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        TTL 5–15 min + refresh rotation instead of revocation
      </text>
    </SceneBoard>
  );
}
