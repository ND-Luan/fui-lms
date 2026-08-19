/* Sắp xếp cột Theme Tiếng Anh cấp 2 theo file Excel 2026-2027. */
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @TemplateIDs TABLE (TemplateBangDiemID INT PRIMARY KEY);
INSERT INTO @TemplateIDs (TemplateBangDiemID)
VALUES (717), (790), (734), (744);

UPDATE ct
SET ThuTuCotDiem = CASE
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

COMMIT TRANSACTION;

SELECT TemplateBangDiemID, MaCotDiem, ThuTuCotDiem, Enable
FROM dbo.TemplateBangDiemChiTiet
WHERE TemplateBangDiemID IN (717, 790, 734, 744)
  AND MaCotDiem LIKE 'Theme1_%'
ORDER BY TemplateBangDiemID, ThuTuCotDiem, MaCotDiem;
