# FUI MCP Tools — Safety Registry

> File này sở hữu: **phân loại rủi ro từng tool, quy tắc publish "sửa file nào gọi tool đó",
> bí danh tiếng Việt → tool, guard DB enforce ở code, tool SSE-only**. Quy trình DB/SP chi tiết xem
> [db-workflow.md](db-workflow.md); checklist nghiệm thu xem [verification.md](verification.md).

Mọi tool được phân loại theo 2 chiều:

- **ReadOnly** (`R`) / **Mutating** (`M`) — tool có ghi dữ liệu không?
- **Safe** (`✅`) / **RequiresConfirm** (`⚠️`) / **Destructive** (`🔴`) — mức độ rủi ro

> **Nguyên tắc mặc định**: Tool là Mutating và cần xác nhận TRỪ KHI được đánh dấu rõ là ReadOnly/Safe.  
> **Per-call rule**: Safety đánh giá theo input thực tế của từng lần gọi — cùng tool có thể safe hay không tùy ngữ cảnh.
>
> **Strict mode (`FUI_MCP_STRICT=1`)**: khi server chạy strict mode, các tool publish/deploy (`module_update_ui_json`, `module_update_ui`, `module_script_update`, `component_update`, `db_sp_update`) bị **chặn cứng** cho tới khi `skill_get` được gọi trong session; lỗi (error) từ `module_validate` cũng **chặn publish** module.json. Mode thường chỉ cảnh báo mềm.

---

## STDIO/CLI vs SSE/remote — hai cách lập trình khác nhau

Server FUI-MCP và client AI có thể **cùng máy (STDIO)** hoặc **khác máy (SSE)** — điều này quyết định workflow nào khả dụng:

| | STDIO/CLI | SSE/remote |
|---|---|---|
| Filesystem chung với server | Có — client dùng Read/Edit/Write/Grep/Glob của riêng nó chạm thẳng vào file server đọc | Không — hai tiến trình tách biệt, không có ổ đĩa/mount chung |
| Cách sửa file trước khi publish | Sửa file thật trong workspace bằng tool filesystem của client | Gọi tool `*_stage` (xem bên dưới) để server tự ghi nội dung vào workspace |
| Cách tìm kiếm/duyệt nhiều file | Dùng Grep/Glob native của client (rẻ, quét cả thư mục) | Dùng `workspace_glob` / `workspace_grep` (tool riêng, mô phỏng lại) |
| Các tool `_stage`, `workspace_glob`, `workspace_grep` | **Không tồn tại** — server chỉ đăng ký các tool này khi chạy `--sse` | Có sẵn |

**Quy tắc chọn tool khi sửa module.json / header.html / body.html / script.js / component .vue:**
1. Nếu đang ở STDIO/CLI và có thể đọc/ghi file trực tiếp → sửa file, rồi gọi thẳng tool publish tương ứng (`module_update_ui_json`, `module_update_ui`, `module_script_update`, `component_update`).
2. Nếu không có filesystem access (SSE/remote) → gọi tool `*_stage` tương ứng trước để ghi nội dung vào workspace của server, sau đó gọi đúng tool publish y hệt bước 1 — không cần biết gì thêm, tool publish luôn đọc lại từ workspace bất kể nội dung đến từ đâu.

Không bao giờ tự đoán mode đang chạy — nếu tool `*_stage` / `workspace_glob` / `workspace_grep` xuất hiện trong danh sách tool khả dụng, nghĩa là đang chạy SSE và nên dùng chúng thay vì giả định có filesystem.

---

## Đồng bộ trước khi đọc — kiểm tra mtime file

Mọi file do FUI MCP lấy về workspace từ server (`module.json`, `header.html`, `body.html`,
`script.js`, `_moduleInfo.json`, `uc-*.vue`, `project.json`, `_projectInfo.json`,
`_db/sp/{name}.sql`...) chỉ là **bản sao tại thời điểm checkout gần nhất** — nội dung trên server có
thể đã bị người khác sửa sau đó.

**Quy tắc bắt buộc**: trước khi đọc bất kỳ file nào thuộc nhóm trên (để review/sửa), kiểm tra thời
gian sửa đổi cuối (mtime) của file trên đĩa. **Cũ hơn 48 giờ → phải đồng bộ lại từ server trước khi
đọc** — không review/sửa trên bản có thể đã lỗi thời, và không publish đè lên thay đổi mới hơn của
người khác mà không biết.

Các tool đọc (`module_validate`, `module_outline`, `module_simulate`, `module_preview`,
`db_schema_read`, `db_sp_verify`) **tự phát cảnh báo** khi bản local quá 48h — thấy dòng `⏳ ... đồng
bộ lần cuối cách đây N ngày` thì chạy lệnh nó nêu trước khi sửa/publish. Muốn tự kiểm:

