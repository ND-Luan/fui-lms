# Quy tắc publish giao diện lên FUI-MCP

Áp dụng khi người dùng yêu cầu “đẩy component lên FUI”, “publish UI lên FUI” hoặc tương đương.

## Quy trình bắt buộc

1. Chạy/kiểm tra các script trong `.agents/scripts` trước khi thao tác.
2. Không xem `git push` lên GitHub là publish lên FUI. FUI phải được cập nhật qua FUI-MCP tại `/mnt/DATA/fui-mcp/fui-mcp.sh`.
3. Đọc skill FUI bằng `skill_get`, sau đó đọc reference phù hợp bằng `skill_reference_get`; tối thiểu với Vue component phải đọc `references/component-design.md`.
4. Xác định đúng scope:
   - Component dùng chung nhiều module: project-scope, đặt tại `lhbs-lms/components/` và gọi `component_update` chỉ với `projectId`.
   - Component chỉ thuộc một module: module-scope, đặt tại `lhbs-lms/modules/<moduleId>/components/` và gọi `component_update` với `projectId` + `moduleId`.
5. Nếu module chưa có trong workspace FUI-MCP, gọi `module_list` rồi `module_get` trước để lấy registry `_components.json`. Vì `module_get` có thể ghi đè workspace, phải chép lại các file local đã sửa sau bước này.
6. Với từng file `.vue`, chạy `component_preview` trước khi publish. Nếu môi trường thiếu Playwright/Chromium thì ghi rõ là preview bị bỏ qua do môi trường, không được giả vờ là đã preview thành công.
7. Publish riêng từng component bằng `component_update`. Các file module `script.js` và `style.css` phải dùng lần lượt `module_script_update` và `module_css_update`, không bỏ qua nếu chúng là một phần của thay đổi giao diện.
8. Sau publish, kiểm tra response phải có trạng thái thành công; khi cần thì dùng `component_get` hoặc đọc lại workspace FUI-MCP để đối chiếu.

## Xác thực FUI-MCP

- `FUI_API_TOKEN` phải là token thô, không chứa tiền tố `Bearer`; FUI-MCP tự thêm header `Authorization: Bearer ...`.
- Không in token, không commit `.env`, và không ghi token vào file của repo.
- Nếu nhận `401`, kiểm tra định dạng/token trước; không tự ý đổi project hoặc coi push GitHub là đã deploy FUI.

## Báo cáo sau publish

Phải liệt kê:

- Các component đã publish và scope tương ứng.
- Các `script.js`/`style.css` đã publish nếu có.
- Kết quả kiểm tra từng nhóm publish.
- Nếu preview không chạy được, nêu nguyên nhân cụ thể.

