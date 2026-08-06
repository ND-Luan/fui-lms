# tAPI — File API (GET / UPLOAD)

> File này sở hữu: **API file qua SP: `spAPIFILE_*`, `tblFileData`, alias `fileContent`, `@sys_FileContent`/`@sys_FileName`**.

SP GET và UPLOAD file qua tAPI: prefix `spAPIFILE_`, cột binary alias `fileContent`, params `@sys_FileContent`/`@sys_FileName`, bảng chuẩn `tblFileData`. Load file này khi module cần upload/download/xem file. **Không tự suy từ training data** — tAPI có quy ước riêng.

> Nền tảng SP (naming, params, response): xem [tapi-reference.md](tapi-reference.md).

---

## GET file

SP phải SELECT **tối thiểu 3 cột bắt buộc** (có thể thêm cột metadata tùy ý):

| Cột | Bắt buộc | Ý nghĩa |
|---|---|---|
| `FileName` | ✅ | Tên file trả về — có thể là biểu thức, ví dụ `FileName + FileType` |
| `ContentType` | ✅ | MIME type (vd: `application/pdf`, `image/png`) |
| `fileContent` | ✅ | Binary content — alias từ cột kiểu **`image` hoặc `varbinary`**. tAPI nhận diện đây là nội dung file cần stream qua kiểu dữ liệu này |
| cột khác | ❌ | Metadata tùy chọn, ví dụ `Modified`, `FileSize` — phải là kiểu thông thường (không phải binary) |

```sql
-- Ví dụ thực tế: FileName ghép đuôi, thêm cột Modified, binary aliased từ FileContentBIN
CREATE PROCEDURE spAPIFILE_moduleImportFile
    @fileID varchar(50)
AS BEGIN
    SELECT
        FileName    = FileName + FileType,
        ContentType,
        Modified    = ISNULL(UpdateTime, CreateTime),
        fileContent = FileContentBIN
    FROM tblA_ImportFile
    WHERE fileID = LEFT(@fileID, 32)
END
```

> `fileContent` phải alias từ cột kiểu `image` hoặc `varbinary(max)` — tAPI dùng kiểu dữ liệu này để nhận biết và stream nội dung file. Tên cột trong bảng tùy ý (`FileContentBIN`, `BinaryContent`, ...).  
> `FileName` nên bao gồm cả phần đuôi file (`.pdf`, `.xlsx`...) để browser nhận đúng kiểu.

**Tham số URL — `@fileID` và `@filename`:**

| Param | Bắt buộc | Nguồn | Ý nghĩa |
|---|---|---|---|
| `@fileID varchar(...)` | ✅ | Segment đầu tiên sau FunctionName | ID của file cần lấy |
| `@filename varchar(...)` | ❌ | Segment CUỐI cùng trong URL | Phần tên file hiển thị trong URL (browser/download manager dùng để đặt tên khi tải) |

Ngoài hai tham số trên, có thể khai báo thêm `@sys_*` auth params nếu cần kiểm tra quyền.

```sql
CREATE PROCEDURE spAPIFILE_Document
    @fileID      varchar(50),   -- bắt buộc, inject từ URL
    @filename    varchar(200),  -- tùy chọn — inject từ segment cuối URL; SP có thể dùng để
                                --   ghi log, kiểm tra, hoặc override FileName trả về
    @sys_UserID  varchar(9)     -- tùy chọn, inject từ token
AS BEGIN
    ...
END
```

**4 route pattern hỗ trợ:**

```
{domain}/{apiName}/{FunctionName}/{fileID}
{domain}/{apiName}/{FunctionName}/{fileID}/{filename}
{domain}/{apiName}/download/{FunctionName}/{fileID}/{filename}
{domain}/{apiName}/viewer/{FunctionName}/{fileID}/{filename}
```

`{FunctionName}` là phần tên sau prefix `spAPIFILE_`. Ví dụ SP `spAPIFILE_Document` → URL dùng `Document`.

Route `/viewer/` dùng để xem trực tiếp trong browser (inline), `/download/` để tải về.

> **Lưu ý `@filename`:** Segment này trong URL thường là tên file gốc (ví dụ `BaoCao_2024.pdf`) — browser và download manager dùng nó để đặt tên file khi tải về, không nhất thiết phải khớp với `FileName` trong bảng DB. SP không khai báo `@filename` thì tAPI vẫn nhận route có segment đó — param đơn thuần bị bỏ qua.

## Upload file

**Params đặc biệt do tAPI tự inject khi upload:**

| Param | Kiểu | Mô tả |
|---|---|---|
| `@sys_FileContent` | varbinary(max) | Binary content của file |
| `@sys_FileName` | nvarchar(200) | Tên file gốc |
| `@sys_FileContentType` | varchar(100) | MIME type |
| `@sys_FileSize` | int | Kích thước file (bytes) |
| `@sys_UploadData` | nvarchar(max) | JSON data bổ sung truyền qua header |

Ngoài ra toàn bộ `@sys_` auth params cũng available: `@sys_UserID`, `@sys_UserName`, `@sys_SessionID`, `@sys_GroupID`, `@sys_DepartmentID`, `@sys_SystemRight`, `@sys_FunctionRight`.

```sql
CREATE PROCEDURE spAPIFILE_UPLOAD_Attachment
    @url1_SessionID      varchar(36),
    @url2_Mode           varchar(20),
    @sys_UserID          varchar(9),
    @sys_FileContent     varbinary(max),
    @sys_FileName        nvarchar(200),
    @sys_FileContentType varchar(100),
    @sys_FileSize        int
AS BEGIN
    INSERT INTO tblAttachFiles(FileName, Capacity, SessionID, CreateUser)
    VALUES(@sys_FileName, @sys_FileSize, @url1_SessionID, @sys_UserID)
END
```

