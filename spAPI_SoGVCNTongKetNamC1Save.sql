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

	BEGIN TRANSACTION;

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

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNTongKetNamC1Save TO [lmslhbs];
