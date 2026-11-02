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

const DATA_FILES = ['base/16384/2619', 'base/16384/1259', 'pg_wal/0000…01'];

export function VolumeLifecycleScene(props: SceneProps) {
  const ref = useRef<SVGSVGElement>(null);

  useSceneTimeline(ref, {
    ...props,
    build: (tl) => {
      // step-0: no volume — data lands in the writable layer (upperdir)
      tl.addLabel('step-0');
      tl.from('.vl-tmp', { opacity: 0, duration: 0.35 });
      tl.from('.vl-upper-file', { opacity: 0, x: -8, stagger: 0.15, duration: 0.25 });
      tl.from('.vl-host-upper', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-1: docker rm → upperdir deleted, data gone
      tl.addLabel('step-1');
      tl.from('.vl-rm', { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.3 });
      tl.to('.vl-upper-file', { opacity: 0, y: 12, stagger: 0.1, duration: 0.3 });
      tl.to('.vl-tmp', { opacity: 0.3, duration: 0.3 });
      tl.to('.vl-host-upper', { opacity: 0.25, duration: 0.3 }, '<');
      tl.from('.vl-lost', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-2: named volume mounted, bypassing OverlayFS
      tl.addLabel('step-2');
      tl.from('.vl-pg', { opacity: 0, duration: 0.35 });
      tl.from('.vl-volume', { opacity: 0, duration: 0.35 });
      tl.to('.vl-mount', { strokeDashoffset: 0, duration: 0.6 });
      tl.from('.vl-vol-file', { opacity: 0, x: -8, stagger: 0.15, duration: 0.25 });
      tl.from('.vl-populate', { opacity: 0, duration: 0.3 });
      tl.to({}, { duration: 0.6 });

      // step-3: recreate the container + back up the volume
      tl.addLabel('step-3');
      tl.from('.vl-recreated', {
        opacity: 0,
        scale: 0.9,
        transformOrigin: '50% 50%',
        duration: 0.3
      });
      tl.to('.vl-backup-arrow', { strokeDashoffset: 0, duration: 0.5 });
      tl.from('.vl-backup', { opacity: 0, y: 6, duration: 0.3 });
    }
  });

  return (
    <SceneBoard ref={ref} viewBox="0 0 800 480">
      <SceneTitle>WRITABLE LAYER VS NAMED VOLUME · WHAT SURVIVES docker rm</SceneTitle>

      {/* Container without a volume */}
      <Panel
        x={24}
        y={48}
        w={360}
        h={170}
        accent={CYAN}
        className="vl-tmp"
        title="container pg-tmp (no volume)"
        subtitle="/var/lib/postgresql/data → overlay"
        step="0,1"
      >
        <Chip x={12} y={46} w={336} h={22} label="/ (merged view)" accent={CYAN} fontSize={8.5} />
        <rect x={12} y={74} width={336} height={56} rx={4} fill="var(--bg)" stroke={AMBER} />
        <text x={20} y={88} fill={AMBER} fontFamily={MONO} fontSize={8.5} fontWeight="bold">
          upperdir (rw · deleted with the container)
        </text>
        {DATA_FILES.map((f, i) => (
          <g key={f} className="vl-upper-file">
            <Chip
              x={20 + i * 108}
              y={98}
              w={100}
              h={22}
              label={f}
              accent={AMBER}
              filled
              fontSize={7.5}
            />
          </g>
        ))}
        <Chip
          x={12}
          y={138}
          w={336}
          h={22}
          label="image layers postgres:17 (ro, shared)"
          accent={VIOLET}
          fontSize={8.5}
        />
      </Panel>
      <g className="vl-rm" data-step="1">
        <Chip
          x={234}
          y={36}
          w={150}
          h={22}
          label="docker rm -f pg-tmp"
          accent={ROSE}
          filled
          fontSize={8.5}
        />
      </g>
      <g className="vl-lost" data-step="1">
        <text x={24} y={234} fill={ROSE} fontFamily={MONO} fontSize={9}>
          ✗ upperdir removed → a new container starts with an empty database
        </text>
      </g>

      {/* Container with a named volume */}
      <Panel
        x={24}
        y={252}
        w={360}
        h={150}
        accent={EMERALD}
        className="vl-pg"
        title="container pg"
        subtitle="--mount type=volume,source=pgdata"
        step="2,3"
      >
        <Chip
          x={12}
          y={46}
          w={336}
          h={22}
          label="/ (overlay: upperdir + image layers)"
          accent={CYAN}
          fontSize={8.5}
        />
        <Chip
          x={12}
          y={76}
          w={336}
          h={24}
          label="/var/lib/postgresql/data  ⇢  volume pgdata"
          accent={EMERALD}
          filled
          fontSize={8.5}
        />
        <text x={12} y={124} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
          a mount in the container mount namespace — no copy-up
        </text>
      </Panel>
      <g className="vl-recreated" data-step="3">
        <Chip
          x={234}
          y={240}
          w={150}
          h={22}
          label="recreated · same data"
          accent={EMERALD}
          filled
          fontSize={8.5}
        />
      </g>

      {/* Host disk */}
      <Panel
        x={430}
        y={48}
        w={346}
        h={354}
        accent="var(--border)"
        title="host disk /var/lib/docker"
        step="0,1,2,3"
      >
        <g className="vl-host-upper">
          <rect x={12} y={46} width={322} height={74} rx={5} fill="var(--bg)" stroke={AMBER} />
          <text x={22} y={64} fill={AMBER} fontFamily={MONO} fontSize={8.5} fontWeight="bold">
            overlay2/&lt;id&gt;/diff (pg-tmp upperdir)
          </text>
          <text x={22} y={82} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
            lifecycle = the container
          </text>
          <text x={22} y={100} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
            first write to an image file = copy-up
          </text>
        </g>
        <g className="vl-volume">
          <rect x={12} y={140} width={322} height={120} rx={5} fill="var(--bg)" stroke={EMERALD} />
          <text x={22} y={158} fill={EMERALD} fontFamily={MONO} fontSize={8.5} fontWeight="bold">
            volumes/pgdata/_data
          </text>
          <text x={22} y={174} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
            lifecycle = until docker volume rm / prune
          </text>
          {DATA_FILES.map((f, i) => (
            <g key={f} className="vl-vol-file">
              <Chip
                x={22 + i * 104}
                y={190}
                w={98}
                h={22}
                label={f}
                accent={EMERALD}
                fontSize={7.5}
              />
            </g>
          ))}
          <g className="vl-populate">
            <text x={22} y={234} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
              empty volume ← populated from the image
            </text>
            <text x={22} y={248} fill="var(--text-muted)" fontFamily={MONO} fontSize={8}>
              directory on first mount
            </text>
          </g>
        </g>
        <g className="vl-backup">
          <Chip
            x={12}
            y={300}
            w={322}
            h={26}
            label="backup: tar czf pgdata.tgz (database stopped)"
            accent={VIOLET}
            fontSize={8.5}
          />
        </g>
      </Panel>

      <path
        className="vl-mount"
        d="M 384 340 C 410 340 410 250 442 250"
        stroke={EMERALD}
        strokeWidth={2}
        strokeDasharray="160"
        strokeDashoffset={160}
        fill="none"
      />
      <path
        className="vl-backup-arrow"
        d="M 600 308 L 600 348"
        stroke={VIOLET}
        strokeWidth={1.8}
        strokeDasharray="40"
        strokeDashoffset={40}
        fill="none"
      />

      <text x={24} y={440} fill="var(--text-muted)" fontFamily={MONO} fontSize={8.5}>
        docker rm never deletes a named volume · bind mount = host path · tmpfs = RAM, gone on stop
      </text>
    </SceneBoard>
  );
}
