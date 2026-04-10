USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_BaoCao_DanhGiaMonHoc_HK_TheoKhoi]    Script Date: 2026-04-10 10:21:53 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[spAPI_BaoCao_DanhGiaMonHoc_HK_TheoKhoi]
    @HocKi    NVARCHAR(200)  
  , @NienKhoa INT            
  , @KhoiID   INT            
AS
BEGIN


    DECLARE @TongSoHocSinh_DauNam INT = 0;

    SELECT @TongSoHocSinh_DauNam = COUNT(*)
    FROM
           dbo.tblHocSinhLop     HSL
           INNER JOIN dbo.tblLop l ON l.LopID    = HSL.LopID
                                  AND l.Enable   = 1
                                  AND l.CapID    = 1
                                  AND l.KhoiID   = @KhoiID
                                  AND l.NienKhoa = @NienKhoa
    WHERE
           HSL.Enable = 1;

    SELECT mh.TenMonHoc_HienThi
         , @TongSoHocSinh_DauNam                                        AS TongSoHocSinh_DauNam
         , COUNT(DISTINCT kqht.HocSinhID)                               AS TongSoHocSinh_TrongKi
         , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'T' THEN 1 ELSE 0 END) AS HoanThanhTot
         , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'H' THEN 1 ELSE 0 END) AS HoanThanh
         , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'C' THEN 1 ELSE 0 END) AS ChuaHoanThanh
         -- Tỉ lệ tính theo TongSoHocSinh_TrongKi
         , CASE
                WHEN COUNT(DISTINCT kqht.HocSinhID) = 0 THEN 0
                ELSE ROUND(CAST(SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'T' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT kqht.HocSinhID) * 100, 2)
           END                                                          AS TiLe_HoanThanhTot
         , CASE
                WHEN COUNT(DISTINCT kqht.HocSinhID) = 0 THEN 0
                ELSE ROUND(CAST(SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'H' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT kqht.HocSinhID) * 100, 2)
           END                                                          AS TiLe_HoanThanh
         , CASE
                WHEN COUNT(DISTINCT kqht.HocSinhID) = 0 THEN 0
                ELSE ROUND(CAST(SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'C' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT kqht.HocSinhID) * 100, 2)
           END                                                          AS TiLe_ChuaHoanThanh
    FROM
           dbo.tblKetQuaHocTap                    kqht
           INNER JOIN dbo.TemplateBangDiemChiTiet ct ON ct.CotDiemID     = kqht.CotDiemID
                                                    AND ct.Enable        = 1
                                                    AND ct.MaCotDiem     = 'MucDoDanhGia' + @HocKi
           INNER JOIN dbo.tblMonHocLop            mhl ON mhl.MonHocLopID = kqht.MonHocLopID
                                                     AND mhl.Enable      = 1
                                                     AND mhl.NienKhoa    = @NienKhoa
           INNER JOIN dbo.tblLop                  l ON l.LopID           = kqht.LopID
                                                   AND l.LopID           = mhl.LopNhomID
                                                   AND l.Enable          = 1
                                                   AND l.NienKhoa        = @NienKhoa
                                                   AND l.KhoiID          = @KhoiID
           INNER JOIN dbo.tblMonHoc               mh ON mh.MonHocID      = mhl.MonHocID
                                                    AND mh.Enable        = 1
                                                    AND mh.CapID         = 1
    WHERE
           kqht.Enable  = 1
      AND  kqht.NienKhoa = @NienKhoa
      AND  l.CapID       = 1
      AND  mhl.MonHocID IN (   1  --Tiếng Việt
                             , 2  --Toán
                             , 3  --Tự nhiên và Xã hội
                             , 4  --Khoa học
                             , 19 --Lịch sử/Địa lí
                             , 5  --Ngoại ngữ
                             , 8  --Đạo đức
                             , 9  --Âm nhạc
                             , 10 --Mĩ thuật
                             , 11 --Hoạt động trải nghiệm
                             , 12 --Thể dục
                             , 6  --Tin học và Công nghệ (Tin học)
                             , 35 --Tin học và Công nghệ (Công nghệ)
                           )
    GROUP BY
           mh.TenMonHoc_HienThi
         , mh.Sort
    ORDER BY
           mh.Sort;

	    SELECT mh.TenMonHoc_HienThi
         , @TongSoHocSinh_DauNam                                        AS TongSoHocSinh_DauNam
         , COUNT(DISTINCT kqht.HocSinhID)                               AS TongSoHocSinh_TrongKi
         , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'T' THEN 1 ELSE 0 END) AS HoanThanhTot
         , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = N'Đ' THEN 1 ELSE 0 END) AS HoanThanh
         , SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'C' THEN 1 ELSE 0 END) AS ChuaHoanThanh
         -- Tỉ lệ tính theo TongSoHocSinh_TrongKi
         , CASE
                WHEN COUNT(DISTINCT kqht.HocSinhID) = 0 THEN 0
                ELSE ROUND(CAST(SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'T' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT kqht.HocSinhID) * 100, 2)
           END                                                          AS TiLe_HoanThanhTot
         , CASE
                WHEN COUNT(DISTINCT kqht.HocSinhID) = 0 THEN 0
                ELSE ROUND(CAST(SUM(CASE WHEN kqht.KetQuaDanhGia_VI = N'Đ' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT kqht.HocSinhID) * 100, 2)
           END                                                          AS TiLe_HoanThanh
         , CASE
                WHEN COUNT(DISTINCT kqht.HocSinhID) = 0 THEN 0
                ELSE ROUND(CAST(SUM(CASE WHEN kqht.KetQuaDanhGia_VI = 'C' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(DISTINCT kqht.HocSinhID) * 100, 2)
           END                                                          AS TiLe_ChuaHoanThanh
    FROM
           dbo.tblKetQuaHocTap                    kqht
           INNER JOIN dbo.TemplateBangDiemChiTiet ct ON ct.CotDiemID     = kqht.CotDiemID
                                                    AND ct.Enable        = 1
                                                    AND ct.MaCotDiem     = 'MucDoDanhGia' + @HocKi
           INNER JOIN dbo.tblMonHocLop            mhl ON mhl.MonHocLopID = kqht.MonHocLopID
                                                     AND mhl.Enable      = 1
                                                     AND mhl.NienKhoa    = @NienKhoa
           INNER JOIN dbo.tblLop                  l ON l.LopID           = kqht.LopID
                                                   AND l.LopID           = mhl.LopNhomID
                                                   AND l.Enable          = 1
                                                   AND l.NienKhoa        = @NienKhoa
                                                   AND l.KhoiID          = @KhoiID
           INNER JOIN dbo.tblMonHoc               mh ON mh.MonHocID      = mhl.MonHocID
                                                    AND mh.Enable        = 1
                                                    AND mh.CapID         = 1
    WHERE
           kqht.Enable  = 1
      AND  kqht.NienKhoa = @NienKhoa
      AND  l.CapID       = 1
      AND  mhl.MonHocID IN (   
		23	 --Phẩm chất-Yêu nước
		,24	 --Phẩm chất-Nhân ái
		,25	 --Phẩm chất-Chăm chỉ
		,26	 --Phẩm chất-Trung thực
		,27	 --Phẩm chất-Trách nhiệm
		,20	 --Năng lực-Tự chủ và tự học
		,21	 --Năng lực-Giao tiếp và hợp tác
		,22	 --Năng lực-Giải quyết vấn đề và sáng tạo
		,28	 --Năng lực-Ngôn ngữ
		,29	 --Năng lực-Tính toán
		,30	 --Năng lực-Khoa học
		,31	 --Năng lực-Công nghệ
		,32	 --Năng lực-Tin học
		,33	 --Năng lực-Thẩm mĩ
		,34	 --Năng lực-Thể chất
                           )
    GROUP BY
           mh.TenMonHoc_HienThi
         , mh.Sort
    ORDER BY
           mh.Sort;

END; 