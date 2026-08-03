CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNSoKetHKISave
	@SoGVCNID varchar(10),
	@JsonData nvarchar(max),
	@JsonDanhGia nvarchar(max) = NULL,
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

	BEGIN TRANSACTION;

	-- 1. Save text/notes & overview
	IF EXISTS (SELECT 1 FROM dbo.tblSoGVCNSoKetHKI WHERE SoGVCNID = @ID)
	BEGIN
		UPDATE dbo.tblSoGVCNSoKetHKI
		SET JsonData = ISNULL(@JsonData, JsonData),
			Enable = 1,
			UpdateUser = @UserID,
			UpdateTime = GETDATE()
		WHERE SoGVCNID = @ID;
	END
	ELSE IF @JsonData IS NOT NULL
	BEGIN
		INSERT INTO dbo.tblSoGVCNSoKetHKI
			(SoGVCNID, JsonData, CreateUser, UpdateUser)
		VALUES
			(@ID, @JsonData, @UserID, @UserID);
	END;

	-- 2. Save structured ratings table (Relational Rows)
	IF @JsonDanhGia IS NOT NULL AND ISJSON(@JsonDanhGia) = 1
	BEGIN
		MERGE dbo.tblSoGVCNSoKetHKIDanhGia AS target
		USING (
			SELECT
				JSON_VALUE(src.value, '$.LoaiDanhGia') AS LoaiDanhGia,
				TRY_CONVERT(int, JSON_VALUE(src.value, '$.MonHocID')) AS MonHocID,
				JSON_VALUE(src.value, '$.TieuChiCode') AS TieuChiCode,
				JSON_VALUE(src.value, '$.TenTieuChi') AS TenTieuChi,
				JSON_VALUE(src.value, '$.MucXepLoaiCode') AS MucXepLoaiCode,
				TRY_CONVERT(int, JSON_VALUE(src.value, '$.SoLuong')) AS SoLuong,
				TRY_CONVERT(decimal(5,2), JSON_VALUE(src.value, '$.TiLe')) AS TiLe
			FROM OPENJSON(@JsonDanhGia) AS src
		) AS source
		ON (
			target.SoGVCNID = @ID 
			AND target.LoaiDanhGia = source.LoaiDanhGia 
			AND ISNULL(target.MonHocID, 0) = ISNULL(source.MonHocID, 0)
			AND ISNULL(target.TieuChiCode, '') = ISNULL(source.TieuChiCode, '')
			AND target.MucXepLoaiCode = source.MucXepLoaiCode
		)
		WHEN MATCHED THEN
			UPDATE SET
				target.TenTieuChi = source.TenTieuChi,
				target.SoLuong = source.SoLuong,
				target.TiLe = source.TiLe,
				target.Enable = 1,
				target.UpdateUser = @UserID,
				target.UpdateTime = GETDATE()
		WHEN NOT MATCHED THEN
			INSERT (
				SoGVCNID, LoaiDanhGia, MonHocID, TieuChiCode, TenTieuChi,
				MucXepLoaiCode, SoLuong, TiLe, CreateUser, UpdateUser
			)
			VALUES (
				@ID, source.LoaiDanhGia, source.MonHocID, source.TieuChiCode, source.TenTieuChi,
				source.MucXepLoaiCode, source.SoLuong, source.TiLe, @UserID, @UserID
			);
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
