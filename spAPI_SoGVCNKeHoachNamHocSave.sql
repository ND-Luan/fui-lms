CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNKeHoachNamHocSave
	@SoGVCNID varchar(10),
	@JsonData nvarchar(max),
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

	IF ISJSON(@JsonData) <> 1
		THROW 50002, N'Dữ liệu kế hoạch chủ nhiệm năm học không hợp lệ.', 1;

	BEGIN TRANSACTION;

	IF EXISTS (SELECT 1 FROM dbo.tblSoGVCNKeHoachNamHoc WHERE SoGVCNID = @ID)
	BEGIN
		UPDATE dbo.tblSoGVCNKeHoachNamHoc
		SET JsonData = @JsonData,
			Enable = 1,
			UpdateUser = @UserID,
			UpdateTime = GETDATE()
		WHERE SoGVCNID = @ID;
	END
	ELSE
	BEGIN
		INSERT INTO dbo.tblSoGVCNKeHoachNamHoc
			(SoGVCNID, JsonData, CreateUser, UpdateUser)
		VALUES
			(@ID, @JsonData, @UserID, @UserID);
	END;

	DELETE FROM dbo.tblSoGVCNKeHoachNamHocChiTieu
	WHERE SoGVCNID = @ID;

	INSERT INTO dbo.tblSoGVCNKeHoachNamHocChiTieu
	(
		SoGVCNID, LopID, MonHocID,
		Tot_SoLuong, Tot_TiLe, Dat_SoLuong, Dat_TiLe, CanCoGang_SoLuong, CanCoGang_TiLe,
		HoanThanhTot_SoLuong, HoanThanhTot_TiLe, HoanThanh_SoLuong, HoanThanh_TiLe,
		ChuaHoanThanh_SoLuong, ChuaHoanThanh_TiLe,
		CreateUser, UpdateUser
	)
	SELECT
		@ID, target.LopID, target.MonHocID,
		target.Tot_SoLuong, target.Tot_TiLe,
		target.Dat_SoLuong, target.Dat_TiLe,
		target.CanCoGang_SoLuong, target.CanCoGang_TiLe,
		target.HoanThanhTot_SoLuong, target.HoanThanhTot_TiLe,
		target.HoanThanh_SoLuong, target.HoanThanh_TiLe,
		target.ChuaHoanThanh_SoLuong, target.ChuaHoanThanh_TiLe,
		@UserID, @UserID
	FROM OPENJSON(@JsonData, '$.subjectTargets')
	WITH
	(
		LopID varchar(10) '$.LopID',
		MonHocID int '$.MonHocID',
		Tot_SoLuong int '$.Tot_SoLuong',
		Tot_TiLe decimal(5,2) '$.Tot_TiLe',
		Dat_SoLuong int '$.Dat_SoLuong',
		Dat_TiLe decimal(5,2) '$.Dat_TiLe',
		CanCoGang_SoLuong int '$.CanCoGang_SoLuong',
		CanCoGang_TiLe decimal(5,2) '$.CanCoGang_TiLe',
		HoanThanhTot_SoLuong int '$.HoanThanhTot_SoLuong',
		HoanThanhTot_TiLe decimal(5,2) '$.HoanThanhTot_TiLe',
		HoanThanh_SoLuong int '$.HoanThanh_SoLuong',
		HoanThanh_TiLe decimal(5,2) '$.HoanThanh_TiLe',
		ChuaHoanThanh_SoLuong int '$.ChuaHoanThanh_SoLuong',
		ChuaHoanThanh_TiLe decimal(5,2) '$.ChuaHoanThanh_TiLe'
	) AS target
	WHERE target.LopID IS NOT NULL
	  AND target.MonHocID IS NOT NULL;

	DELETE FROM dbo.tblSoGVCNKeHoachNamHocThongKeLop
	WHERE SoGVCNID = @ID;

	INSERT INTO dbo.tblSoGVCNKeHoachNamHocThongKeLop
	(
		SoGVCNID, LopID, ThoiDiem, ThoiDiemCode,
		TongSo, Nu, DanToc, LuuBan, CanQuanTam, ConThuongBinh, ConLietSi,
		HoNgheo, HoCanNgheo, CBCCVC, GhiChu, CreateUser, UpdateUser
	)
	SELECT
		@ID, statistic.LopID, statistic.ThoiDiem, statistic.ThoiDiemCode,
		statistic.TongSo, statistic.Nu, statistic.DanToc, statistic.LuuBan,
		statistic.CanQuanTam, statistic.ConThuongBinh, statistic.ConLietSi,
		statistic.HoNgheo, statistic.HoCanNgheo, statistic.CBCCVC,
		statistic.GhiChu, @UserID, @UserID
	FROM OPENJSON(@JsonData, '$.classStatistics')
	WITH
	(
		LopID varchar(10) '$.LopID',
		ThoiDiem nvarchar(100) '$.ThoiDiem',
		ThoiDiemCode varchar(20) '$.ThoiDiemCode',
		TongSo int '$.TongSo',
		Nu int '$.Nu',
		DanToc int '$.DanToc',
		LuuBan int '$.LuuBan',
		CanQuanTam int '$.CanQuanTam',
		ConThuongBinh int '$.ConThuongBinh',
		ConLietSi int '$.ConLietSi',
		HoNgheo int '$.HoNgheo',
		HoCanNgheo int '$.HoCanNgheo',
		CBCCVC int '$.CBCCVC',
		GhiChu nvarchar(500) '$.GhiChu'
	) AS statistic
	WHERE statistic.LopID IS NOT NULL
	  AND statistic.ThoiDiem IS NOT NULL
	  AND statistic.ThoiDiemCode IS NOT NULL;

	UPDATE dbo.tblSoGVCN
	SET TrangThai = CASE WHEN TrangThai = 'NEW' THEN 'DRAFT' ELSE TrangThai END,
		UpdateUser = @UserID,
		UpdateTime = GETDATE()
	WHERE SoGVCNID = @ID;

	COMMIT TRANSACTION;

	SELECT mess = N'Đã lưu kế hoạch chủ nhiệm năm học', SoGVCNID = @ID;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNKeHoachNamHocSave TO [public];
GO
