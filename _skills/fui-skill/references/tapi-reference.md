# tAPI Reference — Transparent Query API (Core)

> File này sở hữu: **quy ước tAPI: đặt tên SP (`spAPI_*`/`spAPI_AUTH_*`/`spAPIFILE_*`), params, URL, response contract, route `/help`**. Quy trình deploy xem [db-workflow.md](db-workflow.md).

tAPI tự sinh API từ SQL Stored Procedures. Tên SP quyết định endpoint URL, kiểu xác thực, và quyền truy cập. Không cần viết controller hay route — chỉ cần đặt tên SP đúng quy tắc.

tAPI hỗ trợ cả **GET và POST** — không cần chỉ định HTTP method khi viết SP. FUI module.json tự quyết định method dựa trên cách gọi.

File này là **core**: naming, params, URL, response format, error handling, SP design rules, checklist. Hai chủ đề chuyên sâu đã tách ra — load thêm khi cần:

| Chủ đề | File |
|---|---|
| Kiểm tra quyền trong thân SP (5 pattern, `@sys_SystemRight`, `getSystemRight`) | [tapi-permission-patterns.md](tapi-permission-patterns.md) |
| File API — GET/UPLOAD, `spAPIFILE_`, `fileContent`, `tblFileData` | [tapi-file-api.md](tapi-file-api.md) |

> Nếu SP cần xử lý ảnh, gọi HTTP ra ngoài, gửi email, đọc/ghi file trên server, hoặc regex — kiểm tra xem DB đã có sẵn **SQL CLR function** (`httpCall`, `sendMail`, `ImageResize`, `FileWriter`, `RegexMatch`...) chưa trước khi viết logic thủ công. Xem [sql-clr-functions.md](sql-clr-functions.md).

## 1. Quy tắc đặt tên SP

### Cấu trúc tên

```
spAPI_[AUTH_]FunctionName
```

| Phần | Bắt buộc | Ý nghĩa |
|---|---|---|
| `spAPI_` | ✅ | Đánh dấu SP được phép gọi qua API. Thiếu prefix này → API không gọi được |
| `AUTH_` | ❌ | Không yêu cầu xác thực. Bỏ qua → bắt buộc phải có token hợp lệ |
| `FunctionName` | ✅ | Tên hàm API, dùng trong URL. Ví dụ: `MessageHome`, `UserSetting` |

**Ví dụ tên SP:**

```sql
spAPI_MessageHome       -- có auth
spAPI_AUTH_SelectChat   -- không cần auth
```

### File API

```
spAPIFILE_Document         -- SP để GET file
spAPIFILE_UPLOAD_Document  -- SP để nhận file upload
```

> Chi tiết File API: xem [tapi-file-api.md](tapi-file-api.md).

---

## 2. Tham số SP

Ba loại tham số:

### `@url1_`, `@url2_`, `@url3_`... — Route params

Giá trị lấy trực tiếp từ URL theo thứ tự:

```
https://api.domain.vn/app/FunctionName/value1/value2
```

```sql
@url1_GroupID varchar(50),  -- nhận "value1"
@url2_Mode    varchar(50),  -- nhận "value2"
```

### `@sys_` — System params (tAPI tự inject, không cần truyền từ client)

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `@sys_UserID` | varchar(9) | Mã người dùng đã xác thực |
| `@sys_UserName` | varchar(50) | Tên đăng nhập |
| `@sys_GroupID` | int | Nhóm của user |
| `@sys_DepartmentID` | varchar(9) | Mã đơn vị |
| `@sys_SystemRight` | int | Quyền phân tầng (1=thấp, 9=cao) |
| `@sys_FunctionRight` | varchar(2000) | Quyền chức năng dạng `[AD][RPT][MGR]` |
| `@sys_SessionID` | varchar(50) | Mã phiên xác thực |
| `@sys_RawData` | nvarchar(max) | Toàn bộ JSON body từ client |
| `@sys_Header_RequestID` | varchar(200) | RequestID từ HTTP header |

