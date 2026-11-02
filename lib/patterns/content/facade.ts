import type { Pattern } from '../types';

export const facade: Pattern = {
  id: 'facade',
  category: 'structural',
  name: 'Facade',
  tagline: {
    en: 'Provide one simple entry point to a complicated subsystem so most callers don’t need to learn it all.',
    vi: 'Đưa ra một cửa vào đơn giản cho một subsystem rối, để hầu hết caller không phải học hết.'
  },
  analogy: {
    en: 'A hotel concierge. You say “I want to see Rome today.” Behind the scenes, they call a taxi, book a guide, reserve lunch, and line up tickets. You don’t talk to each of those services directly — the concierge is the facade. The pattern is the same: one friendly front door to a mess of moving parts.',
    vi: 'Lễ tân khách sạn. Bạn nói “hôm nay tôi muốn đi xem Rome.” Sau cánh gà họ gọi taxi, đặt hướng dẫn viên, giữ chỗ ăn trưa và xếp vé. Bạn không nói chuyện trực tiếp với từng dịch vụ — lễ tân chính là facade. Pattern cũng vậy: một cửa trước thân thiện dẫn vào đống chi tiết chuyển động.'
  },
  whenToUse: [
    {
      en: 'A subsystem is genuinely complex and most clients only need a small slice of it.',
      vi: 'Một subsystem thật sự phức tạp và hầu hết client chỉ cần một lát mỏng của nó.'
    },
    {
      en: 'You want to decouple clients from many internal classes so refactoring the internals is safe.',
      vi: 'Bạn muốn tách client khỏi nhiều class nội bộ để refactor bên trong vẫn an toàn.'
    },
    {
      en: 'You want to layer your code: outer layers depend on a clean facade, not on inner mechanics.',
      vi: 'Bạn muốn chia tầng: tầng ngoài phụ thuộc facade sạch, không phụ thuộc cơ chế bên trong.'
    }
  ],
  whenNotToUse: [
    {
      en: 'The subsystem is already simple — adding a facade is just a wrapper that hides nothing useful.',
      vi: 'Subsystem đã đơn giản — thêm facade chỉ là wrapper chẳng giấu gì hữu ích.'
    },
    {
      en: 'Clients genuinely need fine-grained control over the internals.',
      vi: 'Client thật sự cần kiểm soát mịn các chi tiết bên trong.'
    }
  ],
  difficulty: 1,
  order: 10,
  javaCode: `// The complex subsystem: many classes with specific jobs.
final class VideoFile   { VideoFile(String n) {} }
final class CodecFactory { VideoFile decode(VideoFile f) { return f; } }
final class AudioMixer  { void mix(VideoFile f) { System.out.println("audio mixed"); } }
final class BitrateReader { VideoFile read(String path) { return new VideoFile(path); } }

// The facade: one simple API that orchestrates everything.
final class VideoConverter {
    public VideoFile convert(String filename, String format) {
        // Behind the scenes, lots of steps, all hidden from the caller.
        VideoFile raw       = new BitrateReader().read(filename);
        VideoFile decoded   = new CodecFactory().decode(raw);
        new AudioMixer().mix(decoded);
        System.out.println("converted to " + format);
        return decoded;
    }
}

// Client code: one line.
//   new VideoConverter().convert("intro.avi", "mp4");
// No need to learn about CodecFactory, AudioMixer, BitrateReader.`,
  steps: [
    {
      title: {
        en: 'The subsystem is several classes with narrow jobs',
        vi: 'Subsystem là vài class với việc hẹp'
      },
      body: {
        en: 'BitrateReader, CodecFactory, and AudioMixer each know one step of a conversion. Together they are the subsystem — useful, but a caller who only wants “give me an mp4” should not have to construct and sequence all three. CodecFactory is one of those inner rooms.',
        vi: 'BitrateReader, CodecFactory và AudioMixer mỗi class biết một bước chuyển đổi. Cả ba là subsystem — hữu ích, nhưng caller chỉ muốn “cho tôi file mp4” không nên phải tự new và sắp thứ tự cả ba. CodecFactory là một trong những phòng bên trong đó.'
      }
    },
    {
      title: {
        en: 'The facade offers one method that orchestrates them',
        vi: 'Facade đưa một method điều phối tất cả'
      },
      body: {
        en: 'VideoConverter.convert(filename, format) is the front door. Inside, it constructs a BitrateReader, a CodecFactory, and an AudioMixer, then runs read → decode → mix in the right order. The facade owns that choreography so clients do not.',
        vi: 'VideoConverter.convert(filename, format) là cửa trước. Bên trong, nó tạo BitrateReader, CodecFactory và AudioMixer, rồi chạy read → decode → mix đúng thứ tự. Facade giữ bản dàn dựng đó, client thì không.'
      }
    },
    {
      title: {
        en: 'The client speaks one sentence',
        vi: 'Client chỉ nói một câu'
      },
      body: {
        en: 'The highlighted “converted to” line is what the caller waits for: one convert() call, one result. Nothing in client code names CodecFactory or AudioMixer. Those classes can be rewritten as long as VideoConverter keeps the same signature.',
        vi: 'Dòng “converted to” được highlight là điều caller chờ: một lời gọi convert(), một kết quả. Không chỗ nào trong code client gọi tên CodecFactory hay AudioMixer. Những class đó có thể viết lại miễn VideoConverter giữ nguyên chữ ký.'
      }
    }
  ],
  realSystems: [
    {
      system: 'java.nio.file.Files',
      note: {
        en: 'Files is a facade over Path, FileSystem, and the provider SPI. readAllBytes, copy, and walk hide channel setup, provider lookup, and option flags behind a handful of static methods.',
        vi: 'Files là facade phủ lên Path, FileSystem và SPI của provider. readAllBytes, copy và walk giấu việc mở channel, tìm provider và các option sau vài method static.'
      }
    },
    {
      system: 'java.awt.Desktop',
      note: {
        en: 'Desktop.getDesktop() is a facade for “open this file / browse this URI / mail this address.” The real work is per-OS process launch; application code never talks to those launchers.',
        vi: 'Desktop.getDesktop() là facade cho “mở file này / mở URI này / soạn mail này.” Việc thật là launch process theo từng OS; code ứng dụng không nói chuyện với các launcher đó.'
      }
    },
    {
      system: 'SLF4J — org.slf4j.LoggerFactory',
      note: {
        en: 'SLF4J is a logging facade: your code depends on Logger and LoggerFactory, while Logback, Log4j, or JUL sits behind the binding. Swapping the backend does not rewrite call sites.',
        vi: 'SLF4J là facade cho logging: code của bạn phụ thuộc Logger và LoggerFactory, còn Logback, Log4j hoặc JUL nằm sau binding. Đổi backend không phải viết lại chỗ gọi.'
      }
    }
  ]
};
