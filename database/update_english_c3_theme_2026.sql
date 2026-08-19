/*
    Cập nhật cấu trúc điểm Theme Tiếng Anh cấp 3 - niên khóa 2026-2027.

    Phạm vi: 9 template Ngoại ngữ cấp 3 đang Enable.
    - Giữ mã ThemeX_MJ và hiển thị là Journal.
    - Tạo Project từ cấu hình PWW cũ nếu chưa có.
    - Tắt các cột hoạt động cũ HT, 1V1, SR, PWW.
    - Total = AVERAGE(EC, DEAR, MJ, Project) * 30%
      + Test * 70% + Bonus VNM + Bonus Expat; tối đa 10, làm tròn 1 số lẻ.
*/
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @TemplateIDs TABLE (TemplateBangDiemID INT PRIMARY KEY);
INSERT INTO @TemplateIDs (TemplateBangDiemID)
VALUES (725), (727), (739), (762), (774), (776), (786), (798), (799);

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
          AND t.CapID = 3
          AND t.Enable = 1
    )
)
    THROW 51010, 'Khong tim thay day du template Tieng Anh cap 3 nam hoc 2026.', 1;

IF EXISTS
(
    SELECT 1
    FROM dbo.TemplateBangDiemChiTiet ct
    JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
    WHERE ct.MaCotDiem LIKE 'Theme%_Project'
)
    THROW 51011, 'Mot template cap 3 da co cot Project; dung migration de tranh tao trung.', 1;

/* Tạo Project mới từ PWW cũ, giữ nhóm/theme và thuộc tính hiển thị. */
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
    4, ct.MaNhomCotDiem, ct.TenNhomCotDiem_VI, ct.TenNhomCotDiem_EN,
    ct.ThuTuNhom, 1, ct.IsVisibleToParents, ct.IsSendToManager,
    ct.IsNegativeNumber, 1, ct.CssClass, ct.WidthCSS, ct.HexBackground, ct.Semester,
    ct.BaoCaoThang_DinhKy, ct.QuyenNhapDiem, N'Luan_2026', GETDATE(), N'Luan_2026', GETDATE()
FROM dbo.TemplateBangDiemChiTiet ct
JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
WHERE ct.MaCotDiem LIKE 'Theme%_PWW';

/* Các cột hoạt động cũ không còn dùng trong cấu trúc mới. Giữ dữ liệu lịch sử. */
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

/* Đồng bộ tên hiển thị, thứ tự và giới hạn điểm theo mẫu mới. */
UPDATE ct
SET TenHienThi_VI = CASE
        WHEN ct.MaCotDiem LIKE 'Theme%_EC' THEN N'EC'
        WHEN ct.MaCotDiem LIKE 'Theme%_DEAR' THEN N'D.E.A.R'
        WHEN ct.MaCotDiem LIKE 'Theme%_MJ' THEN N'Journal'
        WHEN ct.MaCotDiem LIKE 'Theme%_Project' THEN N'Project'
        WHEN ct.MaCotDiem LIKE 'Theme%_TST' THEN N'Test'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_VNM' THEN N'Bonus (VNM T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_EXP' THEN N'Bonus (Expat T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_Total' THEN N'Total'
        WHEN ct.MaCotDiem LIKE 'Theme%_Comment' THEN N'Nhận xét'
    END,
    TenHienThi_EN = CASE
        WHEN ct.MaCotDiem LIKE 'Theme%_EC' THEN N'EC'
        WHEN ct.MaCotDiem LIKE 'Theme%_DEAR' THEN N'D.E.A.R'
        WHEN ct.MaCotDiem LIKE 'Theme%_MJ' THEN N'Journal'
        WHEN ct.MaCotDiem LIKE 'Theme%_Project' THEN N'Project'
        WHEN ct.MaCotDiem LIKE 'Theme%_TST' THEN N'Test'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_VNM' THEN N'Bonus (VNM T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_EXP' THEN N'Bonus (Expat T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_Total' THEN N'Total'
        WHEN ct.MaCotDiem LIKE 'Theme%_Comment' THEN N'Comment'
    END,
    ThuTuCotDiem = CASE
        WHEN ct.MaCotDiem LIKE 'Theme%_EC' THEN 1
        WHEN ct.MaCotDiem LIKE 'Theme%_DEAR' THEN 2
        WHEN ct.MaCotDiem LIKE 'Theme%_MJ' THEN 3
        WHEN ct.MaCotDiem LIKE 'Theme%_Project' THEN 4
        WHEN ct.MaCotDiem LIKE 'Theme%_TST' THEN 5
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_VNM' THEN 6
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_EXP' THEN 7
        WHEN ct.MaCotDiem LIKE 'Theme%_Total' THEN 8
        WHEN ct.MaCotDiem LIKE 'Theme%_Comment' THEN 9
    END,
    UpdateUser = N'Luan_2026',
    UpdateTime = GETDATE()
FROM dbo.TemplateBangDiemChiTiet ct
JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
WHERE ct.MaCotDiem LIKE 'Theme%_EC'
   OR ct.MaCotDiem LIKE 'Theme%_DEAR'
   OR ct.MaCotDiem LIKE 'Theme%_MJ'
   OR ct.MaCotDiem LIKE 'Theme%_Project'
   OR ct.MaCotDiem LIKE 'Theme%_TST'
   OR ct.MaCotDiem LIKE 'Theme%_BNS_VNM'
   OR ct.MaCotDiem LIKE 'Theme%_BNS_EXP'
   OR ct.MaCotDiem LIKE 'Theme%_Total'
   OR ct.MaCotDiem LIKE 'Theme%_Comment';

UPDATE ct
SET DiemMin = 0,
    DiemMax = 0.5,
    UpdateUser = N'Luan_2026',
    UpdateTime = GETDATE()
FROM dbo.TemplateBangDiemChiTiet ct
JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
WHERE ct.MaCotDiem LIKE 'Theme%_BNS_VNM'
   OR ct.MaCotDiem LIKE 'Theme%_BNS_EXP';

/* Formula Total: dùng EC, D.E.A.R, MJ (My Journal), Project. */
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
        IsUserInput = 0,
        UpdateUser = N'Luan_2026',
        UpdateTime = GETDATE()
    FROM dbo.TemplateBangDiemChiTiet ct
    JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
    WHERE ct.MaCotDiem = @ThemePrefix + N'_Total';

    SET @ThemeNo += 1;
END;

COMMIT TRANSACTION;

SELECT
    t.TemplateBangDiemID,
    t.TemplateBangDiemName,
    ct.MaCotDiem,
    ct.Enable,
    ct.TenHienThi_VI,
    ct.TenHienThi_EN,
    ct.ThuTuCotDiem,
    ct.DiemMax,
    ct.Formula
FROM dbo.TemplateBangDiem t
JOIN dbo.TemplateBangDiemChiTiet ct ON ct.TemplateBangDiemID = t.TemplateBangDiemID
WHERE t.TemplateBangDiemID IN (725, 727, 739, 762, 774, 776, 786, 798, 799)
  AND (ct.MaCotDiem LIKE 'Theme1_%' OR ct.MaCotDiem LIKE 'Theme4_%' OR ct.MaCotDiem LIKE 'Theme8_%')
ORDER BY t.TemplateBangDiemID, ct.ThuTuCotDiem, ct.MaCotDiem;
