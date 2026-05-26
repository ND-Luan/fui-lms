USE [LMS-LHBS]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROC [dbo].[spAPI_BaoCao_ChiTieu_TA1]
    @NienKhoa INT,
    @HocKi NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CapID INT = 1;

    ;WITH SiSo AS
    (
        SELECT 
              hsl.LopID
            , COUNT(*) AS TongHocSinh
        FROM dbo.tblHocSinhLop hsl
        INNER JOIN dbo.tblLop l 
            ON l.LopID = hsl.LopID
        WHERE hsl.Enable = 1
          AND l.NienKhoa = @NienKhoa
        GROUP BY hsl.LopID
    ),
    Q AS
    (
        SELECT 
              l.CapID
            , l.KhoiID
            , l.LopID
            , l.TenLop
            , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'C' THEN 1 ELSE 0 END) AS SL_ChuaHoanThanh
            , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'H' THEN 1 ELSE 0 END) AS SL_HoanThanh
            , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'T' THEN 1 ELSE 0 END) AS SL_Tot
        FROM dbo.tblKetQuaHocTap kqht
        INNER JOIN dbo.TemplateBangDiemChiTiet ct 
            ON ct.CotDiemID = kqht.CotDiemID
           AND ct.Enable = 1
           AND ct.MaCotDiem = 'MucDoDanhGia' + @HocKi
        INNER JOIN dbo.tblMonHocLop mhl 
            ON mhl.Enable = 1
           AND mhl.NienKhoa = @NienKhoa
           AND mhl.MonHocLopID = kqht.MonHocLopID
           AND mhl.MonHocID = 5
        INNER JOIN dbo.tblLop l 
            ON l.LopID = kqht.LopID
           AND l.LopID = mhl.LopNhomID
           AND l.Enable = 1
           AND l.CapID = @CapID
        WHERE kqht.Enable = 1
          AND kqht.NienKhoa = @NienKhoa
        GROUP BY 
              l.CapID
            , l.KhoiID
            , l.LopID
            , l.TenLop
    ),
    DataCTE AS
    (
        SELECT 
              q.CapID
            , q.KhoiID
            , q.LopID
            , q.TenLop
            , ISNULL(ss.TongHocSinh, 0) AS TongHocSinh
            , q.SL_ChuaHoanThanh
            , q.SL_HoanThanh
            , q.SL_Tot

            -- chỉ tiêu theo lớp (ưu tiên), fallback theo khối
            , COALESCE(ctieuLop.ChiTieuID, ctieuKhoi.ChiTieuID) AS ChiTieuID_Lop
            , COALESCE(ctieuLop.C1_ChuaHoanThanh, ctieuKhoi.C1_ChuaHoanThanh) AS C1_ChuaHoanThanh_Lop
            , COALESCE(ctieuLop.C1_HoanThanh, ctieuKhoi.C1_HoanThanh) AS C1_HoanThanh_Lop
            , COALESCE(ctieuLop.C1_Tot, ctieuKhoi.C1_Tot) AS C1_Tot_Lop

            -- chỉ tiêu theo khối (dùng cho dòng tổng khối)
            , ctieuKhoi.ChiTieuID AS ChiTieuID_Khoi
            , ctieuKhoi.C1_ChuaHoanThanh AS C1_ChuaHoanThanh_Khoi
            , ctieuKhoi.C1_HoanThanh AS C1_HoanThanh_Khoi
            , ctieuKhoi.C1_Tot AS C1_Tot_Khoi
        FROM Q q
        LEFT JOIN SiSo ss 
            ON ss.LopID = q.LopID
        OUTER APPLY
        (
            SELECT TOP 1
                  t.ChiTieuID
                , t.C1_ChuaHoanThanh
                , t.C1_HoanThanh
                , t.C1_Tot
            FROM dbo.tblChiTieu_TA1 t
            WHERE t.Enable = 1
              AND t.CapID = q.CapID
              AND t.HocKi = @HocKi
              AND t.LopID = CAST(q.LopID AS NVARCHAR(50))
        ) ctieuLop
        OUTER APPLY
        (
            SELECT TOP 1
                  t.ChiTieuID
                , t.C1_ChuaHoanThanh
                , t.C1_HoanThanh
                , t.C1_Tot
            FROM dbo.tblChiTieu_TA1 t
            WHERE t.Enable = 1
              AND t.CapID = q.CapID
              AND t.HocKi = @HocKi
              AND (
                     t.LopID = CONCAT('__all_k', q.KhoiID, '__')
                  OR t.LopID = CAST(q.KhoiID AS NVARCHAR(50))
              )
            ORDER BY CASE WHEN t.LopID = CONCAT('__all_k', q.KhoiID, '__') THEN 0 ELSE 1 END
        ) ctieuKhoi
    )

    SELECT 
          CapID
        , KhoiID
        , CASE WHEN GROUPING(LopID) = 1 THEN KhoiID ELSE LopID END AS LopID
        , CASE 
              WHEN GROUPING(LopID) = 1 THEN N'TỔNG KHỐI ' + CAST(KhoiID AS NVARCHAR)
              ELSE TenLop
          END AS TenLop

        , SUM(TongHocSinh) AS TongHocSinh
        , SUM(SL_ChuaHoanThanh) AS SL_ChuaHoanThanh
        , SUM(SL_HoanThanh) AS SL_HoanThanh
        , SUM(SL_Tot) AS SL_Tot

        , CAST(SUM(SL_ChuaHoanThanh) * 100.0 / NULLIF(SUM(TongHocSinh), 0) AS DECIMAL(5,2)) AS TL_ChuaHoanThanh
        , CAST(SUM(SL_HoanThanh) * 100.0 / NULLIF(SUM(TongHocSinh), 0) AS DECIMAL(5,2))     AS TL_HoanThanh
        , CAST(SUM(SL_Tot) * 100.0 / NULLIF(SUM(TongHocSinh), 0) AS DECIMAL(5,2))            AS TL_Tot

        -- lớp hiển thị theo chỉ tiêu lớp (fallback khối), tổng hiển thị theo chỉ tiêu khối
        , CASE WHEN GROUPING(LopID) = 1 THEN MAX(ChiTieuID_Khoi) ELSE MAX(ChiTieuID_Lop) END AS ChiTieuID
        , CASE WHEN GROUPING(LopID) = 1 THEN MAX(C1_ChuaHoanThanh_Khoi) ELSE MAX(C1_ChuaHoanThanh_Lop) END AS C1_ChuaHoanThanh
        , CASE WHEN GROUPING(LopID) = 1 THEN MAX(C1_HoanThanh_Khoi) ELSE MAX(C1_HoanThanh_Lop) END AS C1_HoanThanh
        , CASE WHEN GROUPING(LopID) = 1 THEN MAX(C1_Tot_Khoi) ELSE MAX(C1_Tot_Lop) END AS C1_Tot

    FROM DataCTE
    GROUP BY GROUPING SETS
    (
        (CapID, KhoiID, LopID, TenLop), -- từng lớp
        (CapID, KhoiID)                 -- tổng theo khối
    )
    ORDER BY 
          KhoiID
        , GROUPING(LopID)
        , TenLop;

END
GO