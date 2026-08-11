# FUI Vue Component Design Rules

> File này sở hữu: **quy tắc viết `uc-*.vue`: scope module/project, cấm `name:`/`components:{}`, props/emits/slots, cấm `_injectStyle`, quy tắc scope thủ công cho `<style scoped>`, và quy trình kiểm chứng component (`component_preview` + luật push component cấp project trước khi render module)**. Bộ class/prop được duyệt xem [controls-styling-vocabulary.md](controls-styling-vocabulary.md).

Quy tắc bắt buộc khi viết bất kỳ Vue component nào (`uc-*.vue`) trong hệ thống FUI. Áp dụng cho cả component thông thường lẫn dialog component.

---

## 1. Hai cấp component: module-scope vs project-scope

| | Module-scope | Project-scope (global) |
|---|---|---|
| **Vị trí file** | `{projectId}/modules/{moduleId}/components/uc-*.vue` | `{projectId}/components/uc-*.vue` |
| **Registry** | `modules/{moduleId}/components/_components.json` | `{projectId}/components/_components.json` |
| **Phạm vi** | Chỉ trong module đó | **Tất cả modules trong project** |
| **Auto-load** | Trong module đã có component | Tự động — **không cần khai báo gì thêm** |
| **Khi nào dùng** | Component chỉ dùng ở một module | Component dùng lại ở nhiều module |

> **Project-scope component được FUI tự động load ở cấp global** — bất kỳ module nào trong project đều dùng được `<uc-*>` ngay, không cần tạo lại hay khai báo thêm.

### Quy tắc chọn scope

```
Component này sẽ dùng ở nhiều module? → project-scope
Component chỉ dùng trong một module?   → module-scope
```

### Bảng thao tác theo scope

| Thao tác | Module-scope | Project-scope (global) |
|---|---|---|
| **Tạo mới** (chưa có trên server) | `component_new(componentName)` — dùng session.moduleId | `component_new(componentName, projectId=<pid>)` — KHÔNG có moduleId |
| **Cập nhật** (đã có trên server) | `component_update(componentName)` — dùng session.moduleId | `component_update(componentName, projectId=<pid>)` — KHÔNG có moduleId |
| **Xóa** | `component_delete(componentName)` — dùng session.moduleId | `component_delete(componentName, projectId=<pid>)` — KHÔNG có moduleId |
| **Đọc source** | `component_get(projectId, moduleId, componentName)` | `component_get(projectId, componentName)` — bỏ moduleId |
| **Sync danh sách** | `component_list(projectId, moduleId)` | `component_list(projectId)` — bỏ moduleId |
| **File trong workspace** | `{moduleDir}/components/uc-foo.vue` | `{projectDir}/components/uc-foo.vue` |

**Quy tắc duy nhất:** `moduleId` có → module-scope · `moduleId` vắng, chỉ `projectId` → project-scope

**Tạo và cập nhật là HAI tool riêng — không có upsert ngầm.** Cả hai đọc file `.vue` **local** (file phải tồn tại sẵn trên đĩa) và tự suy `ComID` từ `_components.json`, không truyền tay:

- `component_new` — chỉ INSERT. Làm mới `_components.json` **từ server trước** rồi mới kiểm tra tên; trùng tên = **lỗi cứng**. (Cache cũ mà cứ INSERT thì server sinh **hai record cùng tên**, không sửa được từ MCP.) Sau khi tạo tự sync lại để lấy `ComID` thật.
- `component_update` — chỉ UPDATE. Không tra được `ComID` = **lỗi cứng**, không âm thầm tạo mới: hoặc component chưa từng được tạo (→ `component_new`), hoặc cache local cũ (→ `component_list` rồi thử lại).

**`component_delete` tự lookup ComID** từ `_components.json` local. Nếu danh sách lệch, chạy `component_list` trước.

**`module_publish_html` không bao gồm project-scope component** — nếu có thay đổi component global, phải gọi `component_new`/`component_update` riêng trước hoặc sau.

---

## 2. Đặt tên và cấu trúc file

- **Prefix bắt buộc**: `uc-` (User Component) — phân biệt với `f-*` (FUI runtime) và `v-*` (Vuetify)
- **Format**: kebab-case — ví dụ `uc-trangthai-sukien.vue`, `uc-user-profile.vue`
- **Vị trí**: chỉ đặt trong `components/` ở root module hoặc root project, không tạo subfolder
- **Registry**: khai báo trong `components/_components.json` (chỉ cần `comName`, không tự đặt `comID`)

