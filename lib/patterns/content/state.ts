import type { Pattern } from '../types';

export const state: Pattern = {
  id: 'state',
  category: 'behavioral',
  name: 'State',
  tagline: {
    en: 'Let an object change its behavior when its internal state changes — as if it became a different class.',
    vi: 'Cho object đổi hành vi khi state nội bộ đổi — như thể nó vừa thành một class khác.'
  },
  analogy: {
    en: 'A traffic light. The same pole shows red, yellow, or green depending on its state. The behavior of “what happens when a car arrives” is different for each state. The pole itself doesn’t have one giant if/else — each state is a small object that knows its own rules and when to transition to the next.',
    vi: 'Đèn giao thông. Cùng một cột hiện đỏ, vàng hoặc xanh tùy state. Hành vi “xe tới thì sao” khác nhau theo từng state. Bản thân cột không có một if/else khổng lồ — mỗi state là một object nhỏ tự biết luật và lúc nào chuyển sang state kế.'
  },
  whenToUse: [
    {
      en: 'An object’s behavior depends on its state, and it must change at runtime.',
      vi: 'Hành vi của object phụ thuộc state, và phải đổi lúc runtime.'
    },
    {
      en: 'You have a long if/else or switch on a state field that’s getting hard to maintain.',
      vi: 'Bạn đang có if/else hoặc switch dài trên một field state, ngày càng khó giữ.'
    },
    {
      en: 'State-specific logic is tangled with the rest of the class — separating it cleans things up.',
      vi: 'Logic theo từng state đang quấn với phần còn lại của class — tách ra thì sạch hơn.'
    }
  ],
  whenNotToUse: [
    {
      en: 'There are only one or two states and the behavior barely changes — a boolean is enough.',
      vi: 'Chỉ một hoặc hai state và hành vi hầu như không đổi — một boolean là đủ.'
    },
    {
      en: 'States don’t transition into each other or share any structure.',
      vi: 'Các state không chuyển tiếp nhau và chẳng chia sẻ cấu trúc nào.'
    }
  ],
  difficulty: 2,
  order: 20,
  javaCode: `// The state: each one knows the behavior for a single situation.
interface ConnectionState {
    String open();
    String close();
    String send(String data);
}

final class Closed implements ConnectionState {
    public String open()  { return "Opening connection"; }
    public String close() { return "Already closed"; }
    public String send(String data) { return "Cannot send — closed"; }
}
final class Open implements ConnectionState {
    public String open()  { return "Already open"; }
    public String close() { return "Closing connection"; }
    public String send(String data) { return "Sent: " + data; }
}

// The context: it holds the current state and delegates to it.
final class Connection {
    private ConnectionState state = new Closed();
    public void set(ConnectionState s) { this.state = s; }
    public String open()  { String r = state.open();  if (state instanceof Closed) set(new Open()); return r; }
    public String close() { String r = state.close(); if (state instanceof Open)   set(new Closed()); return r; }
    public String send(String data)    { return state.send(data); }
}`,
  steps: [
    {
      title: {
        en: 'Each mode is its own object with the same methods',
        vi: 'Mỗi mode là một object riêng với cùng các method'
      },
      body: {
        en: 'ConnectionState lists open, close, and send. Closed and Open each implement that interface with different answers: Closed.send refuses, Open.send delivers. The “costume” is a class, not a boolean the context keeps switching on.',
        vi: 'ConnectionState liệt kê open, close và send. Closed và Open mỗi bên implement interface đó với câu trả lời khác: Closed.send từ chối, Open.send gửi. “Bộ đồ” là một class, không phải boolean để context switch.'
      }
    },
    {
      title: {
        en: 'The context holds exactly one current state',
        vi: 'Context giữ đúng một state hiện tại'
      },
      body: {
        en: 'Connection stores private ConnectionState state, starting as Closed. Every public method will delegate to that field. From the outside you still talk to one Connection; inside, the object you are really talking to can change.',
        vi: 'Connection lưu private ConnectionState state, bắt đầu là Closed. Mọi method public sẽ ủy quyền cho field đó. Bên ngoài bạn vẫn nói với một Connection; bên trong, object bạn thật sự nói chuyện có thể đổi.'
      }
    },
    {
      title: {
        en: 'A transition swaps the state object, and behavior changes',
        vi: 'Chuyển state là đổi object, hành vi theo đó đổi'
      },
      body: {
        en: 'open() first asks the current state to open, then the highlighted if (state instanceof Closed) replaces it with new Open(). After that, send() is Open.send. The same Connection instance now answers as if it were a different class.',
        vi: 'open() hỏi state hiện tại open trước, rồi dòng if (state instanceof Closed) được highlight thay nó bằng new Open(). Sau đó send() là Open.send. Cùng instance Connection giờ trả lời như thể nó là class khác.'
      }
    }
  ],
  realSystems: [
    {
      system: 'javax.net.ssl.SSLEngine',
      note: {
        en: 'SSLEngine is a handshake state machine: getHandshakeStatus() and wrap/unwrap behave differently in NEED_WRAP, NEED_UNWRAP, and FINISHED. The engine object stays; its mode does not.',
        vi: 'SSLEngine là state machine bắt tay: getHandshakeStatus() và wrap/unwrap hành xử khác nhau ở NEED_WRAP, NEED_UNWRAP và FINISHED. Object engine giữ nguyên; mode thì không.'
      }
    },
    {
      system: 'java.util.concurrent.locks.AbstractQueuedSynchronizer',
      note: {
        en: 'AQS stores a state int and interprets it per synchronizer (lock held, permits remaining). ReentrantLock and Semaphore are contexts whose acquire/release rules change with that state.',
        vi: 'AQS lưu một int state và diễn giải theo từng synchronizer (đang giữ lock, còn bao nhiêu permit). ReentrantLock và Semaphore là context mà luật acquire/release đổi theo state đó.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Closed and Open as classes work, but instanceof in the context is a smell — the transition table leaked out of the states. An enum state machine keeps each constant’s transitions beside its behavior, and the compiler can exhaust the set. Connection just holds Conn and calls state = state.open().',
      vi: 'Closed và Open dạng class thì chạy, nhưng instanceof trong context là mùi — bảng chuyển state đã rò ra ngoài. Enum state machine để transition của mỗi hằng nằm cạnh hành vi, và compiler có thể kiểm tra đủ tập. Connection chỉ cầm Conn và gọi state = state.open().'
    },
    tradeoffs: {
      en: 'Enums cannot extend a class and each constant is a singleton, which is perfect for a mode and awkward if a state needs per-connection data (put that on the context). A class-per-state still wins when states are loaded from plugins. Prefer the enum when the set is closed and small.',
      vi: 'Enum không extend được class và mỗi hằng là singleton — hoàn hảo cho một mode, và lúng túng nếu state cần data theo từng connection (hãy để data đó trên context). Mỗi state một class vẫn thắng khi state được load từ plugin. Ưu tiên enum khi tập đóng và nhỏ.'
    },
    javaCode: `enum Conn {
    CLOSED {
        Conn open()  { return OPEN; }
        Conn close() { return this; }
        String send(String data) { return "Cannot send — closed"; }
    },
    OPEN {
        Conn open()  { return this; }
        Conn close() { return CLOSED; }
        String send(String data) { return "Sent: " + data; }
    };
    abstract Conn open();
    abstract Conn close();
    abstract String send(String data);
}

final class Connection {
    private Conn state = Conn.CLOSED;
    public String open()  { String msg = state == Conn.CLOSED ? "Opening" : "Already open"; state = state.open(); return msg; }
    public String close() { String msg = state == Conn.OPEN ? "Closing" : "Already closed"; state = state.close(); return msg; }
    public String send(String data) { return state.send(data); }
}`
  },

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). Allows an object to alter its behavior when its internal state changes, appearing to change its class. Encapsulates state-specific logic into separate polymorphic classes, eliminating massive switch-case statements.',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Cho phép một đối tượng thay đổi hành vi khi trạng thái nội bộ của nó thay đổi, trông như thể nó vừa đổi lớp. Đóng gói logic của từng trạng thái vào các lớp đa hình riêng biệt, xóa bỏ hoàn toàn các khối switch-case khổng lồ.'
    },
    structuralCouplingMetric: {
      en: 'Decouples context from state-specific business rules. New states can be added without modifying existing state classes, obeying the Open-Closed Principle.',
      vi: 'Tách rời ngữ cảnh khỏi các quy tắc nghiệp vụ của từng trạng thái. Có thể bổ sung thêm trạng thái mới mà không cần chỉnh sửa các lớp trạng thái cũ, tuân thủ nguyên lý Đóng/Mở.'
    },
    memoryAndVtableTradeoff: {
      en: 'State transitions involve simple reference reassignment. Stateless states can be shared singletons, incurring zero allocation churn.',
      vi: 'Chuyển đổi trạng thái chỉ tốn một phép gán lại con trỏ tham chiếu. Các trạng thái không trạng thái có thể dùng chung Singleton, không hề sinh rác trên Heap.'
    },
    enterpriseBestPractices: [
      {
        en: 'Strict Illegal Transition Enforcement: State base classes should throw IllegalStateException by default for unsupported actions, preventing unauthorized lifecycle jumps.',
        vi: 'Ngăn chặn chuyển trạng thái trái phép: Lớp cơ sở của trạng thái nên ném IllegalStateException mặc định cho các hành động không được hỗ trợ để chống việc nhảy cóc trạng thái.'
      },
      {
        en: 'Persistence Awareness: Map polymorphic state instances to database status strings cleanly during repository persistence.',
        vi: 'Ánh xạ lưu trữ sạch sẽ: Ánh xạ chuẩn xác giữa các đối tượng trạng thái đa hình với chuỗi trạng thái trong database khi lưu xuống cơ sở dữ liệu.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'E-Commerce Order Lifecycle Illegal Transition Exploit & Fraudulent Refund Loss',
      vi: 'Lỗ Hổng Nhảy Cóc Trạng Thái Đơn Hàng & Thất Thoát 180,000 USD Tiền Hoàn Trả Gian Lận'
    },
    businessContext: {
      en: 'An e-commerce marketplace manages order lifecycles across 6 stages: Created -> Paid -> Packing -> Shipped -> Delivered -> Refunded.',
      vi: 'Sàn thương mại điện tử quản lý vòng đời đơn hàng qua 6 giai đoạn: Khởi tạo -> Đã thanh toán -> Đang đóng gói -> Đang giao -> Đã giao -> Hoàn tiền.'
    },
    problemDescription: {
      en: 'Order state was maintained via a plain string column with procedural helper methods: if (order.getStatus().equals("PAID")). A malicious customer discovered an un-validated webhook endpoint that permitted calling refund() on orders that were already marked "DELIVERED". Because procedural validation omitted checking the DELIVERED status, the system refunded the customer $180,000 across 200 orders while the customer kept the delivered luxury electronics!',
      vi: 'Trạng thái đơn hàng được quản lý bằng một cột chuỗi đơn giản kèm các hàm kiểm tra thủ công: if (order.getStatus().equals("PAID")). Một khách hàng gian lận đã phát hiện ra endpoint webhook thiếu thẩm định, cho phép gọi hàm refund() trên các đơn hàng đã ở trạng thái "DELIVERED" (Đã nhận hàng). Do logic thủ công bỏ sót việc kiểm tra trạng thái DELIVERED, hệ thống đã tự động hoàn tiền 180,000 USD cho hơn 200 đơn hàng trong khi khách vẫn ung dung giữ trọn các món đồ điện tử đắt tiền!'
    },
    whyNaiveFails: {
      en: 'Managing 6 states and 10 actions with procedural string checks creates 60 conditional branches where missing a single defensive check creates critical business vulnerabilities.',
      vi: 'Quản lý 6 trạng thái và 10 hành động bằng câu lệnh if-else tạo ra 60 nhánh rẽ điều kiện; chỉ cần sơ suất bỏ quên 1 nhánh kiểm tra là đủ tạo ra lỗ hổng bảo mật chết người.'
    },
    coreSolution: {
      en: 'Implement the State pattern with a sealed interface. The Order delegates operations (pay(), ship(), refund()) to the active OrderState polymorphic class. In DeliveredState, calling refund() throws an immediate UnsupportedOperationException unless an explicit ReturnRequested state is traversed first.',
      vi: 'Áp dụng mẫu State bằng Sealed Interface trong Java 21. Lớp Order ủy quyền các hành động (pay, ship, refund) cho đối tượng OrderState hiện tại. Trong DeliveredState, hành động refund() sẽ lập tức bị chặn đứng và ném lỗi, trừ khi đơn hàng đã đi qua bước trung gian Yêu cầu trả hàng hợp lệ.'
    },
    productionCode: `// Production Safe State Machine Architecture for Order Lifecycles (Java 21)
package com.ecommerce.order.state;

public interface OrderState {
    void pay(OrderContext ctx);
    void ship(OrderContext ctx);
    void refund(OrderContext ctx);
    String name();
}

public class OrderContext {
    private OrderState state = new CreatedState();
    public void setState(OrderState state) { this.state = state; }
    public void pay() { state.pay(this); }
    public void ship() { state.ship(this); }
    public void refund() { state.refund(this); }
    public String getStatus() { return state.name(); }
}

public class CreatedState implements OrderState {
    @Override public void pay(OrderContext ctx) { ctx.setState(new PaidState()); }
    @Override public void ship(OrderContext ctx) { throw new IllegalStateException("Cannot ship unpaid order!"); }
    @Override public void refund(OrderContext ctx) { throw new IllegalStateException("Order not paid yet!"); }
    @Override public String name() { return "CREATED"; }
}

public class PaidState implements OrderState {
    @Override public void pay(OrderContext ctx) { throw new IllegalStateException("Already paid!"); }
    @Override public void ship(OrderContext ctx) { ctx.setState(new ShippedState()); }
    @Override public void refund(OrderContext ctx) { ctx.setState(new RefundedState()); }
    @Override public String name() { return "PAID"; }
}

public class ShippedState implements OrderState {
    @Override public void pay(OrderContext ctx) { throw new IllegalStateException("Already paid!"); }
    @Override public void ship(OrderContext ctx) { throw new IllegalStateException("Already in transit!"); }
    // STRICT DEFENSE: Direct refund while shipped is completely illegal!
    @Override public void refund(OrderContext ctx) { 
        throw new IllegalStateException("Cannot refund order in transit! Must initiate return after delivery."); 
    }
    @Override public String name() { return "SHIPPED"; }
}

public class RefundedState implements OrderState {
    @Override public void pay(OrderContext ctx) { throw new IllegalStateException("Terminal state"); }
    @Override public void ship(OrderContext ctx) { throw new IllegalStateException("Terminal state"); }
    @Override public void refund(OrderContext ctx) { throw new IllegalStateException("Already refunded"); }
    @Override public String name() { return "REFUNDED"; }
}`,
    architectureImpact: {
      en: 'Illegal lifecycle transition exploits dropped to 0; State transitions are self-documenting and mathematically provable; Complete elimination of procedural string-comparison bugs.',
      vi: 'Triệt tiêu 100% lỗ hổng nhảy cóc trạng thái gian lận; Mọi bước chuyển trạng thái đều tường minh và được kiểm soát chặt chẽ; Xóa bỏ hoàn toàn các lỗi so sánh chuỗi thủ công.'
    }
  }
};
