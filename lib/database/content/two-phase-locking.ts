import type { DatabaseTopic } from '../types';

export const twoPhaseLocking: DatabaseTopic = {
  id: 'two-phase-locking',
  category: 'concurrency-tx',
  name: 'Strict 2PL, Lock Manager & Deadlocks',
  tagline: {
    en: 'Pessimistic concurrency control: Growing and Shrinking lock phases, lock hierarchies (IS/IX/S/X), and Wait-For graph deadlock detection.',
    vi: 'Kiểm soát đồng thời bi quan: Hai giai đoạn khóa Tăng và Giảm, phân cấp khóa ý định (IS/IX/S/X) và phát hiện Deadlock bằng đồ thị.'
  },
  difficulty: 3,
  order: 10,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      en: 'When multiple transactions concurrently modify overlapping records without coordinated locking, lost updates and inconsistent states occur. Releasing a lock early before a transaction finishes creates non-serializable interleavings where another transaction reads half-completed business logic.',
      vi: 'Khi nhiều giao dịch cùng sửa đổi các bản ghi mà không khóa điều phối, sẽ xảy ra mất dữ liệu (Lost Update) và trạng thái bất nhất. Nhả khóa quá sớm trước khi transaction hoàn tất sẽ khiến transaction khác đọc phải dữ liệu dở dang vi phạm tính tuần tự hóa.'
    },
    hardwareConstraint: {
      en: 'Centralized lock managers maintain lock hash tables in shared memory. High contention for the same lock bucket causes cache-line invalidation across CPU cores and spinlock CPU burn.',
      vi: 'Bộ quản lý khóa (Lock Manager) lưu trữ bảng băm khóa trong bộ nhớ dùng chung. Tranh chấp cao trên cùng một bucket khóa gây hiện tượng vô hiệu hóa cache CPU (Cache-line invalidation) và đốt CPU vì spinlock.'
    },
    fundamentalSolution: {
      en: 'Two-Phase Locking (2PL) enforces two strict phases: (1) Growing Phase: Transactions may acquire locks but release none; (2) Shrinking Phase: Transactions may release locks but acquire no new ones. Strict 2PL (SS2PL) holds all Exclusive and Shared locks until the final COMMIT/ABORT, guaranteeing serializability and avoiding cascading aborts.',
      vi: 'Thuật toán Khóa Hai Giai Đoạn (2PL) áp đặt: (1) Pha Mở Rộng: Giao dịch chỉ được phép xin thêm khóa, không được nhả khóa; (2) Pha Thu Hẹp: Giao dịch chỉ được nhả khóa, không được xin thêm. Chuẩn Strict 2PL giữ toàn bộ khóa cho tới thời điểm COMMIT/ABORT cuối cùng, đảm bảo tính tuần tự hóa và triệt tiêu lỗi hủy dây chuyền.'
    },
    math: {
      formula: 'Conflict Matrix: S ∩ S = OK,   S ∩ X = BLOCK,   X ∩ X = BLOCK',
      description: {
        en: 'Multiple readers can hold Shared (S) locks concurrently. An Exclusive (X) lock blocks all other readers and writers.',
        vi: 'Nhiều người đọc có thể cùng giữ khóa Chia sẻ (S). Khóa Độc quyền (X) chặn đứng tất cả mọi luồng đọc và ghi khác.'
      },
      timeComplexity: 'O(1) hash table lock acquisition, O(V + E) Tarjan cycle detection for deadlocks',
      spaceComplexity: 'O(Active Locks) in shared memory hash table',
      ioCostFormula: 'Lock Overhead = In-memory Mutex Latch + Wait-Queue Context Switch'
    }
  },

  pageLayout: {
    title: {
      en: 'Lock Manager Granular Hierarchy (Database -> Table -> Page -> Row)',
      vi: 'Phân cấp khóa Đa hạt mức (Database -> Table -> Page -> Row)'
    },
    description: {
      en: 'To allow coarse table locks alongside fine-grained row locks without checking every row, engines use Intent Locks: Intent Shared (IS) and Intent Exclusive (IX).',
      vi: 'Để khóa toàn bảng mà không phải kiểm tra từng dòng, engine dùng Khóa Ý Định (Intent Lock): Intent Shared (IS) và Intent Exclusive (IX).'
    },
    asciiDiagram: `+--------------------------------------------------------------------------+
| DATABASE LEVEL:                                                          |
|       [ IS: Intent Shared ]           [ IX: Intent Exclusive ]           |
|                 |                                |                       |
| TABLE LEVEL:    v                                v                       |
|       [ Table IS Lock ]               [ Table IX Lock ]                  |
|                 |                                |                       |
| ROW LEVEL:      v                                v                       |
|       [ Row S Lock (Read) ]           [ Row X Lock (UPDATE / DELETE) ]   |
+--------------------------------------------------------------------------+
| DEADLOCK DETECTION (Wait-For Graph in Shared Memory):                    |
|       Tx 1 holds Lock A, waits for Lock B (held by Tx 2)                 |
|       Tx 2 holds Lock B, waits for Lock A (held by Tx 1) ---> CYCLE!     |
|       Action: Abort youngest Tx (Victim) with SQLState 40P01             |
+--------------------------------------------------------------------------+`,
    headerFields: [
      { name: 'LockMode', size: '1 Byte (IS, IX, S, SIX, X)', description: { en: 'Compatibility matrix mode of requested lock', vi: 'Chế độ tương thích của khóa được yêu cầu' } },
      { name: 'Granted / Waiters', size: 'Doubly-linked queues', description: { en: 'Queues of granted transactions and sleeping threads waiting on resource', vi: 'Hàng đợi các giao dịch đã được cấp khóa và các luồng đang ngủ chờ khóa' } }
    ]
  },

  detailedTheory: {
    overview: {
      en: 'Two-Phase Locking (2PL) is the foundational mathematical protocol guaranteeing Conflict Serializability in database management systems. Invented by Eswaran, Gray, Lorie, and Traiger in 1976, 2PL balances concurrent transaction throughput with mathematical correctness by dividing lock acquisition and release into two distinct non-overlapping phases: the Growing Phase and the Shrinking Phase.',
      vi: 'Khóa Hai Pha (Two-Phase Locking - 2PL) là giao thức toán học nền tảng bảo đảm tính Tuần Tự Hóa Xung Đột (Conflict Serializability) trong các hệ quản trị cơ sở dữ liệu. Được phát minh bởi Eswaran, Gray, Lorie và Traiger vào năm 1976, 2PL cân bằng giữa thông lượng xử lý giao dịch đồng thời và tính đúng đắn toán học bằng cách chia quá trình xin khóa và nhả khóa thành hai pha độc lập không giao nhau: Pha Mở Rộng (Growing Phase) và Pha Thu Hẹp (Shrinking Phase).'
    },
    deepDiveParagraphs: [
      {
        en: '1. The 2PL Serializability Theorem & Cascading Aborts: The fundamental theorem of 2PL states that if all transactions in an execution schedule obey the two-phase rule (no lock may be acquired after any lock has been released), then the resulting execution schedule is guaranteed to be conflict serializable. However, pure 2PL has a major flaw: Cascading Aborts. If Transaction 1 releases a Shared or Exclusive lock during its shrinking phase and later rolls back, any subsequent transaction that read that uncommitted state must also be forcibly aborted, triggering a domino effect of rollbacks across the database.',
        vi: '1. Định lý Tuần Tự Hóa 2PL & Hiệu Ứng Hủy Bỏ Dây Chuyền (Cascading Aborts): Định lý cốt lõi của 2PL khẳng định: nếu mọi giao dịch trong hệ thống đều tuân thủ quy tắc hai pha (không bao giờ được xin thêm bất kỳ khóa nào sau khi đã nhả một khóa), thì lịch trình thực thi chắc chắn tương đương với việc chạy tuần tự từng giao dịch. Tuy nhiên, 2PL thuần túy có một nhược điểm chí mạng: Hủy bỏ dây chuyền. Nếu Giao dịch 1 nhả khóa trong pha thu hẹp rồi sau đó bị ROLLBACK, bất kỳ giao dịch nào đọc dữ liệu đó cũng bắt buộc phải bị hủy theo, tạo ra phản ứng dây chuyền làm sập hàng loạt giao dịch trên toàn hệ thống.'
      },
      {
        en: '2. Strict 2PL (S2PL) vs Rigorous 2PL (SS2PL): To eliminate cascading aborts, enterprise database engines implement Strict 2PL (S2PL): Exclusive (X) locks must be held until the very end of the transaction (COMMIT or ROLLBACK). Rigorous 2PL (Strict Serial 2PL) is even stricter: it holds BOTH Shared (S) and Exclusive (X) locks until the transaction terminates. While Rigorous 2PL eliminates all cascading rollbacks and guarantees serial order matching commit order, it reduces read concurrency because shared read locks block concurrent writes for the entire duration of the transaction.',
        vi: '2. Khóa Hai Pha Nghiêm Ngặt (Strict 2PL) vs Khóa Cực Đoan (Rigorous 2PL): Để triệt tiêu hủy bỏ dây chuyền, các database doanh nghiệp sử dụng Strict 2PL: toàn bộ khóa Độc quyền (Exclusive X) bắt buộc phải được giữ cho tới khi giao dịch kết thúc (COMMIT hoặc ROLLBACK). Rigorous 2PL còn khắt khe hơn: nó giữ CẢ khóa Đọc (Shared S) lẫn khóa Ghi (Exclusive X) cho tới khi kết thúc giao dịch. Dù Rigorous 2PL bảo đảm thứ tự tuần tự tuyệt đối, nó làm giảm thông lượng đọc ghi đồng thời do các khóa đọc chiếm giữ tài nguyên suốt chiều dài giao dịch.'
      },
      {
        en: '3. Multiple Granularity Locking (MGL) & Intent Locks: Real databases manage locks across a hierarchy: Database -> Table -> Page -> Row. If Transaction 1 wants to lock a single row exclusively, how does Transaction 2 know whether it can lock the whole table without scanning 100,000,000 rows? Solution: Intent Locks (Intent Shared IS, Intent Exclusive IX). Before acquiring an exclusive lock on a row, Tx 1 must first acquire an IX lock on the table. When Tx 2 requests an Exclusive table lock, it conflicts with the table IX lock in O(1) time and waits, eliminating millions of row inspections.',
        vi: '3. Khóa Đa Phân Cấp (Multiple Granularity Locking) & Khóa Ý Định (Intent Locks): Cơ sở dữ liệu thực tế quản lý khóa theo cây phân cấp: Database -> Bảng (Table) -> Trang (Page) -> Dòng (Row). Nếu Giao dịch 1 muốn khóa độc quyền 1 dòng, làm sao Giao dịch 2 biết có được phép khóa toàn bộ bảng hay không mà không phải quét qua 100 triệu dòng? Giải pháp là Khóa Ý Định (IS, IX). Trước khi khóa dòng, Giao dịch 1 phải xin khóa IX trên bảng. Khi Giao dịch 2 xin khóa toàn bảng, nó sẽ thấy ngay khóa IX đang tồn tại trong thời gian O(1) và dừng lại chờ, loại bỏ hoàn toàn việc phải kiểm tra từng dòng đơn lẻ.'
      }
    ],
    enterprisePitfalls: [
      {
        en: 'Lock Escalation in SQL Server / Oracle: When a transaction accumulates more than 5,000 row locks during a batch update, the Lock Manager memory overhead threatens system stability and escalates the locks into a single Exclusive Table Lock, instantly paralyzing all other concurrent application traffic.',
        vi: 'Hiện tượng Thăng cấp Khóa (Lock Escalation): Khi một giao dịch gom quá 5,000 khóa dòng trong một câu lệnh UPDATE hàng loạt, dung lượng RAM của Lock Manager bị đe dọa và tự động thăng cấp thành Khóa Độc Quyền Toàn Bảng, làm tê liệt toàn bộ các luồng truy cập khác của ứng dụng.'
      },
      {
        en: 'InnoDB Next-Key Gap Lock Deadlocks under REPEATABLE READ: In MySQL InnoDB, SELECT ... FOR UPDATE on non-existent records acquires Gap Locks preventing concurrent inserts into the index gap. When two transactions acquire overlapping gap locks and simultaneously try to insert into that gap, MySQL throws a 1213 Deadlock found exception.',
        vi: 'Khóa khoảng trống Next-Key Gap Lock trong MySQL InnoDB: Khi chạy SELECT ... FOR UPDATE trên một bản ghi không tồn tại, InnoDB khóa luôn các khoảng trống (gap) giữa các chỉ mục. Khi hai giao dịch cùng giữ gap lock và cùng cố chèn bản ghi vào khoảng trống đó, MySQL sẽ báo lỗi Deadlock 1213.'
      },
      {
        en: 'Holding Locks across Remote RPC Network Calls: Calling an external HTTP payment gateway or microservice REST API while holding an open database transaction lock keeps database connections and row locks blocked for seconds, exhausting database connection pools.',
        vi: 'Giữ khóa cơ sở dữ liệu khi đang gọi API mạng từ xa (RPC/HTTP): Gọi cổng thanh toán hoặc microservice bên thứ ba trong khi giao dịch DB đang mở sẽ giữ khóa dòng suốt nhiều giây, làm cạn kiệt connection pool của cơ sở dữ liệu.'
      }
    ]
  },

  steps: [
    {
      id: 'acquire-lock',
      title: { en: '1. Acquire Intent & Row Lock in Growing Phase', vi: '1. Xin khóa Ý định (Intent) và khóa Dòng trong Pha Mở Rộng' },
      phase: 'LOCK_GROWTH',
      description: {
        en: 'Before updating row #102, Transaction 1 acquires an Intent Exclusive (IX) lock on the table, then an Exclusive (X) lock on row #102. If another transaction holds a conflicting lock, Tx 1 enters the waiters queue and sleeps on a condition variable.',
        vi: 'Trước khi cập nhật dòng #102, Giao dịch 1 xin khóa Intent Exclusive (IX) trên bảng, sau đó xin khóa Exclusive (X) trên dòng #102. Nếu đang có giao dịch khác giữ khóa xung đột, Tx 1 đi vào hàng đợi và ngủ chờ tín hiệu.'
      },
      diskIoBehavior: {
        en: 'In-memory Lock Manager hash table operation. Zero disk I/O.',
        vi: 'Thao tác bảng băm Lock Manager trong RAM. Không có I/O đĩa.'
      },
      javaCodeLineMatch: 'lockManager.acquireLock(txId, resourceId, LockMode.EXCLUSIVE)'
    },
    {
      id: 'deadlock-check',
      title: { en: '2. Deadlock Detection via Wait-For Cycle Search', vi: '2. Phát hiện Deadlock qua thuật toán tìm chu trình đồ thị' },
      phase: 'DEADLOCK_DETECTION',
      description: {
        en: 'A background thread wakes every 1 second (or when a lock wait times out) to construct a directed Wait-For Graph (WFG) where nodes are active transactions and edges represent "Tx A waits for Tx B". It runs Tarjans or DFS cycle detection algorithm to identify circular dependencies.',
        vi: 'Tiến trình ngầm thức dậy mỗi 1 giây để xây dựng đồ thị chờ Wait-For Graph (WFG) với đỉnh là các transaction và cạnh biểu diễn "Tx A chờ Tx B". Nó chạy thuật toán DFS tìm chu trình để phát hiện tắc nghẽn khóa.'
      },
      diskIoBehavior: {
        en: 'CPU-bound graph traversal in RAM.',
        vi: 'Duyệt đồ thị trên CPU trong RAM.'
      },
      javaCodeLineMatch: 'if (waitForGraph.hasCycle())'
    },
    {
      id: 'commit-release',
      title: { en: '3. Hold Locks until COMMIT & Batch Release', vi: '3. Giữ toàn bộ khóa cho tới COMMIT và nhả hàng loạt' },
      phase: 'SHRINKING_PHASE',
      description: {
        en: 'Under Strict 2PL, no locks are released when individual statements finish. All acquired table, page, and row locks are released atomically at the very end when the COMMIT WAL record is fsynced, waking waiting threads.',
        vi: 'Dưới chuẩn Strict 2PL, không khóa nào được nhả khi kết thúc câu lệnh lẻ. Toàn bộ khóa bảng, trang và dòng được nhả đồng loạt tại thời điểm bản ghi COMMIT WAL được fsync, đánh thức các luồng đang chờ.'
      },
      diskIoBehavior: {
        en: 'Occurs immediately after WAL commit fsync is confirmed.',
        vi: 'Xảy ra ngay sau khi bản ghi commit WAL được xác nhận fsync.'
      },
      javaCodeLineMatch: 'releaseAllLocksAtCommit(txId)'
    }
  ],

  productionEngines: [
    {
      engine: 'PostgreSQL Lock Manager',
      implementationName: 'LockMethodData & PROCLOCK Entries',
      keyMechanism: {
        en: 'PostgreSQL uses lightweight latches for memory structures and heavy-weight Locks for SQL objects. Deadlock detection runs after `deadlock_timeout` (default 1000ms). The victim transaction is aborted with error code 40P01.',
        vi: 'PostgreSQL dùng Latch nhẹ cho cấu trúc RAM và Lock nặng cho đối tượng SQL. Tiến trình phát hiện deadlock thức dậy sau `deadlock_timeout` (1000ms). Giao dịch nạn nhân bị hủy với lỗi 40P01.'
      },
      defaultTuningConfig: 'deadlock_timeout = 1s, max_locks_per_transaction = 64',
      architectureNote: {
        en: 'Allocates lock tables in shared memory sized by max_connections * max_locks_per_transaction.',
        vi: 'Cấp phát bảng khóa trong shared memory dựa trên số lượng max_connections * max_locks.'
      }
    },
    {
      engine: 'MySQL InnoDB Lock System',
      implementationName: 'lock_sys_t Bitmap Record Locks',
      keyMechanism: {
        en: 'InnoDB stores record locks as bit arrays attached to page descriptors in `lock_sys`. Deadlock detection is instant via recursive wait-for graph inspection.',
        vi: 'InnoDB lưu khóa bản ghi dạng mảng bit gắn vào page descriptor. Việc phát hiện deadlock diễn ra tức thì bằng cách duyệt đệ quy đồ thị chờ.'
      },
      defaultTuningConfig: 'innodb_deadlock_detect = on, innodb_lock_wait_timeout = 50',
      architectureNote: {
        en: 'High-throughput systems often disable innodb_deadlock_detect under massive concurrency to prevent CPU lock manager saturation.',
        vi: 'Hệ thống chịu tải cực lớn thường tắt innodb_deadlock_detect để tránh nghẽn CPU do kiểm tra đồ thị liên tục.'
      }
    },
    {
      engine: 'Oracle Database 19c/23ai Strict 2PL & Lock Escalation Freedom',
      implementationName: 'Interested Transaction List (ITL) & Non-Escalating Row Locks',
      keyMechanism: {
        en: 'Oracle implements Strict 2PL for row mutations (X-locks held until COMMIT/ROLLBACK). However, locks are recorded directly inside the block header (ITL slots) and row lock byte rather than in a memory lock table. Consequently, Oracle NEVER escalates row locks to page or table locks, completely eliminating lock escalation deadlocks.',
        vi: 'Oracle thực thi Strict 2PL cho các thao tác sửa đổi dòng (giữ khóa độc quyền X cho đến khi COMMIT/ROLLBACK). Tuy nhiên, thông tin khóa được ghi trực tiếp vào header của block (các khe ITL) và byte cờ của dòng thay vì bảng khóa tập trung trong RAM. Do đó, Oracle TUYỆT ĐỐI KHÔNG BAO GIỜ leo thang khóa (lock escalation) từ khóa dòng lên khóa trang hay khóa bảng, loại bỏ hoàn toàn deadlock do leo thang khóa.'
      },
      defaultTuningConfig: "ALTER TABLE transactions INITRANS 10 MAXTRANS 255; SELECT ... FOR UPDATE SKIP LOCKED;",
      architectureNote: {
        en: 'Oracle detects deadlocks in real-time and raises ORA-00060, rolling back only the single offending statement rather than terminating the entire client transaction.',
        vi: 'Oracle phát hiện deadlock theo thời gian thực và bắn lỗi ORA-00060, chỉ tự động hoàn tác đúng câu lệnh gây nghẽn chứ không hủy bỏ toàn bộ phiên giao dịch của ứng dụng.'
      }
    }
  ],

  tradeoffs: {
    pros: [
      { en: 'Guarantees absolute conflict serializability and eliminates all write-write conflicts.', vi: 'Bảo đảm tính tuần tự hóa tuyệt đối và triệt tiêu hoàn toàn xung đột ghi-ghi.' },
      { en: 'Completely prevents cascading aborts (dirty reads never occur).', vi: 'Triệt tiêu hoàn toàn hiện tượng hủy dây chuyền do không có đọc bẩn.' }
    ],
    cons: [
      { en: 'Deadlock vulnerability: Concurrent transactions acquiring locks in different orders inevitably deadlock.', vi: 'Dễ xảy ra Deadlock: Các giao dịch xin khóa khác thứ tự sẽ dẫn tới tắc nghẽn khóa.' },
      { en: 'Concurrency bottleneck: Long-running update transactions block all other transactions on those rows.', vi: 'Nút thắt cổ chai: Giao dịch chạy lâu sẽ chặn đứng các câu lệnh khác thao tác trên cùng dòng.' }
    ],
    writeAmplification: {
      en: 'No extra storage amplification; lock table resides entirely in RAM.',
      vi: 'Không tốn chi phí lưu trữ trên đĩa; toàn bộ bảng khóa nằm trọn trong RAM.'
    },
    recoveryGuarantee: {
      en: 'Locks are discarded on server crash; recovery rebuilds active locks during ARIES analysis.',
      vi: 'Khóa được xóa sạch khi máy chủ gặp sự cố; ARIES tái tạo lại trạng thái giao dịch khi khởi động.'
    }
  },

  springBootCode: `# ===================================================================
# Spring Boot 3.x application.yml - Lock Timeout & Deadlock Tuning
# ===================================================================
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
  jpa:
    properties:
      jakarta:
        persistence:
          # Fail fast when row lock cannot be acquired within 3 seconds
          lock.timeout: 3000

---
// ===================================================================
// Spring Data JPA Repository with Explicit Strict 2PL Pessimistic Lock
// ===================================================================
package com.enterprise.hotel.repository;

import com.enterprise.hotel.entity.RoomReservation;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.util.Optional;

public interface RoomReservationRepository extends JpaRepository<RoomReservation, Long> {

    /**
     * Strict 2PL: Acquires Exclusive (X) row lock immediately.
     * Generates: SELECT ... FOR UPDATE NOWAIT
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({
        @QueryHint(name = "jakarta.persistence.lock.timeout", value = "2000") // 2s timeout
    })
    @Query("SELECT r FROM RoomReservation r WHERE r.roomId = :roomId")
    Optional<RoomReservation> findRoomForBooking(@Param("roomId") Long roomId);
}`,

  sqlQueries: `-- 1. Demonstrate Strict 2PL Exclusive Lock with NOWAIT
BEGIN;

-- Lock specific room row exclusively in MySQL / PostgreSQL
SELECT * FROM room_reservations 
WHERE room_id = 501 
FOR UPDATE NOWAIT; -- If already locked by another user, fails immediately without blocking!

-- Perform booking business logic
UPDATE room_reservations 
SET status = 'BOOKED', customer_id = 999 
WHERE room_id = 501;

COMMIT; -- All acquired locks released simultaneously at commit!

-- 2. Inspect active locks and waiting transactions in PostgreSQL
SELECT 
    pid, 
    usename, 
    pg_blocking_pids(pid) AS blocked_by, 
    query, 
    state, 
    wait_event_type, 
    wait_event
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;`,

  javaCode: `package com.database.internals.concurrency;

import java.util.*;

/**
 * Pure Java 21 implementation of a Strict 2PL Lock Manager with Deadlock Detection.
 */
public class StrictTwoPhaseLockManager {
    public enum LockMode { SHARED, EXCLUSIVE }

    public static class LockRequest {
        public final long txId;
        public final LockMode mode;
        public LockRequest(long txId, LockMode mode) { this.txId = txId; this.mode = mode; }
    }

    private final Map<String, List<LockRequest>> grantedLocks = new HashMap<>();
    private final Map<Long, Set<String>> txHeldLocks = new HashMap<>();

    // Step 1: Growing Phase - Acquire Lock and enforce conflict rules
    public synchronized boolean acquireLock(long txId, String resourceId, LockMode requestedMode) {
        List<LockRequest> current = grantedLocks.computeIfAbsent(resourceId, k -> new ArrayList<>());

        if (current.isEmpty()) {
            grant(txId, resourceId, requestedMode, current);
            return true;
        }

        // Check compatibility matrix
        if (requestedMode == LockMode.SHARED) {
            boolean onlyShared = current.stream().allMatch(r -> r.mode == LockMode.SHARED);
            if (onlyShared) {
                grant(txId, resourceId, requestedMode, current);
                return true;
            }
        }

        // Conflict: must wait or trigger deadlock detection
        return false;
    }

    private void grant(long txId, String resourceId, LockMode mode, List<LockRequest> current) {
        current.add(new LockRequest(txId, mode));
        txHeldLocks.computeIfAbsent(txId, k -> new HashSet<>()).add(resourceId);
    }

    // Step 2: Deadlock Detection via Wait-For Graph (Cycle Search)
    public synchronized boolean hasDeadlockCycle(long waitingTx, long blockingTx) {
        // Directed cycle detection: waitingTx -> blockingTx -> ... -> waitingTx
        Set<Long> visited = new HashSet<>();
        Queue<Long> queue = new LinkedList<>();
        queue.add(blockingTx);

        while (!queue.isEmpty()) {
            long curr = queue.poll();
            if (curr == waitingTx) return true; // Step 2: Cycle detected! Deadlock!
            visited.add(curr);
            // Expand transactions that 'curr' is waiting on...
        }
        return false;
    }

    // Step 3: Shrinking Phase - Release all locks atomically at COMMIT
    public synchronized void releaseAllLocksAtCommit(long txId) {
        Set<String> resources = txHeldLocks.remove(txId);
        if (resources != null) {
            for (String res : resources) {
                List<LockRequest> list = grantedLocks.get(res);
                if (list != null) {
                    list.removeIf(r -> r.txId == txId);
                    if (list.isEmpty()) grantedLocks.remove(res);
                }
            }
        }
        notifyAll(); // Wake up blocked threads
    }
}`,

  productionProblemCase: {
    title: {
      en: 'High-Concurrency Inventory Deadlocks in Flash Sale Multi-Item Checkouts',
      vi: 'Xung Đột Deadlock Kẹt Cứng Hàng Ngàn Kết Nối Trong Flash Sale Giỏ Hàng'
    },
    businessContext: {
      en: 'During a Black Friday flash sale, thousands of users simultaneously purchase combo bundles. Transaction 1 attempts to lock and reserve [iPhone, AirPods]; Transaction 2 concurrently purchases [AirPods, iPhone].',
      vi: 'Trong chiến dịch Flash Sale Black Friday, hàng ngàn người dùng đồng thời mua các combo nhiều sản phẩm. Giao dịch 1 muốn khóa giữ chỗ [iPhone, Tai nghe AirPods]; Giao dịch 2 đồng thời mua combo [Tai nghe AirPods, iPhone].'
    },
    problemDescription: {
      en: 'Without a standardized lock acquisition protocol, Transaction 1 acquires an exclusive X-Lock on the iPhone row and requests a lock on AirPods. Simultaneously, Transaction 2 acquires an X-Lock on AirPods and requests a lock on iPhone. Under Strict 2-Phase Locking (SS2PL), transactions are in their Growing Phase: they CANNOT release any lock until final COMMIT or ROLLBACK. This forms a closed circular dependency (Wait-For Graph: Tx 1 -> Tx 2 -> Tx 1). The database engine deadlock detector periodically pauses, finds the cycle, and kills one transaction with DeadlockLoserDataAccessException. At 10,000 req/s, over 8% of checkouts fail violently, and blocked threads saturate the connection pool.',
      vi: 'Nếu không có quy chuẩn thứ tự khóa, Giao dịch 1 chiếm độc quyền khóa ghi (X-Lock) trên dòng iPhone rồi gửi tiếp yêu cầu khóa Tai nghe. Cùng tích tắc đó, Giao dịch 2 chiếm X-Lock trên Tai nghe và gửi yêu cầu khóa iPhone. Theo nguyên lý Strict 2-Phase Locking (SS2PL), cả 2 giao dịch đều đang trong Giai đoạn Mở rộng (Growing Phase): chúng TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP nhả khóa trước khi kết thúc COMMIT hoặc ROLLBACK. Điều này tạo ra một vòng lặp phụ thuộc khép kín (Wait-For Graph: Tx 1 -> Tx 2 -> Tx 1). Trình phát hiện deadlock của database phải kích hoạt quét đồ thị, hủy bỏ một giao dịch và quăng lỗi DeadlockLoserDataAccessException. Ở mức 10.000 req/s, hơn 8% đơn hàng bị sập, các luồng bị kẹt cứng làm kiệt quệ connection pool.'
    },
    whyNaiveFails: {
      en: 'Relying on database automatic deadlock resolution is an operational disaster. Deadlock detection requires O(V + E) cycle traversal over active transactions. Aborting transactions wastes CPU and database I/O, while client retries amplify traffic spikes (thundering herd problem).',
      vi: 'Trông cậy vào cơ chế tự giải quyết deadlock của database là một sai lầm vận hành nghiêm trọng. Việc phát hiện deadlock đòi hỏi thuật toán duyệt đồ thị O(V + E) trên toàn bộ các giao dịch đang chạy. Việc CSDL tự ý abort giao dịch gây lãng phí CPU và I/O đĩa, trong khi phía client đồng loạt thử lại (retry) sẽ tạo ra làn sóng quá tải cấp số nhân (thundering herd).'
    },
    coreSolution: {
      en: '1. Deterministic Lock Ordering: Sort all target resource IDs in ascending natural order (e.g., Collections.sort(productIds)) BEFORE issuing SQL lock statements. Both Tx 1 and Tx 2 will lock iPhone first, then AirPods. This mathematically eliminates cycles in the Wait-For Graph, turning deadlocks into clean FIFO queues.\n2. Non-blocking Task Queues with SELECT ... FOR UPDATE SKIP LOCKED: For background order consumption or job queues, use SKIP LOCKED so workers bypass locked rows instead of waiting.\n3. Fail-fast with NOWAIT or statement timeout: Prevents indefinite connection thread hangs under sudden network partitions.',
      vi: '1. Quy Tắc Sắp Xếp Khóa Xác Định (Deterministic Lock Ordering): Sắp xếp toàn bộ danh sách ID sản phẩm theo thứ tự tăng dần (Collections.sort(productIds)) TRƯỚC KHI gửi câu lệnh khóa SQL! Khi đó cả Giao dịch 1 và Giao dịch 2 đều bắt buộc phải khóa iPhone trước, rồi mới tới Tai nghe. Về mặt toán học, điều này triệt tiêu hoàn toàn khả năng sinh chu trình trong đồ thị Wait-For Graph, biến deadlock thành hàng đợi xếp hàng FIFO tự nhiên.\n2. Hàng Đợi Bất Đồng Bộ với SELECT ... FOR UPDATE SKIP LOCKED: Với các worker xử lý đơn hàng ngầm, dùng cờ SKIP LOCKED để worker tự động bỏ qua các bản ghi đang bị khóa thay vì đứng đợi.\n3. Fail-fast bằng NOWAIT hoặc Statement Timeout: Giúp giải phóng luồng kết nối ngay lập tức thay vì treo cứng kết nối hàng chục giây.'
    },
    productionCode: `// Spring Boot 3.x Production Service with Deterministic Lock Ordering
@Service
public class FlashSaleInventoryService {

    @Autowired
    private ProductInventoryRepository inventoryRepo;

    @Transactional(isolation = Isolation.READ_COMMITTED, timeout = 5)
    public boolean reserveBundleInventory(List<Long> requestedProductIds, int quantity) {
        // Step 1: CRITICAL - Sort IDs in strictly ascending order to prevent 2PL Deadlocks!
        List<Long> sortedIds = requestedProductIds.stream()
            .distinct()
            .sorted()
            .toList();

        // Step 2: Acquire Pessimistic Write Locks (SELECT ... FOR UPDATE) in deterministic order
        List<ProductInventory> lockedItems = inventoryRepo.findAllByIdForUpdate(sortedIds);

        // Step 3: Verify all stocks and decrement
        for (ProductInventory item : lockedItems) {
            if (item.getAvailableStock() < quantity) {
                throw new InsufficientStockException("Out of stock for item: " + item.getId());
            }
            item.setAvailableStock(item.getAvailableStock() - quantity);
        }
        return true;
        // Step 4: Strict 2PL Shrinking Phase releases all locks atomically on COMMIT!
    }
}`,
    architectureImpact: {
      en: 'Deadlock rate dropped from 8.4% down to 0.00% (Zero Deadlocks). P99 checkout latency plummeted from 4,200ms to 18ms. HikariCP connection starvation was completely eliminated.',
      vi: 'Tỷ lệ Deadlock giảm từ 8.4% xuống đúng 0.00% (Triệt tiêu hoàn toàn Deadlock). Độ trễ P99 của API thanh toán giảm sâu từ 4.200ms xuống chỉ còn 18ms. Hoàn toàn chấm dứt tình trạng cạn kiệt kết nối HikariCP.'
    }
  }
};
