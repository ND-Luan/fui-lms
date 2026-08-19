# FUI Skill — Reference Router (INDEX)

> File này sở hữu: **bảng định tuyến tình huống / component / từ khóa → file reference cần load**. Không chứa nội dung kỹ thuật — mọi quy tắc đều nằm ở file đích. *(Tier A — luôn nạp cùng `skill_get`.)*

**Bản đồ tra cứu: tình huống / component / từ khóa → file cần load.** Đây là file luôn được nạp cùng `skill_get`. Trước khi xử lý bất kỳ việc gì, tra bảng dưới để biết cần `skill_reference_get({ refs: [...] })` file nào — **đừng dựa vào trí nhớ, hãy load đúng file**.

> Cách dùng: `skill_reference_get({ refs: ["references/<tên-file>.md"] })`. Có thể load nhiều file một lần.

---

## Luôn có sẵn (Tier A — đã nạp cùng skill_get)

| File | Nội dung |
|---|---|
| `controls-patterns.md` | Action engine, value resolution, key notation, layout grid — **nền tảng** |
| `module-structure.md` | Cấu trúc file module/project, layout rules |
| `INDEX.md` | (file này) — bản đồ router |

---

## Hiểu nền tảng / cấu tạo FUI (đọc sớm)

| Tình huống | Load file |
|---|---|
| Cấu tạo FUI, phân cấp Project→Module (import/component/set trộn thế nào), runtime, vueData/v_Set | `platform-architecture.md` |
| 4 thành phần module.json (data/watch/controls/set) — vai trò, cấu hình, tương tác | `module-json-anatomy.md` |

## Thiết kế UI / chọn component

| Tình huống | Load file |
|---|---|
| **Layout controls — class/prop/style ĐƯỢC DÙNG (đừng tự thêm style)** | `controls-styling-vocabulary.md` |
| Bắt đầu thiết kế UI, chọn component nào | `component-quickref.md` |
| Khai báo `data[]` + value resolution (chuỗi/biến/backtick/{{ }}, deep key) | `module-data-patterns.md` |
| Pattern UI thực tế (data/watch/toolbar/filter/permission) | `ui-patterns.md` |
| **f-table** — **hiển thị dữ liệu dạng datatable** (list/CRUD qua form dialog, cả readonly lẫn có `:update-api`) + điều khiển trong ô: t-check/t-button/t-select/t-menu, ctrl-update, show-select, chip-group | `ui-table-cell-patterns.md` |
| Bảng dữ liệu chuyên sâu (mọi props, header types, auto-headers khi bỏ `:headers`, **tổng cột `sum-format`** — object=hàng tổng trong bảng / string=dòng text dưới bảng, readonly table) | `component-table.md` |
| **f-sheet** — **nhập liệu trực tiếp trên bảng kiểu Excel** (sửa ô tại chỗ, dán từ Excel, không qua dialog) — component có sẵn (nền tảng AG Grid), KHÔNG tự viết bảng nhập liệu bằng `uc-*.vue`; import, props, columns, wiring API | `fsheet.md` |
| Dialog / form popup (hidden-container, mở dialog với row, checkbox-list) | `ui-dialog-patterns.md` |
| Mở sub-window & trao đổi dữ liệu (`openWindow`, `#PARENT`/`#Win`) | `ui-crosswindow-patterns.md` |
| Layout: page-container, master-detail, v-switch, date init, dynamic label | `ui-layout-patterns.md` |
| Input controls (f-date, f-time, f-search, f-radiobox, text-field...) | `components-input.md` |
| Display components (f-label, f-title, f-box, f-header, chip, badge...) | `components-display.md` |
| Dialog components (f-dialog, v-dialog chi tiết) | `components-dialog.md` |
| Custom Vue component (`uc-*.vue`) — scope, props/events, **ưu tiên class Vuetify có sẵn (cấm _injectStyle)**, dialog chuẩn hoá, tận dụng ajaxCALL/confirm/showMessage | `component-design.md` |
| **Kiểm chứng `uc-*.vue` trong không gian riêng** (`component_preview`) + luật push component cấp project trước khi render module | `component-design.md` |
| Template/ví dụ tham chiếu nhanh | `ui-templates.md` + `examples/` |
| **User gửi ảnh chụp màn hình giao diện** vào chat, hoặc đọc screenshot từ `renderUI` — đánh giá lỗi hiển thị, màu sắc, padding/margin, căn chỉnh, vị trí nút | `ui-screenshot-review.md` |

## Biểu đồ / báo cáo / dashboard

| Tình huống | Load file |
|---|---|
| Dùng f-echart (nền tảng Apache ECharts) — import, props, config, theme, DataView, lỗi | `components-echart.md` |
| Chọn/vẽ loại chart cụ thể + pattern module.json | `echart-templates.md` |
| Xuất PDF (f-pdfmake) | `pdfmake.md` |

## API / Stored Procedure / tAPI

