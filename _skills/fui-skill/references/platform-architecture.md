# FUI Platform Architecture — Cấu tạo & cơ chế phân cấp

> File này sở hữu: **cấu tạo FUI và phân cấp Project→Module: import/component/set trộn thế nào, `vueData`/`v_Set`, vòng đời runtime**.

Hiểu FUI vận hành thế nào **dưới nắp** để thiết kế đúng ngay từ đầu. Nội dung ở đây rút trực tiếp từ runtime `scripts/fastproject.js` (file chính của nền tảng), `defaultfunction.js` (hàm dùng chung), `component.js`/`componentTable.js` (V3: `componentTable-3.0.js`) — đăng ký component lõi có sẵn (`f-table`, `t-*`, dialog, editor...). `f-echart` (`fechart.js`) và `f-sheet` (`fsheet.js`) là hai component **tách file riêng, nạp qua import khai trong module/project**, không tự động load như phần lõi. Đây là **nguồn sự thật** — không suy từ training data.

> Đọc file này TRƯỚC khi thiết kế hệ thống/module. Sau đó: cấu hình từng phần → [module-json-anatomy.md](module-json-anatomy.md); project.json & set → [project-config.md](project-config.md); pattern UI thực tế → [ui-patterns.md](ui-patterns.md) (ưu tiên cao — đã tinh chỉnh qua thực chiến).

---

## 1. FUI là gì

FUI (Framework UI) là nền tảng low-code **metadata-driven**: mỗi trang (module) mô tả UI + logic bằng JSON (`module.json`), runtime `fastproject.js` đọc JSON đó và tự dựng DOM Vue 2 + Vuetify. Không viết Vue component thủ công cho từng trang — chỉ khai báo.

Một trang FUI khi chạy nạp theo thứ tự (đã bundle sẵn, **không import lại**):
1. Thư viện nền: jQuery, Lodash (`_`), Moment, Numeral, Vuetify, vue-toast, jquery-confirm
2. `defaultfunction.js` — hàm tiện ích (`openWindow`, `CALL`, `confirm`, `showMessage`, `ajaxCALL`, `jsonToExcel`...)
3. `component.js` + `componentTable.js` — đăng ký toàn bộ component `f-*` / `t-*`
4. `fastproject.js` — engine: đọc `module.json`, merge config, dựng DOM, chạy action, gắn watch
5. Data của trang: `$projectData` (project.json), `$moduleUI` (module.json), `$projectGroupSetting`

---

## 2. Phân cấp Project → Module (CƠ CHẾ TRỘN — quan trọng nhất)

FUI có hai cấp: **Project** (dùng chung) và **Module** (một trang). Ba thành phần của Project **tự động nhúng/trộn xuống** mọi Module; khi trùng, **Module chi phối (override)**.

### 2.1 `set` — project.json trộn vào `set` của module

Runtime tính config hiệu lực `v_Set` bằng (fastproject.js):

```js
$.extend(vueData.v_Set, $projectGroupSetting, $projectData, $moduleUI.set);
// rồi nếu có: $.extend(v_Set, v_Set.domainSetting[domain hiện tại])
```

Thứ tự ưu tiên (sau ghi đè trước):

```
$projectGroupSetting   (cấu hình nhóm project — thấp nhất)
   ⤵ bị override bởi
$projectData           = project.json (khối "data")
   ⤵ bị override bởi
$moduleUI.set          = "set" trong module.json   ← ƯU TIÊN CAO NHẤT
   ⤵ cuối cùng override bởi
v_Set.domainSetting[domain]   (nếu đang chạy trên domain đó)
```

→ Module **kế thừa toàn bộ** config project (menu, apiDomain, style, login...) và chỉ cần khai báo `set` cho những gì khác biệt. Đây là lý do `module.json` của một trang bình thường **không có `set`** (kế thừa hết từ project).

Chi tiết các thuộc tính của `set`/`v_Set` và project.json: [project-config.md](project-config.md).

### 2.2 `imports` — project imports **nối** với module imports

Import (JS/CSS) khai báo ở cấp project **và** cấp module đều được nạp — không thay thế nhau. Runtime (`addImport`): file `.css` → thêm `<link>`; file khác → nạp như `<script>`.

