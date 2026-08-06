# f-sheet — Bảng tính nhập liệu (dựa trên AG Grid)

> File này sở hữu: **`f-sheet` (AG Grid): import, props, cấu hình cột, wiring API, dán-từ-Excel**.

`f-sheet` là **data grid nhập liệu kiểu Excel**, xây dựng **hoàn toàn trên AG Grid Community**. Mọi cấu hình cột/lưới đều là cấu hình AG Grid — **khi cần tuỳ biến, dựa vào kiến thức AG Grid** (https://www.ag-grid.com/, phiên bản Community). FUI chỉ bọc thêm: toolbar (thêm/xoá/lưu/xuất Excel), theo dõi dòng thay đổi, dán-từ-Excel, và wiring API.

> **Phân biệt với `f-table`**: `f-table` hiển thị dữ liệu dạng datatable, sửa dòng qua dialog form riêng. `f-sheet` sửa **ngay trên ô của bảng** (không qua dialog), phù hợp nhập liệu hàng loạt kiểu Excel (dán nhiều dòng, sửa nhanh nhiều ô). Cùng là component có sẵn — không tự viết bảng nhập liệu bằng `uc-*.vue`.

> Nền tảng (nguồn sự thật): `scripts/componentTable.js` (V2) và `scripts/componentTable-3.0.js` (V3) — **hai bản phải giữ đồng bộ**, chỉ khác class/prop Vuetify (xem [script-map.md](script-map.md) §4b). Dùng `ajaxCALL`/`confirm`/`jsonToExcel` bên trong — khớp [component-design.md](component-design.md) §12.

---

## Import BẮT BUỘC (thiếu → không dùng được f-sheet)

Thêm đúng 3 file (đúng thứ tự) qua `file_import_new`:

```
/include/ag-grid/ag-grid.min.css
/include/ag-grid/ag-theme-alpine.min.css
/include/ag-grid/ag-grid-community.min.js
```

Quy trình khi thêm/bỏ f-sheet: `file_import_list` (projectId + moduleId) → chưa có thì `file_import_new` từng file → bỏ f-sheet mà không module/component khác dùng thì `file_import_delete`. Xem [component-quickref.md](component-quickref.md).

---

## Props

| Prop (kebab-case trong `attr`) | Kiểu | Ý nghĩa |
|---|---|---|
| `label` | string | Tiêu đề + hiện trên thanh công cụ |
| `:columns` | array | **colDefs của AG Grid** (xem mục Cột). Bỏ trống → tự suy cột từ `items[0]` |
| `:items` | array | Dữ liệu dòng (rowData) |
| `row-key` | string | Tên field khóa chính (mặc định `id`) — dùng để nhận diện dòng đổi/mới/xoá |
| `:height` | number | Bỏ trống = tự giãn theo số dòng; `<=0` = fill tới đáy màn hình chừa `abs(height)` px; `>0` = px cố định (xem mục Chiều cao) |
| `:allow-add` | bool | Hiện nút Thêm dòng |
| `:allow-delete` | bool | Hiện cột checkbox chọn + nút Xoá |
| `readonly` | bool | Khoá toàn bộ chỉnh sửa |
| `update-api` | string | Endpoint tAPI **lưu từng dòng đã đổi** (gọi qua `ajaxCALL`, tự prepend `apiDomain`) |
| `delete-api` | string | Endpoint tAPI xoá một dòng |
| `:save-extra` | object | Tham số phụ **trộn vào payload** mỗi lần lưu/xoá (vd `{ LopID: vueData.lopID }`) |
| `:default-item` | object | Mẫu giá trị cho dòng mới khi bấm Thêm |

---

## Cột (`columns`) = colDef của AG Grid

Mỗi phần tử `columns` là một **AG Grid colDef** — dùng trực tiếp kiến thức AG Grid:

| Key colDef hay dùng | Ý nghĩa |
|---|---|
| `field` | Tên field trong dòng dữ liệu |
| `headerName` | Nhãn cột |
| `editable` | Cho sửa ô — **mặc định bật** (f-sheet đặt `editable: !readonly` trong `defaultColDef`); cột chỉ đọc khai `"editable": false` |
| `width` / `minWidth` / `flex` | Bề rộng cột (mặc định `flex:1`, `minWidth:80`) |
| `pinned` | `'left'`/`'right'` cố định cột |
| `sortable` / `filter` / `resizable` | Mặc định đều bật |
| `valueFormatter` / `valueGetter` | Định dạng/hiển thị (hàm AG Grid) |
| `cellEditor` | Editor tuỳ chỉnh |
| `type` | Khai kiểu dữ liệu cột — `"number"` = kiểu số (xem quy ước bên dưới). columnType do f-sheet đăng ký, xử lý trong `buildColDefs`/`parseByType` |

**Editor ngày dựng sẵn:** đặt `"cellEditor": "fsheetDate"` → dùng input `type=date`, tự cắt còn `YYYY-MM-DD`.

> Các tính năng cột nâng cao khác (cellRenderer, cellClassRules, aggregation...) tra tài liệu AG Grid Community — f-sheet truyền colDef thẳng vào grid. Riêng cột `type:"number"` được f-sheet **tự gắn** `cellStyle`/`valueFormatter`/`valueParser` (xem bên dưới) — chỉ khai tay khi cần logic khác mặc định.

### Cột số — `"type": "number"` (MẶC ĐỊNH)

Khai `"type": "number"` là đủ, f-sheet tự gắn 4 thứ (mỗi thứ chỉ gắn khi colDef **chưa** tự khai, nên muốn khác mặc định thì cứ khai đè):

| Tự gắn | Hành vi |
|---|---|
| `cellStyle` | Canh **phải** |
| `valueFormatter` | Phân cách nghìn `toLocaleString('en-US', { maximumFractionDigits: 10 })` → `1,234,567.89`. Chỉ áp lúc **hiển thị** — click vào ô sửa vẫn thấy số thô |
| `valueParser` | Parse khi rời ô sửa: rỗng/`null`/`undefined` → `null` thật (không phải `""`), chuỗi số → `Number`, chuỗi hỏng → `null`. Áp cho cả paste-từ-Excel |
| `filter` | `agNumberColumnFilter` (lọc lớn hơn/nhỏ hơn/bằng thay vì lọc text) — đăng ký qua `columnTypes` của grid |

> `type` không phải key gốc AG Grid mà là **columnType** do f-sheet đăng ký. Đặt `type` giá trị khác `"number"` mà chưa khai trong `columnTypes` → AG Grid cảnh báo `colDef.type 'x' does not correspond to defined gridOptions.columnTypes`.

### Chiều cao — `:height`

| Giá trị | Hành vi |
|---|---|
| *(bỏ trống)* | **Tự giãn theo số dòng** — AG Grid `domLayout: 'autoHeight'`, lưới cao bằng đúng nội dung, không có thanh cuộn riêng |
| `<= 0` | **Fill tới đáy màn hình, chừa `abs(height)` px** |
| `> 0` | px cố định (vd `":height": 300`) |

Chế độ `<=0` **đo `getBoundingClientRect().top` thật** của phần tử lưới sau khi layout xong rồi tính `window.innerHeight - top - abs(height)` (sàn tối thiểu 200px), và đăng ký `window.resize` để tự cập nhật. Nghĩa là **không cần biết** header/toolbar/breadcrumb phía trên cao bao nhiêu — chỉ khai khoảng hở muốn chừa ở đáy.

- **Bảng chính của module**: khai `":height": -16` — cuộn data chỉ cuộn trong lưới, trang không cuộn (lint D9). Thiếu `:height` sẽ bị D9 cảnh báo.
- **Trong dialog**: dùng số **dương** (px cố định), vì lưới không nằm sát đáy viewport.
- **Bảng ngắn/lookup ít dòng**: bỏ trống `:height` để tự giãn — hợp lệ, bỏ qua D9.
- ⚠ Chế độ tự giãn **render toàn bộ dòng** (AG Grid không ảo hoá được khi không có chiều cao cố định). Vài trăm dòng trở lên thì phải khai `:height` để lấy lại virtual scrolling.
- ⚠ Số âm **không** có nghĩa "viewport trừ đi N". Module cũ khai `":height": -220` phải sửa thành `-16`, nếu không lưới hụt mất ~200px.

---

## Wiring API — hợp đồng response

`update-api` và `delete-api` được gọi bằng `ajaxCALL(api, { ...saveExtra, ...row })`. **SP nên trả về một dòng** dạng:

```
SELECT Success = 1, Message = N'Đã lưu'      -- hoặc Success = 0 khi lỗi nghiệp vụ
```

f-sheet đọc `res.data[0]` → hiện snackbar `Message`; `Success` quyết định đánh dấu thành công. Xem quy ước SP: [tapi-reference.md](tapi-reference.md).

- **Dòng mới**: nhận khóa **âm** tạm (−1, −2…) và tô nền **xanh nhạt**; khi lưu, khóa âm được đặt `0` trong payload → SP hiểu là INSERT.
- **Ô đã sửa**: tô nền **vàng nhạt**; "N dòng thay đổi" hiển thị trên toolbar.
- Lưu chạy **từng dòng song song**; xong hết & không lỗi → làm mới baseline, xoá đánh dấu, emit `saved`.
- Xoá nhiều dòng đã tồn tại → hỏi `confirm` trước; dòng mới (khóa âm) xoá cục bộ không gọi API.

---

## Tính năng có sẵn (không cần tự code)

- **Sửa inline** + theo dõi thay đổi (amber = đã đổi, green = dòng mới).
- **Dán từ Excel**: copy vùng ô trong Excel/Sheet rồi paste (TSV nhiều dòng/cột) thẳng vào lưới.
- Toolbar: **Thêm** (allow-add) · **Xoá đã chọn** (allow-delete, multi-select) · **Lưu** (update-api) · **Huỷ thay đổi** · **Xuất Excel** (dùng `jsonToExcel`).

## Events & method (`$refs`)

- Emit: `change(data, field, value)` · `save(rows)` · `saved`.
- Method: `getChangedRows()` · `addRow()` · `deleteRow(row)` · `refresh()` · `exportExcel()`.

---

## Ví dụ trong module.json (controls)

```json
{
  "el": "f-sheet",
  "w": 12,
  "attr": {
    "label": "Bảng điểm",
    ":items": "dsDiem",
    "row-key": "DiemID",
    ":columns": [
      { "field": "MaSV",   "headerName": "Mã SV",   "editable": false, "width": 120, "pinned": "left" },
      { "field": "HoTen",  "headerName": "Họ tên",  "editable": false },
      { "field": "Diem",   "headerName": "Điểm", "type": "number" },
      { "field": "NgayThi","headerName": "Ngày thi","cellEditor": "fsheetDate" }
    ],
    ":allow-add": true,
    ":allow-delete": true,
    "update-api": "Diem_Save",
    "delete-api": "Diem_Delete",
    ":save-extra": { "LopID": "vueData.lopID" },
    ":default-item": { "Diem": 0 },
    ":height": -16
  }
}
```

- `dsDiem` được nạp trước bằng một action trong `data[]` (`API`/`OUT`).
- `Diem_Save`/`Diem_Delete` là SP tAPI trả `{ Success, Message }` mỗi dòng.
- Kết hợp mở cửa sổ chi tiết: nút/menu trong toolbar hoặc cột gọi `openWindow` — xem [ui-crosswindow-patterns.md](ui-crosswindow-patterns.md) §5.

## Checklist

1. Đã `file_import_new` đủ **3 file AG Grid** (2 css + 1 js).
2. `row-key` trỏ đúng khóa chính; SP `update-api`/`delete-api` trả `{ Success, Message }`.
3. Cần tuỳ biến cột → dùng colDef AG Grid; ngày → `cellEditor: "fsheetDate"`; số → `type: "number"` (không tự khai `cellStyle`/`valueFormatter`/`valueParser` tay nữa).
4. `:height` — bảng chính khai `-16`; trong dialog dùng số **dương**; bỏ trống = tự giãn (chỉ hợp cho bảng ngắn). Số âm = khoảng chừa ở đáy, **không phải** "viewport trừ N".
5. Đừng tự dựng lại grid/CSS — mọi cấu hình lưới đi qua `columns` (AG Grid).
