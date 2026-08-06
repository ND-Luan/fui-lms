# Full-Stack Module Workflow

> File này sở hữu: **quy trình 6 bước tạo một module fullstack, UI-first (phân tích → dựng UI data cứng → chốt contract → SP → wiring API → kiểm chứng tĩnh)**. Quy ước tAPI xem [tapi-reference.md](tapi-reference.md); thiết kế nhiều module xem [system-design.md](system-design.md).

Quy trình 6 bước để thiết kế một FUI module hoàn chỉnh: có cả UI (FUI) lẫn backend API (tAPI).

**Nguyên tắc UI-first:** dựng UI bằng dữ liệu cứng trước, xác nhận hình ảnh đúng bằng `module_simulate({ renderUI: true })`, RỒI mới chốt contract API và viết SP. Tách pha "làm UI" khỏi pha "nối API" giảm hẳn lỗi so với viết cả hai cùng lúc — sửa cấu trúc data khi còn là literal trong `data[]` rẻ hơn nhiều so với sửa sau khi đã có `IN`/`OUT`/`watch` phụ thuộc vào nó. Không có bước nào trong quy trình này gọi API/SP thật để "test" — kiểm chứng luôn là đọc + suy luận + mock (xem [verification.md](verification.md)).

Đọc [tapi-reference.md](tapi-reference.md) trước khi bắt đầu bước 3.

---

## Bước 1 — Phân tích yêu cầu

Trước khi viết bất kỳ dòng code nào, xác định rõ:

**1.1 Nghiệp vụ cần làm gì?**
- Danh sách / tìm kiếm / lọc dữ liệu?
- Thêm / sửa / xoá bản ghi?
- Báo cáo / thống kê?
- Workflow (duyệt, từ chối, trạng thái)?

**1.2 Dữ liệu liên quan (ước lượng ban đầu — sẽ chốt lại chính xác ở bước 3):**
- Entity chính là gì? Các entity liên kết?
- Trường nào hiển thị, trường nào nhập liệu?

**1.3 Quyền và xác thực:**
- Module có cần login không? (nếu không → dùng `AUTH_` trong SP)
- Có phân quyền theo `sys_SystemRight` không? → xử lý trong thân SP

**Output bước 1:** Danh sách tính năng + tên các entity chính (chưa cần chốt kiểu dữ liệu/tên cột).

---

## Bước 2 — Dựng UI với dữ liệu cứng

Thiết kế toàn bộ UI của module bằng dữ liệu **literal** khai báo thẳng trong `data[]` — chưa có API nào cả. Xem [module-json-anatomy.md](module-json-anatomy.md) và [controls-patterns.md](controls-patterns.md) để biết cấu trúc control/grid.

```json
"data": [
  { "keyword": "" },
  { "classId": "" },
  { "studentList": [
      { "StudentID": "SV001", "FullName": "Nguyễn Văn A", "ClassID": "C01", "ClassName": "Lớp 10A", "GPA": 8.5 },
      { "StudentID": "SV002", "FullName": "Trần Thị B", "ClassID": "C02", "ClassName": "Lớp 10B", "GPA": 7.2 }
  ] },
  { "form": {} },
  { "dialogOpen": false }
]
```

Dựng `f-table`/`v-dialog`/form theo dữ liệu cứng này — component-table/dialog patterns xem [component-table.md](component-table.md), [ui-templates.md](ui-templates.md).

**QA hình ảnh ngay ở bước này:** `module_simulate({ renderUI: true, vueData: {...dữ liệu cứng nếu muốn override} })`, đọc screenshot + DOM audit, tự sửa lỗi hiển thị (tràn ngang, dialog vỡ, thiếu label...) trước khi đi tiếp — không mang lỗi UI sang các bước sau.

**Output bước 2:** `module.json` có layout hoàn chỉnh, chạy được với data cứng, đã qua `renderUI` QA sạch.

---

## Bước 3 — Chốt cấu trúc data + thiết kế API endpoints

