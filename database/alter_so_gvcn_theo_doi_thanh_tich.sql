IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNTheoDoiThanhTichHocSinh'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNTheoDoiThanhTichHocSinh (
		ThanhTichID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		HSLopID int NOT NULL,
		HocSinhID int NULL,
		HKI nvarchar(max) NULL,
		CuoiNam nvarchar(max) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiThanhTichHocSinh_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiThanhTichHocSinh_CreateTime DEFAULT (GETDATE()),
		CreateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiThanhTichHocSinh_UpdateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		CONSTRAINT PK_tblSoGVCNTheoDoiThanhTichHocSinh PRIMARY KEY CLUSTERED (ThanhTichID ASC)
	);
END;
GO