Thứ tự nạp **không phải** "framework rồi project rồi module": server (`spA_FUI_ModuleDataSelect`) UNION cả **ba** phạm vi — framework (theo V2/V3), project (`ModuleID IS NULL`), module — rồi sort **chung một lần** theo `FileSort, FileName`. Nên một import module-scope có `FileSort` nhỏ vẫn nạp **trước** import project-scope. Phụ thuộc thứ tự (vd `echarts.min.js` phải trước `fechart.js`) → phải thể hiện bằng `FileSort`, đừng trông vào phạm vi.

- Import project-scope: dùng chung cho mọi module (thư viện chung).
- Import module-scope: chỉ trang đó (vd `echarts.min.js` + `fechart.js` cho trang có `f-echart`).
- Module thật thường có `imports/_imports.json` = `[]` khi chỉ dùng thư viện bundle sẵn.

> Thêm/bỏ component cần import (f-echart, f-file-upload, f-editor...) → luôn `file_import_list` rồi `file_import_new`/`file_import_delete`. Bảng import: [component-quickref.md](component-quickref.md).

### 2.3 `components` — component **dùng chung toàn project**

- `component.js` đăng ký sẵn mọi component `f-*`/`t-*` **global**.
- Custom `uc-*.vue` **project-scope** (`{projectId}/components/`) → FUI tự load **global ở MỌI module**, gọi thẳng bằng tên (không khai báo `components:{}`).
- `uc-*.vue` **module-scope** (`{moduleId}/components/`) → chỉ dùng trong module đó.
- Trùng tên → bản module-scope chi phối trong phạm vi module đó.

> Component design & scope: [component-design.md](component-design.md).

### 2.4 Bảng tóm tắt phân cấp

| Thành phần | Project cung cấp | Trộn vào module thế nào | Khi trùng |
|---|---|---|---|
| **set / config** | `project.json` (khối `data`) | Trộn vào `v_Set`, rồi `module.set` | **Module.set thắng** |
| **imports** | project `_imports.json` | **Nối thêm** vào import module | Cả hai đều nạp |
| **components** | `uc-*.vue` project-scope + `f-*`/`t-*` global | Auto-load global mọi module | Module-scope thắng |

---

## 3. Runtime state có sẵn (`vueData`)

`fastproject.js` khởi tạo sẵn các biến này trong `vueData` — dùng được ngay trong `module.json`/`script.js`, không cần khai báo:

| Biến | Ý nghĩa |
|---|---|
| `user` | Thông tin user đăng nhập (fetch từ `v_Set.userInfo`) — xem cấu trúc bên dưới |
| `v_Set` | Config hiệu lực của trang (mục 2.1) — xem [project-config.md](project-config.md) |
| `p_domain` | Hostname hiện tại (vd `tsa.example.vn`) |
| `p_router` / `p_routers` | Path hiện tại (`/manager/schedule-assignment`) / mảng segment (`["manager","schedule-assignment"]`) |
| `p_params` | Query string (`?...`) |
| `p_urlReferrer` | URL trang giới thiệu |
| `v_Loading` / `v_LoadingOverlay` | Trạng thái loading khi gọi API (tự quản lý) |
| `v_containerOn` | Bật/tắt vùng nội dung chính |

### Cấu trúc `vueData` thực tế (mẫu)

Runtime khởi tạo sẵn `p_*`, `user`, `v_Set`. Đây là một `vueData` thật (đã rút gọn) — dùng để biết chính xác đường dẫn khi tham chiếu:

```json
{
  "p_domain": "tsa.example.vn",
  "p_routers": ["manager", "schedule-assignment"],
  "p_router": "/manager/schedule-assignment",
  "p_params": "",
  "user": {
    "UserID": "NV0000001", "UserName": "nguyenvana",
    "LastName": "Nguyễn Văn", "FirstName": "A",
    "Phone": "09xxxxxxxx", "Email": "nguyenvana@example.vn",
    "GroupID": 1, "DepartmentID": "BGH", "ClassID": null,
    "SystemRight": 9, "LastLogin": "2026-06-05 09:16:42",
    "FunctionRight": ["1","2","3","4","5","6","7","8","9","10","11","12","13","14"]
  },
  "v_Set": {
    "title": "Hệ thống quản lý tuyển sinh",
    "apiDomain": "https://tapi.example.vn/",
    "login": "https://app.example.vn",
    "userInfo": "https://tapi.example.vn/acc/userinfo/ts",
    "logo": "https://.../Logo_ChimLac_W.png",
    "ProjectName": "Tuyển Sinh",
    "menuLeft": false,
    "menu": [ { "name": "...", "right": { "FunctionRight": ["10"] }, "submenu": [ ... ] } ],
    "userProfile": {
      "color": "white",
      "url-signout": "https://app.example.vn/Signout",
      "url-change-password": "https://app.example.vn/ChangePassword",
      "url-account": "https://app.example.vn",
      "url-avatar": "https://file.example.vn/me/avatarOrigin/",
      "url-app-list": "https://tapi.example.vn/me/auth/ApplicationList"
    }
  }
}
```

