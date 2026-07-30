CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNSoKetHKIGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		SoKetHKIID,
		SoGVCNID,
		JsonData,
		CreateUser,
		CreateTime,
		UpdateUser,
		UpdateTime
	FROM dbo.tblSoGVCNSoKetHKI
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_SoGVCNSoKetHKIGet] TO [lmslhbs];
