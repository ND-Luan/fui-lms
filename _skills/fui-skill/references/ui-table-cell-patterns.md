# FUI Table Cell Patterns — f-table & in-cell controls

> File này sở hữu: **điều khiển trong ô `f-table` (`t-*`), `ctrl-update`, show-select, chip-group, chọn `t-button` vs `t-menu`**. Props bảng xem [component-table.md](component-table.md).

Các pattern cho `f-table` và điều khiển ngay trong ô bảng (`t-check`, `t-button`, `t-select`, `t-menu`, `ctrl-update`, `show-select`, `v-chip-group`). Rút ra từ project **security-manager**.

> Xem thêm: [ui-patterns.md](ui-patterns.md) (data/watch/toolbar), [ui-dialog-patterns.md](ui-dialog-patterns.md), [component-table.md](component-table.md).

---

## 1. f-table Cơ Bản với Fixed Header

```json
{
  "el": "f-table",
  "attr": {
    "label": "User list",
    ":items-per-page": 50,
    ":height": -16,
    ":items": "dsUser",
    "item-key": "UserID",
    ":hide-default-footer": false,
    ":item-class": "item => item.ChuaKichHoat>0 ? 'danger' : ''",
    ":headers": [
      { "align": "center", "text": "UserID", "value": "UserID" },
      { "text": "Username",  "value": "UserName" },
      { "text": "Fullname",  "value": "FullName" }
    ]
  },
  "w": 12
}
```

**Kỹ thuật:**
- **QUY TẮC chiều cao bảng (lint D9)**: bảng data chính của module khai `":height": -16` — f-table tự **đo vị trí thật** của bảng sau khi layout (`getBoundingClientRect().top`) rồi fill tới đáy màn hình chừa 16px, và tự bật `fixed-header`. Cuộn data chỉ cuộn **trong bảng**, header không trôi, trang không có 2 thanh cuộn lồng nhau. Tự cập nhật khi resize cửa sổ và khi `items` đổi.

  | `:height` | Hành vi |
  |---|---|
  | *(bỏ trống)* | Tự giãn theo số dòng — bảng ngắn/lookup chủ ý; bảng chính thì sai (cả trang sẽ cuộn) |
  | `<= 0` | Fill tới đáy, chừa `abs(height)` px — **chuẩn cho bảng chính** |
  | `> 0` | px cố định — **bảng trong dialog** (vd `":height": 360`) |

  Cùng ba chế độ này áp cho `f-sheet` — xem [fsheet.md](fsheet.md) §Chiều cao.

  ⚠ Pattern cũ `":height": "$( window ).height()-285"` **không dùng nữa** — nó bắt bạn tự đoán tổng chiều cao toolbar/filter/menu, sai là hụt hoặc tràn. Biểu thức trả số **dương** nên vẫn chạy như px cố định (không vỡ), nhưng mất khả năng tự đo; lint D9 cảnh báo để bạn thay bằng `-16`.
- `:item-class`: highlight row theo điều kiện — `"item => item.Active==0 ? 'danger' : ''"`

---

## 2. t-check — Toggle trong Table Cell

Dùng trong `headers` để render checkbox/icon toggle, kích hoạt API khi click.

```json
{
  "text": "Active",
  "value": "Enable",
  "align": "center",
  "el": "t-check",
  "attr": {
    "on-icon": "mdi-check",
    "off-icon": "mdi-lock",
    ":action": [
      { "API": "/SM_Users_SetActive", "IN": { "UserID": "item.UserID" } },
      { "dsUser": [] },
      { "CALL": "getUser" }
    ]
  }
}
```

---

## 3. t-button — Button trong Table Cell

Dùng khi cần button/icon với action trong cell. Hỗ trợ icon động.

```json
{
  "text": "Allow",
  "value": "Locked",
  "align": "center",
  "el": "t-button",
  "attr": {
    "color": "primary",
    ":outlined": false,
    ":icon-text": "`${ item.Locked==0 ? 'mdi-check-bold':'mdi-lock'}`",
    ":action": [
      { "API": "/SM_Computer_SetLocked", "IN": { "ComputerID": "item.ComputerID" } },
      { "dsComputer": [] },
      { "CALL": "getComputer" }
    ]
  }
}
```

---

## 4. t-select — Dropdown Inline trong Table Cell

Dùng để edit field ngay trong bảng, trigger API khi chọn.

```json
{
  "text": "SystemRight",
  "value": "SysRight",
  "el": "t-select",
  "width": "250px",
  "attr": {
    "class": "flex-md-grow-0 my-2",
    ":items": "vueData.dsSystemRight",
    "item-text": "Note",
    "item-value": "SysRight",
    ":action": [
      {
        "CONFIRM": "Bạn có chắc cập nhật System Right cho user này không?",
        "API": "/SM_UserModule_UpdateSystemRight",
        "IN": {
          "ModuleID": "sModuleID",
          "UserID": "item.UserID",
          "SysRight": "item.SysRight"
        },
        "CALLBACK": { "MESS": "Cập nhật thành công." }
      }
    ]
  }
}
```

---

## 5. t-menu — Context Menu trong Table (menuChucNang Pattern)

Định nghĩa menu items trong `data[]`, ref qua `t-menu` trong headers.

