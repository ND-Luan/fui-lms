IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNTheoDoiSiSoThang'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNTheoDoiSiSoThang (
		TheoDoiSiSoID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		ThoiDiem nvarchar(100) NOT NULL,
		DoiVien int NULL,
		NhiDong int NULL,
		ConLietSi int NULL,
		ConThuongBinh int NULL,
		KhuyetTatCoDanhGia int NULL,
		KhuyetTatKhongDanhGia int NULL,
		HoNgheo int NULL,
		TangGiamLiDo nvarchar(max) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiSiSoThang_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiSiSoThang_CreateTime DEFAULT (GETDATE()),
		CreateUser int NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiSiSoThang_UpdateTime DEFAULT (GETDATE()),
		UpdateUser int NULL,
		CONSTRAINT PK_tblSoGVCNTheoDoiSiSoThang PRIMARY KEY CLUSTERED (TheoDoiSiSoID ASC)
	);
END;
GO

IF EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	  AND name = 'KhuyetTat'
)
BEGIN
	EXEC sp_rename 'dbo.tblSoGVCNTheoDoiSiSoThang.KhuyetTat', 'KhuyetTatCoDanhGia', 'COLUMN';
END;
GO

IF NOT EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	  AND name = 'KhuyetTatKhongDanhGia'
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang ADD KhuyetTatKhongDanhGia int NULL;
END;
GO
