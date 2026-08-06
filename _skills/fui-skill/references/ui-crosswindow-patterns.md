# FUI Cross-window Patterns — openWindow & data exchange

> File này sở hữu: **`openWindow`, trao đổi dữ liệu giữa cửa sổ (`#PARENT`/`#Win`), `set.menu` cho module con, `onclose`**.

Mở module như sub-window và trao đổi dữ liệu giữa các window/iframe (`#PARENT`, `#WinID`). Rút ra từ project **security-manager** và các ví dụ `ex-v3-*`.

> Xem thêm: [ui-patterns.md](ui-patterns.md), [default-function.md](default-function.md) (`openWindow`, `windowSendMessage`).

---

## 1. Mở Sub-window (openWindow) — Đầy đủ

Mở module khác như popup window riêng biệt. `id` là định danh để tham chiếu sau này.

```json
{
  "FUN": "openWindow",
  "IN": {
    "id":     "`Win1",
    "title":  "`User Permission",
    "url":    "`/UserPermission",
    "data":   "danhSachChoTable",
    "width":  "`800px",
    "height": "`600px",
    "onclose": {
      "CALL": "reloadData"
    }
  }
}
```

| Param | Bắt buộc | Mô tả |
|---|---|---|
| `id` | ✅ | Định danh window (backtick = literal) — dùng để ref qua `#Win1` |
| `url` | ✅ | URL module — không truyền `?menu=0`; module con tự khai báo `"set": { "menu": false }` |
| `title` | ❌ | Tiêu đề dialog |
| `data` | ❌ | Truyền dữ liệu vào window con — window con đọc qua `#PARENT.data` |
| `width` / `height` | ❌ | Kích thước window (`"800px"`, `"50%"`) |
| `onclose` | ❌ | Action chạy sau khi sub-window đóng |

> **Module con mở qua openWindow:** Không truyền `?menu=0` trong URL. Module con tự khai báo `"set": { "menu": false }` trong module.json để ẩn menu vĩnh viễn cho module đó — bất kể cách mở. URL chỉ truyền ID cần thiết để query DB.

**`onclose` targeting window khác:**

```json
"onclose": {
  "#Win1": { "CALL": "cmdThongBao" }
}
```

> Khi Win2 đóng → chạy `cmdThongBao` trong Win1 (không phải trong window hiện tại).

---

## 2. Cross-window Data Exchange — Đầy đủ

FUI dùng `#PARENT` và `#WinID` để trao đổi dữ liệu giữa các window (iframe). Hoạt động cả same-domain và cross-domain (qua `postMessage`).

### Đọc dữ liệu từ window khác (value position)

```json
"data": [
  {
    "sUserID":      "#PARENT.sUserID",
    "sFullName":    "#PARENT.sFullName",
    "dataFromWin1": "#Win1.apiChart"
  }
]
```

| Cú pháp | Ý nghĩa |
|---|---|
| `"#PARENT.field"` | Đọc `vueData.field` từ window cha |
| `"#Win1.field"` | Đọc `vueData.field` từ iframe có id `Win1` |

### Ghi dữ liệu vào window khác (key position)

```json
"data": [
  {
    "#PARENT.abcdef": 1234567890,
    "#Win1.dulieuTuForm2": "`huynh cao tuan"
  }
]
```

```json
":action": {
  "#PARENT.val4": "DauRaTuCauTruc_IN"
}
```

| Cú pháp | Ý nghĩa |
|---|---|
| `"#PARENT.field": value` | Ghi value vào `vueData.field` của parent |
| `"#Win1.field": value` | Ghi value vào `vueData.field` của Win1 |

### Gọi action trong window khác

```json
":action": {
  "#PARENT": { "CALL": "cmdSETData" }
}
```

```json
"#Win1": { "CALL": "cmdThongBao" }
```

- `"#PARENT"` (không có field) với value là action → `runAction(value)` trong parent
- `"#Win1"` với value là action → `runAction(value)` trong Win1

### Nhận dữ liệu được truyền khi openWindow

Khi window cha mở con với `"data": "sourceData"`:

```json
"data": [
  {
    "LayDuLieuWinCha": "#PARENT.Win1"
  }
]
```

> `#PARENT.Win1` đọc biến `Win1` từ parent. Khi cha gọi `openWindow` với `id: "Win1"`, FUI tự set `vueData.Win1 = data_đã_truyền` trong parent trước khi mở window.

