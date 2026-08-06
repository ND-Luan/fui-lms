---
version: 1
name: FUI-design-system
description: "FUI design system dựa trên Vuetify 2 + Material Design 2, rút ra từ codebase thực tế. Light mode, enterprise admin. Primary blue (#1976D2) là màu duy nhất cho action chính. Input fields dùng outlined+dense+hide-details theo defaultControlAttr (FUI runtime tự apply — không cần viết lại trong module.json). Dialog: dựng v-dialog thủ công theo anatomy chuẩn mô phỏng phong cách f-dialog (toolbar dense+flat không color, close icon, actions mr-1 mb-1 với nút text). Form dùng floating label — KHÔNG dùng label div rời. Card trong dialog không dùng elevation hay outlined — chỉ style padding:0. f-button mặc định elevation:0, color:primary, checkvalid:false."

colors:
  primary: "#1976D2"
  primary-text: "primary--text"
  warning: "#FB8C00"
  success: "#4CAF50"
  error: "#FF5252"
  action-main: "primary"
  action-delete: "warning"
  action-positive: "success"
  action-register: "green"
  conditional: "(condition ? 'red' : 'primary')"

icons:
  save: "mdi-content-save"
  delete: "mdi-delete"
  search: "mdi-magnify"
  close: "mdi-close"
  add-user: "mdi-account-multiple-plus"
  remove-user: "mdi-account-multiple-minus"
  edit: "mdi-pencil"
  filter: "mdi-filter"
  refresh: "mdi-refresh"
  upload: "mdi-cloud-upload-outline"
  download: "mdi-download"
  print: "mdi-printer"
  settings: "mdi-cog"
  eye: "mdi-eye"
  lock: "mdi-lock"
  check: "mdi-check-bold"

layout:
  main-container: "grid-list-md fluid"
  dialog-container: "hidden-container"
  centered-narrow: "grid-list-md mw-1000"
  page-with-nav: "page-container grid-list-md fluid"
  dialog-inner: "grid-list-md px-4"
---

# FUI Design System

Tài liệu này mô tả cách viết UI chuẩn cho FUI modules. Tất cả patterns rút từ codebase thực tế, không phải lý thuyết.

---

## 1. Defaults do FUI Runtime tự apply (không cần viết trong module.json)

`defaultControlAttr` trong FUI runtime tự inject các attr sau khi render. **Không cần** viết lại trong module.json:

| Component | Defaults tự inject |
|---|---|
| `v-text-field` | `outlined, dense, hide-details, required:true` |
| `v-textarea` | `outlined, dense` |
| `v-select` | `outlined, dense, hide-details, required:true, menu-props:{offsetY:true}` |
| `v-combobox` | `outlined, dense, hide-details, required:true, menu-props:{offsetY:true}` |
| `v-autocomplete` | `outlined, dense, hide-details, auto-select-first:true` |
| `v-checkbox` | `class:mt-1, hide-details` |
| `v-switch` | `dense, hide-details, class:my-1 mx-0` |
| `v-card` | `outlined:true` |
| `v-btn` | `elevation:0` |
| `f-button` | `elevation:0, color:primary` |
| `f-table` | `dense, fixed-header, hide-default-footer, show-search, items-per-page:50` |
| `f-dialog` | `outlined, dense` |
| `f-date` | `outlined, dense, hide-details, picker.locale:vi` |
| `f-time` | `outlined, dense, hide-details` |
| `f-search` | `outlined, dense, hide-details, auto-select-first:true` |

**Hệ quả thực tế:** Khi viết module.json, một input field chỉ cần:
```json
{ "el": "v-text-field", "attr": { "v-model": "vueData.form.Name", "label": "Họ và tên" }, "w": 12 }
```
Không cần thêm `outlined`, `dense`, `hide-details` — runtime tự thêm.

---

## 2. Colors — Quy tắc dùng màu

