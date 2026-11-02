import type { Pattern } from '../types';

export const command: Pattern = {
  id: 'command',
  category: 'behavioral',
  name: 'Command',
  tagline: {
    en: 'Turn a request into its own object, so you can queue, log, undo, or send it like any other value.',
    vi: 'Biến một request thành object riêng, để bạn có thể xếp hàng, ghi log, undo, hoặc gửi nó như mọi value khác.'
  },
  analogy: {
    en: 'A restaurant order ticket. The waiter doesn’t go to the kitchen and shout at the chef. They write down “one burger, no onions, well done.” That ticket *is* the request — it can be queued, reordered, canceled, or replayed without anyone caring who originally wrote it.',
    vi: 'Phiếu order nhà hàng. Bồi bàn không vào bếp la đầu bếp. Họ viết “một burger, không hành, chín kỹ.” Tờ phiếu *chính là* request — xếp hàng, đổi thứ tự, hủy, hoặc làm lại được, mà không ai cần biết ai đã viết.'
  },
  whenToUse: [
    {
      en: 'You want to parameterize objects with actions — the same UI button doing different things based on context.',
      vi: 'Bạn muốn gắn action vào object — cùng một nút UI làm việc khác nhau tùy ngữ cảnh.'
    },
    {
      en: 'You need to queue, schedule, log, or undo operations.',
      vi: 'Bạn cần xếp hàng, hẹn giờ, ghi log, hoặc undo thao tác.'
    },
    {
      en: 'You want to decouple the thing that issues a request from the thing that knows how to do it.',
      vi: 'Bạn muốn tách bên phát request khỏi bên biết cách làm việc đó.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The action is a one-off and you’ll never need to queue, undo, or replay it.',
      vi: 'Action chỉ dùng một lần và bạn không bao giờ cần xếp hàng, undo, hay replay.'
    },
    {
      en: 'You only have a couple of operations — adding command objects adds ceremony for no payoff.',
      vi: 'Bạn chỉ có vài thao tác — thêm command object chỉ thêm nghi thức mà không được gì.'
    }
  ],
  difficulty: 2,
  order: 14,
  javaCode: `// A command: anything you can execute.
interface Command { void execute(); }

// The receiver: the object that actually knows how to do the work.
final class TextEditor {
    private final StringBuilder buffer = new StringBuilder();
    public void append(String s) { buffer.append(s); }
    public String content()      { return buffer.toString(); }
}

// Concrete commands. Each one carries everything it needs.
final class AppendCommand implements Command {
    private final TextEditor editor;
    private final String text;
    AppendCommand(TextEditor editor, String text) { this.editor = editor; this.text = text; }
    public void execute() { editor.append(text); }
}

// The invoker: it just calls execute(). It doesn't know what's inside
// the command or what it'll do.
final class Button {
    private Command command;
    public void set(Command c) { this.command = c; }
    public void click()        { if (command != null) command.execute(); }
}

// Compose:
//   Button save = new Button();
//   save.set(new AppendCommand(editor, "hello"));
//   save.click();
//   editor.content(); -> "hello"`,
  steps: [
    {
      title: {
        en: 'The request becomes an object with execute()',
        vi: 'Request trở thành object có execute()'
      },
      body: {
        en: 'Command is a tiny interface: one execute() method. Anything that implements it is a request you can hold, pass, and store. The waiter’s ticket is this object — not a shout across the kitchen, not a direct call on the chef.',
        vi: 'Command là interface nhỏ: một method execute(). Thứ gì implement nó là một request bạn cầm, truyền, và cất được. Phiếu của bồi bàn chính là object này — không phải tiếng la sang bếp, cũng không phải lời gọi thẳng lên đầu bếp.'
      }
    },
    {
      title: {
        en: 'A concrete command carries the work and the receiver',
        vi: 'Command concrete mang theo việc và receiver'
      },
      body: {
        en: 'AppendCommand stores a TextEditor (the receiver) and the string to append. Its execute() line editor.append(text) is the actual work. The command knows the chef; the button that will fire it does not. That is the decoupling.',
        vi: 'AppendCommand giữ một TextEditor (receiver) và chuỗi cần append. Dòng execute() editor.append(text) mới là việc thật. Command biết đầu bếp; nút sẽ bắn nó thì không. Đó là chỗ tách.'
      }
    },
    {
      title: {
        en: 'The invoker fires the command without knowing the work',
        vi: 'Invoker bắn command mà không biết việc gì'
      },
      body: {
        en: 'Button is the invoker. set(Command) installs whichever ticket you want; click() only calls command.execute(). Swap AppendCommand for a different Command and the same button does different work — queue, log, or undo become possible because the request is now a value.',
        vi: 'Button là invoker. set(Command) gắn phiếu bạn muốn; click() chỉ gọi command.execute(). Đổi AppendCommand sang Command khác thì cùng nút làm việc khác — xếp hàng, log, hay undo trở nên khả thi vì request giờ là một value.'
      }
    }
  ],
  realSystems: [
    {
      system: 'javax.swing.Action',
      note: {
        en: 'A Swing Action is a command bound to buttons, menus, and keystrokes. One Action instance can be shared across those invokers; enabled state and the execute body stay in one place.',
        vi: 'Swing Action là command gắn vào nút, menu và phím tắt. Một instance Action dùng chung cho các invoker đó; trạng thái enabled và phần việc execute ở một chỗ.'
      }
    },
    {
      system: 'java.lang.Runnable and java.util.concurrent.Callable',
      note: {
        en: 'ExecutorService.execute(Runnable) and submit(Callable) treat the unit of work as an object you can queue, reject, or cancel. The thread pool is the invoker; your task is the command.',
        vi: 'ExecutorService.execute(Runnable) và submit(Callable) coi đơn vị công việc là object xếp hàng, từ chối, hoặc hủy được. Thread pool là invoker; task của bạn là command.'
      }
    },
    {
      system: 'javax.swing.undo.UndoableEdit',
      note: {
        en: 'UndoableEdit is a command that remembers how to undo itself. UndoManager is the invoker that stacks those edits and replays undo() / redo() on demand.',
        vi: 'UndoableEdit là command nhớ cách tự undo. UndoManager là invoker xếp chồng các edit đó và replay undo() / redo() khi cần.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'execute() alone can fire work; undo needs the command to remember what it changed. The form below adds undo() to Command and a History stack on the invoker: execute pushes, undo pops and reverses. The request is now a reversible ticket, which is why editors use this shape.',
      vi: 'Một mình execute() chỉ bắn việc; undo cần command nhớ nó đã đổi gì. Dạng bên dưới thêm undo() vào Command và một stack History trên invoker: execute thì push, undo thì pop rồi đảo ngược. Request giờ là phiếu đảo được — đó là lý do editor dùng hình này.'
    },
    tradeoffs: {
      en: 'An undo stack is the payoff of Command, but every concrete command must store enough before-state to reverse itself, and some actions cannot be reversed at all (a sent email). Macro commands (a list of commands) multiply that bookkeeping. Skip undo() until you have a real history UI.',
      vi: 'Stack undo là phần thưởng của Command, nhưng mọi command concrete phải lưu đủ state trước đó để đảo, và một số action không đảo được (email đã gửi). Macro command (một list command) nhân đôi sổ sách đó. Đừng thêm undo() cho đến khi bạn có UI lịch sử thật.'
    },
    javaCode: `interface Command {
    void execute();
    void undo();
}

final class TextEditor {
    private final StringBuilder buffer = new StringBuilder();
    void append(String s) { buffer.append(s); }
    void deleteLast(int n) { buffer.delete(buffer.length() - n, buffer.length()); }
    String content() { return buffer.toString(); }
}

final class AppendCommand implements Command {
    private final TextEditor editor;
    private final String text;
    AppendCommand(TextEditor editor, String text) { this.editor = editor; this.text = text; }
    public void execute() { editor.append(text); }
    public void undo()    { editor.deleteLast(text.length()); }
}

final class History {
    private final java.util.Deque<Command> stack = new java.util.ArrayDeque<>();
    void execute(Command c) { c.execute(); stack.push(c); }
    void undo() {
        if (!stack.isEmpty()) stack.pop().undo();
    }
}`
  },

  deepTheory: {
    academicRoot: {
      en: 'Formalized in Gang of Four (1994). Encapsulates a request as an object, parameterizing clients with different requests, enabling queued execution, audit logging, and reversible operations (Undo/Redo). Forms the architectural foundation for Distributed Saga orchestration in microservices.',
      vi: 'Được chính thức hóa trong Gang of Four (1994). Đóng gói một yêu cầu thành một đối tượng độc lập, cho phép tham số hóa các yêu cầu, hỗ trợ xếp hàng thực thi, ghi nhật ký kiểm toán và khả năng hoàn tác (Undo/Redo). Đây là nền tảng kiến trúc của mô hình Saga phân tán trong vi dịch vụ.'
    },
    structuralCouplingMetric: {
      en: 'Completely severs coupling between the Invoker (queue, scheduler, UI) and the Receiver (domain business entity).',
      vi: 'Cắt đứt hoàn toàn sự gắn kết giữa đối tượng phát lệnh Invoker (hàng đợi, bộ lập lịch) và đối tượng thực thi Receiver (thực thể nghiệp vụ domain).'
    },
    memoryAndVtableTradeoff: {
      en: 'Command instances retain state in Heap memory for undo operations. Ephemeral commands in high-throughput loops should be pooled or discarded immediately.',
      vi: 'Các đối tượng Command lưu giữ trạng thái trên Heap để phục vụ hoàn tác. Các command tạm thời trong luồng tải cao cần được tái sử dụng hoặc giải phóng ngay sau khi chạy.'
    },
    enterpriseBestPractices: [
      {
        en: 'Enforce Command Idempotency: Always assign a unique idempotencyKey to each command to prevent duplicate execution during network retries.',
        vi: 'Bảo đảm tính lũy đẳng (Idempotency): Luôn gán một mã khóa duy nhất idempotencyKey cho từng command để chống thực thi lặp lại khi có cơ chế retry mạng.'
      },
      {
        en: 'Saga Compensating Transactions: Implement a compensate() method for every execute() to ensure clean rollbacks across distributed REST/gRPC boundaries.',
        vi: 'Giao dịch đền bù Saga: Luôn cài đặt phương thức compensate() song hành với execute() để bảo đảm hoàn tác an toàn qua ranh giới các dịch vụ phân tán.'
      }
    ]
  },

  productionProblemCase: {
    title: {
      en: 'Distributed Travel Saga Booking Partial Failure & Automated Compensating Rollback',
      vi: 'Sự Cố Đặt Vé Du Lịch Phân Tán Bị Lỗi Nửa Chừng & Cơ Chế Hoàn Tác Tự Động Bằng Mẫu Command'
    },
    businessContext: {
      en: 'An online travel agency coordinates multi-step vacation bookings involving Flights, Hotel Rooms, and Car Rentals across independent third-party provider APIs.',
      vi: 'Đại lý du lịch trực tuyến điều phối các gói đặt chỗ phức hợp gồm: Vé máy bay, Khách sạn và Thuê xe ô tô qua các API của nhiều đối tác độc lập.'
    },
    problemDescription: {
      en: 'When a customer booked a vacation package, the service successfully charged $1,200 on their credit card and reserved the luxury hotel room. However, the third flight booking step failed due to sudden airline seat depletion. Because the booking pipeline was implemented with procedural HTTP calls, the system had no automated rollback mechanism! The customer was left with an unrefundable hotel room and a credit card charge for a trip they could not take, requiring 3,500 manual customer service dispute interventions per month.',
      vi: 'Khi khách hàng đặt gói du lịch, hệ thống đã trừ thành công 1,200 USD trên thẻ tín dụng và đặt phòng khách sạn. Tuy nhiên, bước thứ ba đặt vé máy bay bị thất bại do hãng hàng không vừa hết chỗ. Do quy trình được viết bằng các lệnh HTTP thủ công rời rạc, hệ thống không có cách nào để tự động hoàn tác phòng khách sạn! Khách hàng bị mất tiền và mắc kẹt với phòng khách sạn không thể đi, tạo ra hơn 3,500 khiếu nại dịch vụ mỗi tháng buộc nhân viên phải xử lý thủ công.'
    },
    whyNaiveFails: {
      en: 'Traditional ACID two-phase commit (2PC) across third-party REST APIs is impossible due to network partitions, lock holding times, and lack of XA transaction support.',
      vi: 'Giao thức giao dịch phân tán 2PC cổ điển hoàn toàn bất khả thi trên các API REST của bên thứ ba do rào cản phân mảnh mạng, thời gian giữ khóa quá lâu và thiếu hỗ trợ chuẩn XA.'
    },
    coreSolution: {
      en: 'Model each reservation step as a Saga Command implementing execute() and compensate(). The Saga Orchestrator executes commands sequentially; if any command fails, it navigates backward through executed commands, triggering compensate() to release hotel reservations and refund credit cards automatically.',
      vi: 'Mô hình hóa từng bước đặt chỗ thành một Saga Command có 2 hàm execute() và compensate(). Bộ điều phối Saga chạy các lệnh tuần tự; nếu có bất kỳ bước nào lỗi, nó tự động duyệt ngược lại các lệnh đã hoàn thành và kích hoạt compensate() để tự hủy phòng và hoàn tiền lại vào thẻ khách hàng.'
    },
    productionCode: `// Production Distributed Saga Orchestrator using Command Pattern (Java 21)
package com.travel.saga.command;

import java.util.ArrayDeque;
import java.util.Deque;

public interface SagaCommand {
    boolean execute();
    void compensate();
    String name();
}

public class HotelReservationCommand implements SagaCommand {
    private final String bookingRef;
    public HotelReservationCommand(String ref) { this.bookingRef = ref; }
    @Override public boolean execute() { System.out.println("Hotel Reserved: " + bookingRef); return true; }
    @Override public void compensate() { System.out.println("Cancelling Hotel: " + bookingRef); }
    @Override public String name() { return "HotelReservation"; }
}

public class FlightBookingCommand implements SagaCommand {
    private final boolean shouldFail;
    public FlightBookingCommand(boolean shouldFail) { this.shouldFail = shouldFail; }
    @Override public boolean execute() {
        if (shouldFail) throw new RuntimeException("Flight Seats Exhausted!");
        return true;
    }
    @Override public void compensate() { System.out.println("Releasing Flight Reservation"); }
    @Override public String name() { return "FlightBooking"; }
}

public class SagaOrchestrator {
    public boolean runSaga(java.util.List<SagaCommand> steps) {
        Deque<SagaCommand> executed = new ArrayDeque<>();
        for (SagaCommand step : steps) {
            try {
                boolean ok = step.execute();
                if (!ok) throw new RuntimeException("Step rejected: " + step.name());
                executed.push(step);
            } catch (Exception e) {
                System.err.println("Saga step failed: " + step.name() + ". Initiating Compensating Rollback!");
                while (!executed.isEmpty()) {
                    SagaCommand rollbackStep = executed.pop();
                    try { rollbackStep.compensate(); } catch (Exception ignored) {}
                }
                return false;
            }
        }
        return true;
    }
}`,
    architectureImpact: {
      en: 'Manual customer support cancellation interventions dropped from 3,500/month to 0; Zero stranded partial bookings; 100% automated eventual consistency achieved across distributed microservices.',
      vi: 'Số lượng khiếu nại phải xử lý thủ công giảm từ 3,500 vụ/tháng về 0; Triệt tiêu hoàn toàn tình trạng đặt chỗ dở dang; Đạt được tính nhất quán cuối cùng (Eventual Consistency) tự động 100% giữa các vi dịch vụ phân tán.'
    }
  }
};
