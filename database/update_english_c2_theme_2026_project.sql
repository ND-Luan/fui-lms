/*
    Cập nhật cấu hình điểm Theme Tiếng Anh cấp 2 - năm học 2026-2027.
    Nguồn: file CÁCH TÍNH ĐIỂM MỖI THEME Ở CẤP THCS NĂM HỌC 26-27.xlsx

    Không xóa các cột cũ để giữ dữ liệu lịch sử; chỉ tắt hiển thị/nhập điểm.
*/
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @TemplateIDs TABLE (TemplateBangDiemID INT PRIMARY KEY);
INSERT INTO @TemplateIDs (TemplateBangDiemID)
VALUES (717), (790), (734), (744);

IF EXISTS
(
    SELECT 1
    FROM @TemplateIDs ids
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.TemplateBangDiem t
        WHERE t.TemplateBangDiemID = ids.TemplateBangDiemID
          AND t.NienKhoa = 2026
          AND t.CapID = 2
          AND t.Enable = 1
    )
)
    THROW 51000, 'Khong tim thay day du template Tieng Anh cap 2 nam hoc 2026.', 1;

IF EXISTS
(
    SELECT 1
    FROM dbo.TemplateBangDiemChiTiet ct
    JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
    WHERE ct.MaCotDiem LIKE 'Theme%_Project'
)
    THROW 51001, 'Cot Project da ton tai trong mot template.', 1;

/* Tạo Project mới từ cấu hình PWW hiện có, giữ nguyên nhóm/theme và quyền hiển thị. */
INSERT INTO dbo.TemplateBangDiemChiTiet
(
    TemplateBangDiemID, IDHeThong, MaCotDiem,
    TenCotDiem_VI, TenCotDiem_EN, TenHienThi_VI, TenHienThi_EN,
    MotaCotDiem_VI, MotaCotDiem_EN, LoaiCotDiem, KieuDanhGiaID,
    GiaTriCotDiem, LamTronBaoNhieuSo, HeSo, DiemMin, DiemMax, Formula,
    ThuTuCotDiem, MaNhomCotDiem, TenNhomCotDiem_VI, TenNhomCotDiem_EN,
    ThuTuNhom, IsUserInput, IsVisibleToParents, IsSendToManager,
    IsNegativeNumber, Enable, CssClass, WidthCSS, HexBackground, Semester,
    BaoCaoThang_DinhKy, QuyenNhapDiem, CreateUser, CreateTime, UpdateUser, UpdateTime
)
SELECT
    ct.TemplateBangDiemID,
    ct.IDHeThong,
    REPLACE(ct.MaCotDiem, '_PWW', '_Project'),
    N'Project', N'Project', N'Project', N'Project',
    N'Project', N'Project',
    N'Nhập', ct.KieuDanhGiaID,
    'number', ct.LamTronBaoNhieuSo, ct.HeSo, 0, 10, NULL,
    3, ct.MaNhomCotDiem, ct.TenNhomCotDiem_VI, ct.TenNhomCotDiem_EN,
    ct.ThuTuNhom, 1, ct.IsVisibleToParents, ct.IsSendToManager,
    ct.IsNegativeNumber, 1, ct.CssClass, ct.WidthCSS, ct.HexBackground, ct.Semester,
    ct.BaoCaoThang_DinhKy, ct.QuyenNhapDiem, N'Luan_2026', GETDATE(), N'Luan_2026', GETDATE()
FROM dbo.TemplateBangDiemChiTiet ct
JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
WHERE ct.MaCotDiem LIKE 'Theme%_PWW';

/* Các cột hoạt động cũ không còn nằm trong file cấp 2 mới. */
UPDATE ct
SET Enable = 0,
    UpdateUser = N'Luan_2026',
    UpdateTime = GETDATE()
FROM dbo.TemplateBangDiemChiTiet ct
JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
WHERE ct.MaCotDiem LIKE 'Theme%_HT'
   OR ct.MaCotDiem LIKE 'Theme%_1V1'
   OR ct.MaCotDiem LIKE 'Theme%_SR'
   OR ct.MaCotDiem LIKE 'Theme%_PWW';

/* Bonus theo file Excel: mỗi loại tối đa 0.5 điểm. */
UPDATE ct
SET DiemMin = 0,
    DiemMax = 0.5,
    UpdateUser = N'Luan_2026',
    UpdateTime = GETDATE()
FROM dbo.TemplateBangDiemChiTiet ct
JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
WHERE ct.MaCotDiem LIKE 'Theme%_BNS_VNM'
   OR ct.MaCotDiem LIKE 'Theme%_BNS_EXP';

/* Total = AVERAGE(EC, D.E.A.R, Journal, Project) * 30% + Test * 70% + Bonus; tối đa 10. */
DECLARE @ThemeNo INT = 1;
WHILE @ThemeNo <= 8
BEGIN
    DECLARE @ThemePrefix NVARCHAR(30) = N'Theme' + CONVERT(NVARCHAR(2), @ThemeNo);
    DECLARE @Activities NVARCHAR(MAX) =
        @ThemePrefix + N'_EC,' + @ThemePrefix + N'_DEAR,'
        + @ThemePrefix + N'_MJ,' + @ThemePrefix + N'_Project';
    DECLARE @Formula NVARCHAR(MAX) =
        N'ROUND(IF(COUNTA(' + @Activities + N')=0,'
        + @ThemePrefix + N'_TST,'
        + N'MIN((SUM(' + @Activities + N')/COUNTA(' + @Activities + N')*0.3)'
        + N'+(' + @ThemePrefix + N'_TST*0.7)+'
        + @ThemePrefix + N'_BNS_VNM+' + @ThemePrefix + N'_BNS_EXP,10)),1)';

    UPDATE ct
    SET Formula = @Formula,
        LoaiCotDiem = N'Công thức',
        GiaTriCotDiem = 'number',
        DiemMin = 0,
        DiemMax = 10,
        UpdateUser = N'Luan_2026',
        UpdateTime = GETDATE()
    FROM dbo.TemplateBangDiemChiTiet ct
    JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
    WHERE ct.MaCotDiem = @ThemePrefix + N'_Total';

    SET @ThemeNo += 1;
END;

COMMIT TRANSACTION;

SELECT
    ct.TemplateBangDiemID,
    ct.MaCotDiem,
    ct.Enable,
    ct.DiemMin,
    ct.DiemMax,
    ct.Formula
FROM dbo.TemplateBangDiemChiTiet ct
JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
WHERE ct.MaCotDiem LIKE 'Theme%_Project'
   OR ct.MaCotDiem LIKE 'Theme%_Total'
   OR ct.MaCotDiem LIKE 'Theme%_BNS_VNM'
   OR ct.MaCotDiem LIKE 'Theme%_BNS_EXP'
ORDER BY ct.TemplateBangDiemID, ct.MaCotDiem;
