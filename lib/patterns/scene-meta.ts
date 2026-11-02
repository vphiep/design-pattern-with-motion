import type { SceneMeta } from './scene';

export const SCENE_META: Record<string, SceneMeta> = {
  singleton: {
    caption: {
      en: 'Many callers. One instance. One door.',
      vi: 'Nhiều caller. Một instance. Một cửa.'
    },
    steps: [
      {
        id: 'ask',
        label: 'Callers request',
        match: 'public static AppConfig getInstance()',
        span: 3
      },
      { id: 'build', label: 'First call constructs', match: 'instance = new AppConfig()', span: 1 },
      { id: 'reuse', label: 'Everyone shares it', match: 'return instance', span: 1 }
    ]
  },
  'factory-method': {
    caption: {
      en: 'Ask the shop. The shop picks the product.',
      vi: 'Hỏi cửa hàng. Cửa hàng chọn product.'
    },
    steps: [
      { id: 'ask', label: 'Caller logs', match: 'public void log(String message)', span: 4 },
      {
        id: 'factory',
        label: 'Factory method',
        match: 'protected abstract LogDestination createDestination()',
        span: 1
      },
      { id: 'product', label: 'Subclass decides', match: 'return new StdoutDestination()', span: 1 }
    ]
  },
  'abstract-factory': {
    caption: {
      en: 'A whole family, never a mixed kit.',
      vi: 'Cả một họ hàng, không bao giờ lẫn bộ.'
    },
    steps: [
      { id: 'family', label: 'Family contract', match: 'interface UIFactory', span: 4 },
      { id: 'kit', label: 'Concrete kit', match: 'createButton()', span: 1 },
      { id: 'products', label: 'Matching parts', match: 'createCheckbox()', span: 1 }
    ]
  },
  builder: {
    caption: {
      en: 'Collect the choices. Commit once.',
      vi: 'Gom các lựa chọn. Commit một lần.'
    },
    steps: [
      {
        id: 'start',
        label: 'Required base',
        match: 'public Builder(String method, String url)',
        span: 4
      },
      { id: 'steps', label: 'Optional steps', match: 'public Builder header', span: 3 },
      { id: 'build', label: 'Commit', match: 'public HttpRequest build()', span: 1 }
    ]
  },
  prototype: {
    caption: {
      en: 'Copy the original. Don’t redraw it.',
      vi: 'Chép bản gốc. Đừng vẽ lại từ đầu.'
    },
    steps: [
      { id: 'proto', label: 'Keep a prototype', match: 'public void register', span: 1 },
      { id: 'copy', label: 'Clone it', match: 'public Shape copy()', span: 1 },
      { id: 'new', label: 'A new instance', match: 'return prototypes.get(name).copy()', span: 1 }
    ]
  },
  adapter: {
    caption: {
      en: 'Same electricity. Different plug.',
      vi: 'Cùng dòng điện. Khác phích cắm.'
    },
    steps: [
      { id: 'need', label: 'What we need', match: 'interface PaymentGateway', span: 4 },
      { id: 'have', label: 'What we have', match: 'final class StripeApi', span: 5 },
      { id: 'adapt', label: 'Translate', match: 'ok = stripe.createCharge', span: 1 }
    ]
  },
  bridge: {
    caption: {
      en: 'Shape has a renderer. Either side can change.',
      vi: 'Shape giữ một renderer. Đổi bên nào cũng được.'
    },
    steps: [
      { id: 'impl', label: 'Implementation', match: 'interface Renderer', span: 3 },
      {
        id: 'abs',
        label: 'The bridge pointer',
        match: 'protected final Renderer renderer',
        span: 1
      },
      { id: 'draw', label: 'Delegate draw', match: 'renderer.drawCircle', span: 1 }
    ]
  },
  composite: {
    caption: {
      en: 'A file and a folder answer the same question.',
      vi: 'File và folder trả lời cùng một câu hỏi.'
    },
    steps: [
      { id: 'same', label: 'Shared contract', match: 'interface FileSystemNode', span: 4 },
      { id: 'leaf', label: 'A leaf', match: 'final class File implements', span: 6 },
      { id: 'sum', label: 'Recurse children', match: 'total += child.sizeBytes()', span: 1 }
    ]
  },
  decorator: {
    caption: {
      en: 'Wrap, then wrap again. Same cup, new layers.',
      vi: 'Bọc, rồi bọc nữa. Cùng một chiếc cốc, thêm lớp mới.'
    },
    steps: [
      { id: 'base', label: 'Plain object', match: 'final class PlainText', span: 5 },
      { id: 'wrap', label: 'A wrapper', match: 'protected final Text inner', span: 2 },
      { id: 'stack', label: 'Compose layers', match: 'return "<b>" + inner.render()', span: 1 }
    ]
  },
  facade: {
    caption: {
      en: 'One front door. A lot of rooms behind it.',
      vi: 'Một cửa trước. Nhiều phòng phía sau.'
    },
    steps: [
      { id: 'mess', label: 'The subsystem', match: 'final class CodecFactory', span: 3 },
      { id: 'door', label: 'One method', match: 'public VideoFile convert', span: 7 },
      { id: 'client', label: 'One line to call', match: 'converted to', span: 1 }
    ]
  },
  flyweight: {
    caption: {
      en: 'A forest of trees. A handful of types.',
      vi: 'Một rừng cây. Chỉ vài loại.'
    },
    steps: [
      { id: 'share', label: 'Shared type', match: 'final class TreeType', span: 7 },
      { id: 'cache', label: 'Reuse from cache', match: 'computeIfAbsent', span: 1 },
      { id: 'unique', label: 'Unique position', match: 'private final int x, y', span: 2 }
    ]
  },
  proxy: {
    caption: {
      en: 'A stand-in that decides when the real one appears.',
      vi: 'Người thế chỗ quyết định khi nào bản thật xuất hiện.'
    },
    steps: [
      { id: 'same', label: 'Same interface', match: 'interface Image', span: 3 },
      { id: 'real', label: 'Expensive object', match: 'Loading', span: 1 },
      { id: 'lazy', label: 'Build on demand', match: 'if (real == null)', span: 2 }
    ]
  },
  'chain-of-responsibility': {
    caption: {
      en: 'The ticket walks until someone takes it.',
      vi: 'Phiếu đi tiếp cho đến khi có người nhận.'
    },
    steps: [
      { id: 'link', label: 'Link handlers', match: 'public SupportHandler linkWith', span: 1 },
      { id: 'try', label: 'Handle or pass', match: 'if (canHandle(issue))', span: 3 },
      { id: 'act', label: 'Someone resolves', match: 'protected void resolve', span: 1 }
    ]
  },
  command: {
    caption: {
      en: 'The request becomes a ticket you can queue.',
      vi: 'Request biến thành phiếu có thể xếp hàng.'
    },
    steps: [
      { id: 'ticket', label: 'Request as object', match: 'interface Command', span: 1 },
      {
        id: 'carry',
        label: 'Carry the work',
        match: 'public void execute() { editor.append',
        span: 1
      },
      { id: 'click', label: 'Invoker fires it', match: 'public void click()', span: 1 }
    ]
  },
  interpreter: {
    caption: {
      en: 'Text becomes a tree. The tree knows how to answer.',
      vi: 'Chữ thành cây. Cây biết cách trả lời.'
    },
    steps: [
      { id: 'leaf', label: 'A number', match: 'final class Number implements Expr', span: 5 },
      { id: 'op', label: 'An operator', match: 'return left.eval() + right.eval()', span: 1 },
      { id: 'eval', label: 'Evaluate the tree', match: 'expr.eval()', span: 1 }
    ]
  },
  iterator: {
    caption: {
      en: 'Next. Next. Never mind how it’s stored.',
      vi: 'Next. Next. Không cần biết nó được lưu thế nào.'
    },
    steps: [
      { id: 'api', label: 'Uniform cursor', match: 'interface Iterator<T>', span: 4 },
      { id: 'walk', label: 'Advance', match: 'public Integer next()', span: 6 },
      { id: 'hide', label: 'Hide the tree', match: 'pushLeft', span: 3 }
    ]
  },
  mediator: {
    caption: {
      en: 'Nobody talks sideways. Everyone talks to the tower.',
      vi: 'Không ai nói ngang. Ai cũng nói với đài.'
    },
    steps: [
      { id: 'hub', label: 'The hub', match: 'public void send(String from', span: 4 },
      { id: 'users', label: 'Participants', match: 'final class User', span: 6 },
      { id: 'route', label: 'Route through room', match: 'room.send(name, to, msg)', span: 1 }
    ]
  },
  memento: {
    caption: {
      en: 'Save the moment. Restore it later. Don’t peek.',
      vi: 'Lưu khoảnh khắc. Khôi phục sau. Đừng nhìn trộm.'
    },
    steps: [
      { id: 'snap', label: 'Take a snapshot', match: 'public EditorMemento save()', span: 1 },
      {
        id: 'hold',
        label: 'Caretaker stores it',
        match: 'public void push(EditorMemento m)',
        span: 2
      },
      { id: 'undo', label: 'Restore', match: 'public void restore', span: 1 }
    ]
  },
  observer: {
    caption: {
      en: 'The subject pulses. Every subscriber reacts.',
      vi: 'Subject nhịp một cái. Mọi subscriber phản ứng.'
    },
    steps: [
      { id: 'sub', label: 'Subscribe', match: 'public void subscribe', span: 1 },
      { id: 'pub', label: 'Publish', match: 'public void publish', span: 4 },
      { id: 'react', label: 'Observers update', match: 'public void update(String news)', span: 1 }
    ]
  },
  state: {
    caption: {
      en: 'Same object. Different costume. Different rules.',
      vi: 'Cùng một object. Khác trang phục. Khác luật.'
    },
    steps: [
      { id: 'modes', label: 'State objects', match: 'interface ConnectionState', span: 5 },
      { id: 'hold', label: 'Context holds one', match: 'private ConnectionState state', span: 1 },
      { id: 'swap', label: 'Behavior swaps', match: 'if (state instanceof Closed)', span: 1 }
    ]
  },
  strategy: {
    caption: {
      en: 'Swap the plan. Keep the checkout.',
      vi: 'Đổi kế hoạch. Giữ nguyên quầy tính tiền.'
    },
    steps: [
      { id: 'family', label: 'A family of plans', match: 'interface PricingStrategy', span: 3 },
      { id: 'slot', label: 'One slot', match: 'public void set(PricingStrategy s)', span: 1 },
      { id: 'run', label: 'Delegate the work', match: 'return pricing.totalFor', span: 1 }
    ]
  },
  'template-method': {
    caption: {
      en: 'The outline is fixed. A few steps are blank.',
      vi: 'Khung cố định. Vài bước để trống.'
    },
    steps: [
      { id: 'skel', label: 'Fixed skeleton', match: 'public final void run()', span: 5 },
      { id: 'hooks', label: 'Abstract steps', match: 'protected abstract void read()', span: 3 },
      { id: 'fill', label: 'Subclass fills in', match: 'protected void transform()', span: 1 }
    ]
  },
  visitor: {
    caption: {
      en: 'The inspector visits. The assets just accept.',
      vi: 'Thanh tra đến thăm. Tài sản chỉ việc accept.'
    },
    steps: [
      { id: 'accept', label: 'Accept a visitor', match: 'void accept(AssetVisitor v)', span: 1 },
      { id: 'double', label: 'Double dispatch', match: 'v.visit(this)', span: 1 },
      { id: 'op', label: 'Operation lives outside', match: 'public void visit(Stock s)', span: 1 }
    ]
  }
};
