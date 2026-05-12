USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_XetKetQuaRenLuyen_Upsert_JSON]    Script Date: 2026-05-11 8:39:57 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[spAPI_XetKetQuaRenLuyen_Upsert_JSON]
	@json NVARCHAR(MAX),
	@NienKhoa INT,
	@Sys_UserID VARCHAR(9)
AS
BEGIN
	SET NOCOUNT ON;

	-- Parse JSON array
	-- Giả sử mỗi object có: HocSinhID, LopID, KQRL_Sau
	-- Bạn có thể truyền thêm nếu muốn KQRL_Truoc

	-- Tạo bảng tạm từ JSON
	WITH ParsedData AS (
		SELECT 
			JSON_VALUE(value, '$.HocSinhID') AS HocSinhID,
			JSON_VALUE(value, '$.LopID') AS LopID,
			JSON_VALUE(value, '$.TenLop') AS TenLop,
			JSON_VALUE(value, '$.HocKi') AS HocKi,
			JSON_VALUE(value, '$.KQRL_Sau') AS KQRL_Sau,
			CASE LOWER(JSON_VALUE(value, '$.IsChotDiem'))
				WHEN 'true' THEN CAST(1 AS BIT)
				WHEN 'false' THEN CAST(0 AS BIT)
				WHEN '1' THEN CAST(1 AS BIT)
				WHEN '0' THEN CAST(0 AS BIT)
				ELSE NULL
			END AS IsChotDiem
		FROM OPENJSON(@json)
		WHERE JSON_VALUE(value, '$.KQRL_Sau') IS NOT NULL
			AND JSON_VALUE(value, '$.KQRL_Sau') != ''
	)

	-- Tiến hành UPSERT
	MERGE dbo.tblXetKetQuaRenLuyen AS Target
	USING ParsedData AS Source
	ON Target.HocSinhID		= Source.HocSinhID 
		AND Target.TenLop	= Source.TenLop 
		AND Target.HocKi	= Source.HocKi 
		and Target.NienKhoa = @NienKhoa 
	-- Nếu đã tồn tại thì cập nhật
	WHEN MATCHED THEN 
		UPDATE SET 
			Target.KQRL_Truoc = Target.KQRL_Sau,
			Target.KQRL_Sau = Source.KQRL_Sau,
			Target.IsChotDiem = ISNULL(Source.IsChotDiem, Target.IsChotDiem),
			Target.UpdateUser = @Sys_UserID,
			Target.UpdateTime = GETDATE()

	-- Nếu chưa có thì thêm mới
	WHEN NOT MATCHED THEN
		INSERT (HocSinhID, LopID, TenLop, HocKi, KQRL_Truoc, KQRL_Sau, NienKhoa, IsChotDiem, CreateUser, CreateTime)
		VALUES (Source.HocSinhID, Source.LopID, Source.TenLop, Source.HocKi, NULL, Source.KQRL_Sau, @NienKhoa, ISNULL(Source.IsChotDiem, 0), @Sys_UserID, GETDATE());
END
