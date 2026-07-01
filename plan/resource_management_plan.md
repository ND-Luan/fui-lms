# Kế hoạch Triển khai Tính năng Quản lý Tài nguyên (fui-lms)

Tài liệu này trình bày kế hoạch chi tiết để tái sử dụng hai bảng `tblHocLieu_FP` và `tblNoiDungHocLieu_FP` (hiện đang dùng cho Học liệu) nhằm phát triển tính năng **Quản lý tài nguyên** giảng dạy độc lập, đảm bảo hiệu năng và không ảnh hưởng đến nghiệp vụ học liệu cũ.

---

## 1. Cơ sở dữ liệu (Database Design)

> [!IMPORTANT]
> Toàn bộ mã SQL cập nhật database và procedures đã được tạo sẵn tại file: [alter_tables_and_procedures.sql](file:///run/media/luan/DATA/_win/fui-lms/plan/alter_tables_and_procedures.sql)

Các bước thay đổi bao gồm:
1. **Bổ sung cột phân loại (`Loai`)**: Thêm cột `Loai` với giá trị mặc định là `'HOC_LIEU'` vào bảng `dbo.tblHocLieu_FP`.
2. **Cập nhật Stored Procedures**:
   * Cập nhật `spAPI_FP_HocLieu_GetAll` nhận `@Loai VARCHAR(50) = 'HOC_LIEU'`.
   * Cập nhật `spAPI_FP_HocLieu_Save` nhận `@Loai VARCHAR(50) = 'HOC_LIEU'`.

---

## 2. Giao diện người dùng (Frontend Vue Module)

### 2.1. Cấu trúc thư mục mới
Tạo một module mới có tên là `gv-quan-ly-tai-nguyen`:
```
lhbs-lms/modules/gv-quan-ly-tai-nguyen/
├── raw.json                 # Cấu hình tối giản
├── script.js                # Để trống (đúng quy định của dự án)
└── components/
    └── uc-main-layout.vue   # Chứa toàn bộ giao diện & logic
```

### 2.2. Chi tiết Module Vue

#### `raw.json`
```json
{
  "data": [
    {"EXE": "IsCheck_NotRoleParent(vueData.user)"}
  ],
  "watch": {},
  "controls": [
    {
      "prop": "fluid pa-0",
      "rows": [
        {
          "prop": ":no-gutters='true'",
          "cols": [
            {"el": "uc-main-layout"}
          ]
        }
      ]
    }
  ],
  "set": {}
}
```

#### `components/uc-main-layout.vue`
Giao diện quản lý tài nguyên kế thừa từ module học liệu, nhưng sẽ được tùy biến:
1. **API Call**: Truyền tham số `Loai: 'TAI_NGUYEN'` cho các hàm `lms/FP_HocLieu_GetAll` và `lms/FP_HocLieu_Save`.
2. **Done/Mutations**: Tận dụng `confirmRef` để hiển thị xác nhận trước khi lưu/xóa.
3. **Soạn thảo tài nguyên**: Điều hướng sang trang soạn thảo tài nguyên/file đính kèm tương ứng.

---

## 3. Lợi ích của phương án
* **Không làm ảnh hưởng đến dữ liệu cũ**: Cột `Loai` có giá trị mặc định là `'HOC_LIEU'`, giúp module học liệu hiện tại hoạt động bình thường mà không cần sửa code.
* **Thời gian phát triển cực nhanh**: Tận dụng 90% logic có sẵn của hệ thống Upload File, TreeView chi tiết từ bảng con `tblNoiDungHocLieu_FP`.
* **Dễ bảo trì**: Thay đổi logic lưu file/học liệu sẽ tự động cập nhật cho cả hai module.
