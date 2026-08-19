# FUI Layout Patterns — page-container, master-detail, switch, dynamic label

> File này sở hữu: **pattern layout trang: page-container sticky, master-detail 2 cột, v-switch, date init, dynamic label**.

Các pattern layout và điều khiển bổ trợ. Rút ra từ project **security-manager**.

> Xem thêm: [ui-patterns.md](ui-patterns.md), [ui-table-cell-patterns.md](ui-table-cell-patterns.md), [module-structure.md](module-structure.md).

---

## 1. Khởi tạo Date với moment()

```json
"data": [
  {
    "TuNgay":  "moment().format('YYYY-MM-DD')",
    "DenNgay": "moment().format('YYYY-MM-DD')"
  }
]
```

> Giá trị là JS expression string — FUI sẽ eval nó khi khởi tạo. `moment()` có sẵn trong FUI runtime.

---

## 2. page-container + page-navigation Layout

Dùng khi cần filter bar cố định phía trên, nội dung bên dưới scroll.

```json
{
  "prop": "page-container grid-list-md fluid",
  "rows": [
    {
      "prop": "page-navigation",
      "cols": [
        { "el": "f-date", "attr": { "v-model": "TuNgay", "label": "Từ ngày", "date-add": 0 }, "w": "2" },
        { "el": "f-date", "attr": { "v-model": "DenNgay", "label": "Tới ngày", "date-add": 0 }, "w": "2" },
        {
          "el": "f-button",
          "attr": { "color": "primary", "icon-text": "mdi-filter", "label": "Tìm", ":action": { "CALL": "getLogData" } },
          "w": 3
        }
      ]
    },
    {
      "prop": "",
      "cols": [
        { "el": "f-table", "attr": { "label": "Log viewer", ":items": "LogData" } }
      ]
    }
  ]
}
```

- `page-container` + `page-navigation` → filter bar sticky top
- `f-table` không khai `:update-api` → readonly view; không truyền `:headers` → tự build header từ data

---

## 3. Dynamic Label từ State

Dùng `:label` với expression để hiển thị thông tin context.

```json
{
  "el": "f-title",
  "attr": {
    ":label": "sFullName + ` - ` + sDepartment"
  }
}
```

```json
{
  "el": "f-table",
  "attr": {
    ":label": "`${fTableTitle==''? 'Computer list' : fTableTitle}`"
  }
}
```

---

## 4. v-switch — Toggle với Label

```json
{
  "el": "v-layout",
  "attr": {},
  "innerHTML": [
    {
      "el": "v-switch",
      "attr": {
        "v-model": "switchResetPassword",
        ":required": false,
        "label": "Đặt lại mật khẩu"
      },
      "w": "12"
    }
  ]
}
```

Dùng với `v-if` để hiện/ẩn field bổ sung:
```json
{
  "el": "v-layout",
  "attr": { "v-if": "switchResetPassword" },
  "innerHTML": [...]
}
```

---

## 5. Master-Detail 2 Cột

Pattern layout cha-con: bảng trái chọn row → watch → load bảng phải. Không cần mở window mới.

> Nút mở detail đặt trong ô bảng: chọn `t-button` hay `t-menu` theo quy tắc ở
> [ui-table-cell-patterns.md](ui-table-cell-patterns.md#khi-nào-dùng-t-button-vs-t-menu) — với
> master-detail thì hành động là "xem/load dữ liệu liên quan" nên dùng `t-button`.

**`data[]` và watch:**

```json
"data": [
  { "dsParent": [], "dsDetail": [], "selectedId": null },
  {
    "getParent": { "API": "/SM_Parent_Select", "OUT": "dsParent" },
    "getDetail": {
      "API": "/SM_Detail_Select",
      "IN": { "ParentID": "selectedId" },
      "OUT": "dsDetail"
    }
  },
  { "CALL": "getParent" }
],
"watch": {
  "selectedId": { "CALL": "getDetail" }
}
```

**Cột `t-button` trong bảng trái:**

```json
{
  "text": "Chi tiết",
  "value": "ParentID",
  "align": "center",
  "el": "t-button",
  "attr": {
    "icon-text": "mdi-eye",
    "color": "primary",
    ":outlined": true,
    ":action": { "selectedId": "item.ParentID" }
  }
}
```

**Layout 2 cột:**

```json
{
  "prop": "fluid grid-list-md",
  "rows": [
    {
      "prop": "row wrap",
      "cols": [
        { "w": 5, "el": "f-table", "attr": { ":items": "dsParent", "item-key": "ParentID", ":headers": [...] } },
        { "w": 7, "el": "f-table", "attr": { ":items": "dsDetail", "item-key": "DetailID", ":headers": [...] } }
      ]
    }
  ]
}
```
