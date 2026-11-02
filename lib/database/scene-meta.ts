import type { SceneMeta } from '@/lib/patterns/scene';

export const DATABASE_SCENE_META: Record<string, SceneMeta> = {
  'b-tree': {
    caption: {
      en: 'B+ Tree: Binary search traversal down branch pages, balanced leaf fan-out, 50/50 split on overflow.',
      vi: 'Cây B+ Tree: Tra cứu nhị phân dọc các trang nhánh, phân nhánh cân bằng, phân tách 50/50 khi đầy trang.'
    },
    steps: [
      { id: 'search', label: 'Binary search inside page', match: 'int idx = Collections.binarySearch', span: 2 },
      { id: 'overflow', label: 'Detect page overflow', match: 'if (keys.size() > MAX_KEYS)', span: 2 },
      { id: 'split', label: 'Split & promote median key', match: 'splitAndPromote()', span: 2 }
    ]
  },
  'slotted-page': {
    caption: {
      en: 'Slotted Page: Page header grows forward, variable-length tuples grow backward, zero internal fragmentation.',
      vi: 'Slotted Page: Header và con trỏ lớn dần từ đầu trang, tuple dữ liệu ghi ngược từ đáy trang lên.'
    },
    steps: [
      { id: 'header-check', label: 'Read page header & free space', match: 'int freeSpace = upperFreeOffset - lowerFreeOffset', span: 2 },
      { id: 'tuple-insert', label: 'Append tuple at bottom offset', match: 'upperFreeOffset -= tupleLength', span: 2 },
      { id: 'pointer-alloc', label: 'Write line pointer entry', match: 'linePointers.add(new ItemPointer', span: 2 }
    ]
  },
  'lsm-tree': {
    caption: {
      en: 'LSM-Tree: Sequential write in MemTable -> WAL -> Immutable SSTables -> Level-based compaction.',
      vi: 'LSM-Tree: Ghi tuần tự vào MemTable -> WAL -> Nén các SSTable bất biến đa tầng.'
    },
    steps: [
      { id: 'memtable', label: 'Fast in-memory insert', match: 'memTable.put(key, value)', span: 2 },
      { id: 'flush', label: 'Flush to disk SSTable', match: 'flushMemTableToSSTable()', span: 2 },
      { id: 'compact', label: 'Level-based compaction', match: 'mergeAndCompact(level0, level1)', span: 2 }
    ]
  },
  'columnar-storage': {
    caption: {
      en: 'Columnar Storage: Column-oriented chunking, dictionary compression & vectorized SIMD scan.',
      vi: 'Lưu trữ theo cột: Phân khối độc lập từng cột, nén từ điển và quét vector hóa SIMD.'
    },
    steps: [
      { id: 'col-chunk', label: 'Split record into column arrays', match: 'columnBuffers[colIdx].write(value)', span: 2 },
      { id: 'rle-compress', label: 'Run-Length & Dictionary compression', match: 'compressColumnChunk(columnBuffers[colIdx])', span: 2 },
      { id: 'simd-scan', label: 'Vectorized SIMD predicate filtering', match: 'vectorizedFilter(colValues, predicate)', span: 2 }
    ]
  },
  'heap-toast': {
    caption: {
      en: 'Heap & TOAST: Variable oversized attributes sliced into 2KB chunks stored in out-of-line TOAST tables.',
      vi: 'Heap & TOAST: Cắt nhỏ các trường dữ liệu lớn thành từng chunk 2KB lưu ở bảng phụ TOAST ngoài dòng.'
    },
    steps: [
      { id: 'size-check', label: 'Check tuple length > 2KB limit', match: 'if (attributeSize > TOAST_TUPLE_THRESHOLD)', span: 2 },
      { id: 'chunk-slice', label: 'Chunk data & assign TOAST pointer', match: 'toastTable.insertChunk(toastOid, chunkIdx, chunk)', span: 2 },
      { id: 'pointer-embed', label: 'Store 18-byte TOAST pointer in main row', match: 'tuple.setAttribute(colIdx, toastPointer)', span: 2 }
    ]
  },
  'hash-index': {
    caption: {
      en: 'Extendible Hashing: Global depth directory doubling without moving unchanged hash buckets.',
      vi: 'Băm động Extendible Hash: Nhân đôi thư mục con trỏ toàn cục mà không di chuyển bucket không đổi.'
    },
    steps: [
      { id: 'hash-calc', label: 'Calculate 32-bit hash value', match: 'int hash = hashFunction(key)', span: 2 },
      { id: 'bucket-overflow', label: 'Detect bucket capacity overflow', match: 'if (bucket.size() >= BUCKET_CAPACITY)', span: 2 },
      { id: 'dir-double', label: 'Double directory & split victim bucket', match: 'splitBucketAndRedistribute(bucketIndex)', span: 2 }
    ]
  },
  'inverted-index': {
    caption: {
      en: 'Inverted Index: Tokenize terms into dictionary and append Document IDs to compressed Postings Lists.',
      vi: 'Chỉ mục đảo ngữ: Phân tích từ khóa vào từ điển và gắn DocID vào danh sách Postings nén.'
    },
    steps: [
      { id: 'tokenize', label: 'Tokenize & normalize terms', match: 'List<String> tokens = tokenizer.tokenize(documentText)', span: 2 },
      { id: 'postings-append', label: 'Append docId to term postings list', match: 'dictionary.computeIfAbsent(term, k -> new PostingsList())', span: 2 },
      { id: 'skip-intersect', label: 'Skip-list pointer intersection', match: 'intersectPostings(listA, listB)', span: 2 }
    ]
  },
  'bitmap-index': {
    caption: {
      en: 'Bitmap Index: Distinct low-cardinality values encoded as bit arrays, accelerated by bitwise CPU operations.',
      vi: 'Chỉ mục Bitmap: Mã hóa từng giá trị phân biệt thành mảng bit, tăng tốc bằng phép toán bitwise CPU.'
    },
    steps: [
      { id: 'cardinality-map', label: 'Map distinct value to bit position', match: 'BitSet vector = bitmapIndex.get(columnValue)', span: 2 },
      { id: 'bit-and', label: 'Bitwise AND / OR across predicates', match: 'resultBitset.and(conditionBitset)', span: 2 },
      { id: 'tuple-fetch', label: 'Convert true bits to physical row IDs', match: 'for (int rowId = resultBitset.nextSetBit(0)', span: 2 }
    ]
  },
  'gist-rtree': {
    caption: {
      en: 'R-Tree / GiST: Hierarchical Minimum Bounding Boxes (MBR) for multi-dimensional spatial queries.',
      vi: 'Cây R-Tree: Phân cấp hộp bao nhỏ nhất (MBR) cho các truy vấn không gian địa lý đa chiều.'
    },
    steps: [
      { id: 'mbr-eval', label: 'Evaluate spatial intersection with MBR', match: 'if (node.boundingRectangle.intersects(queryBox))', span: 2 },
      { id: 'sub-traverse', label: 'Traverse child bounding boxes', match: 'traverseChildren(node, queryBox, results)', span: 2 },
      { id: 'quadratic-split', label: 'Quadratic split node on area enlargement', match: 'quadraticSplit(overflowNode)', span: 2 }
    ]
  },
  'buffer-pool': {
    caption: {
      en: 'Buffer Pool: Memory frame table, Dirty Page tracking, and Clock / 2Q Eviction.',
      vi: 'Buffer Pool: Quản lý trang bộ nhớ đệm, cờ trang bẩn (Dirty) và thuật toán giải phóng Clock.'
    },
    steps: [
      { id: 'lookup', label: 'Page table hash lookup', match: 'Frame frame = pageTable.get(pageId)', span: 2 },
      { id: 'evict', label: 'Clock hand scans victim frame', match: 'Frame victim = clockReplacer.findVictim()', span: 2 },
      { id: 'flush-dirty', label: 'Flush dirty page to disk', match: 'diskManager.writePage(victim.pageId)', span: 2 }
    ]
  },
  'work-mem': {
    caption: {
      en: 'WorkMem & External Sort: Sort in-memory runs, spill to temp disk files, and k-way merge.',
      vi: 'WorkMem & Sắp xếp ngoài: Sắp xếp các run trong RAM, ghi file tạm ra đĩa và trộn k-way merge.'
    },
    steps: [
      { id: 'ram-sort', label: 'Quick-sort in memory until work_mem limit', match: 'if (currentMemoryBytes > WORK_MEM_BYTES)', span: 2 },
      { id: 'spill-run', label: 'Spill sorted run to disk tape', match: 'spillSortedRunToTempDisk(currentRun)', span: 2 },
      { id: 'k-way-merge', label: 'PriorityQueue k-way merge across runs', match: 'mergeRuns(tempDiskRunFiles)', span: 2 }
    ]
  },
  'acid-anomalies': {
    caption: {
      en: 'ACID Architecture: Atomicity (Undo Rollback), Consistency Invariants, Isolation Snapshots, and Durability WAL flush.',
      vi: 'Kiến trúc ACID: Tính Nguyên tử (Undo Rollback), Bất biến Nhất quán, Snapshot Cách ly và Xả nhật ký Bền vững.'
    },
    steps: [
      { id: 'atomicity-undo', label: 'Atomicity: Undo Log & Rollback / Savepoint', match: 'transactionManager.rollback(status); // Reverts all partial statements', span: 2 },
      { id: 'consistency-isolation', label: 'Consistency & Isolation: Invariants & MVCC Snapshot', match: '@Transactional(isolation = Isolation.REPEATABLE_READ)', span: 2 },
      { id: 'durability-wal', label: 'Durability: Sequential WAL Flush & fsync Commit', match: 'walChannel.force(false); // Hardware fsync guarantees durability!', span: 2 }
    ]
  },
  'two-phase-locking': {
    caption: {
      en: 'Strict 2PL: Growing phase acquires shared/exclusive locks; shrinking phase releases only at commit.',
      vi: 'Khóa 2PL nghiêm ngặt: Giai đoạn mở rộng gom khóa S/X; giai đoạn thu hẹp chỉ nhả khóa khi commit.'
    },
    steps: [
      { id: 'acquire-lock', label: 'Acquire Shared (S) or Exclusive (X) lock', match: 'lockManager.acquireLock(txId, resourceId, LockMode.EXCLUSIVE)', span: 2 },
      { id: 'deadlock-check', label: 'Deadlock detection via wait-for graph cycle', match: 'if (waitForGraph.hasCycle())', span: 2 },
      { id: 'commit-release', label: 'Hold all locks until final COMMIT / ABORT', match: 'releaseAllLocksAtCommit(txId)', span: 2 }
    ]
  },
  'mvcc-isolation': {
    caption: {
      en: 'MVCC: Readers never block writers via snapshot isolation (xmin, xmax) and undo log roll-pointers.',
      vi: 'MVCC: Người đọc không chặn người ghi qua transaction snapshot (xmin, xmax) và con trỏ Undo Log.'
    },
    steps: [
      { id: 'snapshot', label: 'Capture active tx snapshot', match: 'Snapshot snapshot = txManager.createSnapshot()', span: 2 },
      { id: 'visibility', label: 'Check tuple visibility', match: 'boolean isVisible = tuple.xmin <= snapshot.getTxId()', span: 2 },
      { id: 'undolog', label: 'Traverse roll pointer', match: 'return traverseUndoLog(tuple.rollPointer)', span: 2 }
    ]
  },
  'serializable-snapshot': {
    caption: {
      en: 'SSI: Lock-free full serializability by detecting rw-antidependency cycles in dependency graphs.',
      vi: 'SSI: Tuần tự hóa hoàn toàn không dùng khóa bằng cách phát hiện chu trình phụ thuộc rw-antidependency.'
    },
    steps: [
      { id: 'track-read', label: 'Track SIREAD locks on tuples and index keys', match: 'trackSiReadLock(txId, tupleId)', span: 2 },
      { id: 'danger-flag', label: 'Detect in-conflict and out-conflict edges', match: 'if (hasInConflictEdge(tx) && hasOutConflictEdge(tx))', span: 2 },
      { id: 'abort-cycle', label: 'Abort first transaction to break serialization cycle', match: 'abortTransactionForSerializationFailure(tx)', span: 2 }
    ]
  },
  'write-ahead-log': {
    caption: {
      en: 'WAL & ARIES: Write log buffer before dirty page flush. Replay on crash recovery.',
      vi: 'WAL & ARIES: Ghi log trước khi flush trang dữ liệu bẩn. Phục hồi sự cố với Redo/Undo.'
    },
    steps: [
      { id: 'append', label: 'Append log record to WAL buffer', match: 'walBuffer.append(lsn, txId, prevLsn)', span: 2 },
      { id: 'fsync', label: 'Force synchronous flush (fsync)', match: 'channel.force(false)', span: 2 },
      { id: 'recovery', label: 'ARIES Redo & Undo passes', match: 'replayRedoLog(lastCheckpointLSN)', span: 2 }
    ]
  },
  'aries-recovery': {
    caption: {
      en: 'ARIES Algorithm: 3-pass crash recovery (Analysis Pass -> Redo Pass -> Undo Pass).',
      vi: 'Thuật toán ARIES: Phục hồi sự cố 3 giai đoạn (Analysis Pass -> Redo Pass -> Undo Pass).'
    },
    steps: [
      { id: 'analysis-pass', label: 'Analysis Pass: Reconstruct Dirty Page Table & Active Tx Table', match: 'reconstructDirtyPageTableFromCheckpoint()', span: 2 },
      { id: 'redo-pass', label: 'Redo Pass: Repeat history from smallest RecLSN forward', match: 'repeatHistoryForward(minRecLSN)', span: 2 },
      { id: 'undo-pass', label: 'Undo Pass: Rollback loser transactions and write CLR records', match: 'rollbackLosersAndWriteCLR()', span: 2 }
    ]
  },
  'doublewrite-buffer': {
    caption: {
      en: 'Doublewrite Buffer: Prevent torn pages on sudden power outages by writing sequential backup copies.',
      vi: 'Doublewrite Buffer: Chống rách trang khi mất điện đột ngột bằng bản ghi đệm tuần tự trước khi ghi ngẫu nhiên.'
    },
    steps: [
      { id: 'seq-doublewrite', label: 'Write 16KB pages sequentially to contiguous doublewrite buffer', match: 'doublewriteBuffer.writeContiguousPages(dirtyPages)', span: 2 },
      { id: 'fsync-doublewrite', label: 'Synchronous fsync guarantees buffer persistence', match: 'doublewriteChannel.force(false)', span: 2 },
      { id: 'random-flush', label: 'Flush pages to final tablespace disk offsets', match: 'diskTablespace.writePage(page.pageId, page.data)', span: 2 }
    ]
  },
  'sharding-hash-ring': {
    caption: {
      en: 'Consistent Hashing: Virtual nodes ring, minimal key redistribution during cluster scale.',
      vi: 'Băm nhất quán: Vòng nút ảo (Virtual Nodes), giảm thiểu di dời dữ liệu khi mở rộng cụm.'
    },
    steps: [
      { id: 'hash', label: 'Hash key on 32-bit ring', match: 'long hash = hashFunction.hash(key)', span: 2 },
      { id: 'lookup-node', label: 'Find next node on ring', match: 'Map.Entry<Long, Node> entry = ring.ceilingEntry(hash)', span: 2 },
      { id: 'rebalance', label: 'Migrate partition range', match: 'migrateKeys(oldNode, newNode)', span: 2 }
    ]
  },
  'raft-consensus': {
    caption: {
      en: 'Raft Consensus: Leader Election, Heartbeats, Log Replication, and Quorum Commitment.',
      vi: 'Đồng thuận Raft: Bầu chọn Leader, gửi Heartbeat, sao chép Log và cam kết theo đa số Quorum.'
    },
    steps: [
      { id: 'leader-election', label: 'Election timeout triggers RequestVote RPC to cluster', match: 'broadcastRequestVote(term, candidateId)', span: 2 },
      { id: 'replicate-log', label: 'AppendEntries RPC replicates uncommitted entries to followers', match: 'broadcastAppendEntries(leaderId, term, entries)', span: 2 },
      { id: 'quorum-commit', label: 'Commit index advances when majority of followers acknowledge', match: 'if (matchIndexAcks >= majorityThreshold)', span: 2 }
    ]
  },
  'two-phase-commit': {
    caption: {
      en: 'Two-Phase Commit (2PC): Coordinator sends PREPARE, nodes vote YES/NO, then sends GLOBAL COMMIT.',
      vi: 'Giao dịch phân tán 2PC: Điều phối gửi PREPARE, các node bỏ phiếu YES/NO, sau đó phát lệnh GLOBAL COMMIT.'
    },
    steps: [
      { id: 'prepare-phase', label: 'Phase 1: Coordinator sends PREPARE to all participants', match: 'sendPrepareMessageToParticipants(txId)', span: 2 },
      { id: 'vote-collect', label: 'Participants write PREPARE log and vote YES', match: 'if (allParticipantsVotedYes())', span: 2 },
      { id: 'global-commit', label: 'Phase 2: Coordinator writes COMMIT log and broadcasts GLOBAL COMMIT', match: 'broadcastGlobalCommit(txId)', span: 2 }
    ]
  },
  'sql-query-processing': {
    caption: {
      en: 'SQL Query Pipeline: Lexer/Parser AST -> Semantic catalog binding -> Relational rewrite -> Volcano iterator execution.',
      vi: 'Pipeline SQL: Lexer/Parser dựng AST -> Phân giải catalog ngữ nghĩa -> Viết lại đại số -> Thực thi lặp Volcano.'
    },
    steps: [
      { id: 'parse', label: 'Lexing & Syntax Parsing (AST Generation)', match: 'ASTNode ast = sqlParser.parse(sqlQuery);', span: 2 },
      { id: 'semantic-plan', label: 'Semantic Analysis & Query Rewrite', match: 'LogicalPlan logicalPlan = semanticAnalyzer.resolve(ast);', span: 2 },
      { id: 'volcano-execute', label: 'Physical Plan & Volcano Iterator Streaming', match: 'while ((record = executorRoot.next()) != null)', span: 2 }
    ]
  },
  'query-optimizer-cbo': {
    caption: {
      en: 'Cost-Based Optimizer: Histogram statistics, selectivity estimation E = N * sel, join dynamic programming, and physical algorithm selection.',
      vi: 'Bộ tối ưu CBO: Thống kê histogram, ước lượng độ chọn lọc E = N * sel, quy hoạch động nối bảng và chọn thuật toán vật lý.'
    },
    steps: [
      { id: 'statistics', label: 'Catalog Statistics & Histogram Evaluation', match: 'double selectivity = statsEngine.estimateSelectivity(column, operator, value);', span: 2 },
      { id: 'cardinality', label: 'Cardinality & Access Path Costing', match: 'double cost = (pages * seqPageCost) + (tuples * cpuTupleCost);', span: 2 },
      { id: 'join-enumeration', label: 'Join Order DP & Physical Algorithm Selection', match: 'PlanNode bestPlan = dynamicProgrammingJoinOptimizer.findOptimalPlan(query);', span: 2 }
    ]
  },
  'advanced-indexing': {
    caption: {
      en: 'Advanced Indexing: Composite B-Tree leftmost prefix, Index Condition Pushdown (ICP), and Covering Index-Only scans.',
      vi: 'Chỉ mục nâng cao: Tiền tố trái nhất của Composite B-Tree, Đẩy điều kiện ICP và Quét thuần chỉ mục (Index-Only Scan).'
    },
    steps: [
      { id: 'leftmost-eval', label: 'Composite B-Tree & Leftmost Prefix Traversal', match: 'int leafOffset = bTree.searchPrefix(statusKey);', span: 2 },
      { id: 'icp-filter', label: 'Index Condition Pushdown (ICP) In-Engine Check', match: 'if (icpFilter.test(indexLeafTuple))', span: 2 },
      { id: 'covering-scan', label: 'Covering Index / Visibility Map Heap Bypass', match: 'if (visibilityMap.isAllVisible(pageId)) return extractFromIndex(leaf);', span: 2 }
    ]
  },
  'table-partitioning': {
    caption: {
      en: 'Table Partitioning: Range, List, and Hash partitioning with static/dynamic partition pruning and zero-downtime maintenance.',
      vi: 'Phân vùng bảng: Phân chia theo Dải, Danh sách, Băm với cơ chế cắt tỉa phân vùng và bảo trì không gián đoạn.'
    },
    steps: [
      { id: 'partition-route', label: 'Partition Key Evaluation & Routing', match: 'String targetTable = partitionRouter.route(record.getPartitionKey());', span: 2 },
      { id: 'static-prune', label: 'Static Partition Pruning (Elimination)', match: 'List<SubTable> activePartitions = pruner.prune(queryPredicate);', span: 2 },
      { id: 'lifecycle-detach', label: 'Zero-Downtime Detach / Drop Partition', match: 'databaseAdmin.detachPartition("orders_2023");', span: 2 }
    ]
  },
  'latches-locks-concurrency': {
    caption: {
      en: 'Physical Latches vs Transactional Locks: Microsecond C memory guards vs ACID isolation lock manager tables.',
      vi: 'Chốt Latch vs Khóa Lock: Bảo vệ cấu trúc bộ nhớ trong micro-giây vs Khóa giao dịch duy trì tính cô lập ACID.'
    },
    steps: [
      { id: 'acquire-latch', label: 'Acquire In-Memory Physical Latch (LWLock)', match: 'bufferLatch.acquireShared();', span: 2 },
      { id: 'evaluate-lock', label: 'Acquire Transactional Lock (Lock Manager)', match: 'lockManager.acquireRowLock(txId, rowKey, LockMode.EXCLUSIVE);', span: 2 },
      { id: 'release-latch', label: 'Release Physical Latch & Retain Lock', match: 'bufferLatch.releaseShared(); // Lock remains held until tx.commit()!', span: 2 }
    ]
  },
  'checkpoint-vacuum-engine': {
    caption: {
      en: 'Checkpointing & Vacuum Engine: Paced dirty page flushing, full page writes, autovacuum GC, and TxID freeze.',
      vi: 'Động cơ Checkpoint & Vacuum: Dàn đều xả trang bẩn, Full Page Writes, thu gom rác Autovacuum và đóng băng TxID.'
    },
    steps: [
      { id: 'checkpoint-pace', label: 'Checkpoint Invocation & Paced Dirty Page Flush', match: 'checkpointManager.paceDirtyPageFlushes(completionTarget);', span: 2 },
      { id: 'torn-page-guard', label: 'Torn Page Protection (FPW / Doublewrite)', match: 'tornPageGuard.recordFullPageImage(pageId, pageBytes);', span: 2 },
      { id: 'vacuum-freeze', label: 'Garbage Collection & TxID Wraparound Freeze', match: 'autovacuumEngine.cleanDeadTuplesAndFreeze(table);', span: 2 }
    ]
  },
  'replication-consensus': {
    caption: {
      en: 'Replication & Consensus: Streaming WAL physical replication, Quorum voting (N/2 + 1), and Split-Brain fencing.',
      vi: 'Sao chép & Đồng thuận: Dòng sao chép WAL vật lý, bỏ phiếu túc số Quorum (N/2 + 1) và cơ chế Fencing chống não phân liệt.'
    },
    steps: [
      { id: 'wal-stream', label: 'Physical WAL Stream Transmission', match: 'replicationLink.streamWalBytes(currentLsn, walPayload);', span: 2 },
      { id: 'quorum-ack', label: 'Quorum Majority Acknowledgment (Semi-Sync)', match: 'if (quorumTracker.hasMajorityAck(commitLsn)) return commitSuccess();', span: 2 },
      { id: 'failover-fence', label: 'Automated Failover & Split-Brain Fencing', match: 'raftCluster.electNewLeaderAndFenceOldPrimary();', span: 2 }
    ]
  },
  'distributed-transactions-2pc': {
    caption: {
      en: 'Distributed Transactions: 2PC Prepare/Commit, in-doubt blocking resolution, Saga compensation, and Transactional Outbox CDC.',
      vi: 'Giao dịch phân tán: 2PC Chuẩn bị/Chốt, xử lý khóa lấp lửng in-doubt, bù trừ Saga và Hộp thư đi Transactional Outbox CDC.'
    },
    steps: [
      { id: '2pc-prepare', label: 'Phase 1: Voting PREPARE & In-Doubt Lock', match: 'boolean allVotedYes = coordinator.sendPrepareToAllCohorts(globalTxId);', span: 2 },
      { id: '2pc-commit', label: 'Phase 2: Global Decision & Lock Release', match: 'coordinator.broadcastGlobalCommit(globalTxId);', span: 2 },
      { id: 'saga-outbox', label: 'Saga Compensating Action & Outbox CDC Stream', match: 'outboxRepository.save(new OutboxEvent(aggregateId, eventPayload));', span: 2 }
    ]
  }
};
