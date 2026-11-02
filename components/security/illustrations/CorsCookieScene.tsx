'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const ROSE = '#f43f5e';
const VIOLET = '#8b5cf6';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const CYAN = '#06b6d4';

const LEFT = 224;
const RIGHT = 572;

function Arrow({
  y,
  dir,
  label,
  accent,
  className,
  dashed = false
}: {
  y: number;
  dir: 'right' | 'left';
  label: string;
  accent: string;
  className: string;
  dashed?: boolean;
}) {
  const [x1, x2] = dir === 'right' ? [LEFT + 6, RIGHT - 6] : [RIGHT - 6, LEFT + 6];
  const head =
    dir === 'right'
      ? `${x2 - 8},${y - 4} ${x2},${y} ${x2 - 8},${y + 4}`
      : `${x2 + 8},${y - 4} ${x2},${y} ${x2 + 8},${y + 4}`;
  return (
    <g className={className}>
      <line
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke={accent}
        strokeWidth={1.6}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <polygon points={head} fill={accent} />
      <text
        x={(LEFT + RIGHT) / 2}
        y={y - 6}
        textAnchor="middle"
        fill={accent}
        fontFamily={MONO}
        fontSize={8}
      >
        {label}
      </text>
    </g>
  );
}

export function CorsCookieScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.from(['.cc-evil', '.cc-app', '.cc-api'], { opacity: 0, stagger: 0.15, duration: 0.3 });

      // step-0: SOP — cross-origin read blocked; HttpOnly cookie invisible to JS
      tl.addLabel('step-0');
      tl.from('.cc-sop-req', { opacity: 0, x: -10, duration: 0.35 });
      tl.from('.cc-sop-resp', { opacity: 0, x: 10, duration: 0.35 });
      tl.from('.cc-sop-block', {
        opacity: 0,
        scale: 0.85,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-1: CSRF — cross-site POST without cookie / token
      tl.addLabel('step-1');
      tl.from('.cc-csrf-req', { opacity: 0, x: -10, duration: 0.35 });
      tl.from('.cc-csrf-deny', {
        opacity: 0,
        scale: 0.85,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to({}, { duration: 0.6 });

      // step-2: CORS preflight for the trusted origin, then the credentialed request
      tl.addLabel('step-2');
      tl.from('.cc-pre-req', { opacity: 0, x: -10, duration: 0.3 });
      tl.from('.cc-pre-resp', { opacity: 0, x: 10, duration: 0.3 });
      tl.from('.cc-put-req', { opacity: 0, x: -10, duration: 0.3 });
      tl.from('.cc-put-ok', { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-3: CSP nonce — injected script blocked
      tl.addLabel('step-3');
      tl.from('.cc-csp-ok', { opacity: 0, x: -6, duration: 0.3 });
      tl.from('.cc-csp-bad', { opacity: 0, x: -6, duration: 0.3 });
      tl.from('.cc-csp-strike', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.3 });
      tl.from('.cc-csp-header', { opacity: 0, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>SAME-ORIGIN POLICY · SAMESITE COOKIES · CSRF · CORS · CSP</SceneTitle>

      <Panel
        x={24}
        y={46}
        w={200}
        h={168}
        accent={ROSE}
        className="cc-evil"
        title="https://evil.example"
        subtitle="attacker page in the same browser"
        step="0,1"
      >
        <text x={12} y={70} fill="var(--text)" fontFamily={MONO} fontSize={8}>
          fetch(api.shop.com/me)
        </text>
        <text x={12} y={136} fill="var(--text)" fontFamily={MONO} fontSize={8}>
          &lt;form POST /transfer&gt; auto-submit
        </text>
      </Panel>

      <Panel
        x={24}
        y={228}
        w={200}
        h={222}
        accent={CYAN}
        className="cc-app"
        title="https://app.shop.com"
        subtitle="our SPA"
        step="2,3"
      >
        <text x={12} y={66} fill="var(--text)" fontFamily={MONO} fontSize={8}>
          PUT /cart (JSON, credentials)
        </text>
        <g className="cc-csp-ok">
          <text x={12} y={160} fill={EMERALD} fontFamily={MONO} fontSize={8}>
            ✓ &lt;script nonce=&quot;r4nd0m&quot;&gt;
          </text>
        </g>
        <g className="cc-csp-bad">
          <text x={12} y={180} fill={ROSE} fontFamily={MONO} fontSize={8}>
            ✗ &lt;script&gt;steal()&lt;/script&gt;
          </text>
          <line
            className="cc-csp-strike"
            x1={22}
            y1={177}
            x2={160}
            y2={177}
            stroke={ROSE}
            strokeWidth={1.4}
          />
          <text x={12} y={196} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
            injected via a stored comment
          </text>
        </g>
      </Panel>

      <Panel
        x={RIGHT}
        y={46}
        w={204}
        h={404}
        accent={VIOLET}
        className="cc-api"
        title="https://api.shop.com"
        subtitle="Spring Security"
        step="0,1,2,3"
      >
        <text x={12} y={58} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          Set-Cookie: __Host-SESSION=…;
        </text>
        <text x={12} y={70} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          HttpOnly; Secure; SameSite=Lax
        </text>
        <text x={12} y={82} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
          CORS allow: https://app.shop.com
        </text>
        <g className="cc-csrf-deny">
          <Chip
            x={12}
            y={139}
            w={180}
            h={22}
            label="403 · no cookie, no CSRF token"
            accent={ROSE}
            filled
            fontSize={7.5}
          />
        </g>
        <g className="cc-put-ok">
          <Chip
            x={12}
            y={287}
            w={180}
            h={22}
            label="200 · cookie + X-XSRF-TOKEN ok"
            accent={EMERALD}
            filled
            fontSize={7.5}
          />
        </g>
        <g className="cc-csp-header">
          <text x={12} y={330} fill={VIOLET} fontFamily={MONO} fontSize={7.5}>
            Content-Security-Policy:
          </text>
          <text x={12} y={342} fill="var(--text)" fontFamily={MONO} fontSize={7.5}>
            script-src &apos;nonce-r4nd0m&apos;
          </text>
          <text x={12} y={354} fill="var(--text)" fontFamily={MONO} fontSize={7.5}>
            &apos;strict-dynamic&apos;; object-src &apos;none&apos;
          </text>
          <text x={12} y={366} fill="var(--text)" fontFamily={MONO} fontSize={7.5}>
            frame-ancestors &apos;none&apos;
          </text>
        </g>
      </Panel>

      {/* step-0: SOP */}
      <g data-step="0">
        <Arrow
          y={112}
          dir="right"
          label="GET /me (request is sent)"
          accent={AMBER}
          className="cc-sop-req"
        />
        <Arrow
          y={138}
          dir="left"
          label="200 · no ACAO for evil.example"
          accent={AMBER}
          className="cc-sop-resp"
          dashed
        />
        <g className="cc-sop-block">
          <Chip
            x={236}
            y={150}
            w={210}
            h={20}
            label="✗ script cannot read the response"
            accent={ROSE}
            fontSize={7.5}
          />
        </g>
      </g>

      {/* step-1: CSRF */}
      <g data-step="1">
        <Arrow
          y={196}
          dir="right"
          label="POST /transfer · cookie NOT sent (SameSite=Lax)"
          accent={ROSE}
          className="cc-csrf-req"
        />
      </g>

      {/* step-2: CORS preflight */}
      <g data-step="2">
        <Arrow
          y={292}
          dir="right"
          label="OPTIONS · Origin app.shop.com · PUT, x-xsrf-token"
          accent={CYAN}
          className="cc-pre-req"
        />
        <Arrow
          y={318}
          dir="left"
          label="ACAO app.shop.com · Allow-Credentials: true"
          accent={CYAN}
          className="cc-pre-resp"
          dashed
        />
        <Arrow
          y={344}
          dir="right"
          label="PUT /cart + __Host-SESSION + X-XSRF-TOKEN"
          accent={EMERALD}
          className="cc-put-req"
        />
      </g>

      <text x={24} y={470} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        origin = (scheme, host, port) · CORS controls READS only · CSRF is stopped at the server
      </text>
    </SceneBoard>
  );
}
