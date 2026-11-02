# Danh Mục Các Nguồn Git Skill Cho Motion & Animation

Tài liệu này tổng hợp đầy đủ các nguồn Git Animation / Motion dành cho dự án **Design Patterns, Visually** (`design-pattern-with-motion`), bao gồm 2 nguồn bạn đã cung cấp và các nguồn bổ trợ tối ưu nhất cho hệ sinh thái Next.js 14, React 18, GSAP và Tailwind CSS.

---

## 1. Nguồn Git Đã Có (User Provided)

| Thư viện | Git Repository | Mục đích & Ứng dụng trong dự án |
| :--- | :--- | :--- |
| **Anime.js** | `https://github.com/juliangarnier/anime.git` | JavaScript animation engine cực nhẹ. Dùng cho: tính toán đường đi SVG phức tạp, morphing shape (Adapter, Decorator), animating tokens chạy theo đường cong, tweening số học và timeline độc lập. |
| **Animate.css** | `https://github.com/animate-css/animate.css.git` | Thư viện CSS keyframe animation cross-browser kinh điển. Dùng cho: attention seekers (pulse, bounce, flash khi kích hoạt bước minh họa), badge trạng thái, card entry và hiệu ứng CSS thuần GPU-accelerated. |

---

## 2. Các Nguồn Git Bổ Trợ Được Tìm Thêm & Thiết Lập (Curated Additions)

Dựa trên cấu trúc kiến trúc của repo (`ARCHITECTURE.md`, `package.json`, `components/illustrations/`), các nguồn sau đây đã được tuyển chọn để tạo thành bộ công cụ chuyển động hoàn chỉnh:

| Thư viện | Git Repository | Vai trò kiến trúc |
| :--- | :--- | :--- |
| **GSAP (GreenSock)** | `https://github.com/greensock/GSAP.git` | **Lõi chuyển động chính của dự án**. Đã tích hợp sẵn (`gsap 3.12.5`). Quản lý toàn bộ 23 timeline SVG step-by-step (`useSceneTimeline`), đồng bộ highlight code Java, tua lại/dừng/seek theo nhãn `step-N`. |
| **Motion (Framer Motion)** | `https://github.com/motiondivision/motion.git` | **Chuyển động UI & Layout React**. Đã tích hợp sẵn (`framer-motion 11.11.1`). Quản lý chuyển trang (`RouteTransition`), chuyển tab mượt mà với `layoutId`, hiệu ứng hover/tap đàn hồi (Spring physics). |
| **Tailwind CSS Animate** | `https://github.com/jamiebuilds/tailwindcss-animate.git` | Cầu nối hoàn hảo mang các lớp keyframe của Animate.css vào trực tiếp class Tailwind (`animate-in`, `fade-in`, `slide-in-from-bottom`), ăn khớp với token `app/globals.css`. |
| **Tailwind Motion** | `https://github.com/romboHQ/tailwind-motion.git` | Engine animation thế hệ mới cho Tailwind, hỗ trợ syntax composable phong phú và tối ưu hiệu năng không cần JS runtime. |
| **Rough.js** | `https://github.com/rough-stuff/rough.git` | Thư viện vẽ đồ họa phác thảo (hand-drawn / sketchy blueprint), cực kỳ phù hợp với phong cách kiến trúc blueprint của website khi vẽ sơ đồ mẫu thiết kế. |
| **React Spring** | `https://github.com/pmndrs/react-spring.git` | Engine mô phỏng vật lý lò xo (spring-physics) cho React, thích hợp cho các mô phỏng tương tác kéo thả trong `/playground`. |
| **Lottie Web** | `https://github.com/airbnb/lottie-web.git` | Trình phát hoạt họa vector chất lượng cao từ Adobe After Effects / Bodymovin, hữu ích khi import các animation phức tạp có sẵn. |
| **Lucide Icons** | `https://github.com/lucide-icons/lucide.git` | Đã có sẵn trong dự án (`lucide-react 0.453.0`), cung cấp các icon và trạng thái quay/nhấp nháy cho thanh điều hướng và nút thao tác. |

---

## 3. Cấu Trúc Các Bộ `.skills` Đã Thiết Lập

Hệ thống skill được tổ chức theo chuẩn **Antigravity Customization System** tại `.agents/skills/` và đồng bộ tại `.skills/`:

```text
.agents/
├── skills.json                           # Khai báo cấu hình phát hiện skill
├── rules/
│   └── motion-guidelines.md              # Quy chuẩn phân chia nhiệm vụ các thư viện motion
└── skills/                               # Các bộ skill chuyên biệt
    ├── animejs/                          # Kỹ năng Anime.js
    │   ├── SKILL.md                      # Hướng dẫn chính + frontmatter
    │   ├── references/api-cheatsheet.md  # Sổ tay API chi tiết
    │   └── examples/                     # Code mẫu React + SVG Morph
    ├── animate-css/                      # Kỹ năng Animate.css & CSS Keyframes
    │   ├── SKILL.md
    │   ├── references/animation-classes.md
    │   └── examples/
    ├── gsap-choreography/                # Kỹ năng GSAP Illustration Scenes (Lõi của repo)
    │   ├── SKILL.md
    │   ├── references/scene-timeline-guide.md
    │   └── examples/
    ├── framer-motion/                    # Kỹ năng Framer Motion (Route & Layout React)
    │   ├── SKILL.md
    │   ├── references/motion-patterns.md
    │   └── examples/
    ├── tailwind-motion/                  # Kỹ năng Tailwind Animation & Token Palette
    │   ├── SKILL.md
    │   ├── references/tailwind-animation-tokens.md
    │   └── examples/
    ├── canvas-simulation/                # Kỹ năng Canvas 60FPS (/playground)
    │   ├── SKILL.md
    │   ├── references/canvas-loop-guide.md
    │   └── examples/
    └── svg-diagram-motion/               # Kỹ năng Chuẩn Hóa Sơ Đồ Kiến Trúc SVG
        ├── SKILL.md
        ├── references/diagram-conventions.md
        └── examples/
```

Thư mục `.skills/` ở thư mục gốc cũng được nhân bản đầy đủ tương ứng để tương thích với mọi công cụ.

---

## 4. Cách Sử Dụng Bộ Kỹ Năng

Khi bạn làm việc với trợ lý AI hoặc phát triển mã nguồn:
1. **Minh họa sơ đồ mẫu thiết kế mới**: Kích hoạt `gsap-choreography` hoặc `svg-diagram-motion`.
2. **Tạo hiệu ứng chuyển trang, tab hoặc popup**: Kích hoạt `framer-motion`.
3. **Làm hiệu ứng biến đổi hình dạng (shape morph) hoặc di chuyển theo đường cong vector**: Kích hoạt `animejs`.
4. **Tạo badge nhấp nháy, rung lắc báo hiệu khi bước chạy qua**: Kích hoạt `animate-css` hoặc `tailwind-motion`.
5. **Phát triển mô phỏng tương tác cho `/playground`**: Kích hoạt `canvas-simulation`.

---

## 5. Script Tải Nhanh Mã Nguồn Tham Khảo (Offline Sources)

Nếu muốn clone toàn bộ mã nguồn của các repo tham khảo về máy để đọc offline:
- PowerShell: `.\scripts\clone-skill-sources.ps1`
- Bash: `./scripts/clone-skill-sources.sh`