**Trường của `user`** (thay đổi tùy `userInfo` endpoint, nhưng thường gồm): `UserID`, `UserName`, `LastName`, `FirstName`, `Phone`, `Email`, `GroupID`, `DepartmentID`, `ClassID`, `SystemRight` (int), `FunctionRight` (**mảng string**, vd `["10","14"]`), `LastLogin`. Một số hệ thống có thêm `Sex`.

> **Lưu ý dùng:** `user.SystemRight` là **số** (so sánh `>= 2`); `user.FunctionRight` là **mảng chuỗi** (kiểm tra bằng `.includes('10')` hoặc `rightTest`). Tham chiếu trong controls: `vueData.user.UserID`, `vueData.user.SystemRight`, `vueData.v_Set.apiDomain`...

### API lấy thông tin user (userInfo endpoint)

FUI dùng database phân quyền riêng, truy cập qua **apiName/Alias `acc`**. Endpoint lấy thông tin user và quyền hạn trên một project có cấu trúc:

```
{apiDomain}/acc/userinfo/{project_apiName}
```

- `{apiDomain}` — domain tAPI của hệ thống (lấy từ `vueData.v_Set.apiDomain`)
- `acc` — alias cố định cho database phân quyền (không đổi)
- `userinfo` — tên API lấy thông tin user
- `{project_apiName}` — apiName/code của project (do admin cấu hình, ví dụ: `quansinh`, `ts`, `qlsv`)

**Cách dùng:** khai báo `userInfo` trong `project.json` (field `set`) hoặc `module.json` (field `set`). FUI tự fetch khi trang load và gán kết quả vào `vueData.user`.

```json
// project.json → set
{
  "userInfo": "https://tapi.example.vn/acc/userinfo/quansinh"
}
```

Sau khi khai báo, toàn bộ thông tin user có sẵn trong `vueData.user`:

```js
vueData.user.UserID          // mã nhân viên/sinh viên
vueData.user.UserName        // tên đăng nhập
vueData.user.SystemRight     // quyền hệ thống (int 0–9)
vueData.user.FunctionRight   // mảng quyền chức năng ["1","2","10",...]
vueData.user.DepartmentID    // mã đơn vị
```

**Dùng trong controls (v-if ẩn/hiện theo quyền):**

```json
{ "col": { "v-if": "vueData.user.SystemRight >= 5" } }
{ "col": { "v-if": "vueData.user.FunctionRight.includes('10')" } }
```

**Dùng trong action IN (truyền vào API):**

```json
{ "API": "SP_GetDuLieu", "IN": { "UserID": "vueData.user.UserID", "DeptID": "vueData.user.DepartmentID" } }
```

> **Lưu ý:** `@sys_UserID`, `@sys_UserName`, `@sys_GroupID`... được tAPI tự inject vào mọi SP — không cần truyền thủ công qua `IN`. Chỉ tham chiếu `vueData.user.*` khi cần dùng trong logic JS/Vue phía client.

### Tham số URL tự inject vào `vueData`

`buildParamURL()` đọc mọi query param `?key=value` và gán `vueData[key] = value` **trước khi** `data[]` chạy. → Module con mở qua `openWindow`/`redirect` chỉ cần khai báo biến trùng tên param rồi `{ "CALL": "apiLoad" }` ở cuối `data[]`. (Xem [ui-crosswindow-patterns.md](ui-crosswindow-patterns.md).)

### Quyền của user

FUI có 2 loại quyền độc lập — `SystemRight` (cấp bậc trên project) và `FunctionRight` (quyền theo từng chức năng cụ thể), cả hai định nghĩa trong database phân quyền trung tâm (alias `acc`, `{project_apiName}` = APIName của project trong `tblModules`). Runtime: `vueData.user.SystemRight` (int)/`vueData.user.FunctionRight` (mảng string) dùng cho `v-if` và `right` trong menu; hàm `rightTest({ SystemRight:[...], FunctionRight:[...] })` kiểm tra giao quyền.