```powershell
(Get-Item "<đường-dẫn-file>").LastWriteTime
```

**Tool đồng bộ theo loại file** — mỗi tool làm mới **toàn bộ** file của phạm vi đó, không phải một file:

| File | Tool đồng bộ |
|---|---|
| `module.json`, `header.html`, `body.html`, `script.js`, `_moduleInfo.json`, `uc-*.vue` module-scope, nội dung import 2 scope | `module_get` |
| `uc-*.vue` project-scope (`{projectId}/components/`) | `component_get`, hoặc `project_sync` cho cả project |
| `project.json`, `_projectInfo.json`, `_modules.json`, `imports/*` (cả nội dung) | `project_sync` |
| `_db/schema.json` **và** toàn bộ `_db/sp/*.sql` | `db_schema_get` |
| Một SP lẻ | `db_sp_get` |

**Luôn ghi đè, không hỏi.** Sync không so sánh để quyết định có ghi hay không — nó ghi. Thứ bảo vệ
sửa đổi local là `{workspaceRoot}/_history/`: mọi file sắp bị ghi đè (hoặc xoá) được chép vào đó
trước, giữ nguyên hình dạng đường dẫn gốc và kèm thời điểm trong tên file:

```
_history/{projectId}/modules/{moduleId}/module_20260801_143022.json
_history/{projectId}/_db/sp/spAPI_X_20260801_143022.sql
_history/{projectId}/components/uc-abc_20260801_143022_deleted.vue   ← _deleted: bị xoá, không phải ghi đè
```

Dòng `💾 N file local khác bản server → bản cũ đã lưu vào _history/` là **thông báo, không phải câu
hỏi**. Muốn lấy lại bản cũ: chép ngược file trong `_history` về đúng đường dẫn mà subpath của nó mô
tả (bỏ phần `_{thời điểm}` khỏi tên), rồi publish/deploy lại như bình thường. `_history` không bao
giờ tự dọn — người dùng tự xoá khi thấy đủ.

Không có filesystem access (SSE/remote): không áp dụng — các tool đọc (`module_get_ui`,
`component_get`, `db_sp_get`...) luôn fetch trực tiếp từ server mỗi lần gọi, không có bản cache cũ
trên đĩa client để lo.

---

## Bí danh người dùng → tool

User thường gọi tool bằng tên thân mật tiếng Việt. Bảng tra ngược (cách nói → tool đúng):

| User nói | Tool |
|---|---|
| "module nào đang active", "đang làm module gì" | `session_read` |
| "chọn module", "đổi module đang làm việc" | `session_set` |
| "bỏ active module" | `session_clear` |
| "resolve target" | `session_resolve` |
| "danh sách project" | `project_list` |
| "tạo project", "cập nhật project" | `project_update` |
| "cập nhật project.json" | `project_update_data` |
| "đồng bộ project", "refresh project", "lấy project.json" | `project_sync` |
| "danh sách module" | `module_list` |
| "tạo module mới", "đổi tên module", "đổi ID module", "đổi framework" | `module_update` |
| "xóa module", "xoá module" | `module_delete` |
| "lấy module về", "xem module", "đọc module", "down", "clone module", "refresh", "pull mới nhất" | `module_get` |
| "lấy module.json" | `module_get_ui` |
| "lấy header/body html" | `module_get_html` |
| "cập nhật module.json" | `module_update_ui_json` |
| "xem trước", "kiểm tra trước khi up", "diff" | `module_preview` |
| "validate module", "kiểm tra module.json" | `module_validate` |
| "review giao diện", "xem layout", "outline module" | `module_outline` |
| "mô phỏng", "test luồng", "simulate module", "chạy thử action" | `module_simulate` |
| "render giao diện", "xem UI thật", "chụp màn hình module", "xem trên mobile" | `module_simulate({ renderUI: true })` |
| "up header", "up body", "up html", "cập nhật html", "đẩy lên" | `module_update_ui` |
| "xem component", "đọc component vue" | `component_get` |
| "thử component", "test component riêng", "xem component có chạy không", "component trên mobile" | `component_preview` |
| "up component", "push component", "tạo component", "sửa component" | `component_update` |
| "xóa component", "xoá component" | `component_delete` |
| "sync component" | `component_list` |
| "up script", "push script.js", "cập nhật script" | `module_script_update` |
| "up style", "push style.css", "cập nhật CSS module" | `module_css_update` |
| "danh sách import file", "sync import" | `file_import_list` |
| "lấy nội dung file import" | `file_import_get` |
| "cập nhật nội dung file" | `file_import_upload` |
| "thêm import file" | `file_import_new` |
| "cập nhật import file" | `file_import_update` |
| "xóa import file" | `file_import_delete` |
| "lấy skill rules" | `skill_get` |
| "lưu user token", "set userToken", "token để gọi API" | `db_user_token_set` |
| "đổi password DB", "rebuild dbToken", "cập nhật kết nối DB" | `db_token_rebuild` |
| "danh sách design", "có style nào" | `design_list` |
| "lấy design", "dùng style X" | `design_read` |

