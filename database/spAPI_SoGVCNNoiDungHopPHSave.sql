CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNNoiDungHopPHSave
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
		THROW 50002, N'Dữ liệu nội dung họp PHHS không hợp lệ.', 1;

	BEGIN TRANSACTION;

	MERGE dbo.tblSoGVCNNoiDungHopPHHS AS target
	USING (
		SELECT
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.MeetingIndex')) AS MeetingIndex,
			JSON_VALUE(src.value, '$.DotHop') AS DotHop,
			JSON_VALUE(src.value, '$.ThoiGian') AS ThoiGian,
			JSON_VALUE(src.value, '$.DiaDiem') AS DiaDiem,
			JSON_VALUE(src.value, '$.NoiDungChinh') AS NoiDungChinh,
			JSON_VALUE(src.value, '$.YKienPHHS') AS YKienPHHS,
			JSON_VALUE(src.value, '$.KetLuan') AS KetLuan
		FROM OPENJSON(@JsonRows) AS src
		WHERE TRY_CONVERT(int, JSON_VALUE(src.value, '$.MeetingIndex')) IS NOT NULL
	) AS source
	ON (target.SoGVCNID = @ID AND target.MeetingIndex = source.MeetingIndex)
	WHEN MATCHED THEN
		UPDATE SET
			target.DotHop = source.DotHop,
			target.ThoiGian = source.ThoiGian,
			target.DiaDiem = source.DiaDiem,
			target.NoiDungChinh = source.NoiDungChinh,
			target.YKienPHHS = source.YKienPHHS,
			target.KetLuan = source.KetLuan,
			target.Enable = 1,
			target.UpdateUser = @UserID,
			target.UpdateTime = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (
			SoGVCNID, MeetingIndex, DotHop,
			ThoiGian, DiaDiem, NoiDungChinh, YKienPHHS, KetLuan,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID, source.MeetingIndex, source.DotHop,
			source.ThoiGian, source.DiaDiem, source.NoiDungChinh, source.YKienPHHS, source.KetLuan,
			@UserID, @UserID
		);

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNNoiDungHopPHSave] TO [lmslhbs];
