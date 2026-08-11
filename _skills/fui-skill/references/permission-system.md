# Hệ thống phân quyền FUI — SystemRight & FunctionRight

> File này sở hữu: **khái niệm `SystemRight` vs `FunctionRight`, `rightTest`, gác `v-if`/menu, 8 tool quản lý định nghĩa quyền**. Kiểm quyền trong thân SP xem [tapi-permission-patterns.md](tapi-permission-patterns.md).

FUI có **2 loại quyền độc lập, không thay thế nhau**. Nhầm lẫn hai loại này là lỗi thường gặp khi thiết kế `v-if`, menu `right`, hoặc kiểm tra quyền trong SP.

> Kiểm tra quyền **trong thân SP** (pattern SQL cụ thể): xem [tapi-permission-patterns.md](tapi-permission-patterns.md). File này tập trung vào khái niệm + 8 tool quản lý định nghĩa quyền.

---

## Khi user hỏi về "phân quyền"/"quyền" trong hệ thống — quy trình bắt buộc

Không trả lời chỉ dựa vào suy đoán hoặc code/schema đã đọc từ trước — luôn lấy dữ liệu **thật** tại thời điểm hỏi:

1. Gọi `right_system_list` + `right_function_list` để lấy đúng định nghĩa `SystemRight`/`FunctionRight` **hiện tại** của project (không đoán theo tên biến hay comment cũ).
2. Gọi `db_schema_read` (search theo từ khóa liên quan như `right`/`quyen`/`role`/`permission`/`phanquyen`) để kiểm tra project có **bảng phân quyền riêng** trong DB của chính nó hay không — khác với `acc.tblSysRight`/`acc.tblFunction` (đó là DANH MỤC định nghĩa quyền dùng chung mọi project, không phải bảng gán quyền chi tiết). Nhiều project tự dựng thêm bảng gán quyền theo module/màn hình/thao tác (CRUD) riêng ngoài 2 loại quyền chuẩn — phải kiểm tra trước khi kết luận hệ thống "chỉ có SystemRight/FunctionRight".
3. Tổng hợp cả 2 nguồn (định nghĩa quyền chuẩn từ `acc` + bảng phân quyền riêng của project nếu có) trước khi trả lời hoặc thiết kế logic kiểm tra quyền.

---

## 2 loại quyền — phân biệt rõ

| | `SystemRight` | `FunctionRight` |
|---|---|---|
| **Bản chất** | **Cấp bậc** của user khi vào một project | **Quyền theo từng chức năng** cụ thể |
| **Kiểu dữ liệu** | 1 số nguyên `0–9` | Mảng mã chức năng (string[]) |
| **Trả lời câu hỏi** | "Bạn là ai trong hệ thống này?" (Users, Managers, Administrators, Project Admin...) | "Bạn được phép làm việc gì?" (xem báo cáo, đặt hàng, thanh toán...) |
| **Định nghĩa ở đâu** | `tblSysRight` — mỗi mức có `Note` (tên cấp bậc) do project tự đặt | `tblFunction` — mỗi chức năng có `FunctionCode` (số) + `FunctionName` |
| **Gán cho user** | 1 mức duy nhất trên project đó | 0..N mã, độc lập với cấp bậc |
| **Runtime (client)** | `vueData.user.SystemRight` (số) | `vueData.user.FunctionRight` (mảng chuỗi) |
| **SP-side** | `@sys_SystemRight` | `@sys_FunctionRight` (chuỗi dạng `[10][20]`) |

**Ví dụ dễ hình dung:** `SystemRight` giống chức vụ ("Nhân viên" = 1, "Quản lý" = 5, "Project Admin" = 9 — cố định). `FunctionRight` giống checklist quyền hạn cụ thể được cấp riêng cho từng người, bất kể chức vụ — một Nhân viên vẫn có thể được cấp quyền "Thanh toán" nếu công việc yêu cầu, một Quản lý có thể KHÔNG có quyền "Xóa dữ liệu" nếu không cần.

**Khi nào dùng loại nào:**
- Ẩn/hiện cả một khu vực UI theo "đẳng cấp" tổng quát (khu vực quản trị, mục chỉ admin thấy) → `SystemRight`
- Bật/tắt một nút hoặc luồng nghiệp vụ cụ thể (nút "Duyệt", nút "Xuất báo cáo") mà không phụ thuộc cấp bậc → `FunctionRight`
- Nhiều màn hình dùng **cả hai cùng lúc** (AND) — xem ví dụ `right` trong `project-config.md`.

---

## Lưu trữ — database phân quyền trung tâm (alias `acc`)

Mọi project FUI dùng chung 1 database phân quyền trung tâm, alias tAPI là `acc`:

- **`tblModules`** — mỗi project là 1 dòng, nhận diện qua `APIName` (= apiName/alias của project)
- **`tblSysRight`** — định nghĩa các mức `SystemRight` (0–9) của **một project cụ thể**, kèm `Note` (tên cấp bậc); `9` luôn cố định là **Project Admin**
- **`tblFunction`** — định nghĩa các `FunctionRight` (`FunctionCode` số + `FunctionName`) của **một project cụ thể** — đây là danh mục "chức năng có thể gán quyền", không phải bảng gán quyền cho từng user

> Việc **gán** một mức `SystemRight`/`FunctionRight` cụ thể cho từng user là thao tác quản trị riêng (ngoài phạm vi 8 tool bên dưới — các tool này chỉ quản lý **định nghĩa** danh mục quyền của project, không gán quyền cho user).

---

## Runtime (client-side)

Sau khi khai báo `userInfo` (xem [platform-architecture.md](platform-architecture.md)), FUI tự fetch và gán:

