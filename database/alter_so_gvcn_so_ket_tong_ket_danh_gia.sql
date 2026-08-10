IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNSoKetHKIDanhGia'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNSoKetHKIDanhGia (
		DanhGiaID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		LoaiDanhGia varchar(20) NOT NULL, -- 'QUALITY' hoặc 'SUBJECT'
		MonHocID int NULL,
		TieuChiCode varchar(50) NULL,
		TenTieuChi nvarchar(255) NULL,
		MucXepLoaiCode varchar(50) NOT NULL,
		SoLuong int NULL,
		TiLe decimal(5,2) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNSoKetHKIDanhGia_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNSoKetHKIDanhGia_CreateTime DEFAULT (GETDATE()),
		CreateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNSoKetHKIDanhGia_UpdateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		CONSTRAINT PK_tblSoGVCNSoKetHKIDanhGia PRIMARY KEY CLUSTERED (DanhGiaID ASC),
		CONSTRAINT FK_tblSoGVCNSoKetHKIDanhGia_SoGVCN FOREIGN KEY (SoGVCNID) REFERENCES dbo.tblSoGVCN(SoGVCNID)
	);

	CREATE INDEX IX_tblSoGVCNSoKetHKIDanhGia_SoGVCNID
		ON dbo.tblSoGVCNSoKetHKIDanhGia(SoGVCNID);
END;
GO

IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNTongKetNamDanhGia'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNTongKetNamDanhGia (
		DanhGiaID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		LoaiDanhGia varchar(20) NOT NULL, -- 'QUALITY', 'SUBJECT', 'KET_QUA_GD', 'KHEN_THUONG'
		MonHocID int NULL,
		TieuChiCode varchar(50) NULL,
		TenTieuChi nvarchar(255) NULL,
		MucXepLoaiCode varchar(50) NOT NULL,
		SoLuong int NULL,
		TiLe decimal(5,2) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNTongKetNamDanhGia_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTongKetNamDanhGia_CreateTime DEFAULT (GETDATE()),
		CreateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTongKetNamDanhGia_UpdateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		CONSTRAINT PK_tblSoGVCNTongKetNamDanhGia PRIMARY KEY CLUSTERED (DanhGiaID ASC),
		CONSTRAINT FK_tblSoGVCNTongKetNamDanhGia_SoGVCN FOREIGN KEY (SoGVCNID) REFERENCES dbo.tblSoGVCN(SoGVCNID)
	);

	CREATE INDEX IX_tblSoGVCNTongKetNamDanhGia_SoGVCNID
		ON dbo.tblSoGVCNTongKetNamDanhGia(SoGVCNID);
END;
GO
