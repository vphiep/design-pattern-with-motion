import type { CdcTopic } from '../types';
import { CDC_CITATIONS } from '../citations';

export const outboxEventRouterOperationsTopic: CdcTopic = {
  id: 'outbox-event-router-operations',
  category: 'cdc-production',
  level: 'advanced',
  chapter: 'Chương 03',
  name: 'Outbox Event Router & Operating CDC in Production',
  tagline: {
    vi: 'Phát domain event thay vì lộ schema bảng: Transactional Outbox + Debezium EventRouter SMT, consumer idempotent, heartbeat, schema evolution và giám sát lag.',
    en: 'Publish domain events instead of leaking table schemas: Transactional Outbox + Debezium EventRouter SMT, idempotent consumers, heartbeats, schema evolution and lag monitoring.'
  },
  difficulty: 3,
  order: 6,
  estimatedMinutes: 28,

  coreTheory: {
    problemStatement: {
      vi: 'CDC trên bảng nghiệp vụ biến schema nội bộ (tên cột, bảng join, cột kỹ thuật) thành hợp đồng công khai: đổi tên một cột là phá vỡ mọi consumer. Thêm nữa, một nghiệp vụ "đặt hàng" chạm 4 bảng → consumer phải tự ráp 4 change event thành một ý nghĩa.',
      en: 'CDC on business tables turns internal schema (column names, join tables, technical columns) into a public contract: renaming a column breaks every consumer. And one “place order” touches 4 tables → consumers must reassemble 4 change events into one meaning.'
    },
    hardwareConstraint: {
      vi: 'Vẫn không có transaction chung DB + Kafka. Bảng outbox tăng vô hạn nếu không dọn; slot không tiến nếu DB ít ghi; consumer sẽ nhận trùng sau mỗi lần connector restart.',
      en: 'There is still no shared DB + Kafka transaction. The outbox table grows forever unless cleaned; the slot stalls on quiet databases; consumers receive duplicates after every connector restart.'
    },
    fundamentalSolution: {
      vi: 'Trong cùng transaction nghiệp vụ, INSERT một dòng vào bảng outbox (id, aggregatetype, aggregateid, type, payload) — đây là domain event có schema do team sở hữu. Debezium chỉ capture bảng outbox; EventRouter SMT định tuyến tới topic theo aggregatetype, dùng aggregateid làm key (giữ thứ tự theo aggregate) và đặt id vào header. Consumer lưu id đã xử lý để khử trùng lặp.',
      en: 'In the same business transaction, INSERT a row into an outbox table (id, aggregatetype, aggregateid, type, payload) — a domain event whose schema the team owns. Debezium captures only the outbox table; the EventRouter SMT routes to a topic by aggregatetype, keys by aggregateid (per-aggregate ordering) and puts id in a header. Consumers record processed ids to de-duplicate.'
    },
    math: {
      formula: String.raw`\text{effect}(e) \text{ applied once} \iff \text{INSERT processed\_events}(e.\text{id}) \;\wedge\; \text{apply}(e) \text{ commit atomically}`,
      description: {
        vi: 'Exactly-once "hiệu ứng" đạt được bằng at-least-once delivery + idempotency: consumer ghi id sự kiện và thay đổi nghiệp vụ trong cùng transaction cục bộ; lần giao trùng vi phạm khoá chính và bị bỏ qua.',
        en: 'Exactly-once effects come from at-least-once delivery + idempotency: the consumer records the event id and applies the business change in one local transaction; a duplicate delivery violates the primary key and is skipped.'
      },
      timeComplexity: 'O(1) extra INSERT per business transaction',
      spaceComplexity: 'O(outbox rows until cleanup)'
    }
  },

  detailedTheory: {
    overview: {
      vi: 'Outbox + log-based CDC kết hợp ưu điểm của cả hai: atomic với dữ liệu nghiệp vụ, độ trễ thấp, và sự kiện mang ngữ nghĩa domain.',
      en: 'Outbox + log-based CDC combines the best of both: atomic with business data, low latency, and events with domain meaning.'
    },
    deepDiveParagraphs: [
      {
        vi: 'Mẹo INSERT-rồi-DELETE: ghi dòng outbox và DELETE nó ngay trong cùng transaction. WAL vẫn chứa INSERT nên Debezium thấy sự kiện, nhưng bảng luôn rỗng — không cần job dọn. EventRouter mặc định bỏ qua sự kiện DELETE của outbox.',
        en: 'The INSERT-then-DELETE trick: insert the outbox row and DELETE it in the same transaction. The WAL still contains the INSERT so Debezium sees the event, but the table stays empty — no cleanup job. The EventRouter ignores outbox DELETE events by default.'
      },
      {
        vi: 'Heartbeat: nếu bảng được capture ít ghi nhưng DB có nhiều ghi khác, slot không tiến và WAL tích tụ. heartbeat.interval.ms + heartbeat.action.query (UPDATE bảng heartbeat) tạo thay đổi định kỳ để Debezium có LSN mới mà flush.',
        en: 'Heartbeats: if captured tables are quiet while the database writes elsewhere, the slot does not advance and WAL accumulates. heartbeat.interval.ms + heartbeat.action.query (an UPDATE to a heartbeat table) produce periodic changes so Debezium has a fresh LSN to flush.'
      },
      {
        vi: 'Schema evolution: payload outbox nên là Avro/Protobuf/JSON Schema đăng ký trong Schema Registry với chế độ BACKWARD — thêm trường có default an toàn, xoá/đổi tên trường là breaking change cần topic version mới.',
        en: 'Schema evolution: the outbox payload should be Avro/Protobuf/JSON Schema registered in Schema Registry under BACKWARD compatibility — adding fields with defaults is safe, removing/renaming is a breaking change that needs a new topic version.'
      }
    ],
    enterprisePitfalls: [
      {
        vi: 'Dùng aggregatetype làm key thay vì aggregateid → mọi sự kiện dồn vào một partition, mất song song.',
        en: 'Keying by aggregatetype instead of aggregateid → every event lands on one partition, no parallelism.'
      },
      {
        vi: 'Consumer dedupe bằng cache trong RAM — mất sau restart, đúng lúc trùng lặp xảy ra nhiều nhất.',
        en: 'De-duplicating with an in-memory cache — lost on restart, exactly when duplicates are most likely.'
      },
      {
        vi: 'Không alert MilliSecondsBehindSource và retained WAL — sự cố CDC thường âm thầm hàng giờ.',
        en: 'No alerts on MilliSecondsBehindSource and retained WAL — CDC incidents are often silent for hours.'
      }
    ]
  },

  physicalArchitecture: {
    title: {
      vi: 'Outbox → EventRouter → topic theo aggregate',
      en: 'Outbox → EventRouter → per-aggregate topics'
    },
    description: {
      vi: 'Một transaction ghi đơn hàng và outbox; SMT biến dòng outbox thành domain event.',
      en: 'One transaction writes the order and the outbox; the SMT turns the outbox row into a domain event.'
    },
    asciiDiagram: `
 BEGIN;
   INSERT INTO orders (...) VALUES (...);                         -- business state
   INSERT INTO outbox (id, aggregatetype, aggregateid, type, payload)
          VALUES ('9f1c…', 'Order', '42', 'OrderPlaced', '{…}');   -- domain event
   DELETE FROM outbox WHERE id = '9f1c…';                         -- keep table empty
 COMMIT;                         │ WAL
                                 ▼
 Debezium (table.include.list=public.outbox)
   └─ SMT io.debezium.transforms.outbox.EventRouter
        topic  = outbox.event.Order      (route.by.field=aggregatetype)
        key    = "42"                    (aggregateid → per-order ordering)
        header = id: 9f1c…               (dedup key)
        value  = payload
                                 ▼
 payment-service: INSERT processed_events(id) + apply   ← one local TX, duplicate ⇒ skip
`,
    components: [
      {
        name: 'outbox table',
        role: 'Event staging',
        description: {
          vi: 'Ghi cùng transaction với dữ liệu nghiệp vụ.',
          en: 'Written in the same transaction as business data.'
        }
      },
      {
        name: 'EventRouter SMT',
        role: 'Routing',
        description: {
          vi: 'Chọn topic, key, header từ cột outbox.',
          en: 'Derives topic, key and headers from outbox columns.'
        }
      },
      {
        name: 'processed_events',
        role: 'Inbox / dedup',
        description: {
          vi: 'Bảng id đã xử lý phía consumer.',
          en: 'Consumer-side table of processed ids.'
        }
      },
      {
        name: 'Heartbeat',
        role: 'Slot keep-alive',
        description: {
          vi: 'Thay đổi định kỳ giữ slot tiến khi bảng ít ghi.',
          en: 'Periodic change that keeps the slot advancing on quiet tables.'
        }
      }
    ]
  },

  steps: [
    {
      id: 'atomic-write',
      title: { vi: 'Một transaction: đơn hàng + outbox', en: 'One transaction: order + outbox' },
      phase: 'Write',
      description: {
        vi: 'Lưu Order và OutboxEvent cùng @Transactional; hoặc cả hai commit, hoặc không.',
        en: 'Persist Order and OutboxEvent in one @Transactional; both commit or neither does.'
      },
      systemBehavior: {
        vi: 'WAL chứa INSERT outbox ngay sau INSERT orders, cùng xid.',
        en: 'The WAL holds the outbox INSERT right after the orders INSERT, same xid.'
      },
      codeLineMatch: 'outboxRepository.save'
    },
    {
      id: 'capture-outbox',
      title: { vi: 'Debezium capture bảng outbox', en: 'Debezium captures the outbox table' },
      phase: 'Capture',
      description: {
        vi: 'Connector chỉ include public.outbox; DELETE ngay sau đó bị bỏ qua.',
        en: 'The connector only includes public.outbox; the immediate DELETE is ignored.'
      },
      systemBehavior: {
        vi: 'Change event op=c được dựng từ WAL dù dòng đã bị xoá.',
        en: 'An op=c event is built from WAL even though the row is already deleted.'
      },
      codeLineMatch: 'table.include.list'
    },
    {
      id: 'route',
      title: {
        vi: 'EventRouter định tuyến domain event',
        en: 'EventRouter routes the domain event'
      },
      phase: 'Route',
      description: {
        vi: 'Topic outbox.event.Order, key = aggregateid, header id, value = payload.',
        en: 'Topic outbox.event.Order, key = aggregateid, header id, value = payload.'
      },
      systemBehavior: {
        vi: 'Cùng aggregate → cùng partition → thứ tự sự kiện của đơn 42 được giữ.',
        en: 'Same aggregate → same partition → order 42’s events stay ordered.'
      },
      codeLineMatch: 'transforms.outbox.type'
    },
    {
      id: 'dedupe',
      title: {
        vi: 'Consumer idempotent bằng processed_events',
        en: 'Idempotent consumer via processed_events'
      },
      phase: 'Consume',
      description: {
        vi: 'Ghi id sự kiện và áp dụng nghiệp vụ trong một transaction; bản trùng bị bỏ qua.',
        en: 'Record the event id and apply the change in one transaction; duplicates are skipped.'
      },
      systemBehavior: {
        vi: 'Exactly-once về hiệu ứng trên nền at-least-once delivery.',
        en: 'Exactly-once effects on top of at-least-once delivery.'
      },
      codeLineMatch: 'processedEvents.markProcessed'
    }
  ],

  comparison: {
    title: {
      vi: 'Relay outbox: polling publisher vs log tailing',
      en: 'Outbox relay: polling publisher vs log tailing'
    },
    subtitle: {
      vi: 'Hai cách chuyển dòng outbox sang Kafka',
      en: 'Two ways to move outbox rows to Kafka'
    },
    options: [
      {
        name: 'Polling publisher',
        tag: 'No CDC infra',
        role: {
          vi: 'Job SELECT … FOR UPDATE SKIP LOCKED',
          en: 'A SELECT … FOR UPDATE SKIP LOCKED job'
        },
        keyMechanism: {
          vi: 'Đơn giản, không cần Kafka Connect; độ trễ = chu kỳ poll, tạo tải lên DB, phải tự xoá dòng đã gửi.',
          en: 'Simple, no Kafka Connect; latency = poll interval, adds DB load, must delete sent rows itself.'
        },
        configExample:
          '@Scheduled(fixedDelay = 500)\nSELECT * FROM outbox ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED',
        architectureNote: {
          vi: 'Đủ tốt cho vài trăm event/s.',
          en: 'Good enough for a few hundred events/s.'
        }
      },
      {
        name: 'Log tailing (Debezium)',
        tag: 'Scalable',
        role: { vi: 'Đọc INSERT outbox từ WAL', en: 'Reads outbox INSERTs from the WAL' },
        keyMechanism: {
          vi: 'Độ trễ ms, không query bảng, thứ tự commit chính xác, bảng luôn rỗng với mẹo INSERT+DELETE.',
          en: 'ms latency, no table queries, exact commit order, table stays empty with INSERT+DELETE.'
        },
        configExample:
          'transforms=outbox\ntransforms.outbox.type=io.debezium.transforms.outbox.EventRouter',
        architectureNote: {
          vi: 'Cần vận hành Connect + slot.',
          en: 'Requires operating Connect + a slot.'
        }
      }
    ]
  },

  tradeoffs: {
    pros: [
      {
        vi: 'Hợp đồng sự kiện tách khỏi schema bảng — refactor DB tự do.',
        en: 'Event contracts are decoupled from table schemas — refactor the DB freely.'
      },
      {
        vi: 'Atomic với thay đổi nghiệp vụ, không dual-write.',
        en: 'Atomic with business changes, no dual write.'
      },
      {
        vi: 'Thứ tự theo aggregate nhờ key = aggregateid.',
        en: 'Per-aggregate ordering via key = aggregateid.'
      }
    ],
    cons: [
      {
        vi: 'Ứng dụng phải chủ động ghi outbox — không tự động như CDC bảng.',
        en: 'The app must write the outbox explicitly — not automatic like table CDC.'
      },
      {
        vi: 'Consumer phải có bảng processed_events và dọn định kỳ.',
        en: 'Consumers need a processed_events table with periodic cleanup.'
      }
    ],
    balance: {
      vi: 'Thêm một INSERT (và DELETE) mỗi transaction để đổi lấy hợp đồng sự kiện ổn định và đảm bảo không mất sự kiện.',
      en: 'One extra INSERT (and DELETE) per transaction buys a stable event contract and no lost events.'
    },
    invariant: {
      vi: 'Sự kiện tồn tại khi và chỉ khi thay đổi nghiệp vụ tương ứng đã commit.',
      en: 'An event exists if and only if its business change committed.'
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

    private final OrderRepository orders;
    private final OutboxRepository outboxRepository;

    @Transactional
    public Order placeOrder(PlaceOrder cmd) {
        Order order = orders.save(Order.from(cmd));
        OutboxEvent evt = OutboxEvent.of(
            "Order", order.id().toString(), "OrderPlaced", OrderPlacedV1.from(order));
        outboxRepository.save(evt);          // same TX, same WAL commit
        outboxRepository.delete(evt);        // WAL keeps the INSERT; table stays empty
        return order;
    }
}

// Debezium connector (excerpt)
//   table.include.list=public.outbox
//   transforms=outbox
//   transforms.outbox.type=io.debezium.transforms.outbox.EventRouter
//   transforms.outbox.route.by.field=aggregatetype      -> outbox.event.Order
//   transforms.outbox.table.field.event.key=aggregateid
//   heartbeat.interval.ms=10000
//   heartbeat.action.query=UPDATE debezium_heartbeat SET ts = now()

@Component
@RequiredArgsConstructor
class PaymentOnOrderPlaced {

    private final ProcessedEventRepository processedEvents;
    private final PaymentService payments;

    @Transactional
    @KafkaListener(topics = "outbox.event.Order", groupId = "payment")
    void on(@Payload OrderPlacedV1 evt, @Header("id") String eventId) {
        if (!processedEvents.markProcessed(eventId)) {   // INSERT ... ON CONFLICT DO NOTHING
            return;                                      // duplicate delivery -> no effect
        }
        payments.authorize(evt.orderId(), evt.total());
    }
}`
    }
  ],

  interviewQuestions: [
    {
      seniority: 'Senior',
      question: {
        vi: 'Vì sao nên dùng aggregateid làm message key trong outbox?',
        en: 'Why use aggregateid as the message key in an outbox?'
      },
      answer: {
        vi: 'Kafka chỉ đảm bảo thứ tự trong một partition. Key = aggregateid đưa mọi sự kiện của cùng aggregate (đơn 42: Placed → Paid → Shipped) vào một partition nên consumer thấy đúng thứ tự, trong khi các aggregate khác nhau vẫn song song.',
        en: 'Kafka only orders within a partition. Key = aggregateid sends every event of one aggregate (order 42: Placed → Paid → Shipped) to one partition so consumers see them in order, while different aggregates still run in parallel.'
      }
    },
    {
      seniority: 'Lead',
      question: {
        vi: 'Bạn giám sát một pipeline CDC production bằng những tín hiệu nào?',
        en: 'Which signals do you monitor for a production CDC pipeline?'
      },
      answer: {
        vi: 'Phía DB: retained WAL / slot active, binlog còn lại so với vị trí connector. Phía connector: trạng thái task (RUNNING/FAILED), MilliSecondsBehindSource, QueueRemainingCapacity, số lỗi. Phía Kafka: consumer lag của các consumer quan trọng. End-to-end: so source.ts_ms với thời điểm áp dụng ở sink, kèm canary row ghi định kỳ để đo độ tươi.',
        en: 'Database: retained WAL / slot active, remaining binlog vs connector position. Connector: task state (RUNNING/FAILED), MilliSecondsBehindSource, QueueRemainingCapacity, error counts. Kafka: lag of critical consumers. End-to-end: compare source.ts_ms with apply time at the sink, plus a periodically written canary row to measure freshness.'
      },
      proTip: {
        vi: 'Canary row là cách duy nhất phát hiện "pipeline xanh nhưng không chảy".',
        en: 'A canary row is the only way to catch a “green but not flowing” pipeline.'
      }
    }
  ],

  productionProblemCase: {
    title: { vi: 'Đổi tên cột làm sập 6 consumer', en: 'A column rename broke six consumers' },
    businessContext: {
      vi: 'Nhiều team đọc trực tiếp topic CDC của bảng orders.',
      en: 'Several teams consumed the raw CDC topic of the orders table.'
    },
    problemDescription: {
      vi: 'Team Order đổi cột total thành total_amount trong một migration nhỏ; 6 consumer deserialize lỗi và dừng trong giờ cao điểm.',
      en: 'The Order team renamed total to total_amount in a small migration; six consumers failed deserialisation and stopped at peak hours.'
    },
    whyNaiveFails: {
      vi: 'Schema bảng đã vô tình trở thành API công khai; không ai biết ai đang phụ thuộc vào cột nào.',
      en: 'The table schema had silently become a public API; nobody knew who depended on which column.'
    },
    coreSolution: {
      vi: 'Chuyển sang outbox với payload OrderPlacedV1 đăng ký Schema Registry (BACKWARD). Topic CDC bảng chỉ dành cho nội bộ team Order.',
      en: 'Move to an outbox with an OrderPlacedV1 payload registered in Schema Registry (BACKWARD). Raw table CDC topics stay internal to the Order team.'
    },
    architectureImpact: {
      vi: 'Migration DB không còn ảnh hưởng consumer; thay đổi breaking phải qua OrderPlacedV2 có kế hoạch.',
      en: 'DB migrations no longer affect consumers; breaking changes go through a planned OrderPlacedV2.'
    }
  },

  researchCitations: [CDC_CITATIONS.outboxRouter, CDC_CITATIONS.outboxPattern]
};
