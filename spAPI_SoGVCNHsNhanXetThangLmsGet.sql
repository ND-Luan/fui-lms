CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNHsNhanXetThangLmsGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		NhanXetThangLmsID,
		SoGVCNID,
		HSLopID,
		HocSinhID,
		Thang8,
		Thang9,
		Thang10,
		Thang11,
		Thang12,
		NhanXetHKI,
		Thang1_2,
		Thang3,
		Thang4,
		Thang5,
		NhanXetHKII
	FROM dbo.tblSoGVCNHocSinhNhanXetThangLms
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNHsNhanXetThangLmsGet] TO [lmslhbs];
