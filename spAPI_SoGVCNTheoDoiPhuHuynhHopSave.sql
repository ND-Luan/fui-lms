CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTheoDoiPhuHuynhHopSave
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
		THROW 50002, N'Dữ liệu theo dõi PH đi họp không hợp lệ.', 1;

	BEGIN TRANSACTION;

	MERGE dbo.tblSoGVCNTheoDoiPhuHuynhHop AS target
	USING (
		SELECT
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.HSLopID')) AS HSLopID,
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.HocSinhID')) AS HocSinhID,
			ISNULL(TRY_CONVERT(bit, JSON_VALUE(src.value, '$.Lan1')), 0) AS Lan1,
			ISNULL(TRY_CONVERT(bit, JSON_VALUE(src.value, '$.Lan2')), 0) AS Lan2,
			ISNULL(TRY_CONVERT(bit, JSON_VALUE(src.value, '$.Lan3')), 0) AS Lan3,
			JSON_VALUE(src.value, '$.GhiChu') AS GhiChu
		FROM OPENJSON(@JsonRows) AS src
		WHERE TRY_CONVERT(int, JSON_VALUE(src.value, '$.HSLopID')) IS NOT NULL
	) AS source
	ON (target.SoGVCNID = @ID AND target.HSLopID = source.HSLopID)
	WHEN MATCHED THEN
		UPDATE SET
			target.HocSinhID = ISNULL(source.HocSinhID, target.HocSinhID),
			target.Lan1 = source.Lan1,
			target.Lan2 = source.Lan2,
			target.Lan3 = source.Lan3,
			target.GhiChu = source.GhiChu,
			target.Enable = 1,
			target.UpdateUser = @UserID,
			target.UpdateTime = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (
			SoGVCNID, HSLopID, HocSinhID,
			Lan1, Lan2, Lan3, GhiChu,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID, source.HSLopID, source.HocSinhID,
			source.Lan1, source.Lan2, source.Lan3, source.GhiChu,
			@UserID, @UserID
		);

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNTheoDoiPhuHuynhHopSave] TO [lmslhbs];
