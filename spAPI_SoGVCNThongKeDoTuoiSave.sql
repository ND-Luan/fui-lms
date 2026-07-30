CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNThongKeDoTuoiSave
	@SoGVCNID varchar(10),
	@JsonRows nvarchar(max),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);
	DECLARE @UserID int = TRY_CONVERT(int, @sys_UserID);

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

	MERGE dbo.tblSoGVCNThongKeDoTuoi AS target
	USING (
		SELECT
			JSON_VALUE(src.value, '$.AgeLabel') AS AgeLabel,
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.KhuyetTat')) AS KhuyetTat
		FROM OPENJSON(@JsonRows) AS src
		WHERE JSON_VALUE(src.value, '$.AgeLabel') IS NOT NULL
	) AS source
	ON (target.SoGVCNID = @ID AND target.AgeLabel = source.AgeLabel)
	WHEN MATCHED THEN
		UPDATE SET
			target.KhuyetTat = source.KhuyetTat,
			target.Enable = 1,
			target.UpdateUser = @UserID,
			target.UpdateTime = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (
			SoGVCNID, AgeLabel, KhuyetTat,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID, source.AgeLabel, source.KhuyetTat,
			@UserID, @UserID
		);

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNThongKeDoTuoiSave TO [lmslhbs];
