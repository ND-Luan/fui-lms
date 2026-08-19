# FUI Dialog Patterns — v-dialog thủ công (CHUẨN), hidden-container, checkbox-list

> File này sở hữu: **dialog thủ công: `hidden-container`, anatomy `v-card`/`v-toolbar`, mở dialog kèm row, checkbox-list**. `f-dialog` xem [components-dialog.md](components-dialog.md).

Các pattern dialog/form popup trong FUI. Rút ra từ **security-manager** và demo **ex-v3-dialog**.

> **CHUẨN thiết kế dialog: dựng `v-dialog` thủ công theo anatomy trong mục 1** (dễ đọc/chỉnh sửa từng phần), với **diện mạo mô phỏng `f-dialog`**: toolbar `dense flat` không màu + close icon, form floating label, actions `mr-1 mb-1` nút text. Anatomy đầy đủ + bảng quy tắc: xem `design_read("fui")` §4–5. `f-dialog` (mục 0) là lựa chọn phụ cho form rất nhỏ.

> Xem thêm: [ui-patterns.md](ui-patterns.md), [ui-table-cell-patterns.md](ui-table-cell-patterns.md) (menuChucNang mở dialog), [components-dialog.md](components-dialog.md).

---

## 0. `f-dialog` — component dialog gọn (lựa chọn phụ)

`f-dialog` gói sẵn card + toolbar + nút — ngắn hơn so với dựng `v-dialog` thủ công, nhưng khó tùy biến layout. Chỉ dùng cho form rất nhỏ/đơn giản; mặc định vẫn là `v-dialog` thủ công (mục 1). Các field bên trong dùng `v-model` **trỏ thẳng tới key của object `data`** (không cần `vueData.dialogData.X`).

```json
{
  "el": "f-dialog",
  "attr": {
    "v-model": "dialogOpen",            // boolean mở/đóng
    "v-model:data": "dialogData",       // object dữ liệu của form
    "title": "Nhập dữ liệu",
    ":open-action": { "MESSBOX": "Bạn vừa mở dialog" },
    ":controls": [
      { "el": "v-text-field", "attr": { "v-model": "Domain",   "label": "Domain" },   "w": 4 },
      { "el": "v-text-field", "attr": { "v-model": "ModuleID", "label": "ModuleID" }, "w": 3 },
      { "el": "v-checkbox",   "attr": { "v-model": "checkBoxValue",
          ":label": "`Tôi đồng ý: ${checkBoxValue}`" } },
      { "el": "v-select", "attr": { "label": "Chọn", "v-model": "bienselect",
          ":items": "vueData.Mang", "item-title": "AppName", "item-value": "AppListID" } }
    ],
    ":watch": {
      "bienselect": { "MESSBOX": "Watch {{bienselect}}" }
    },
    ":button": [
      { "label": "Lưu", "type": "submit", ":disabled": "!checkBoxValue",
        "action": [ { "MESSBOX": "Đã lưu" }, { "dialogOpen": false } ] },
      { "label": "Chạy API", "checkvalid": true, "v-if": "ModuleID==1",
        "action": [ { "API": "/chaymotapi" } ] },
      { "label": "Đóng", "action": [ { "dialogOpen": false } ] }
    ]
  }
}
```

| Prop | Vai trò |
|---|---|
| `v-model` | Biến boolean mở/đóng dialog |
| `v-model:data` | Object chứa dữ liệu form; field trong `:controls` bind trực tiếp tới key của nó |
| `title` | Tiêu đề dialog |
| `:open-action` | Action chạy khi dialog mở |
| `:controls` | Mảng Control Object = các field của form |
| `:watch` | Watcher phạm vi trong dialog (theo tên field) |
| `:button` | Mảng nút: `label`, `type:"submit"`, `checkvalid`, `:disabled`, `v-if`, `action` |

**Khi nào dùng gì:** mặc định mọi dialog → **`v-dialog` thủ công theo mục 1** (chuẩn project). `f-dialog` chỉ khi form rất nhỏ (1–3 field, không layout đặc biệt) và user không yêu cầu tùy biến.

---

## 1. Dialog Pattern — v-dialog thủ công trong hidden-container (CHUẨN)

Dialogs luôn đặt trong container riêng với `prop: "hidden-container"` — không nằm trong rows chính.

**Cấu trúc chuẩn:**