> **CRITICAL — Không truyền `@sys_` vào `IN` của module.json:**
> tAPI backend tự gán toàn bộ tham số `@sys_*` từ session đã xác thực. Nếu client truyền vào `IN`, giá trị sẽ bị **bỏ qua hoặc ghi đè** bởi server — truyền vào là thừa và có thể gây nhầm lẫn.
>
> ```json
> // ❌ SAI — không đưa sys_ vào IN
> "IN": { "ModuleID": "sModuleID", "sys_UserID": "vueData.user.UserID" }
>
> // ✅ ĐÚNG — chỉ truyền custom params
> "IN": { "ModuleID": "sModuleID" }
> ```
>
> `@sys_UserID`, `@sys_SystemRight`, `@sys_FunctionRight`... đều được tAPI tự điền — SP nhận đúng giá trị mà không cần client gửi.

### Custom params — Tham số nghiệp vụ do lập trình viên định nghĩa

Tên tham số = tên field trong JSON body gửi lên:

```sql
@StudentID  varchar(9),
@SemesterID int,
@Keyword    nvarchar(200)
```

> **CRITICAL — Không được gán giá trị mặc định cho bất kỳ tham số nào:**
> tAPI không hỗ trợ default value. Không gán `= value` hay `= null` cho bất kỳ tham số nào — kể cả `@sys_*`.
>
> ```sql
> -- ❌ SAI
> CREATE PROCEDURE spAPI_TS_Report
>     @HeID          int = 99,
>     @NamHoc        int = 2024,
>     @sys_UserID    varchar(9) = null,
>     @sys_SystemRight int
>
> -- ✅ ĐÚNG
> CREATE PROCEDURE spAPI_TS_Report
>     @HeID          int,
>     @NamHoc        int,
>     @sys_UserID    varchar(9),
>     @sys_SystemRight int
> ```

Client gửi: `POST /app/FunctionName` với body `{ "StudentID": "SV001", "SemesterID": 1 }`

---

## 3. URL gọi API

```
{domain}/{apiName}/{FunctionName}/{url1}/{url2}...
{domain}/{apiName}/auth/{FunctionName}/{url1}/{url2}...
```

| Phần | Ý nghĩa |
|---|---|
| `domain` | Domain API, ví dụ `https://api.example.vn` |
| `apiName` | Tên apiName của ứng dụng: `me`, `congvan`, `calen`... |
| `auth` | Thêm segment này khi SP có `AUTH_` (không cần token) |
| `FunctionName` | Phần tên sau prefix của SP |
| `url1`, `url2`... | Route params tương ứng `@url1_`, `@url2_` |

**Ví dụ:**

```
SP:  spAPI_AUTH_Select_Chat
URL: https://api.example.vn/me/auth/Select_Chat

SP:  spAPI_GetStudentList
URL: https://api.example.vn/me/GetStudentList

SP:  spAPI_GetStudentDetail  (@url1_StudentID)
URL: https://api.example.vn/me/GetStudentDetail/SV001
```

### 3.1 Cache tham số & route `/help`

tAPI **cache chữ ký tham số** (danh sách tên/kiểu param) của mỗi hàm sau lần gọi đầu tiên. Sau khi ALTER một SP `spAPI_*`/`spAPIFILE_*` để **thêm/bớt/đổi tên/đổi kiểu tham số**, endpoint thật vẫn phục vụ theo chữ ký **cũ** cho tới khi cache được xoá.

Route xoá cache = URL gọi API thật, chèn thêm `/help` ngay sau domain (trước `apiName`):

```
{domain}/help/{apiName}/{FunctionName}          ← xoá cache + trả về tham số của hàm
{domain}/help/{apiName}/auth/{FunctionName}
```

Gọi route này có hai tác dụng đồng thời: **(a) xoá cache tham số** của hàm đó và **(b) trả về danh sách tham số đầu vào** — hữu ích để tra cứu trước khi wire `IN` vào module.json mà không chắc SP đang nhận params nào.

