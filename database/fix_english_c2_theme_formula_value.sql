/* Sửa công thức Theme cấp 2 để không lỗi khi các cột hoạt động còn trống. */
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @TemplateIDs TABLE (TemplateBangDiemID INT PRIMARY KEY);
INSERT INTO @TemplateIDs (TemplateBangDiemID)
VALUES (717), (790), (734), (744);

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
        UpdateUser = N'Luan_2026',
        UpdateTime = GETDATE()
    FROM dbo.TemplateBangDiemChiTiet ct
    JOIN @TemplateIDs ids ON ids.TemplateBangDiemID = ct.TemplateBangDiemID
    WHERE ct.MaCotDiem = @ThemePrefix + N'_Total';

    SET @ThemeNo += 1;
END;

COMMIT TRANSACTION;

SELECT TemplateBangDiemID, MaCotDiem, Formula
FROM dbo.TemplateBangDiemChiTiet
WHERE TemplateBangDiemID IN (717, 790, 734, 744)
  AND MaCotDiem LIKE 'Theme%_Total'
ORDER BY TemplateBangDiemID, MaCotDiem;
