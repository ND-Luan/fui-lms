# FUI Definition-of-Done Checklists

> File này sở hữu: **checklist definition-of-done trước khi publish (module.json, `.vue`, SP, deploy workflow)** và **ma trận chọn tầng kiểm chứng theo triệu chứng**.

Use these checklists before publishing any artifact. Each item is a gate — a module/SP/component is not ready if any required item is unchecked.

---

## Chọn tầng kiểm chứng theo TRIỆU CHỨNG (đọc trước khi render)

Năm tầng, chênh nhau khoảng **hai bậc** về chi phí mỗi lượt:

| Tầng | Lệnh | Chi phí | Thấy được gì |
|---|---|---|---|
| 1 | `module_validate` | tức thì, chỉ đọc file | lỗi quy tắc/tham chiếu tĩnh |
| 2 | `module_outline` | tức thì | cấu trúc layout, action mồ côi, dialog không ai mở |
| 3 | `module_simulate` | ~1 s | luồng chạy: action chain, watch, OUT gán gì |
| 4 | `component_preview` | browser, 1 component | lỗi của riêng một `uc-*.vue` |
| 5 | `module_simulate({renderUI:true})` | browser, ~10–30 s | **hình ảnh thật**: layout, chiều cao, style, responsive |

**Quy tắc:** đi từ tầng rẻ nhất **bắt được triệu chứng đó**, không mặc định leo thẳng lên tầng 5. Tầng 5 là tầng duy nhất thấy được hình ảnh, nhưng cũng là tầng duy nhất **không nói được vì sao** — nó chỉ chụp lại hậu quả.

| Triệu chứng | Tầng rẻ nhất bắt được | Vì sao |
|---|---|---|
| Trang trắng / app rỗng, **không** JS error, **không** `[Vue warn]` | **1** `module_validate` | dấu hiệu kinh điển của statement trong một `:attr` — Vue nuốt lỗi compile template, browser không có gì để báo |
| `[Vue warn] Property or method "x" is not defined` | **1** | biến dùng trong template chưa khai trong `data[]` |
| Nút bấm không làm gì | **1** (CALL target) → **3** (luồng thật) | |
| `Unknown custom element: <f-…>` / component trống | **1** | sai tên component, hoặc thiếu import bắt buộc |
| Chart không vẽ ra gì | **1** (thiếu `echarts.min.js`/`fechart.js`) → **5** (canvas 0-size) | thiếu import chiếm phần lớn số ca |
| Cột lệch, một hàng quá chật | **2** `module_outline` (Σw > 12) | |
| Dialog không mở được | **2** (`⚠ không thấy lệnh mở`) → **3** | |
| Action chạy sai thứ tự · watch lặp vô hạn · CONFIRM/MESS không đúng nhánh | **3** `module_simulate` | |
| Số liệu sai · `undefined`/`NaN` hiện trên trang | **3** | gần như luôn là `OUT`/mapData trỏ sai khoá, không phải lỗi hiển thị |
| API trả không đúng shape mong đợi | `db_sp_verify` (tĩnh, zero HTTP) | suy luận từ thân SP thật + sinh sẵn `apiMocks` cho tầng 3 |
| Một `uc-*.vue` hiển thị sai | **4** `component_preview` | chứng minh component đúng trước ⇒ mọi lỗi còn lại là lỗi lắp ráp |
| Bảng tràn ngang · chiều cao sai · style rò rỉ · khoảng cách xấu · vỡ ở mobile | **5** `renderUI` | không tầng nào khác thấy được hình học |
| Import/asset không nạp được | **5**, đọc section `⛔ MÔI TRƯỜNG THIẾU FILE` | lỗi của môi trường, **không** sửa module theo nó |

**Đọc report renderUI đúng thứ tự:** khối `═══ CHẨN ĐOÁN ═══` ở đầu đã xếp mọi thứ hỏng vào ba nhóm theo **nơi phải sửa** — `[MÔI TRƯỜNG]` (sửa môi trường trước, lỗi hai nhóm dưới có thể chỉ là hệ quả) · `[MODULE]` (module.json/script.js/component) · `[HIỂN THỊ]` (DOM audit + ảnh). Dòng `↪` gợi ý tầng rẻ hơn lẽ ra bắt được triệu chứng đó.