**Quy tắc bắt buộc — xoá cache sau mỗi lần ALTER/UPDATE SP:**
- Dùng `db_sp_deploy`: tool tự gọi `/help` xoá cache. **Gọi đúng một lần theo URL chuẩn; hỏng thì bỏ qua** — SP đã deploy xong, đây chỉ là dọn cache.
- Dùng `db_sql_execute_nonquery` để chạy `ALTER PROCEDURE` trực tiếp: **không có auto-clear** → **bắt buộc gọi `db_sp_help` thủ công** ngay sau khi ALTER thành công. Đây là ca duy nhất bắt buộc gọi tay.
- Không xoá cache → endpoint thật tiếp tục phục vụ theo chữ ký **cũ**, có thể gây lỗi tham số ngay cả khi SP đã đúng.
- **`/help` báo lỗi thì DỪNG, không thử URL biến thể.** Dạng URL (`/auth/` hay không) suy ra từ tên SP, không phải thứ để đoán; thử qua lại chỉ tốn lượt mà không đổi kết quả. Chỉ quay lại `db_sp_help` khi endpoint thật thực sự còn nhận tham số cũ.

---

## 4. Format dữ liệu trả về

### 4.1 Một SELECT — trả về array

```sql
SELECT StudentID, FullName, GPA FROM tblStudent WHERE ClassID = @ClassID
```

```json
{
  "data": [
    { "StudentID": "SV001", "FullName": "Nguyen Van A", "GPA": 3.5 },
    { "StudentID": "SV002", "FullName": "Tran Thi B",   "GPA": 3.2 }
  ]
}
```

### 4.2 Nhiều SELECT — trả về array of arrays

Mỗi `SELECT` trong SP tạo thành một mảng con trong `data`:

```sql
SELECT TotalCount = COUNT(*) FROM tblStudent WHERE ClassID = @ClassID
SELECT StudentID, FullName FROM tblStudent WHERE ClassID = @ClassID
```

```json
{
  "data": [
    [{ "TotalCount": 42 }],
    [
      { "StudentID": "SV001", "FullName": "Nguyen Van A" },
      { "StudentID": "SV002", "FullName": "Tran Thi B" }
    ]
  ]
}
```

**Trong FUI module.json**, đọc từng mảng con qua index:
```json
"OUT": "studentList",
"CALLBACK": { "EXE": "vueData.total = vueData.studentList[0][0].TotalCount; vueData.students = vueData.studentList[1]" }
```

### 4.3 `convert_to_object` — convert một dòng thành object

Dùng khi muốn trả về record dạng object thay vì array. Một SP có thể có **nhiều SELECT** dùng `convert_to_object` — tất cả được merge vào cùng một object response.

> ⚠️ **Quy tắc quan trọng**: Khi SELECT có `convert_to_object` **và** cột `json_data` chứa JSON string, SELECT đó chỉ được trả về **đúng 1 dòng**. Nếu nhiều hơn 1 dòng → tAPI trả về `{}` (object rỗng).

**Hai dạng giá trị:**
- `convert_to_object = 'key'` → tạo nested object với tên key đó
- `convert_to_object = ''` → merge thẳng vào root object

**Ví dụ 1 — Kết hợp named key và root merge:**

```sql
SELECT convert_to_object = 'sinhvien',
       sys_SystemRight = @sys_SystemRight,
       sys_FunctionRight = @sys_FunctionRight

SELECT convert_to_object = '',
       ngaythang = GETDATE(), count = 10
```

```json
{
  "sinhvien": {
    "sys_SystemRight": 9,
    "sys_FunctionRight": "[11][3]"
  },
  "ngaythang": "2018-09-11T11:20:47.397",
  "count": 10
}
```

**Ví dụ 2 — `json_data` override field cùng tên:**

```sql
SELECT convert_to_object = '',
       ProjectName = N'abc',
       stt = 123,
       json_data = '{"ProjectName":"T-A-P-I","menu":[{"name":"Croatia","link":"vn"},{"name":"England","link":"/tuyensinh"}]}'
```

