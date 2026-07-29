CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNHsCanQuanTamGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		HsCanQuanTamID,
		SoGVCNID,
		HSLopID,
		HocSinhID,
		CanHoTroDacBiet,
		Thang8,
		Thang9,
		Thang10,
		Thang11,
		Thang12,
		NhanXetHKI,
		KetQuaHKI,
		Thang1_2,
		Thang3,
		Thang4,
		Thang5,
		NhanXetCuoiNam,
		KetQuaCuoiNam
	FROM dbo.tblSoGVCNHocSinhCanQuanTam
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNHsCanQuanTamGet TO [lmslhbs];
