# FUI Component Quick Reference

> File này sở hữu: **danh mục component FUI, bảng component cần import JS/CSS, quy trình thêm/bỏ import**. Chi tiết từng component xem file reference tương ứng ở cột phải.

Tra cứu nhanh toàn bộ component có sẵn trong FUI runtime. Ưu tiên dùng `f-*` trước — chỉ dùng `v-*` khi không có FUI equivalent.

| Component | Dùng khi nào | Reference |
|---|---|---|
| `f-table` | **Hiển thị dữ liệu dạng datatable** — cả CRUD qua dialog form lẫn chỉ xem (readonly = không khai `:update-api`); auto-build headers khi không truyền `:headers`; hàng tổng qua `sum-format` | [component-table.md](component-table.md) |
| `f-dialog` | Modal dialog với form, watch, button | [components-dialog.md](components-dialog.md) |
| `f-window` | Dialog mở URL trong iframe | [components-dialog.md](components-dialog.md) |
| `f-button` | Nút bấm có action, hotkey, form validation | [components-input.md](components-input.md) |
| `f-date` | Input ngày có date picker + typed mask | [components-input.md](components-input.md) |
| `f-time` | Input giờ có time picker + typed mask | [components-input.md](components-input.md) |
| `f-time-counter` | Đếm ngược / đồng hồ | [components-input.md](components-input.md) |
| `f-search` | Autocomplete tìm kiếm qua API | [components-input.md](components-input.md) |
| `f-menu` | Dropdown button menu có icon/action/link | [components-input.md](components-input.md) |
| `f-radiobox` | Radio group từ array items | [components-input.md](components-input.md) |
| `f-file-upload` | Upload file (Plupload, progress dialog) | [components-input.md](components-input.md) |
| `f-image-update` | Upload + crop ảnh | [components-input.md](components-input.md) |
| `f-excel-reader` | Đọc file Excel → JSON | [components-input.md](components-input.md) |
| `f-qrcode` | Render mã QR | [components-input.md](components-input.md) |
| `f-qrcode-reader` | Đọc QR bằng camera | [components-input.md](components-input.md) |
| `f-editor` | Rich text editor (CKEditor 5) | [components-dialog.md](components-dialog.md) |
| `f-editor-dialog` | Rich text editor trong modal | [components-dialog.md](components-dialog.md) |
| `f-echart` | **Biểu đồ** — ECharts V5: bar, line, pie, scatter, gauge, radar, heatmap, sankey, tree, map, graph... | [components-echart.md](components-echart.md) · [echart-templates.md](echart-templates.md) |
| `f-sheet` | **Nhập liệu trực tiếp trên bảng kiểu Excel** — sửa ô tại chỗ, dán từ Excel, không qua dialog (dựa trên AG Grid) — **cần import** | [fsheet.md](fsheet.md) |
| `f-pdfmake` | Render PDF trong iframe | [components-display.md](components-display.md) · [pdfmake.md](pdfmake.md) |
| `f-label` | Chip/badge hiển thị tag, trạng thái | [components-display.md](components-display.md) |
| `f-box` | Hiển thị/chỉnh sửa key-value rows | [components-display.md](components-display.md) |
| `f-header` | Tiêu đề lớn (display-1, primary color) | [components-display.md](components-display.md) |
| `f-title` | Tiêu đề nhỏ (title, primary color) | [components-display.md](components-display.md) |
| `f-slider` | Carousel ảnh | [components-display.md](components-display.md) |
| `fp-profile` | Khối thông tin/hồ sơ user | [components-display.md](components-display.md) |

### Component trong ô bảng (`t-*`) — dùng trong `headers` của f-table

`t-html` · `t-label` · `t-num` · `t-time` · `t-boolean` · `t-check` (toggle) · `t-text` · `t-select` · `t-combobox` · `t-menu` (context menu) · `t-link` · `t-button` — chi tiết & ví dụ: [ui-table-cell-patterns.md](ui-table-cell-patterns.md).

> `header-bar` và `f-window` là component nội bộ do runtime tự dựng (menu header, cửa sổ `openWindow`) — không đặt trực tiếp trong `controls`.

## Components cần import JS/CSS

Một số component yêu cầu import thêm thư viện — **phải gọi `file_import_list` để kiểm tra và thêm/xóa import tương ứng khi thêm hoặc bỏ component**.

| Component | Import bắt buộc |
|---|---|
| `f-pdfmake` | `/include/pdfmake/pdfmake.min.js` · `/include/pdfmake/print.min.js` · `/include/pdfmake/vfs_fonts.js` |
| `f-file-upload` | `/include/plupload-2.3.7/plupload.full.min.js` |
| `f-image-update` | `/include/vue-advanced-cropper/index.umd.js` · `/include/vue-advanced-cropper/style.css` |
| `f-qrcode` | `/include/qrcode/qrcode.min.js` |
| `f-qrcode-reader` | `/include/qrcode/qrcode-reader.min.js` |
| `f-echart` | `/include/chart/echarts.min.js` · `/include/chart/fechart.js` (**theo thứ tự này**) — nền tảng Apache ECharts |
| `f-sheet` | `/include/ag-grid/ag-grid-community.min.js` · `/include/ag-grid/fsheet.js` (**theo thứ tự này**) — nền tảng AG Grid |
| `f-editor` | `/include/ckeditor5/build/ckeditor.js` |
| `f-editor-dialog` | `/include/ckeditor5/build/ckeditor.js` |

> **Bundled sẵn, KHÔNG cần import thêm:** `v-*` (Vuetify) · `f-table` · `f-dialog` · `f-button` ·
> `f-date` · `f-time` · `f-search` · `f-menu` · `f-radiobox` · `f-box` · `f-label` · `f-header` ·
> `f-title` · `f-slider` · `f-excel-reader` — và mọi component không có tên trong bảng trên.

**Quy trình khi thêm component có import:**
1. `file_import_list` (projectId + moduleId) — kiểm tra import hiện có
2. Nếu chưa có → `file_import_new` để thêm từng file
3. Nếu bỏ component → kiểm tra import đó còn dùng ở chỗ nào khác không; nếu không → `file_import_delete`

---

## Quy tắc chọn nhanh

- `f-button` thay `v-btn` khi cần action FUI (CALL, hotkey, form validation)
- `f-date` / `f-time` thay `v-text-field` + manual date parsing
- `f-search` thay `v-autocomplete` khi cần search qua API
- `f-menu` thay `v-menu + v-btn` khi cần dropdown actions
- `f-table` thay `v-data-table` cho MỌI bảng — CRUD lẫn chỉ xem (readonly = không khai `:update-api`)
- `f-echart` cho mọi loại biểu đồ (bar, line, pie, gauge, scatter, radar, sankey, tree, map...)
- Dialog: `ctrl-update` của `f-table` cho CRUD inline; dialog riêng → dựng `v-dialog` thủ công theo anatomy chuẩn (`design_read("fui")` §4 + `ui-dialog-patterns.md`); `f-dialog` chỉ cho form rất nhỏ
