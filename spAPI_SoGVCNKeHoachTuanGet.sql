CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNKeHoachTuanGet
	@url1_SoGVCNID varchar(10),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT
		tuan.KeHoachTuanID,
		thang.SoGVCNID,
		thang.Thang,
		tuan.ThangThucTe,
		tuan.TuanTrongThang,
		tuan.TuNgay,
		tuan.DenNgay,
		tuan.KeHoachThucHien,
		tuan.KetQua,
		tuan.NguyenNhan
	FROM dbo.tblSoGVCNKeHoachTuan tuan
	JOIN dbo.tblSoGVCNKeHoachThang thang
	  ON thang.KeHoachThangID = tuan.KeHoachThangID
	WHERE thang.SoGVCNID = TRY_CONVERT(int, @url1_SoGVCNID)
	  AND thang.Enable = 1
	  AND tuan.Enable = 1
	ORDER BY
		CASE WHEN thang.Thang >= 8 THEN thang.Thang ELSE thang.Thang + 12 END,
		CASE WHEN tuan.ThangThucTe >= 8 THEN tuan.ThangThucTe ELSE tuan.ThangThucTe + 12 END,
		tuan.TuanTrongThang;
END;
GO

GRANT EXECUTE ON dbo.spAPI_SoGVCNKeHoachTuanGet TO [public];
GO
