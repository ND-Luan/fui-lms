# FUI Table Components (Source-Based)

> File này sở hữu: **`f-table` chuyên sâu: mọi props, auto-header, `sum-format`, readonly table**. Điều khiển trong ô (`t-*`) xem [ui-table-cell-patterns.md](ui-table-cell-patterns.md).

This file is derived from `scripts/componentTable.js`.
Focus: `f-table` and `t-*` renderers.

> `f-table` đảm nhận cả hai vai trò: bảng CRUD và bảng chỉ xem (readonly). Bảng chỉ xem = `f-table` không khai báo `:update-api` (hoặc thêm `:disabled-update true`); có thể bỏ luôn `:headers` để bảng tự dựng header từ dữ liệu (xem Auto Headers bên dưới).

## Prefix Reminder

- `f-table`: FUI component.
- `t-*`: FUI cell renderers for table columns.
- `v-data-table`: Vuetify internal implementation, but CRUD and table action flow comes from FUI wrappers.

## f-table

### Props (exact from source)

`value`, `headers`, `updateForm`, `updateFormAttr`, `updateApi`, `items`, `label`, `excel`, `showSearch`, `sumFormat`, `disabledHover`, `returnObject`, `itemKey`, `itemsPerPage`, `disabledUpdate`, `hideDefaultFooter`, `template`, `headercomponent`

### Real Behavior

1. If a header item has `el`, table creates custom slot renderer automatically.
2. If `updateApi.new` or `updateApi['new-action']` exists, add button appears.
3. CRUD action slots rely on header `value: "ctrl-update"`.
4. Editing dialog is `f-dialog` with `updateForm`.
5. Selection result emit:
- if `returnObject=false`: emit array of `itemKey`
- if `returnObject=true`: emit selected row objects
6. Emits row events from slots: `click:row`, `mouseover:row`, `mouseleave:row`.
7. **Auto headers**: nếu KHÔNG truyền `:headers`, table tự build header từ `items` (xem mục Auto Headers).
8. **Sum row / sum line**: prop `sum-format` nhận string HOẶC object — hai cách render khác nhau (xem mục sum-format).

### Auto Headers (khi không truyền `:headers`)

Khi bỏ hẳn prop `:headers`, `f-table` tự build header từ row đầu tiên của `items` (qua `buildHeader`):

- Mỗi key của row → một cột `{ text: key, value: key, divider: true }`; key có giá trị số → tự gắn `el: "t-num"` (format số bên phải).
- Nếu có `:update-api` với `edit`/`delete` và không `disabled-update` → tự thêm cột `ctrl-update` cuối bảng.
- Headers được rebuild mỗi khi `items` đổi shape (watch trên `items`) — an toàn khi data load async.

**Khi nào dùng:** bảng hiển thị nhanh, cột đúng bằng field trả về từ API (SP đã alias tên cột đẹp bằng tiếng Việt). **Khi nào KHÔNG dùng (phải khai `:headers` tường minh):** cần label khác tên field, cần ẩn bớt cột, cần `t-*` renderer tùy biến (t-time, t-check, t-link...), cần width/align cụ thể, hoặc data có field kỹ thuật (ID nội bộ, flag) không nên hiển thị.

```json
{ "el": "f-table", "w": "12", "attr": { "label": "Kết quả", ":items": "dsKetQua", "show-search": true } }
```

### sum-format — Tổng cột (2 dạng)

Prop `sum-format` có 2 dạng, render hoàn toàn khác nhau:

**Dạng 1 — string template → MỘT dòng text tổng dưới bảng** (trong `v-card-actions`, KHÔNG nằm trong `v-data-table`, không thẳng cột):

```json
"sum-format": "Tổng đăng ký: [[DangKy]] | Nhập học: [[NhapHoc]]"
```

- `[[FieldName]]` được thay bằng `_.sumBy(items, 'FieldName')` format cố định `'0,0'` (numeral).
- Kết quả là 1 dòng text duy nhất, căn phải, phía dưới bảng (có `v-divider` ngăn cách).
- Dùng khi: chỉ cần 1 dòng tóm tắt tổng, hoặc tổng của nhiều cột gộp chung 1 câu.
- Là string tĩnh → khai báo attr KHÔNG có `:` prefix.

**Dạng 2 — object → HÀNG TỔNG thật sự trong bảng** (slot `body.append` của `v-data-table`, thẳng theo từng cột):

```json
":sum-format": { "DangKy": "0,0", "NhapHoc": "0,0", "HocPhi": "0,0.0" }
```

