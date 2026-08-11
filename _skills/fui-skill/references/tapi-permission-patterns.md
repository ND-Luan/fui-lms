# tAPI — Kiểm tra quyền người dùng (Permission Check Patterns)

> File này sở hữu: **5 pattern kiểm tra quyền trong thân SP (`@sys_SystemRight`, `getSystemRight`, RAISERROR)**. Khái niệm quyền xem [permission-system.md](permission-system.md).

Các pattern kiểm tra quyền trong thân Stored Procedure tAPI. Load file này khi SP cần phân quyền.

> Nền tảng SP (naming, params, response, RAISERROR): xem [tapi-reference.md](tapi-reference.md).
> Khái niệm `SystemRight`/`FunctionRight`, cấu trúc `tblSysRight`/`tblFunction`, và 4 tool quản lý định nghĩa quyền: xem [permission-system.md](permission-system.md).

---

## Tham số hệ thống liên quan đến quyền

tAPI tự inject các tham số sau — không cần client truyền lên:

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `@sys_UserID` | varchar(9) | Mã người dùng đang đăng nhập |
| `@sys_SystemRight` | int | Mức quyền của user trên module hiện tại |
| `@sys_FunctionRight` | varchar(2000) | Quyền chức năng dạng `[AD][RPT][MGR]` |

**Khai báo trong SP** — luôn đặt cuối danh sách tham số, có thể cho `= null` với `@sys_UserID`:

```sql
CREATE PROCEDURE spAPI_EntityAction
    @BusinessParam1 int,
    @BusinessParam2 nvarchar(100),
    @sys_UserID varchar(9) = null,
    @sys_SystemRight int
AS
```

## Các mức `@sys_SystemRight`

Ý nghĩa từng mức **do mỗi project tự định nghĩa** (`tblSysRight.Note`, quản lý qua `right_system_list`/`right_system_update` — xem [permission-system.md](permission-system.md)). Bảng dưới là quy ước phổ biến dùng khi viết pattern kiểm tra trong SP — không phải giá trị cố định của platform, ngoại trừ `9` luôn là Project Admin:

| Giá trị | Ý nghĩa thực tế (quy ước phổ biến) |
|---|---|
| `0` | Không có quyền / chưa được cấp quyền trên module |
| `1` | Quyền xem cơ bản |
| `2` | Quyền thao tác chuẩn (đọc, thêm, sửa thông thường) |
| `3` | Quyền nâng cao (quản lý nội bộ, thao tác nhạy cảm) |
| `9` | Module Admin / Project Admin (cố định trên toàn platform) |

## Helper function kiểm tra quyền theo module cụ thể

```sql
dbo.getSystemRight(@ModuleID, @sys_UserID)
```

Trả về mức `SysRight` mà user được assign cho một module xác định — dùng khi cần kiểm tra quyền trên module **khác** với module hiện tại.

---

## Pattern 1 — Chặn truy cập cơ bản (READ operations)

Dùng cho mọi SP đọc dữ liệu cần đăng nhập. Yêu cầu ít nhất `SysRight = 2`.

```sql
If @sys_SystemRight < 2
Begin
    Raiserror(N'[Unauthorized]Bạn không có quyền trên chức năng này.', 16, 1)
    Return
End
```

## Pattern 2 — Chặn user hoàn toàn không có quyền (minimal check)

Dùng khi muốn cho phép cả `SysRight = 1` thao tác, chỉ chặn `SysRight = 0`.

```sql
If @sys_SystemRight = 0
Begin
    Raiserror(N'[Unauthorized]Bạn không có quyền trên chức năng này.', 16, 1)
    Return
End
```

## Pattern 3 — Kiểm tra 2 tầng: global + module admin (WRITE operations)

Dùng cho các thao tác ghi có tác động đến cấu hình module hoặc dữ liệu người dùng khác. User phải đạt **một trong hai điều kiện**:
- `@sys_SystemRight >= 3` (quyền cao toàn hệ thống), **hoặc**
- Là Module Admin (`getSystemRight >= 9`) của module đó.