**Bước 1 — Định nghĩa `menuChucNang` trong `data[]`:**

```json
{
  "menuChucNang": [
    {
      "color": "primary",
      "icon-text": "mdi-account-details",
      "text": "Update Info",
      "action": [
        {
          "addNew": 0,
          "dongChon": "item",
          "sUserID":    "item.UserID",
          "sUserName":  "item.UserName",
          "sLastName":  "item.LastName",
          "sFirstName": "item.FirstName"
        },
        { "dlUserInfo": true }
      ]
    },
    {
      "color": "primary",
      "icon-text": "mdi-shield-account-outline",
      "text": "User Permission",
      "action": [
        {
          "dongChon":   "item",
          "sUserID":    "item.UserID",
          "sFullName":  "item.FullName"
        },
        {
          "FUN": "openWindow",
          "IN": {
            "id":    "`WinPer",
            "title": "`User Permission",
            "url":   "`/UserPermission"
          }
        }
      ]
    }
  ]
}
```

**Bước 2 — Dùng `t-menu` trong `headers`:**

```json
{
  "el": "t-menu",
  "width": "120px",
  "align": "center",
  "text": "Update",
  "value": "Update",
  "attr": { ":items": "vueData.menuChucNang" }
}
```

**Pattern xử lý:**
- `"dongChon": "item"` — lưu bản ghi hiện tại vào `dongChon`
- Các field khác `"sUserID": "item.UserID"` — copy field từ item vào state
- `{ "dlXxx": true }` — mở dialog sau khi state đã sẵn sàng

---

## 6. ctrl-update CRUD Pattern

CRUD trực tiếp trong bảng — không cần viết dialog thủ công.

```json
{
  "el": "f-table",
  "attr": {
    ":items": "dsFunctionRight",
    "item-key": "FunctionID",
    ":headers": [
      { "text": "Code",   "value": "FunctionCode" },
      { "text": "Name",   "value": "FunctionName" },
      { "text": "Update", "value": "ctrl-update" }
    ],
    ":update-form": [
      {
        "el": "v-text-field", "w": 12,
        "attr": { "v-model": "FunctionCode", "label": "Function Code", ":required": true }
      },
      {
        "el": "v-text-field", "w": 12,
        "attr": { "v-model": "FunctionName", "label": "Function Name" }
      }
    ],
    ":update-api": {
      "new": {
        "API": "/SM_Function_Insert",
        "IN": { "ModuleID": "sModuleID", "FunctionCode": "item.FunctionCode", "FunctionName": "item.FunctionName" },
        "CALLBACK": { "CALL": "getFunctionRight" }
      },
      "edit": {
        "API": "/SM_Function_Update",
        "IN": { "FunctionID": "item.FunctionID", "FunctionCode": "item.FunctionCode", "FunctionName": "item.FunctionName" },
        "CALLBACK": { "CALL": "getFunctionRight" }
      },
      "delete": {
        "CONFIRM": "Bạn có chắc muốn xóa quyền này không?",
        "API": "/SM_Function_Delete",
        "IN": { "FunctionID": "item.FunctionID" },
        "CALLBACK": [
          { "MESS": "Xóa thành công" },
          { "CALL": "getFunctionRight" }
        ]
      }
    }
  }
}
```

**Khi nào dùng ctrl-update:** Khi form edit đơn giản (2-5 fields) và không cần layout phức tạp.

---

## 7. f-table với show-select (Multi-select)

```json
{
  "el": "f-table",
  "attr": {
    ":show-select": true,
    "v-model": "sUserSelected",
    ":items": "dsUsers",
    "item-key": "UserID",
    ":items-per-page": -1,
    ":hide-default-footer": true,
    ":update-api": { "default-item": { "xAA": [] } },
    ":headers": [...]
  }
}
```

- `v-model`: nhận array các item được chọn
- `:update-api.default-item`: inject default field vào mỗi item khi load (ở đây `xAA: []` cho chip-group)

---

## 8. v-chip-group trong Table Cell

Hiển thị danh sách tags trong cell, click để mở dialog.

```json
{
  "text": "FunctionRight",
  "value": "FunctionName",
  "el": "v-chip-group",
  "attr": {
    "v-model": "item.xAA",
    "column": true,
    "v-if": "item.FunctionName"
  },
  "innerHTML": [
    {
      "el": "v-chip",
      "attr": {
        ":small": true,
        "color": "primary",
        "outlined": "",
        "v-for": "fn in item.FunctionName",
        ":key": "fn",
        "v-on:click": "vueData.dlFunction = true; CALL(setFunction(item, item.FunctionName));"
      },
      "innerHTML": "<div>{{fn.FunctionCode}}-{{fn.FunctionName}}</div>"
    }
  ]
}
```

---

## Khi nào dùng `t-button` vs `t-menu`

- **`t-button`**: hành động duy nhất là xem/load dữ liệu liên quan → 1 click trực tiếp
- **`t-menu`**: có nhiều hành động **hoặc** hành động thay đổi trạng thái (Kích hoạt, Chốt điểm, Xóa...)

> Không bọc "Xem chi tiết" trong `t-menu` — thêm 1 click thừa. Dùng `t-button` thay. Xem thêm Master-Detail trong [ui-layout-patterns.md](ui-layout-patterns.md).
