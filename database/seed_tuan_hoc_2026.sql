USE [LMS-LHBS];
GO

/*
    Niên khóa 2026: 01/08/2026 - 31/07/2027.
    Tuần học chạy từ thứ Hai đến thứ Bảy.
    Ngày 01/08/2026 là thứ Bảy nên được tạo thành tuần đầu một ngày;
    các tuần tiếp theo chạy đủ thứ Hai - thứ Bảy.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

IF EXISTS (SELECT 1 FROM dbo.tblTuanHocTap WHERE NienKhoa = 2026)
    THROW 51010, N'Niên khóa 2026 đã có dữ liệu tuần học; dừng để tránh tạo trùng.', 1;

;WITH WeekRanges AS
(
    SELECT
        CAST('2026-08-01' AS DATE) AS NgayBatDau,
        CAST('2026-08-01' AS DATE) AS NgayKetThuc,
        1 AS TuanTrongNam

    UNION ALL

    SELECT
        NextStart.NgayBatDau,
        CASE
            WHEN DATEADD(DAY, 5, NextStart.NgayBatDau) > CAST('2027-07-31' AS DATE)
                THEN CAST('2027-07-31' AS DATE)
            ELSE DATEADD(DAY, 5, NextStart.NgayBatDau)
        END,
        wr.TuanTrongNam + 1
    FROM WeekRanges wr
    CROSS APPLY
    (
        SELECT DATEADD(DAY,
            CASE WHEN wr.NgayBatDau = CAST('2026-08-01' AS DATE) THEN 2 ELSE 7 END,
            wr.NgayBatDau) AS NgayBatDau
    ) NextStart
    WHERE NextStart.NgayBatDau <= CAST('2027-07-31' AS DATE)
), NumberedWeeks AS
(
    SELECT
        NgayBatDau,
        NgayKetThuc,
        TuanTrongNam,
        YEAR(NgayBatDau) AS Nam,
        MONTH(NgayBatDau) AS ThangHoc,
        ROW_NUMBER() OVER
        (
            PARTITION BY YEAR(NgayBatDau), MONTH(NgayBatDau)
            ORDER BY NgayBatDau
        ) AS Tuan
    FROM WeekRanges
)
INSERT INTO dbo.tblTuanHocTap
(
    NienKhoa,
    Nam,
    ThangHoc,
    Tuan,
    NgayBatDau,
    NgayKetThuc,
    TuanTrongNam,
    Is_NoiTru,
    Khoi_List_NoiTruID,
    CreateUser,
    CreateTime
)
SELECT
    2026,
    Nam,
    ThangHoc,
    Tuan,
    NgayBatDau,
    NgayKetThuc,
    TuanTrongNam,
    0,
    NULL,
    'SYSTEM',
    GETDATE()
FROM NumberedWeeks
OPTION (MAXRECURSION 100);

COMMIT TRANSACTION;
GO
