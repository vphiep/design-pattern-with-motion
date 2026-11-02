import type { Locale } from './types';
import type { PatternCategory } from '../patterns/types';

/**
 * Every piece of UI chrome on the site, per locale.
 * Adding a language = adding one `UIStrings` object below (plus extending
 * `Locale` in ./types.ts). Components never hardcode copy.
 */
export interface UIStrings {
  nav: {
    index: string;
    patterns: string;
    playground: string;
    homeAria: string;
    openMenu: string;
    closeMenu: string;
    switchToLight: string;
    switchToDark: string;
    localeSwitcher: string;
  };
  /** Short category names, shared by nav, cards, footer. */
  categories: Record<PatternCategory, string>;
  progress: {
    explored: (count: number, total: number) => string;
  };
  footer: {
    tagline: string;
    indexHeading: string;
    allPatterns: string;
    colophonHeading: string;
    setInPrefix: string;
    codeIn: string;
    motionBy: string;
    edition: string;
    copyright: string;
    version: string;
  };
  home: {
    vol: string;
    kicker: string;
    lede: string;
    browseAll: string;
    openPlayground: string;
    explored: string;
    markedSeen: string;
    stations: { n: string; t: string; d: string }[];
    atlasKicker: string;
    atlasTitle: string;
    atlasLede: string;
    overview: string;
  };
  catalog: {
    kicker: string;
    titleLead: string;
    titleItalic: string;
    lede: string;
  };
  categoryPage: {
    sectionKicker: string;
    /** h1 = `${title} <i>${italic}</i>` — split so each locale can order words naturally. */
    meta: Record<
      PatternCategory,
      { title: string; italic: string; blurb: string; motif: string; how: string }
    >;
    inSection: string;
    allPatternsLink: string;
    playgroundLink: string;
  };
  pattern: {
    backTo: (categoryLabel: string) => string;
    difficulty: readonly [string, string, string];
    seen: string;
    readTime: (minutes: number) => string;
    atAGlance: string;
    categoryLabel: string;
    difficultyLabel: string;
    orderLabel: string;
    howItWorks: string;
    walkthroughHint: string;
    lines: (from: number, to: number) => string;
    inPlainEnglish: string;
    analogy: string;
    useWhen: string;
    skipWhen: string;
    realSystemsKicker: string;
    realSystems: string;
    realSystemsLede: string;
    inCode: string;
    javaExample: string;
    hoverHint: string;
    standard: string;
    advanced: string;
    codeVariantAria: string;
    whatMakesItAdvanced: string;
    tradeoffs: string;
    advancedNote: string;
    previous: string;
    next: string;
  };
  card: {
    visited: string;
    advancedBadge: string;
    difficultyAria: (d: number) => string;
  };
  playground: {
    kicker: string;
    titleLead: string;
    titleItalic: string;
    lede: string;
    simTag: string;
    blurbs: Record<'observer' | 'decorator' | 'factory-method' | 'strategy', string>;
    observer: {
      publish: string;
      addObserver: string;
      removeLast: string;
      dragHint: string;
      eventLog: string;
      noPublishes: string;
    };
    decorator: {
      wrap: (layer: string) => string;
      unwrap: (layer: string) => string;
      outermostHint: string;
    };
    factory: {
      request: (creator: string) => string;
      clear: string;
    };
    strategy: {
      qty: string;
    };
  };
  notFound: {
    kicker: string;
    titleLead: string;
    titleItalic: string;
    copy: string;
    backToIndex: string;
    browse: string;
  };
  codeBlock: {
    copy: string;
    copied: string;
    copyAria: string;
  };
  illustration: {
    stageAria: (patternName: string) => string;
    mechanismFallback: (patternName: string) => string;
    replay: string;
    pause: string;
    play: string;
  };
  search: {
    placeholder: string;
    buttonLabel: string;
    noResults: string;
    quickLinks: string;
    patterns: string;
    escHint: string;
    navigateHint: string;
    selectHint: string;
  };
  stepShare: {
    copyLink: string;
    copied: string;
    stepTitle: (step: number) => string;
  };
}

