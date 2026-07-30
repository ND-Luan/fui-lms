CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNThongKeDoTuoiGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		ThongKeID,
		SoGVCNID,
		AgeLabel,
		KhuyetTat
	FROM dbo.tblSoGVCNThongKeDoTuoi
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNThongKeDoTuoiGet TO [lmslhbs];
