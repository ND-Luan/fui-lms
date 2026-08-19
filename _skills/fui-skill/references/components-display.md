# FUI Display & Presentation Components

> File này sở hữu: **component hiển thị: `f-label`, `f-title`, `f-box`, `f-header`, `f-slider`, chip/badge**.

Components dùng để hiển thị thông tin, chart, media. File này cũng chứa prefix/binding rules áp dụng cho tất cả f-* components.

## Prefix và Binding Rules

- `f-*`: FUI components (định nghĩa trong FUI runtime)
- `v-*`: Vuetify components
- `uc-*`: Custom module components từ `components/`
- Trong `module.json`, truyền props qua `attr`
- Dùng kebab-case trong JSON cho custom props (`api-upload`, `item-value`)
- Giá trị động dùng `:prop`
- Dùng `v-on:*` trong JSON (không dùng `@*`)
- Props không có `:` (ví dụ `url`, `api-upload`) là plain string mặc định
- Literal-string forcing (backtick/quote) chỉ dùng trong Action `IN` mapping, không dùng cho static props

## Minimal Control Pattern

```json
{
  "el": "f-date",
  "w": "6",
  "attr": {
    "v-model": "formData.fromDate",
    "label": "From date"
  }
}
```

---

## f-label

- Props (source): `items`, `text`, `color`, `iconText`
- Behavior: render `v-chip` từ `text` và/hoặc `items`
- Example:

```json
{
  "el": "f-label",
  "w": "12",
  "attr": {
    "text": "Trang thai",
    "icon-text": "mdi-information"
  }
}
```

## f-box

- Props (source): `rowFormat`, `items`, `label`, `edit`, `saveclick`
- Emit: `input` khi dữ liệu nội bộ thay đổi
- Behavior: hiển thị/chỉnh sửa key-value rows, tự build row format từ data nếu thiếu
- `rowFormat`: mảng `{ text, value, noEdit }` — `noEdit: true` khóa cột đó khi `edit=true`
- `items`: object hoặc array; object tự động wrap thành array 1 phần tử
- Example:

```json
{
  "el": "f-box",
  "w": "12",
  "attr": {
    "label": "Thong tin",
    ":items": "detailData",
    ":edit": "isEditMode",
    ":row-format": [
      { "text": "Mã", "value": "StudentID", "noEdit": true },
      { "text": "Họ tên", "value": "FullName" },
      { "text": "Ngày sinh", "value": "BirthDate" }
    ]
  }
}
```

## f-header

- Props (source): `label`
- Example:

```json
{
  "el": "f-header",
  "w": "12",
  "attr": { "label": "Bao cao tong hop" }
}
```

## f-title

- Props (source): `label`
- Example:

```json
{
  "el": "f-title",
  "w": "12",
  "attr": { "label": "Danh sach ho so" }
}
```

## f-slider

- Props (source): `items`, `itemAttr`
- Behavior: bọc `v-carousel` và `v-carousel-item`
- Example:

```json
{
  "el": "f-slider",
  "w": "12",
  "attr": {
    ":items": "slideItems",
    ":item-attr": { "contain": true }
  }
}
```

## f-echart

→ Xem [`components-echart.md`](components-echart.md) — tài liệu đầy đủ về props, config, global module `FEchartFormatter` và ví dụ.

## f-pdfmake

- Props (source): `data`
- Behavior: render PDF trong iframe, re-render khi `data` thay đổi (deep watch)
- Example:

```json
{
  "el": "f-pdfmake",
  "w": "12",
  "attr": {
    ":data": "pdfDefinition",
    "height": "550"
  }
}
```

---

## Practical Notes

1. Hầu hết `f-*` components forward unknown attrs qua `v-bind="$attrs"` — Vuetify attrs vẫn hoạt động nếu child là Vuetify control.
2. Literal-string rule chỉ áp dụng khi truyền API/path strings trong Action `IN` mapping.
3. Xem `references/component-table.md` cho `f-table`.
