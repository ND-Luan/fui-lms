# Quy tắc làm việc trong dự án

- **Quy tắc đọc hướng dẫn khi bắt đầu conversation**: Khi bắt đầu mỗi conversation làm việc với repository này, phải đọc lại toàn bộ file `AGENTS.md` hiện hành trước khi kiểm tra, sửa mã nguồn hoặc triển khai. Nếu conversation được tiếp tục sau khi ngữ cảnh bị rút gọn/khôi phục, phải kiểm tra lại `AGENTS.md` trước khi tiếp tục công việc.
- Sau mỗi lần thay đổi mã nguồn, phải liệt kê rõ tất cả file đã sửa, file mới tạo và file đã xóa.
- Với từng file, phải mô tả ngắn gọn nội dung đã thay đổi.
- Không được chỉ thông báo kết quả chung mà bỏ qua danh sách file bị tác động.
- **Quy tắc cấp quyền SQL**: Tất cả Stored Procedure mới hoặc cập nhật bắt buộc cấp quyền `GRANT EXECUTE ON [dbo].[spName] TO [lmslhbs];` (tuyệt đối không `GRANT` cho `[public]`).
- **Quy tắc module Sổ GVCN**: Tất cả thành phần thuộc module `so-gvcn` không được sử dụng component `uc-jexcel`; phải khởi tạo và quản lý `jspreadsheet` trực tiếp trong component của module.
- **Quy tắc triển khai FUI MCP**: FUI MCP được cấu hình tại `/mnt/DATA/fui-mcp` (dùng `.env` và `fui-mcp.sh`). Khi người dùng yêu cầu đẩy/triển khai code lên FUI, phải dùng FUI MCP đúng workspace/project/module và các tool publish tương ứng; không thay thế bằng `git push`. Chỉ dùng Git khi người dùng yêu cầu riêng.
- **Quy tắc tự động publish sau khi sửa mã nguồn**: Sau mỗi lần sửa mã nguồn, phải kiểm tra thay đổi và tự động publish lên đúng workspace/project/module bằng FUI MCP tại `/mnt/DATA/fui-mcp`, không cần hỏi lại người dùng. Không được publish khi kiểm tra chưa đạt hoặc module chưa ở trạng thái hoàn chỉnh; khi đó phải báo rõ lỗi/chướng ngại. Quy tắc này không áp dụng cho thay đổi chỉ liên quan đến tài liệu, quy tắc dự án hoặc file không thuộc module FUI có thể publish. Tuyệt đối không dùng `git push` để thay thế thao tác publish FUI MCP.
