IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNTongKetNamHocC1'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNTongKetNamHocC1 (
		TongKetID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		DuyTriSoLuong nvarchar(max) NULL,
		NangLucPhamChat nvarchar(max) NULL,
		KienThucKyNang nvarchar(max) NULL,
		HoanThanhCT nvarchar(max) NULL,
		PhongTraoKhac nvarchar(max) NULL,
		JsonSheet1 nvarchar(max) NULL,
		JsonSheet2 nvarchar(max) NULL,
		JsonSheet3 nvarchar(max) NULL,
		JsonSheet4 nvarchar(max) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNTongKetNamHocC1_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTongKetNamHocC1_CreateTime DEFAULT (GETDATE()),
		CreateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTongKetNamHocC1_UpdateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		CONSTRAINT PK_tblSoGVCNTongKetNamHocC1 PRIMARY KEY CLUSTERED (TongKetID ASC)
	);
END;
GO