---

## 3. Đăng ký component — KHÔNG dùng `components: {}`, KHÔNG dùng `name:`

FUI tự động scan và đăng ký toàn bộ `uc-*.vue` ở cấp **global**. Tuyệt đối không khai báo `components: { ... }` bên trong một component — nó không hoạt động trong môi trường FUI.

Không khai báo thuộc tính `name:` trong `export default` — FUI tự xử lý tên component từ tên file khi tạo script, khai báo thêm là thừa và có thể gây xung đột:

```js
// ❌ SAI — không cần và có thể gây xung đột
export default {
  name: 'uc-user-card',
  props: { ... }
}

// ✅ ĐÚNG — bỏ name, FUI tự resolve từ tên file
export default {
  props: { ... }
}
```

```js
// ❌ SAI — không dùng trong FUI
export default {
  components: { 'uc-user-card': UcUserCard },
}

// ✅ ĐÚNG — dùng trực tiếp tag trong template
// <uc-user-card :data="data" />
```

---

## 4. Props

- Khai báo trong `script`: camelCase (`userName`, `itemList`)
- Dùng trong `template`: kebab-case (`:user-name="userName"`)
- Default của Array/Object phải dùng `function()`, không dùng arrow function:

```js
// ❌ SAI
props: { items: { default: () => [] } }

// ✅ ĐÚNG
props: { items: { default: function() { return [] } } }
```

- Ưu tiên tên props trung lập và tái sử dụng được: `items`, `value`, `label`, `loading`, `readonly`, `disabled`, `options`, `config`
- Không đặt tên props gắn chặt với một màn hình cụ thể nếu component có thể dùng lại

---

## 5. Emits

- Luôn emit lên parent thay vì mutate trực tiếp state của parent
- Các event chuẩn: `input`, `change`, `select`, `submit`, `remove`, `action`
- Dialog component luôn emit `('input', false)` để đóng — tương thích với `v-model` Vue 2

---

## 6. Template syntax — các ràng buộc bắt buộc

### Không dùng backtick trong `<template>`

Template strings (backtick) không hoạt động đúng trong Vue 2 template. Dùng string concatenation:

```html
<!-- ❌ SAI -->
:label="`Total (${items.length})`"

<!-- ✅ ĐÚNG -->
:label="'Total (' + items.length + ')'"
```

### Không dùng `@` shorthand cho events trong JSON

Trong `module.json` luôn dùng `v-on:click`, không dùng `@click`. Trong `.vue` template thì `@click` vẫn hợp lệ.

### Vue 2 yêu cầu một root element duy nhất

```html
<!-- ✅ ĐÚNG -->
<template>
  <div>
    <!-- nội dung -->
  </div>
</template>
```

---

## 7. Style & class — ƯU TIÊN class Vuetify có sẵn, KHÔNG tự chế

**Quy tắc: dùng class tiện ích Vuetify có sẵn cho MỌI nhu cầu spacing/flex/text/màu/kích thước. Chỉ định nghĩa class mới khi thật đặc biệt** (hiệu ứng/layout Vuetify không có). AI hay lạm dụng class tự chế → lãng phí, phá tính nhất quán, khó bảo trì.

### ❌ TUYỆT ĐỐI KHÔNG inject CSS bằng JavaScript

Không tạo `<style>` bằng JS rồi chèn vào `document.head` (kiểu `_injectStyle`) — đây là anti-pattern nặng (vừa lách luật no-`<style>`, vừa tạo hàng chục class tự chế):

```js
// ❌ SAI NGHIÊM TRỌNG — không bao giờ làm thế này trong .vue
methods: {
  _injectStyle: function() {
    var s = document.createElement('style')
    s.textContent = ['.smg-root{...}', '.smg-card{...}', '.smg-badge{...}', ...].join('')
    document.head.appendChild(s)   // ❌ bơm CSS + hàng loạt class tự chế
  }
}
```

`<style scoped>` trong `.vue` được phép dùng cho CSS tùy chỉnh (hiếm khi cần) — nhưng `scoped` **không có tác dụng scoping thật**: FUI chỉ nối text `ComCSS` của mọi component trong module thành MỘT stylesheet chung (`ComponentCSSBuild()`), không compile SFC, không gắn `data-v-xxxx`. Vì vậy **bắt buộc tự scope thủ công**:

