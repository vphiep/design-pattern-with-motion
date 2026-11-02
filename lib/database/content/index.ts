import { bTree } from './b-tree';
import { slottedPage } from './slotted-page';
import { lsmTree } from './lsm-tree';
import { columnarStorage } from './columnar-storage';
import { bufferPool } from './buffer-pool';
import { mvccIsolation } from './mvcc-isolation';
import { writeAheadLog } from './write-ahead-log';
import { shardingHashRing } from './sharding-hash-ring';
import { acidAnomalies } from './acid-anomalies';
import { twoPhaseLocking } from './two-phase-locking';
import { ariesRecovery } from './aries-recovery';
import { hashIndex } from './hash-index';
import { sqlQueryProcessing } from './sql-query-processing';
import { queryOptimizerCbo } from './query-optimizer-cbo';
import { advancedIndexing } from './advanced-indexing';
import { tablePartitioning } from './table-partitioning';
import { latchesLocksConcurrency } from './latches-locks-concurrency';
import { checkpointVacuumEngine } from './checkpoint-vacuum-engine';
import { replicationConsensus } from './replication-consensus';
import { distributedTransactions2pc } from './distributed-transactions-2pc';

export const allDatabaseTopics = [
  bTree,
  slottedPage,
  lsmTree,
  columnarStorage,
  bufferPool,
  mvccIsolation,
  writeAheadLog,
  shardingHashRing,
  acidAnomalies,
  twoPhaseLocking,
  ariesRecovery,
  hashIndex,
  sqlQueryProcessing,
  queryOptimizerCbo,
  advancedIndexing,
  tablePartitioning,
  latchesLocksConcurrency,
  checkpointVacuumEngine,
  replicationConsensus,
  distributedTransactions2pc
];

export {
  bTree,
  slottedPage,
  lsmTree,
  columnarStorage,
  bufferPool,
  mvccIsolation,
  writeAheadLog,
  shardingHashRing,
  acidAnomalies,
  twoPhaseLocking,
  ariesRecovery,
  hashIndex,
  sqlQueryProcessing,
  queryOptimizerCbo,
  advancedIndexing,
  tablePartitioning,
  latchesLocksConcurrency,
  checkpointVacuumEngine,
  replicationConsensus,
  distributedTransactions2pc
};
