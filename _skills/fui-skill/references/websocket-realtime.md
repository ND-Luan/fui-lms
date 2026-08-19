# FUI Real-time Messaging — WebSocket (SignalR)

> File này sở hữu: **real-time/SignalR: `webSocketJoinGroup`, `webSocket_Send`**.

FUI cung cấp cơ chế real-time messaging dựa trên **SignalR** (không phải WebSocket API thuần của trình duyệt), host tại domain riêng `ws.fui.vn`. Toàn bộ logic client đã có sẵn trong `defaultfunction.js` (global, không cần viết lại) — chỉ cần khai báo đúng cấu trúc trong `module.json` và gọi 3 hàm sẵn có: `webSocketConnection`, `webSocketJoinGroup`, `webSocket_Send`.

---

## 1. Import bắt buộc

Trước khi dùng, phải thêm 2 file JS qua `file_import_new` — **đúng thứ tự** (dòng dưới phụ thuộc dòng trên):

| Thứ tự | File | Ghi chú |
|---|---|---|
| 1 (sort nhỏ hơn) | `https://ws.fui.vn/Scripts/jquery.signalR-2.4.1.min.js` | SignalR client core |
| 2 (sort lớn hơn) | `https://ws.fui.vn/signalr/hubs` | Hub proxy tự sinh từ server — vẫn là nội dung JS dù URL không có đuôi `.js` |

```
file_import_new({
  fileType: ".js", contentType: "link",
  fileName: "https://ws.fui.vn/Scripts/jquery.signalR-2.4.1.min.js",
  fileSort: 100
})
file_import_new({
  fileType: ".js", contentType: "link",
  fileName: "https://ws.fui.vn/signalr/hubs",
  fileSort: 110
})
```

> jQuery đã có sẵn trong FUI runtime — không cần import thêm. Kiểm tra `file_import_list` trước để tránh add trùng (giống quy trình `f-echart` trong [components-echart.md](components-echart.md)).

---

## 2. Cơ chế tự động kết nối khi module load

FUI's bootstrap (`buildApp` trong `fastproject.js`) kiểm tra `vueData.webSocket` ngay sau khi `data[]` chạy xong:

- Nếu `vueData.webSocket` tồn tại → tự tạo `vueData.webSocketState = { code, text }` và gọi `webSocketConnection('https://ws.fui.vn/signalr', vueData.webSocket, vueData.webSocketState)` + `webSocketJoinGroup(vueData.webSocket)` — **không cần tự gọi 2 hàm này ở bootstrap**, chỉ cần khai báo đúng object `webSocket` trong `data[]`.
- `webSocketState.text` phản ánh trạng thái kết nối: `Reconnecting` / `Connected` / `Disconnected`. Có thể bind trực tiếp lên UI để debug (`innerHTML: "{{webSocketState}}"`).

---

## 3. Khai báo group cần join — trong `data[]`