**Dấu hiệu phải DỪNG render lại:** dòng `Δ so với lượt trước` báo *không chỉ số nào đổi*. Nghĩa là thay đổi vừa rồi không chạm tới lỗi đang có — render lại lần nữa với cùng hướng sửa chỉ tốn thêm một lượt. Quay xuống tầng 1–3 để biết **vì sao**, rồi mới lên lại tầng 5.

---

## Module Checklist

### Structure

- [ ] `_moduleInfo.json` exists with `ModuleID`, `ModuleName`, `Framework`, `mTitle`, `HTMLOnly`
- [ ] `module.json` exists and is valid JSON (no trailing commas, no comments) — **validate trước khi ghi**: sau mỗi lần edit JSON dài, mentally check hoặc re-read để đảm bảo không có trailing comma sau element cuối cùng trong mảng/object
- [ ] If custom components are used: `components/_components.json` exists and lists all `uc-*.vue` files
- [ ] `imports/_imports.json` exists if module imports external JS/CSS

### module.json — Data

- [ ] All reactive state variables declared in `data[]` before being referenced in actions
- [ ] All named actions are reachable (at least one `CALL` or `watch` or button click references each)
- [ ] No hardcoded IDs — inputs reference `vueData.someVar` not literal numbers
- [ ] `OUT` keys match declared state variable names exactly (case-sensitive)

### module.json — Actions

- [ ] Every `API` action has both `IN` and `OUT` (or `CALLBACK`) defined
- [ ] Every delete action has `CONFIRM` before `API`
- [ ] Every mutating action has a `CALLBACK` that either reloads data or shows `MESS`
- [ ] Literal string values in `IN` use backtick prefix or single-quote wrap: `` "`winId" `` or `"'text'"`
- [ ] `IF/THEN/ELSE` branches all have matching action structures
- [ ] No raw `EXE` blocks that duplicate logic already expressible in actions

### module.json — Controls

- [ ] `controls` array starts with `{ "prop": "fluid grid-list-md", "rows": [...] }`
- [ ] Every item in `cols` has a `w` property
- [ ] Events use `v-on:click` not `@click`
- [ ] No `children` key — nesting uses `innerHTML` array
- [ ] Permission gates use `col: { "v-if": "vueData.user.SystemRight>=N" }` (not on `attr`)
- [ ] All `v-if` expressions include `vueData.` prefix where referencing state
- [ ] Dialog containers use `el: "hidden-container"` — one per dialog

### module.json — Watch

- [ ] Watch keys reference declared state variables
- [ ] `deep-watch` used for nested object/array observation
- [ ] No watch entry calls an action that also triggers the same watch (infinite loop risk)

### UI Quality

- [ ] Vuetify 2 classes/props used before inline `style`
- [ ] `f-*` components chosen over raw `v-*` when FUI equivalent exists
- [ ] Tables use `f-table` (not `v-data-table`) — cả CRUD lẫn read-only (read-only = không khai `:update-api`)
- [ ] Tổng cột dùng `sum-format` (object → hàng tổng trong bảng; string → dòng text dưới bảng) — không tự dựng hàng tổng thủ công
- [ ] Charts dùng **`f-echart`** — không dùng `v-chart`, `<canvas>`, hay lib khác
- [ ] Chart tuân thủ **Quy ước hiển thị mặc định** trong components-echart.md
- [ ] Date/time fields use `f-date`/`f-time` (not `v-text-field` + manual parsing)

### Import JS/CSS

- [ ] Với mỗi component có import (xem bảng trong `component-quickref.md`): đã gọi `file_import_list` để kiểm tra — import đang có hay chưa
- [ ] Nếu thêm component cần import và chưa có → `file_import_new` cho từng file thiếu
- [ ] Nếu bỏ component có import → kiểm tra import đó còn dùng ở component/module khác không; nếu không còn → `file_import_delete`
- [ ] **Nếu có `f-echart`**: cả hai import phải có và đúng thứ tự — `echarts.min.js` trước, `fechart.js` sau:
  - `/include/chart/echarts.min.js`
  - `/include/chart/fechart.js`

