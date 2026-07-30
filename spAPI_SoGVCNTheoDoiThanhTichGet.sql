CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTheoDoiThanhTichGet
	@SoGVCNID varchar(10),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);

	SELECT
		ThanhTichID,
		SoGVCNID,
		HSLopID,
		HocSinhID,
		HKI,
		CuoiNam
	FROM dbo.tblSoGVCNTheoDoiThanhTichHocSinh
	WHERE SoGVCNID = @ID
	  AND Enable = 1;
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNTheoDoiThanhTichGet] TO [lmslhbs];