```sql
-- Tầng 1: phải có quyền cơ bản
If @sys_SystemRight < 2
Begin
    Raiserror(N'[Unauthorized]Bạn không có quyền trên chức năng này.', 16, 1)
    Return
End

-- Tầng 2: phải là admin hệ thống hoặc admin của module đó
If @sys_SystemRight < 3 and dbo.getSystemRight(@ModuleID, @sys_UserID) < 9
Begin
    Raiserror(N'[Unauthorized]Bạn không có quyền trên Module này.', 16, 1)
    Return
End
```

## Pattern 4 — Kiểm tra logic nghiệp vụ trước khi thực thi

Dùng khi thao tác hợp lệ về quyền nhưng vi phạm ràng buộc dữ liệu (ví dụ: xóa cha khi còn con).

```sql
-- Kiểm tra ràng buộc trước khi xóa
If exists(Select * from tblChild WHERE ParentID = @ParentID)
Begin
    Raiserror(N'Phải xóa dữ liệu liên quan trước khi thực hiện thao tác này.', 16, 1)
    Return
End

DELETE tblParent WHERE ParentID = @ParentID
```

## Pattern 5 — Kiểm tra `@sys_FunctionRight`

Dùng khi phân quyền theo chức năng cụ thể (không chỉ theo mức số).

```sql
If CHARINDEX('[ADMIN]', @sys_FunctionRight) = 0
Begin
    Raiserror(N'[Unauthorized]Bạn không có quyền thực hiện chức năng này.', 16, 1)
    Return
End
```

---

## Quy tắc đặt thứ tự kiểm tra

```
1. Kiểm tra quyền hệ thống (@sys_SystemRight)    ← luôn đầu tiên
2. Kiểm tra quyền module (getSystemRight)         ← nếu cần 2 tầng
3. Kiểm tra quyền chức năng (@sys_FunctionRight)  ← nếu dùng FunctionRight
4. Kiểm tra ràng buộc nghiệp vụ                   ← sau cùng, trước khi ghi
```

## Quy ước thông báo lỗi

| Tình huống | Message chuẩn |
|---|---|
| Thiếu quyền global | `N'[Unauthorized]Bạn không có quyền trên chức năng này.'` |
| Thiếu quyền module | `N'[Unauthorized]Bạn không có quyền trên Module này.'` |
| Thiếu quyền chức năng (`FunctionRight`) | `N'[Unauthorized]Bạn không có quyền thực hiện chức năng này.'` |
| Vi phạm ràng buộc | Mô tả cụ thể, **không** có prefix: `N'Phải xóa X trước khi xóa Y.'` |
| Dữ liệu không hợp lệ | `N'Dữ liệu không hợp lệ.'` hoặc mô tả cụ thể, **không** có prefix |

**Format `RAISERROR` bắt buộc:**
```sql
RAISERROR(N'Thông báo lỗi tiếng Việt.', 16, 1)
RETURN
```
- **Severity luôn là `16`** — áp dụng cho mọi loại lỗi (validation, unauthorized, business logic)
- Prefix `N` bắt buộc cho Unicode tiếng Việt
- `RETURN` bắt buộc ngay sau `RAISERROR` — thiếu `RETURN` SP tiếp tục chạy dù đã báo lỗi
- Client nhận `{ "Message": "..." }` với nội dung thông báo
- **Mọi lỗi thiếu quyền ở 5 pattern trên phải mở message bằng `[Unauthorized]`** (vd `N'[Unauthorized]Bạn không có quyền...'`) — tAPI dựa vào tiền tố này để trả HTTP status `401` thay vì mặc định, và tự cắt `[Unauthorized]` khỏi `Message` trước khi trả về client. Lỗi ràng buộc/nghiệp vụ (Pattern 4) **không** dùng prefix này — chi tiết cơ chế + cách client xử lý status 401 xem [tapi-reference.md](tapi-reference.md) §5.
