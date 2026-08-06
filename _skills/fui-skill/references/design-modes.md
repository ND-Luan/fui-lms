# Design System — App-mode vs Web-mode

> File này sở hữu: **quyết định chế độ thẩm mỹ, giới hạn `border-radius`, vòng tích luỹ
> `{projectId}/DESIGN.md`**. Về class/prop/style cụ thể được duyệt xem
> [controls-styling-vocabulary.md](controls-styling-vocabulary.md). Về anatomy dialog/form chuẩn
> dùng tool `design_read("fui")`.

Trước khi viết bất kỳ `controls` nào, xác định module thuộc chế độ nào. Đây là quyết định đầu tiên
và **cứng** — hai chế độ có bộ quy tắc thẩm mỹ riêng, không được vay mượn qua lại.

---

## 1. Hai chế độ

| | **App-mode** (mặc định) | **Web-mode** |
|---|---|---|
| Áp dụng cho | Phần mềm quản lý: CRUD, danh sách, form, dashboard nội bộ, phân quyền | Landing page, trang giới thiệu sản phẩm, trang công khai (thường `HTMLOnly: true`) |
| Nguồn thẩm mỹ | **DUY NHẤT** `design_read("fui")` + `controls-styling-vocabulary.md` | Brand DESIGN.md (`design_list` → `design_read("<brand>")`) |
| Brand DESIGN.md (nike, linear, bmw...) | **CẤM** — kể cả khi "chỉ lấy màu" | Được phép, chọn theo tone/ngành |
| Style/class tự chế | **CẤM** (theo `controls-styling-vocabulary.md`) | Được phép trong `header.html` |
| Ưu tiên component | `f-*` / `v-*` theo chuẩn FUI | Tự do HTML/CSS |

**Tín hiệu nhận diện Web-mode**: `HTMLOnly: true` trong `_moduleInfo.json`, hoặc user mô tả
"landing page / trang giới thiệu / trang chủ công khai". Mọi trường hợp còn lại → App-mode.
Không chắc → **hỏi user**.

**Bắt buộc với App-mode**: trước khi viết/chỉnh sửa layout, dialog, form → nạp `design_read("fui")`
(nếu chưa nạp trong phiên) để lấy anatomy chuẩn (dialog `v-dialog` phong cách f-dialog, form
floating label, bảng màu/icon).

---

## 2. Override theo project — `{projectId}/DESIGN.md`

Nếu `{projectId}/DESIGN.md` tồn tại trong workspace → file đó **ghi đè** quy tắc cùng chủ đề của
chế độ đang dùng (những gì không đề cập vẫn theo chuẩn chung). **Luôn kiểm tra file này trước khi
thiết kế.**

---

## 3. Vòng tích luỹ chuẩn thiết kế (BẮT BUỘC)

Khi user góp ý/chê một chi tiết UI ("dialog phải...", "nút này màu...", "đừng dùng..."):

1. Sửa module theo góp ý.
2. **Ghi ngay quy tắc đó vào `{projectId}/DESIGN.md`** (tạo file nếu chưa có — theo template ở cuối
   `design_read("fui")`), diễn đạt thành **quy tắc tổng quát + ví dụ JSON đúng/sai**, không chỉ ghi
   lại tình huống cụ thể.
3. Nếu quy tắc rõ ràng áp dụng cho MỌI project (không riêng project này) → nói với user: "quy tắc
   này nên đưa vào chuẩn chung `fui/DESIGN.md`" và đề xuất nội dung — **chỉ user quyết định** cập
   nhật chuẩn chung.

Nhờ vòng này, góp ý của user không bị mất sau phiên chat — lần thiết kế sau tự động tuân theo.

---

## 4. Giới hạn `border-radius`

Áp dụng cho **MỌI brand/style, kể cả khi DESIGN.md của brand đề xuất giá trị lớn hơn**:

| Loại khung | `border-radius` tối đa |
|---|---|
| Khung lớn tổng quát (card container, dialog, section wrapper, panel chính) | `12px` |
| Khung vừa (button lớn, input group, panel con, toolbar) | `8px` |
| Khung nhỏ (button nhỏ, chip, badge, tag, icon container) | `6px` |

Nếu brand DESIGN.md đề xuất `border-radius` lớn hơn mức tương ứng ở trên (ví dụ các brand có bo
tròn mạnh như Airbnb, Notion, Nike...) → **hạ xuống mức tối đa cho phép**, không áp dụng nguyên giá
trị gốc.

**Ngoại lệ**: phần tử tròn hoàn toàn (avatar, icon button dạng chấm tròn) dùng `border-radius: 50%`
— không thuộc phạm vi giới hạn này.