| Tình huống | Load file |
|---|---|
| Đặt tên SP, params, URL, response format, error, wiring | `tapi-reference.md` |
| Kiểm tra quyền trong SP (5 pattern, `@sys_SystemRight`, `getSystemRight`) | `tapi-permission-patterns.md` |
| Upload/download/xem file qua SP (`spAPIFILE_`, `fileContent`, `tblFileData`) | `tapi-file-api.md` |
| Hàm SQL CLR: httpCall, sendMail, ImageResize, FileReader, RegexMatch... | `sql-clr-functions.md` |

## Phân quyền người dùng

| Tình huống | Load file |
|---|---|
| Khái niệm `SystemRight` (cấp bậc) vs `FunctionRight` (quyền theo chức năng), `v-if`/menu `right`, và 8 tool quản lý định nghĩa quyền (`right_system_list/new/update/delete`, `right_function_list/new/update/delete`) | `permission-system.md` |
| Kiểm tra quyền trong thân SP (5 pattern SQL) | `tapi-permission-patterns.md` |

## Database

| Tình huống | Load file |
|---|---|
| Kết nối DB, dbToken, schema, workflow SP | `db-workflow.md` |
| Quy tắc thiết kế bảng (đặt tên, PK/FK, cột audit) | `db-table-design.md` |

## Quy trình / thiết kế hệ thống

| Tình huống | Load file |
|---|---|
| **Thiết kế cả app nhiều module từ mô tả** (phân rã, schema-first, menu, quyền) | `system-design.md` |
| Tạo một module fullstack (UI + API) — quy trình 6 bước UI-first | `fullstack-workflow.md` |
| Cấu hình project.json: menu, điều hướng, phân quyền, domain | `project-config.md` |

## Scripting / kỹ thuật nâng cao

| Tình huống | Load file |
|---|---|
| Watcher patterns (v_old, deep-watch, cascading) | `watcher-patterns.md` |
| Kỹ thuật nâng cao (EXE, MAP, expression phức tạp) | `advanced-techniques.md` |
| **Trang trắng dù 0 JS error / 0 Vue warn**, hoặc cần đặt logic phức tạp vào `:attr` `:option` `:config` | `advanced-techniques.md` §1 |
| Hàm tiện ích FUI có sẵn (openWindow, ajaxCALL, jsonToExcel, groupBy...) | `default-function.md` |
| **Thư viện đã bundled sẵn** (jQuery, lodash, moment, numeral, toast, jquery-confirm) — biết trước khi định thêm CDN | `script-map.md` §0 |
| Bản đồ script FUI (defaultfunction.js, component.js...) | `script-map.md` |
| FUI project bootstrapper (fastproject) | `fastproject.md` |
| Coding standards | `coding-standards.md` |
| Real-time / SignalR (webSocketJoinGroup, webSocket_Send) | `websocket-realtime.md` |

## Vận hành / publish / deploy

| Tình huống | Load file |
|---|---|
| Mức độ an toàn của từng MCP tool (R/M, Safe/Confirm/Destructive), strict mode, `db_sp_verify`, error log | `tools-registry.md` |
| Checklist definition-of-done trước khi publish (kèm bước `module_validate` + `module_outline` + `module_simulate` + `db_sp_verify` tĩnh) | `verification.md` |
| **UI hỏng mà chưa biết vì sao — chọn tầng kiểm chứng nào cho rẻ nhất** (ma trận triệu chứng → tầng; đọc TRƯỚC khi chạy `renderUI`, và đọc lại khi đã render ≥2 lượt mà chưa khá hơn) | `verification.md` §Chọn tầng kiểm chứng |

---

## Design system

**Hai chế độ tách bạch — xác định TRƯỚC khi viết controls. Chủ sở hữu: `design-modes.md`.**

| Chế độ | Khi nào | Nguồn thẩm mỹ |
|---|---|---|
| **App-mode** (mặc định) | Phần mềm quản lý: CRUD, form, danh sách, dashboard nội bộ | **DUY NHẤT** `design_read("fui")` + `controls-styling-vocabulary.md` — CẤM brand DESIGN.md, CẤM style tự chế |
| **Web-mode** | Landing page / trang giới thiệu / công khai (thường `HTMLOnly: true`) | `design_list` → `design_read("<brand>")` theo tone/ngành; CSS tự do trong header.html |

| Tình huống | Load file |
|---|---|
| Chọn App-mode hay Web-mode, giới hạn `border-radius`, vòng tích luỹ `{projectId}/DESIGN.md` | `design-modes.md` |
| Anatomy dialog/form/bảng màu chuẩn App-mode | tool `design_read("fui")` (không qua `skill_reference_get`) |

- `{projectId}/DESIGN.md` (nếu có) **ghi đè** quy tắc cùng chủ đề của chế độ đang dùng — kiểm tra trước khi thiết kế.
- User góp ý UI → ghi quy tắc vào `{projectId}/DESIGN.md` (vòng tích luỹ — `design-modes.md` §3).
