import type { CdcTopic } from '../types';
import { CDC_CITATIONS } from '../citations';

export const dualWriteCdcFundamentalsTopic: CdcTopic = {
  id: 'dual-write-cdc-fundamentals',
  category: 'cdc-foundations',
  level: 'beginner',
  chapter: 'Chương 01',
  name: 'Dual-Write Problem & CDC Approaches',
  tagline: {
    vi: 'Vì sao "ghi DB rồi publish Kafka" không bao giờ atomic, và 3 cách bắt thay đổi: query-based polling, trigger, log-based CDC.',
    en: 'Why "write the DB then publish to Kafka" is never atomic, and the three capture strategies: query-based polling, triggers and log-based CDC.'
  },
  difficulty: 1,
  order: 1,
  estimatedMinutes: 20,

  coreTheory: {
    problemStatement: {
      vi: 'Service Order cần lưu đơn vào PostgreSQL và đồng thời đẩy sự kiện OrderPlaced sang Kafka để Search, Cache và Analytics cập nhật. Hai hệ thống này không chung transaction: nếu process chết, broker timeout hay deploy giữa hai lệnh ghi, một bên có dữ liệu còn bên kia không — và không ai biết để sửa.',
      en: 'The Order service must store an order in PostgreSQL and publish OrderPlaced to Kafka so Search, Cache and Analytics stay in sync. The two systems share no transaction: if the process dies, the broker times out or a deploy lands between the writes, one side has the data and the other does not — silently.'
    },
    hardwareConstraint: {
      vi: 'Không có distributed transaction rẻ: XA/2PC giữa Postgres và Kafka không được Kafka hỗ trợ, và kể cả khi có thì coordinator là điểm nghẽn, giữ lock qua network round-trip. Lỗi mạng là bình thường chứ không phải ngoại lệ.',
      en: 'There is no cheap distributed transaction: Kafka does not participate in XA/2PC with Postgres, and even where 2PC exists the coordinator holds locks across network round-trips. Network faults are the norm, not the exception.'
    },
    fundamentalSolution: {
      vi: 'Chỉ ghi vào MỘT nơi — database — và coi transaction log (WAL/binlog) là nguồn sự thật. Một tiến trình CDC đọc log theo thứ tự commit và publish sang Kafka. Vì log chỉ chứa giao dịch đã commit, mọi hệ thống dẫn xuất cuối cùng hội tụ (eventual consistency) về đúng trạng thái DB.',
      en: 'Write to ONE place — the database — and treat its transaction log (WAL/binlog) as the source of truth. A CDC process tails the log in commit order and publishes to Kafka. Because the log only contains committed transactions, every derived system eventually converges on the database state.'
    },
    math: {
      formula: String.raw`P_{\text{diverge}} = p_{db}\,(1 - p_{mq}) + p_{mq}\,(1 - p_{db}) \;\approx\; p_{db} + p_{mq}`,
      description: {
        vi: 'Với dual-write, mỗi request có xác suất lệch dữ liệu bằng xác suất đúng MỘT trong hai lệnh ghi thất bại. Với 10 triệu đơn/ngày và p_mq = 10⁻⁵ (timeout broker), mỗi ngày có ~100 đơn "biến mất" khỏi search index. Log-based CDC đưa xác suất này về 0 vì chỉ còn một lệnh ghi.',
        en: 'With dual writes, each request diverges when exactly ONE of the two writes fails. At 10M orders/day and p_mq = 10⁻⁵ (broker timeouts), ~100 orders a day vanish from the search index. Log-based CDC drives this to 0 because only one write remains.'
      },
      timeComplexity: 'O(1) extra work per commit (log already written)',
      spaceComplexity: 'O(WAL retained until consumed)'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Có ba họ kỹ thuật CDC. Cả ba đều tránh dual-write ở tầng ứng dụng, nhưng khác nhau về độ trễ, tải lên DB và khả năng bắt DELETE.',
      en: 'There are three families of CDC. All avoid application-level dual writes, but they differ in latency, load on the database and whether they see DELETEs.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Query-based (polling): chạy định kỳ SELECT * FROM orders WHERE updated_at > :last. Đơn giản, không cần quyền đặc biệt, nhưng bỏ sót DELETE (dòng đã mất), bỏ sót các update trung gian giữa hai lần poll, phụ thuộc cột updated_at được set đúng và tạo tải quét bảng lặp lại. Độ trễ ≥ chu kỳ poll.',
        en: 'Query-based (polling): periodically SELECT * FROM orders WHERE updated_at > :last. Simple and needs no special privileges, but misses DELETEs (the row is gone), misses intermediate updates between polls, depends on updated_at being maintained and adds repeated scan load. Latency ≥ poll interval.'
      },
      {
        vi: 'Trigger-based: trigger AFTER INSERT/UPDATE/DELETE ghi vào bảng audit/shadow. Bắt được DELETE và before-image, nhưng nhân đôi lượng ghi trong chính transaction nghiệp vụ, làm chậm mọi write và khó bảo trì khi schema đổi.',
        en: 'Trigger-based: AFTER INSERT/UPDATE/DELETE triggers write to an audit/shadow table. Captures DELETEs and before-images, but doubles write volume inside the business transaction, slows every write and is painful to maintain as schemas evolve.'
      },
      {
        vi: 'Log-based: đọc WAL (Postgres logical decoding) hoặc binlog (MySQL ROW format). Không tốn thêm write vì DB vốn phải ghi log để đảm bảo durability; bắt được mọi INSERT/UPDATE/DELETE theo đúng thứ tự commit với độ trễ mili-giây. Đổi lại cần cấu hình DB (wal_level=logical, binlog_format=ROW) và vận hành slot/retention cẩn thận. Debezium là hiện thực phổ biến nhất.',
        en: 'Log-based: read the WAL (Postgres logical decoding) or binlog (MySQL ROW format). No extra writes because the database must write the log for durability anyway; captures every INSERT/UPDATE/DELETE in commit order with millisecond latency. The cost is database configuration (wal_level=logical, binlog_format=ROW) and careful slot/retention operations. Debezium is the most widespread implementation.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Gọi kafkaTemplate.send() bên trong @Transactional và tưởng là atomic: transaction DB có thể rollback SAU khi message đã gửi → consumer thấy đơn hàng không tồn tại.',
        en: 'Calling kafkaTemplate.send() inside @Transactional and assuming atomicity: the DB transaction can roll back AFTER the message is sent → consumers see an order that never existed.'
      },
      {
        vi: 'Dùng @TransactionalEventListener(AFTER_COMMIT) để publish: chỉ dời cửa sổ lỗi ra sau commit, process vẫn có thể chết trước khi gửi.',
        en: 'Publishing from @TransactionalEventListener(AFTER_COMMIT): this merely moves the failure window after the commit; the process can still die before sending.'
      },
      {
        vi: 'Polling theo updated_at với độ chính xác giây: các dòng commit cùng giây nhưng sau lần poll sẽ bị bỏ qua vĩnh viễn.',
        en: 'Polling on a second-precision updated_at: rows committed in the same second but after the poll are skipped forever.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Dual-write (lỗi) so với Log-based CDC (hội tụ)',
      en: 'Dual write (broken) vs log-based CDC (convergent)'
    },
    description: {
      vi: 'Ở trên: ứng dụng ghi hai nơi, crash giữa chừng gây lệch. Ở dưới: ứng dụng chỉ ghi DB, CDC đọc log và publish.',
      en: 'Top: the app writes two places and a crash in between causes divergence. Bottom: the app writes only the DB, CDC tails the log and publishes.'
    },
    asciiDiagram: `
 ❌ DUAL WRITE
 OrderService ──(1) INSERT──▶ PostgreSQL        ✓ committed
      │
      └──────(2) send() ──X── Kafka "orders"     ✗ crash / timeout
                                   │
                         Search index: order missing  ⇒  DIVERGED

 ✅ LOG-BASED CDC
 OrderService ──INSERT──▶ PostgreSQL ──COMMIT──▶ WAL (LSN 0/16B3748)
                                                   │ logical decoding
                                         Debezium (Kafka Connect)
                                                   │ produce, key = PK
                                         Kafka "shop.public.orders"
                                         ├──▶ Elasticsearch sink
                                         ├──▶ Redis cache invalidator
                                         └──▶ Data warehouse
`,
    components: [
      {
        name: 'Source DB',
        role: 'Single write target',
        description: {
          vi: 'Nơi duy nhất ứng dụng ghi; transaction log là nguồn sự thật.',
          en: 'The only place the app writes; its log is the source of truth.'
        }
      },
      {
        name: 'Transaction log',
        role: 'WAL / binlog',
        description: {
          vi: 'Chuỗi append-only các thay đổi đã commit, có vị trí tăng dần (LSN/GTID).',
          en: 'Append-only sequence of committed changes with monotonically increasing positions (LSN/GTID).'
        }
      },
      {
        name: 'CDC connector',
        role: 'Log tailer',
        description: {
          vi: 'Đọc log, chuyển thành change event, lưu offset để resume sau crash.',
          en: 'Reads the log, converts to change events, stores offsets to resume after a crash.'
        }
      },
      {
        name: 'Derived stores',
        role: 'Materialized views',
        description: {
          vi: 'Search, cache, warehouse — có thể dựng lại hoàn toàn bằng cách replay.',
          en: 'Search, cache, warehouse — fully rebuildable by replaying.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'db-commit',
      title: { vi: 'Ứng dụng commit đơn hàng vào DB', en: 'App commits the order to the DB' },
      phase: 'Write #1',
      description: {
        vi: 'orderRepository.save() chạy trong transaction; COMMIT thành công, dòng mới đã bền vững trên đĩa.',
        en: 'orderRepository.save() runs inside a transaction; COMMIT succeeds and the row is durable.'
      },
      systemBehavior: {
        vi: 'PostgreSQL ghi record vào WAL và fsync trước khi trả lời COMMIT.',
        en: 'PostgreSQL appends the record to WAL and fsyncs before acknowledging COMMIT.'
      },
      codeLineMatch: 'orderRepository.save(Order.from(cmd))'
    },
    {
      id: 'publish-fails',
      title: {
        vi: 'Publish Kafka thất bại → dữ liệu lệch',
        en: 'Kafka publish fails → divergence'
      },
      phase: 'Write #2',
      description: {
        vi: 'Process bị OOM-kill trước khi kafkaTemplate.send() hoàn tất. DB có đơn, Kafka không có sự kiện, search index thiếu đơn.',
        en: 'The process is OOM-killed before kafkaTemplate.send() completes. The DB has the order, Kafka has no event, the search index misses it.'
      },
      systemBehavior: {
        vi: 'Không có cơ chế nào bù lại: retry nằm trong bộ nhớ process đã chết.',
        en: 'Nothing compensates: the retry lived in the memory of the dead process.'
      },
      codeLineMatch: 'kafkaTemplate.send("orders"'
    },
    {
      id: 'log-capture',
      title: { vi: 'Log-based CDC: chỉ còn một lệnh ghi', en: 'Log-based CDC: a single write' },
      phase: 'Capture',
      description: {
        vi: 'Ứng dụng chỉ ghi DB. Bản ghi commit nằm trong WAL với LSN tăng dần; Debezium đọc nó qua replication slot.',
        en: 'The app only writes the DB. The committed record sits in WAL at an increasing LSN; Debezium reads it via a replication slot.'
      },
      systemBehavior: {
        vi: 'Logical decoding chuyển WAL vật lý thành thay đổi mức dòng (INSERT orders …).',
        en: 'Logical decoding turns physical WAL into row-level changes (INSERT orders …).'
      },
      codeLineMatch: 'WAL record is written at COMMIT'
    },
    {
      id: 'converge',
      title: {
        vi: 'Sự kiện tới Kafka, hệ thống dẫn xuất hội tụ',
        en: 'Event reaches Kafka, derived stores converge'
      },
      phase: 'Converge',
      description: {
        vi: 'Debezium publish change event với key = id đơn hàng; consumer cập nhật Elasticsearch. Nếu connector chết, nó resume từ offset đã lưu.',
        en: 'Debezium publishes a change event keyed by the order id; consumers update Elasticsearch. If the connector dies it resumes from its stored offset.'
      },
      systemBehavior: {
        vi: 'At-least-once: có thể trùng sau crash, nên consumer phải idempotent (upsert theo key).',
        en: 'At-least-once: duplicates are possible after a crash, so consumers must be idempotent (upsert by key).'
      },
      codeLineMatch: '@KafkaListener(topics = "shop.public.orders"'
    }
  ],

  comparison: {
    title: { vi: 'So sánh 3 chiến lược CDC', en: 'Comparing the three CDC strategies' },
    subtitle: {
      vi: 'Độ trễ, tải DB và khả năng bắt DELETE',
      en: 'Latency, database load and DELETE visibility'
    },
    options: [
      {
        name: 'Query-based polling',
        tag: 'Simple',
        role: { vi: 'Poll theo cột updated_at', en: 'Poll on an updated_at column' },
        keyMechanism: {
          vi: 'SELECT định kỳ; không thấy DELETE và update trung gian; độ trễ = chu kỳ poll.',
          en: 'Periodic SELECT; blind to DELETEs and intermediate updates; latency = poll interval.'
        },
        configExample:
          'mode=timestamp+incrementing\ntimestamp.column.name=updated_at\npoll.interval.ms=5000',
        architectureNote: {
          vi: 'Hợp cho đồng bộ batch không cần chính xác tuyệt đối.',
          en: 'Fine for batch syncs that tolerate gaps.'
        }
      },
      {
        name: 'Log-based (Debezium)',
        tag: 'Recommended',
        role: { vi: 'Đọc WAL/binlog theo thứ tự commit', en: 'Tail WAL/binlog in commit order' },
        keyMechanism: {
          vi: 'Bắt mọi thay đổi kể cả DELETE, có before/after, độ trễ ms, không thêm write vào transaction.',
          en: 'Captures every change including DELETE with before/after images, ms latency, no extra writes in the transaction.'
        },
        configExample:
          'connector.class=io.debezium.connector.postgresql.PostgresConnector\nplugin.name=pgoutput\ntopic.prefix=shop',
        architectureNote: {
          vi: 'Cần vận hành replication slot và retention log.',
          en: 'Requires operating replication slots and log retention.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Loại bỏ hoàn toàn dual-write ở tầng ứng dụng.',
        en: 'Eliminates application-level dual writes entirely.'
      },
      {
        vi: 'Thứ tự sự kiện trùng thứ tự commit trong DB (per-key qua partition key).',
        en: 'Event order matches database commit order (per key via the partition key).'
      },
      {
        vi: 'Hệ thống dẫn xuất có thể dựng lại bằng snapshot + replay.',
        en: 'Derived systems can be rebuilt via snapshot + replay.'
      }
    ],
    cons: [
      {
        vi: 'Sự kiện phản ánh schema bảng, không phải domain event — dễ rò rỉ chi tiết nội bộ (giải bằng Outbox ở bài 06).',
        en: 'Events mirror table schemas, not domain events — internal details leak (solved by the Outbox in lesson 06).'
      },
      {
        vi: 'Eventual consistency: consumer luôn trễ vài ms–giây so với DB.',
        en: 'Eventual consistency: consumers always lag the DB by ms to seconds.'
      },
      {
        vi: 'Thêm một hệ thống phân tán cần giám sát (connector, slot, lag).',
        en: 'One more distributed system to monitor (connector, slot, lag).'
      }
    ],
    balance: {
      vi: 'Log-based CDC đổi độ trễ end-to-end (thường 50–500 ms) lấy tính đúng đắn tuyệt đối về việc "không mất thay đổi nào đã commit".',
      en: 'Log-based CDC trades end-to-end latency (typically 50–500 ms) for the hard guarantee that no committed change is ever lost.'
    },
    invariant: {
      vi: 'Mọi thay đổi đã commit sẽ xuất hiện ít nhất một lần, theo thứ tự commit trên cùng key.',
      en: 'Every committed change is delivered at least once, in commit order per key.'
    }
  },

  code: [
    {
      label: 'OrderService.java',
      filename: 'OrderService.java',
      language: 'java',
      code: `@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, OrderPlaced> kafkaTemplate;

    // ❌ NAIVE DUAL WRITE — two systems, no shared transaction
    @Transactional
    public Order placeOrderDualWrite(PlaceOrder cmd) {
        Order order = orderRepository.save(Order.from(cmd));
        // JVM crash, deploy or broker timeout here => DB has it, Kafka never does.
        kafkaTemplate.send("orders", order.id().toString(), OrderPlaced.of(order));
        return order; // and if the TX rolls back after send(), Kafka has a ghost order
    }

    // ✅ LOG-BASED CDC — the service writes only the database.
    // The WAL record is written at COMMIT; Debezium tails it and publishes.
    @Transactional
    public Order placeOrder(PlaceOrder cmd) {
        return orderRepository.save(Order.from(cmd));
    }
}

@Component
@RequiredArgsConstructor
class OrderSearchProjector {

    private final ElasticsearchOperations es;

    // Debezium topic naming: <topic.prefix>.<schema>.<table>
    @KafkaListener(topics = "shop.public.orders", groupId = "order-search")
    void on(ConsumerRecord<String, ChangeEvent<OrderRow>> rec) {
        ChangeEvent<OrderRow> ev = rec.value();
        if (ev == null || "d".equals(ev.op())) {          // tombstone or delete
            es.delete(rec.key(), OrderDoc.class);
            return;
        }
        es.save(OrderDoc.from(ev.after()));              // idempotent upsert by id
    }
}`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Mid',
      question: {
        vi: 'Tại sao không dùng @TransactionalEventListener(AFTER_COMMIT) để publish Kafka là đủ?',
        en: 'Why isn’t publishing from @TransactionalEventListener(AFTER_COMMIT) good enough?'
      },
      answer: {
        vi: 'Nó đảm bảo không publish sự kiện của transaction bị rollback, nhưng cửa sổ giữa COMMIT và send() vẫn tồn tại: process chết, Kafka không khả dụng hoặc retry hết hạn thì sự kiện mất vĩnh viễn vì không được lưu bền ở đâu. Cần một nơi lưu bền chung transaction với dữ liệu — chính là WAL (log-based CDC) hoặc bảng outbox.',
        en: 'It avoids publishing events of rolled-back transactions, but the window between COMMIT and send() remains: if the process dies, Kafka is unavailable or retries expire, the event is lost because it was never durably stored. You need durable storage inside the same transaction as the data — the WAL (log-based CDC) or an outbox table.'
      },
      trapWarning: {
        vi: 'Đừng trả lời "dùng Kafka transactions" — Kafka transaction chỉ atomic giữa các partition Kafka, không bao gồm Postgres.',
        en: 'Don’t answer “use Kafka transactions” — they are atomic across Kafka partitions only, not with Postgres.'
      }
    },
    {
      seniority: 'Senior',
      question: {
        vi: 'Log-based CDC cho delivery semantics gì và consumer cần làm gì?',
        en: 'What delivery semantics does log-based CDC give and what must consumers do?'
      },
      answer: {
        vi: 'At-least-once: connector commit offset định kỳ, nên sau crash nó replay từ offset cuối → trùng sự kiện. Thứ tự được giữ theo key nhờ key = primary key và partition theo key. Consumer phải idempotent: upsert theo PK, hoặc so sánh LSN/version trong source để bỏ qua sự kiện cũ hơn trạng thái hiện tại.',
        en: 'At-least-once: the connector commits offsets periodically, so after a crash it replays from the last offset → duplicates. Ordering holds per key because the key is the primary key and partitioning is by key. Consumers must be idempotent: upsert by PK, or compare the source LSN/version and skip events older than current state.'
      },
      proTip: {
        vi: 'Nhắc tới việc lưu source.lsn vào document Elasticsearch và dùng external versioning (version_type=external) để chặn ghi đè ngược.',
        en: 'Mention storing source.lsn on the Elasticsearch document and using external versioning (version_type=external) to reject out-of-order overwrites.'
      }
    }
  ],

  productionProblemCase: {
    title: {
      vi: 'Đơn hàng "biến mất" khỏi trang tìm kiếm sau mỗi lần deploy',
      en: 'Orders vanishing from search after every deploy'
    },
    businessContext: {
      vi: 'Sàn TMĐT xử lý ~8 triệu đơn/ngày; trang "Đơn của tôi" đọc từ Elasticsearch.',
      en: 'A marketplace processing ~8M orders/day; the “My orders” page reads from Elasticsearch.'
    },
    problemDescription: {
      vi: 'Mỗi đợt rolling deploy, vài chục khách báo đơn đã thanh toán không hiển thị. DB có đơn, Elasticsearch thì không.',
      en: 'Every rolling deploy, dozens of customers report paid orders not showing. The DB has them, Elasticsearch does not.'
    },
    whyNaiveFails: {
      vi: 'SIGTERM tới pod giữa save() và send(); graceful shutdown 30s không đủ khi producer đang retry vì broker leader election. Thêm retry vào code chỉ thu hẹp chứ không đóng được cửa sổ.',
      en: 'SIGTERM hits pods between save() and send(); the 30s graceful shutdown is not enough while the producer retries during a broker leader election. Adding retries narrows but never closes the window.'
    },
    coreSolution: {
      vi: 'Bỏ hẳn kafkaTemplate trong OrderService; bật wal_level=logical, triển khai Debezium PostgresConnector với key = order id, projector upsert idempotent. Chạy một lần full snapshot để vá các đơn đã lệch.',
      en: 'Remove kafkaTemplate from OrderService; enable wal_level=logical, deploy a Debezium PostgresConnector keyed by order id, with an idempotent upsert projector. Run a one-off full snapshot to repair already-diverged orders.'
    },
    architectureImpact: {
      vi: 'Số đơn lệch về 0; p99 độ trễ search tăng từ ~20 ms lên ~300 ms nhưng không còn ticket hỗ trợ.',
      en: 'Diverged orders dropped to 0; p99 search freshness went from ~20 ms to ~300 ms with zero support tickets.'
    }
  },

  researchCitations: [CDC_CITATIONS.ddia, CDC_CITATIONS.outboxPattern]
};
