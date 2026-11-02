'use client';

import type { ComponentType } from 'react';
import type { SceneProps } from '@/components/illustrations/shared/types';
import { BTreeScene } from './BTreeScene';
import { SlottedPageScene } from './SlottedPageScene';
import { LSMTreeScene } from './LSMTreeScene';
import { ColumnarStorageScene } from './ColumnarStorageScene';
import { BufferPoolScene } from './BufferPoolScene';
import { MVCCScene } from './MVCCScene';
import { WALScene } from './WALScene';
import { ShardingScene } from './ShardingScene';
import { AcidAnomaliesScene } from './AcidAnomaliesScene';
import { TwoPhaseLockingScene } from './TwoPhaseLockingScene';
import { AriesRecoveryScene } from './AriesRecoveryScene';
import { HashIndexScene } from './HashIndexScene';
import { ArchitectureBlueprintScene } from './ArchitectureBlueprintScene';

export const DATABASE_ILLUSTRATIONS: Record<string, ComponentType<SceneProps>> = {
  'b-tree': BTreeScene,
  'slotted-page': SlottedPageScene,
  'lsm-tree': LSMTreeScene,
  'columnar-storage': ColumnarStorageScene,
  'buffer-pool': BufferPoolScene,
  'mvcc-isolation': MVCCScene,
  'write-ahead-log': WALScene,
  'sharding-hash-ring': ShardingScene,
  'acid-anomalies': AcidAnomaliesScene,
  'two-phase-locking': TwoPhaseLockingScene,
  'aries-recovery': AriesRecoveryScene,
  'hash-index': HashIndexScene,
};

export function getDatabaseIllustration(id: string): ComponentType<SceneProps> {
  return DATABASE_ILLUSTRATIONS[id] || ArchitectureBlueprintScene;
}
