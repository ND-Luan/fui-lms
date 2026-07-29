CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNToNhomHocSinhSave
	@SoGVCNID varchar(10),
	@JsonRows nvarchar(max),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;

	DECLARE @ID int = TRY_CONVERT(int, @SoGVCNID);
	DECLARE @UserID int = TRY_CONVERT(int, @sys_UserID);

	IF @ID IS NULL OR NOT EXISTS (
		SELECT 1 FROM dbo.tblSoGVCN WHERE SoGVCNID = @ID AND Enable = 1
	)
		THROW 50001, N'Sổ GVCN không hợp lệ.', 1;

	BEGIN TRANSACTION;

	UPDATE dbo.tblSoGVCNToNhomHocSinh
	SET Enable = 0,
		UpdateUser = @UserID,
		UpdateTime = GETDATE()
	WHERE SoGVCNID = @ID
	  AND Enable = 1;

	INSERT INTO dbo.tblSoGVCNToNhomHocSinh
		(SoGVCNID, HSLopID, HocSinhID, MaHocSinh, HocSinh, ToNhom, NhiemVu, Ban,
		 RowIndex, CreateUser, UpdateUser)
	SELECT
		@ID,
		TRY_CONVERT(int, NULLIF(LTRIM(RTRIM(source.HSLopID)), N'')),
		TRY_CONVERT(int, NULLIF(LTRIM(RTRIM(source.HocSinhID)), N'')),
		source.MaHocSinh,
		source.HocSinh,
		source.ToNhom,
		source.NhiemVu,
		source.Ban,
		source.RowIndex,
		@UserID,
		@UserID
	FROM OPENJSON(ISNULL(@JsonRows, N'[]'))
	WITH (
		HSLopID nvarchar(30) '$.HSLopID',
		HocSinhID nvarchar(30) '$.HocSinhID',
		MaHocSinh varchar(30) '$.MaHocSinh',
		HocSinh nvarchar(200) '$.HocSinh',
		ToNhom nvarchar(100) '$.ToNhom',
		NhiemVu nvarchar(200) '$.NhiemVu',
		Ban nvarchar(200) '$.Ban',
		RowIndex int '$.RowIndex'
	) source
	WHERE NULLIF(LTRIM(RTRIM(CONCAT(source.ToNhom, source.NhiemVu, source.Ban))), N'') IS NOT NULL;

	UPDATE dbo.tblSoGVCN
	SET TrangThai = CASE WHEN TrangThai = 'NEW' THEN 'DRAFT' ELSE TrangThai END,
		UpdateUser = @sys_UserID,
		UpdateTime = GETDATE()
	WHERE SoGVCNID = @ID;

	COMMIT TRANSACTION;

	SELECT mess = N'Đã lưu danh sách học sinh theo tổ/nhóm', SoGVCNID = @ID;
END;