| Màu | Khi nào dùng |
|---|---|
| `primary` | Mọi action chính: Save, Add, Search, View, mở dialog |
| `warning` | Delete, Permission denied, Remove — destructive nhưng không nguy hiểm cao |
| `success` | Action positive không xóa dữ liệu: Update permission, Scan |
| `green` | Đăng ký, Register — dùng với `:outlined:true` |
| conditional | `"(vueData.item.Active == 0 ? 'red' : 'primary')"` — trạng thái toggle |

**Rule cốt lõi:** Chỉ một màu accent trên một màn hình. Không mix nhiều màu cùng cấp.

---

## 3. Toolbar — Chỉ dùng trong dialog

Toolbar trong FUI module **không bao giờ có** `color` hay `dark`. Pattern chuẩn bên trong `v-card`:

```json
{
  "el": "v-toolbar",
  "attr": { "dense": "", "flat": "" },
  "innerHTML": [
    { "el": "v-toolbar-title", "innerHTML": "Tên Dialog" },
    { "el": "v-spacer" },
    {
      "el": "v-btn",
      "attr": { "icon": "", "v-on:click": "vueData.dlTen = false" },
      "innerHTML": [{ "el": "v-icon", "innerHTML": "mdi-close" }]
    }
  ]
}
```

**Không dùng:** `color="primary"`, `dark`, `elevation`, `tile` trên toolbar trong dialog.

---

## 4. Dialog — Cấu trúc chuẩn (v-dialog thủ công, phong cách f-dialog)

**Quy tắc gốc:** Dialog dựng bằng `v-dialog` thủ công (AI dễ đọc/chỉnh sửa từng phần), nhưng **diện mạo phải mô phỏng đúng `f-dialog`** của runtime: toolbar `dense flat` không màu + close icon, thân form floating label, actions căn phải `mr-1 mb-1` với nút **text style**. Component `f-dialog` vẫn hợp lệ cho form rất nhỏ, nhưng chuẩn mặc định là anatomy dưới đây.

Dialog luôn nằm trong `hidden-container`. Cấu trúc đầy đủ:

