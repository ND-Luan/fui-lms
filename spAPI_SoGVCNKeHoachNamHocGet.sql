CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNKeHoachNamHocGet
	@url1_SoGVCNID varchar(10),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT
		KeHoachNamHocID,
		SoGVCNID,
		JsonData,
		UpdateUser,
		UpdateTime
	FROM dbo.tblSoGVCNKeHoachNamHoc
	WHERE SoGVCNID = TRY_CONVERT(int, @url1_SoGVCNID)
	  AND Enable = 1;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNKeHoachNamHocGet TO [public];
GO
