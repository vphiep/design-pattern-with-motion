'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { useLocale } from '@/components/LocaleProvider';
import type { CourseStep } from '@/lib/courses/types';
import { MONO, SceneTitle, wrapText } from './scene-kit';

interface StepFlowSceneProps extends SceneProps {
  steps: CourseStep[];
  accent: string;
  heading: string;
}

const W = 800;
const PAD = 32;
const NODE_Y = 96;
const NODE_H = 150;

/**
 * Data-driven pipeline used by topics without a bespoke choreography. One
 * node per `CourseStep`, one `step-N` label per node, so the timeline always
 * agrees with the topic's scene meta.
 */
export function StepFlowScene({ steps, accent, heading, ...sceneProps }: StepFlowSceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const { tx } = useLocale();
  const n = steps.length;
  const gap = n > 4 ? 14 : 22;
  const nodeW = (W - PAD * 2 - gap * (n - 1)) / n;
  // ~6.4px per 10px mono glyph, minus 10px padding on each side
  const charsPerLine = Math.max(12, Math.floor((nodeW - 20) / 6.4));
  const cx = (i: number) => PAD + i * (nodeW + gap) + nodeW / 2;

  useSceneTimeline(ref, {
    ...sceneProps,
    build: (tl) => {
      tl.set('.flow-node', { opacity: 0.25 });
      tl.set('.flow-detail', { opacity: 0 });
      tl.set('.flow-link', { strokeDashoffset: 60 });
      tl.set('.flow-packet', { x: cx(0), opacity: 0 });
      for (let i = 0; i < n; i++) {
        tl.addLabel(`step-${i}`);
        tl.to(`.flow-node-${i}`, { opacity: 1, duration: 0.35 });
        tl.to(
          `.flow-node-${i} .flow-frame`,
          { stroke: accent, strokeWidth: 2.2, duration: 0.3 },
          '<'
        );
        if (i > 0) {
          tl.to(`.flow-link-${i}`, { strokeDashoffset: 0, duration: 0.35 }, '<');
          tl.to(`.flow-node-${i - 1} .flow-frame`, { strokeWidth: 1.2, duration: 0.3 }, '<');
          tl.to(`.flow-detail-${i - 1}`, { opacity: 0, duration: 0.2 }, '<');
        }
        tl.to('.flow-packet', { x: cx(i), opacity: 1, duration: 0.5, ease: 'power2.out' }, '<');
        tl.to(`.flow-detail-${i}`, { opacity: 1, duration: 0.35 });
        tl.to({}, { duration: 1.1 });
      }
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>{heading}</SceneTitle>

      {steps.slice(1).map((_, k) => {
        const i = k + 1;
        return (
          <line
            key={`link-${i}`}
            className={`flow-link flow-link-${i}`}
            x1={cx(i - 1) + nodeW / 2}
            y1={NODE_Y + NODE_H / 2}
            x2={cx(i) - nodeW / 2}
            y2={NODE_Y + NODE_H / 2}
            stroke={accent}
            strokeWidth={2}
            strokeDasharray="60"
          />
        );
      })}

      {steps.map((s, i) => {
        const x = cx(i) - nodeW / 2;
        const title = wrapText(tx(s.title), charsPerLine, 4);
        return (
          <g key={s.id} className={`flow-node flow-node-${i}`} data-step={String(i)}>
            <rect
              className="flow-frame"
              x={x}
              y={NODE_Y}
              width={nodeW}
              height={NODE_H}
              rx={8}
              fill="var(--surface)"
              stroke="var(--border)"
              strokeWidth={1.2}
            />
            <text
              x={x + 10}
              y={NODE_Y + 20}
              fill={accent}
              fontFamily={MONO}
              fontSize={10}
              fontWeight="bold"
            >
              {String(i + 1).padStart(2, '0')}
            </text>
            {wrapText(s.phase, charsPerLine, 2).map((l, li) => (
              <text
                key={li}
                x={x + 10}
                y={NODE_Y + 38 + li * 12}
                fill="var(--text-muted)"
                fontFamily={MONO}
                fontSize={8.5}
              >
                {l}
              </text>
            ))}
            {title.map((l, li) => (
              <text
                key={li}
                x={x + 10}
                y={NODE_Y + 74 + li * 14}
                fill="var(--text)"
                fontFamily={MONO}
                fontSize={10}
              >
                {l}
              </text>
            ))}
          </g>
        );
      })}

      <g className="flow-packet">
        <circle cx={0} cy={NODE_Y - 14} r={7} fill={accent} />
        <circle cx={0} cy={NODE_Y - 14} r={12} fill="none" stroke={accent} strokeOpacity={0.4} />
      </g>

      <rect
        x={PAD}
        y={290}
        width={W - PAD * 2}
        height={160}
        rx={8}
        fill="var(--surface)"
        stroke="var(--border)"
      />
      {steps.map((s, i) => (
        <g key={`detail-${s.id}`} className={`flow-detail flow-detail-${i}`} style={{ opacity: 0 }}>
          <text
            x={PAD + 16}
            y={314}
            fill={accent}
            fontFamily={MONO}
            fontSize={10}
            fontWeight="bold"
          >
            {`STEP ${i + 1} · ${s.phase.toUpperCase()}`}
          </text>
          {wrapText(tx(s.description), 112, 3).map((l, li) => (
            <text
              key={li}
              x={PAD + 16}
              y={336 + li * 15}
              fill="var(--text)"
              fontFamily={MONO}
              fontSize={10}
            >
              {l}
            </text>
          ))}
          {wrapText('→ ' + tx(s.systemBehavior), 118, 3).map((l, li) => (
            <text
              key={li}
              x={PAD + 16}
              y={392 + li * 14}
              fill="var(--text-muted)"
              fontFamily={MONO}
              fontSize={9}
            >
              {l}
            </text>
          ))}
        </g>
      ))}
    </SceneBoard>
  );
}