```js
vueData.user.SystemRight     // số, vd: 5
vueData.user.FunctionRight   // mảng chuỗi, vd: ["10", "20"]
```

**Dùng trong `v-if` (ẩn/hiện theo quyền):**

```json
{ "col": { "v-if": "vueData.user.SystemRight >= 5" } }
{ "col": { "v-if": "vueData.user.FunctionRight.includes('10')" } }
```

**Dùng trong menu `right`** (xem chi tiết [project-config.md](project-config.md)):

```json
"right": { "SystemRight": [1, 2, 5, 9], "FunctionRight": ["10", "20"] }
```
- `SystemRight`: `user.SystemRight` phải **nằm trong** mảng mới thấy
- `FunctionRight`: `user.FunctionRight` phải **giao ít nhất 1 mã** với mảng mới thấy
- Có cả hai key → **AND** (phải thỏa cả hai)

**Hàm `rightTest`** kiểm tra giao quyền (dùng trong menu/logic JS):

```js
rightTest({ SystemRight: [5, 9], FunctionRight: ['10'] })
```

---

## SP-side (Stored Procedure)

tAPI tự inject `@sys_SystemRight` và `@sys_FunctionRight` vào mọi SP — không cần client truyền lên. **5 pattern kiểm tra quyền trong thân SP** (chặn truy cập, kiểm tra 2 tầng module admin, kiểm tra `FunctionRight`...): xem [tapi-permission-patterns.md](tapi-permission-patterns.md).

---

## 8 MCP tools — quản lý định nghĩa quyền của project

Các tool này thao tác trực tiếp lên database `acc` (4 API `SM_SystemRight_Select/Update`, `SM_FunctionRight_Select/Update`), dùng **userToken** của dev (đã được cấp quyền vào `acc`) lấy từ `_db/config.json` của project hiện tại — không cần cấu hình kết nối riêng.

Tạo / sửa / xóa là **ba tool riêng**: xóa là thao tác 🔴 không hoàn tác, không được nằm chung schema với thao tác thường dưới dạng một boolean dễ truyền nhầm.

| Tool | Vai trò | Params chính | Ghi chú an toàn |
|---|---|---|---|
| `right_system_list` | Liệt kê định nghĩa `SystemRight` (0–9 + Note) của project | `apiName?`, `projectId?` | Read-only, an toàn |
| `right_system_new` | Định nghĩa một mức `SystemRight` **chưa có** | `sysRight` (0–9), `note?` (≤50 ký tự, bỏ qua nếu `sysRight=9`), `apiName?`, `projectId?` | Khoá do người dùng chọn (không có ID tự sinh) → tool hỏi `SM_SystemRight_Select` trước; mức đã có = **lỗi cứng**, trỏ sang `right_system_update` |
| `right_system_update` | **Chỉ sửa** mức `SystemRight` đã có | `sysRight` (**bắt buộc**, lấy từ `right_system_list`), `note?`, `apiName?`, `projectId?` | ⚠️ Ghi đè note hiện tại |
| `right_system_delete` | Xóa định nghĩa một mức `SystemRight` | `sysRight` (**bắt buộc**), `apiName?`, `projectId?` | 🔴 **Server tự chặn** nếu còn user đang giữ mức quyền đó |
| `right_function_list` | Liệt kê định nghĩa `FunctionRight` (FunctionID/Code/Name) của project | `apiName?`, `projectId?` | Read-only, an toàn — nguồn duy nhất lấy `functionId` thật |
| `right_function_new` | Tạo `FunctionRight` mới | `functionCode` (số, unique/project), `functionName?` (≤100 ký tự), `apiName?`, `projectId?` | Gửi `FunctionID: 0` (lệnh INSERT của SP); server từ chối nếu `functionCode` trùng |
| `right_function_update` | **Chỉ sửa** `FunctionRight` đã có | `functionId` (**bắt buộc**, lấy từ `right_function_list`), `functionCode`, `functionName?`, `apiName?`, `projectId?` | ⚠️ Không còn `?? 0` — quên `functionId` là lỗi, không âm thầm biến thành tạo mới |
| `right_function_delete` | Xóa 1 `FunctionRight` | `functionId` (**bắt buộc**), `apiName?`, `projectId?` | 🔴 Xóa function **KÈM toàn bộ phân quyền user** đã gán mã đó — không khôi phục được |

**Quy tắc dùng:**
1. Trước khi gọi `right_system_delete`/`right_function_delete` — luôn tóm tắt rõ hậu quả và chờ user xác nhận (destructive, không hoàn tác).
2. Tạo mới thì dùng `right_*_new`; sửa thì **bắt buộc** có định danh (`functionId` / `sysRight`) lấy từ `right_*_list` — không tool nào upsert ngầm.
3. Cả 8 tool đều lấy `apiName`/`projectId` mặc định từ project đang active trong session nếu không truyền — chỉ truyền `apiName` khi cần thao tác lên project **khác** project hiện tại.
4. Server tự kiểm tra quyền người gọi: Select cần `SystemRight >= 2` trên hệ thống `acc`; Update cần cao hơn hoặc là admin (`9`) của project đích.

**API nền tảng** (tham khảo, thường không cần gọi trực tiếp — dùng 8 tool ở trên):

```
POST {apiDomain}/acc/SM_SystemRight_Select     { ModuleID | APIName }
POST {apiDomain}/acc/SM_SystemRight_Update     { ModuleID | APIName, SysRight, Note, Delete }
POST {apiDomain}/acc/SM_FunctionRight_Select   { ModuleID | APIName }
POST {apiDomain}/acc/SM_FunctionRight_Update   { FunctionID, ModuleID | APIName, FunctionCode, FunctionName, Delete }
```
