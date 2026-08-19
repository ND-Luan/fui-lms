/* Đồng bộ tên hiển thị cột Theme Tiếng Anh cấp 2 theo file Excel 2026-2027. */
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @TemplateIDs TABLE (TemplateBangDiemID INT PRIMARY KEY);
INSERT INTO @TemplateIDs (TemplateBangDiemID)
VALUES (717), (790), (734), (744);

UPDATE ct
SET TenHienThi_VI = CASE
        WHEN ct.MaCotDiem LIKE 'Theme%_EC' THEN N'EC (English central)'
        WHEN ct.MaCotDiem LIKE 'Theme%_DEAR' THEN N'D.E.A.R'
        WHEN ct.MaCotDiem LIKE 'Theme%_MJ' THEN N'Journal'
        WHEN ct.MaCotDiem LIKE 'Theme%_Project' THEN N'Project'
        WHEN ct.MaCotDiem LIKE 'Theme%_TST' THEN N'Test'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_VNM' THEN N'Bonus (VNM T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_EXP' THEN N'Bonus (Expat T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_Total' THEN N'Total'
    END,
    TenHienThi_EN = CASE
        WHEN ct.MaCotDiem LIKE 'Theme%_EC' THEN N'EC (English central)'
        WHEN ct.MaCotDiem LIKE 'Theme%_DEAR' THEN N'D.E.A.R'
        WHEN ct.MaCotDiem LIKE 'Theme%_MJ' THEN N'Journal'
        WHEN ct.MaCotDiem LIKE 'Theme%_Project' THEN N'Project'
        WHEN ct.MaCotDiem LIKE 'Theme%_TST' THEN N'Test'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_VNM' THEN N'Bonus (VNM T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_BNS_EXP' THEN N'Bonus (Expat T)'
        WHEN ct.MaCotDiem LIKE 'Theme%_Total' THEN N'Total'
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
   OR ct.MaCotDiem LIKE 'Theme%_Total';

COMMIT TRANSACTION;

SELECT TemplateBangDiemID, MaCotDiem, TenHienThi_VI, TenHienThi_EN
FROM dbo.TemplateBangDiemChiTiet
WHERE TemplateBangDiemID IN (717, 790, 734, 744)
  AND MaCotDiem LIKE 'Theme1_%'
  AND Enable = 1
ORDER BY TemplateBangDiemID, ThuTuCotDiem;
