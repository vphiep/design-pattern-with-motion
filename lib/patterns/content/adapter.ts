import type { Pattern } from '../types';

export const adapter: Pattern = {
  id: 'adapter',
  category: 'structural',
  name: 'Adapter',
  tagline: {
    en: 'Wrap an object with a different interface so it fits where it doesn’t natively belong.',
    vi: 'Bọc một object bằng một interface khác để nó lắp vừa vào chỗ mà vốn dĩ nó không khớp.'
  },
  analogy: {
    en: 'A travel power adapter. Your laptop plug is flat and American; the wall socket is round and European. The adapter doesn’t change the electricity — it just changes the shape so the two can talk. The Adapter pattern is the same: it makes an existing class usable in code that expects a different shape.',
    vi: 'Chiếc adapter chuyển đổi ổ cắm khi đi du lịch. Phích cắm laptop của bạn là chân dẹt kiểu Mỹ; ổ điện trên tường lại là lỗ tròn kiểu châu Âu. Adapter không thay đổi dòng điện — nó chỉ đổi hình dạng để hai bên nói chuyện được với nhau. Pattern Adapter cũng vậy: nó giúp một class sẵn có dùng được trong đoạn code đang mong đợi một “hình dạng” khác.'
  },
  whenToUse: [
    {
      en: 'You want to use an existing class, but its interface doesn’t match the one your code expects.',
      vi: 'Bạn muốn dùng một class sẵn có, nhưng interface của nó không khớp với interface mà code của bạn mong đợi.'
    },
    {
      en: 'You want to integrate a third-party library without changing your own code to match its types.',
      vi: 'Bạn muốn tích hợp một thư viện bên thứ ba mà không phải sửa code của mình cho khớp với các kiểu dữ liệu của thư viện đó.'
    },
    {
      en: 'You want to translate between two systems that evolved separately.',
      vi: 'Bạn cần “phiên dịch” giữa hai hệ thống vốn phát triển độc lập với nhau.'
    }
  ],
  whenNotToUse: [
    {
      en: 'You control both sides — change the interface directly instead of wrapping.',
      vi: 'Bạn kiểm soát cả hai phía — hãy sửa thẳng interface thay vì bọc thêm một lớp.'
    },
    {
      en: 'The mismatch is so small that an adapter hides more than it helps.',
      vi: 'Chỗ lệch nhau quá nhỏ, đến mức thêm adapter chỉ che khuất code chứ chẳng giúp được gì.'
    }
  ],
  difficulty: 1,
  order: 6,
  javaCode: `// The interface your code expects.
interface PaymentGateway {
    void charge(int cents);
    boolean wasSuccessful();
}

// A third-party library that uses a different shape.
final class StripeApi {
    public boolean createCharge(int amountInCents, String currency) {
        System.out.println("Stripe: charging " + amountInCents + " " + currency);
        return true;
    }
}

// The adapter: it implements the interface your code uses, and
// translates calls into the third-party API.
final class StripeAdapter implements PaymentGateway {
    private final StripeApi stripe = new StripeApi();
    private boolean ok = false;

    @Override public void charge(int cents) {
        ok = stripe.createCharge(cents, "USD");
    }
    @Override public boolean wasSuccessful() { return ok; }
}

// Your code only sees PaymentGateway, never StripeApi directly.
// To swap providers, you write a new adapter — nothing else changes.`,
  steps: [
    {
      title: {
        en: 'The interface your code expects',
        vi: 'Interface mà code của bạn mong đợi'
      },
      body: {
        en: 'Your application is written against the PaymentGateway interface: it calls charge(cents) and later checks wasSuccessful(). This is the “shape of the plug” your code was designed for — nothing in your codebase knows or cares which payment provider actually sits behind it.',
        vi: 'Ứng dụng của bạn được viết dựa trên interface PaymentGateway: nó gọi charge(cents) rồi sau đó kiểm tra wasSuccessful(). Đây chính là “hình dạng phích cắm” mà code của bạn được thiết kế cho — không chỗ nào trong codebase biết hay quan tâm nhà cung cấp thanh toán nào đang thực sự đứng phía sau.'
      }
    },
    {
      title: {
        en: 'The class you actually have',
        vi: 'Class mà bạn thực sự có trong tay'
      },
      body: {
        en: 'StripeApi is the third-party library — it does the real work, but in a different shape. Its method is createCharge(amountInCents, currency): a different name, a different parameter list, and it returns a boolean instead of storing a status. Because it doesn’t implement PaymentGateway, you can’t plug it into your code directly.',
        vi: 'StripeApi là thư viện bên thứ ba — nó mới là bên làm việc thật, nhưng theo một “hình dạng” khác. Method của nó là createCharge(amountInCents, currency): tên khác, danh sách tham số khác, và trả thẳng về boolean thay vì lưu trạng thái. Vì nó không implement PaymentGateway, bạn không thể cắm thẳng nó vào code của mình.'
      }
    },
    {
      title: {
        en: 'The adapter translates the call',
        vi: 'Adapter phiên dịch lời gọi'
      },
      body: {
        en: 'StripeAdapter implements the PaymentGateway interface your code expects, and holds a StripeApi inside. When someone calls charge(cents), the highlighted line ok = stripe.createCharge(cents, "USD") forwards the request in the vocabulary Stripe understands and remembers the result so wasSuccessful() can answer later. To switch providers, you write one new adapter — the rest of your code never changes.',
        vi: 'StripeAdapter implement đúng interface PaymentGateway mà code của bạn mong đợi, và giữ một StripeApi ở bên trong. Khi ai đó gọi charge(cents), dòng được highlight ok = stripe.createCharge(cents, "USD") chuyển tiếp yêu cầu bằng đúng “ngôn ngữ” mà Stripe hiểu, đồng thời ghi nhớ kết quả để wasSuccessful() trả lời sau. Muốn đổi nhà cung cấp, bạn chỉ cần viết một adapter mới — phần còn lại của code không phải sửa gì.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.io.InputStreamReader',
      note: {
        en: 'InputStreamReader is an adapter shipped in the JDK itself: it wraps a byte-oriented InputStream and exposes it through the character-oriented Reader interface, so text-processing code that expects a Reader can consume a raw byte stream without knowing anything about the bytes underneath.',
        vi: 'InputStreamReader là một adapter nằm ngay trong JDK: nó bọc một InputStream vốn làm việc theo byte và phơi ra qua interface Reader làm việc theo ký tự, nhờ đó code xử lý text chỉ cần một Reader vẫn đọc được stream byte thô mà không cần biết gì về đống byte bên dưới.'
      }
    },
    {
      system: 'java.util.Arrays.asList()',
      note: {
        en: 'Arrays.asList() wraps a plain Java array so it can be used through the List interface. The array itself doesn’t change — the wrapper just lets collection-based code (iteration, indexOf, contains) talk to it in the vocabulary it already speaks.',
        vi: 'Arrays.asList() bọc một mảng Java thuần để nó dùng được qua interface List. Bản thân mảng không thay đổi gì — lớp wrapper chỉ giúp những đoạn code làm việc với collection (duyệt phần tử, indexOf, contains) nói chuyện với mảng bằng đúng “ngôn ngữ” chúng đã quen.'
      }
    }
  ]
};
