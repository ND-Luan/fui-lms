---
mode: agent
description: Refactor module cũ (raw.json DSL phức tạp) thành pattern mới (raw.json tối giản + uc-main-layout.vue). Dùng khi module dùng controls/innerHTML tree hoặc f-table/uc-page.
---

# Refactor module cũ sang pattern mới – fui-lms

## Bước thực hiện

Khi được yêu cầu refactor một module:

### 1. Đọc hiểu module cũ

- Đọc `raw.json`: xác định các API được khai báo (`data[n].{apiName}`), các `watch`, và cây `controls`
- Đọc `script.js`: xác định các hàm helper và data transforms
- Đọc các component con hiện có trong `components/`

### 2. Ánh xạ logic

| raw.json cũ | Tương đương mới |
|-------------|-----------------|
| `data[n].{apiName}: { API, IN, OUT }` | `methods.getXxx()` dùng `fetchPromise` |
| `data[n].CALL: "getXxx"` | `mounted() { this.getXxx() }` |
| `watch.{prop}.CALL` | `watch: { prop(v) { this.getXxx() } }` |
| `watch.{prop}.EXE` | `watch: { prop(v) { /* exec logic */ } }` |
| `controls[n].el: "f-table"` | `v-data-table` theo chuẩn |
| `controls[n].el: "uc-page"` | `Global` wrapper + `#header` slot |
| `controls[n].attr[":items"]` | `:items="DS"` trên v-data-table |
| `controls[n].attr["v-model"]` | `v-model` trực tiếp |

### 3. Tạo `raw.json` tối giản

Thay toàn bộ `raw.json` bằng:
```json
{
  "data": [
    {"EXE": "IsCheck_NotRoleParent(vueData.user)"},
    {"CapID": "parseInt(capid)"}
  ],
  "watch": {},
  "controls": [
    {
      "prop": "fluid pa-0",
      "rows": [{"prop": ":no-gutters='true'", "cols": [{"el": "uc-main-layout"}]}]
    }
  ],
  "set": {}
}
```
Giữ lại bất kỳ `data[n].{Prop}` nào đọc URL query params (ví dụ `{"LopID": "parseInt(lopid)"}`).

### 4. Dọn `script.js`

Chuyển các hàm helper từ `script.js` vào `methods` trong `uc-main-layout.vue`.  
Sau đó để `script.js` trống:
```js
// logic lives in components/uc-main-layout.vue
```

### 5. Tạo / viết lại `components/uc-main-layout.vue`

Tuân theo toàn bộ quy tắc trong `.github/instructions/vue-component.instructions.md`.

Checklist bắt buộc:
- [ ] `inject: ['snackbarRef', 'iframeRef']`
- [ ] `<Global>` bao ngoài cùng
- [ ] `<template #header>` — `<v-card>` thuần, không có `rounded`/`elevation`/`border`
- [ ] `v-data-table` với `max-height: calc(100dvh - 77px); overflow-y: auto;`
- [ ] `items-per-page="-1" hide-default-footer`
- [ ] `headers` khai báo trong `data()`, không phải `vueData.headers`
- [ ] Đổi `ajaxCALL` đọc dữ liệu → `fetchPromise`
- [ ] Giữ `ajaxCALL` cho mutations, thêm `confirm()` trước khi gọi
- [ ] Không dùng template string trong event handlers

### 6. Xoá code thừa

- Xoá các import/helper trong `script.js` đã chuyển vào component
- Xoá các component cũ dùng `uc-page` / `f-table` nếu đã được thay thế hoàn toàn

### Lưu ý

- Không xoá file nào cho đến khi đã xác nhận logic đã được chuyển đầy đủ
- Không thay đổi URL API — chỉ đổi cách gọi (`ajaxCALL` → `fetchPromise`)
- Không thêm tính năng mới trong quá trình refactor — chỉ tái cấu trúc
