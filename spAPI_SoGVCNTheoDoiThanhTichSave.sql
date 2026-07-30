CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTheoDoiThanhTichSave
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
		THROW 50002, N'Dữ liệu theo dõi thành tích học sinh không hợp lệ.', 1;

	BEGIN TRANSACTION;

	MERGE dbo.tblSoGVCNTheoDoiThanhTichHocSinh AS target
	USING (
		SELECT
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.HSLopID')) AS HSLopID,
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.HocSinhID')) AS HocSinhID,
			JSON_VALUE(src.value, '$.HKI') AS HKI,
			JSON_VALUE(src.value, '$.CuoiNam') AS CuoiNam
		FROM OPENJSON(@JsonRows) AS src
		WHERE TRY_CONVERT(int, JSON_VALUE(src.value, '$.HSLopID')) IS NOT NULL
	) AS source
	ON (target.SoGVCNID = @ID AND target.HSLopID = source.HSLopID)
	WHEN MATCHED THEN
		UPDATE SET
			target.HocSinhID = ISNULL(source.HocSinhID, target.HocSinhID),
			target.HKI = source.HKI,
			target.CuoiNam = source.CuoiNam,
			target.Enable = 1,
			target.UpdateUser = @UserID,
			target.UpdateTime = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (
			SoGVCNID, HSLopID, HocSinhID,
			HKI, CuoiNam,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID, source.HSLopID, source.HocSinhID,
			source.HKI, source.CuoiNam,
			@UserID, @UserID
		);

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNTheoDoiThanhTichSave] TO [lmslhbs];