Mô tả chức năng đầy đủ của từng tool đã có sẵn trong schema MCP — bảng trên chỉ để ánh xạ cách nói,
mức rủi ro xem các bảng bên dưới.

---

## Session Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `session_read` | R | ✅ | Chỉ đọc session hiện tại |
| `session_set` | M | ✅ | Set active target — reversible |
| `session_clear` | M | ✅ | Clear target — không xóa data |
| `session_resolve` | R | ✅ | Resolve path string, không ghi |

---

## Project Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `project_list` | R | ✅ | Chỉ đọc |
| `project_update` | M | ⚠️ | Tạo/cập nhật project — tóm tắt trước khi gọi |
| `project_update_data` | M | ⚠️ | Ghi đè project.json — preview với user |
| `project_sync` | M | ✅ | Refresh **mọi file cấp project**: project.json, `_projectInfo.json`, `_modules.json`, component `.vue`, metadata import **và nội dung từng import file**; xóa file `.vue`/import content local nào đã từng được track nhưng server không còn nữa (component/import mới local chưa publish thì không đụng). Luôn ghi đè; file local khác bản server được lưu vào `_history/` trước |

---

## Module Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `module_list` | R | ✅ | List module từ server — đồng thời refresh cache local (`modules/_modules.json` + `_moduleInfo.json` các module đã checkout) |
| `module_get` | M | ✅ | Fetch module từ server → ghi/refresh TOÀN BỘ vào local workspace (module.json, html, script, .vue, imports 2 scope) + set active session — luôn ghi đè, file local khác bản server được chép vào `_history/` trước; xóa luôn `.vue`/import content local đã từng track nhưng server đã xóa (cũng lưu `_history/` kèm hậu tố `_deleted`). Metadata đọc từ cache `_modules.json`, không gọi API list — cache miss → chạy `module_list` trước. Không tham số → refresh module đang active |
| `module_get_ui` | R | ✅ | Fetch module.json — ghi xuống local nếu module đã checkout |
| `module_get_html` | R | ✅ | Fetch body html — ghi xuống local nếu module đã checkout |
| `module_update` | M | ⚠️ | mode `new`: tạo module — xác nhận ID và tên. mode `update`: sửa metadata (name/ID/framework/mDomain/HTMLOnly) — đọc ModuleInfo từ local, gửi nguyên object + field sửa. Đổi ModuleID → URL đổi (link cũ vỡ) + rename dir local — cảnh báo user trước |
| `module_delete` | M | 🔴 | **Xóa vĩnh viễn module trên server (FUI_Dev_moduleDelete) — không khôi phục được, không lưu history.** Đồng thời xóa entry trong `_modules.json`, xóa nguyên thư mục local đã checkout (nếu có), clear active session nếu đang trỏ vào module đó. Yêu cầu xác nhận rõ ràng từ user trước khi gọi |
| `module_update_ui_json` | M | ⚠️ | Ghi **chỉ module.json** lên server — không đụng header/body/title/script. Không cần preview |
| `module_preview` | R | ✅ | Diff local vs server — chỉ đọc + tạo token. Kèm sẵn báo cáo `module_validate` |
| `module_validate` | R | ✅ | Static semantic validator cho `module.json` — kiểm tra CALL target, grid structure, `@`/`#` shorthand, `children`, component name, import thiếu, API vs schema... Kèm nhóm warning **`[design]`** (chuẩn thẩm mỹ App-mode mặc định: toolbar dialog có màu/dark, nút xóa màu error/đỏ, width dialog ngoài bộ chuẩn, form thiếu floating label, delete thiếu CONFIRM, nút Đóng thừa ở actions) — phải sửa trừ khi user yêu cầu rõ kiểu khác. Chạy SAU KHI sửa module.json, SỬA HẾT ERROR trước khi publish |
| `module_outline` | R | ✅ | Render module.json thành cây layout TEXT để review UI: grid với w (flag Σw>12), binding, action tóm tắt 1 dòng, dialog + nơi mở, state/action không dùng. Cặp với `module_validate` — validate bắt lỗi quy tắc, outline để review cấu trúc |
| `module_simulate` | R | ✅ | **Mô phỏng runtime FUI trên module.json — không cần browser.** Engine bám sát fastproject.js (runAction/getVueData/setValue/callAPI). Chạy init data[] + kịch bản sự kiện `{set}`/`{click}`/`{call}`/`{exe}`/`{assert}`, API trả mock từ `apiMocks` (hoặc `{__error}` để test ERROROUT), watch + deep-watch tự bắn sau mỗi bước (phát hiện vòng lặp), dialog mở/đóng được trace. Trả trace đầy đủ + state cuối + kết quả assert (isError khi assert fail). Không gọi network thật — hoàn toàn an toàn. **`renderUI: true`** → render module trong browser thật (Playwright chromium headless, optional — cần `npm i -D playwright && npx playwright install chromium`): trang được ghép **đúng như `spA_FUI_ModuleDataSelect`** — file framework theo V2/V3 lấy từ danh mục server (cache 24h) + import project + import module, sort chung `FileSort, FileName`; phần **cấp project** (`$projectData`, component project, CSS project) tải từ server qua `_aset` nên **sửa gì ở cấp project phải publish lên server trước, không thì render vẫn ra bản cũ**, còn phần **cấp module** (module.json, script.js, component/CSS module) dựng cục bộ nên sửa-thử được ngay chưa cần publish. Vue/Vuetify reactivity thật, cùng grammar scenario chạy trên DOM thật (KHÔNG hỗ trợ `item`/`index` — dùng `nth`), thu JS error + `[Vue warn]` + DOM audit (app rỗng, tràn ngang, text "undefined"/"NaN", ảnh vỡ, canvas chart 0-size) + state cuối vueData + screenshot vào `_preview/` (`render.png` trả inline image — quá lớn tự nén JPEG; dialog đang mở chụp riêng `render-dialog.jpg`). Test responsive: `device: "mobile"` (390×844 + touch) / `"tablet"` (768×1024). Chart/animation chậm chưa kịp render → tăng `settleMs` (mặc định 700ms). Toàn bộ network bị chặn — API chỉ trả từ `apiMocks`, demo data bơm qua param `vueData` |
| `module_update_ui` | M | ⚠️ | Push **header.html / body.html / title** lên server — đồng thời cũng push module.json trong cùng lần gọi. Cần approval token từ `module_preview`. Không clear script rỗng |