Từ chính các field đã dùng ở data cứng bước 2 (đây là lý do bước 2 đi trước — cấu trúc field đã được xác nhận đúng bằng mắt trước khi biến thành contract SP), chốt:
- Tên field chính xác, kiểu dữ liệu (dùng để suy ra kiểu cột SQL)
- Entity/table nào sinh ra field nào

Rồi map sang các SP tAPI cần tạo. Quy ước đặt tên đầy đủ (`spAPI_*` / `spAPI_AUTH_*` / `spAPIFILE_*`, params `@url1_`, response contract) là của [tapi-reference.md](tapi-reference.md) — ở đây chỉ áp dụng vào việc map tính năng sang SP theo pattern `spAPI_{Entity}{Action}`.

**Bảng mapping thường gặp:**

| Tính năng | SP name | Params chính |
|---|---|---|
| Lấy danh sách | `spAPI_{Entity}List` | Filter params (custom) |
| Lấy chi tiết | `spAPI_{Entity}Get` | `@url1_{EntityID}` |
| Thêm mới | `spAPI_{Entity}Insert` | Các field của entity |
| Cập nhật | `spAPI_{Entity}Update` | ID + các field cần cập nhật |
| Xoá | `spAPI_{Entity}Delete` | `@url1_{EntityID}` |
| Lookup / dropdown | `spAPI_AUTH_{Entity}Options` | Không cần auth, trả danh sách |

**Ví dụ cho module "Quản lý Sinh viên"** (khớp field đã dùng ở data cứng bước 2: `StudentID`, `FullName`, `ClassID`, `ClassName`, `GPA`):

```
spAPI_StudentList       -- danh sách, lọc theo ClassID + Keyword — trả đúng các cột đã hiển thị ở bước 2
spAPI_StudentGet        -- chi tiết theo url1=StudentID
spAPI_StudentInsert     -- thêm mới
spAPI_StudentUpdate     -- cập nhật
spAPI_StudentDelete     -- xoá theo url1=StudentID
spAPI_AUTH_ClassOptions -- dropdown danh sách lớp (không cần auth)
```

**Output bước 3:** Danh sách đầy đủ SP, tên + params + response shape khớp field đã dùng trong UI.

---

## Bước 4 — Viết SQL Stored Procedures

Viết SP theo đúng quy tắc tAPI và đúng contract đã chốt ở bước 3. Xem chi tiết tại [tapi-reference.md](tapi-reference.md).

**Template SP SELECT (danh sách):**

```sql
CREATE PROCEDURE spAPI_StudentList
    @Keyword    nvarchar(200) = NULL,
    @ClassID    varchar(20)   = NULL,
    @sys_UserID varchar(9)
AS BEGIN
    SELECT s.StudentID, s.FullName, s.ClassID, c.ClassName, s.GPA
    FROM tblStudent s
    JOIN tblClass c ON s.ClassID = c.ClassID
    WHERE (@Keyword IS NULL OR s.FullName LIKE '%' + @Keyword + '%')
      AND (@ClassID IS NULL OR s.ClassID = @ClassID)
    ORDER BY s.FullName
END
```

**Template SP INSERT:**

```sql
CREATE PROCEDURE spAPI_StudentInsert
    @StudentID  varchar(9),
    @FullName   nvarchar(100),
    @ClassID    varchar(20),
    @sys_UserID varchar(9)
AS BEGIN
    IF EXISTS (SELECT 1 FROM tblStudent WHERE StudentID = @StudentID)
    BEGIN
        RAISERROR(N'Mã sinh viên đã tồn tại', 16, 1)
        RETURN
    END
    INSERT INTO tblStudent (StudentID, FullName, ClassID, CreateUser, CreateTime)
    VALUES (@StudentID, @FullName, @ClassID, @sys_UserID, GETDATE())
    SELECT mess = N'Thêm thành công', id = @StudentID
END
```

**Template SP DELETE:**

