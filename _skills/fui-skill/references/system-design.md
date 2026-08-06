# System Design — Thiết kế app FUI nhiều module từ đầu

> File này sở hữu: **thiết kế app nhiều module từ mô tả: phân rã module, schema-first, menu, phân quyền**. Làm một module cụ thể xem [fullstack-workflow.md](fullstack-workflow.md).

Playbook cấp **hệ thống**: khi user mô tả cả một phần mềm (nhiều màn hình/chức năng) chứ không phải một module đơn lẻ. File này điều phối; mỗi module cụ thể vẫn theo [fullstack-workflow.md](fullstack-workflow.md).

> Đọc trước khi bắt tay: file này (phân rã hệ thống) → [db-table-design.md](db-table-design.md) (schema) → [tapi-reference.md](tapi-reference.md) (API) → [fullstack-workflow.md](fullstack-workflow.md) (từng module) → [project-config.md](project-config.md) (menu/quyền).

---

## Bước 0 — Làm rõ phạm vi trước khi thiết kế

Đừng code ngay. Xác nhận với user:

- **Ai dùng?** Vai trò người dùng (admin, nhân viên, khách...) → quyết định phân quyền & menu.
- **Quy trình nghiệp vụ chính là gì?** Liệt kê các luồng end-to-end (ví dụ: "tạo đơn → duyệt → xuất kho").
- **Dữ liệu cốt lõi (entity chính)?** Danh sách thực thể + quan hệ (1-n, n-n).
- **Có sẵn DB/project chưa,** hay dựng mới hoàn toàn? Nếu có sẵn → `project_list`, `module_list`, `db_schema_read` để nắm hiện trạng trước.

Nếu thiếu thông tin → **hỏi**, không tự giả định rồi dựng cả hệ thống sai hướng.

---

## Bước 1 — Phân rã hệ thống thành module

Một "phần mềm" = nhiều module FUI. Quy tắc phân rã:

| Nguyên tắc | Áp dụng |
|---|---|
| Một module = một màn hình/chức năng mạch lạc | "Quản lý sinh viên", "Báo cáo doanh thu", "Duyệt đơn" — mỗi cái một module |
| Nhóm theo entity chính | CRUD một entity thường gói trong một module (list + dialog thêm/sửa) |
| Tách theo vai trò khi luồng khác nhau | Màn hình admin vs màn hình người dùng cuối → module riêng |
| Dashboard/report tách khỏi màn nhập liệu | Trang tổng hợp (chart) riêng, không nhồi vào CRUD |

**Output:** bảng danh sách module — tên, mục đích, entity liên quan, vai trò truy cập.

Kiểm tra tính nhất quán: các module cùng project nên theo **cùng convention** (đặt tên control, vị trí toolbar/filter/action). Tham khảo module đã có bằng `module_get` trước khi tự sáng tạo kiểu khác.

---

## Bước 2 — Thiết kế database schema-first

Trước khi viết bất kỳ module.json nào, chốt schema tổng thể:

1. Vẽ danh sách bảng + PK + FK cho **toàn bộ** entity (không chỉ một bảng). Theo quy ước [db-table-design.md](db-table-design.md): `tbl` + PascalCase, PK `[Entity]ID`, cột audit `CreateUser/CreateTime/UpdateUser/UpdateTime`.
2. Xác định quan hệ n-n → bảng nối (ví dụ `tblUserRole`).
3. **`CREATE TABLE`/`ALTER TABLE` do lập trình viên tự chạy** — MCP tool chặn `ALTER TABLE`. AI trình bày DDL để user duyệt & chạy, không tự deploy cấu trúc.
4. Danh mục/bảng tra cứu (lookup) thiết kế sớm — nhiều module sẽ dùng chung cho dropdown.

**Output:** sơ đồ bảng + quan hệ, đã được user xác nhận.

---

## Bước 3 — Thiết kế API (SP) theo entity

Map mỗi entity → bộ SP tAPI chuẩn (`List/Get/Insert/Update/Delete` + `AUTH_*Options` cho dropdown). Xem [tapi-reference.md](tapi-reference.md) §1, [fullstack-workflow.md](fullstack-workflow.md) Bước 2-3.

Ở cấp hệ thống, chú ý:
- **SP dùng chung** (danh mục, lookup) → đặt tên trung tính, nhiều module gọi lại.
- Phân quyền nhất quán qua `@sys_SystemRight`/`@sys_FunctionRight` — xem [tapi-permission-patterns.md](tapi-permission-patterns.md).

---

## Bước 4 — Cấu trúc project: menu, điều hướng, component dùng chung

Đây là phần **chỉ có ở cấp hệ thống** (một module đơn lẻ không cần):

- **Menu & điều hướng:** cấu hình trong `project.json` (menuLeft/menu/menuStyle). Xem [project-config.md](project-config.md) và `examples/project-patterns.json`.
- **Component dùng chung nhiều module** → đặt project-scope (`{projectId}/components/`, gọi `component_update` với `projectId` không kèm `moduleId`) để auto-load ở mọi module. Xem [component-design.md](component-design.md).
- **Điều hướng giữa module:** `pushRouter`/`openWindow` (xem [ui-crosswindow-patterns.md](ui-crosswindow-patterns.md)); truyền ID qua URL, module con tự query.
- **Phân quyền xuyên module:** thống nhất `SystemRight`/`FunctionRight` theo vai trò đã xác định ở Bước 0.

---

## Bước 5 — Thứ tự triển khai

Dựng theo thứ tự giảm rủi ro:

1. **Schema + lookup data** trước (mọi thứ phụ thuộc vào đây) — khảo sát bằng `db_sql_execute` (TOP 20).
2. **SP cho entity cốt lõi**, kiểm chứng tĩnh bằng `db_sp_verify` (đọc thân SP + suy luận, không gọi endpoint sống).
3. **Module CRUD entity chính** — dùng làm khuôn mẫu convention cho các module sau.
4. **Module phụ thuộc** (báo cáo, dashboard) sau khi dữ liệu đã có.
5. **Menu + component dùng chung** ráp cuối để nối các module.

Mỗi module: theo trọn [fullstack-workflow.md](fullstack-workflow.md) (phân tích → UI data cứng → chốt contract → SP → wiring API → kiểm chứng tĩnh) và Design Review Gate trong SKILL.md.

---

## Checklist cấp hệ thống

- [ ] Đã liệt kê đầy đủ module + vai trò truy cập, user xác nhận phạm vi
- [ ] Schema tổng thể (bảng + PK/FK + bảng nối + lookup) đã chốt trước khi code
- [ ] Convention thống nhất giữa các module (tham khảo module đã có)
- [ ] Component dùng chung đặt project-scope, không copy lặp
- [ ] Menu/điều hướng cấu hình trong project.json
- [ ] Phân quyền nhất quán theo vai trò xuyên suốt các SP
- [ ] Thứ tự triển khai: schema → SP → module lõi → module phụ → menu
