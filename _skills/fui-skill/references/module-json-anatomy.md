# module.json Anatomy — 4 thành phần: data · watch · controls · set

> File này sở hữu: **4 thành phần `module.json` (data/watch/controls/set) — vai trò và cách chúng tương tác, checklist cấu trúc**. Cú pháp action/control chi tiết xem [controls-patterns.md](controls-patterns.md).

`module.json` mô tả một trang FUI. Nó có đúng **4 khối cấp 1**. File này giải thích *vai trò, cách cấu hình, tác động* và *tương tác* giữa chúng, rồi trỏ tới file chuyên sâu cho từng loại pattern.

> Cơ chế nền tảng (runtime đọc module.json thế nào): [platform-architecture.md](platform-architecture.md). Pattern UI thực tế (ưu tiên cao, đã tinh chỉnh qua thực chiến): [ui-patterns.md](ui-patterns.md).

```json
{
  "data":     [ /* state + action */ ],
  "watch":    { /* observer → action */ },
  "controls": [ /* layout UI: container > rows > cols */ ],
  "set":      { /* override config trang (tùy chọn) */ }
}
```

Runtime chạy: `runAction(data)` → `buildModuleUI(controls)` → gắn `watch` → merge `set` vào config trang. Tất cả state sống trong `vueData`.

---

## 1. `data` — Mảng khởi tạo state + định nghĩa Action

**Là gì:** một **mảng**. FUI xử lý tuần tự từ trên xuống khi trang load.

**Ba loại phần tử trong `data[]`:**

| Loại object | Nhận biết | Tác động |
|---|---|---|
| Khởi tạo state | Không có key action (`API`/`CALL`/`IF`...) | Tạo biến reactive trong `vueData` |
| Named action | Key là tên hàm, value là object action | Định nghĩa action tái sử dụng (gọi qua `CALL`) |
| Auto-startup | `{ "API": ... }` hoặc `{ "CALL": ... }` đứng riêng | **Tự chạy** ngay khi load |

```json
"data": [
  { "dsUser": [], "sGroup": null, "dlUserInfo": false },
  {
    "getUser": { "API": "SM_Users_SelectByDepGroup", "IN": { "GroupID": "sGroup" }, "OUT": "dsUser" }
  },
  { "CALL": "getUser" }
]
```

**Tác động:** mọi biến khai báo ở đây thành reactive state; action đặt tên ở đây gọi được từ `watch`, `controls`, hay action khác. Auto-startup ở cuối = dữ liệu ban đầu của trang.

**Chi tiết:** khai báo `data[]` + value resolution (chuỗi/biến/backtick/`{{ }}`/deep key, action tự chạy, named action, `v_old`) → **[module-data-patterns.md](module-data-patterns.md)**; engine action → [controls-patterns.md](controls-patterns.md); tổ chức data thực tế → [ui-patterns.md](ui-patterns.md) §1–2.

---

## 2. `watch` — Observer: state đổi → chạy action

**Là gì:** một **object** `{ "tênBiến": action }`. Khi biến đổi giá trị, action chạy.

```json
"watch": {
  "sGroup":      { "CALL": "getUser" },
  "sDepartment": { "CALL": "getUser" },
  "sModuleID":   [ { "CALL": "getSysRight" }, { "CALL": "getFunctionRight" } ]
}
```

**Tác động & mẫu dùng:**
- **Cascading filter**: mỗi dropdown lọc có một watch → tự reload bảng khi đổi.
- Nhiều action cho một biến → dùng **mảng**.
- **`deep-watch`**: theo dõi thay đổi sâu bên trong object/array (runtime hỗ trợ key `deep-watch`).

**Chi tiết:** [watcher-patterns.md](watcher-patterns.md) (v_old, deep-watch, cascading), [ui-patterns.md](ui-patterns.md) §3.

---

## 3. `controls` — Layout UI (bắt buộc grid container > rows > cols)

