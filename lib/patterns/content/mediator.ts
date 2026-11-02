import type { Pattern } from '../types';

export const mediator: Pattern = {
  id: 'mediator',
  category: 'behavioral',
  name: 'Mediator',
  tagline: {
    en: 'Have objects talk through a central hub instead of talking to each other directly.',
    vi: 'Để các object nói chuyện qua một hub trung tâm, thay vì nói trực tiếp với nhau.'
  },
  analogy: {
    en: 'An air traffic control tower. Pilots don’t radio each other to coordinate — they all talk to the tower, and the tower sorts it out. Without the tower, every plane would need to know about every other plane (chaos). With it, planes only know the tower (one channel).',
    vi: 'Đài không lưu. Phi công không bộ đàm với nhau để phối hợp — tất cả nói với đài, đài sắp xếp. Không có đài, mỗi máy bay phải biết mọi máy bay khác (hỗn loạn). Có đài, máy bay chỉ biết đài (một kênh).'
  },
  whenToUse: [
    {
      en: 'A set of objects communicate in complex, tangled ways and the wiring is hard to follow.',
      vi: 'Một nhóm object giao tiếp rối và dây nối khó lần.'
    },
    {
      en: 'Reusing an object is hard because it depends on too many other objects.',
      vi: 'Tái dùng một object thì khó vì nó phụ thuộc quá nhiều object khác.'
    },
    {
      en: 'You want to centralize a protocol that would otherwise be spread across many classes.',
      vi: 'Bạn muốn gom một protocol vốn sẽ bị rải trên nhiều class.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The objects barely interact — adding a mediator adds a layer for no reason.',
      vi: 'Các object hầu như không tương tác — thêm mediator chỉ thêm một tầng vô cớ.'
    },
    {
      en: 'The mediator itself is becoming a god object that knows everything. Split it up instead.',
      vi: 'Chính mediator đang thành god object biết mọi thứ. Hãy tách nó ra.'
    }
  ],
  difficulty: 2,
  order: 17,
  javaCode: `// The mediator: a chatroom that everyone talks through.
final class ChatRoom {
    private final java.util.Map<String, java.util.List<String>> inbox = new java.util.HashMap<>();
    public void send(String from, String to, String msg) {
        inbox.computeIfAbsent(to, k -> new java.util.ArrayList<>())
             .add(from + ": " + msg);
    }
    public java.util.List<String> messagesFor(String user) {
        return inbox.getOrDefault(user, java.util.List.of());
    }
}

// Participants: they only know the chatroom, not each other.
final class User {
    private final String name;
    private final ChatRoom room;
    User(String name, ChatRoom room) { this.name = name; this.room = room; }
    public void sendTo(String to, String msg) { room.send(name, to, msg); }
    public java.util.List<String> inbox()     { return room.messagesFor(name); }
}

// alice.sendTo("bob", "hi");
// bob.inbox();  -> ["alice: hi"]
// Adding more users doesn't add new wires — they all go through the room.`,
  steps: [
    {
      title: {
        en: 'The hub owns the conversation protocol',
        vi: 'Hub sở hữu protocol trò chuyện'
      },
      body: {
        en: 'ChatRoom.send(from, to, msg) is the only place that knows how a message travels: it appends to the recipient’s inbox. Participants will call this method; they will not keep pointers to each other. The tower, not the planes, holds the map.',
        vi: 'ChatRoom.send(from, to, msg) là chỗ duy nhất biết tin nhắn đi thế nào: nó append vào inbox người nhận. Participant sẽ gọi method này; họ không giữ pointer tới nhau. Đài, không phải máy bay, giữ tấm bản đồ.'
      }
    },
    {
      title: {
        en: 'Participants know the room, not each other',
        vi: 'Participant biết phòng, không biết nhau'
      },
      body: {
        en: 'User stores a name and a ChatRoom. That is the entire social graph from the user’s point of view. Adding a third person does not add a field on User — they construct another User with the same room. Reuse stays easy because User does not depend on other User instances.',
        vi: 'User giữ name và một ChatRoom. Đó là toàn bộ đồ thị xã hội theo góc nhìn của user. Thêm người thứ ba không thêm field trên User — họ new thêm một User với cùng room. Tái dùng vẫn dễ vì User không phụ thuộc User khác.'
      }
    },
    {
      title: {
        en: 'Every message is routed through the room',
        vi: 'Mọi tin nhắn đều đi qua phòng'
      },
      body: {
        en: 'sendTo calls the highlighted room.send(name, to, msg). Alice never holds Bob; the room looks up Bob’s inbox. If you later add logging, blocking, or rooms-within-rooms, those rules land in ChatRoom, not in a web of user-to-user calls.',
        vi: 'sendTo gọi dòng room.send(name, to, msg) được highlight. Alice không cầm Bob; phòng tự tìm inbox của Bob. Sau này thêm log, chặn tin, hoặc phòng trong phòng, các luật đó vào ChatRoom, không vào mạng lời gọi user-tới-user.'
      }
    }
  ],
  realSystems: [
    {
      system: 'javax.swing.ButtonGroup',
      note: {
        en: 'ButtonGroup is a mediator for JRadioButton: each button talks to the group, and the group guarantees only one selection. Buttons do not point at their siblings.',
        vi: 'ButtonGroup là mediator cho JRadioButton: mỗi nút nói với group, group đảm bảo chỉ một lựa chọn. Các nút không trỏ tới anh em của chúng.'
      }
    },
    {
      system: 'java.awt.CardLayout',
      note: {
        en: 'CardLayout mediates which child of a Container is visible. The buttons that flip cards talk to the layout (or to a small controller that does), not to every sibling panel.',
        vi: 'CardLayout điều phối child nào của Container được hiện. Nút lật card nói với layout (hoặc một controller nhỏ), không nói với mọi panel anh em.'
      }
    }
  ]
};
