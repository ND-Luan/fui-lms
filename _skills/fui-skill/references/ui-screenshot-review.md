# Review giao diện qua ảnh chụp màn hình

> File này sở hữu: **cách đọc và đánh giá ảnh chụp giao diện (user gửi hoặc từ `renderUI`)**.

Áp dụng khi có **ảnh giao diện** để đánh giá, từ một trong hai nguồn:

1. **User gửi ảnh chụp màn hình vào chat** — "xem giao diện này", "sao nhìn xấu vậy", "sửa lại cho đẹp", hoặc chỉ gửi ảnh kèm mô tả lỗi.
2. **Screenshot từ `module_simulate({ renderUI: true })`** — `render.png` (inline), `render-full.png`, `render-dialog.jpg`.

Nguyên tắc cốt lõi: **nhìn ảnh như một designer QA** — quét có hệ thống theo checklist bên dưới, và mỗi phát hiện phải map về **nguyên nhân cụ thể trong code** (controls[i] nào trong module.json, class/style nào, CSS nào trong header.html) kèm fix đề xuất. Đừng chỉ mô tả cảm tính "nhìn chưa đẹp".

---

## Quy trình

1. **Xác định bối cảnh** trước khi phán:
   - App-mode (CRUD/quản lý — chuẩn thẩm mỹ `design_read("fui")`) hay Web-mode (landing — theo brand DESIGN.md đã chọn)?
   - Desktop hay mobile? (ảnh hẹp/dọc → đánh giá theo chuẩn responsive)
   - Có module.json tương ứng trong workspace không? (có → đối chiếu ảnh ↔ controls để chỉ đúng vị trí sửa; không → nhận xét trên ảnh + xin module.json nếu cần sửa)
2. **Quét ảnh theo checklist A→D** (dưới) — ghi nhận từng phát hiện.
3. **Báo cáo dạng bảng**: `Phát hiện | Mức độ (lỗi/cần sửa/gợi ý) | Vị trí trên ảnh | Nguyên nhân khả dĩ | Fix đề xuất`.
4. **Tự sửa → render lại đối chiếu**: nếu có workspace + Playwright, sửa module.json rồi `module_simulate({ renderUI: true })` (cùng viewport/device với ảnh gốc nếu đoán được) và so sánh screenshot mới với ảnh user gửi — lặp cho tới khi sạch.

Ảnh mờ/cắt/không đủ thông tin → hỏi user chụp lại vùng cụ thể, đừng đoán bừa.

---

## Checklist quét ảnh

### A. Lỗi hiển thị cứng (bug — phải sửa)

- Vùng trống bất thường: component không render (app rỗng, card trống, chart trắng/0-size)
- Text lỗi lộ ra ngoài: `undefined`, `NaN`, `[object Object]`, message exception, key thay vì value
- Tràn ngang: thanh cuộn ngang xuất hiện, phần tử bị cắt mép phải
- Chữ/phần tử đè lên nhau; label bị cắt cụt không chủ ý (truncate `...` ở chỗ không nên)
- Ảnh vỡ (khung ảnh trống/icon broken), icon thiếu (ô vuông tofu — thường do font mdi chưa load hoặc sai tên icon)
- Loading spinner đứng mãi (v_Loading không về false — thường API treo/lỗi init)

### B. Bố cục, căn chỉnh, khoảng cách

- **Thẳng hàng**: field cùng row thẳng baseline, cùng chiều cao (`dense`/`outlined` đồng bộ); các card/khối cùng hàng cùng chiều cao
- **Căn trái/phải đúng ngữ nghĩa**: text căn trái; **số/tiền tệ trong bảng căn phải** (`t-num`); tiêu đề cột khớp hướng căn của data
- **Vị trí nút chuẩn**: nút hành động chính của trang ở toolbar bên phải; trong dialog nút chính (Lưu/Đồng ý) nằm **phải** của `v-card-actions` (có `v-spacer` đẩy); không có nút "Đóng" thừa (D7)
- **Khoảng cách nhất quán**: padding/margin theo nhịp Vuetify (bội 4px — pa-2/ma-2...); không có khoảng hở to bất thường giữa các khối, không có khối dính sát mép màn hình
- **Bảng data**: cuộn CHỈ trong bảng (bảng chính khai `":height": -16`), trang không có 2 thanh cuộn dọc lồng nhau, header bảng không trôi mất khi cuộn (D9)
- **Cân đối grid**: các cột trong row có tỷ lệ hợp lý (Σw ≤ 12), không có cột bị bóp quá hẹp làm nội dung xuống dòng xấu