```sql
CREATE PROCEDURE spAPI_StudentDelete
    @url1_StudentID varchar(9),
    @sys_UserID     varchar(9)
AS BEGIN
    DELETE FROM tblStudent WHERE StudentID = @url1_StudentID
    SELECT mess = N'Đã xoá', id = @url1_StudentID
END
```

**Template SP GET (chi tiết, dùng convert_to_object):**

```sql
CREATE PROCEDURE spAPI_StudentGet
    @url1_StudentID varchar(9),
    @sys_UserID     varchar(9)
AS BEGIN
    SELECT convert_to_object = '',
           s.StudentID, s.FullName, s.ClassID, c.ClassName, s.GPA, s.Email
    FROM tblStudent s
    JOIN tblClass c ON s.ClassID = c.ClassID
    WHERE s.StudentID = @url1_StudentID
END
```

> Dùng `convert_to_object = ''` khi SP trả về đúng một record → response dạng object thay vì `data[0][0]`.

**Sau khi CREATE PROCEDURE, phải GRANT quyền:**

```sql
GRANT EXECUTE ON [dbo].[spAPI_StudentList] TO [public] AS [dbo]
```

Deploy bằng `db_sp_save` + `db_sp_update` (không tự gọi endpoint để "chạy thử" — xem bước 6).

**Output bước 4:** Toàn bộ SQL script đã deploy cho các SP thiết kế ở bước 3.

---

## Bước 5 — Thay dữ liệu cứng bằng binding API

Sửa lại `module.json` đã dựng ở bước 2: giữ nguyên layout, thay giá trị literal trong `data[]` bằng named action `IN`/`OUT`/`CALLBACK` trỏ vào các SP vừa deploy.

**5.1 Khai báo action thay cho data cứng**

```json
"data": [
  { "keyword": "" },
  { "classId": "" },
  { "studentList": [] },

  {
    "fetchStudents": {
      "API": "/{apiName}/StudentList",
      "IN": { "Keyword": "vueData.keyword", "ClassID": "vueData.classId" },
      "OUT": "studentList"
    }
  },
  {
    "saveStudent": {
      "API": "/{apiName}/StudentInsert",
      "IN": {
        "StudentID": "vueData.form.StudentID",
        "FullName":  "vueData.form.FullName",
        "ClassID":   "vueData.form.ClassID"
      },
      "CALLBACK": {
        "CALL": "vueData.fetchStudents",
        "MESS": "Thêm thành công",
        "EXE":  "vueData.dialogOpen = false"
      }
    }
  },
  {
    "deleteStudent": {
      "API": "/{apiName}/StudentDelete/`{{vueData.selectedID}}",
      "CONFIRM": "Bạn có chắc muốn xoá sinh viên này?",
      "CALLBACK": { "CALL": "vueData.fetchStudents" }
    }
  }
]
```

**5.2 Khai báo watch để tự load khi filter thay đổi**

```json
"watch": {
  "keyword": { "CALL": "vueData.fetchStudents" },
  "classId":  { "CALL": "vueData.fetchStudents" }
}
```

**5.3 Thêm `{ "CALL": "vueData.fetchStudents" }` cuối `data[]`** để auto-load khi module mở.

**Output bước 5:** `module.json` đã wiring API đầy đủ, layout không đổi so với bước 2.

---

## Bước 6 — Kiểm chứng tĩnh và hoàn thiện

Checklist trước khi publish — **không bước nào gọi API/SP/DML thật**:

**API/SP** — checklist đầy đủ (naming, params, security, `GRANT EXECUTE`, deploy workflow) ở
[verification.md](verification.md#deploy-workflow). Ở bước này:
- [ ] SP có `AUTH_` cho các endpoint không cần login
- [ ] `db_sp_verify` cho từng SP mới deploy — đọc thân SP thật, suy luận response shape/contract lỗi, đối chiếu params, sinh sẵn snippet `apiMocks` (không gọi endpoint thật)
- [ ] API **ghi**: đọc thân SP suy luận (WHERE, transaction, RAISERROR) — không có "chạy thử" nào khác ngoài đọc + suy luận

**FUI module.json:**
- [ ] `API` path trong mỗi action khớp đúng `/{apiName}/{FunctionName}`
- [ ] `IN` params khớp đúng tên param trong SP (phân biệt hoa thường)
- [ ] Route params (url1, url2) được truyền qua URL, không phải qua `IN`
- [ ] `OUT` nhận đúng kiểu dữ liệu (array hay object tuỳ SP) — đối chiếu với response shape suy luận từ `db_sp_verify`
- [ ] `watch` đã khai báo cho các filter tự động reload
- [ ] `data[]` khai báo named action fetch ban đầu, kết thúc bằng `{ "CALL": ... }` auto-startup

**Kiểm chứng cuối cùng theo thứ tự:** `module_validate` (lỗi cú pháp/quy tắc) → `module_outline` (review cấu trúc UI dạng text) → `module_simulate` với `apiMocks` lấy từ snippet của `db_sp_verify` (verify luồng action/watch/dialog) → nếu còn nghi ngờ hiển thị, `module_simulate({ renderUI: true })` lần cuối với cùng `apiMocks`.

**Output bước 6:** Module hoạt động end-to-end, UI ↔ API thông suốt, chưa từng có lời gọi thật nào trong suốt quá trình kiểm chứng.

---

## Ví dụ đầu ra hoàn chỉnh

### SP cần tạo (bước 4 output)

```sql
-- 1. Danh sách
CREATE PROCEDURE spAPI_StudentList @Keyword nvarchar(200) = NULL, @ClassID varchar(20) = NULL, @sys_UserID varchar(9)
AS BEGIN
    SELECT s.StudentID, s.FullName, s.ClassID, s.GPA
    FROM tblStudent s WHERE (@Keyword IS NULL OR s.FullName LIKE '%'+@Keyword+'%') AND (@ClassID IS NULL OR s.ClassID = @ClassID)
