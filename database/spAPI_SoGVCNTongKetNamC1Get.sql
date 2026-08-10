CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTongKetNamC1Get
	@SoGVCNID varchar(10),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	-- 1. Main overview & text notes
	SELECT
		TongKetID,
		SoGVCNID,
		DuyTriSoLuong,
		NangLucPhamChat,
		KienThucKyNang,
		HoanThanhCT,
		PhongTraoKhac,
		JsonSheet1,
		JsonSheet2,
		JsonSheet3,
		JsonSheet4
	FROM dbo.tblSoGVCNTongKetNamHocC1
	WHERE SoGVCNID = @ID
	  AND Enable = 1;

	-- 2. Structured ratings table
	SELECT
		DanhGiaID,
		SoGVCNID,
		LoaiDanhGia,
		MonHocID,
		TieuChiCode,
		TenTieuChi,
		MucXepLoaiCode,
		SoLuong,
		TiLe
	FROM dbo.tblSoGVCNTongKetNamDanhGia
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_SoGVCNTongKetNamC1Get] TO [lmslhbs];
