CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNKeHoachTuanClear
	@SoGVCNID varchar(10),
	@Thang varchar(2),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);
	DECLARE @Month tinyint = TRY_CONVERT(tinyint, @Thang);

	IF @ID IS NULL OR @Month NOT BETWEEN 1 AND 12
		THROW 50001, N'Thông tin sổ hoặc tháng không hợp lệ.', 1;

	UPDATE tuan
	SET
		Enable = 0,
		UpdateUser = @sys_UserID,
		UpdateTime = GETDATE()
	FROM dbo.tblSoGVCNKeHoachTuan tuan
	JOIN dbo.tblSoGVCNKeHoachThang thang
	  ON thang.KeHoachThangID = tuan.KeHoachThangID
	WHERE thang.SoGVCNID = @ID
	  AND thang.Thang = @Month
	  AND tuan.Enable = 1;

	SELECT mess = N'Đã làm mới kế hoạch tuần', SoGVCNID = @ID, Thang = @Month;
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_SoGVCNKeHoachTuanClear] TO [lmslhbs];
