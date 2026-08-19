# module.json `data[]` — Khai báo state & value resolution (chuyên sâu)

> File này sở hữu: **pattern khai báo `data[]`: thứ tự state/action/auto-startup, deep key, `#PARENT`**. Quy tắc value resolution xem [controls-patterns.md](controls-patterns.md) §0.

Cách FUI đọc `data[]`: xử lý **tuần tự từ trên xuống**, mỗi object gán/chạy dựa trên cách viết value. Ví dụ trong file này rút từ `ex/ex-v3-1SetData` + `ex-v3-2CauTruc` (module demo chính thức của FUI).

> Quy tắc value resolution hình thức: [controls-patterns.md](controls-patterns.md) §0. Tổng quan 4 thành phần: [module-json-anatomy.md](module-json-anatomy.md). Engine nền tảng: [platform-architecture.md](platform-architecture.md) §5.

---

## 1. Ba loại phần tử trong `data[]`

```json
"data": [
  { "keyword": "", "dsUser": [], "dlOpen": false },          // (a) khởi tạo state
  { "getUser": { "API": "...", "IN": {...}, "OUT": "dsUser" } }, // (b) named action
  { "API": "...", "OUT": "dsInit" },                          // (c) action tự chạy khi load
  { "CALL": "getUser" }                                        // (c) auto-startup
]
```

- (a) không có key action → tạo biến reactive trong `vueData`.
- (b) key là **tên hàm** → định nghĩa action tái sử dụng (gọi bằng `CALL`).
- (c) object là chính một action (`API`/`CALL`/`FUN`…) → **chạy ngay khi trang load**, theo thứ tự.

---

## 2. Value resolution — CÁCH VIẾT quyết định GIÁ TRỊ (điểm hay sai)

Bảng quy tắc đầy đủ (`getVueData`: backtick / `{{ }}` / chuỗi có dấu cách / chuỗi không dấu cách →
JS eval) nằm ở [controls-patterns.md §0](controls-patterns.md#0-value-resolution-rules-fundamental)
— file Tier A luôn được nạp sẵn, không chép lại ở đây.

> **Hệ quả cho AI khi viết `data[]`:** muốn gán **chuỗi cố định không dấu cách** (id, url, mã) →
> **bọc backtick** (`` "`winUser" ``) hoặc single-quote (`"'winUser'"`), nếu không FUI sẽ hiểu là
> biến. Đây là lỗi phổ biến nhất khi viết `data`/`IN`.

---

## 3. Key là đường dẫn lồng nhau (deep set)

Key bên trái cũng được phân giải — set sâu vào object/array, kể cả index động:

```json
{
  "tui.ne.ok": "val1",          // set vueData.tui.ne.ok = val1
  "val7.prop4": "val5[1]",      // tạo nested nếu chưa có
  "M[0][val1].prop": "",        // index động: [val1] lấy giá trị biến val1 làm key
  "arrM[val2].prop1": 123456    // arrM[<val2>].prop1
}
```

FUI tự tạo object/array trung gian nếu chưa tồn tại. Dùng khi cập nhật một field sâu mà không muốn gán lại cả object.

---

## 4. Action tự chạy: inline `IN`/`OUT`/`API` khi load

Object là action đứng riêng trong `data[]` → chạy khi load. Không cần đặt tên:

```json
{ "API": "https://tapi.example.vn/me/auth/ApplicationList", "OUT": "Mang" },
{ "IN": { "ABC": "`gdsgdsg", "DEF": "val5", "CBV": 1233 }, "OUT": "DoiTuong" }
```

→ dùng để nạp dữ liệu ban đầu của trang (danh mục, dropdown, dữ liệu bảng).

---

## 5. Named action + CALLBACK (tái sử dụng)

```json
{
  "cmdSETData": [
    { "MESS": "Thông báo" },
    { "#Win1.GiaTriSetTuCHA": "Giá trị set từ CHA" }
  ],
  "apiChart": {
    "API": "/ts/TS_Report_ForChart/{{ab}}",
    "IN": { "sachID": "apiLoadFBUser", "modeY": 12345 },
    "OUT": "DSDoiQuaTang",
    "CALLBACK": { "AAA": "val2" }
  }
}
```

Gọi bằng `{ "CALL": "cmdSETData" }` từ `controls`, `watch`, hay action khác. `CALLBACK` chạy sau khi API xong (xem [ui-patterns.md](ui-patterns.md) §7).

---

## 6. `watch` với `v_old` — giá trị cũ

Trong `watch`, `v_old.<field>` cho giá trị **trước khi đổi**:

```json
"watch": {
  "val4": {
    "API": "ts/auth/QuanHuyen_Select",
    "IN": { "MaTinhTP": "tinhID" },
    "OUT": "DS_QUAN_HUYEN",
    "CALLBACK": { "BAC": "v_old.abcdeID" }
  },
  "taoID": { "dungthu": "v_old.taoID" }
}
```

Chi tiết `v_old`, `deep-watch`: [watcher-patterns.md](watcher-patterns.md).

---

## 7. Trao đổi cross-window ngay trong `data[]`

`data[]` có thể đọc/ghi cửa sổ khác bằng key/value `#PARENT.*` / `#WinID.*` — đặt **trước** các CALL fetch:

```json
"data": [
  {
    "LayDuLieuWinCha": "#PARENT.Win1",   // đọc data cha
    "#PARENT.abcdef": 1234567890,        // ghi xuống cha
    "#Win1": { "CALL": "cmdTHONGBao" }   // gọi lệnh ở Win1
  }
]
```

Đầy đủ: [ui-crosswindow-patterns.md](ui-crosswindow-patterns.md).

---

## 8. Checklist viết `data[]`

1. Khởi tạo **mọi** biến state ở object đầu (kể cả `[]`, `false`, `null`) — để reactive hoạt động.
2. Named action nhóm giữa; auto-startup (`CALL`/`API`) đặt **cuối**.
3. Gán chuỗi cố định không dấu cách → **backtick**; đừng để FUI hiểu nhầm là biến.
4. `#PARENT.*` / biến từ URL đặt trước các CALL fetch.
5. Không nhồi logic phức tạp vào `data` — tách sang `script.js` (hàm) hoặc `EXE` dè xẻn.