### C. Màu sắc & phân cấp thị giác (App-mode đối chiếu `design_read("fui")`)

- Đối chiếu bộ quy tắc D1–D9 của validator: toolbar dialog **cùng màu nền** thân (không color/dark); nút xóa màu **warning cam** (không đỏ/error); width dialog thuộc bộ 400/550/600/650/800
- Một màn hình chỉ 1–2 màu nhấn; không tô màu tùy hứng vào card/nút phụ
- Contrast đủ đọc (chữ xám nhạt trên nền trắng, chữ trên nền màu — nghi ngờ thì báo)
- Trạng thái (chip/badge) dùng màu ngữ nghĩa nhất quán: success/warning/error cùng nghĩa ở mọi nơi

### D. Mật độ & responsive

- Mức `dense`/gọn đồng bộ toàn màn (không chỗ dày chỗ thưa)
- Ảnh mobile: cột tự xuống dòng đúng, nút không tràn/không quá bé để bấm, font đọc được, bảng có phương án mobile (`mobile-breakpoint`)
- `viewport-fit=cover` (mặc định của FUI): nội dung sát mép trên/dưới ở màn có notch → cần safe-area padding

---

## Map triệu chứng → nguyên nhân thường gặp

| Triệu chứng trên ảnh | Nguyên nhân hay gặp | Fix |
|---|---|---|
| Trang có thanh cuộn dọc, bảng dài vô tận | f-table/f-sheet không khai `:height` → tự giãn theo số dòng | Thêm `":height": -16` (tự đo `rect.top`, fill tới đáy) |
| Bảng hụt/tràn một khoảng cố định | `:height` cũ tính tay `"$( window ).height()-N"` không khớp toolbar thật | Thay bằng `":height": -16` |
| Field trong form so le chiều cao | Trộn field có/không `dense`, có/không `hide-details` | Đồng bộ `outlined dense hide-details` cả form |
| Số trong bảng căn trái | Cột thiếu `el: "t-num"` / align | Xem `component-table.md` |
| Chart trắng | Container 0-height lúc chart init | Cho container `:height` cụ thể; renderUI audit "canvas 0-size" xác nhận |
| Icon ô vuông | Sai tên `mdi-*` hoặc font chưa load | Kiểm tra tên icon; import materialdesignicons |
| Dialog tràn màn hình / bé tẹo | width không thuộc bộ chuẩn | Bộ width 400/550/600/650/800 (D3) |
| Nút chính lệch trái trong dialog | Thiếu `v-spacer` trong v-card-actions | Thêm v-spacer trước nút chính |
| Khối dính mép màn hình | Thiếu page-container / pa-* | Xem `ui-layout-patterns.md` |

---

## Meta viewport mặc định của FUI (ảnh hưởng UI)

Trang FUI mặc định đã có sẵn trong `<head>` (KHÔNG lặp lại trong header.html):

```html
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"/>
```

Hệ quả khi đánh giá/thiết kế:
- `user-scalable=no, maximum-scale=1` — user **không pinch-zoom được** → font/nút phải đủ lớn ngay từ đầu trên mobile, không trông chờ zoom.
- `width=device-width, initial-scale=1` — layout theo đúng CSS pixel của thiết bị; breakpoint Vuetify hoạt động chuẩn.
- `viewport-fit=cover` — trang tràn vào vùng notch/home-indicator trên iOS → nội dung sát mép trên/dưới cần `env(safe-area-inset-*)` padding khi làm fullscreen/HTMLOnly.