- Key = `value` của cột trong headers; value = numeral format string riêng cho cột đó (`"0,0"`, `"0,0.0"`, `"0.0%"`, ...).
- Render một `<tr>` cuối thân bảng: ô của cột có key trong object hiển thị `_.sumBy(items, key)` theo format tương ứng; các cột khác để trống. Tất cả ô căn phải, `font-weight-medium`.
- Hàng tổng nằm TRONG bảng nên thẳng hàng với cột, cuộn cùng thân bảng.
- Là object → khai báo attr CÓ `:` prefix.

**Chọn dạng nào:** user cần "hàng tổng dưới mỗi cột / dòng tổng trong bảng / tổng thẳng cột" → dạng object. User cần "dòng chữ tổng kết chung" → dạng string. **KHÔNG tự dựng hàng tổng thủ công** (không push row "Tổng" vào items, không tự viết template body.append) — dùng `sum-format`.

Ví dụ đầy đủ dạng object:

```json
{
  "el": "f-table", "w": "12",
  "attr": {
    "label": "Thống kê tuyển sinh",
    ":items": "dsThongKe",
    ":headers": [
      { "text": "Ngành", "value": "TenNganh" },
      { "text": "Đăng ký", "value": "DangKy", "el": "t-num" },
      { "text": "Nhập học", "value": "NhapHoc", "el": "t-num" }
    ],
    ":sum-format": { "DangKy": "0,0", "NhapHoc": "0,0" }
  }
}
```

### updateApi Keys Used By Source

- `new`
- `edit`
- `delete`
- `default-item`
- `new-action`
- `edit-action`
- `data-out`

### Minimal CRUD Example

```json
{
  "el": "f-table",
  "w": "12",
  "attr": {
    "label": "Danh sach nhan vien",
    ":items": "items",
    "item-key": "ID",
    ":return-object": false,
    "show-search": true,
    "excel": true,
    ":headers": [
      { "text": "Ho ten", "value": "FullName" },
      { "text": "Email", "value": "Email" },
      { "text": "Trang thai", "value": "Active", "el": "t-boolean", "align": "center", "width": "90px" },
      { "text": "Tac vu", "value": "ctrl-update", "align": "center", "width": "120px" }
    ],
    ":update-form": [
      { "el": "v-text-field", "attr": { "v-model": "FullName", "label": "Ho ten", ":required": true } },
      { "el": "v-text-field", "attr": { "v-model": "Email", "label": "Email", ":required": true } }
    ],
    ":update-api": {
      "default-item": { "FullName": "", "Email": "", "Active": true },
      "new": {
        "API": "/api/staff/create",
        "IN": { "FullName": "item.FullName", "Email": "item.Email", "Active": "item.Active" },
        "CALLBACK": { "CALL": "apiLoadItems" }
      },
      "edit": {
        "API": "/api/staff/update",
        "IN": { "ID": "item.ID", "FullName": "item.FullName", "Email": "item.Email", "Active": "item.Active" },
        "CALLBACK": { "CALL": "apiLoadItems" }
      },
      "delete": {
        "CONFIRM": "Xac nhan xoa?",
        "API": "/api/staff/delete",
        "IN": { "ID": "item.ID" },
        "CALLBACK": { "CALL": "apiLoadItems" }
      }
    }
  }
}
```

## Readonly Table

Bảng chỉ xem = `f-table` không có `:update-api` (không hiện nút thêm/sửa/xóa) — bỏ `:headers` nếu muốn auto-build:

```json
{
  "el": "f-table",
  "w": "12",
  "attr": {
    "label": "Danh sach xem nhanh",
    ":items": "items",
    "item-key": "ID",
    "show-search": true,
    "excel": true,
    ":items-per-page": 20
  }
}
```

## t-* Cell Renderers

Use in `headers` by setting `el`.

Example header:

```json
{ "text": "Ngay tao", "value": "CreatedAt", "el": "t-time", "attr": { "format": "DD/MM/YYYY HH:mm" } }
```

### Supported `t-*` components

- `t-html`
- `t-label`
- `t-num`
- `t-time`
- `t-boolean`
- `t-check`
- `t-text`
- `t-select`
- `t-combobox`
- `t-menu`
- `t-link`
- `t-button`

### Notes

1. Editable renderers (`t-check`, `t-text`, `t-select`, `t-combobox`, `t-menu`, `t-button`) use `tableActionEvent`.
2. For dialog opening in row actions, use `target: "dialog"` plus `wid`, `url`, `title`, `onclose`.
3. Apply literal-string rule only in Action `IN` mapping.  
   Static component props without `:` are plain strings by default.
