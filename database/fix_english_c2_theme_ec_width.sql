/*
    English cấp 2 - năm học 2026-2027
    Mở rộng riêng cột EC để hiển thị đầy đủ "EC (English central)".
*/

UPDATE dbo.TemplateBangDiemChiTiet
SET WidthCSS = 150
WHERE TemplateBangDiemID IN (717, 790, 734, 744)
  AND MaCotDiem LIKE 'Theme%_EC'
  AND Enable = 1;

SELECT TemplateBangDiemID, MaCotDiem, WidthCSS, Enable
FROM dbo.TemplateBangDiemChiTiet
WHERE TemplateBangDiemID IN (717, 790, 734, 744)
  AND MaCotDiem LIKE 'Theme%_EC'
ORDER BY TemplateBangDiemID, MaCotDiem;