### Validate trước khi publish

- [ ] Module mới có cả UI lẫn API: đã dựng UI bằng dữ liệu cứng trong `data[]` + `module_simulate({ renderUI: true })` QA hình ảnh TRƯỚC khi chốt contract API và viết SP — xem quy trình đầy đủ ở [fullstack-workflow.md](fullstack-workflow.md)
- [ ] Chạy `module_validate` sau khi sửa `module.json` — sửa hết **error** (CALL target không tồn tại, `@`/`#` shorthand, `children`, grid structure sai...)
- [ ] Warning được review từng cái — có thể là chủ ý (component chưa có trong list, param optional...), nhưng không được bỏ qua mà không đọc
- [ ] Warning nhóm **`[design]`** (toolbar dialog có màu, nút xóa màu đỏ, width dialog lạ, form không floating label, delete thiếu CONFIRM, nút Đóng thừa, tự dựng v-snackbar/v-alert thay vì MESS/MESSBOX, f-table/f-sheet bảng chính thiếu `":height": -16` nên cả trang cuộn thay vì cuộn trong bảng...) = vi phạm chuẩn thẩm mỹ mặc định — **phải sửa**, trừ khi chính user đã yêu cầu rõ kiểu khác trong phiên này
- [ ] Strict mode (`FUI_MCP_STRICT=1`): error sẽ CHẶN publish — không thể bỏ qua
- [ ] Chạy `module_outline` và ĐỌC cây layout để tự review cấu trúc UI: mỗi row có Σw hợp lý (≤12)? dialog nào có `⚠ không thấy lệnh mở`? action nào có `⚠ không thấy nơi gọi`? state nào `⚠ không thấy dùng`?
- [ ] Với module có logic runtime phức tạp (action chain, watch cascade, dialog flow): chạy `module_simulate` với kịch bản luồng chính + `apiMocks` (shape lấy từ snippet do `db_sp_verify` sinh sẵn — không gọi API thật) + assert điều kiện then chốt — sửa mọi `⚠` và assert ✘ trong trace trước khi publish
- [ ] **QA hiển thị cuối cùng (khi có Playwright)**: chạy `module_simulate({ renderUI: true, vueData: {..demo data..}, apiMocks: {...} })` — render browser thật, ĐỌC screenshot trả về (luôn có ảnh inline — PNG quá lớn tự nén JPEG) + DOM audit (app rỗng? tràn ngang? text "undefined"/"NaN"? ảnh vỡ? canvas chart 0-size?) + JS error/`[Vue warn]` + state cuối vueData — tự fix lỗi hiển thị rồi render lại cho tới khi sạch. **Có section `⛔ MÔI TRƯỜNG THIẾU FILE` thì đọc nó TRƯỚC**: import/asset chưa nạp được là lỗi môi trường (chạy lệnh nó gợi ý — `project_sync`/`module_get`), các lỗi JS/hiển thị bên dưới có thể chỉ là hệ quả — đừng sửa module.json theo chúng — cách ĐỌC ảnh có hệ thống: xem `ui-screenshot-review.md`. Chart/animation render thiếu trong ảnh → tăng `settleMs` (vd 1500). Dialog đang mở được chụp riêng `render-dialog.jpg`. Module có dùng trên mobile → render thêm lượt `device: "mobile"`. Không có Playwright → bỏ qua bước này (tool sẽ trả hướng dẫn cài)
- [ ] **Vừa sửa cả cấp project lẫn cấp module** (component project, import project, `project.json`/menu): publish phần **cấp project** TRƯỚC rồi mới render — renderUI lấy `$projectData` + component project + CSS project từ server (`_aset`), nên bản project chưa publish sẽ không xuất hiện trong ảnh; ngược lại phần cấp module dựng cục bộ, cứ sửa-render-sửa thoải mái rồi publish sau. Riêng **component cấp project** thì không còn là lời nhắc: renderUI đối chiếu từng `uc-*.vue` local với bundle server và **chặn cứng** (không có cờ bỏ qua) nếu lệch — kiểm chứng bản local bằng `component_preview`, rồi `component_new`/`component_update`, rồi mới render. Bị chặn vì bản server mới hơn (ai đó sửa trên web IDE) → `project_sync`, đừng push đè

