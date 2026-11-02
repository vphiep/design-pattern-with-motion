'use client';

import { useRef } from 'react';
import { useSceneTimeline } from '@/components/illustrations/shared/useSceneTimeline';
import { SceneBoard } from '@/components/illustrations/shared/SceneBoard';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { Chip, MONO, Panel, SceneTitle } from '@/components/courses/scene-kit';

const CYAN = '#06b6d4';
const VIOLET = '#8b5cf6';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const ROSE = '#f43f5e';

const ROW_X = 24;
const ROW_W = 452;
const ROW_Y = 70;
const ROW_H = 30;
const ROW_GAP = 38;

const ROWS = [
  { text: 'FROM eclipse-temurin:21-jdk', kind: 'base layers', status: 'CACHED' },
  { text: 'COPY mvnw pom.xml ./', kind: 'layer · 12 kB', status: 'CACHED' },
  { text: 'RUN ./mvnw dependency:go-offline', kind: 'layer · 180 MB · 2m40s', status: 'CACHED' },
  { text: 'COPY src ./src', kind: 'layer · 300 kB', status: 'MISS' },
  { text: 'RUN ./mvnw package', kind: 'layer · 25 s', status: 'REBUILD' },
  { text: 'ENV · EXPOSE · ENTRYPOINT', kind: 'config only · 0B', status: 'REBUILD' }
];

const STATUS_COLOR: Record<string, string> = {
  CACHED: EMERALD,
  MISS: ROSE,
  REBUILD: AMBER
};

