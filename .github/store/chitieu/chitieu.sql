CREATE PROC spAPI_ChiTieu_DanhHieu_CuoiNam_Get
@NienKhoa INT
AS
BEGIN
    SELECT ChiTieuID
         , CapID
         , NienKhoa
         , KhoiID
         , DanhHieu_HS_XuatSac
         , DanhHieu_HS_Gioi
	FROM  [dbo].[tblChiTieu_DanhHieu_CuoiNam]
	WHERE Enable = 1
	AND NienKhoa = @NienKhoa
END;

CREATE PROC spAPI_ChiTieu_KQHT_CuoiNam_Get
@NienKhoa INT
AS
BEGIN
    SELECT ChiTieuID
         , NienKhoa
         , KhoiID
         , Tot
         , Kha
         , Dat
         , ChuaDat
	FROM [dbo].[tblChiTieu_KQHT_CuoiNam]
	WHERE Enable = 1
	AND NienKhoa = @NienKhoa
END