### Publish Workflow — Smart (sửa cái nào, up cái đó)

Không phải lúc nào cũng dùng `module_publish_html`. Chọn tool theo phần đã thay đổi:

- [ ] Chỉ sửa `module.json` → dùng `module_publish_json` (không cần preview/approval)
- [ ] Sửa `header.html` / `body.html` / title → `module_preview` → user approve → `module_publish_html` (đã kèm module.json, không cần gọi thêm `module_publish_json`)
- [ ] Sửa `script.js` (kể cả làm rỗng) → `module_publish_script` — **⚠️ `module_publish_html` không clear script rỗng trên server**
- [ ] Sửa `uc-*.vue` → `component_new` (lần đẩy đầu tiên) hoặc `component_update` (các lần sau), per file — `component_update` lỗi cứng nếu component chưa có trên server, không âm thầm tạo
- [ ] Nhiều phần → gọi tool tương ứng cho từng phần, lần lượt

Khi dùng `module_publish_html`:
- [ ] `module_preview` đã chạy và diff đã được review
- [ ] User đã xác nhận rõ ràng
- [ ] Có approval token từ `module_preview`

---

## Stored Procedure Checklist

### Naming

- [ ] Prefix is `spAPI_` (e.g., `spAPI_ContractList`, `spAPI_ContractInsert`)
- [ ] Name follows pattern: `spAPI_{Entity}{Action}` where Action is `List`/`Select`/`Insert`/`Update`/`Delete`/`Save`
- [ ] No spaces, no lowercase prefix (`sp_`, `SP_`, etc.)

### Parameters

- [ ] `@sys_UserID int` present in all write operations (INSERT/UPDATE/DELETE)
- [ ] `@sys_SystemRight int` present when permission check is needed
- [ ] Input parameters declared before system parameters
- [ ] No unused parameters

### Security

- [ ] Permission check at top: `IF @sys_SystemRight < N BEGIN RAISERROR(N'[Unauthorized]Bạn không có quyền...', 16, 1) RETURN END` — severity luôn là `16`, prefix `[Unauthorized]` bắt buộc trên lỗi thiếu quyền để tAPI trả HTTP 401 (xem [tapi-reference.md](tapi-reference.md) §5)
- [ ] No direct string concatenation for SQL (use parameterized queries)
- [ ] `GRANT EXECUTE ON [spName] TO [public]` present after `CREATE PROCEDURE`
- [ ] `ALTER PROCEDURE` scripts do NOT include a new `GRANT EXECUTE` (not needed)

### Logic

- [ ] SP returns exactly what FUI `OUT` expects (column names match exactly)
- [ ] Error conditions use `RAISERROR(N'...', 16, 1)` followed by `RETURN` (not silent failures)
- [ ] Transactions used for multi-step writes
- [ ] SP logic reviewed statically (read the body, reason about branches/edge cases) before deploy — never smoke-tested against the live endpoint

### Deploy Workflow

- [ ] `db_sp_save` called first (save to local, no DB change)
- [ ] Full SP body reviewed in local file before deploy
- [ ] Summary presented to user: SP name, operation type (CREATE/ALTER), affected tables
- [ ] User has explicitly confirmed before `db_sp_deploy`
- [ ] Sau deploy bất kỳ API nào (đọc hay ghi) sắp wire vào module.json → `db_sp_verify` một lần: suy luận tĩnh response shape/contract lỗi từ thân SP thật, đối chiếu params — **không gọi endpoint thật**, tool này không bao giờ gọi HTTP/SQL nào cả
- [ ] API **ghi** (Insert/Update/Delete) → kiểm tra tính đúng bằng cách đọc thân SP (`db_sp_get`/`db_sp_verify`) và suy luận logic tĩnh (WHERE, transaction, RAISERROR); test luồng UI gọi API ghi bằng `module_simulate({ apiMocks: {...} })` với dữ liệu giả (snippet có sẵn từ `db_sp_verify`), không gọi API thật