### Pattern đầy đủ — Sub-window nhận data từ parent

**Module cha (ex-v3-1SetData):**
```json
":action": {
  "FUN": "openWindow",
  "IN": {
    "id":   "`Win1",
    "url":  "`/ex/ex-v3-2CauTruc",
    "data": "danhSachChoTable"
  }
}
```

**Module con (ex-v3-2CauTruc):**
```json
"data": [
  {
    "IF": "typeof menu != 'undefined' && menu=='0'",
    "THEN": { "v_Set.menu": false }
  },
  {
    "LayDuLieuWinCha":    "#PARENT.Win1",
    "GiaTriTuCHA.thu.xem": "#PARENT.val7",
    "GiaTriSetTuCHA":      null
  }
]
```

> Đặt `#PARENT.*` TRƯỚC các CALL startup để data sẵn sàng trước khi API đầu tiên chạy.

---

## 3. Sub-window Checklist

Module được mở qua `openWindow` cần:

- `"set": { "menu": false }` — ẩn navigation header (khai báo trong module.json, không dùng `?menu=0` trong URL)
- URL params tự động inject vào `vueData` trước khi `data[]` chạy — `{ "CALL": "apiLoad" }` ở cuối `data[]` là đủ
- URL chỉ truyền **ID** của record cha mà module con thực sự dùng — không truyền name hay field có thể tra lại từ DB

```json
// module.json của module con
"set": { "menu": false },
"data": [
  { "ContestID": null },
  {
    "getDetail": {
      "API": "/SM_Contest_Detail",
      "IN": { "ContestID": "ContestID" },
      "OUT": "dsDetail"
    }
  },
  { "CALL": "getDetail" }
]
// ContestID tự động inject từ URL ?ContestID=xxx trước khi data[] chạy
```

---

## 4. Ví dụ hoàn chỉnh cha ↔ con (chuẩn `ex-v3-1SetData` → `ex-v3-2CauTruc`)

Đây là mẫu chuẩn: **cửa sổ cha mở con qua `openWindow`, truyền dữ liệu bảng, con đọc/ghi/gọi lệnh ngược lên cha.**

### 4.1 Cửa sổ CHA — f-table + nút mở con, truyền `data`

`data` trong `openWindow.IN` truyền thẳng object/array (ở đây là danh sách bảng `danhSachChoTable`) sang con; con đọc qua `#PARENT.<id>`.

```json
{
  "el": "f-table",
  "attr": {
    "label": "Danh sách",
    ":items": "danhSachChoTable",
    ":headers": [
      { "text": "STT", "value": "STT" },
      { "text": "Họ",  "value": "ho" },
      { "text": "Tên", "value": "ten" }
    ]
  },
  "w": "6"
},
{
  "el": "f-button",
  "attr": {
    "label": "Open Window",
    ":action": {
      "FUN": "openWindow",
      "IN": {
        "id": "`Win1",
        "title": "`Chỉnh sửa cho module",
        "url": "`/ex/ex-v3-2CauTruc",
        "data": "danhSachChoTable"
      }
    }
  },
  "w": "3"
}
```

Cha cũng có thể khai báo **action đặt tên** để con gọi ngược lên, và ghi thẳng vào con trong `data[]`:

```json
"data": [
  { "#PARENT.abcdef": 1234567890, "#Win1": { "CALL": "cmdTHONGBao" } },
  {
    "cmdSETData": [
      { "MESS": "Lệnh của form CHA được gọi từ form CON" },
      { "#Win1.GiaTriSetTuCHA": "Giá trị set từ CHA" }
    ]
  }
]
```

### 4.2 Cửa sổ CON — đọc data cha, ghi ngược, gọi lệnh cha, mở thêm con

```json
// data[] của con: đọc dữ liệu cha NGAY đầu tiên
"data": [
  {
    "LayDuLieuWinCha": "#PARENT.Win1",   // = data cha đã truyền qua openWindow (id=Win1)
    "GiaTriTuCHA.thu.xem": "#PARENT.val7",
    "GiaTriSetTuCHA": null
  }
],
"set": { "menu": false, "login": false }
```

```json
// Các nút trong controls của con:
{ "el": "f-button", "attr": { "label": "Lấy dữ liệu từ cha",
  ":action": { "USERINFO": "#PARENT.val4" } } },