### Quy tắc publish — Sửa file nào, gọi tool đó

**Trước khi publish module.json (bằng bất kỳ tool nào):** chạy `module_validate` và sửa hết **error** (warning cân nhắc theo ngữ cảnh). `module_update_ui_json`/`module_update_ui` cũng tự chạy validator và đính kèm báo cáo — ở strict mode error sẽ chặn publish. Sau đó chạy `module_outline` để tự review cấu trúc UI: đọc cây layout, kiểm tra width từng row, dialog nào chưa có nút mở, action nào không ai gọi.

**Với logic runtime phức tạp (action chain nhiều bước, watch cascade, dialog flow):** chạy thêm `module_simulate` với kịch bản mô phỏng luồng chính (mở dialog → nhập → lưu → reload) + mock response theo shape suy luận tĩnh từ `db_sp_verify` (không gọi API thật). Assert các điều kiện then chốt (`dialogEdit === false` sau lưu, `items.length > 0` sau load). Trace sẽ chỉ ra CALL trỏ sai, IN thiếu biến, dialog quên đóng, watch lặp vô hạn — TRƯỚC khi publish.

**Chọn tool theo file đã thay đổi:**

| File thay đổi | Tool | Ghi chú |
|---|---|---|
| Chỉ `module.json` | `module_update_ui_json` | Không cần preview |
| `header.html` / `body.html` / title | `module_update_ui` | Cần `module_preview` trước. **module.json được push kèm tự động — không cần gọi thêm `module_update_ui_json`** |
| `header.html` / `body.html` / title **và** module.json cùng lúc | `module_update_ui` | Một lần gọi đủ cả hai |
| `script.js` (có nội dung hoặc rỗng để clear) | `module_script_update` | Luôn dùng tool này — kể cả khi xóa trắng script |
| `style.css` (có nội dung hoặc rỗng để clear) | `module_css_update` | Luôn dùng tool này — kể cả khi xóa trắng CSS |
| `uc-*.vue` component | `component_update` cho từng file | Scope suy từ `moduleId`; kèm gửi `<style scoped>` (nếu có) thành `ComCSS`. Component **cấp project**: phải `component_preview` rồi `component_update` **trước** khi render module dùng nó — `module_simulate({renderUI:true})` chặn cứng nếu bản local lệch bản server |

