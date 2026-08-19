ALTER PROC [dbo].[spAPI_PH_TA_CotDiem_Get_By_HocSinhID_MaNhomCotDiem_C2_C3] --'19100002','Theme_1'
	@NienKhoa 		INT ,
    @HocSinhID     INT
  , @MaNhomCotDiem NVARCHAR(200)
AS
BEGIN

    DECLARE @LopID VARCHAR(20) = '';
    DECLARE @KhoiID INT = 0;
    DECLARE @CapID INT = 0;
    SELECT @LopID  = HSL.LopID
         , @KhoiID = l.KhoiID
         , @CapID  = l.CapID
    FROM
           dbo.tblHocSinhLop     AS HSL
           INNER JOIN dbo.tblLop AS l ON l.LopID  = HSL.LopID
                                     AND l.Enable = 1
                                     and l.NienKhoa  = @NienKhoa
    WHERE
           HSL.HocSinhID = @HocSinhID;

    --Set MonHocLopID
    DECLARE @MonHocLopID NVARCHAR(20) = N'';
    IF (@CapID = 2)
    BEGIN
        SELECT TOP (1) @MonHocLopID = mhl.MonHocLopID
        FROM dbo.tblMonHocLop AS mhl
        WHERE mhl.LopNhomID = @LopID
          AND mhl.MonHocID = 46
          AND mhl.NienKhoa = @NienKhoa
          AND mhl.Enable = 1
        ORDER BY mhl.MonHocLopID DESC;
    END;
    IF (@CapID = 3)
    BEGIN
        SELECT TOP 1
               @MonHocLopID = mhl.MonHocLopID
             , @LopID       = kqht.LopID
        FROM
               dbo.tblMonHocLop               mhl
               INNER JOIN dbo.tblKetQuaHocTap kqht ON kqht.MonHocLopID = mhl.MonHocLopID
                                                  AND kqht.HocSinhID   = @HocSinhID
                                                  AND kqht.NienKhoa    = @NienKhoa
                                                  AND kqht.LopID IN
                                                      (
                                                          SELECT n.NhomID
                                                          FROM
                                                                 dbo.tblNhom AS n
                                                          WHERE
                                                                 n.KhoiID  = @KhoiID
                                                            AND  n.NienKhoa = @NienKhoa
                                                            AND  n.Enable   = 1
															and  n.IsNhomLMS_GiaoBai = 0
                                                      )
                                                  AND kqht.Enable      = 1
        WHERE
               mhl.MonHocID   = 76
          AND  mhl.NienKhoa    = @NienKhoa
          AND  mhl.Enable      = 1
          AND  mhl.ChiaTheoLop = 0;
    END;


    
    --Các kỹ năng
    IF (@CapID = 2)
    BEGIN
        SELECT tbdct.MaNhomCotDiem
			, tbdct.TenNhomCotDiem_VI
			, tbdct.TenNhomCotDiem_EN
             , tbdct.MaCotDiem
             , tbdct.TenCotDiem_VI
             , tbdct.TenCotDiem_EN
             , CASE WHEN kqht.KetQuaDanhGia_VI = '' THEN NULL ELSE kqht.KetQuaDanhGia_VI END AS KetQuaDanhGia_VI
             , CASE WHEN kqht.KetQuaDanhGia_EN = '' THEN NULL ELSE kqht.KetQuaDanhGia_EN END AS KetQuaDanhGia_EN
             , tbdct.LoaiCotDiem
             , tbdct.GiaTriCotDiem
             , tbdct.DiemMin
             , tbdct.DiemMax
			 ,kqht.Enable
        FROM
               dbo.tblKetQuaHocTap                    AS kqht
               RIGHT JOIN dbo.TemplateBangDiemChiTiet AS tbdct ON tbdct.CotDiemID = kqht.CotDiemID
                                                              AND tbdct.MaCotDiem IN (   
															  @MaNhomCotDiem + '_Listening_Point', 
															  @MaNhomCotDiem + '_Language_Point', 
															  @MaNhomCotDiem + '_Reading_Point', 
															  @MaNhomCotDiem + '_Writing_Point', 
															  @MaNhomCotDiem + '_Speaking_Point', 
															  @MaNhomCotDiem + '_Total_Point', 
															  @MaNhomCotDiem + '_Listening_Conv', 
															  @MaNhomCotDiem + '_Language_Conv', 
															  @MaNhomCotDiem + '_Reading_Conv', 
															  @MaNhomCotDiem + '_Writing_Conv', 
															  @MaNhomCotDiem + '_Speaking_Conv', 
															  @MaNhomCotDiem + '_Total_Conv' 
															  --IELTS
                                                              , @MaNhomCotDiem + 'IELTS_Listening_Conv', 
															  @MaNhomCotDiem + 'IELTS_Reading_Conv', 
															  @MaNhomCotDiem + 'IELTS_Writing_Conv', 
															  @MaNhomCotDiem + 'IELTS_Speaking_Conv',
															  @MaNhomCotDiem + 'IELTS_Band_Conv'
                                                                                     )
                                                              
        WHERE
               kqht.HocSinhID  = @HocSinhID
          AND  kqht.MonHocLopID = @MonHocLopID
          AND  kqht.NienKhoa    = @NienKhoa
		  AND	kqht.Enable = 1
          AND   tbdct.Enable    = 1
        ORDER BY
               tbdct.ThuTuNhom
             , tbdct.ThuTuCotDiem;
    END;

    IF (@CapID = 3)
    BEGIN
        SELECT tbdct.MaNhomCotDiem
		, tbdct.TenNhomCotDiem_VI
			, tbdct.TenNhomCotDiem_EN
             , tbdct.MaCotDiem
             , tbdct.TenCotDiem_VI
             , tbdct.TenCotDiem_EN
             , CASE WHEN kqht.KetQuaDanhGia_VI = ''  THEN NULL ELSE kqht.KetQuaDanhGia_VI END AS KetQuaDanhGia_VI
             , CASE WHEN kqht.KetQuaDanhGia_EN = ''  THEN NULL ELSE kqht.KetQuaDanhGia_EN END AS KetQuaDanhGia_EN
             , tbdct.LoaiCotDiem
             , tbdct.GiaTriCotDiem
             , tbdct.DiemMin
             , tbdct.DiemMax
			 ,kqht.Enable
        FROM
               dbo.tblKetQuaHocTap                    AS kqht
               INNER JOIN dbo.TemplateBangDiemChiTiet AS tbdct ON tbdct.CotDiemID = kqht.CotDiemID
                                                              AND tbdct.MaCotDiem IN (   
																	@MaNhomCotDiem + '_Listening_Point', 
																	@MaNhomCotDiem + '_Language_Point', 
																	@MaNhomCotDiem + '_Reading_Point', 
																	@MaNhomCotDiem + '_Writing_Point', 
																	@MaNhomCotDiem + '_Speaking_Point',
																	@MaNhomCotDiem + '_Total_Point', 

																	@MaNhomCotDiem + '_Listening_Conv', 
																	@MaNhomCotDiem + '_Language_Conv',
																	@MaNhomCotDiem + '_Reading_Conv',
																	@MaNhomCotDiem + '_Writing_Conv', 
																	@MaNhomCotDiem + '_Speaking_Conv', 
																	@MaNhomCotDiem + '_Total_Conv' ,
																	--IELTS
																	@MaNhomCotDiem + '_IELTS_Listening_Conv', 
																	@MaNhomCotDiem + '_IELTS_Reading_Conv', 
																	@MaNhomCotDiem + '_IELTS_Writing_Conv',
																	@MaNhomCotDiem + '_IELTS_Speaking_Conv',
																	@MaNhomCotDiem + '_IELTS_Band_Conv',
																	--TA2
																	@MaNhomCotDiem + '_TA2_Listening_Point',
																	@MaNhomCotDiem + '_TA2_Listening_Conv',
																	@MaNhomCotDiem + '_TA2_Reading_Point',
																	@MaNhomCotDiem + '_TA2_Reading_Conv',
																	@MaNhomCotDiem + '_TA2_Writing_Point',
																	@MaNhomCotDiem + '_TA2_Writing_Conv',
																	@MaNhomCotDiem + '_TA2_Speaking_Point',
																	@MaNhomCotDiem + '_TA2_Speaking_Conv',
																	@MaNhomCotDiem + '_TA2_Language_Point',
																	@MaNhomCotDiem + '_TA2_Language_Conv',
																	@MaNhomCotDiem + '_TA2_Avg_Point',
																	@MaNhomCotDiem + '_TA2_Avg_Conv'
																)
                                                              AND tbdct.Enable    = 1
        WHERE
               kqht.HocSinhID  = @HocSinhID
          AND  kqht.MonHocLopID = @MonHocLopID
          AND  kqht.NienKhoa    = @NienKhoa
		  AND  kqht.Enable = 1
        ORDER BY
               tbdct.ThuTuNhom
             , tbdct.ThuTuCotDiem;
    END;


    --Theme
    DECLARE @Theme_First NVARCHAR(50) = N'';
    DECLARE @Theme_Second NVARCHAR(50) = N'';
    IF (@MaNhomCotDiem = 'S1_Mid')
    BEGIN
        SET @Theme_First = N'Theme_1';
        SET @Theme_Second = N'Theme_2';
    END;
    IF (@MaNhomCotDiem = 'S1_Final')
    BEGIN
        SET @Theme_First = N'Theme_3';
        SET @Theme_Second = N'Theme_4';
    END;
    IF (@MaNhomCotDiem = 'S2_Mid')
    BEGIN
        SET @Theme_First = N'Theme_5';
        SET @Theme_Second = N'Theme_6';
    END;
    IF (@MaNhomCotDiem = 'S2_Final')
    BEGIN
        SET @Theme_First = N'Theme_7';
        SET @Theme_Second = N'Theme_8';
    END;

    --Theme
    SELECT tbdct.MaNhomCotDiem
         , tbdct.MaCotDiem
         , tbdct.TenCotDiem_VI
         , tbdct.TenCotDiem_EN
         , kqht.KetQuaDanhGia_VI
         , kqht.KetQuaDanhGia_EN
         , tbdct.LoaiCotDiem
         , tbdct.GiaTriCotDiem
         , tbdct.DiemMin
         , tbdct.DiemMax
    FROM
           dbo.tblKetQuaHocTap                    AS kqht
           INNER JOIN dbo.TemplateBangDiemChiTiet AS tbdct ON tbdct.CotDiemID = kqht.CotDiemID
                                                          AND tbdct.MaNhomCotDiem IN (@Theme_First, @Theme_Second)
                                                          AND tbdct.Enable    = 1
    WHERE
           kqht.HocSinhID  = @HocSinhID
      AND  kqht.MonHocLopID = @MonHocLopID
      AND  kqht.NienKhoa    = @NienKhoa
    ORDER BY
           tbdct.ThuTuNhom
         , tbdct.ThuTuCotDiem;
END;

GRANT EXECUTE ON [dbo].[spAPI_PH_TA_CotDiem_Get_By_HocSinhID_MaNhomCotDiem_C2_C3] TO [lmslhbs];
