CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNNoiDungHopPHGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		NoiDungHopID,
		SoGVCNID,
		MeetingIndex,
		DotHop,
		ThoiGian,
		DiaDiem,
		NoiDungChinh,
		YKienPHHS,
		KetLuan
	FROM dbo.tblSoGVCNNoiDungHopPHHS
	WHERE SoGVCNID = @ID
	  AND Enable = 1
	ORDER BY MeetingIndex ASC;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNNoiDungHopPHGet TO [lmslhbs];
