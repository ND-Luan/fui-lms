CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTongKetNamC1Save
	@SoGVCNID varchar(10),
	@DuyTriSoLuong nvarchar(max) = NULL,
	@NangLucPhamChat nvarchar(max) = NULL,
	@KienThucKyNang nvarchar(max) = NULL,
	@HoanThanhCT nvarchar(max) = NULL,
	@PhongTraoKhac nvarchar(max) = NULL,
	@JsonSheet1 nvarchar(max) = NULL,
	@JsonSheet2 nvarchar(max) = NULL,
	@JsonSheet3 nvarchar(max) = NULL,
	@JsonSheet4 nvarchar(max) = NULL,
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

	-- 1. Overview text & sheet snapshots
	IF EXISTS (
		SELECT 1
		FROM dbo.tblSoGVCNTongKetNamHocC1
		WHERE SoGVCNID = @ID
		  AND Enable = 1
	)
	BEGIN
		UPDATE dbo.tblSoGVCNTongKetNamHocC1
		SET
			DuyTriSoLuong = @DuyTriSoLuong,
			NangLucPhamChat = @NangLucPhamChat,
			KienThucKyNang = @KienThucKyNang,
			HoanThanhCT = @HoanThanhCT,
			PhongTraoKhac = @PhongTraoKhac,
			JsonSheet1 = @JsonSheet1,
			JsonSheet2 = @JsonSheet2,
			JsonSheet3 = @JsonSheet3,
			JsonSheet4 = @JsonSheet4,
			UpdateUser = @UserID,
			UpdateTime = GETDATE()
		WHERE SoGVCNID = @ID
		  AND Enable = 1;
	END
	ELSE
	BEGIN
		INSERT INTO dbo.tblSoGVCNTongKetNamHocC1 (
			SoGVCNID,
			DuyTriSoLuong, NangLucPhamChat, KienThucKyNang,
			HoanThanhCT, PhongTraoKhac,
			JsonSheet1, JsonSheet2, JsonSheet3, JsonSheet4,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID,
			@DuyTriSoLuong, @NangLucPhamChat, @KienThucKyNang,
			@HoanThanhCT, @PhongTraoKhac,
			@JsonSheet1, @JsonSheet2, @JsonSheet3, @JsonSheet4,
			@UserID, @UserID
		);
	END;

	-- 2. Save structured ratings table (Relational Rows)
	IF @JsonDanhGia IS NOT NULL AND ISJSON(@JsonDanhGia) = 1
	BEGIN
		MERGE dbo.tblSoGVCNTongKetNamDanhGia AS target
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

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_SoGVCNTongKetNamC1Save] TO [lmslhbs];