{ "el": "f-button", "attr": { "label": "Set dữ liệu xuống cha",
  ":action": { "#PARENT.val4": "DauRaTuCauTruc_IN" } } },

{ "el": "f-button", "attr": { "label": "Gọi lệnh ở cha",
  ":action": { "#PARENT": { "CALL": "cmdSETData" } } } },

{ "el": "f-button", "attr": { "label": "Mở thêm form con",
  ":action": { "FUN": "openWindow", "IN": {
    "id": "`Win2",
    "url": "`https://fui.vn/ex/ex-v3-1SetData",
    "onclose": { "#Win1": { "CALL": "cmdThongBaoCuaFormNay" } }
  } } } }
```

**Tổng hợp cú pháp trao đổi (value = đọc, key = ghi):**

| Cú pháp | Ý nghĩa |
|---|---|
| `"x": "#PARENT.field"` | Đọc `field` của cha vào `x` |
| `"x": "#Win1.field"` | Đọc `field` của cửa sổ id `Win1` |
| `"#PARENT.field": "src"` | Ghi `src` vào `field` của cha |
| `"#Win1.field": "src"` | Ghi vào cửa sổ `Win1` |
| `"#PARENT": { "CALL": "cmd" }` | Gọi action `cmd` trong cha |
| `"#Win1": { "CALL": "cmd" }` | Gọi action trong `Win1` |
| `openWindow.IN.data` | Truyền object/array sang con; con đọc `#PARENT.<id>` |
| `openWindow.IN.onclose` | Action chạy sau khi con đóng (có thể nhắm `#WinX`) |

> Hoạt động cả **same-domain và cross-domain** (runtime tự dùng `postMessage` khi khác tên miền).

---

## 5. f-table / f-sheet + mở cửa sổ chi tiết

Pattern rất phổ biến: bảng danh sách → click một dòng → mở cửa sổ con để xem/sửa chi tiết dòng đó.

- Trong `headers` của `f-table`, dùng `t-button` hoặc `t-menu` với `:action` gọi `openWindow`; `item` là dòng hiện tại.
- Truyền **chỉ ID** của dòng qua URL (con tự query DB), hoặc truyền cả object dòng qua `openWindow.IN.data`.

```json
{
  "el": "t-button", "text": "Chi tiết", "value": "ID", "align": "center",
  "attr": {
    "icon-text": "mdi-eye", "color": "primary",
    ":action": {
      "FUN": "openWindow",
      "IN": {
        "id": "`WinDetail",
        "title": "`Chi tiết",
        "url": "`/DetailModule?RecordID={{item.ID}}",
        "onclose": { "CALL": "reloadList" }
      }
    }
  }
}
```

- **`f-sheet`** (bảng tính nhập lưới) kết hợp tương tự: nút/menu trong sheet gọi `openWindow`, hoặc lưu cả `vueData` của sheet rồi mở con để nhập bổ sung; con ghi ngược qua `#PARENT.<field>` khi đóng.
- Reload sau khi con đóng: đặt `onclose: { "CALL": "reloadList" }` (chạy trong cửa sổ mở nó) — xem §1.
