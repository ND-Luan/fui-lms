# Controls Styling — Bộ từ vựng layout được duyệt (chỉ dùng thế này)

> File này sở hữu: **bộ class/prop/style được duyệt cho `controls` và `.vue`, thứ tự ưu tiên khi trình bày**. Chọn chế độ thẩm mỹ + giới hạn `border-radius` xem [design-modes.md](design-modes.md).

**Quy tắc số 1: KHÔNG tự thêm `style` và `class` để "làm đẹp" UI.** Chỉ dùng đúng bộ từ vựng dưới đây — được rút trích từ 78 file `module.json` thực tế của 5 dự án (contest-score, security-manager, fp, lhu-test, lhu-lib). Nếu người mô tả không yêu cầu một hiệu ứng/khoảng cách/màu cụ thể → **không thêm gì cả**. Layout của FUI (grid + Vuetify + theme project) đã đủ đẹp và nhất quán.

> Thống kê thực tế: trong 1.284 control object, chỉ ~12% dùng `attr.style` (gần như chỉ để đặt `width`), và **không có class tùy chỉnh nào** — 100% là class tiện ích chuẩn của Vuetify. AI hay mắc lỗi thêm `style="padding/margin/border/box-shadow/border-radius/background"` và class tự chế → **đừng làm vậy.**

---

## Nguyên tắc

1. **Mặc định: không style, không class.** Chỉ đặt `el`, `attr` (v-model/label/:items/:action…), `w`, `col` khi cần chia cột.
2. Cần khoảng cách/căn lề → dùng **class tiện ích Vuetify** trong bảng dưới, KHÔNG viết `style`.
3. `style` chỉ dùng cho **`width` cố định** của field lọc (`style: "width:200px"`) — không dùng cho padding/margin/border/color/background.
4. Màu sắc: dùng prop component (`color="primary"`) hoặc class `primary--text`/`error--text` — không `style="color:#..."`.
5. **Không** tự thêm `border`, `border-radius`, `box-shadow`, `background`, `padding`, custom class → trừ khi user yêu cầu rõ.
6. **Padding gọn — mặc định `pa-2`.** Khi cần padding, dùng `pa-2` (hoặc `pa-1`/`pa-0`); **KHÔNG dùng padding lớn** (`pa-4`, `pa-6`, `pa-8`...) gây lãng phí không gian màn hình. Tương tự margin: ưu tiên `-1`/`-2`, tránh `-6`/`-8`.
7. **Khi user *có* yêu cầu trình bày cụ thể — theo đúng thứ tự ưu tiên này**, chỉ xuống nấc sau khi nấc trước không đáp ứng được:
   `prop của component` (`color`, `outlined`, `dense`, `elevation`) → `class tiện ích Vuetify` (`pa-*`, `ma-*`, `d-flex`, `text-*`, `primary--text`) → `mw-*` cho bề rộng → custom class → inline `style` (**cuối cùng**).

---

## 1. `prop` của container / row (grid wrapper)

Container ngoài cùng và mỗi row chỉ dùng các token sau (theo tần suất thực tế):

| Token | Dùng để | Tần suất |
|---|---|---|
| `grid-list-md` | Khoảng cách chuẩn giữa các cột (container) | rất cao |
| `fluid` | Container rộng hết chiều ngang | cao |
| `row` | Đánh dấu row | rất cao |
| `justify-center` | Căn giữa nội dung theo chiều ngang | rất cao |
| `justify-left` / `justify-end` / `justify-start` | Căn trái / phải | vừa |
| `text-center` / `text-left` | Căn text | vừa |
| `mw-800` `mw-1000` `mw-1200` `mw-1400` | **Giới hạn bề rộng nội dung** (FUI class) — trang form/nhập liệu căn giữa | vừa |
| `hidden-container` | Bọc dialog (v-dialog/f-dialog) — không chiếm layout | dùng cho dialog |
| `grid-list-lg` | Khoảng cách rộng hơn grid-list-md | thấp |
| `pa-0` / `py-0` | Bỏ padding container khi cần sát mép | thấp |
| `page-container` / `page-navigation` | Layout filter-bar sticky (xem ui-layout-patterns.md) | hiếm |

> **Công thức mặc định** cho một trang bình thường: container `"fluid grid-list-md"`, mỗi row `"row"` (thêm `justify-center` nếu muốn căn giữa). Trang form nhập liệu: thêm `mw-1000`/`mw-1200` để giới hạn bề rộng.

## 2. `col` (cột grid bao ngoài control)

`col` chỉ dùng cho: chia độ rộng, hoặc căn/thu gọn cột. Token thực dùng:

| Token | Dùng để |
|---|---|
| `shrink` | **Field lọc bề rộng cố định** (không giãn) — phổ biến nhất |
| `text-end` / `text-start` / `text-center` | Căn nội dung trong cột |
| `pa-0` | Bỏ padding cột |
| `align-self-center` | Căn giữa theo chiều dọc |

