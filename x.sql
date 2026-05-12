
--[dbo].[spAPI_ThongKe_ChatLuong_BoMon]
--@MonHocID     = 46,
--@NienKhoa     = 2025,
--@HocKi        = 2,
--@Semester     = 'HK2',
--@IsMonHoc_CD_D= 0 
ALTER PROC [dbo].[spAPI_ThongKe_ChatLuong_BoMon]
    @MonHocID      INT
  , @NienKhoa      INT
  , @HocKi         INT         -- 0: Cả năm | 1: HK1 | 2: HK2
  , @Semester      VARCHAR(50) -- HK1 / HK2 / CN
  , @IsMonHoc_CD_D BIT = 0
AS
BEGIN

    ;WITH GiaoVienLop AS
     (
       SELECT DISTINCT gvl.LopID
                 , gvl.GiaoVienID
                 , gv.HoGV + ' ' + gv.TenGV AS TenGiaoVien
       FROM
            dbo.tblGiaoVienLop         gvl
            INNER JOIN dbo.tblGiaoVien gv ON gv.GiaoVienID = gvl.GiaoVienID
       WHERE
            gvl.NienKhoa            = @NienKhoa
         AND  gvl.Is_PhanCong_QLDiem  = 1
         AND  gvl.Enable              = 1
         AND  gvl.MonHocID            = @MonHocID
         AND  (
                (@HocKi IN (1, 2) AND gvl.HocKy = @HocKi)
             OR (@HocKi = 0 AND gvl.HocKy IN (1, 2))
            )
     )
      , KetQuaHocSinhRaw AS
     (
       SELECT kqht.HocSinhID
          , mhl.LopNhomID
          , l.TenLop
          , TRY_CAST(kqht.KetQuaDanhGia_VI AS FLOAT) AS DiemSo
          , kqht.KetQuaDanhGia_VI                    AS KetQuaChu
       FROM
            dbo.tblKetQuaHocTap                    kqht
            INNER JOIN dbo.TemplateBangDiemChiTiet ct ON ct.CotDiemID = kqht.CotDiemID
                                         AND ct.Enable    = 1
                                         AND (
                                               (@HocKi IN (1, 2) AND ct.MaCotDiem = 'DiemTB_' + @Semester)
                                              OR (@HocKi = 0 AND ct.MaCotDiem IN ('DiemTB_HK1', 'DiemTB_HK2'))
                                             )
            INNER JOIN dbo.tblMonHocLop            mhl ON mhl.MonHocLopID = kqht.MonHocLopID
                                          AND mhl.Enable      = 1
                                          AND mhl.NienKhoa    = @NienKhoa
                                          AND mhl.MonHocID    = @MonHocID
            INNER JOIN dbo.tblLop                  l ON mhl.LopNhomID = l.LopID
                                        AND l.LopID       = kqht.LopID
                                        AND l.Enable      = 1
                                        AND l.NienKhoa    = @NienKhoa
       WHERE
            kqht.NienKhoa = @NienKhoa
         AND  kqht.Enable   = 1
     )
      , KetQuaHocSinh AS
     (
       SELECT q.HocSinhID
          , q.LopNhomID
          , q.TenLop
          , AVG(q.DiemSo) AS DiemTongHop
          , CASE
               WHEN SUM(CASE WHEN q.KetQuaChu = N'CĐ' THEN 1 ELSE 0 END) > 0 THEN N'CĐ'
               WHEN SUM(CASE WHEN q.KetQuaChu = N'Đ' THEN 1 ELSE 0 END) > 0 THEN N'Đ'
               ELSE NULL
            END           AS KetQuaTongHop
       FROM
            KetQuaHocSinhRaw q
       GROUP BY
            q.HocSinhID
          , q.LopNhomID
          , q.TenLop
     )
      , KetQuaLop AS
     (
       SELECT hs.LopNhomID
          , hs.TenLop
          , COUNT(*) AS SiSo
          , CASE
               WHEN @IsMonHoc_CD_D = 1 THEN SUM(CASE WHEN hs.KetQuaTongHop = N'CĐ' THEN 1 ELSE 0 END)
               ELSE SUM(CASE WHEN hs.DiemTongHop < 5 THEN 1 ELSE 0 END)
            END   AS ChuaDat_SL
          , CASE
               WHEN @IsMonHoc_CD_D = 1 THEN SUM(CASE WHEN hs.KetQuaTongHop = N'Đ' THEN 1 ELSE 0 END)
               ELSE SUM(CASE WHEN hs.DiemTongHop >= 5 AND hs.DiemTongHop < 6.5 THEN 1 ELSE 0 END)
            END   AS Dat_SL
          , CASE
               WHEN @IsMonHoc_CD_D = 0 THEN SUM(CASE WHEN hs.DiemTongHop >= 6.5 AND hs.DiemTongHop < 8 THEN 1 ELSE 0 END)
               ELSE 0
            END   AS Kha_SL
          , CASE
               WHEN @IsMonHoc_CD_D = 0 THEN SUM(CASE WHEN hs.DiemTongHop >= 8 AND hs.DiemTongHop <= 10 THEN 1 ELSE 0 END)
               ELSE 0
            END   AS Tot_SL
          , CASE
               WHEN @IsMonHoc_CD_D = 1 THEN SUM(CASE WHEN hs.KetQuaTongHop = N'Đ' THEN 1 ELSE 0 END)
               ELSE SUM(CASE WHEN hs.DiemTongHop >= 5 AND hs.DiemTongHop <= 10 THEN 1 ELSE 0 END)
            END   AS DatTroLen_SL
       FROM
            KetQuaHocSinh hs
       GROUP BY
            hs.LopNhomID
          , hs.TenLop
     )
        , KetQuaDayDu AS
     (
         SELECT ISNULL(gvl.GiaoVienID, '')                                            AS GiaoVienID
              , ISNULL(gvl.TenGiaoVien, N'Chưa phân công')                            AS TenGiaoVien
              , kql.LopNhomID
              , kql.TenLop
              , kql.SiSo
              , kql.ChuaDat_SL
              , kql.Dat_SL
              , kql.Kha_SL
              , kql.Tot_SL
              , kql.DatTroLen_SL
              , CAST(100.0 * kql.ChuaDat_SL / NULLIF(kql.SiSo, 0) AS DECIMAL(5, 2))   AS ChuaDat_TL
              , CAST(100.0 * kql.Dat_SL / NULLIF(kql.SiSo, 0) AS DECIMAL(5, 2))       AS Dat_TL
              , CAST(100.0 * kql.Kha_SL / NULLIF(kql.SiSo, 0) AS DECIMAL(5, 2))       AS Kha_TL
              , CAST(100.0 * kql.Tot_SL / NULLIF(kql.SiSo, 0) AS DECIMAL(5, 2))       AS Tot_TL
              , CAST(100.0 * kql.DatTroLen_SL / NULLIF(kql.SiSo, 0) AS DECIMAL(5, 2)) AS DatTroLen_TL
         FROM
                KetQuaLop             kql
                LEFT JOIN GiaoVienLop gvl ON gvl.LopID = kql.LopNhomID
     )
    SELECT *
    FROM
           (

               -- 1. Tổng bộ môn
               SELECT 0                                                                       AS STT
                    , N'TỔNG BỘ MÔN'                                                          AS GiaoVien
                    , ''                                                                      AS TenLop
                    , SUM(SiSo)                                                               AS SiSo
                    , SUM(ChuaDat_SL)                                                         AS ChuaDat_SL
                    , CAST(100.0 * SUM(ChuaDat_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))   AS ChuaDat_TL
                    , SUM(Dat_SL)                                                             AS Dat_SL
                    , CAST(100.0 * SUM(Dat_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))       AS Dat_TL
                    , SUM(Kha_SL)                                                             AS Kha_SL
                    , CAST(100.0 * SUM(Kha_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))       AS Kha_TL
                    , SUM(Tot_SL)                                                             AS Tot_SL
                    , CAST(100.0 * SUM(Tot_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))       AS Tot_TL
                    , SUM(DatTroLen_SL)                                                       AS DatTroLen_SL
                    , CAST(100.0 * SUM(DatTroLen_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2)) AS DatTroLen_TL
                    , ''                                                                      AS GiaoVienID
                    , 0                                                                       AS LopID
                    , 0                                                                       AS SortOrder1
                    , ''                                                                      AS SortOrder2
                    , 0                                                                       AS SortOrder3
               FROM
                      KetQuaDayDu
               UNION ALL

               -- 2. Tổng theo giáo viên
               SELECT ROW_NUMBER() OVER (ORDER BY
                                             TenGiaoVien
                                        )                                                     AS STT
                    , TenGiaoVien                                                             AS GiaoVien
                    , ''                                                                      AS TenLop
                    , SUM(SiSo)                                                               AS SiSo
                    , SUM(ChuaDat_SL)                                                         AS ChuaDat_SL
                    , CAST(100.0 * SUM(ChuaDat_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))   AS ChuaDat_TL
                    , SUM(Dat_SL)                                                             AS Dat_SL
                    , CAST(100.0 * SUM(Dat_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))       AS Dat_TL
                    , SUM(Kha_SL)                                                             AS Kha_SL
                    , CAST(100.0 * SUM(Kha_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))       AS Kha_TL
                    , SUM(Tot_SL)                                                             AS Tot_SL
                    , CAST(100.0 * SUM(Tot_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2))       AS Tot_TL
                    , SUM(DatTroLen_SL)                                                       AS DatTroLen_SL
                    , CAST(100.0 * SUM(DatTroLen_SL) / NULLIF(SUM(SiSo), 0) AS DECIMAL(5, 2)) AS DatTroLen_TL
                    , GiaoVienID
                    , 0                                                                       AS LopID
                    , 1                                                                       AS SortOrder1
                    , TenGiaoVien                                                             AS SortOrder2
                    , 0                                                                       AS SortOrder3
               FROM
                      KetQuaDayDu
               GROUP BY
                      TenGiaoVien
                    , GiaoVienID
               UNION ALL

               -- 3. Chi tiết lớp
               SELECT ROW_NUMBER() OVER (PARTITION BY TenGiaoVien
                                         ORDER BY
                                             TenLop
                                        ) AS STT
                    , ''                  AS GiaoVien
                    , TenLop
                    , SiSo
                    , ChuaDat_SL
                    , ChuaDat_TL
                    , Dat_SL
                    , Dat_TL
                    , Kha_SL
                    , Kha_TL
                    , Tot_SL
                    , Tot_TL
                    , DatTroLen_SL
                    , DatTroLen_TL
                    , GiaoVienID
                    , LopNhomID           AS LopID
                    , 1                   AS SortOrder1
                    , TenGiaoVien         AS SortOrder2
                    , 1                   AS SortOrder3
               FROM
                      KetQuaDayDu
           ) AS t
    ORDER BY
           SortOrder1
         , SortOrder2
         , SortOrder3
         , TenLop;

END;