**Khi nhiều file thay đổi trong một lần — gọi lần lượt từng tool:**

```
Ví dụ: sửa cả module.json + script.js + một component
→ module_update_ui_json   (hoặc module_update_ui nếu header/body cũng đổi)
→ module_script_update
→ component_update
```

**Quy trình khi dùng `module_update_ui`:**
```
module_preview → user xem diff → user approve → module_update_ui
```

Không được gọi `module_update_ui` khi chưa có approval từ user.

---

## Component Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `component_get` | R | ✅ | Đọc .vue source từ server. Bỏ `moduleId` → project-scope |
| `component_preview` | R | ✅ | Render **một** component trong không gian riêng (browser thật) với dữ liệu mẫu truyền thẳng trong tham số, mặc định desktop + mobile. Đọc file `.vue` **local** nên chạy được trên bản chưa push. Quy trình: xem `component-design.md` |
| `component_list` | M | ✅ | Refresh `_components.json` local từ server + xóa `.vue` mồ côi (từng track, server đã xóa). Bỏ `moduleId` → project-scope. Dùng khi list lệch với server |
| `component_update` | M | ⚠️ | Upsert component — tự lookup ComID, tự sync `_components.json`. Scope suy từ `moduleId`; kèm gửi `ComCSS` (trích từ khối `<style scoped>` trong `.vue`, nếu có) |
| `component_delete` | M | 🔴 | **Xóa component khỏi server — không khôi phục được** (không lưu history như `db_sp_update`); tự lookup ComID từ `_components.json`. Scope suy từ `moduleId`. Tự sync `_components.json` + xóa `.vue` local mồ côi. Yêu cầu xác nhận rõ ràng trước khi gọi |

### Scope rule — áp dụng cho tất cả component tools

```
moduleId có giá trị  →  module-scope  (chỉ module đó)
moduleId vắng mặt   →  project-scope (global, auto-load ở mọi module)
```

| Tình huống | moduleId dùng | projectId dùng |
|---|---|---|
| Truyền cả hai | Arg | Arg |
| Chỉ truyền `projectId` | *(none)* → project-scope | Arg |
| Không truyền gì, session đủ cả hai | session.moduleId | session.projectId |
| Không truyền gì, session chỉ có projectId | *(none)* → project-scope | session.projectId |

---

## Script & CSS Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `module_script_update` | M | ⚠️ | Push script.js lên server — dùng nội dung rỗng `""` để clear script trên server |
| `module_css_update` | M | ⚠️ | Push style.css lên server — dùng nội dung rỗng `""` để clear CSS trên server |

---

## Import File Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `file_import_list` | R | ✅ | List + tự đồng bộ METADATA `_imports.json` local (fileID, filePath...) — không tải nội dung file, luôn 1 API call rẻ; xóa file content local mồ côi (từng track, server đã xóa) |
| `file_import_get` | R | ✅ | Fetch source của MỘT file theo fileId — đồng thời ghi xuống mọi `imports/` local đang khai fileID này |
| `file_import_new` | M | ⚠️ | Tạo import file mới trên server, tự sync `_imports.json` |
| `file_import_update` | M | ⚠️ | Cập nhật metadata import file — tự sync mọi `_imports.json` local có khai fileID này, migrate file vật lý nếu filePath đổi |
| `file_import_upload` | M | ⚠️ | Ghi nội dung file lên server — tự ghi lại xuống mọi local imports/ có khai fileID này |
| `file_import_delete` | M | 🔴 | **Xóa import file** — không khôi phục được; tự xóa entry + file vật lý mồ côi khỏi mọi `_imports.json` local; yêu cầu xác nhận rõ ràng |

---