1. Thẻ gốc trong `<template>` mang một class định danh duy nhất theo tên component (kebab-case) — ví dụ component `uc-invoice-list` thì thẻ gốc `class="uc-invoice-list"`.
2. MỌI selector trong `<style scoped>` phải là descendant bắt đầu từ class đó — **không viết selector trần** (`.title`, `.header`...) vì sẽ leak sang mọi component khác cùng module.

```vue
<template>
  <div class="uc-invoice-list">
    <div class="uc-invoice-list__toolbar">
      <span class="uc-invoice-list__title">{{ title }}</span>
    </div>
    <f-table class="uc-invoice-list__table" :items="rows"></f-table>
  </div>
</template>

<style scoped>
.uc-invoice-list__toolbar { display: flex; align-items: center; justify-content: space-between; }
.uc-invoice-list__title { font-weight: 600; font-size: 14px; }
.uc-invoice-list__table { margin-top: 8px; }
</style>
```

```vue
<!-- ❌ SAI — selector trần, đụng với component khác cùng module có class .title/.toolbar -->
<style scoped>
.title { font-weight: 600; }
.toolbar { display: flex; }
</style>
```

CSS toàn-module (không gắn riêng component nào) → đặt trong `style.css` (publish qua `module_publish_css`), không phải `header.html`. `header.html` vẫn hợp lệ nhưng không còn là lựa chọn duy nhất.

### Trước khi đặt một class mới → tra bộ từ vựng đã duyệt

Bảng đầy đủ class/prop Vuetify được phép dùng (spacing, flex, text, màu, bo góc, elevation,
breakpoint, kích thước) + thứ tự ưu tiên + điều kiện được định nghĩa class riêng:
→ [controls-styling-vocabulary.md](controls-styling-vocabulary.md) §3.

Bộ từ vựng đó áp dụng y nguyên trong `<template>` của `.vue` — **khác biệt duy nhất**: trong `.vue`
không có `w`/`col` của grid FUI, nên chia cột dùng `v-flex`/`v-layout` (Vuetify 1.5) trực tiếp. CSS
tùy chỉnh riêng component (nếu thật sự cần) đặt trong `<style scoped>` của chính `.vue` đó, tự scope
thủ công theo quy tắc ở mục 7 phía trên — không đặt trong `header.html` trừ khi CSS đó dùng chung
cho nhiều component/toàn module.

---

## 8. Dialog chuẩn trong Vue component (`uc-*.vue`) — TEMPLATE CHUẨN HOÁ

Dùng `v-dialog` + `v-card` với **quy ước spacing/size cố định** dưới đây cho MỌI dialog form. Chỉ dùng class tiện ích Vuetify — không tự chế class, không `style`.

```html
<v-dialog v-model="editDialog" max-width="600">
  <v-card>
    <!-- Tiêu đề: px-3 pt-2 pb-3, subtitle-1 font-weight-bold, nút X bên phải -->
    <v-card-title class="d-flex align-center px-3 pt-2 pb-3 subtitle-1 font-weight-bold">
      {{ editItem.RoundID ? 'Chỉnh sửa vòng thi' : 'Thêm vòng thi mới' }}
      <v-spacer></v-spacer>
      <v-btn icon @click="editDialog = false"><v-icon>mdi-close</v-icon></v-btn>
    </v-card-title>

    <!-- Nội dung: px-3 py-1; field dùng outlined dense hide-details, chia cột bằng v-row/v-col -->
    <v-card-text class="px-3 py-1">
      <v-row>
        <v-col cols="8">
          <v-text-field v-model="editItem.RoundName" label="Tên vòng thi"
                        hide-details outlined dense></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field v-model.number="editItem.RoundOrder" label="Thứ tự" type="number"
                        hide-details outlined dense></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Nút: pa-3, spacer đẩy sang phải, nút chính color primary elevation 0, :loading khi lưu -->
    <v-card-actions class="pa-3">
      <v-spacer></v-spacer>
      <v-btn color="primary" elevation="0" :loading="saving" @click="saveRound">Lưu</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
```

### Quy ước bắt buộc (không đổi tuỳ tiện)

