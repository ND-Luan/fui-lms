CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNKeHoachNamHocGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(9),
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
	WHERE SoGVCNID = TRY_CONVERT(int, @SoGVCNID)
	  AND Enable = 1;
END;
GO

REVOKE EXECUTE ON dbo.spAPI_SoGVCNKeHoachNamHocGet FROM [public];
GO

GRANT EXECUTE ON [dbo].[spAPI_SoGVCNKeHoachNamHocGet] TO [lmslhbs];