## Database Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `db_config_read` | R | ✅ | Đọc DB connection config |
| `db_connect` | M | ✅ | Kết nối DB + tự fetch schema — ghi config.json và schema.json local; archive `_db/sp/{name}.sql` mồ côi (SP/function đã bị DROP trên server) vào `_history/` |
| `db_user_token_set` | M | ✅ | Lưu userToken vào config local — không ảnh hưởng server |
| `db_token_rebuild` | M | ⚠️ | Rebuild dbToken từ uid/password mới — overwrite token hiện tại; xác nhận server/database đúng trước khi gọi |
| `db_schema_get` | M | ✅ | Làm mới **toàn bộ `_db/`**: schema + **tải lại thân từng file `sp/*.sql`** (luôn ghi đè; bản local khác server được lưu vào `_history/` trước); đồng thời **quét thư mục `_db/sp/`** đối chiếu schema mới. SP từng có trong schema cũ mà nay mất (đã DROP trên server) → tự archive vào `_history/`. File không có ở cả schema cũ lẫn mới → **chỉ liệt kê** (`⚠️ N file trong _db/sp/ KHÔNG có trên server`), vì có thể là SP đang soạn local chưa deploy; user xác nhận là rác thì gọi lại `db_schema_get({ pruneLocalOnly: true })` để archive luôn. ĐỌC dòng ⚠️ này và hỏi user, đừng tự ý prune |
| `db_schema_read` | R | ✅ | Đọc cached schema |
| `db_sp_list` | R | ✅ | Liệt kê SPs |
| `db_sp_get` | R | ✅ | Đọc SP source + ghi đè `_db/sp/{name}.sql` — bản local khác server được lưu vào `_history/` trước |
| `db_sql_execute` | R/M | ⚠️ | SELECT hoặc lệnh ghi trực tiếp (đường user chủ động sửa/xoá dữ liệu thật) — kết quả cắt tối đa 200 dòng; TOP 20 nếu chỉ cần khảo sát cấu trúc; không SELECT binary/max columns; **DROP TABLE/ALTER TABLE bị block ở code**; lệnh ghi cần `confirmWrite: true` |
| `db_sp_save` | M | ⚠️ | Lưu SP vào local — chưa deploy |
| `db_sp_rename` | M | ⚠️ | Đổi tên SP trong DB — tóm tắt trước khi gọi; tự đổi tên `_db/sp/{name}.sql` local theo nếu có |
| `db_sp_update` | M | 🔴 | **Deploy SP vào DB** — tự lưu **định nghĩa đang chạy trên server** vào `_history/` trước khi ghi (đây là bản để rollback); tóm tắt SP nào, loại thao tác (CREATE/ALTER); chờ user xác nhận. Nếu tên là `spAPI_*`/`spAPIFILE_*`, tự gọi route `/help` để xoá cache tAPI sau khi deploy (best-effort, không chặn deploy nếu lỗi) |
| `db_sp_help` | R | ✅ | Gọi route `/help` của một API SP đã deploy — trả tham số đầu vào **và** xoá cache tAPI cho hàm đó (side-effect bắt buộc của route này, không phải tuỳ chọn). `db_sp_update` đã tự gọi tool này; dùng tay khi auto-clear báo lỗi, SP đổi bằng đường khác, hoặc chỉ để tra tham số |
| `db_sp_verify` | R | ✅ | Kiểm chứng **tĩnh** contract API SP — **không gọi HTTP/SQL nào cả**. Đọc thân SP thật (local `_db/sp/{name}.sql` hoặc live `OBJECT_DEFINITION`), suy luận: tham số, response shape (đếm SELECT top-level, cột, cảnh báo `SELECT *`), contract lỗi (RAISERROR+RETURN), phân loại đọc/ghi, sinh sẵn snippet `apiMocks`/`vueData` cho `module_simulate`. Không đọc được thân SP thật (chưa lưu local, live fetch cũng lỗi) = **lỗi cứng**, không đoán theo tên |
| `db_sp_delete` | M | 🔴 | **Xóa SP khỏi DB** — không khôi phục được; tự archive `_db/sp/{name}.sql` local vào `_history/` nếu có; yêu cầu xác nhận rõ ràng |
| `db_sql_execute_nonquery` | R/M | 🔴 | **Chạy DDL/DML** (đọc lẫn ghi) — **DROP TABLE/ALTER TABLE bị block**; **DELETE/UPDATE không WHERE bị block** (chỉ hiển thị SQL); lệnh ghi khác cần `confirmWrite: true` |
| `right_system_list` | R | ✅ | Liệt kê định nghĩa SystemRight (0–9) của project từ hệ thống phân quyền "acc" — cần userToken có quyền vào acc |
| `right_system_update` | M | ⚠️ | Upsert định nghĩa SystemRight trên "acc" — tóm tắt trước khi gọi; **`delete: true` = 🔴 xóa định nghĩa quyền** (server chặn nếu còn user giữ quyền) |
| `right_function_list` | R | ✅ | Liệt kê định nghĩa FunctionRight (FunctionCode/Name) của project từ "acc" |
| `right_function_update` | M | ⚠️ | Tạo/sửa định nghĩa FunctionRight trên "acc" — tóm tắt trước khi gọi; **`delete: true` = 🔴 xóa function KÈM toàn bộ phân quyền user của nó** |

> Khái niệm SystemRight (cấp bậc) vs FunctionRight (quyền theo chức năng) và chi tiết 4 tool trên: xem [permission-system.md](permission-system.md).

