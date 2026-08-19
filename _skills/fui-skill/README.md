# FUI Skill

> Agent Skill hỗ trợ AI phát triển web module theo kiến trúc metadata-driven của FUI — nơi giao diện và logic được định nghĩa hoàn toàn bằng JSON.

## ✨ Tổng quan

**FUI Skill** cung cấp cho AI agent các hướng dẫn và công cụ để xây dựng FUI web module, bao gồm:

- 📐 **Kiến trúc metadata-driven** — Giao diện và logic định nghĩa trong `module.json`
- 🧱 **Hệ thống grid bắt buộc** — Cấu trúc container > rows > cols nhất quán
- ⚡ **Action Protocol** — Gọi API, điều kiện, callback theo cách khai báo
- 🧩 **Template có sẵn** — Form, CRUD table, dialog, Vue component
- 🔍 **Đảm bảo chất lượng** — Review code và phân tích edge-case tích hợp
- 🛠️ **Công cụ module** — Lưu và publish module/component qua script

## 📦 Cài đặt

```bash
npx skills add fui-labs/fui-skill
```

## 📁 Cấu trúc thư mục

```
fui-skill/
├── SKILL.md              # VĂN BẢN CHÍNH SÁCH: Session Start Protocol, quy tắc cứng,
│                         #   cổng quyết định, chuỗi publish. KHÔNG dạy cách làm.
├── metadata.json         # Manifest (documentation-only)
├── examples/             # Template mẫu (module/f-table/project-patterns.json + component.vue)
├── references/           # 44 file tài liệu chi tiết (load theo nhu cầu)
│   ├── INDEX.md              # ROUTER: tình huống/component → file cần load (Tier A)
│   ├── controls-patterns.md  # Value resolution, action engine, layout grid, control object (Tier A)
│   ├── module-structure.md   # Cấu trúc file module/project (Tier A)
│   ├── design-modes.md       # App-mode vs Web-mode, {projectId}/DESIGN.md, giới hạn border-radius
│   ├── controls-styling-vocabulary.md  # Bộ class/prop/style được duyệt
│   ├── script-map.md         # Bản đồ script + thư viện đã bundled (đừng thêm CDN trùng)
│   ├── ui-patterns.md        # UI core (+ ui-table-cell / ui-dialog / ui-crosswindow / ui-layout)
│   ├── components-echart.md  # f-echart (+ echart-templates.md)
│   ├── tapi-reference.md     # tAPI core (+ tapi-permission-patterns / tapi-file-api)
│   ├── permission-system.md  # Phân quyền: SystemRight vs FunctionRight, 4 tool quản lý định nghĩa quyền
│   ├── db-workflow.md        # Kết nối DB/SP (+ db-table-design.md)
│   ├── system-design.md      # Thiết kế app nhiều module
│   └── ...                   # component-*, verification, tools-registry, ...
└── scripts/              # Mã nguồn runtime (component.js, componentTable.js, defaultfunction.js, fastproject.js)
```

> Bản đồ đầy đủ tình huống → file: xem [references/INDEX.md](references/INDEX.md).

**Nguyên tắc biên tập — canonical owner:** mỗi sự thật chỉ được viết đầy đủ ở **đúng một file**; nơi
khác chỉ để link. Mỗi reference mở đầu bằng một dòng `> File này sở hữu: X. Về Y xem <file>.md.` —
đọc dòng đó để biết nội dung mới thuộc về đâu, đừng viết lại vào `SKILL.md`.

## 🚀 Bắt đầu nhanh

Sau khi cài đặt, agent sẽ tự động sử dụng skill này khi bạn yêu cầu **tạo, chỉnh sửa hoặc review FUI module**.

### Tạo module mới

> *"Tạo module `user-management` có bảng dữ liệu và dialog thêm/sửa."*

Agent sẽ:
1. Tạo thư mục module với `module.json`, `_info.json`, `script.js`
2. Áp dụng hệ thống grid layout bắt buộc
3. Sử dụng Action Protocol để tích hợp API
4. Tuân theo coding standards và best practices

### Các khái niệm chính

| Khái niệm | Mô tả |
|:---|:---|
| **module.json** | File chính định nghĩa `data`, `watch`, `controls`, và `set` |
| **Action Protocol** | Khai báo action bằng `API`, `IN`, `OUT`, `CALL`, `IF/THEN/ELSE` |
| **Grid System** | Cấu trúc bắt buộc `container > rows > cols` cho mọi layout |
| **Control Object** | Phần tử UI được định nghĩa bởi `el`, `attr`, `w`, `col`, `innerHTML` |

### Ví dụ — Lấy dữ liệu bằng Action

```json
{
  "fetchUsers": {
    "API": "/api/users",
    "IN": { "GroupID": "vueData.selectedGroup" },
    "OUT": "userList",
    "CALLBACK": { "MESS": "Tải thành công!" }
  }
}
```

## 📚 Tài liệu tham khảo

| Tài liệu | Mô tả |
|:---|:---|
| [INDEX.md](references/INDEX.md) | **Router** — tình huống/component → file cần load |
| [controls-patterns.md](references/controls-patterns.md) | Action engine, value resolution, layout grid |
| [module-structure.md](references/module-structure.md) | Cấu trúc file module/project |
| [ui-patterns.md](references/ui-patterns.md) | UI core (data/watch/toolbar) + các file ui-* tách theo tình huống |
| [tapi-reference.md](references/tapi-reference.md) | tAPI SP naming, params, response + permission/file-api |
| [permission-system.md](references/permission-system.md) | Phân quyền: SystemRight (cấp bậc) vs FunctionRight (theo chức năng), 4 tool quản lý định nghĩa quyền |
| [system-design.md](references/system-design.md) | Thiết kế app nhiều module từ mô tả |
| [verification.md](references/verification.md) | Review code & checklist definition-of-done |

## 🤝 Đóng góp

Skill này là **tài liệu sống**, liên tục được cập nhật. Sau khi hoàn thành các task phức tạp, agent sẽ hỏi:

> *"Có bài học, pattern hoặc chỉnh sửa nào từ task này cần bổ sung vào FUI skill không?"*

Phản hồi sẽ được tích hợp bằng cách cập nhật hướng dẫn, thêm tài liệu mới, hoặc loại bỏ thông tin lỗi thời — đảm bảo skill luôn phản ánh best practices mới nhất.

## 📄 Giấy phép

MIT
