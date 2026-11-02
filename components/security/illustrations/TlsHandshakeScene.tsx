'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, SceneTitle } from '@/components/courses/scene-kit';
import { Lifeline, Message, SideNote } from '@/components/courses/SequenceKit';

const ROSE = '#f43f5e';
const VIOLET = '#8b5cf6';
const CYAN = '#06b6d4';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';

const C = 170;
const S = 630;

export function TlsHandshakeScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      // step-0: ClientHello with key_share
      tl.addLabel('step-0');
      tl.from('.tls-ch', { opacity: 0, x: -14, duration: 0.45 });
      tl.to({}, { duration: 0.6 });

      // step-1: ServerHello → key schedule → encrypted server flight
      tl.addLabel('step-1');
      tl.from('.tls-sh', { opacity: 0, x: 14, duration: 0.4 });
      tl.from('.tls-keys', { opacity: 0, scale: 0.9, transformOrigin: '50% 50%', duration: 0.35 });
      tl.from('.tls-sflight', { opacity: 0, x: 14, stagger: 0.15, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-2: mutual certificate verification
      tl.addLabel('step-2');
      tl.from('.tls-cverify', { opacity: 0, duration: 0.3 });
      tl.from('.tls-cflight', { opacity: 0, x: -14, stagger: 0.15, duration: 0.3 });
      tl.from('.tls-sverify', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-3: application data + identity-based authorization
      tl.addLabel('step-3');
      tl.from('.tls-app', { opacity: 0, scaleX: 0.2, transformOrigin: '50% 50%', duration: 0.45 });
      tl.from('.tls-authz', { opacity: 0, y: 6, duration: 0.35 });
    }
  });

  const serverFlight = [
    '{EncryptedExtensions}',
    '{CertificateRequest}  ← mTLS',
    '{Certificate: payments SVID}',
    '{CertificateVerify: sig(transcript)}',
    '{Finished: HMAC(transcript)}'
  ];
  const clientFlight = ['{Certificate: orders SVID}', '{CertificateVerify}', '{Finished}'];

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>TLS 1.3 FULL HANDSHAKE (1-RTT) WITH MUTUAL AUTHENTICATION</SceneTitle>

      <Lifeline
        x={C}
        top={40}
        bottom={440}
        label="orders (client)"
        sub="spiffe://corp/ns/shop/sa/orders"
        accent={VIOLET}
      />
      <Lifeline
        x={S}
        top={40}
        bottom={440}
        label="payments (server)"
        sub="spiffe://corp/ns/shop/sa/payments"
        accent={CYAN}
      />

      <Message
        className="tls-ch"
        step="0"
        from={C}
        to={S}
        y={104}
        label="ClientHello · key_share X25519 (aG) · TLS1.3 · SNI"
        accent={VIOLET}
      />
      <Message
        className="tls-sh"
        step="1"
        from={S}
        to={C}
        y={136}
        label="ServerHello · key_share (bG) · TLS_AES_128_GCM_SHA256"
        accent={CYAN}
      />

      <g className="tls-keys" data-step="1">
        <Chip
          x={C + 100}
          y={146}
          w={260}
          h={22}
          label="Z = ECDHE(a, bG) → HKDF → handshake keys 🔒"
          accent={AMBER}
          filled
          fontSize={8}
        />
      </g>

      {serverFlight.map((m, i) => (
        <Message
          key={m}
          className="tls-sflight"
          step="1"
          from={S}
          to={C}
          y={190 + i * 22}
          label={m}
          accent={CYAN}
          dashed
        />
      ))}

      <SideNote
        className="tls-cverify"
        step="2"
        x={14}
        y={208}
        width={140}
        accent={EMERALD}
        lines={['chain → root ✓', 'SAN = …/sa/payments ✓', 'CertVerify ✓ Finished ✓']}
      />
      {clientFlight.map((m, i) => (
        <Message
          key={m}
          className="tls-cflight"
          step="2"
          from={C}
          to={S}
          y={312 + i * 22}
          label={m}
          accent={VIOLET}
          dashed
        />
      ))}
      <SideNote
        className="tls-sverify"
        step="2"
        x={S + 16}
        y={304}
        width={150}
        accent={EMERALD}
        lines={['client SVID ✓', 'SPIFFE bundle ✓']}
      />

      <g className="tls-app" data-step="3">
        <line
          x1={C}
          y1={392}
          x2={S}
          y2={392}
          stroke={EMERALD}
          strokeWidth={4}
          strokeOpacity={0.5}
        />
        <text
          x={(C + S) / 2}
          y={386}
          textAnchor="middle"
          fill={EMERALD}
          fontFamily={MONO}
          fontSize={9}
          fontWeight="bold"
        >
          [Application Data · AES-128-GCM · forward secret]
        </text>
      </g>
      <g className="tls-authz" data-step="3">
        <Chip
          x={C + 40}
          y={404}
          w={380}
          h={24}
          label="AuthorizationPolicy: principal …/sa/orders → POST /charge ✓"
          accent={ROSE}
          fontSize={8.5}
        />
      </g>
    </SceneBoard>
  );
}