### Quy tắc bắt buộc cho DB tools

**Áp dụng cho tất cả `db_sql_execute` và `db_sql_execute_nonquery`:**
1. Trình bày tóm tắt: query làm gì, dữ liệu nào bị ảnh hưởng
2. Đợi user xác nhận trước khi gọi tool
3. Lệnh ghi (INSERT/UPDATE+SET/DELETE/MERGE/TRUNCATE) → gọi lại kèm `confirmWrite: true` chỉ SAU KHI
   user đã xác nhận trong chat — không tự set để "cho lệnh chạy được" (đây là cổng xác nhận, không
   phải cản trở kỹ thuật cần lách qua)

**Guards được enforce ở code level (không thể bypass):**
- `DROP TABLE` / `ALTER TABLE` → blocked hoàn toàn, trả về lỗi
- `DELETE` / `UPDATE` không có `WHERE` → blocked, trả về SQL dạng display-only để user copy thủ công
- Lệnh ghi thiếu `confirmWrite: true` → blocked, trả bản xem trước (loại lệnh, bảng, có WHERE hay
  không) — set `confirmWrite: true` sau khi user xác nhận thì chạy thật. `confirmWrite` **không** mở
  được 2 guard phía trên
- `db_sp_update` → tự lưu định nghĩa SP đang chạy trên server vào `{workspaceRoot}/_history/` trước khi overwrite

**Quy tắc bắt buộc — xoá cache tAPI sau mỗi lần ALTER/UPDATE `spAPI_*`/`spAPIFILE_*`:**
- Dùng `db_sp_update`: tự gọi `/help` xoá cache (best-effort); nếu báo lỗi → **bắt buộc gọi `db_sp_help` thủ công trước khi tiếp tục**.
- Dùng `db_sql_execute_nonquery` chạy `ALTER PROCEDURE` trực tiếp: không có auto-clear → **bắt buộc gọi `db_sp_help` thủ công ngay sau ALTER thành công**.
- Không xoá cache → tAPI tiếp tục phục vụ chữ ký cũ, wire IN/OUT sai params mà không có lỗi rõ ràng.

**Khi dùng `db_sql_execute`:**
- Đây là tool **đọc và ghi dữ liệu thật** — SELECT để khảo sát (thêm `TOP 20` nếu chỉ cần xem cấu trúc, dữ liệu thực tế có thể rất lớn), hoặc ghi trực tiếp khi user chủ động yêu cầu sửa/xoá data (kèm `confirmWrite: true`, xem mục Guards ở trên).
- Không SELECT cột kiểu `varbinary(max)`, `image`, `nvarchar(max)` dữ liệu lớn.
- **Không dùng tool này để "test" logic một API** — kiểm chứng API là đọc thân SP + suy luận (`db_sp_verify`), không phải chạy sub-query sống để dò.

**Kiểm chứng spAPI_* bằng `db_sp_verify` (tĩnh, zero HTTP):**
- Sau khi `db_sp_update` một API **đọc** (Select/List/Get) mà sắp wire vào module.json → chạy `db_sp_verify` để suy luận shape response thật (array / array-of-arrays / convert_to_object) từ chính thân SP trước khi viết `OUT`/`CALLBACK` — không gọi endpoint để xác nhận, tool không bao giờ gọi gì cả.
- API **ghi** (Insert/Update/Delete/...): `db_sp_verify` đọc thân SP thật (local `_db/sp/{name}.sql`, hoặc live `OBJECT_DEFINITION` nếu chưa có local) và liệt kê checklist cần tự suy luận (điều kiện WHERE, transaction, RAISERROR đúng contract) — không chặn theo đọc/ghi vì không có gì được gọi cả.
  - Cần test **luồng UI** gọi API ghi (form submit, nút Lưu/Xóa...) → dùng `module_simulate({ apiMocks: { "{FunctionName}": { data: [...] } } })` (hoặc kèm `renderUI: true`) với snippet mock mà `db_sp_verify` sinh sẵn — không gọi API thật.
  - KHÔNG đọc được thân SP thật (chưa `db_sp_get`, và fetch live cũng lỗi — ví dụ thiếu quyền DB) → tool trả về **lỗi cứng**, không đoán theo tên, không có cách chạy tiếp; phải `db_sp_get` thành công trước rồi mới verify lại được.
- Kiểm tra logic SP phức tạp trước khi deploy: đọc thân SP (`db_sp_get`) và suy luận tĩnh câu lệnh — **không gọi `spAPI_*` sống để dò logic** dưới bất kỳ hình thức nào.

