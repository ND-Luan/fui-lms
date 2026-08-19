# Quy tắc thiết kế bảng (Table Design Conventions)

> File này sở hữu: **quy tắc thiết kế bảng: đặt tên, PK/FK, cột audit, kiểu dữ liệu**. Workflow kết nối/SP xem [db-workflow.md](db-workflow.md).

Quy ước đặt tên bảng, khóa chính, và cột audit khi thiết kế database cho FUI. Load file này khi thiết kế schema mới.

> **Lưu ý:** `CREATE TABLE`/`ALTER TABLE` phải do lập trình viên tự chạy — MCP tool chặn `ALTER TABLE`. Đây là tài liệu quy ước, không phải lệnh để AI tự deploy cấu trúc bảng.
>
> Kết nối DB, dbToken, schema, workflow SP: xem [db-workflow.md](db-workflow.md). Thiết kế app nhiều bảng/module: xem [system-design.md](system-design.md).

---

## Đặt tên bảng

| Nhóm | Quy tắc | Ví dụ |
|---|---|---|
| Bảng hệ thống / danh mục bổ trợ | Chữ thường, không tiền tố | `syslog`, `syslogtype`, `syspermission` |
| Bảng nghiệp vụ / thực thể chính | Tiền tố `tbl` + PascalCase | `tblUsers`, `tblDepartments`, `tblSession` |

**Khóa chính:** `[TênThựcThể]ID` — ghép tên thực thể + `ID`

| Bảng | Khóa chính |
|---|---|
| `tblUsers` | `UserID` |
| `tblDepartments` | `DepartmentID` |
| `tblSession` | `SessionID` |

> Nhất quán: FK ở bảng con dùng cùng tên với PK bảng cha — `UserID` không đổi thành `CreatorID` hay `OwnerID`.

---

## Trường thời gian (Timestamp)

Mỗi bảng nên có ít nhất một trường timestamp để truy vết mốc thời gian:

```sql
[CreateTime]  [datetime]  DEFAULT (getdate())
[UpdateTime]  [datetime]  DEFAULT (getdate())
```

- Kiểu dữ liệu: `datetime`  
- `DEFAULT (getdate())` — SQL Server **tự điền** khi INSERT, không cần truyền từ code  
- Dùng `CreateTime` cho bảng chỉ ghi một lần; `UpdateTime` cho bảng cập nhật thường xuyên; cả hai khi cần phân biệt ngày tạo vs ngày sửa cuối

---

## Trường định danh người thực hiện (User Tracking)

```sql
[CreateUser]  [char](9)  NULL
[UpdateUser]  [char](9)  NULL
```

- Kiểu dữ liệu: `char(9)` hoặc `varchar(20)` — **đồng bộ với kiểu dữ liệu của `UserID` trong `tblUsers`**
- **Không có DEFAULT** — ứng dụng bắt buộc phải truyền `UserID` của user đang đăng nhập
- SQL Server không tự biết user nào đang thao tác qua FUI/tAPI — trách nhiệm thuộc về code
- Trong SP: nhận qua `@sys_UserID` (tAPI auto-inject), lưu vào `[CreateUser]` / `[UpdateUser]`

```sql
CREATE PROCEDURE spAPI_EntityInsert
    @Name        nvarchar(100),
    @sys_UserID  int              -- tAPI auto-inject UserID
AS
    INSERT INTO tblEntity (Name, CreateUser, CreateTime)
    VALUES (@Name, @sys_UserID, DEFAULT)
```

---

## Template cột audit — copy-paste khi tạo bảng mới

```sql
[CreateUser]  [char](9)   NULL,
[CreateTime]  [datetime]  DEFAULT (getdate()),
[UpdateUser]  [char](9)   NULL,
[UpdateTime]  [datetime]  DEFAULT (getdate()),
```
