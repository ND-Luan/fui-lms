USE [LMS-LHBS]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- spAPI_ThongKe_KQRL_Get_All_Khoi_C1 'GK_HK2', 2025
ALTER PROC [dbo].[spAPI_ThongKe_KQRL_Get_All_Khoi_C1]
    @HocKi    VARCHAR(10)
  , @NienKhoa INT
AS
BEGIN

    -- =====================================================================
    -- RS1: Khối 1 -> 5 => Phẩm Chất
    -- =====================================================================
    ;WITH PhamChat_Dedup AS
    (
        SELECT kqht.HocSinhID
             , mh.MonHocID
             , mh.TenMonHoc_HienThi
             , kqht.KetQuaDanhGia_VI
             , ROW_NUMBER() OVER (
                   PARTITION BY kqht.HocSinhID, mh.MonHocID
                   ORDER BY tbdct.CotDiemID DESC
               ) AS rn
        FROM dbo.tblKetQuaHocTap               kqht
        INNER JOIN dbo.TemplateBangDiemChiTiet  tbdct ON tbdct.CotDiemID  = kqht.CotDiemID
                                                     AND tbdct.Enable     = 1
                                                     AND tbdct.MaCotDiem LIKE '%MucDoDanhGia' + @HocKi
        INNER JOIN dbo.tblMonHocLop             mhl   ON mhl.MonHocLopID  = kqht.MonHocLopID
                                                     AND mhl.Enable       = 1
                                                     AND mhl.NienKhoa     = @NienKhoa
        INNER JOIN dbo.tblMonHoc                mh    ON mh.MonHocID      = mhl.MonHocID
                                                     AND mh.Enable        = 1
        INNER JOIN dbo.tblLop                   l     ON l.LopID          = mhl.LopNhomID
                                                     AND l.Enable         = 1
                                                     AND l.CapID          = 1
                                                     AND l.KhoiID IN (1, 2, 3, 4, 5)
                                                     AND l.NienKhoa       = @NienKhoa
        INNER JOIN dbo.tblHocSinh               hs    ON hs.HocSinhID     = kqht.HocSinhID
                                                     AND hs.TinhTrang     = 0
        WHERE kqht.Enable             = 1
          AND mh.MonHocID IN (23, 24, 25, 26, 27)
          AND kqht.KetQuaDanhGia_VI IS NOT NULL
          AND kqht.NienKhoa           = @NienKhoa
    )
    SELECT REPLACE(TenMonHoc_HienThi, N'Phẩm chất-', '')                                                                         AS TenMonHoc_HienThi
         , COUNT(HocSinhID)                                                                                                       AS TongSoHS
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'T' THEN 1 ELSE 0 END)                                                              AS Tot
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'T' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(HocSinhID), 0) AS DECIMAL(5, 2))                                                                   AS TiLe_Tot
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'Đ' THEN 1 ELSE 0 END)                                                              AS Dat
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'Đ' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(HocSinhID), 0) AS DECIMAL(5, 2))                                                                   AS TiLe_Dat
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'C' THEN 1 ELSE 0 END)                                                              AS C
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'C' THEN 1 ELSE 0 END)
                / NULLIF(COUNT(HocSinhID), 0) AS DECIMAL(5, 2))                                                                   AS TiLe_C
         , STUFF((
                     SELECT DISTINCT '-K' + CAST(l2.KhoiID AS VARCHAR)
                     FROM dbo.tblMonHocLop               mhl2
                          INNER JOIN dbo.tblLop          l2    ON l2.LopID           = mhl2.LopNhomID
                                                              AND l2.NienKhoa        = @NienKhoa
                          INNER JOIN dbo.tblKetQuaHocTap kqht2 ON kqht2.MonHocLopID = mhl2.MonHocLopID
                                                              AND kqht2.NienKhoa     = @NienKhoa
                                                              AND kqht2.Enable       = 1
                     WHERE mhl2.MonHocID          = PhamChat_Dedup.MonHocID
                       AND mhl2.Enable            = 1
                       AND l2.Enable              = 1
                       AND l2.CapID               = 1
                       AND kqht2.KetQuaDanhGia_VI IS NOT NULL
                       AND mhl2.NienKhoa          = @NienKhoa
                     FOR XML PATH(''), TYPE
                 ).value('.', 'NVARCHAR(MAX)'), 1, 1, ''
                )                                                                                                                  AS KhoiDay
    FROM PhamChat_Dedup
    WHERE rn = 1
    GROUP BY TenMonHoc_HienThi, MonHocID;


    -- =====================================================================
    -- RS2: Khối 1 -> 5 => Năng Lực
    -- =====================================================================
    ;WITH NangLuc_Dedup AS
    (
        SELECT kqht.HocSinhID
             , mh.MonHocID
             , mh.TenMonHoc_HienThi
             , kqht.KetQuaDanhGia_VI
             , ROW_NUMBER() OVER (
                   PARTITION BY kqht.HocSinhID, mh.MonHocID
                   ORDER BY tbdct.CotDiemID DESC
               ) AS rn
        FROM dbo.tblKetQuaHocTap               kqht
        INNER JOIN dbo.TemplateBangDiemChiTiet  tbdct ON tbdct.CotDiemID  = kqht.CotDiemID
                                                     AND tbdct.Enable     = 1
                                                     AND tbdct.MaCotDiem LIKE N'%MucDoDanhGia' + @HocKi
        INNER JOIN dbo.tblMonHocLop             mhl   ON mhl.MonHocLopID  = kqht.MonHocLopID
                                                     AND mhl.Enable       = 1
                                                     AND mhl.NienKhoa     = @NienKhoa
        INNER JOIN dbo.tblMonHoc                mh    ON mh.MonHocID      = mhl.MonHocID
                                                     AND mh.Enable        = 1
        INNER JOIN dbo.tblLop                   l     ON l.LopID          = mhl.LopNhomID
                                                     AND l.Enable         = 1
                                                     AND l.CapID          = 1
                                                     AND l.KhoiID IN (1, 2, 3, 4, 5)
                                                     AND l.NienKhoa       = @NienKhoa
        INNER JOIN dbo.tblHocSinh               hs    ON hs.HocSinhID     = kqht.HocSinhID
                                                     AND hs.TinhTrang     = 0
        WHERE kqht.Enable             = 1
          AND mh.MonHocID IN (20, 21, 22, 28, 29, 30, 31, 32, 33, 34)
          AND kqht.KetQuaDanhGia_VI IS NOT NULL
          AND kqht.NienKhoa           = @NienKhoa
    )
    SELECT REPLACE(TenMonHoc_HienThi, N'Năng lực-', '')                                                                                          AS TenMonHoc_HienThi
         , COUNT(HocSinhID)                                                                                                                       AS TongSoHS
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'T' THEN 1 ELSE 0 END)                                                                              AS Tot
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'T' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN KetQuaDanhGia_VI IN (N'T', N'Đ', N'C') THEN 1 ELSE 0 END), 0) AS DECIMAL(5, 2))                           AS TiLe_Tot
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'Đ' THEN 1 ELSE 0 END)                                                                              AS Dat
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'Đ' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN KetQuaDanhGia_VI IN (N'T', N'Đ', N'C') THEN 1 ELSE 0 END), 0) AS DECIMAL(5, 2))                           AS TiLe_Dat
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'C' THEN 1 ELSE 0 END)                                                                              AS C
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'C' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN KetQuaDanhGia_VI IN (N'T', N'Đ', N'C') THEN 1 ELSE 0 END), 0) AS DECIMAL(5, 2))                           AS TiLe_C
         , STUFF((
                     SELECT DISTINCT '-K' + CAST(l2.KhoiID AS VARCHAR)
                     FROM dbo.tblMonHocLop               mhl2
                          INNER JOIN dbo.tblLop          l2    ON l2.LopID           = mhl2.LopNhomID
                                                              AND l2.NienKhoa        = @NienKhoa
                          INNER JOIN dbo.tblKetQuaHocTap kqht2 ON kqht2.MonHocLopID = mhl2.MonHocLopID
                                                              AND kqht2.NienKhoa     = @NienKhoa
                                                              AND kqht2.Enable       = 1
                     WHERE mhl2.MonHocID          = NangLuc_Dedup.MonHocID
                       AND mhl2.Enable            = 1
                       AND l2.Enable              = 1
                       AND l2.CapID               = 1
                       AND kqht2.KetQuaDanhGia_VI IS NOT NULL
                       AND mhl2.NienKhoa          = @NienKhoa
                     FOR XML PATH(''), TYPE
                 ).value('.', 'NVARCHAR(MAX)'), 1, 1, ''
                )                                                                                                                                  AS KhoiDay
    FROM NangLuc_Dedup
    WHERE rn = 1
    GROUP BY TenMonHoc_HienThi, MonHocID;


    -- =====================================================================
    -- RS3: Khối 1 -> 5 => Các môn học (ngoại trừ PC - NL)
    -- =====================================================================
    ;WITH MonHoc_Dedup AS
    (
        SELECT kqht.HocSinhID
             , mh.MonHocID
             , mh.TenMonHoc_HienThi
             , kqht.KetQuaDanhGia_VI
             , ROW_NUMBER() OVER (
                   PARTITION BY kqht.HocSinhID, mh.MonHocID
                   ORDER BY tbdct.CotDiemID DESC
               ) AS rn
        FROM dbo.tblKetQuaHocTap               kqht
        INNER JOIN dbo.TemplateBangDiemChiTiet  tbdct ON tbdct.CotDiemID  = kqht.CotDiemID
                                                     AND tbdct.Enable     = 1
                                                     AND tbdct.MaCotDiem LIKE '%MucDoDanhGia' + @HocKi
        INNER JOIN dbo.tblMonHocLop             mhl   ON mhl.MonHocLopID  = kqht.MonHocLopID
                                                     AND mhl.Enable       = 1
                                                     AND mhl.NienKhoa     = @NienKhoa
        INNER JOIN dbo.tblMonHoc                mh    ON mh.MonHocID      = mhl.MonHocID
                                                     AND mh.Enable        = 1
        INNER JOIN dbo.tblLop                   l     ON l.LopID          = mhl.LopNhomID
                                                     AND l.Enable         = 1
                                                     AND l.CapID          = 1
                                                     AND l.KhoiID IN (1, 2, 3, 4, 5)
                                                     AND l.NienKhoa       = @NienKhoa
        INNER JOIN dbo.tblHocSinh               hs    ON hs.HocSinhID     = kqht.HocSinhID
                                                     AND hs.TinhTrang     = 0
        WHERE kqht.Enable  = 1
          AND mh.MonHocID NOT IN (23, 24, 25, 26, 27, 20, 21, 22, 28, 29, 30, 31, 32, 33, 34, 13, 14, 41, 42, 43)
          AND kqht.NienKhoa = @NienKhoa
    )
    SELECT TenMonHoc_HienThi
         , COUNT(HocSinhID)                                                                                                                       AS TongSoHS
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'T' THEN 1 ELSE NULL END)                                                                           AS Tot
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'T' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN KetQuaDanhGia_VI IN (N'T', N'H', N'C') THEN 1 ELSE 0 END), 0) AS DECIMAL(5, 2))                           AS TiLe_Tot
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'H' THEN 1 ELSE NULL END)                                                                           AS HH
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'H' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN KetQuaDanhGia_VI IN (N'T', N'H', N'C') THEN 1 ELSE 0 END), 0) AS DECIMAL(5, 2))                           AS TiLe_HH
         , SUM(CASE WHEN KetQuaDanhGia_VI = N'C' THEN 1 ELSE NULL END)                                                                           AS C
         , CAST(100.0 * SUM(CASE WHEN KetQuaDanhGia_VI = N'C' THEN 1 ELSE 0 END)
                / NULLIF(SUM(CASE WHEN KetQuaDanhGia_VI IN (N'T', N'H', N'C') THEN 1 ELSE 0 END), 0) AS DECIMAL(5, 2))                           AS TiLe_C
         , SUM(CASE WHEN KetQuaDanhGia_VI NOT IN (N'T', N'H', N'C')
                      OR KetQuaDanhGia_VI IS NULL THEN 1 ELSE 0 END)                                                                              AS SoKhongHopLe
         , STUFF((
                     SELECT DISTINCT '-K' + CAST(l2.KhoiID AS VARCHAR)
                     FROM dbo.tblMonHocLop               mhl2
                          INNER JOIN dbo.tblLop          l2    ON l2.LopID           = mhl2.LopNhomID
                                                              AND l2.NienKhoa        = @NienKhoa
                          INNER JOIN dbo.tblKetQuaHocTap kqht2 ON kqht2.MonHocLopID = mhl2.MonHocLopID
                                                              AND kqht2.NienKhoa     = @NienKhoa
                                                              AND kqht2.Enable       = 1
                     WHERE mhl2.MonHocID          = MonHoc_Dedup.MonHocID
                       AND mhl2.Enable            = 1
                       AND l2.Enable              = 1
                       AND l2.CapID               = 1
                       AND kqht2.KetQuaDanhGia_VI IS NOT NULL
                       AND mhl2.NienKhoa          = @NienKhoa
                     FOR XML PATH(''), TYPE
                 ).value('.', 'NVARCHAR(MAX)'), 1, 1, ''
                )                                                                                                                                  AS KhoiDay
    FROM MonHoc_Dedup
    WHERE rn = 1
    GROUP BY TenMonHoc_HienThi, MonHocID;


    -- =====================================================================
    -- RS4: Danh hiệu khối 1 -> 5
    -- =====================================================================
    ;WITH TongSoHS AS
    (
        SELECT COUNT(HSLopID) AS Tong
        FROM dbo.tblKhenThuong
        WHERE KhoiID IN (1, 2, 3, 4, 5)
          AND NienKhoa = @NienKhoa
    )
    SELECT DanhHieu
         , COUNT(HSLopID)                                                  AS SoHocSinh
         , CAST(COUNT(HSLopID) * 100.0 / TongSoHS.Tong AS DECIMAL(5, 2))  AS TiLe
    FROM dbo.tblKhenThuong, TongSoHS
    WHERE KhoiID IN (1, 2, 3, 4, 5)
      AND DanhHieu <> ''
      AND NienKhoa  = @NienKhoa
    GROUP BY DanhHieu, TongSoHS.Tong
    UNION
    SELECT N'Thư Khen'
         , COUNT(HSLopID)
         , CAST(COUNT(HSLopID) * 100.0 / TongSoHS.Tong AS DECIMAL(5, 2))
    FROM dbo.tblKhenThuong, TongSoHS
    WHERE ISNULL(NoiDungThuKhen, '') <> ''
      AND KhoiID IN (1, 2, 3, 4, 5)
      AND NienKhoa  = @NienKhoa
    GROUP BY TongSoHS.Tong;


    -- =====================================================================
    -- RS5: Khen thưởng theo Khối 1 -> 5 [Chị Yến]
    -- Cột: SoHocSinh | HocSinhXuatSac | TiLe | HocSinhTieuBieu | TiLe
    -- =====================================================================
    ;WITH SoHSTheoKhoi AS
    (
        SELECT l.KhoiID
             , COUNT(*) AS TongHS
        FROM dbo.tblHocSinhLop  hsl
        INNER JOIN dbo.tblHocSinh hs ON hs.HocSinhID = hsl.HocSinhID
                                    AND hs.TinhTrang  = 0
        INNER JOIN dbo.tblLop     l  ON l.LopID       = hsl.LopID
                                    AND l.Enable       = 1
                                    AND l.NienKhoa     = @NienKhoa  -- ✅ dùng tham số
                                    AND l.KhoiID IN (1, 2, 3, 4, 5)
        WHERE hsl.Enable = 1
        GROUP BY l.KhoiID
    ),
    KetQua AS
    (
        SELECT kt.KhoiID
             , s.TongHS                                                                     AS TongSoLuongHS
             , SUM(CASE WHEN kt.DanhHieu = N'Học sinh Xuất sắc' THEN 1 ELSE 0 END)         AS HocSinhXuatSac
             , SUM(CASE WHEN kt.HocSinhTieuBieu = 1             THEN 1 ELSE 0 END)         AS HocSinhTieuBieu
        FROM dbo.tblKhenThuong  kt
        INNER JOIN SoHSTheoKhoi s ON s.KhoiID = kt.KhoiID
        WHERE kt.Enable   = 1
          AND kt.NienKhoa = @NienKhoa  -- ✅ dùng tham số
          AND kt.KhoiID IN (1, 2, 3, 4, 5)
        GROUP BY kt.KhoiID, s.TongHS
    )
    SELECT CAST(KhoiID AS VARCHAR(5))                                                       AS Khoi
         , TongSoLuongHS                                                                    AS SoHocSinh
         , HocSinhXuatSac
         , CAST(100.0 * HocSinhXuatSac  / NULLIF(TongSoLuongHS, 0) AS DECIMAL(5, 2))       AS TiLe_XuatSac
         , HocSinhTieuBieu
         , CAST(100.0 * HocSinhTieuBieu / NULLIF(TongSoLuongHS, 0) AS DECIMAL(5, 2))       AS TiLe_TieuBieu
    FROM KetQua

    UNION ALL

    SELECT 'TC'
         , SUM(TongSoLuongHS)
         , SUM(HocSinhXuatSac)
         , CAST(100.0 * SUM(HocSinhXuatSac)  / NULLIF(SUM(TongSoLuongHS), 0) AS DECIMAL(5, 2))
         , SUM(HocSinhTieuBieu)
         , CAST(100.0 * SUM(HocSinhTieuBieu) / NULLIF(SUM(TongSoLuongHS), 0) AS DECIMAL(5, 2))
    FROM KetQua

    ORDER BY Khoi;

END;