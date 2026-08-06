# FUI UI Patterns — Real-World Design Reference (Core)

> File này sở hữu: **pattern UI cốt lõi: toolbar/filter, permission gate, checklist thiết kế giao diện**. Bảng/dialog/cross-window/layout đã tách sang các file `ui-*` riêng.

Các pattern được rút ra từ project **security-manager** — dùng làm tham chiếu khi thiết kế module mới.

File này chứa **core patterns** (data/watch/toolbar/action). Các nhóm pattern chuyên sâu đã tách ra — load thêm khi cần:

| Cần làm | File |
|---|---|
| f-table + điều khiển trong ô (t-check/t-button/t-select/t-menu, ctrl-update, chip-group) | [ui-table-cell-patterns.md](ui-table-cell-patterns.md) |
| Dialog/form popup (hidden-container, mở dialog với row, checkbox-list) | [ui-dialog-patterns.md](ui-dialog-patterns.md) |
| Mở sub-window & trao đổi dữ liệu (`openWindow`, `#PARENT`/`#Win`) | [ui-crosswindow-patterns.md](ui-crosswindow-patterns.md) |
| Layout (page-container, master-detail, v-switch, date init, dynamic label) | [ui-layout-patterns.md](ui-layout-patterns.md) |

---

## 1. Cấu trúc `data[]` trong module.json

`data` là mảng khởi tạo state + action. FUI xử lý tuần tự từ trên xuống dưới.

**Quy ước tổ chức:**
- Object **không có key action** (không có API, CALL, IF…) → khởi tạo state
- Object **có key là tên hàm** → định nghĩa named action (tái sử dụng)
- Object dạng `{ "API": ..., "OUT": ... }` hoặc `{ "CALL": ... }` ở cuối → tự chạy khi load xong

```json
"data": [
  {
    "dsUser": [],
    "dsGroup": [],
    "sDepartment": null,
    "dlUserInfo": false
  },
  {
    "getDepartment": { "API": "SM_DepartmentSelectAll", "OUT": "dsDepartment" },
    "getGroup":      { "API": "SM_Group_SelectAll",    "OUT": "dsGroup" },
    "getUser": {
      "API": "SM_Users_SelectByDepGroup",
      "IN": { "GroupID": "sGroup", "DepartmentID": "sDepartment" },
      "OUT": "dsUser"
    }
  },
  { "CALL": "getDepartment" },
  { "CALL": "getGroup" }
]
```

> **Auto-startup**: CALL ở cuối `data[]` sẽ tự chạy khi module load — không cần event handler riêng.

---

## 2. Cascading API Init

Dùng `CALLBACK` để set giá trị từ kết quả API đầu tiên, rồi API tiếp theo tự chạy qua `watch`.

```json
"data": [
  { "dsModule": [], "sModuleID": null },
  {
    "API": "/SM_Modules_SelectAll",
    "OUT": "dsModule",
    "CALLBACK": { "sModuleID": "dsModule[0].ModuleID" }
  }
],
"watch": {
  "sModuleID": { "CALL": "getFunctionRight" }
}
```

> `sModuleID` được set từ CALLBACK → watch tự kích hoạt `getFunctionRight`. Không cần gọi thủ công.

---

## 3. Watch — Cascading Filter

Khi filter thay đổi → tự reload data. Nhiều watch → mảng CALL.

```json
"watch": {
  "sDepartment": { "CALL": "getUser" },
  "sGroup":      { "CALL": "getUser" },
  "sModuleID": [
    { "CALL": "getUserModule" },
    { "CALL": "getSysRight" },
    { "CALL": "getFunctionRight" }
  ]
}
```

---

## 4. Toolbar / Filter Row Pattern

Row chứa filter fields và action buttons. Dùng `shrink` + `flex-md-grow-0` để giữ width cố định, `v-spacer` đẩy buttons về phải.

```json
{
  "prop": "",
  "cols": [
    {
      "el": "v-autocomplete",
      "col": { "shrink": "true", "class": "shrink" },
      "attr": {
        "class": "flex-md-grow-0",
        "style": "width:200px",
        "v-model": "sGroup",
        "label": "Group",
        ":items": "dsGroup",
        "item-text": "GroupName",
        "item-value": "GroupID",
        ":required": false
      },
      "w": "200"
    },
    {
      "el": "v-text-field",
      "col": { "shrink": "true", "class": "shrink" },
      "attr": {
        "class": "flex-md-grow-0",
        "style": "width:200px",
        "v-model": "UserID",
        "label": "User ID",
        "clearable": ""
      },
      "w": "200"
    },
    {
      "el": "f-button",
      "col": { "shrink": true },
      "attr": {
        ":checkvalid": false,
        "color": "primary",
        "label": "Tìm",
        "icon-text": "mdi-magnify",
        ":action": { "CALL": "getUser" }
      }
    },
    { "el": "v-spacer", "attr": {} },
    {
      "el": "f-button",
      "col": { "v-if": "vueData.user.SystemRight==9", "shrink": true },
      "attr": {
        ":checkvalid": false,
        ":disabled": "!sGroup",
        "color": "primary",
        "label": "Add User",
        "icon-text": "mdi-account-multiple-plus",
        ":action": [
          { "addNew": 1, "sUserID": "", "sUserName": "" },
          { "dlUserInfo": true }
        ]
      }
    }
  ]
}
```