---

## Vue Component Checklist (`uc-*.vue`)

### File

- [ ] Filename starts with `uc-` prefix
- [ ] Registered in `_components.json`
- [ ] `<style scoped>` block (nếu có): mọi selector đã tự tiền tố bằng class định danh của component — `scoped` KHÔNG scope thật (server chỉ nối text `ComCSS`), selector trần sẽ leak sang component khác. Xem [component-design.md](component-design.md)
- [ ] No backtick template strings inside `<template>`

### API Design

- [ ] All inputs declared as `props` with types
- [ ] Component emits events upward (`input`, `change`, `select`, `action`) rather than mutating parent state
- [ ] Props use neutral names (`items`, `value`, `label`) not screen-specific names
- [ ] Loading, empty, and error states handled (prop or slot)

### Behavior

- [ ] Component does not fetch data directly unless it is explicitly a data-owning component
- [ ] No hardcoded route/module paths inside the component
- [ ] No permission logic inside component — permission gating stays in `module.json`

### Kiểm chứng trong không gian riêng (trước khi ráp vào module / trước khi push)

- [ ] Đã chạy `component_preview` với **ít nhất 2 case**: một case dữ liệu bình thường và một case biên (danh sách rỗng / chuỗi rất dài / thiếu trường) — component sai ở case biên là lỗi hay gặp nhất
- [ ] Đã ĐỌC ảnh chụp của **cả desktop lẫn mobile** (mặc định tool render cả hai): không tràn ngang, không vỡ layout ở 390px, không text "undefined"/"NaN"
- [ ] Không còn JS error / `[Vue warn]` trong report
- [ ] Component có tương tác → `scenario` với `click`/`set` + `assert` đã chạy đúng (dùng `nth`, không `item`/`index`)
- [ ] Component tự đo chiều cao (chart, table) → thử thêm `viewport` chiều cao thấp
- [ ] **Component cấp project**: đã push (`component_new` lần đầu / `component_update` các lần sau) NGAY SAU khi preview sạch — renderUI của module sẽ chặn cứng nếu bản local còn lệch bản server

---

## Import File Checklist

- [ ] File type matches declared `ContentType` (`.js` → `application/javascript`, `.css` → `text/css`)
- [ ] `sort` >= 40 khi thêm import mới — giá trị 1–39 dành cho hệ thống, không dùng
- [ ] Content tested locally before `file_import_upload_content`
- [ ] No sensitive data (tokens, passwords) in JS/CSS import files
- [ ] If updating an existing file: `file_import_get` called first to review current content

---

## Debug Workflow — Sau khi publish có lỗi

Khi server báo lỗi hoặc trang hiển thị sai sau khi publish:

1. **Review file vừa sửa trước tiên** — đọc lại toàn bộ file đã chỉnh sửa trong lần publish đó, không nhảy sang nguyên nhân khác
2. Nếu file trông đúng: chạy `module_preview` để xem diff — kiểm tra server đang lưu gì so với local
3. Nếu preview báo `Controls: 0` / `Data keys: 0`: đó là server đang giữ bản cũ bị lỗi, không phải local — push lại để ghi đè
4. Chỉ khi local file đã xác nhận đúng mà lỗi vẫn còn: mới kiểm tra các file khác (header.html, script.js, imports)

---

## Quick Risk Gate

Before any mutating tool call, answer:

| Question | If NO → |
|---|---|
| Is this a ReadOnly tool? | Confirm intent with user |
| Have I shown the user a summary? | Show summary first, then wait |
| Is this a 🔴 Destructive tool? | Require explicit user confirmation |
| For `module_publish_html`: do I have an approval token? | Run `module_preview` first |
| For `db_sp_deploy`: has user seen the SP body? | Show SP body, wait for OK |

See [tools-registry.md](tools-registry.md) for the full per-tool classification.
