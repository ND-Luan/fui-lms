IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNHocSinhNhanXetThangLms'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNHocSinhNhanXetThangLms (
		NhanXetThangLmsID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		HSLopID int NOT NULL,
		HocSinhID int NULL,
		Thang8 nvarchar(max) NULL,
		Thang9 nvarchar(max) NULL,
		Thang10 nvarchar(max) NULL,
		Thang11 nvarchar(max) NULL,
		Thang12 nvarchar(max) NULL,
		NhanXetHKI nvarchar(max) NULL,
		Thang1_2 nvarchar(max) NULL,
		Thang3 nvarchar(max) NULL,
		Thang4 nvarchar(max) NULL,
		Thang5 nvarchar(max) NULL,
		NhanXetHKII nvarchar(max) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNHocSinhNhanXetThangLms_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNHocSinhNhanXetThangLms_CreateTime DEFAULT (GETDATE()),
		CreateUser int NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNHocSinhNhanXetThangLms_UpdateTime DEFAULT (GETDATE()),
		UpdateUser int NULL,
		CONSTRAINT PK_tblSoGVCNHocSinhNhanXetThangLms PRIMARY KEY CLUSTERED (NhanXetThangLmsID ASC)
	);
END;
GO