**Là gì:** một **mảng** container. Runtime dựng: `container (v-container)` → `rows (v-layout)` → `cols` → mỗi phần tử là một **Control Object**.

```json
"controls": [
  {
    "prop": "fluid grid-list-md",
    "rows": [
      { "prop": "row", "cols": [ /* Control Objects */ ] }
    ]
  }
]
```

**Control Object** — các key chính:

| Key | Vai trò |
|---|---|
| `el` | Tag/component: `div`, `v-*` (Vuetify), `f-*`/`t-*` (FUI), `uc-*` (custom) |
| `attr` | Thuộc tính/directive (`class`, `style`, `v-model`, `v-on:click`) — **dùng `v-on:click`, KHÔNG `@click`** |
| `w` | Bề rộng cột: `1–12` (grid) hoặc số px (`>12`). Bắt buộc cho item trong `cols` |
| `col` | Cấu hình cột grid bao ngoài (`class`, `style`, `shrink`, `v-if`) |
| `innerHTML` | Nội dung: string (hỗ trợ `{{ }}`) hoặc mảng Control Object lồng nhau |

**Tác động:** đây là toàn bộ giao diện trang. Quy tắc bắt buộc: luôn bắt đầu bằng grid wrapper; dùng `innerHTML` (mảng) để lồng, không dùng `children`; dialog đặt trong container `prop: "hidden-container"`.

**Chi tiết:** cấu trúc & grid → [controls-patterns.md](controls-patterns.md) §6; **class/prop/style được dùng (đừng tự thêm style)** → [controls-styling-vocabulary.md](controls-styling-vocabulary.md); chọn component → [component-quickref.md](component-quickref.md); pattern layout/table/dialog → [ui-patterns.md](ui-patterns.md), [ui-table-cell-patterns.md](ui-table-cell-patterns.md), [ui-dialog-patterns.md](ui-dialog-patterns.md), [ui-layout-patterns.md](ui-layout-patterns.md).

---

## 4. `set` — Override config cho riêng trang (tùy chọn)

**Là gì:** một **object** override config cấp project cho trang này. Runtime trộn `project.json` rồi `set` (module thắng) — xem [platform-architecture.md](platform-architecture.md) §2.1.

```json
"set": {
  "title": "Quản lý sinh viên",
  "menu": false
}
```

**Tác động:** chỉ khai báo field khác với project. Thường dùng: `title` (tiêu đề trang), `menu: false` (ẩn header — sub-window/landing), `menuLeft` (sidebar riêng), `apiDomain` (đổi backend trang đó). Trang bình thường **không cần `set`** (kế thừa hết project).

**Chi tiết & danh mục thuộc tính đầy đủ:** [project-config.md](project-config.md).

---

## Tương tác giữa 4 thành phần

```
URL ?param  ──►  vueData[param]         (inject trước khi data chạy)
data[]      ──►  tạo state + action, auto-startup fetch
controls    ──►  bind hai chiều vào state (v-model), gọi action (:action / v-on)
watch       ──►  state đổi → chạy action → cập nhật state khác → UI re-render
set         ──►  quyết định khung trang (title/menu/apiDomain) bao quanh controls
```

Vòng lặp điển hình: user thao tác trên `controls` → đổi state → `watch` bắt → gọi `API` action trong `data` → `OUT` cập nhật state → `controls` render lại.

## Checklist khi viết module.json

1. `data[]`: state trước → named action → `{ "CALL": ... }` auto-startup cuối
2. `watch`: mọi filter/dropdown đều có watch → reload
3. `controls`: bắt đầu bằng grid wrapper; `w` cho mọi item; dialog trong `hidden-container`; `v-on:click` không `@click`
4. `set`: chỉ khai báo khi trang khác project default
5. Tham chiếu state bằng `vueData.` trong controls/attr; JSON hợp lệ (không trailing comma)