```json
{
  "prop": "hidden-container",
  "rows": [
    {
      "prop": "",
      "cols": [
        {
          "el": "v-dialog",
          "col": {},
          "attr": { "v-model": "vueData.dlTen", "width": 650 },
          "innerHTML": [
            {
              "el": "v-card",
              "attr": { "class": "pa-0" },
              "innerHTML": [
                {
                  "el": "v-toolbar",
                  "attr": { "dense": "", "flat": "" },
                  "innerHTML": [
                    { "el": "v-toolbar-title", "innerHTML": "Tiêu đề" },
                    { "el": "v-spacer" },
                    { "el": "v-btn", "attr": { "icon": "", "v-on:click": "vueData.dlTen = false" },
                      "innerHTML": [{ "el": "v-icon", "innerHTML": "mdi-close" }] }
                  ]
                },
                {
                  "el": "v-container",
                  "attr": { "class": "grid-list-md px-4" },
                  "innerHTML": [
                    {
                      "el": "v-layout",
                      "w": 12,
                      "attr": { "row": "", "wrap": "" },
                      "innerHTML": [
                        { "el": "v-text-field", "col": {}, "attr": { "v-model": "vueData.form.FullName", "label": "Họ và tên" }, "w": 12 },
                        { "el": "v-text-field", "col": {}, "attr": { "v-model": "vueData.form.Phone", "label": "Điện thoại" }, "w": 6 },
                        { "el": "v-select", "col": {}, "attr": { "v-model": "vueData.form.DeptID", "label": "Phòng ban",
                            ":items": "vueData.deptList", "item-text": "DeptName", "item-value": "DeptID" }, "w": 6 }
                      ]
                    }
                  ]
                },
                {
                  "el": "v-card-actions",
                  "attr": { "class": "mr-1 mb-1" },
                  "innerHTML": [
                    { "el": "v-spacer" },
                    { "el": "f-button", "attr": { "text": "", "label": "Lưu", "icon-text": "mdi-content-save",
                        ":checkvalid": false, "action": { "API": "...", "IN": {}, "CALLBACK": {} } } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Anatomy bắt buộc (đúng phong cách f-dialog):**
| Phần | Quy tắc |
|---|---|
| `v-card` | `class="pa-0"` — triệt đệm để toolbar tiêu đề tràn sát mép dialog (spacing của form đã do `v-container px-4` lo); không elevation/outlined vì v-dialog đã tự có bóng đổ. Ưu tiên class Vuetify thay vì `style="padding: 0px;"` |
| `v-toolbar` | `dense flat` — **không** color/dark; title + `v-spacer` + `v-btn[icon]` mdi-close |
| Thân | `v-container.grid-list-md.px-4` > `v-layout[row wrap]` > field floating label (xem §5) |
| `v-card-actions` | `class="mr-1 mb-1"`; `v-spacer` trước nút → nút dồn phải |
| Nút hành động | `f-button` kèm `"text": ""` (nút phẳng như f-dialog), màu primary mặc định, icon trái |
| Nút đóng phụ | Chỉ dùng close icon trên toolbar; không thêm nút "Đóng" ở actions trừ khi user yêu cầu |

**Width conventions:**
| Width | Dùng cho |
|---|---|
| 400 | Dialog nhỏ: confirm, function right, module select |
| 550 | Dialog trung bình: department update |
| 600 | Add right, department |
| 650 | Form user info chuẩn |
| 800 | Dialog lớn có table bên trong |

**Không dùng:** `persistent`, `fullscreen`, `scrollable`, `transition` trừ khi có lý do cụ thể.

---

## 5. Form Layout bên trong Dialog — floating label

**Chuẩn duy nhất: floating label của Vuetify** — mỗi field tự mang `label` trong `attr`. **KHÔNG dùng** pattern label `div` rời bên trái (kiểu w:3 + w:9) — pattern đó đã bị loại bỏ.

```json
{ "el": "v-layout", "w": 12, "attr": { "row": "", "wrap": "" }, "innerHTML": [
    { "el": "v-text-field", "col": {}, "attr": { "v-model": "vueData.form.FullName", "label": "Họ và tên" }, "w": 12 },
    { "el": "v-text-field", "col": {}, "attr": { "v-model": "vueData.form.Phone", "label": "Điện thoại" }, "w": 6 },
    { "el": "v-select", "col": {}, "attr": { "v-model": "vueData.form.DeptID", "label": "Phòng ban",
        ":items": "vueData.deptList", "item-text": "DeptName", "item-value": "DeptID" }, "w": 6 },
    { "el": "v-textarea", "col": {}, "attr": { "v-model": "vueData.form.Note", "label": "Ghi chú" }, "w": 12 }
]}
```

**Quy tắc chia cột form:**
- Field dài (họ tên, địa chỉ, ghi chú, textarea) → `w: 12`
- Field ngắn đi theo cặp → `w: 6` + `w: 6` (hoặc `4+4+4` khi 3 field ngắn)
- Field optional → thêm `":required": false` (runtime mặc định inject `required: true`)
- **KHÔNG** thêm class căn chỉnh (`mt-2`, `ml-2`, `flex-md-grow-0`) — floating label tự thẳng hàng trong grid

---

## 6. Toolbar chính của màn hình (row filter + buttons)

Row đầu tiên của màn hình thường chứa filter + action buttons:

```json
{
  "prop": "",
  "cols": [
    {
      "el": "v-autocomplete",
      "col": { "class": "shrink" },
      "attr": { "class": "flex-md-grow-0 my-2", "v-model": "vueData.sFilter",
          "label": "Lọc theo...", ":items": "vueData.dsList",
          "item-text": "Name", "item-value": "ID", ":required": false },
      "w": "350"
    },
    {
      "el": "f-button",
      "col": { "class": "shrink" },
      "attr": { "class": "my-2", "label": "Tìm", "icon-text": "mdi-magnify",
          ":checkvalid": false, "action": { "CALL": "vueData.search" } }
    },
    {
      "el": "f-button",
      "col": { "class": "shrink" },
      "attr": { "class": "my-2", "label": "Thêm", "icon-text": "mdi-account-multiple-plus",
          ":checkvalid": false, "action": { "EXE": "vueData.dlThem = true" } }
    }
  ]
}
```

**Width cho filter inputs trên toolbar:** Dùng pixel (`"w": "350"`, `"w": "200"`) thay vì grid columns.

---

## 7. f-button — Quy tắc

```json
{
  "el": "f-button",
  "attr": {
    "label": "Lưu",
    "icon-text": "mdi-content-save",
    ":checkvalid": false,
    "action": { "API": "/me/Save", "IN": { "Name": "vueData.form.Name" }, "CALLBACK": { "MESS": "Đã lưu" } }
  },
  "w": 2
}
```

**`:checkvalid`:**
- `false` (default): **Hầu hết buttons** — không cần validate form trước
- `true`: Chỉ khi button là Save của form có validation (user registration, connection string)

**Color mapping:**
| color | label | icon-text | Khi nào |
|---|---|---|---|
| `primary` (default) | Lưu | mdi-content-save | Lưu dữ liệu |
| `primary` | Tìm | mdi-magnify | Search/filter |
| `primary` | Thêm | mdi-account-multiple-plus | Mở dialog thêm |
| `warning` | Xóa | mdi-delete | Xóa dữ liệu |
| `warning` | Từ chối | mdi-cancel | Permission denied |
| `success` | Cập nhật | mdi-shield-edit | Update quyền |

---

## 8. f-table — Cấu trúc chuẩn

```json
{
  "el": "f-table",
  "col": { "v-if": "vueData.user.SystemRight > 1" },
  "attr": {
    "label": "Danh sách",
    ":items": "vueData.dataList",
    "item-key": "ID",
    ":items-per-page": -1,
    ":hide-default-footer": true,
    ":height": -16
  },
  "w": 12
}
```

**`:items-per-page`:**
- `-1` (default): Hiển thị tất cả, không phân trang — dùng khi có `hide-default-footer: true`
- `50`: Khi cần phân trang, bỏ `hide-default-footer`

**Permission guard:** Luôn đặt `v-if` trên `col` wrapper, không phải trên element:
```json
"col": { "v-if": "vueData.user.SystemRight > 1" }
```

**Chiều cao (`:height`)** — cùng quy ước cho `f-table` và `f-sheet`:

| Giá trị | Hành vi |
|---|---|
| *(bỏ trống)* | Tự giãn theo số dòng — chỉ hợp bảng ngắn/lookup; bảng chính sẽ làm cả trang cuộn |
| `<= 0` | **Fill tới đáy màn hình, chừa `abs(n)` px** — chuẩn cho bảng chính, dùng `-16` |
| `> 0` | px cố định — bảng trong dialog (vd `360`) |

Chế độ `<=0` tự đo `getBoundingClientRect().top` thật của bảng sau layout, theo dõi `resize`, và tự bật `fixed-header` — **không phải tính tay** theo chiều cao header. Pattern cũ `"$( window ).height()-285"` không dùng nữa (lint D9 cảnh báo).

**Inline column types (trong `headers` array):**
| el | Dùng cho |
|---|---|
| `t-button` | Action button trong row |
| `t-select` | Dropdown inline edit |
| `t-check` | Toggle on/off |
| `t-menu` | Context menu cho row |
| `v-icon` | Icon indicator (conditional color) |
| `v-chip-group` | Nhóm chip tags |

---

## 9. Layout — Container Patterns

**Main page container:**
```json
{ "prop": "grid-list-md fluid", "rows": [...] }
```

**Centered narrow (form/login page):**
```json
{ "prop": "grid-list-md mw-1000", "rows": [...] }
```

**Page với side navigation:**
```json
{ "prop": "page-container grid-list-md fluid", "rows": [
    { "prop": "page-navigation", "cols": [...] },
    { "prop": "row", "cols": [...] }
]}
```

**Container chứa dialogs (bắt buộc):**
```json
{ "prop": "hidden-container", "rows": [
    { "prop": "", "cols": [ { "el": "v-dialog", ... } ] }
]}
```

---

## 10. Context Menu — t-menu pattern

Khi một row có nhiều actions, dùng `t-menu` thay vì nhiều `t-button`:

```json
// Trong headers array:
{ "el": "t-menu", "width": "120px", "align": "center", "text": "Tác vụ", "value": "Actions",
  "attr": { ":items": "vueData.menuActions" } }

