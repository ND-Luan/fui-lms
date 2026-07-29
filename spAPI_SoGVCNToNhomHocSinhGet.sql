CREATE OR ALTER PROCEDURE dbo.spAPI_SoGVCNToNhomHocSinhGet
	@url1_SoGVCNID varchar(10),
	@sys_UserID varchar(10),
	@sys_SystemRight varchar(10)
AS
BEGIN
	SET NOCOUNT ON;

	SELECT
		ToNhomHocSinhID,
		SoGVCNID,
		HSLopID,
		HocSinhID,
		MaHocSinh,
		HocSinh,
		ToNhom,
		NhiemVu,
		Ban,
		RowIndex
	FROM dbo.tblSoGVCNToNhomHocSinh
	WHERE SoGVCNID = TRY_CONVERT(int, @url1_SoGVCNID)
	  AND Enable = 1
	ORDER BY RowIndex, ToNhomHocSinhID;
END;
