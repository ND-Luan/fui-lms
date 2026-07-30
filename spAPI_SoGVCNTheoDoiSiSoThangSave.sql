CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNTheoDoiSiSoThangSave
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
		THROW 50002, N'Dữ liệu theo dõi sĩ số tháng không hợp lệ.', 1;

	BEGIN TRANSACTION;

	MERGE dbo.tblSoGVCNTheoDoiSiSoThang AS target
	USING (
		SELECT
			JSON_VALUE(src.value, '$.ThoiDiem') AS ThoiDiem,
			JSON_VALUE(src.value, '$.TongSo') AS TongSo,
			JSON_VALUE(src.value, '$.Nu') AS Nu,
			JSON_VALUE(src.value, '$.DanTocJson') AS DanTocJson,
			JSON_VALUE(src.value, '$.DoiVien') AS DoiVien,
			JSON_VALUE(src.value, '$.NhiDong') AS NhiDong,
			JSON_VALUE(src.value, '$.ConLietSi') AS ConLietSi,
			JSON_VALUE(src.value, '$.ConThuongBinh') AS ConThuongBinh,
			JSON_VALUE(src.value, '$.KhuyetTatCoDanhGia') AS KhuyetTatCoDanhGia,
			JSON_VALUE(src.value, '$.KhuyetTatKhongDanhGia') AS KhuyetTatKhongDanhGia,
			JSON_VALUE(src.value, '$.HoNgheo') AS HoNgheo,
			JSON_VALUE(src.value, '$.TangGiamLiDo') AS TangGiamLiDo
		FROM OPENJSON(@JsonRows) AS src
		WHERE JSON_VALUE(src.value, '$.ThoiDiem') IS NOT NULL
	) AS source
	ON (target.SoGVCNID = @ID AND target.ThoiDiem = source.ThoiDiem)
	WHEN MATCHED THEN
		UPDATE SET
			target.TongSo = source.TongSo,
			target.Nu = source.Nu,
			target.DanTocJson = source.DanTocJson,
			target.DoiVien = source.DoiVien,
			target.NhiDong = source.NhiDong,
			target.ConLietSi = source.ConLietSi,
			target.ConThuongBinh = source.ConThuongBinh,
			target.KhuyetTatCoDanhGia = source.KhuyetTatCoDanhGia,
			target.KhuyetTatKhongDanhGia = source.KhuyetTatKhongDanhGia,
			target.HoNgheo = source.HoNgheo,
			target.TangGiamLiDo = source.TangGiamLiDo,
			target.Enable = 1,
			target.UpdateUser = @UserID,
			target.UpdateTime = GETDATE()
	WHEN NOT MATCHED THEN
		INSERT (
			SoGVCNID, ThoiDiem,
			TongSo, Nu, DanTocJson,
			DoiVien, NhiDong, ConLietSi, ConThuongBinh, KhuyetTatCoDanhGia, KhuyetTatKhongDanhGia, HoNgheo, TangGiamLiDo,
			CreateUser, UpdateUser
		)
		VALUES (
			@ID, source.ThoiDiem,
			source.TongSo, source.Nu, source.DanTocJson,
			source.DoiVien, source.NhiDong, source.ConLietSi, source.ConThuongBinh, source.KhuyetTatCoDanhGia, source.KhuyetTatKhongDanhGia, source.HoNgheo, source.TangGiamLiDo,
			@UserID, @UserID
		);

	COMMIT TRANSACTION;

	SELECT N'Thành công' AS [status];
END;
GO


GRANT EXECUTE ON [dbo].[spAPI_SoGVCNTheoDoiSiSoThangSave] TO [lmslhbs];
