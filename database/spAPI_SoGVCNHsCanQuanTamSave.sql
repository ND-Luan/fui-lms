CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNHsCanQuanTamSave
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
		THROW 50002, N'Dữ liệu hồ sơ học sinh cần quan tâm không hợp lệ.', 1;

	BEGIN TRANSACTION;

	-- Parse danh sách đối tượng từ Frontend truyền lên và lưu vào các cột riêng biệt của bảng
	MERGE dbo.tblSoGVCNHocSinhCanQuanTam AS target
	USING (
		SELECT
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.HSLopID')) AS HSLopID,
			TRY_CONVERT(int, JSON_VALUE(src.value, '$.HocSinhID')) AS HocSinhID,
			JSON_VALUE(src.value, '$.CanHoTroDacBiet') AS CanHoTroDacBiet,
			JSON_VALUE(src.value, '$.Thang8') AS Thang8,
			JSON_VALUE(src.value, '$.Thang9') AS Thang9,
			JSON_VALUE(src.value, '$.Thang10') AS Thang10,
			JSON_VALUE(src.value, '$.Thang11') AS Thang11,
			JSON_VALUE(src.value, '$.Thang12') AS Thang12,
			JSON_VALUE(src.value, '$.NhanXetHKI') AS NhanXetHKI,
			JSON_VALUE(src.value, '$.KetQuaHKI') AS KetQuaHKI,
			JSON_VALUE(src.value, '$.Thang1_2') AS Thang1_2,
			JSON_VALUE(src.value, '$.Thang3') AS Thang3,
			JSON_VALUE(src.value, '$.Thang4') AS Thang4,
			JSON_VALUE(src.value, '$.Thang5') AS Thang5,
			JSON_VALUE(src.value, '$.NhanXetCuoiNam') AS NhanXetCuoiNam,
			JSON_VALUE(src.value, '$.KetQuaCuoiNam') AS KetQuaCuoiNam
		FROM OPENJSON(@JsonRows) AS src
		WHERE TRY_CONVERT(int, JSON_VALUE(src.value, '$.HSLopID')) IS NOT NULL
	) AS source
	ON (target.SoGVCNID = @ID AND target.HSLopID = source.HSLopID)
	WHEN MATCHED THEN
		UPDATE SET
			target.HocSinhID = ISNULL(source.HocSinhID, target.HocSinhID),
			target.CanHoTroDacBiet = source.CanHoTroDacBiet,
			target.Thang8 = source.Thang8,
			target.Thang9 = source.Thang9,
			target.Thang10 = source.Thang10,
			target.Thang11 = source.Thang11,
			target.Thang12 = source.Thang12,
			target.NhanXetHKI = source.NhanXetHKI,
			target.KetQuaHKI = source.KetQuaHKI,
			target.Thang1_2 = source.Thang1_2,
			target.Thang3 = source.Thang3,
			target.Thang4 = source.Thang4,
			target.Thang5 = source.Thang5,
			target.NhanXetCuoiNam = source.NhanXetCuoiNam,
			target.KetQuaCuoiNam = source.KetQuaCuoiNam,
			target.Enable = 1,
			target.UpdateUser = @UserID,
			target.UpdateTime = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (
			SoGVCNID, HSLopID, HocSinhID, CanHoTroDacBiet,
			Thang8, Thang9, Thang10, Thang11, Thang12, NhanXetHKI, KetQuaHKI,
			Thang1_2, Thang3, Thang4, Thang5, NhanXetCuoiNam, KetQuaCuoiNam,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID, source.HSLopID, source.HocSinhID, source.CanHoTroDacBiet,
			source.Thang8, source.Thang9, source.Thang10, source.Thang11, source.Thang12, source.NhanXetHKI, source.KetQuaHKI,
			source.Thang1_2, source.Thang3, source.Thang4, source.Thang5, source.NhanXetCuoiNam, source.KetQuaCuoiNam,
			@UserID, @UserID
		);

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNHsCanQuanTamSave] TO [lmslhbs];