```json
"data": [
  {
    "TenNhomDong": "`ThuNha",
    "DGroup": "`device-abc",
    "webSocket": {
      "nhom1": [],
      "nhom2": null,
      "{{DGroup}}": {}
    }
  }
]
```

- Mỗi **key** của object `webSocket` là tên một group sẽ được join khi module load.
- **Kiểu giá trị quyết định cách nhận tin nhắn:**
  - Giá trị là **array** (`[]`) → tin nhắn mới được **push** vào cuối mảng (giữ lịch sử, dùng cho chat log, danh sách sự kiện...).
  - Giá trị là **`null` hoặc object** (`{}`) → tin nhắn mới **ghi đè** giá trị hiện tại (chỉ giữ tin mới nhất, dùng cho trạng thái/counter/notification đơn).
- Group name có thể là chuỗi literal (`nhom1`) hoặc **dynamic qua `{{ }}` interpolation ngay trong key** — `"{{DGroup}}"` sẽ được resolve thành giá trị hiện tại của `DGroup` (ví dụ `device-abc`), cho phép join theo group riêng của user/thiết bị.
- `` `ThuNha `` / `` `device-abc `` dùng backtick để ép literal string — xem [Value Resolution Rules](controls-patterns.md#0-value-resolution-rules-fundamental).

---

## 4. Join thêm group tại runtime — `FUN: webSocketJoinGroup`

Ngoài khai báo tĩnh ở mục 3, có thể join thêm group bất cứ lúc nào (kể cả ngay trong `data[]` dưới dạng action tự chạy khi load — xem [ui-patterns.md §1](ui-patterns.md)):

```json
{
  "FUN": "webSocketJoinGroup",
  "IN": {
    "Nhom3": null,
    "{{TenNhomDong}}": []
  }
}
```

- `IN` ở đây **chính là `groupObj`** (tham số đầu tiên của `webSocketJoinGroup(groupObj, timeout, callBackFunc)`) — không map theo tên tham số như hàm khác. Vì vậy `FUN` + `IN` **không truyền được `timeout`/`callBackFunc`** — nếu cần custom timeout hoặc callback sau khi join xong, dùng `EXE` raw JS: `"EXE": "webSocketJoinGroup({Nhom3:null}, 3000, function(){ ... })"`.
- Dùng cách này khi group cần join phát sinh **có điều kiện** hoặc **sau khi** module đã load (ví dụ: trong một action, sau khi API trả về ID phòng/chat cần join), thay vì chỉ khai báo tĩnh trong `webSocket: {}`.

---

## 5. Nhận tin nhắn

### watch (khuyến nghị — trigger logic khi có tin mới)

```json
"watch": {
  "webSocket.nhom1": { "MESS": "thong bao" },
  "webSocket.device-abc": { "MESS": "thong bao" }
}
```

> **Lưu ý quan trọng:** key trong `watch` **không được** dùng `{{ }}` template (watch key là literal cố định, không interpolate) — phải ghi trực tiếp giá trị đã resolve của group (ví dụ `webSocket.device-abc`, không phải `webSocket.{{DGroup}}`).

### Bind trực tiếp lên UI (hiển thị raw, không cần watch)

```json
{
  "el": "v-textarea",
  "attr": { "v-model": "webSocket.nhom2", "label": "Nội dung nhận nhom2", "rows": 5 }
}
```

### Debug toàn bộ state

```json
{ "el": "div", "attr": {}, "innerHTML": "{{webSocket}}" }
```

---

## 6. Gửi tin nhắn — `webSocket_Send`

`webSocket_Send(obj)` nhận **một object** `{ group, data }` — `data` có thể là object, array, hoặc string, hàm tự chọn API SignalR phù hợp (`messageSendObject` / `messageSendArray` / `messageSend`).

### Cách 1 — `FUN` + `IN` (payload object)

```json
{
  "FUN": "webSocket_Send",
  "IN": {
    "group": "`nhom1",
    "data": { "text": "doi tuong 1", "text2": "doi tuong 2" }
  }
}
```

### Cách 2 — `EXE` raw JS (khi cần đọc giá trị động từ vueData)

```json
{ "EXE": "webSocket_Send({ group:'nhom2', data:vueData.messText })" }
```

### Cách 3 — payload dạng array

```json
{
  "FUN": "webSocket_Send",
  "IN": { "group": "`nhom3", "data": ["mang 1", "mang 2"] }
}
```

### Gọi trực tiếp trong `script.js` (ngoài action engine)

```js
webSocket_Send({ group: 'Nhom3', data: 'Gui noi dung từ JS' })
```

### Cách 4 — Gửi qua HTTP API (không cần client tự giữ kết nối SignalR)

FUI cũng expose endpoint REST để gửi tin nhắn tới group mà không cần gọi `webSocket_Send` từ client:

```json
{
  "API": "https://ws.fui.vn/api/messageSend/nhom1",
  "IN": { "text": "test 1", "text2": "test 2" }
}
```

Group name cũng interpolate được trực tiếp trong URL:

```json
{ "API": "https://ws.fui.vn/api/messageSend/{{DGroup}}" }
```

Dùng cách này khi muốn gửi tin nhắn từ một action/nơi không tiện dùng `FUN`/`EXE` (ví dụ gọi từ server, hoặc muốn tách hẳn việc gửi ra khỏi client hiện có kết nối SignalR hay không).

---

## 7. Ví dụ đầy đủ (tham khảo)

```json
{
  "data": [
    {
      "TenNhomDong": "`ThuNha",
      "DGroup": "`device-abc",
      "webSocket": { "nhom1": [], "nhom2": null, "{{DGroup}}": {} }
    },
    {
      "FUN": "webSocketJoinGroup",
      "IN": { "Nhom3": null, "{{TenNhomDong}}": [] }
    }
  ],
  "watch": {
    "webSocket.nhom1": { "MESS": "thong bao" },
    "webSocket.device-abc": { "MESS": "thong bao" }
  },
  "controls": [
    {
      "prop": "fluid grid-list-md",
      "rows": [
        {
          "prop": "",
          "cols": [
            {
              "el": "v-textarea",
              "col": { "class": "" },
              "attr": { "v-model": "messText", "label": "noi dung", ":required": false, "rows": 5 },
              "w": ""
            },
            {
              "el": "f-button",
              "col": { "class": "shrink" },
              "attr": {
                "label": "send - nhom2",
                ":action": [
                  { "FUN": "webSocket_Send", "IN": { "group": "`nhom1", "data": { "text": "doi tuong 1", "text2": "doi tuong 2" } } },
                  { "EXE": "webSocket_Send({ group:'nhom2', data:vueData.messText})" },
                  { "FUN": "webSocket_Send", "IN": { "group": "`nhom3", "data": ["mang 1", "mang 2"] } }
                ]
              }
            }
          ]
        },
        {
          "prop": "",
          "cols": [
            { "el": "v-textarea", "col": {}, "attr": { "v-model": "webSocket.nhom2", "label": "Nội dung nhận nhom2", ":required": false, "rows": 5 } }
          ]
        },
        { "prop": "", "cols": [ { "el": "div", "col": {}, "attr": {}, "innerHTML": "{{webSocket}}" } ] },
        {
          "prop": "",
          "cols": [
            { "el": "f-button", "col": {}, "attr": { "label": "send by API - nhom1", ":action": [ { "API": "https://ws.fui.vn/api/messageSend/nhom1", "IN": { "text": "test 1", "text2": "test 2" } } ] } },
            { "el": "f-button", "col": {}, "attr": { ":label": "'send by API - ' + DGroup", ":action": [ { "API": "https://ws.fui.vn/api/messageSend/{{DGroup}}" } ] } }
          ]
        },
        { "prop": "", "cols": [ { "el": "div", "col": {}, "attr": {}, "innerHTML": "{{webSocketState}}" } ] }
      ]
    }
  ],
  "set": {}
}
```

---

## 8. Checklist khi thêm real-time messaging vào module

- [ ] `file_import_list` kiểm tra đã có `jquery.signalR-2.4.1.min.js` + `signalr/hubs` chưa
- [ ] Thiếu → `file_import_new` cả 2, đúng thứ tự sort (signalR trước, hubs sau)
- [ ] Khai báo `data[].webSocket = { groupName: [] | null | {} }` — chọn kiểu giá trị theo nhu cầu (lịch sử vs. giá trị mới nhất)
- [ ] Group cần join runtime/điều kiện → `FUN: webSocketJoinGroup` (không dùng được `timeout`/`callBackFunc` qua `IN`, cần thì dùng `EXE`)
- [ ] Nhận tin: `watch` (key literal, không `{{ }}`) hoặc bind trực tiếp `v-model="webSocket.<group>"`
- [ ] Gửi tin: `FUN: webSocket_Send` (object/array payload) hoặc `EXE` khi cần đọc `vueData` động, hoặc `API: https://ws.fui.vn/api/messageSend/<group>` nếu muốn gửi qua HTTP thay vì client SignalR
- [ ] Không quên `vueData.webSocketState` nếu cần hiển thị trạng thái kết nối cho user