END
GRANT EXECUTE ON [dbo].[spAPI_StudentList] TO [public] AS [dbo]

-- 2. Thêm mới
CREATE PROCEDURE spAPI_StudentInsert @StudentID varchar(9), @FullName nvarchar(100), @ClassID varchar(20), @sys_UserID varchar(9)
AS BEGIN
    INSERT INTO tblStudent(StudentID, FullName, ClassID, CreateUser, CreateTime) VALUES(@StudentID, @FullName, @ClassID, @sys_UserID, GETDATE())
    SELECT mess = N'Thêm thành công'
END
GRANT EXECUTE ON [dbo].[spAPI_StudentInsert] TO [public] AS [dbo]
```

### module.json actions (bước 5 output)

```json
"fetchStudents": { "API": "/me/StudentList", "IN": { "Keyword": "vueData.keyword" }, "OUT": "studentList" },
"addStudent":    { "API": "/me/StudentInsert", "IN": { "StudentID": "vueData.form.StudentID", "FullName": "vueData.form.FullName", "ClassID": "vueData.form.ClassID" }, "CALLBACK": { "CALL": "vueData.fetchStudents", "MESS": "Đã thêm" } }
```

---

## Lưu ý quan trọng

- **`{apiName}`** trong API path là tên apiName của app trong tAPI (ví dụ `me`, `lms`, `hr`). Hỏi người dùng nếu chưa biết.
- **Route params** (`@url1_`) truyền qua URL, không qua `IN`: dùng backtick prefix trong API path: `"API": "/me/StudentDelete/\`{{vueData.selectedID}}"`
- **Response từ SP có nhiều SELECT** → `data[0]`, `data[1]`... — khai báo rõ trong `OUT` hoặc dùng `EXE` để tách.
- **`convert_to_object = ''`** → response là object phẳng, đọc trực tiếp `vueData.studentDetail.FullName` thay vì `vueData.studentDetail[0].FullName`.