| Phần | Class/prop chuẩn | Ghi chú |
|---|---|---|
| `v-dialog` | `max-width="600"` | 600 cho form thường; 400 nhỏ; 800–900 form rộng |
| `v-card-title` | `d-flex align-center px-3 pt-2 pb-3 subtitle-1 font-weight-bold` | Tiêu đề gọn + nút X (`v-btn icon` → `mdi-close`) bên phải qua `v-spacer` |
| `v-card-text` | `px-3 py-1` | Padding nội dung nhất quán |
| Field nhập | `outlined dense hide-details` | Gọn, cùng chiều cao; chia cột bằng `v-row` + `v-col cols="N"` |
| `v-card-actions` | `pa-3` + `v-spacer` trước nút | Nút chính bên phải |
| Nút chính | `color="primary" elevation="0"` + `:loading="saving"` | `elevation=0` phẳng; `:loading` khi đang gọi API |

- Tiêu đề động theo chế độ: `{{ editItem.ID ? 'Chỉnh sửa' : 'Thêm mới' }}`.
- Số nhập dùng `v-model.number` + `type="number"`.
- Đóng dialog: `@click="dialogVar = false"`; sau khi lưu thành công cũng set `false` trong callback.

### Biến thể

- **Toolbar header** (khi cần màu/icon nổi bật): thay `v-card-title` bằng `v-toolbar dense flat` + `v-toolbar-title`.
- **Fullscreen** (form lớn/nhiều vùng): `<v-dialog v-model="..." fullscreen>` + `v-toolbar` header, nội dung trong `v-container class="grid-list-md"`.

---

## 9. Thiết kế cho tái sử dụng

- Kiểm tra xem component có thể là: list, card, dialog body, filter panel, summary block, form section không
- Expose loading/empty/disabled/readonly qua props hoặc slots thay vì hardcode một workflow
- Giữ API calls, routing, permissions trong `module.json` hoặc parent — component chỉ lo presentation
- Khi module.json `controls` vượt ~200 dòng: extract UI sang Vue component, giữ module.json chỉ có data/API

---

## 10. Không nhúng `f-dialog` vào template component

`f-dialog` chỉ hoạt động khi khai báo trực tiếp trong `controls` JSON của module. Nếu cần dialog trong một `uc-*.vue`, dùng cấu trúc v-dialog ở mục 7 thay thế.

---

## 11. Giới hạn cú pháp trong `<script>` của component

### Không dùng `async / await / finally`

FUI parser không hỗ trợ các keyword này bên trong file `.vue`. Dùng callback thay thế:

```js
// ❌ SAI
async mounted() {
    const res = await fetch(url)
}

// ✅ ĐÚNG
mounted() {
    ajaxCALL(url, {}, function(res) { ... })
}
```

### Không dùng template literals (backtick) trong `<script>`

Backtick chỉ hoạt động trong `script.js` độc lập, không dùng được trong file `.vue`:

```js
// ❌ SAI — trong .vue <script>
var url = `/api/Student/${this.studentID}`

// ✅ ĐÚNG
var url = '/api/Student/' + this.studentID
```

---

## 12. Tận dụng hàm có sẵn trong `defaultfunction.js` — KHÔNG viết lại

FUI đã cung cấp sẵn nhiều hàm global. **Trước khi tự viết logic (gọi API, xác nhận, thông báo, format, group, copy...) → kiểm tra [default-function.md](default-function.md) xem đã có chưa.** Chỉ tự viết khi hàm có sẵn không đáp ứng được. Viết lại thứ đã có = lãng phí + không nhất quán.

### Gọi API — dùng `ajaxCALL` (KHÔNG `fetch`/`axios`/`$.ajax` thủ công)

`fetch` bị lỗi CORS/credentials sang domain khác. `ajaxCALL` tự xử lý credentials, token (Bearer), và base domain (`v_Set.apiDomain`) — không cần ghép domain.

```js
// ❌ SAI
fetch(url, { method: 'POST', body: JSON.stringify(data) })
    .then(r => r.json()).then(res => { ... })

// ✅ ĐÚNG — ajaxCALL(URL, DATA, successCb, errorCb, header)
ajaxCALL('spAPI_RoundList', { ContestID: this.contestID }, function(res) {
    // res đã parse JSON (json_data tự parse)
}, function(err) {
    // tuỳ chọn — mặc định ajaxCALL đã showMessage lỗi
})
```

### Xác nhận — dùng `confirm` (KHÔNG `window.confirm`)

```js
confirm({
    title: 'Xác nhận xoá',
    message: 'Bạn có chắc muốn xoá vòng thi này?',
    action: function() { ajaxCALL('spAPI_RoundDelete', { RoundID: id }, function(){ ... }); }
});
```

