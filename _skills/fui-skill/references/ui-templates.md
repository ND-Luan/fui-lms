# UI Templates — thư mục `examples/`

> File này sở hữu: **mô tả 4 file mẫu trong `examples/` và cách dùng lại chúng**. Quy tắc viết
> `controls`/action xem [controls-patterns.md](controls-patterns.md); pattern f-table chi tiết xem
> [component-table.md](component-table.md).

`examples/` chứa **file tham chiếu thật** — không phải template rỗng để copy nguyên khối. Đọc để lấy
đúng cú pháp/pattern cho tình huống đang làm, rồi viết lại theo nghiệp vụ thực tế.

## Các file có sẵn

| File | Dùng khi |
|---|---|
| `component.vue` | Custom Vue component mẫu (`uc-*`) — cấu trúc chuẩn `<template>` + `<script>`, không `name:`, không `components:{}`, không `<style>` |
| `module-patterns.json` | **Tham chiếu module hoàn chỉnh** — data/watch/controls kết hợp: menuChucNang, TypeLoad, addNew flag dialog, nested IF/THEN/ELSE, bulk action, openWindow+button+ctrlhotkey, `_.find`, pushRouter, f-menu inline, row-prop-object |
| `f-table-patterns.json` | **Tham chiếu f-table chuyên sâu** — tất cả props, mọi loại header (`t-check`/`t-select`/`t-button`/`t-link`/`t-menu`/`v-chip-group`/`v-icon`/divider), `ctrl-update` đầy đủ, f-table trong dialog, default-item-only |
| `project-patterns.json` | **Tham chiếu `project.json`** — cấu trúc đầy đủ project config: menuLeft/menu/menuStyle/menuComponent/domainSetting, `right` theo SystemRight+FunctionRight, quan hệ với `set` của module.json (override title/menu/apiDomain theo từng trang) |

## Cách dùng

1. Xác định tình huống → mở file tham chiếu tương ứng ở trên.
2. Lấy **đúng đoạn pattern cần dùng** (một action, một header, một khối dialog) — không copy cả file.
3. Thay API bằng endpoint thật, đổi tên field/label theo nghiệp vụ.
4. Ghép vào `data` / `controls` / `watch` sẵn có của module.
5. Chạy `module_validate` rồi `module_outline` trước khi publish.

**Không có filesystem access (SSE/remote)?** Đọc file mẫu qua `skill_reference_get`, sửa nội dung,
rồi stage bằng `module_stage_ui_json` / `component_stage` trước khi gọi tool publish
(xem [tools-registry.md](tools-registry.md)).