// Trong data section:
"menuActions": [
  { "color": "primary", "icon-text": "mdi-pencil", "text": "Chỉnh sửa",
    "action": { "EXE": "vueData.openEdit(item)" } },
  { "color": "warning", "icon-text": "mdi-delete", "text": "Xóa",
    "action": { "CONFIRM": "Bạn có chắc muốn xóa?", "API": "...", "IN": { "ID": "item.ID" } } }
]
```

---

## 11. Phản hồi & xác nhận — CHỈ dùng hệ thống có sẵn của FUI

Mọi phản hồi cho user (xác nhận, báo thành công, báo lỗi) đi qua hệ thống có sẵn của platform — **KHÔNG tự dựng** `v-snackbar`, `v-alert`, hay toast/notification tự chế trong controls:

| Nhu cầu | Dùng | Cơ chế |
|---|---|---|
| Xác nhận trước hành động | `CONFIRM` trong action | jquery-confirm dialog |
| Báo thành công (thoáng qua) | `MESS` trong CALLBACK | vue-toast góc màn hình |
| Thông báo cần user đọc kỹ | `MESSBOX` trong action | `showMessage()` hộp thoại |
| Báo lỗi API | `ERRORCALLBACK` + `MESS`/`MESSBOX` | như trên |
| Trong script.js / EXE | `Vue.$toast.success/error(...)`, `showMessage({...})` | hàm global sẵn có |

### Destructive actions — luôn có CONFIRM

Mọi action xóa dữ liệu phải có `CONFIRM`:

```json
{
  "CONFIRM": "Bạn có chắc muốn xóa?",
  "API": "/me/Delete",
  "IN": { "ID": "vueData.selectedID" },
  "CALLBACK": { "CALL": "vueData.loadData" }
}
```

Update có tác động lớn (system right, connection string) cũng cần `CONFIRM`.

### Action ghi — luôn có phản hồi

Mọi action ghi dữ liệu (Insert/Update/Delete) phải có `CALLBACK` vừa reload data vừa `MESS` báo kết quả:

```json
{ "API": "/me/Save", "IN": { ... }, "CALLBACK": { "MESS": "Đã lưu", "CALL": "vueData.loadData" } }
```

---

## 12. Icons — Bảng chuẩn

| Icon | Dùng cho |
|---|---|
| `mdi-content-save` | Save / Lưu |
| `mdi-delete` | Xóa |
| `mdi-magnify` | Tìm kiếm |
| `mdi-close` | Đóng dialog |
| `mdi-refresh` | Tải lại |
| `mdi-plus` | Thêm mới (generic) |
| `mdi-pencil` | Sửa |
| `mdi-account-multiple-plus` | Thêm user |
| `mdi-account-multiple-minus` | Xóa user |
| `mdi-account-details` | Chi tiết user |
| `mdi-shield-edit` | Cập nhật quyền |
| `mdi-shield-account-outline` | User permission |
| `mdi-lock-open-plus` | Cấp quyền |
| `mdi-lock-open-remove` | Thu hồi quyền |
| `mdi-check-bold` | Trạng thái active |
| `mdi-lock` | Trạng thái locked |
| `mdi-cancel` | Từ chối / Denied |
| `mdi-cloud-upload-outline` | Upload file |
| `mdi-download` | Tải xuống |
| `mdi-filter` | Lọc |
| `mdi-folder-edit-outline` | Xem/sửa chi tiết |

---

## 13. Do's and Don'ts

### Do
- Dùng `hidden-container` để wrap tất cả dialogs.
- Dựng dialog bằng `v-dialog` thủ công theo anatomy §4 — diện mạo mô phỏng `f-dialog`.
- Dùng `dense flat` cho toolbar bên trong dialog — không thêm color hay dark.
- Dùng `class="pa-0"` cho v-card trong dialog (không dùng inline style).
- Form dùng **floating label** (`label` trong attr của field) — w:12 cho field dài, 6+6 cho field ngắn.
- Nút hành động trong `v-card-actions` dùng `f-button` + `"text": ""` (nút phẳng), actions có `class="mr-1 mb-1"`.
- Đặt `v-if` permission guard trên `col` wrapper, không phải trên element.
- Dùng `:items-per-page: -1` + `hide-default-footer: true` cho table không cần phân trang.
- Dùng `CONFIRM` trước mọi action xóa dữ liệu.
- Dùng pixel width (`"w": "350"`) cho filter inputs trên toolbar row.
- Dùng `MESS`/`MESSBOX`/`CONFIRM` (hệ thông báo có sẵn) cho mọi phản hồi — xem §11.
- Dùng `:checkvalid: false` cho hầu hết f-button (chỉ `true` khi cần validate form đăng ký).
- Conditional color: `"(item.Active == 0 ? 'red' : 'primary')"` cho status toggles.

### Don't
- Đừng viết lại `outlined`, `dense`, `hide-details` trong module.json — runtime tự inject từ `defaultControlAttr`.
- Đừng dùng label `div` rời bên trái cho form (pattern w:3 + w:9 cũ) — chuẩn là floating label.
- Đừng dùng `color="primary" dark` cho toolbar trong dialog.
- Đừng thêm `elevation` hay `outlined` cho v-card trong dialog.
- Đừng dùng `persistent`, `fullscreen` cho dialog thông thường.
- Đừng dùng nhiều màu accent trên cùng một màn hình — chỉ primary + một màu semantic.
- Đừng để button xóa màu `error` (đỏ) — dùng `warning` (cam).
- Đừng hardcode height cho table — dùng `":height": -16` (fill tới đáy, tự đo) cho bảng chính.
- Đừng dùng `@click` trong JSON — luôn dùng `v-on:click`.
- Đừng tự dựng `v-snackbar`/`v-alert`/toast riêng trong controls để báo kết quả — dùng `MESS`/`MESSBOX` có sẵn (§11).

---

## 14. Template `{projectId}/DESIGN.md` — nơi tích luỹ chuẩn riêng của project

Khi user góp ý về UI, AI phải ghi quy tắc vào `{projectId}/DESIGN.md` theo template dưới (tạo file nếu chưa có). File này **ghi đè** quy tắc cùng chủ đề của chuẩn chung — mục nào không có thì vẫn theo fui/DESIGN.md. Mỗi quy tắc phải viết ở dạng **tổng quát + ví dụ đúng/sai**, không ghi lại tình huống cụ thể kiểu nhật ký.

```markdown
# DESIGN — {Tên project}

