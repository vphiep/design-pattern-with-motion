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
        en: 'The subject publishes to everyone on the list',
        vi: 'Subject publish tới mọi người trên list'
      },
      body: {
        en: 'publish(headline) stores the latest headline, then walks the list and calls update on each subscriber. NewsChannel does not name EmailAlert or PhoneAlert here — only the Subscriber interface. That is the decoupling: the channel broadcasts, it does not address anyone.',
        vi: 'publish(headline) lưu headline mới, rồi đi list và gọi update trên mỗi subscriber. NewsChannel không gọi tên EmailAlert hay PhoneAlert ở đây — chỉ interface Subscriber. Đó là chỗ tách: kênh broadcast, không gọi tên ai.'
      }
    },
    {
      title: {
        en: 'Each observer reacts in its own way',
        vi: 'Mỗi observer phản ứng theo cách riêng'
      },
      body: {
        en: 'EmailAlert.update prints an email line; PhoneAlert.update prints a phone line. Same event, different reactions. Adding a LogAlert is a new class plus one subscribe() call — publish() does not change.',
        vi: 'EmailAlert.update in một dòng email; PhoneAlert.update in một dòng phone. Cùng event, phản ứng khác. Thêm LogAlert là một class mới cộng một lời subscribe() — publish() không đổi.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.beans.PropertyChangeSupport',
      note: {
        en: 'PropertyChangeSupport holds PropertyChangeListener instances and fires PropertyChangeEvent when a bound property changes. Swing beans and many JavaBeans use this as the standard observer bus.',
        vi: 'PropertyChangeSupport giữ các PropertyChangeListener và bắn PropertyChangeEvent khi một bound property đổi. Bean Swing và nhiều JavaBean dùng đây làm bus observer chuẩn.'
      }
    },
    {
      system: 'java.util.concurrent.Flow (Reactive Streams)',
      note: {
        en: 'Flow.Publisher / Subscriber is the JDK’s back-pressured observer. subscribe() registers a Subscriber; onNext delivers items. Project Reactor and RxJava implement the same protocol.',
        vi: 'Flow.Publisher / Subscriber là observer có back-pressure trong JDK. subscribe() đăng ký Subscriber; onNext gửi item. Project Reactor và RxJava implement cùng protocol.'
      }
    },
    {
      system: 'javax.swing.event — ListDataListener, ChangeListener',
      note: {
        en: 'Swing models notify attached listeners when the model changes. A JList does not poll its ListModel; the model fires intervalAdded / contentsChanged and the view repaints.',
        vi: 'Model Swing báo các listener đã gắn khi model đổi. JList không poll ListModel; model bắn intervalAdded / contentsChanged và view vẽ lại.'
      }
    }
  ],
  advanced: {
    whatMakesItAdvanced: {
      en: 'Iterating an ArrayList while a listener unsubscribes is a ConcurrentModificationException waiting to happen. CopyOnWriteArrayList snapshots the list for each publish so a subscriber can leave mid-broadcast. PropertyChangeSupport is the other production shape: named properties, old/new values, and a bus you do not write yourself.',
      vi: 'Duyệt ArrayList trong lúc một listener unsubscribe là ConcurrentModificationException đang chờ. CopyOnWriteArrayList chụp snapshot list cho mỗi lần publish, nên subscriber có thể rời giữa chừng. PropertyChangeSupport là hình production kia: property có tên, giá trị cũ/mới, và một bus bạn không phải tự viết.'
    },
    tradeoffs: {
      en: 'CopyOnWriteArrayList makes writes (subscribe/unsubscribe) copy the whole array — cheap when listeners are stable, costly when they churn. PropertyChangeSupport adds event objects and property names, which is more ceremony than update(String). Use the JDK bus when you already live in JavaBeans; use COW when you have a simple callback list that must be thread-safe.',
      vi: 'CopyOnWriteArrayList khiến mỗi lần ghi (subscribe/unsubscribe) copy cả mảng — rẻ khi listener ổn định, đắt khi chúng vào ra liên tục. PropertyChangeSupport thêm event object và tên property, nghi thức hơn update(String). Dùng bus JDK khi bạn đã sống trong JavaBeans; dùng COW khi bạn có list callback đơn giản cần thread-safe.'
    },
    javaCode: `import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.util.concurrent.CopyOnWriteArrayList;

interface Subscriber { void update(String news); }

// Thread-safe fan-out: publish iterates a snapshot, so unsubscribe mid-loop is safe.
final class NewsChannel {
    private final CopyOnWriteArrayList<Subscriber> subs = new CopyOnWriteArrayList<>();
    public void subscribe(Subscriber s) { subs.add(s); }
    public void publish(String headline) {
        for (Subscriber s : subs) s.update(headline);
    }
}

// Named properties, old/new values — the JavaBeans observer.
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
  }
};