```json
{
  "prop": "hidden-container",
  "rows": [
    {
      "prop": "",
      "cols": [
        {
          "el": "v-dialog",
          "attr": {
            "v-model": "dlUserInfo",
            "width": 650
          },
          "innerHTML": [
            {
              "el": "v-card",
              "attr": { "class": "pa-0" },
              "innerHTML": [
                {
                  "el": "v-toolbar",
                  "attr": { "dense": "", "flat": "" },
                  "innerHTML": [
                    { "el": "v-toolbar-title", "attr": {}, "innerHTML": "Update User Info" },
                    { "el": "v-spacer", "attr": {} },
                    {
                      "el": "v-btn",
                      "innerHTML": "<v-icon>mdi-close</v-icon>",
                      "attr": { "icon": "", "v-on:click": "vueData.dlUserInfo = false" }
                    }
                  ]
                },
                {
                  "el": "v-container",
                  "attr": { "class": "grid-list-md px-4" },
                  "innerHTML": [
                    { "el": "v-layout", "w": 12, "attr": { "row": "", "wrap": "" }, "innerHTML": [
                        { "el": "v-text-field", "col": {}, "attr": { "v-model": "vueData.sUserName", "label": "Tên đăng nhập" }, "w": 6 },
                        { "el": "v-text-field", "col": {}, "attr": { "v-model": "vueData.sLastName", "label": "Họ tên" }, "w": 6 }
                    ]}
                  ]
                },
                {
                  "el": "v-card-actions",
                  "attr": { "class": "mr-1 mb-1" },
                  "innerHTML": [
                    { "el": "v-spacer", "attr": {} },
                    {
                      "el": "f-button",
                      "attr": {
                        "text": "",
                        ":checkvalid": true,
                        "label": "Lưu",
                        "icon-text": "mdi-content-save",
                        ":action": {
                          "API": "SM_Users_Update",
                          "IN": { "UserID": "sUserID", "UserName": "sUserName" },
                          "CALLBACK": [
                            { "MESS": "Cập nhật thành công." },
                            { "dlUserInfo": false },
                            { "CALL": "getUser" }
                          ]
                        }
                      }
                    }
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

**Quy tắc dialog (phong cách f-dialog):**
- `v-card[class="pa-0"]` — triệt đệm để toolbar tràn sát mép (ưu tiên class Vuetify, không inline style); không elevation/outlined
- `v-toolbar[dense flat]` — thanh tiêu đề mỏng, **không** color/dark
- Nút đóng: `v-btn[icon]` mdi-close + `v-on:click: "vueData.dlXxx = false"` — không thêm nút "Đóng" ở actions
- Thân form: `v-container.grid-list-md.px-4` > `v-layout[row wrap]` > field **floating label** (`label` trong attr, w:12 dài / 6+6 ngắn) — KHÔNG dùng label div rời
- `v-card-actions[class="mr-1 mb-1"]` với `v-spacer` trước nút → nút dồn phải; nút dùng `f-button` + `"text": ""` (nút phẳng)
- CALLBACK của Save: MESS → đóng dialog → reload data

---

## 2. Mở Dialog với Dữ Liệu Row

Pattern 2 bước: copy dữ liệu vào state → set `dlXxx = true`.

**Từ menuChucNang:**
```json
"action": [
  {
    "addNew": 0,
    "dongChon": "item",
    "sUserID":    "item.UserID",
    "sUserName":  "item.UserName",
    "sLastName":  "item.LastName"
  },
  { "dlUserInfo": true }
]
```

**Từ f-button:**
```json
":action": [
  { "addNew": 1, "sUserID": "", "sUserName": "" },
  { "dlUserInfo": true }
]
```

> `addNew: 0` = edit mode, `addNew: 1` = new mode. Trong dialog, dùng `:disabled="addNew==0"` để khóa field ID khi edit.

---

## 3. Checkbox List Dialog Pattern

Dialog chứa danh sách checkbox để chọn nhiều items, lưu ngay khi click.

```json
{
  "el": "v-card-text",
  "attr": {},
  "innerHTML": [
    {
      "el": "v-layout",
      "attr": { "class": "fluid row justify-center grid-list-lg fill-height mt-3" },
      "innerHTML": [
        {
          "el": "div",
          "attr": { "v-for": "fc in vueData.dsFunctionRight", ":key": "fc.FunctionID" },
          "innerHTML": [
            {
              "el": "v-checkbox",
              "attr": {
                "color": "primary",
                "v-model": "sFunctionSelected",
                ":value": "`${fc.FunctionID}`",
                ":label": "`${fc.FunctionName}`",
                "v-on:click": "CALL(saveFunction)"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

> `v-on:click` trên checkbox → save ngay không cần nút Save. `v-model` nhận array, `:value` dùng backtick literal.
