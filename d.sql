ALTER PROC [dbo].[spAPI_BaoCao_DanhGia_Cac_HoatDong_GDTC]
    @Semester   VARCHAR(50),
    @CapID      INT,
    @NienKhoa   INT
AS
BEGIN

    -- ============================================================
    -- Xác định MonHocID theo cấp
    -- ============================================================
    DECLARE @MonHocID_JA   INT = 0,
            @MonHocID_AI   INT = 0,
            @MonHocID_Stem INT = 0

    SELECT 
        @MonHocID_JA   = CASE @CapID WHEN 1 THEN 37  WHEN 2 THEN 58  WHEN 3 THEN 105 ELSE 0 END,
        @MonHocID_AI   = CASE @CapID WHEN 1 THEN 38  WHEN 2 THEN 44  WHEN 3 THEN 0   ELSE 0 END,
        @MonHocID_Stem = CASE @CapID WHEN 1 THEN 36  WHEN 2 THEN 69  WHEN 3 THEN 99  ELSE 0 END

    -- ============================================================
    -- Macro tái sử dụng: aggregate từ CTE đã có cột Diem
    -- Thang ĐIỂM: Tốt>=8 / Khá>=6.5 / Đạt>=5 / Chưa đạt<5
    -- Thang SAO : Tốt>=4 / Khá>=3   / Đạt>=2 / Chưa đạt<2
    -- ============================================================

    -- ============================================================
    -- 1. JA — tất cả cấp dùng ĐIỂM
    -- ============================================================
    ;WITH CTE AS (
        SELECT
            mh.CapID, l.KhoiID, l.LopID, l.TenLop,
            mh.TenMonHoc_HienThi                    AS TenMonHoc,
            kqht.HocSinhID,
            kqht.KetQuaDanhGia_VI,
            TRY_CAST(kqht.KetQuaDanhGia_VI AS FLOAT) AS Diem
        FROM dbo.tblKetQuaHocTap            kqht
        INNER JOIN dbo.TemplateBangDiemChiTiet ct
            ON  ct.CotDiemID = kqht.CotDiemID
            AND ct.Enable    = 1
            AND ct.MaCotDiem = 'DiemTB_' + @Semester
        INNER JOIN dbo.tblMonHocLop         mhl
            ON  mhl.MonHocLopID = kqht.MonHocLopID
            AND mhl.MonHocID    = @MonHocID_JA
        INNER JOIN dbo.tblMonHoc            mh
            ON  mh.MonHocID = mhl.MonHocID AND mh.Enable = 1
        INNER JOIN dbo.tblLop               l
            ON  l.LopID     = kqht.LopID
            AND l.LopID     = mhl.LopNhomID
            AND l.NienKhoa  = @NienKhoa
        INNER JOIN dbo.tblHocSinh           hs
            ON  hs.HocSinhID = kqht.HocSinhID AND hs.TinhTrang = 0
        WHERE kqht.NienKhoa = @NienKhoa AND kqht.Enable = 1
    )
    SELECT
        CapID, KhoiID, LopID, TenLop, TenMonHoc,
        COUNT(DISTINCT CASE WHEN KetQuaDanhGia_VI <> '' AND KetQuaDanhGia_VI IS NOT NULL
                            THEN HocSinhID END)                                  AS TongSoHocSinh,

        SUM(CASE WHEN Diem >= 8                  THEN 1 ELSE 0 END)              AS XepLoaiTot,
        ROUND(100.0 * SUM(CASE WHEN Diem >= 8                  THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN KetQuaDanhGia_VI <> '' AND KetQuaDanhGia_VI IS NOT NULL THEN HocSinhID END), 0), 2) AS TiLeTot,

        SUM(CASE WHEN Diem >= 6.5 AND Diem < 8  THEN 1 ELSE 0 END)              AS XepLoaiKha,
        ROUND(100.0 * SUM(CASE WHEN Diem >= 6.5 AND Diem < 8  THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN KetQuaDanhGia_VI <> '' AND KetQuaDanhGia_VI IS NOT NULL THEN HocSinhID END), 0), 2) AS TiLeKha,

        SUM(CASE WHEN Diem >= 5   AND Diem < 6.5 THEN 1 ELSE 0 END)             AS XepLoaiDat,
        ROUND(100.0 * SUM(CASE WHEN Diem >= 5   AND Diem < 6.5 THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN KetQuaDanhGia_VI <> '' AND KetQuaDanhGia_VI IS NOT NULL THEN HocSinhID END), 0), 2) AS TiLeDat,

        SUM(CASE WHEN Diem < 5 AND Diem IS NOT NULL THEN 1 ELSE 0 END)          AS XepLoaiChuaDat,
        ROUND(100.0 * SUM(CASE WHEN Diem < 5 AND Diem IS NOT NULL THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN KetQuaDanhGia_VI <> '' AND KetQuaDanhGia_VI IS NOT NULL THEN HocSinhID END), 0), 2) AS TiLeChuaDat,

        SUM(CASE WHEN Diem IS NULL               THEN 1 ELSE 0 END)             AS ChuaXacDinh,
        ROUND(100.0 * SUM(CASE WHEN Diem IS NULL               THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN KetQuaDanhGia_VI <> '' AND KetQuaDanhGia_VI IS NOT NULL THEN HocSinhID END), 0), 2) AS TiLeChuaXacDinh

    FROM CTE
    GROUP BY CapID, KhoiID, LopID, TenLop, TenMonHoc
    ORDER BY KhoiID, TenLop


    -- ============================================================
    -- 2 & 3. AI + STEM — phân nhánh theo cấp (SAO hoặc ĐIỂM)
    -- ============================================================

    -- Dùng 1 CTE chung cho cả AI lẫn STEM, JOIN cả 2 MonHocID cùng lúc
    ;WITH CTE AS (
        SELECT
            mh.CapID, l.KhoiID, l.LopID, l.TenLop,
            mh.TenMonHoc_HienThi                     AS TenMonHoc,
            mhl.MonHocID,
            kqht.HocSinhID,
            kqht.KetQuaDanhGia_VI,
            TRY_CAST(kqht.KetQuaDanhGia_VI AS FLOAT)  AS Diem
        FROM dbo.tblKetQuaHocTap            kqht
        INNER JOIN dbo.TemplateBangDiemChiTiet ct
            ON  ct.CotDiemID = kqht.CotDiemID
            AND ct.Enable    = 1
            AND ct.MaCotDiem = CASE WHEN @CapID = 1 THEN 'SaoCK_' ELSE 'DiemTB_' END + @Semester
        INNER JOIN dbo.tblMonHocLop         mhl
            ON  mhl.MonHocLopID = kqht.MonHocLopID
            AND mhl.MonHocID    IN (@MonHocID_AI, @MonHocID_Stem)   -- lấy cả 2
        INNER JOIN dbo.tblMonHoc            mh
            ON  mh.MonHocID = mhl.MonHocID AND mh.Enable = 1
        INNER JOIN dbo.tblLop               l
            ON  l.LopID     = kqht.LopID
            AND l.LopID     = mhl.LopNhomID
            AND l.NienKhoa  = @NienKhoa
        INNER JOIN dbo.tblHocSinh           hs
            ON  hs.HocSinhID = kqht.HocSinhID AND hs.TinhTrang = 0
        WHERE kqht.NienKhoa = @NienKhoa AND kqht.Enable = 1
    ),
    -- Ngưỡng xếp loại tuỳ theo cấp
    Nguong AS (
        SELECT 
            CASE WHEN @CapID = 1 THEN 4   ELSE 8   END AS NguongTot,
            CASE WHEN @CapID = 1 THEN 3   ELSE 6.5 END AS NguongKha,
            CASE WHEN @CapID = 1 THEN 2   ELSE 5   END AS NguongDat
    )
    SELECT
        c.CapID, c.KhoiID, c.LopID, c.TenLop, c.TenMonHoc,
        COUNT(DISTINCT CASE WHEN c.KetQuaDanhGia_VI <> '' AND c.KetQuaDanhGia_VI IS NOT NULL
                            THEN c.HocSinhID END)                                AS TongSoHocSinh,

        SUM(CASE WHEN c.Diem >= n.NguongTot                        THEN 1 ELSE 0 END) AS XepLoaiTot,
        ROUND(100.0 * SUM(CASE WHEN c.Diem >= n.NguongTot          THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN c.KetQuaDanhGia_VI <> '' AND c.KetQuaDanhGia_VI IS NOT NULL THEN c.HocSinhID END), 0), 2) AS TiLeTot,

        SUM(CASE WHEN c.Diem >= n.NguongKha AND c.Diem < n.NguongTot THEN 1 ELSE 0 END) AS XepLoaiKha,
        ROUND(100.0 * SUM(CASE WHEN c.Diem >= n.NguongKha AND c.Diem < n.NguongTot THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN c.KetQuaDanhGia_VI <> '' AND c.KetQuaDanhGia_VI IS NOT NULL THEN c.HocSinhID END), 0), 2) AS TiLeKha,

        SUM(CASE WHEN c.Diem >= n.NguongDat AND c.Diem < n.NguongKha THEN 1 ELSE 0 END) AS XepLoaiDat,
        ROUND(100.0 * SUM(CASE WHEN c.Diem >= n.NguongDat AND c.Diem < n.NguongKha THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN c.KetQuaDanhGia_VI <> '' AND c.KetQuaDanhGia_VI IS NOT NULL THEN c.HocSinhID END), 0), 2) AS TiLeDat,

        SUM(CASE WHEN c.Diem < n.NguongDat AND c.Diem IS NOT NULL    THEN 1 ELSE 0 END) AS XepLoaiChuaDat,
        ROUND(100.0 * SUM(CASE WHEN c.Diem < n.NguongDat AND c.Diem IS NOT NULL THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN c.KetQuaDanhGia_VI <> '' AND c.KetQuaDanhGia_VI IS NOT NULL THEN c.HocSinhID END), 0), 2) AS TiLeChuaDat,

        SUM(CASE WHEN c.Diem IS NULL                                  THEN 1 ELSE 0 END) AS ChuaXacDinh,
        ROUND(100.0 * SUM(CASE WHEN c.Diem IS NULL                   THEN 1 ELSE 0 END)
            / NULLIF(COUNT(DISTINCT CASE WHEN c.KetQuaDanhGia_VI <> '' AND c.KetQuaDanhGia_VI IS NOT NULL THEN c.HocSinhID END), 0), 2) AS TiLeChuaXacDinh

    FROM CTE c
    CROSS JOIN Nguong n
    GROUP BY c.CapID, c.KhoiID, c.LopID, c.TenLop, c.TenMonHoc
    ORDER BY c.KhoiID, c.TenLop

END