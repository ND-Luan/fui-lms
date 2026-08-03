CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNSoKetHKIGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	-- 1. Main JSON overview & notes
	SELECT
		SoKetHKIID,
		SoGVCNID,
		JsonData
	FROM dbo.tblSoGVCNSoKetHKI
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
	FROM dbo.tblSoGVCNSoKetHKIDanhGia
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_SoGVCNSoKetHKIGet] TO [lmslhbs];
