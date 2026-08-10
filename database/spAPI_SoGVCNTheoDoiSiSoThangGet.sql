CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTheoDoiSiSoThangGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		TheoDoiSiSoID,
		SoGVCNID,
		ThoiDiem,
		TongSo,
		Nu,
		DanTocJson,
		DoiVien,
		NhiDong,
		ConLietSi,
		ConThuongBinh,
		KhuyetTatCoDanhGia,
		KhuyetTatKhongDanhGia,
		HoNgheo,
		TangGiamLiDo
	FROM dbo.tblSoGVCNTheoDoiSiSoThang
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNTheoDoiSiSoThangGet] TO [lmslhbs];
