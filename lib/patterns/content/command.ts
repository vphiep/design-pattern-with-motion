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
  }
};