> Ghi đè fui/DESIGN.md. Mục không đề cập → theo chuẩn chung.
> Mỗi quy tắc: phát biểu tổng quát + ví dụ ĐÚNG/SAI (nếu diễn đạt được bằng JSON).

## 1. Khung trang (container, mw-*, page-navigation)
<!-- vd: "Mọi trang nhập liệu dùng mw-1200" -->

## 2. Toolbar / hàng filter
<!-- vd: "Nút Thêm luôn đứng cuối hàng filter, sau nút Tìm" -->

## 3. Bảng dữ liệu (f-table)
<!-- vd: "Cột Tác vụ luôn dùng t-menu khi có ≥2 hành động" -->

## 4. Dialog
<!-- vd: "Dialog form của project này luôn width 600" -->

## 5. Form
<!-- vd: "Field ngày luôn đặt cặp Từ ngày/Đến ngày w:6+6" -->

## 6. Màu / icon / nhãn nút
<!-- vd: "Nút lưu ghi 'Ghi lại' thay vì 'Lưu'" -->

## 7. Cấm trong project này
<!-- vd: "Không dùng v-chip trong bảng" -->
```

**Quy trình ghi (bắt buộc sau mỗi góp ý UI của user):**
1. Sửa module theo góp ý → 2. Chuyển góp ý thành quy tắc tổng quát, ghi vào đúng mục ở trên → 3. Nếu quy tắc đáng áp dụng cho mọi project → đề xuất user đưa vào fui/DESIGN.md (chuẩn chung), chờ user quyết.
