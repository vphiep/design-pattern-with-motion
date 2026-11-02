'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, SceneTitle } from '@/components/courses/scene-kit';

const ROSE = '#f43f5e';
const VIOLET = '#8b5cf6';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const CYAN = '#06b6d4';

const COLS = [
  { x: 124, w: 118 },
  { x: 268, w: 138 },
  { x: 432, w: 118 },
  { x: 576, w: 96 },
  { x: 690, w: 92 }
];

const LANES = [
  {
    key: 'enc',
    title: 'ENCRYPT',
    goal: 'confidentiality + integrity',
    accent: ROSE,
    chips: [
      'order:42 (plain)',
      'AES-256-GCM(K, nonce)',
      'ciphertext ‖ tag',
      'decrypt(K)',
      '✓ plaintext'
    ],
    note: 'flip 1 bit → AEADBadTagException'
  },
  {
    key: 'mac',
    title: 'HASH / MAC',
    goal: 'integrity · authenticity',
    accent: AMBER,
    chips: ['webhook body', 'HMAC-SHA256(secret)', 'tag 9f2c…', 'isEqual()', '✓ authentic'],
    note: 'SHA-256 alone: anyone can recompute'
  },
  {
    key: 'sig',
    title: 'SIGN',
    goal: 'non-repudiation',
    accent: VIOLET,
    chips: ['document', 'sign(private key)', 'signature', 'verify(public)', '✓ valid'],
    note: 'only the private key can sign; anyone can verify'
  },
  {
    key: 'kms',
    title: 'KEYS',
    goal: 'key management',
    accent: EMERALD,
    chips: ['KMS: KEK', 'GenerateDataKey', 'DEK (plain)', 'encrypt data', 'store enc(DEK)'],
    note: 'KEK never leaves the KMS · plain DEK wiped'
  }
];

const LANE_Y0 = 52;
const LANE_H = 100;
const CHIP_Y = 40;

export function CryptoPrimitivesScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      const playLane = (key: string) => {
        tl.from(`.cp-lane-${key}`, { opacity: 0, duration: 0.3 });
        tl.from(`.cp-chip-${key}`, { opacity: 0, y: 6, stagger: 0.12, duration: 0.25 });
        tl.to(`.cp-pkt-${key}`, { opacity: 1, duration: 0.1 });
        tl.to(`.cp-pkt-${key}`, {
          attr: { cx: COLS[4].x + COLS[4].w / 2 },
          duration: 1.1,
          ease: 'none'
        });
        tl.to(`.cp-pkt-${key}`, { opacity: 0, duration: 0.1 });
        tl.from(`.cp-note-${key}`, { opacity: 0, duration: 0.3 });
        tl.to({}, { duration: 0.6 });
      };

      // step-0: AES-GCM encrypt / decrypt
      tl.addLabel('step-0');
      playLane('enc');
      // step-1: hash vs HMAC
      tl.addLabel('step-1');
      playLane('mac');
      // step-2: sign / verify
      tl.addLabel('step-2');
      playLane('sig');
      // step-3: envelope encryption with a KMS
      tl.addLabel('step-3');
      playLane('kms');
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>FOUR PRIMITIVES · FOUR SECURITY QUESTIONS</SceneTitle>

      {LANES.map((lane, i) => {
        const y = LANE_Y0 + i * LANE_H;
        return (
          <g key={lane.key} className={`cp-lane-${lane.key}`} data-step={String(i)}>
            <rect
              x={20}
              y={y}
              width={764}
              height={LANE_H - 10}
              rx={8}
              fill="var(--surface)"
              stroke={lane.accent}
              strokeOpacity={0.5}
            />
            <text
              x={32}
              y={y + 22}
              fill={lane.accent}
              fontFamily={MONO}
              fontSize={11}
              fontWeight="bold"
            >
              {lane.title}
            </text>
            <text x={32} y={y + 36} fill="var(--text-muted)" fontFamily={MONO} fontSize={7.5}>
              {lane.goal}
            </text>
            <line
              x1={COLS[0].x}
              y1={y + CHIP_Y + 11}
              x2={COLS[4].x + COLS[4].w}
              y2={y + CHIP_Y + 11}
              stroke="var(--border)"
              strokeWidth={1.2}
            />
            {lane.chips.map((c, j) => (
              <g key={c} className={`cp-chip-${lane.key}`}>
                <Chip
                  x={COLS[j].x}
                  y={y + CHIP_Y}
                  w={COLS[j].w}
                  h={22}
                  label={c}
                  accent={j === 1 || j === 3 ? lane.accent : j === 4 ? EMERALD : CYAN}
                  filled={j === 4}
                  fontSize={7.5}
                />
              </g>
            ))}
            <circle
              className={`cp-pkt-${lane.key}`}
              cx={COLS[0].x + COLS[0].w / 2}
              cy={y + CHIP_Y + 11}
              r={5}
              fill={lane.accent}
              opacity={0}
            />
            <g className={`cp-note-${lane.key}`}>
              <text
                x={COLS[0].x}
                y={y + 80}
                fill="var(--text-muted)"
                fontFamily={MONO}
                fontSize={8}
              >
                {lane.note}
              </text>
            </g>
          </g>
        );
      })}
    </SceneBoard>
  );
}