Route: `POST {domain}/{apiName}/upload/{spName}/{url1}/{url2}...`

## Bảng lưu trữ file chuẩn — `tblFileData`

Đây là cấu trúc bảng chuẩn để dùng chung với cả `spAPIFILE_` (GET) và `spAPIFILE_UPLOAD_` (POST). Khi thiết kế module có file, tạo bảng này (hoặc bảng tương tự) trước khi viết SP.

```sql
CREATE TABLE [dbo].[tblFileData](
    [FileID]          [char](36)      NOT NULL,   -- UUID, DEFAULT newid()
    [FileName]        [nvarchar](200) NOT NULL,
    [PhysicalName]    [char](36)      NOT NULL,   -- UUID, DEFAULT newid()
    [PhysicalSegment] [char](10)      NOT NULL,   -- subfolder theo ngày, DEFAULT getPhysicalSegment(getdate())
    [CreateTime]      [datetime]      NOT NULL,   -- DEFAULT getdate()
    [WriteToDisk]     [datetime]      NULL,        -- null = chưa ghi ra disk
    [BinaryContent]   [image]         NULL,        -- binary file content — alias là fileContent trong SP GET
    [ContentType]     [varchar](100)  NULL,        -- MIME type, DEFAULT ''
    [Size]            [int]           NULL,
    CONSTRAINT [PK_tblFileData] PRIMARY KEY CLUSTERED ([FileID] ASC)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[tblFileData] ADD CONSTRAINT [DF_tblFileData_FileID]          DEFAULT (newid())                              FOR [FileID]
ALTER TABLE [dbo].[tblFileData] ADD CONSTRAINT [DF_tblFileData_PhysicalName]    DEFAULT (newid())                              FOR [PhysicalName]
ALTER TABLE [dbo].[tblFileData] ADD CONSTRAINT [DF_tblFileData_PhysicalSegment] DEFAULT ([dbo].[getPhysicalSegment](getdate())) FOR [PhysicalSegment]
ALTER TABLE [dbo].[tblFileData] ADD CONSTRAINT [DF_tblFileData_CreateTime]      DEFAULT (getdate())                            FOR [CreateTime]
ALTER TABLE [dbo].[tblFileData] ADD CONSTRAINT [DF_tblFileData_ContentType]     DEFAULT ('')                                   FOR [ContentType]
```

> **Lưu ý về DDL:** `CREATE TABLE`/`ALTER TABLE` phải do lập trình viên tự chạy — MCP tool chặn `ALTER TABLE`. Đây là tài liệu tham chiếu cấu trúc, không phải lệnh để AI tự deploy.

**Giải thích từng field:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `FileID` | char(36) PK | UUID tự sinh bằng `newid()` — dùng làm key trong URL |
| `FileName` | nvarchar(200) | Tên file gốc khi upload |
| `PhysicalName` | char(36) | UUID tự sinh — tên file thực tế lưu trên disk (tránh trùng tên) |
| `PhysicalSegment` | char(10) | Subfolder phân tán theo ngày từ hàm `getPhysicalSegment(date)` |
| `CreateTime` | datetime | Thời điểm tạo record, DEFAULT getdate() |
| `WriteToDisk` | datetime NULL | Khi nào binary được ghi ra disk; `NULL` = chỉ lưu DB, chưa ra file system |
| `BinaryContent` | image NULL | Nội dung binary của file — SP GET phải alias là `fileContent` |
| `ContentType` | varchar(100) | MIME type, ví dụ `application/pdf`, `image/png` |
| `Size` | int NULL | Kích thước bytes |

**SP GET file — map tới bảng:**

```sql
CREATE PROCEDURE spAPIFILE_Document
    @FileID          char(36),
    @sys_UserID      varchar(9) = null,
    @sys_SystemRight int = 0
AS BEGIN
    IF @sys_SystemRight < 1
    BEGIN RAISERROR(N'Bạn không có quyền.', 16, 1) RETURN END

    -- BinaryContent phải alias là fileContent — tAPI đọc đúng tên này
    SELECT FileName, ContentType, fileContent = BinaryContent
    FROM tblFileData WHERE FileID = @FileID
END
```

**SP UPLOAD — lưu vào bảng:**

```sql
CREATE PROCEDURE spAPIFILE_UPLOAD_Document
    @url1_RefID          varchar(50),
    @sys_UserID          varchar(9),
    @sys_SystemRight     int,
    @sys_FileContent     varbinary(max),
    @sys_FileName        nvarchar(200),
    @sys_FileContentType varchar(100),
    @sys_FileSize        int
AS BEGIN
    IF @sys_SystemRight < 2
    BEGIN RAISERROR(N'Bạn không có quyền.', 16, 1) RETURN END

    DECLARE @NewFileID char(36) = newid()  -- sinh UUID trước, dùng để SELECT lại sau

    INSERT INTO tblFileData(FileID, FileName, BinaryContent, ContentType, Size)
    VALUES(@NewFileID, @sys_FileName, @sys_FileContent, @sys_FileContentType, @sys_FileSize)

    -- Trả về record vừa insert để client cập nhật danh sách
    SELECT FileID, FileName, Size, ContentType, CreateTime
    FROM tblFileData WHERE FileID = @NewFileID
END
```

> **Lưu ý `BinaryContent [image]`**: Kiểu `image` là legacy của SQL Server nhưng vẫn hoạt động tốt với tAPI. Nếu muốn dùng kiểu mới hơn có thể dùng `varbinary(max)` — cả hai đều map được vào `fileContent` alias.
