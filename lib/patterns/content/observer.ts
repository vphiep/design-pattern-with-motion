import type { Pattern } from '../types';

export const observer: Pattern = {
  id: 'observer',
  category: 'behavioral',
  name: 'Observer',
  tagline: {
    en: 'Let objects subscribe to events, so they get notified automatically when something interesting happens.',
    vi: 'Cho object đăng ký nhận event, để chúng được báo tự động khi có điều đáng chú ý xảy ra.'
  },
  analogy: {
    en: 'A news channel. You subscribe to “weather alerts.” When the weather office issues a warning, every subscriber gets it. The weather office doesn’t know or care which specific people are listening. Add a new subscriber, and the next alert just reaches them too.',
    vi: 'Kênh tin. Bạn đăng ký “cảnh báo thời tiết.” Khi đài khí tượng phát cảnh báo, mọi subscriber đều nhận. Đài không biết và không cần biết cụ thể ai đang nghe. Thêm subscriber mới, cảnh báo kế tiếp tự tới họ.'
  },
  whenToUse: [
    {
      en: 'Changes in one object must be reflected in others, and you don’t want them tightly coupled.',
      vi: 'Thay đổi trên một object phải phản ánh sang object khác, và bạn không muốn chúng gắn chặt.'
    },
    {
      en: 'You don’t know in advance how many objects need to be notified.',
      vi: 'Bạn không biết trước bao nhiêu object cần được báo.'
    },
    {
      en: 'A publish-subscribe model fits the problem: publishers broadcast, subscribers listen.',
      vi: 'Mô hình publish-subscribe khớp bài toán: bên phát broadcast, bên đăng ký lắng nghe.'
    }
  ],
  whenNotToUse: [
    {
      en: 'Only one or two objects care about the change — just call them directly.',
      vi: 'Chỉ một hoặc hai object quan tâm thay đổi — hãy gọi trực tiếp.'
    },
    {
      en: 'The order of notifications matters, because the order of subscribers is hard to control.',
      vi: 'Thứ tự thông báo quan trọng, vì thứ tự subscriber thì khó kiểm soát.'
    }
  ],
  difficulty: 2,
  order: 19,
  javaCode: `import java.util.ArrayList;
import java.util.List;

// The observer: anyone interested in the subject's changes.
interface Subscriber { void update(String news); }

// The subject: it holds subscribers and pings them when something changes.
final class NewsChannel {
    private final List<Subscriber> subs = new ArrayList<>();
    private String latestHeadline = "";
    public void subscribe(Subscriber s)   { subs.add(s); }
    public void unsubscribe(Subscriber s) { subs.remove(s); }
    public void publish(String headline) {
        this.latestHeadline = headline;
        for (Subscriber s : subs) s.update(latestHeadline);
    }
}
final class EmailAlert implements Subscriber {
    public void update(String news) { System.out.println("email: " + news); }
}
final class PhoneAlert implements Subscriber {
    public void update(String news) { System.out.println("phone: " + news); }
}

// NewsChannel c = new NewsChannel();
// c.subscribe(new EmailAlert());
// c.subscribe(new PhoneAlert());
// c.publish("Storm warning");  -> both subscribers get it.`,
  steps: [
    {
      title: {
        en: 'Observers register with the subject',
        vi: 'Observer đăng ký với subject'
      },
      body: {
        en: 'NewsChannel.subscribe(s) adds a Subscriber to an internal list. EmailAlert and PhoneAlert are observers: they implement update(news) and know nothing about each other. The subject owns the list; a new listener is one more add, not a new field on NewsChannel.',
        vi: 'NewsChannel.subscribe(s) thêm một Subscriber vào list nội bộ. EmailAlert và PhoneAlert là observer: chúng implement update(news) và không biết nhau. Subject sở hữu list; listener mới chỉ là thêm một phần tử, không phải field mới trên NewsChannel.'
      }
    },
    {
      title: {
        en: 'The subject detects a change',
        vi: 'Subject phát hiện thay đổi'
      },
      body: {
        en: 'Calling publish(headline) updates the subject’s state. The channel does not hard-code what to do next — it iterates its subscriber list and delivers the news to each one.',
        vi: 'Gọi publish(headline) cập nhật trạng thái của subject. Kênh không hard-code phải làm gì tiếp — nó duyệt list subscriber và gửi tin tới từng người.'
      }
    },
    {
      title: {
        en: 'Subscribers react independently',
        vi: 'Subscriber phản ứng độc lập'
      },
      body: {
        en: 'Each subscriber’s update() method executes in turn: EmailAlert prints an email log, PhoneAlert prints a phone push. The subject does not wait for or inspect their return values.',
        vi: 'Method update() của từng subscriber lần lượt chạy: EmailAlert in log email, PhoneAlert in push phone. Subject không đợi và không kiểm tra giá trị trả về của chúng.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.beans.PropertyChangeSupport',
      note: {
        en: 'Standard Java SE event bus for beans. Listeners register for specific property names, and the bean fires PropertyChangeEvent whenever a setter executes.',
        vi: 'Event bus chuẩn trong Java SE cho JavaBeans. Listener đăng ký theo tên thuộc tính, và bean bắn PropertyChangeEvent mỗi khi có setter chạy.'
      }
    },
    {
      system: 'Spring ApplicationEventPublisher',
      note: {
        en: 'Spring’s core decoupling mechanism. Components inject ApplicationEventPublisher and fire events; any @EventListener bean receives them synchronously or asynchronously.',
        vi: 'Cơ chế tách rời cốt lõi của Spring. Các component tiêm ApplicationEventPublisher để phát event; các bean có @EventListener sẽ nhận đồng bộ hoặc bất đồng bộ.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Iterating an ArrayList while a listener unsubscribes is a ConcurrentModificationException waiting to happen. CopyOnWriteArrayList snapshots the list for each publish so a subscriber can leave mid-broadcast.',
      vi: 'Duyệt ArrayList trong lúc một listener unsubscribe là ConcurrentModificationException đang chờ. CopyOnWriteArrayList chụp snapshot list cho mỗi lần publish, nên subscriber có thể rời giữa chừng.'
    },
    tradeoffs: {
      en: 'CopyOnWriteArrayList makes writes copy the whole array — cheap when listeners are stable, costly when they churn. Use COW when you have a simple callback list that must be thread-safe.',
      vi: 'CopyOnWriteArrayList khiến mỗi lần ghi copy cả mảng — rẻ khi listener ổn định, đắt khi chúng thay đổi liên tục. Dùng COW khi cần list callback đơn giản và an toàn đa luồng.'
    },
    javaCode: `import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.util.concurrent.CopyOnWriteArrayList;

interface Subscriber { void update(String news); }

final class NewsChannel {
    private final CopyOnWriteArrayList<Subscriber> subs = new CopyOnWriteArrayList<>();
    public void subscribe(Subscriber s) { subs.add(s); }
    public void publish(String headline) {
        for (Subscriber s : subs) s.update(headline);
    }
}

final class NewsBean {
    private final PropertyChangeSupport pcs = new PropertyChangeSupport(this);
    private String headline = "";

    public void addHeadlineListener(PropertyChangeListener l) {
        pcs.addPropertyChangeListener("headline", l);
    }
    public void setHeadline(String next) {
        String prev = this.headline;
        this.headline = next;
        pcs.firePropertyChange("headline", prev, next);
    }
}`
  },

  deepTheory: {
    academicRoot: {
      en: 'Gang of Four (GoF 1994) Behavioral Pattern, also known as Publish-Subscribe. It defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically. It is the theoretical forefather of Reactive Programming (RxJava, Project Reactor) and Distributed Event-Driven Architecture (Kafka).',
      vi: 'Mẫu Hành vi kinh điển trong Gang of Four (GoF 1994), còn gọi là Publish-Subscribe. Định nghĩa mối quan hệ phụ thuộc một-nhiều giữa các đối tượng để khi một đối tượng đổi trạng thái, toàn bộ các bên liên quan được thông báo tự động. Đây là nền tảng học thuật của Lập trình phản ứng (Reactive) và Kiến trúc hướng sự kiện phân tán (Event-Driven Architecture).'
    },
    structuralCouplingMetric: {
      en: 'Inversion of Efferent Coupling: Without Observer, a core business class notifying 5 side-effects has Ce = 5 (heavily coupled to email, sms, audit, metrics, analytics). Introducing the Observer pattern reduces Ce to 1 (depending only on an EventPublisher interface or Observer interface). This drives down class instability and insulates core domains from peripheral infrastructure failures.',
      vi: 'Đảo Ngược Phụ Thuộc Hướng Ra: Nếu không có Observer, một class nghiệp vụ lõi cần kích hoạt 5 hành động phụ sẽ có Ce = 5 (bị trói chặt vào email, sms, audit log, chỉ số metric, phân tích). Áp dụng Observer giảm Ce xuống đúng bằng 1 (chỉ phụ thuộc vào interface EventPublisher hoặc Subscriber). Việc này giảm thiểu chỉ số bất ổn và cách ly hoàn toàn domain lõi khỏi lỗi của các hệ thống vệ tinh.'
    },
    memoryAndVtableTradeoff: {
      en: 'The "Lapsed Listener" Memory Leak Hazard: When long-lived Subjects hold strong references to short-lived Observers in internal collection arrays, the Garbage Collector cannot collect the Observer instances even if callers have abandoned them. Mitigation in high-throughput engines: Use java.lang.ref.WeakReference<Subscriber> or enforce explicit deregistration lifecycle hooks.',
      vi: 'Hiểm Họa Rò Rỉ Bộ Nhớ "Lapsed Listener": Khi một Subject sống lâu (như ApplicationContext hoặc Cache toàn cục) giữ tham chiếu mạnh (strong reference) tới các Observer sống ngắn trong mảng nội bộ, Garbage Collector hoàn toàn KHÔNG THỂ thu gom các Observer này dù bên ngoài đã bỏ dùng chúng. Giải pháp trong production: Bọc listener trong java.lang.ref.WeakReference hoặc bắt buộc gọi hàm unsubscribe khi hủy bean.'
    },
    enterpriseBestPractices: [
      {
        en: 'Never execute heavy synchronous I/O (like network HTTP calls or PDF rendering) directly inside the subject broadcast loop. Dispatch heavy side-effects asynchronously via a thread pool or @Async @EventListener.',
        vi: 'Không bao giờ chạy các tác vụ I/O nặng (như gọi HTTP mạng hay render PDF) trực tiếp bên trong vòng lặp phát sự kiện đồng bộ. Hãy đẩy các tác vụ nặng sang luồng ngầm bất đồng bộ qua @Async @EventListener.'
      },
      {
        en: 'In distributed enterprise microservices, transcend in-memory observers by publishing Domain Events to durable distributed message logs like Apache Kafka or RabbitMQ with Transactional Outbox.',
        vi: 'Trong hệ thống microservice phân tán, mở rộng Observer trong RAM thành Sự kiện Miền (Domain Events) đẩy vào các message broker bền vững như Apache Kafka hoặc RabbitMQ kết hợp Transactional Outbox Pattern.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Cascading Checkout Rollbacks Caused by Synchronous Side-Effect Coupling',
      vi: 'Sập Dây Chuyền & Hủy Đơn Hàng Hàng Loạt Do Gắn Chặt Xử Lý Phụ Trong Luồng Thanh Toán'
    },
    businessContext: {
      en: 'An enterprise e-commerce platform processes 10,000 orders per minute during peak sales. When a customer finishes payment, the system must: 1. Deduct warehouse inventory, 2. Send SMS/Email receipts, 3. Calculate reward points, 4. Sync invoice data to third-party SAP ERP.',
      vi: 'Sàn thương mại điện tử xử lý 10.000 đơn hàng mỗi phút vào giờ cao điểm. Khi khách thanh toán thành công, hệ thống cần: 1. Trừ kho hàng, 2. Gửi email/SMS hóa đơn, 3. Tích điểm thưởng thành viên, 4. Đồng bộ dữ liệu sang phần mềm kế toán SAP ERP của đối tác.'
    },
    problemDescription: {
      en: 'In the legacy architecture, OrderService.completeCheckout() called all 4 services sequentially within a single @Transactional method. During flash sale traffic, the external SMS gateway suffered a network timeout (hanging for 8 seconds). Because all side-effects were synchronously tied to the database transaction, the checkout thread stalled, exhausting the HikariCP database connection pool. When the SMS call finally threw a SocketTimeoutException, Spring Boot rolled back the ENTIRE transaction! The customer had already had their credit card charged, but their order was aborted and rolled back in the database, resulting in customer outrage, double-refund chaos, and lost revenue.',
      vi: 'Trong kiến trúc cũ, hàm OrderService.completeCheckout() gọi tuần tự cả 4 dịch vụ trên bên trong một phương thức @Transactional duy nhất. Vào đợt flash sale, cổng gửi SMS của đối tác viễn thông bị nghẽn mạng (treo cứng 8 giây). Vì toàn bộ các hành động phụ bị trói chung trong cùng một transaction cơ sở dữ liệu, luồng checkout bị đứng im, làm cạn kiệt connection pool HikariCP. Khi lệnh gọi SMS bắn ra ngoại lệ SocketTimeoutException, Spring Boot tự động ROLLBACK TOÀN BỘ GIAO DỊCH! Khách hàng đã bị trừ tiền thẻ ngân hàng nhưng đơn hàng bị hủy sạch trong database, sinh ra làn sóng khiếu nại bão táp và tổn thất doanh thu nặng nề.'
    },
    whyNaiveFails: {
      en: 'Wrapping helper services in try-catch blocks still leaves the main database transaction open during slow external HTTP calls. Holding database locks across network I/O violates fundamental transactional hygiene and causes connection pool exhaustion.',
      vi: 'Bọc các lệnh gọi bằng try-catch vẫn không giải quyết được gốc rễ vì transaction cơ sở dữ liệu vẫn bị giữ mở trong suốt thời gian chờ mạng. Giữ khóa database trong khi chờ I/O mạng vi phạm nghiêm trọng nguyên tắc vệ sinh giao dịch và làm tê liệt toàn bộ connection pool.'
    },
    coreSolution: {
      en: '1. Inversion via Domain Event Publishing: OrderService publishes an immutable OrderPlacedEvent and commits immediately in ~20ms, completely decoupled from auxiliary systems.\n2. Asynchronous Isolated Listeners: Annotate listeners with @Async("eventExecutor") and @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT). SMS and ERP sync happen asynchronously in separate thread pools AFTER the payment transaction is durably committed.\n3. Failure Isolation: If the SMS gateway fails, only the SMS retry queue is impacted; the customer\'s order is already 100% safely persisted in the database.',
      vi: '1. Đảo Ngược Bằng Việc Phát Sự Kiện Miền (Domain Event): OrderService chỉ phát ra một sự kiện bất biến OrderPlacedEvent và commit đơn hàng ngay lập tức trong ~20ms, hoàn toàn không cần biết ai đang nghe.\n2. Lắng Nghe Bất Đồng Bộ Độc Lập: Sử dụng @Async("eventExecutor") và @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT). Việc gửi SMS và đồng bộ ERP được chuyển sang các luồng ngầm độc lập CHỈ SAU KHI giao dịch thanh toán đã commit bền vững vào DB.\n3. Cô Lập Rủi Ro: Nếu cổng SMS bị sập, chỉ có tác vụ gửi SMS bị lỗi và đẩy vào hàng đợi thử lại; đơn hàng của khách hàng đã được lưu an toàn 100% trong database.'
    },
    productionCode: `// Production Event-Driven Decoupling using Spring Application Events
public record OrderPlacedEvent(Long orderId, String customerEmail, BigDecimal totalAmount) {}

@Service
public class OrderCheckoutService {

    private final OrderRepository orderRepo;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public Order completeCheckout(OrderRequest request) {
        Order order = orderRepo.save(new Order(request));
        
        // Publish Domain Event and return immediately - checkout takes 18ms!
        eventPublisher.publishEvent(new OrderPlacedEvent(order.getId(), order.getEmail(), order.getAmount()));
        return order;
    }
}

@Component
public class AsyncNotificationListener {

    @Async("backgroundTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendEmailReceipt(OrderPlacedEvent event) {
        // Runs in separate background thread ONLY AFTER primary database transaction commits!
        try {
            mailSender.sendReceipt(event.customerEmail(), event.orderId());
        } catch (Exception e) {
            log.error("Failed to send receipt for order {}, queueing for retry", event.orderId());
        }
    }
}`,
    architectureImpact: {
      en: 'Checkout API P99 latency dropped from 3,800ms down to 24ms. Third-party downtime no longer impacts customer checkouts. Database connection hold time was slashed by 98%.',
      vi: 'Độ trễ P99 của API đặt hàng giảm ngoạn mục từ 3.800ms xuống chỉ còn 24ms. Sự cố sập mạng của đối tác bên thứ ba hoàn toàn không ảnh hưởng tới việc mua hàng của khách. Thời gian chiếm dụng kết nối database giảm tới 98%.'
    }
  }
};