**Quy tắc:**
- Filter fields: `col: { shrink: "true", class: "shrink" }` + `attr: { class: "flex-md-grow-0", style: "width:Xpx" }`
- Nút tìm: ngay sau fields, `col: { shrink: true }`
- `v-spacer`: tách filter bên trái với buttons bên phải
- Nút Add/Delete admin: sau spacer, thêm `v-if` permission

---

## 5. Permission Gating

Ẩn/hiện phần tử theo `SystemRight` của user.

```json
"col": { "v-if": "vueData.user.SystemRight>1" }
"col": { "v-if": "vueData.user.SystemRight==9" }
```

- `>1` — visible với mọi user có quyền (không phải level thấp nhất)
- `==9` — chỉ admin cao nhất mới thấy

---

## 6. IF/THEN/ELSE — Conditional Action

Rẽ nhánh logic trong action hoặc CALLBACK.

```json
{
  "IF": "TypeLoad==1",
  "THEN": { "CALL": "getComputer" },
  "ELSE": {
    "IF": "TypeLoad==2",
    "THEN": { "CALL": "getComputerDinied" },
    "ELSE": { "CALL": "getComputerNotVisited" }
  }
}
```

- Condition: JavaScript expression dùng vueData fields trực tiếp (không cần `vueData.`)
- Dùng nested IF/ELSE cho switch-case nhiều nhánh

**Ứng dụng thực tế:** Module có nhiều chế độ xem (`TypeLoad`) — sau khi update, refresh đúng danh sách đang hiển thị.

```json
"data": [
  { "TypeLoad": 1 }
]
```

---

## 7. CALLBACK Chaining

CALLBACK là array → thực thi tuần tự.

```json
"CALLBACK": [
  { "MESS": "Cập nhật thành công." },
  { "dlUserInfo": false },
  { "CALL": "getUser" }
]
```

```json
"CALLBACK": [
  { "CALL": "getUserModule" },
  { "sUserDeptSelected": [], "dlAddUser": false },
  { "MESS": "Thêm user thành công." }
]
```

**Thứ tự thông dụng:** reload data → reset state → hiển thị message.

---

## 8. set — Cấu hình Module Level

`set` ở root module.json — cấu hình behavior của toàn module.

```json
"set": {
  "menu": false
}
```

- `menu: false` — ẩn menu navigation (dùng cho sub-window, log viewer)

> Module mở qua `openWindow`: khai báo `"set": { "menu": false }` trong module.json của module con —
> **không** truyền `?menu=0` trong URL. Pattern đầy đủ (kể cả cách set động từ `data[]`):
> [ui-crosswindow-patterns.md](ui-crosswindow-patterns.md).

---

## 9. CALLBACK với JavaScript Expression

Dùng `{{ expression }}` trong CALLBACK để chạy code phức tạp sau API.

```json
"CALLBACK": "{{ _.forEach(dsUsers, (x)=> x.FunctionName = JSON.parse(x.FunctionName)) }}"
```

```json
"CALLBACK": "{{ _.forEach(dsUserFunction, (x)=> x.FunctionName = JSON.parse(x.FunctionName)), _.forEach(dsUserFunction, (x)=> x.UserSysItem = JSON.parse(x.UserSysItem)) }}"
```

> Dùng khi API trả về JSON string cần parse thành object/array trước khi render.

---

## 10. script.js — Helper Functions

`script.js` chứa helper functions gọi từ `v-on:click` hoặc action.

```javascript
// script.js
function setFunction(user, fc) {
    vueData.sFunctionSelected = [];
    vueData.sUserSelected = [];
    vueData.sUserSelected.push(user);
    if (!fc) return;
    vueData.dsFunctionRight.map((item) => {
        if (fc.some(fci => fci.FunctionID == item.FunctionID)) {
            vueData.sFunctionSelected.push(item.FunctionID.toString());
        }
    });
}
```

Gọi từ `v-on:click` trong header:
```json
"v-on:click": "vueData.dlFunction = true; CALL(setFunction(item, item.FunctionName));"
```

> Functions trong `script.js` có thể access `vueData` trực tiếp. Dùng để xử lý logic phức tạp không thể làm bằng action JSON thuần.

---

## Checklist Thiết Kế UI

> Checklist cấu trúc `module.json` (thứ tự `data[]`, grid wrapper, `w`, `v-on:`, `set`, JSON hợp lệ)
> nằm ở [module-json-anatomy.md](module-json-anatomy.md#checklist-khi-viết-modulejson) — dưới đây chỉ
> là phần riêng của thiết kế giao diện.

1. **Toolbar row**: shrink filters + v-spacer + permission-gated buttons
2. **f-table**: fixed-header, item-class cho row highlight, item-key đúng — xem [ui-table-cell-patterns.md](ui-table-cell-patterns.md)
3. **Dialogs**: luôn trong hidden-container, v-card[padding:0] + v-toolbar[dense flat] — xem [ui-dialog-patterns.md](ui-dialog-patterns.md)
4. **menuChucNang**: định nghĩa trong data[], ref bằng t-menu trong headers — xem [ui-table-cell-patterns.md](ui-table-cell-patterns.md)
5. **ctrl-update**: cho CRUD đơn giản, dialog thủ công cho form phức tạp
6. **CALLBACK**: chaining array — reload → reset state → MESS
7. **#PARENT**: set ngay đầu data[] trước các CALL startup — xem [ui-crosswindow-patterns.md](ui-crosswindow-patterns.md)
8. **Permission**: `v-if: "vueData.user.SystemRight>1"` cho admin-only sections