`col` có thể viết dạng chuỗi ngắn `"text-end"` hoặc object `{ "class": "shrink" }`. Thêm `"v-if": "..."` vào `col` để ẩn/hiện cả cột theo quyền/điều kiện.

## 3. `attr.class` (class trên chính control)

Chỉ dùng class tiện ích Vuetify. Nhóm thực dùng:

| Nhóm | Token |
|---|---|
| Margin | `mt-1 mt-2 mt-3` · `mb-1 mb-2 mb-4` · `my-2` · `ml-1 ml-2` · `mr-1 mr-2` |
| Padding | `pa-0 pa-2` · `pt-3` · `py-1` — **tránh `pa-4/6/8`** (lãng phí không gian) |
| Flex | `d-flex` · `flex-column` · `align-center` · `justify-center` · `justify-end` · `flex-grow-0` · `flex-wrap` · `flex-md-grow-0` |
| Text | `text-center` · `text-left` · `text-right` |
| Cỡ chữ / đậm | `text-h6` · `subtitle-1` · `body-2` · `caption` · `font-weight-bold` · `font-weight-medium` |
| Màu chữ | `primary--text` · `error--text` · `grey--text` · `white--text` (Vuetify 2) |
| Màu nền | prop `color="primary"` trên component, hoặc class nền Vuetify `primary` · `grey lighten-4` |
| Bo góc | `rounded` · `rounded-lg` · `rounded-0` |
| Đổ bóng / phẳng | prop `elevation="0"` / `flat` / `outlined` trên `v-card`/`v-btn` |
| Ẩn/hiện theo breakpoint | `d-none d-md-flex`... |
| Kích thước | prop component (`max-width`, `width`, `dense`, `small`, `x-large`) — không `style="width:..."` trừ khi cần px cố định |

**Trước khi đặt một class mới → tra bảng trên.** Chỉ được định nghĩa class riêng khi cần thứ Vuetify
không có sẵn: grid-template phức tạp, animation, pseudo-element (`::before`), selector con đặc thù.
Khi đó đặt trong `header.html`, tên class có prefix rõ ràng, **số lượng tối thiểu** — không tái tạo
lại card/badge/spacing mà Vuetify đã có.

> `flex-md-grow-0` + `col: { class: "shrink" }` + `style: "width:200px"` = **field lọc bề rộng cố định** — pattern chuẩn cho toolbar (xem [ui-patterns.md](ui-patterns.md) §4). Đây là chỗ hợp lệ duy nhất để dùng `style` (chỉ `width`).

---

## 4. Cách chia độ rộng: `w` (KHÔNG dùng style/class cho việc này)

| `w` | Ý nghĩa |
|---|---|
| `1`–`12` | Số cột grid (12 = full row) |
| số `>12` (vd `250`) | Bề rộng cố định theo px (`flex-basis`) |
| `""` (rỗng) | Tự co theo nội dung |

Chia cột **luôn dùng `w`**, không dùng `style="width:..%"` hay class `col-6` tự chế.

---

## 5. Đối chiếu ĐÚNG / SAI

```json
// ✅ ĐÚNG — gọn, dùng w + prop chuẩn, không style thừa
{ "el": "v-text-field", "w": 6, "attr": { "v-model": "hoTen", "label": "Họ tên" } }

// ❌ SAI — style/class tự chế không cần thiết
{ "el": "v-text-field", "w": 6, "attr": {
    "v-model": "hoTen", "label": "Họ tên",
    "style": "padding:8px; border:1px solid #ddd; border-radius:8px; margin-bottom:12px",
    "class": "my-custom-input rounded-lg shadow" } }
```

```json
// ✅ ĐÚNG — card mặc định của Vuetify, không tự style
{ "el": "v-card", "attr": { "class": "pa-2" }, "innerHTML": [ ... ] }

// ❌ SAI — tự vẽ lại card
{ "el": "v-card", "attr": { "style": "background:#fff; box-shadow:0 4px 12px rgba(0,0,0,.1); border-radius:16px; padding:24px" } }
```

---

## 6. Khi nào ĐƯỢC thêm style/class

Chỉ khi **người mô tả yêu cầu rõ** một yêu cầu trình bày cụ thể (ví dụ "cho khối này nền xám", "giới hạn bề rộng 800px", "chữ này màu đỏ"). Kể cả khi đó:
- Ưu tiên prop component → class tiện ích Vuetify → `mw-*` cho bề rộng → cuối cùng mới `style`.
- Nếu áp `border-radius` theo yêu cầu: tuân giới hạn trong [design-modes.md](design-modes.md) (khung lớn ≤12px, vừa ≤8px, nhỏ ≤6px).
- Không viết `<style>` trong `.vue`; CSS đặt ở `header.html`.

> Tóm lại: **thấy mình sắp gõ `style` hoặc đặt tên class mới → dừng lại và hỏi "user có yêu cầu cái này không?". Nếu không → bỏ đi.**
