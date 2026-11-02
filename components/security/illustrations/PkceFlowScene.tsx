'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { SceneTitle } from '@/components/courses/scene-kit';
import { Lifeline, Message, SideNote } from '@/components/courses/SequenceKit';

const ROSE = '#f43f5e';
const VIOLET = '#8b5cf6';
const CYAN = '#06b6d4';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';

const CLIENT = 110;
const BROWSER = 300;
const AS = 500;
const RS = 690;

export function PkceFlowScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      const reveal = (sel: string) =>
        tl.from(sel, { opacity: 0, x: -12, duration: 0.4, stagger: 0.25 });

      // step-0: verifier & challenge
      tl.addLabel('step-0');
      reveal('.pk-gen');
      tl.to({}, { duration: 0.7 });

      // step-1: front channel → /authorize
      tl.addLabel('step-1');
      reveal('.pk-authorize');
      tl.to({}, { duration: 0.7 });

      // step-2: login + consent, code comes back with state
      tl.addLabel('step-2');
      reveal('.pk-callback');
      tl.to({}, { duration: 0.7 });

      // step-3: back channel /token with the verifier
      tl.addLabel('step-3');
      reveal('.pk-token');
      tl.from('.pk-attacker', { opacity: 0, duration: 0.35 });
      tl.to({}, { duration: 0.7 });

      // step-4: call the API
      tl.addLabel('step-4');
      reveal('.pk-api');
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>OAUTH 2.0 AUTHORIZATION CODE + PKCE (S256)</SceneTitle>

      <Lifeline
        x={CLIENT}
        top={44}
        bottom={450}
        label="Client app"
        sub="print.app"
        accent={VIOLET}
      />
      <Lifeline
        x={BROWSER}
        top={44}
        bottom={450}
        label="Browser"
        sub="front channel"
        accent="var(--text-muted)"
      />
      <Lifeline
        x={AS}
        top={44}
        bottom={450}
        label="Auth Server"
        sub="auth.example.com"
        accent={ROSE}
      />
      <Lifeline
        x={RS}
        top={44}
        bottom={450}
        label="Resource API"
        sub="photos.example.com"
        accent={CYAN}
      />

      <SideNote
        className="pk-gen"
        step="0"
        x={20}
        y={96}
        width={240}
        accent={VIOLET}
        lines={[
          'verifier  = rand(32 B) → "dBjftJeZ4CVP…"',
          'challenge = b64url(sha256(verifier))',
          '          = "E9Melhoa2Owv…"  + state "Xk2…"'
        ]}
      />

      <Message
        className="pk-authorize"
        step="1"
        from={CLIENT}
        to={BROWSER}
        y={166}
        label="302 redirect"
        accent={VIOLET}
      />
      <Message
        className="pk-authorize"
        step="1"
        from={BROWSER}
        to={AS}
        y={166}
        label="GET /authorize?code_challenge=E9Mel…&S256&state"
        accent={VIOLET}
      />
      <SideNote
        className="pk-authorize"
        step="1"
        x={AS + 8}
        y={176}
        width={180}
        accent={ROSE}
        lines={['redirect_uri exact match ✓', 'store code → challenge']}
      />

      <Message
        className="pk-callback"
        step="2"
        from={AS}
        to={BROWSER}
        y={236}
        label="login + consent → 302 /cb?code=Splx…"
        accent={ROSE}
      />
      <Message
        className="pk-callback"
        step="2"
        from={BROWSER}
        to={CLIENT}
        y={236}
        label="code + state"
        accent={ROSE}
      />
      <SideNote
        className="pk-callback"
        step="2"
        x={20}
        y={246}
        width={150}
        accent={EMERALD}
        lines={['state == session ✓']}
      />

      <Message
        className="pk-token"
        step="3"
        from={CLIENT}
        to={AS}
        y={300}
        label="POST /token  code + code_verifier  (TLS back channel)"
        accent={AMBER}
      />
      <SideNote
        className="pk-token"
        step="3"
        x={AS + 8}
        y={308}
        width={180}
        accent={EMERALD}
        lines={['sha256(verifier) == challenge ✓', 'code marked used']}
      />
      <Message
        className="pk-token"
        step="3"
        from={AS}
        to={CLIENT}
        y={352}
        label="{ access_token, refresh_token, expires_in: 300 }"
        accent={EMERALD}
        dashed
      />
      <SideNote
        className="pk-attacker"
        step="3"
        x={BROWSER - 110}
        y={310}
        width={236}
        accent={ROSE}
        lines={['stolen code w/o verifier → invalid_grant ✗']}
      />

      <Message
        className="pk-api"
        step="4"
        from={CLIENT}
        to={RS}
        y={400}
        label="GET /v1/albums   Authorization: Bearer eyJ…"
        accent={CYAN}
      />
      <SideNote
        className="pk-api"
        step="4"
        x={RS - 90}
        y={410}
        width={176}
        accent={CYAN}
        lines={['sig ✓ aud ✓ scope ✓ → 200']}
      />
    </SceneBoard>
  );
}