const en: UIStrings = {
  nav: {
    index: 'Index',
    patterns: 'Patterns',
    playground: 'Playground',
    homeAria: 'Design Patterns, Visually — home',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    localeSwitcher: 'Language'
  },
  categories: {
    creational: 'Creational',
    structural: 'Structural',
    behavioral: 'Behavioral'
  },
  progress: {
    explored: (count, total) => `${count} of ${total} patterns explored`
  },
  footer: {
    tagline:
      'A motion-first study guide to the 23 Gang-of-Four patterns. Real Java code, animated illustrations, zero marketing fluff. A reading room for engineers who like their diagrams to move.',
    indexHeading: 'Index',
    allPatterns: 'All patterns',
    colophonHeading: 'Colophon',
    setInPrefix: 'Set in',
    codeIn: 'Code in JetBrains Mono',
    motionBy: 'Motion by GSAP & Framer',
    edition: 'Edition · vol. 01 · 2026',
    copyright: '© Design Patterns / Visually',
    version: 'v1.0 — twenty-three scenes'
  },
  home: {
    vol: 'Vol. 01',
    kicker: 'A motion-first field guide',
    lede: 'UML sits still. Running systems do not. Twenty-three Gang-of-Four patterns drawn as moving mechanisms — with real Java, and a sentence a beginner can keep.',
    browseAll: 'Browse all 23 patterns',
    openPlayground: 'Open the playground',
    explored: 'Explored',
    markedSeen: 'patterns marked seen',
    stations: [
      { n: '01', t: 'Create', d: 'How an object is born — without callers knowing the recipe.' },
      { n: '02', t: 'Assemble', d: 'How pieces snap together and stay swappable.' },
      { n: '03', t: 'Communicate', d: 'Who talks to whom, and who is allowed to know.' }
    ],
    atlasKicker: 'The atlas',
    atlasTitle: 'All twenty-three, in one map',
    atlasLede:
      'Hover a cell for a looping sketch of the mechanism. Click through when you want the full scene, the analogy, and the Java.',
    overview: 'overview →'
  },
  catalog: {
    kicker: 'The catalog',
    titleLead: 'All',
    titleItalic: '23 patterns',
    lede: 'Ordered by suggested learning sequence. Creational first — they’re about how objects come into being. Then structural — how they’re assembled. Then behavioral — how they collaborate.'
  },
  categoryPage: {
    sectionKicker: 'Section',
    meta: {
      creational: {
        title: 'Creational',
        italic: 'patterns',
        blurb:
          'Patterns that take the work of constructing objects off your hands. They hide the messy details of “how” so the rest of your code only has to say “what”.',
        motif: 'A press, a stamp, a kit. Objects are born off-stage.',
        how: 'Read these as birth stories: who is allowed to call new, and who is not.'
      },
      structural: {
        title: 'Structural',
        italic: 'patterns',
        blurb:
          'Patterns that compose objects and classes into larger structures while keeping each part flexible and independent. Like careful load-bearing architecture, but for code.',
        motif: 'Beams, sleeves, nested frames. Shape without welding.',
        how: 'Read these as joinery: how two pieces meet without becoming one piece.'
      },
      behavioral: {
        title: 'Behavioral',
        italic: 'patterns',
        blurb:
          'Patterns about responsibility and communication: who knows what, who tells whom, and how work flows through your system without tangling it up.',
        motif: 'Signals, tickets, towers. Conversation with rules.',
        how: 'Read these as protocols: who speaks, who listens, who is allowed to change.'
      }
    },
    inSection: 'In this section',
    allPatternsLink: '← all patterns',
    playgroundLink: 'playground →'
  },
  pattern: {
    backTo: (categoryLabel) => `${categoryLabel} patterns`,
    difficulty: ['beginner', 'intermediate', 'advanced'],
    seen: 'seen',
    readTime: (minutes) => `~ ${minutes} min read`,
    atAGlance: 'At a glance',
    categoryLabel: 'Category',
    difficultyLabel: 'Difficulty',
    orderLabel: 'Order',
    howItWorks: 'How it works',
    walkthroughHint:
      'Follow the numbers — the same order the illustration animates, and the code highlights.',
    lines: (from, to) => (from === to ? `line ${from}` : `lines ${from}–${to}`),
    inPlainEnglish: 'In plain English',
    analogy: 'Analogy',
    useWhen: 'Use it when',
    skipWhen: 'Skip it when',
    realSystemsKicker: 'Beyond the textbook',
    realSystems: 'Used in real systems',
    realSystemsLede: 'Verified places where this exact shape ships in production.',
    inCode: 'In code · linked to the scene',
    javaExample: 'Java example',
    hoverHint:
      'Hover a step chip above, or a highlighted line, to pin the matching part of the illustration.',
    standard: 'Standard',
    advanced: 'Advanced',
    codeVariantAria: 'Code variant',
    whatMakesItAdvanced: 'What makes it advanced',
    tradeoffs: 'Trade-offs',
    advancedNote: 'Opt-in deep end. The illustration stays keyed to the standard example.',
    previous: 'previous',
    next: 'next'
  },
  card: {
    visited: 'Visited',
    advancedBadge: 'Advanced',
    difficultyAria: (d) => `Difficulty ${d} of 3`
  },
  playground: {
    kicker: 'Hands on',
    titleLead: 'Pattern',
    titleItalic: 'Playground',
    lede: 'Four interactive canvases. Drag, click, and trigger events — the same mechanisms as the pattern pages, but you are the clock.',
    simTag: 'sim',
    blurbs: {
      observer: 'Add listeners, drag them, ping the subject.',
      decorator:
        'Stack wrappers on a base object, then follow render() in through every layer and back out.',
      'factory-method':
        'Pick a Logger subclass and call log(); its createDestination() decides which product gets built.',
      strategy: 'Swap the algorithm and watch the quote change.'
    },
    observer: {
      publish: 'Publish',
      addObserver: 'Add observer',
      removeLast: 'Remove last',
      dragHint: 'drag observers · click publish',
      eventLog: 'event log',
      noPublishes: 'no publishes yet'
    },
    decorator: {
      wrap: (layer) => `Wrap ${layer}`,
      unwrap: (layer) => `Unwrap ${layer}`,
      outermostHint: 'outermost is last wrapped'
    },
    factory: {
      request: (creator) => `log() via ${creator}`,
      clear: 'Clear'
    },
    strategy: {
      qty: 'qty'
    }
  },
  notFound: {
    kicker: '404 · off the map',
    titleLead: 'This page',
    titleItalic: 'doesn’t exist',
    copy: 'The page you were looking for either moved or never existed in the first place. Try the index, or browse the patterns.',
    backToIndex: 'Back to index',
    browse: 'Browse patterns'
  },
  codeBlock: {
    copy: 'Copy',
    copied: 'Copied',
    copyAria: 'Copy code to clipboard'
  },
  illustration: {
    stageAria: (patternName) => `${patternName} animated illustration`,
    mechanismFallback: (patternName) => `${patternName} mechanism`,
    replay: 'Replay',
    pause: 'Pause',
    play: 'Play'
  },
  search: {
    placeholder: 'Search patterns, concepts, APIs (e.g. cache, undo)...',
    buttonLabel: 'Search',
    noResults: 'No patterns found matching',
    quickLinks: 'Navigation',
    patterns: 'Patterns',
    escHint: 'esc to close',
    navigateHint: 'navigate',
    selectHint: 'select'
  },
  stepShare: {
    copyLink: 'Share step',
    copied: 'Link copied!',
    stepTitle: (step) => 'Step ' + step
  }
};