```json
{
  "ProjectName": "T-A-P-I",
  "stt": 123,
  "menu": [
    { "name": "Croatia", "link": "vn" },
    { "name": "England", "link": "/tuyensinh" }
  ]
}
```

> `json_data` được parse và merge sau — nếu có field trùng tên với cột SQL (`ProjectName`), **giá trị từ `json_data` sẽ override**.

**Ví dụ 3 — Nhiều SELECT cùng `convert_to_object = ''` đều merge vào root:**

```sql
SELECT convert_to_object = '',
       ProjectName = N'abc', stt = 123,
       json_data = '{"ProjectName":"T-A-P-I","menu":[{"name":"Croatia","link":"vn"},{"name":"England","link":"/tuyensinh"}]}'

SELECT convert_to_object = '',
       TruyVan2 = N'Dữ liệu của truy vấn 2',
       json_data = '{"TruyVan2_json_string": 99}'
```

```json
{
  "ProjectName": "T-A-P-I",
  "stt": 123,
  "menu": [
    { "name": "Croatia", "link": "vn" },
    { "name": "England", "link": "/tuyensinh" }
  ],
  "TruyVan2": "Dữ liệu của truy vấn 2",
  "TruyVan2_json_string": 99
}
```

Tất cả SELECT trong SP đều merge vào **cùng 1 object** — không tạo array như SELECT thông thường.

### 4.4 `[json_data:FieldName]` — Convert chuỗi JSON thành object

Khi cột trong bảng lưu chuỗi JSON và cần trả về dạng object (không phải string), dùng alias `[json_data:FieldName]`:

```sql
SELECT PartID, PartName, [json_data:FileInfo] = FileInfo
FROM tblPart WHERE PartID = @url1_PartID
```

tAPI tự động parse cột có alias `json_data:FieldName` thành nested JSON object trong response:

```json
{
  "PartID": "P001",
  "PartName": "Tài liệu",
  "FileInfo": { "fileName": "doc.pdf", "size": 1024 }
}
```

Không cần parse thủ công ở client. Cột DB vẫn lưu dạng string — chỉ response được convert.

> Tên sau dấu `:` (`FileInfo`) là tên field trong response. Tên cột SQL (`FileInfo` trong `= FileInfo`) là tên cột thực trên bảng.

---

## 5. Xử lý lỗi trong SP

Tất cả lỗi dùng `RAISERROR` với severity **16** — không dùng severity khác.

### Lỗi thông thường (validation, ràng buộc dữ liệu)

```sql
RAISERROR(N'Dữ liệu không hợp lệ', 16, 1)
RETURN
```

```json
{ "Message": "Dữ liệu không hợp lệ" }
```

### Lỗi Unauthorized (thiếu quyền) — prefix `[Unauthorized]` → HTTP 401

```sql
IF @sys_SystemRight < 2
BEGIN
    RAISERROR(N'[Unauthorized]Bạn không có quyền trên chức năng này.', 16, 1)
    RETURN
END
```

```json
{ "Message": "Bạn không có quyền trên chức năng này." }
```

**Quy tắc bắt buộc:**
- Luôn dùng severity `16` — không dùng `11`, `14`, hay giá trị khác
- Luôn có `RETURN` ngay sau `RAISERROR` để dừng SP
- Prefix `N` bắt buộc cho Unicode tiếng Việt
- **Mọi lỗi liên quan đến quyền (thiếu `SystemRight`/`FunctionRight`) phải mở message bằng `[Unauthorized]`** — tAPI đọc chuỗi này để trả HTTP status `401` thay vì `200`/`500` mặc định; client (`errorMess()` trong `fastproject.js`) rẽ nhánh xử lý riêng theo status `401` (redirect login nếu message chứa "token", ngược lại hiện lỗi quyền). tAPI tự cắt `[Unauthorized]` khỏi `Message` trả về client — text người dùng thấy không có tiền tố này. Lỗi validation/ràng buộc dữ liệu thông thường (ví dụ trên) **không** dùng prefix này.

