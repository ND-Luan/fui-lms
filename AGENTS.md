# Quy tắc làm việc trong dự án

- Sau mỗi lần thay đổi mã nguồn, phải liệt kê rõ tất cả file đã sửa, file mới tạo và file đã xóa.
- Với từng file, phải mô tả ngắn gọn nội dung đã thay đổi.
- Không được chỉ thông báo kết quả chung mà bỏ qua danh sách file bị tác động.
- **Quy tắc cấp quyền SQL**: Tất cả Stored Procedure mới hoặc cập nhật bắt buộc cấp quyền `GRANT EXECUTE ON [dbo].[spName] TO [lmslhbs];` (tuyệt đối không `GRANT` cho `[public]`).
- **Quy tắc module Sổ GVCN**: Tất cả thành phần thuộc module `so-gvcn` không được sử dụng component `uc-jexcel`; phải khởi tạo và quản lý `jspreadsheet` trực tiếp trong component của module.