export function LayerCacheScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      tl.set('.lc-row', { opacity: 0 });

      // step-0: filtered build context + FROM
      tl.addLabel('step-0');
      tl.from('.lc-file', { opacity: 0, x: 8, stagger: 0.1, duration: 0.25 });
      tl.from('.lc-strike', { scaleX: 0, transformOrigin: '0% 50%', stagger: 0.1, duration: 0.25 });
      tl.to('.lc-row-0', { opacity: 1, duration: 0.35 });
      tl.to({}, { duration: 0.6 });

      // step-1: every instruction becomes a layer (or only config)
      tl.addLabel('step-1');
      tl.to(['.lc-row-1', '.lc-row-2', '.lc-row-3', '.lc-row-4', '.lc-row-5'], {
        opacity: 1,
        stagger: 0.2,
        duration: 0.3
      });
      tl.from('.lc-build1', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-2: edit src/ → COPY src misses, downstream rebuilds
      tl.addLabel('step-2');
      tl.from('.lc-changed', { opacity: 0, scale: 0.8, transformOrigin: '50% 50%', duration: 0.3 });
      tl.from('.lc-status', { opacity: 0, x: 10, stagger: 0.18, duration: 0.25 });
      tl.from('.lc-downstream', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-3: config + tag → digest
      tl.addLabel('step-3');
      tl.from('.lc-image', { opacity: 0, duration: 0.35 });
      tl.from('.lc-cfg', { opacity: 0, x: -6, stagger: 0.12, duration: 0.25 });
      tl.from('.lc-tag', { opacity: 0, scale: 0.9, transformOrigin: '50% 50%', duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>DOCKERFILE → LAYERS · BUILD CACHE INVALIDATION</SceneTitle>

      <text x={ROW_X} y={56} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        instruction → layer
      </text>
      <text
        x={ROW_X + ROW_W}
        y={56}
        textAnchor="end"
        fill="var(--text-muted)"
        fontFamily={MONO}
        fontSize={8.5}
      >
        build #2 (after editing App.java)
      </text>

      {ROWS.map((r, i) => {
        const y = ROW_Y + i * ROW_GAP;
        const isConfig = i === ROWS.length - 1;
        return (
          <g
            key={r.text}
            className={`lc-row lc-row-${i}`}
            data-step={i === 0 ? '0,1' : i >= 3 ? '1,2' : '1'}
          >
            <rect
              x={ROW_X}
              y={y}
              width={ROW_W}
              height={ROW_H}
              rx={5}
              fill="var(--surface)"
              stroke={isConfig ? VIOLET : CYAN}
              strokeWidth={1.3}
              strokeDasharray={isConfig ? '5 4' : undefined}
            />
            <text
              x={ROW_X + 10}
              y={y + 13}
              fill="var(--text)"
              fontFamily={MONO}
              fontSize={9}
              fontWeight="bold"
            >
              {r.text}
            </text>
            <text
              x={ROW_X + 10}
              y={y + 25}
              fill="var(--text-muted)"
              fontFamily={MONO}
              fontSize={7.5}
            >
              {r.kind}
            </text>
            <g className="lc-status">
              <Chip
                x={ROW_X + ROW_W - 86}
                y={y + 5}
                w={78}
                h={20}
                label={r.status}
                accent={STATUS_COLOR[r.status]}
                filled={r.status !== 'CACHED'}
                fontSize={8}
              />
            </g>
          </g>
        );
      })}

      <g className="lc-build1" data-step="1">
        <text
          x={ROW_X}
          y={ROW_Y + 6 * ROW_GAP + 6}
          fill="var(--text-muted)"
          fontFamily={MONO}
          fontSize={8.5}
        >
          build #1: every step runs once and is stored as a cache entry
        </text>
      </g>
      <g className="lc-downstream" data-step="2">
        <text x={ROW_X} y={ROW_Y + 6 * ROW_GAP + 22} fill={ROSE} fontFamily={MONO} fontSize={8.5}>
          first miss at COPY src (k = 4) → steps 4..6 rebuild; dependencies stay cached
        </text>
      </g>

      <Panel
        x={500}
        y={44}
        w={276}
        h={190}
        accent={VIOLET}
        title="build context (.)"
        subtitle=".dockerignore filters before upload"
        step="0,2"
      >
        {[
          ['Dockerfile', false],
          ['pom.xml · mvnw · .mvn/', false],
          ['src/main/java/App.java', false],
          ['.git/', true],
          ['target/', true],
          ['.env', true]
        ].map(([f, excluded], i) => (
          <g key={String(f)} className="lc-file">
            <text
              x={14}
              y={56 + i * 20}
              fill={excluded ? 'var(--text-muted)' : 'var(--text)'}
              fontFamily={MONO}
              fontSize={9}
            >
              {excluded ? '✗ ' : '✓ '}
              {String(f)}
            </text>
            {excluded && (
              <line
                className="lc-strike"
                x1={26}
                y1={53 + i * 20}
                x2={26 + String(f).length * 5.6}
                y2={53 + i * 20}
                stroke={ROSE}
                strokeWidth={1.2}
              />
            )}
          </g>
        ))}
        <g className="lc-changed">
          <Chip x={176} y={84} w={88} h={18} label="edited" accent={AMBER} filled fontSize={8} />
        </g>
      </Panel>

      <Panel
        x={500}
        y={250}
        w={276}
        h={170}
        accent={EMERALD}
        className="lc-image"
        title="image my/api:1.4.3"
        subtitle="manifest = config + layer digests"
        step="3"
      >
        {[
          'config  sha256:41aa…',
          '  Entrypoint ["java","-jar","app.jar"]',
          '  Env SPRING_PROFILES_ACTIVE=prod',
          '  ExposedPorts 8080/tcp',
          'layers  a1… b2… c3… d4′… e5′…'
        ].map((l, i) => (
          <g key={l} className="lc-cfg">
            <text x={14} y={56 + i * 16} fill="var(--text)" fontFamily={MONO} fontSize={8.5}>
              {l}
            </text>
          </g>
        ))}
        <g className="lc-tag">
          <Chip
            x={14}
            y={136}
            w={248}
            h={22}
            label="tag 1.4.3 → sha256:5d0a… (immutable)"
            accent={EMERALD}
            filled
            fontSize={8.5}
          />
        </g>
      </Panel>

      <text x={24} y={460} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        cache key: RUN = command string · COPY/ADD = file content + metadata (mtime ignored)
      </text>
    </SceneBoard>
  );
}