> **Kiểm tra quyền chi tiết (5 pattern, `getSystemRight`, thứ tự kiểm tra, quy ước message):** xem [tapi-permission-patterns.md](tapi-permission-patterns.md).

---

## 6. Quy tắc thiết kế SP tốt

### Đặt tên SP

```
spAPI_{Entity}{Action}
```

| Action | Mô tả |
|---|---|
| `Select` / `List` | Truy vấn danh sách |
| `Get` | Lấy chi tiết một bản ghi |
| `Insert` / `Add` | Thêm mới |
| `Update` / `Edit` | Cập nhật |
| `Delete` / `Remove` | Xoá |
| `AUTH_Select` | Truy vấn công khai (không cần token) |

**Ví dụ chuẩn:**

```sql
spAPI_StudentList          -- GET danh sách sinh viên
spAPI_StudentGet           -- GET chi tiết (url1 = StudentID)
spAPI_StudentInsert        -- POST thêm mới
spAPI_StudentUpdate        -- POST cập nhật
spAPI_StudentDelete        -- POST xoá (url1 = StudentID)
spAPI_AUTH_CourseList      -- Danh sách môn học công khai
```

### Wiring trong FUI module.json

```json
"fetchStudents": {
  "API": "/me/StudentList",
  "IN": { "Keyword": "vueData.keyword", "ClassID": "vueData.selectedClass" },
  "OUT": "studentList"
},
"addStudent": {
  "API": "/me/StudentInsert",
  "IN": {
    "StudentID":  "vueData.form.StudentID",
    "FullName":   "vueData.form.FullName",
    "ClassID":    "vueData.form.ClassID"
  },
  "CALLBACK": { "CALL": "vueData.fetchStudents", "MESS": "Đã thêm thành công" }
},
"deleteStudent": {
  "API": "/me/StudentDelete/`{{vueData.selectedID}}",
  "CONFIRM": "Bạn có chắc muốn xoá?",
  "CALLBACK": { "CALL": "vueData.fetchStudents" }
}
```

---

## 7. Checklist khi thiết kế SP

1. Prefix `spAPI_` bắt buộc — thiếu là API không gọi được
2. Thêm `AUTH_` nếu endpoint công khai (login page, lookup data)
3. `@sys_UserID` luôn có trong SP có ghi dữ liệu (audit trail)
4. Không dùng `SELECT *` — liệt kê cột cụ thể
5. Kiểm tra quyền ở đầu SP nếu cần, dùng `RAISERROR` + `RETURN` — xem [tapi-permission-patterns.md](tapi-permission-patterns.md)
6. Nhiều SELECT → client đọc theo index `data[0]`, `data[1]`
7. Một record duy nhất → dùng `convert_to_object` thay vì `data[0][0]`
8. Sau khi `CREATE PROCEDURE` → phải `GRANT EXECUTE ON [spName] TO [public]`
9. **Không đưa tham số `sys_*` vào `IN` của module.json** — tAPI tự inject, truyền vào là thừa
10. **File GET/UPLOAD**: prefix `spAPIFILE_`, cột binary alias `fileContent`, params `@sys_FileContent`/`@sys_FileName`, bảng chuẩn `tblFileData` — xem [tapi-file-api.md](tapi-file-api.md). Không tự suy từ training data.
11. **Mọi ALTER/UPDATE SP đã deploy** (đổi tham số, đổi logic, hay bất kỳ thay đổi nào) → **BẮT BUỘC xoá cache tAPI** qua `db_sp_help` sau khi deploy — nếu không endpoint thật vẫn phục vụ theo chữ ký cũ. `db_sp_deploy` tự làm (một lần, hỏng thì bỏ qua); chỉ khi ALTER qua `db_sql_execute_nonquery` mới phải gọi `db_sp_help` thủ công.
