CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNSoKetHKISave
	@SoGVCNID varchar(10),
	@JsonData nvarchar(max),
	@sys_UserID varchar(9),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);
	DECLARE @UserID varchar(9) = @sys_UserID;

	IF @ID IS NULL OR NOT EXISTS (
		SELECT 1
		FROM dbo.tblSoGVCN
		WHERE SoGVCNID = @ID
		  AND Enable = 1
	)
		THROW 50001, N'Sổ GVCN không hợp lệ.', 1;

	IF ISJSON(@JsonData) <> 1
		THROW 50002, N'Dữ liệu sơ kết học kỳ I không hợp lệ.', 1;

	BEGIN TRANSACTION;

	IF EXISTS (SELECT 1 FROM dbo.tblSoGVCNSoKetHKI WHERE SoGVCNID = @ID)
	BEGIN
		UPDATE dbo.tblSoGVCNSoKetHKI
		SET JsonData = @JsonData,
			Enable = 1,
			UpdateUser = @UserID,
			UpdateTime = GETDATE()
		WHERE SoGVCNID = @ID;
	END
	ELSE
	BEGIN
		INSERT INTO dbo.tblSoGVCNSoKetHKI
			(SoGVCNID, JsonData, CreateUser, UpdateUser)
		VALUES
			(@ID, @JsonData, @UserID, @UserID);
	END;

	UPDATE dbo.tblSoGVCN
	SET TrangThai = CASE WHEN TrangThai = 'NEW' THEN 'DRAFT' ELSE TrangThai END,
		UpdateUser = @UserID,
		UpdateTime = GETDATE()
	WHERE SoGVCNID = @ID;

	COMMIT TRANSACTION;

	SELECT mess = N'Đã lưu sơ kết học kỳ I', SoGVCNID = @ID;
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_SoGVCNSoKetHKISave] TO [lmslhbs];