### Thông báo — dùng `showMessage` hoặc `Vue.$toast`

```js
showMessage({ title: 'Đã lưu thành công' });              // hộp thoại
showMessage({ title: 'Lỗi', message: '...', type: 'red' });
Vue.$toast.success('Đã lưu', { position: 'top' });         // toast góc màn hình
```

### Các hàm hay dùng khác (đừng viết lại)

`groupBy` · `findInArray` · `jsonToExcel` (xuất Excel) · `printPDF` · `copyToClipboard` · `openWindow` · `pushRouter` · `rightTest` (kiểm tra quyền) · `generateID` · `capacityText` · `buildHeader` (tự sinh headers f-table). Chi tiết: [default-function.md](default-function.md).

> Thư viện toàn cục cũng có sẵn — dùng thay vì tự cài: `_` (Lodash: `_.groupBy`, `_.sumBy`, `_.cloneDeep`...), `moment` (ngày giờ), `numeral` (format số). Không thêm CDN cho các thư viện này.

---

## 13. Kiểm chứng component — `component_preview` TRƯỚC khi ráp vào module

Một `uc-*.vue` là đơn vị đầy đủ (template + script + style) nhưng nếu chỉ nhìn thấy nó sau khi đã ráp vào module thì lỗi của component và lỗi lắp ráp trộn lẫn — mất thời gian khoanh vùng. `component_preview` render **đúng một component** trên một trang riêng, bằng file `.vue` **local** (chưa cần push), với dữ liệu mẫu bạn truyền thẳng trong tham số.

```
component_preview({
  componentName: "uc-invoice-list",
  projectId: "...",              // chỉ projectId → project-scope
  // moduleId: "..."             // có moduleId → module-scope (suy luận y hệt component_new/component_update)
  cases: [
    { name: "danh sách rỗng",  props: { items: [] } },
    { name: "có dữ liệu",      props: { items: [ {...}, {...} ], title: "Hoá đơn" } },
    { name: "click chọn dòng", props: { items: [...] },
      scenario: [ { click: "Xem" }, { assert: "vueData.selected != null" } ] }
  ],
  devices: ["desktop", "mobile"]   // mặc định
})
```

- **Props**: mảng/object cứ truyền **giá trị thật** — tool tự đẩy vào `data[]` và bind `:prop`. Chuỗi thành attr tĩnh; key đã bắt đầu bằng `:`/`v-` giữ nguyên văn (dùng `v-on:`/`v-slot:`, **không** `@`/`#`).
- **`cases × devices` ≤ 8**. Mỗi lần render là một phiên browser thật.
- `slot` (nội dung `innerHTML`), `vueData`, `apiMocks`, `user` (test permission gate), `viewport` (ép chiều cao thấp để lộ component tự đo chiều cao) đều truyền được.
- `scenario` dùng **đúng grammar renderUI trên DOM thật**: `set`/`click`/`call`/`exe`/`assert`, chọn dòng bằng `nth` (không có `item`/`index`).
- **`style.css` của module KHÔNG được nạp** — đó chính là ý nghĩa "không gian riêng": component phải tự đứng được bằng `<style>` của chính nó + theme project.
- Trả về: ảnh chụp (tối đa 4 inline, còn lại ghi đường dẫn) + JS error + `[Vue warn]` + DOM audit. **Đọc ảnh rồi tự sửa** trước khi push.

### Component cấp project: BẮT BUỘC push trước khi render module dùng nó

`module_simulate({ renderUI: true })` dựng tầng project bằng bundle **tải từ server**. Bản local chưa push sẽ **không xuất hiện** — ảnh render là bản cũ trên server, tức ảnh nói dối. Vì vậy renderUI **chặn cứng** (không có cờ bỏ qua) khi component cấp project ở local lệch với bundle server.

```
sửa uc-*.vue cấp project
  → component_preview   (kiểm chứng bản local, chưa push)
  → component_new       (lần đầu) hoặc component_update (các lần sau) — push lên server
  → module_simulate({ renderUI: true })   ← chỉ chạy được sau khi đã push
```

Nếu bị chặn mà **bản trên server mới hơn** (ai đó vừa sửa trên web IDE): chạy `project_sync` để lấy về, **đừng push đè** — sẽ mất bài của người khác.

Component **cấp module** không bị luật này: renderUI dựng tầng module từ file local nên sửa tới đâu render thấy tới đó.