**GRANT EXECUTE:** `db_sp_update` chỉ tự động `GRANT EXECUTE TO public` khi script chứa `CREATE PROCEDURE`; với `ALTER PROCEDURE` thì **không cần** grant lại (checklist đầy đủ: [verification.md](verification.md)).

**Trước khi `db_connect`:** thông tin kết nối lưu vào `{projectId}/_db/` — projectId không rõ thì **hỏi user**, không tự đoán (chi tiết: [db-workflow.md](db-workflow.md) §4).

---

## Skill & Design Tools

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `skill_get` | R | ✅ | Đọc skill rules (SKILL.md + Tier A bundled) |
| `skill_reference_get` | R | ✅ | Đọc Tier B/C/D reference file theo đường dẫn — bắt buộc cho client không có filesystem access (web/remote) |
| `skill_sync` | M | ✅ | Refresh skill từ server |
| `design_list` | R | ✅ | Liệt kê brand design systems có sẵn |
| `design_read` | R | ✅ | Đọc DESIGN.md của một brand |

---

## Maintenance Tools (vòng tiến hoá skill)

Mọi tool call thất bại (isError) ở mọi session đều được server tự ghi vào `{workspaceRoot}/_logs/tool-errors.jsonl`.

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `error_log_read` | R | ✅ | Đọc log lỗi tool — thống kê tần suất theo tool + entries gần nhất. Pattern lỗi lặp lại = lỗ hổng trong skill references cần vá |
| `error_log_clear` | M | ✅ | Xoá log sau khi đã review và cập nhật skill |

---

## SSE-only Tools (không tồn tại ở STDIO/CLI)

Chỉ được đăng ký khi server chạy `--sse` (`node build/index.js --sse`). STDIO/CLI không bao giờ thấy các tool này trong danh sách — không cần cân nhắc dùng hay không khi ở CLI.

### Tìm kiếm — thay thế Grep/Glob native

| Tool | R/M | Safety | Ghi chú |
|---|---|---|---|
| `workspace_glob` | R | ✅ | Tìm file theo glob pattern (`**/*.vue`, `modules/**/module.json`...) trong workspace. Chỉ trả về đường dẫn tương đối, KHÔNG trả nội dung file — dùng để khám phá trước khi gọi `module_get`/`component_get`/`file_import_get` lấy nội dung cụ thể |
| `workspace_grep` | R | ✅ | Tìm nội dung theo regex trên nhiều file cùng lúc, chỉ trả về dòng khớp kèm số dòng (không trả cả file) — giữ chi phí context thấp khi tìm trên nhiều file |

Scope của cả hai: `projectId`+`moduleId` → module-scope; chỉ `projectId` → toàn bộ project (mọi module); không truyền gì → dùng active session.

### Staging — ghi full-content vào workspace trước khi publish

| Tool | R/M | Safety | Ghi chú | Gọi tiếp theo |
|---|---|---|---|---|
| `module_stage_ui_json` | M | ⚠️ | Ghi `content` (JSON string) vào `module.json` trên workspace server. Validate JSON trước khi ghi | `module_update_ui_json` |
| `module_stage_html` | M | ⚠️ | Ghi `header`/`body`/`title` (field nào có mới ghi field đó) vào workspace | `module_preview` → `module_update_ui` |
| `script_stage` | M | ⚠️ | Ghi `code` vào `script.js`. Truyền `""` để stage một script rỗng | `module_script_update` |
| `css_stage` | M | ⚠️ | Ghi `code` vào `style.css`. Truyền `""` để stage một style rỗng | `module_css_update` |
| `component_stage` | M | ⚠️ | Ghi `code` vào `{name}.vue`. Scope suy từ `moduleId` giống hệt `component_update` | `component_update` |

**Lưu ý quan trọng:** các tool `_stage` chỉ ghi xuống đĩa workspace của server — **không** publish lên FUI. Luôn phải gọi tool publish tương ứng ở cột cuối sau khi stage xong, đúng như quy tắc "Sửa file nào, gọi tool đó" ở trên.

---

## Concurrency Rules

Các tools có thể chạy song song (parallel):
- Tất cả ReadOnly (`R`) tools
- `session_read`, `session_set`, `project_list`, `module_list`

Không được chạy song song:
- Bất kỳ Destructive (🔴) tool nào
- `module_update_ui` với bất kỳ tool nào khác
- `db_sp_update` với `db_sp_update` khác

---

## Tóm tắt Risk Matrix

```
✅ Safe         → Gọi tự do, không cần hỏi
⚠️ RequiresConfirm → Tóm tắt cho user trước, chờ OK
🔴 Destructive  → Tóm tắt đầy đủ + chờ xác nhận rõ ràng từ user
```