const vi: UIStrings = {
  nav: {
    index: 'Trang chủ',
    patterns: 'Pattern',
    playground: 'Playground',
    homeAria: 'Design Patterns, Visually — trang chủ',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    switchToLight: 'Chuyển sang giao diện sáng',
    switchToDark: 'Chuyển sang giao diện tối',
    localeSwitcher: 'Ngôn ngữ'
  },
  categories: {
    creational: 'Khởi tạo',
    structural: 'Cấu trúc',
    behavioral: 'Hành vi'
  },
  progress: {
    explored: (count, total) => `Đã khám phá ${count}/${total} pattern`
  },
  footer: {
    tagline:
      'Cẩm nang học 23 pattern Gang of Four bằng chuyển động. Code Java thật, minh họa động, không một chữ quảng cáo. Một phòng đọc dành cho những kỹ sư thích sơ đồ của mình biết cử động.',
    indexHeading: 'Mục lục',
    allPatterns: 'Tất cả pattern',
    colophonHeading: 'Ghi chú ấn bản',
    setInPrefix: 'Trình bày bằng',
    codeIn: 'Code hiển thị bằng JetBrains Mono',
    motionBy: 'Chuyển động bởi GSAP & Framer',
    edition: 'Ấn bản · vol. 01 · 2026',
    copyright: '© Design Patterns / Visually',
    version: 'v1.0 — hai mươi ba phân cảnh'
  },
  home: {
    vol: 'Vol. 01',
    kicker: 'Cẩm nang học bằng chuyển động',
    lede: 'UML thì đứng yên, còn hệ thống đang chạy thì không. Hai mươi ba pattern Gang of Four được vẽ thành những cỗ máy chuyển động — kèm code Java thật, và một câu định nghĩa mà người mới cũng nhớ được.',
    browseAll: 'Xem cả 23 pattern',
    openPlayground: 'Mở playground',
    explored: 'Đã khám phá',
    markedSeen: 'pattern đã đánh dấu xem',
    stations: [
      { n: '01', t: 'Khởi tạo', d: 'Cách một object ra đời — mà caller không cần biết công thức.' },
      { n: '02', t: 'Lắp ghép', d: 'Cách các mảnh khớp vào nhau mà vẫn có thể thay rời.' },
      { n: '03', t: 'Giao tiếp', d: 'Ai nói chuyện với ai, và ai được phép biết gì.' }
    ],
    atlasKicker: 'Bản đồ',
    atlasTitle: 'Cả hai mươi ba, trên một tấm bản đồ',
    atlasLede:
      'Rê chuột lên một ô để xem phác thảo cơ chế chạy lặp. Bấm vào khi bạn muốn xem toàn cảnh, phép so sánh đời thường, và code Java.',
    overview: 'tổng quan →'
  },
  catalog: {
    kicker: 'Danh mục',
    titleLead: 'Tất cả',
    titleItalic: '23 pattern',
    lede: 'Sắp xếp theo trình tự học gợi ý. Nhóm khởi tạo trước — nói về cách object ra đời. Rồi đến nhóm cấu trúc — cách chúng được lắp ghép. Cuối cùng là nhóm hành vi — cách chúng phối hợp với nhau.'
  },
  categoryPage: {
    sectionKicker: 'Phần',
    meta: {
      creational: {
        title: 'Các pattern',
        italic: 'khởi tạo',
        blurb:
          'Những pattern gánh giúp bạn phần việc khởi tạo object. Chúng giấu các chi tiết lộn xộn của “làm thế nào” để phần code còn lại chỉ cần nói “cần cái gì”.',
        motif: 'Một máy ép, một con dấu, một bộ kit. Object ra đời sau cánh gà.',
        how: 'Hãy đọc chúng như những câu chuyện chào đời: ai được phép gọi new, ai thì không.'
      },
      structural: {
        title: 'Các pattern',
        italic: 'cấu trúc',
        blurb:
          'Những pattern lắp ghép object và class thành cấu trúc lớn hơn, trong khi vẫn giữ từng phần linh hoạt và độc lập. Như kiến trúc chịu lực cẩn thận, nhưng dành cho code.',
        motif: 'Dầm, ống lồng, khung lồng khung. Tạo hình mà không hàn chết.',
        how: 'Hãy đọc chúng như nghề mộc: hai mảnh gỗ khớp nhau thế nào mà không dính thành một khối.'
      },
      behavioral: {
        title: 'Các pattern',
        italic: 'hành vi',
        blurb:
          'Những pattern về trách nhiệm và giao tiếp: ai biết gì, ai báo cho ai, và công việc chảy qua hệ thống thế nào mà không rối thành mớ.',
        motif: 'Tín hiệu, phiếu lệnh, đài kiểm soát. Cuộc trò chuyện có luật lệ.',
        how: 'Hãy đọc chúng như những giao thức: ai nói, ai nghe, ai được phép thay đổi.'
      }
    },
    inSection: 'Trong phần này',
    allPatternsLink: '← tất cả pattern',
    playgroundLink: 'playground →'
  },
  pattern: {
    backTo: (categoryLabel) => `pattern ${categoryLabel}`,
    difficulty: ['cơ bản', 'trung bình', 'nâng cao'],
    seen: 'đã xem',
    readTime: (minutes) => `~ ${minutes} phút đọc`,
    atAGlance: 'Nhìn nhanh',
    categoryLabel: 'Nhóm',
    difficultyLabel: 'Độ khó',
    orderLabel: 'Thứ tự',
    howItWorks: 'Cách hoạt động',
    walkthroughHint: 'Đi theo số thứ tự — đúng trình tự minh họa chuyển động và code được tô sáng.',
    lines: (from, to) => (from === to ? `dòng ${from}` : `dòng ${from}–${to}`),
    inPlainEnglish: 'Nói cho dễ hiểu',
    analogy: 'So sánh đời thường',
    useWhen: 'Dùng khi',
    skipWhen: 'Đừng dùng khi',
    realSystemsKicker: 'Ngoài giáo trình',
    realSystems: 'Trong hệ thống thực tế',
    realSystemsLede:
      'Những nơi đã được kiểm chứng là đúng hình dáng này đang chạy trong production.',
    inCode: 'Trong code · liên kết với minh họa',
    javaExample: 'Ví dụ Java',
    hoverHint:
      'Rê chuột lên một step chip phía trên, hoặc một dòng code được tô sáng, để ghim phần minh họa tương ứng.',
    standard: 'Cơ bản',
    advanced: 'Nâng cao',
    codeVariantAria: 'Phiên bản code',
    whatMakesItAdvanced: 'Vì sao gọi là nâng cao',
    tradeoffs: 'Đánh đổi',
    advancedNote: 'Phần tự chọn cho người muốn lặn sâu. Minh họa vẫn bám theo ví dụ cơ bản.',
    previous: 'trước',
    next: 'tiếp theo'
  },
  card: {
    visited: 'Đã xem',
    advancedBadge: 'Nâng cao',
    difficultyAria: (d) => `Độ khó ${d}/3`
  },
  playground: {
    kicker: 'Thực hành',
    titleLead: 'Sân chơi',
    titleItalic: 'pattern',
    lede: 'Bốn khung canvas tương tác. Kéo, bấm, và bắn event — cùng những cơ chế như trang pattern, nhưng lần này bạn là người giữ nhịp.',
    simTag: 'sim',
    blurbs: {
      observer: 'Thêm listener, kéo thả chúng, và ping subject.',
      decorator:
        'Chồng các lớp wrapper lên một object gốc, rồi theo dõi render() đi vào qua từng lớp và quay ra.',
      'factory-method':
        'Chọn một subclass của Logger rồi gọi log(); createDestination() của nó quyết định product nào được tạo.',
      strategy: 'Đổi thuật toán và xem báo giá thay đổi.'
    },
    observer: {
      publish: 'Publish',
      addObserver: 'Thêm observer',
      removeLast: 'Xóa cái cuối',
      dragHint: 'kéo observer · bấm publish',
      eventLog: 'nhật ký event',
      noPublishes: 'chưa có lần publish nào'
    },
    decorator: {
      wrap: (layer) => `Bọc ${layer}`,
      unwrap: (layer) => `Gỡ ${layer}`,
      outermostHint: 'lớp bọc sau cùng nằm ngoài cùng'
    },
    factory: {
      request: (creator) => `log() qua ${creator}`,
      clear: 'Xóa hết'
    },
    strategy: {
      qty: 'số lượng'
    }
  },
  notFound: {
    kicker: '404 · ngoài bản đồ',
    titleLead: 'Trang này',
    titleItalic: 'không tồn tại',
    copy: 'Trang bạn tìm hoặc đã chuyển đi, hoặc chưa từng tồn tại. Hãy thử về trang chủ, hoặc xem danh sách pattern.',
    backToIndex: 'Về trang chủ',
    browse: 'Xem các pattern'
  },
  codeBlock: {
    copy: 'Copy',
    copied: 'Đã copy',
    copyAria: 'Copy code vào clipboard'
  },
  illustration: {
    stageAria: (patternName) => `Minh họa chuyển động ${patternName}`,
    mechanismFallback: (patternName) => `Cơ chế ${patternName}`,
    replay: 'Phát lại',
    pause: 'Tạm dừng',
    play: 'Phát'
  },
  search: {
    placeholder: 'Tìm kiếm pattern, khái niệm, API (vd: cache, undo, thông báo)...',
    buttonLabel: 'Tìm kiếm',
    noResults: 'Không tìm thấy pattern nào khớp với',
    quickLinks: 'Điều hướng',
    patterns: 'Mẫu thiết kế',
    escHint: 'esc để đóng',
    navigateHint: 'di chuyển',
    selectHint: 'chọn'
  },
  stepShare: {
    copyLink: 'Chia sẻ bước',
    copied: 'Đã sao chép link!',
    stepTitle: (step) => 'Bước ' + step
  }
};

export const UI: Record<Locale, UIStrings> = { en, vi };