**Khái niệm đầy đủ (SystemRight vs FunctionRight), cấu trúc `tblSysRight`/`tblFunction`, và 4 MCP tool quản lý định nghĩa quyền (`right_system_list/set`, `right_function_list/set`):** xem [permission-system.md](permission-system.md).

---

## 4. Vòng đời khởi tạo một trang (fastproject.js)

```
$(document).ready → loadModuleInfo()
  1. Merge v_Set: $projectGroupSetting ← $projectData ← $moduleUI.set
  2. Áp domainSetting[domain hiện tại] (nếu có)
  3. buildParamURL(): query ?key=value → vueData[key]
  4. Nếu v_Set.userInfo: fetch thông tin user → vueData.user
  5. createModuleDom():
     - runAction($moduleUI.data)        → khởi tạo state + chạy action/CALL đầu
     - buildModuleUI($moduleUI.controls) → dựng DOM (container>rows>cols)
     - createWatch_Data / createWatch($moduleUI.watch) → gắn watcher
     - new Vue(...) với Vuetify(v_Set.themeStyle)
     - Kết nối websocket nếu có vueData.webSocket
     - Kiểm tra đăng nhập (v_Set.login)
```

Hệ quả thiết kế:
- `data[]` chạy tuần tự trên xuống; đặt khởi tạo state trước, `{ "CALL": ... }` auto-startup ở cuối.
- Đặt các gán `#PARENT.*` / biến từ URL **trước** các CALL fetch để dữ liệu sẵn sàng.

---

## 5. Action engine — các key trong một action (tham chiếu nhanh)

`runAction`/`vueAction` xử lý một object action theo các key sau (nguồn: fastproject.js). Pattern chi tiết + value resolution: **[controls-patterns.md](controls-patterns.md)**.

| Key | Tác dụng |
|---|---|
| `API` | Gọi endpoint (POST mặc định). Đường dẫn không `http` → tự prepend `v_Set.apiDomain` (`fixURL`) |
| `IN` | Tham số gửi lên (map từ `vueData`) |
| `OUT` | Nơi lưu kết quả. Nếu response chỉ có key `data` và `OUT` là string → tự unwrap `d.data` |
| `METHOD` | Override HTTP method (mặc định POST) |
| `HEADER` | Override header (mặc định `authorization: Bearer awt`) |
| `MESS` | Toast thành công |
| `MESSBOX` | Hộp thoại thông báo (`showMessage`) |
| `CALLBACK` | Action chạy sau khi API/FUN xong |
| `ERROROUT` / `ERRORCALLBACK` | Xử lý nhánh lỗi |
| `CALL` | Gọi action đã đặt tên khác |
| `CONFIRM` / `CANCEL` | Hỏi xác nhận trước, nhánh hủy |
| `IF` / `THEN` / `ELSE` | Rẽ nhánh (điều kiện là JS expression trên vueData) |
| `FUN` (+`IN`/`OUT`/`CALLBACK`) | Gọi hàm global (`openWindow`, `jsonToExcel`, `printPDF`...) |
| `EXE` | Chạy JS thô (dùng dè xẻn) |
| *(object thường)* | Gán trực tiếp vào `vueData` (state set) |

`json_data_parse` tự parse cột `json_data:Field` trong response thành object (xem [tapi-reference.md](tapi-reference.md)).

---

## 6. Component & hàm dựng sẵn (điểm vào)

- **Component `f-*` / `t-*`**: danh mục đầy đủ + import cần thiết → [component-quickref.md](component-quickref.md).
- **Hàm tiện ích global** (`openWindow`, `CALL`, `confirm`, `showMessage`, `ajaxCALL`, `jsonToExcel`, `groupBy`, `pushRouter`, `rightTest`, `printPDF`, `webSocket_Send`...) → [default-function.md](default-function.md).
- **Thư viện toàn cục** (`$`, `_`, `moment`, `numeral`, `Vue.$toast`) → [script-map.md](script-map.md) §0 "Thư viện đã bundled sẵn" — đọc trước khi định thêm CDN.

---

## 7. Ghi nhớ thiết kế

- Project cung cấp khung (menu, apiDomain, style, component chung); Module chỉ khai báo phần khác biệt.
- Đừng lặp lại config đã có ở project trong từng module.
- Component dùng >1 module → đặt project-scope (global), không copy vào từng module.
- Import chỉ khai báo ở nơi thực sự dùng; component dùng chung → import project-scope.
- Mọi thứ chạy trên `vueData`; tham chiếu state bằng tiền tố `vueData.` trong controls/attr.
