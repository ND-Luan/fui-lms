CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNKeHoachTuanSave
	@SoGVCNID varchar(10),
	@Thang varchar(2),
	@ThangThucTe varchar(2),
	@TuanTrongThang varchar(2),
	@TuNgay varchar(10),
	@DenNgay varchar(10),
	@KeHoachThucHien nvarchar(max),
	@KetQua nvarchar(max),
	@NguyenNhan nvarchar(max),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);
	DECLARE @Month tinyint = TRY_CONVERT(tinyint, @Thang);
	DECLARE @ActualMonth tinyint = TRY_CONVERT(tinyint, @ThangThucTe);
	DECLARE @Week tinyint = TRY_CONVERT(tinyint, @TuanTrongThang);
	DECLARE @FromDate date = TRY_CONVERT(date, @TuNgay, 23);
	DECLARE @ToDate date = TRY_CONVERT(date, @DenNgay, 23);
	DECLARE @KeHoachThangID int;

	IF @ID IS NULL
	   OR @Month NOT BETWEEN 1 AND 12
	   OR @ActualMonth NOT BETWEEN 1 AND 12
	   OR @Week NOT BETWEEN 1 AND 6
	   OR @FromDate IS NULL
	   OR @ToDate IS NULL
	   OR @FromDate > @ToDate
		THROW 50001, N'Dữ liệu kế hoạch tuần không hợp lệ.', 1;

	SELECT @KeHoachThangID = KeHoachThangID
	FROM dbo.tblSoGVCNKeHoachThang
	WHERE SoGVCNID = @ID
	  AND Thang = @Month
	  AND Enable = 1;

	IF @KeHoachThangID IS NULL
		THROW 50002, N'Chưa có kế hoạch tháng tương ứng.', 1;

	IF EXISTS (
		SELECT 1
		FROM dbo.tblSoGVCNKeHoachTuan
		WHERE KeHoachThangID = @KeHoachThangID
		  AND ThangThucTe = @ActualMonth
		  AND TuanTrongThang = @Week
	)
	BEGIN
		UPDATE dbo.tblSoGVCNKeHoachTuan
		SET
			TuNgay = @FromDate,
			DenNgay = @ToDate,
			KeHoachThucHien = NULLIF(LTRIM(RTRIM(@KeHoachThucHien)), N''),
			KetQua = NULLIF(LTRIM(RTRIM(@KetQua)), N''),
			NguyenNhan = NULLIF(LTRIM(RTRIM(@NguyenNhan)), N''),
			Enable = 1,
			UpdateUser = @sys_UserID,
			UpdateTime = GETDATE()
		WHERE KeHoachThangID = @KeHoachThangID
		  AND ThangThucTe = @ActualMonth
		  AND TuanTrongThang = @Week;
	END
	ELSE
	BEGIN
		INSERT INTO dbo.tblSoGVCNKeHoachTuan
			(KeHoachThangID, ThangThucTe, TuanTrongThang, TuNgay, DenNgay,
			 KeHoachThucHien, KetQua, NguyenNhan, CreateUser, UpdateUser)
		VALUES
			(@KeHoachThangID, @ActualMonth, @Week, @FromDate, @ToDate,
			 NULLIF(LTRIM(RTRIM(@KeHoachThucHien)), N''),
			 NULLIF(LTRIM(RTRIM(@KetQua)), N''),
			 NULLIF(LTRIM(RTRIM(@NguyenNhan)), N''),
			 @sys_UserID, @sys_UserID);
	END;

	SELECT
		mess = N'Đã lưu kế hoạch tuần',
		SoGVCNID = @ID,
		Thang = @Month,
		ThangThucTe = @ActualMonth,
		TuanTrongThang = @Week;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNKeHoachTuanSave TO [public];
GO
