CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTheoDoiPhuHuynhHopGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		TheoDoiPHHopID,
		SoGVCNID,
		HSLopID,
		HocSinhID,
		Lan1,
		Lan2,
		Lan3,
		GhiChu
	FROM dbo.tblSoGVCNTheoDoiPhuHuynhHop
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNTheoDoiPhuHuynhHopGet TO [lmslhbs];
