CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNThongKeDoTuoiSave
	@SoGVCNID varchar(10),
	@JsonRows nvarchar(max),
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

	IF ISJSON(@JsonRows) <> 1
		THROW 50002, N'Dữ liệu thống kê độ tuổi không hợp lệ.', 1;

	BEGIN TRANSACTION;

	-- Các dòng bị xóa trên giao diện không còn nằm trong JsonRows.
	-- Vô hiệu hóa dữ liệu cũ trước khi MERGE để khi tải lại không hiện lại.
	UPDATE dbo.tblSoGVCNThongKeDoTuoi
	SET
		Enable = 0,
		UpdateUser = @UserID,
		UpdateTime = GETDATE()
	WHERE SoGVCNID = @ID
	  AND Enable = 1;

	MERGE dbo.tblSoGVCNThongKeDoTuoi AS target
	USING (
		SELECT
			JSON_VALUE(src.value, '$.AgeLabel') AS AgeLabel,
			JSON_VALUE(src.value, '$.Nam') AS Nam,
			JSON_VALUE(src.value, '$.Nu') AS Nu,
			JSON_VALUE(src.value, '$.DanTocJson') AS DanTocJson,
			JSON_VALUE(src.value, '$.KhuyetTat') AS KhuyetTat
		FROM OPENJSON(@JsonRows) AS src
		WHERE JSON_VALUE(src.value, '$.AgeLabel') IS NOT NULL
	) AS source
	ON (target.SoGVCNID = @ID AND target.AgeLabel = source.AgeLabel)
	WHEN MATCHED THEN
		UPDATE SET
			target.Nam = source.Nam,
			target.Nu = source.Nu,
			target.DanTocJson = source.DanTocJson,
			target.KhuyetTat = source.KhuyetTat,
			target.Enable = 1,
			target.UpdateUser = @UserID,
			target.UpdateTime = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (
			SoGVCNID, AgeLabel, Nam, Nu, DanTocJson, KhuyetTat,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID, source.AgeLabel, source.Nam, source.Nu, source.DanTocJson, source.KhuyetTat,
			@UserID, @UserID
		);

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNThongKeDoTuoiSave] TO [lmslhbs];
