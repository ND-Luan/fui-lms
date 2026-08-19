SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.tblSoGVCNKeHoachTuan', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblSoGVCNKeHoachTuan
	(
		KeHoachTuanID int IDENTITY(1, 1) NOT NULL
			CONSTRAINT PK_tblSoGVCNKeHoachTuan PRIMARY KEY,
		KeHoachThangID int NOT NULL,
		ThangThucTe tinyint NOT NULL,
		TuanTrongThang tinyint NOT NULL,
		TuNgay date NOT NULL,
		DenNgay date NOT NULL,
		KeHoachThucHien nvarchar(max) NULL,
		KetQua nvarchar(max) NULL,
		NguyenNhan nvarchar(max) NULL,
		Enable bit NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachTuan_Enable DEFAULT (1),
		CreateUser varchar(9) NULL,
		CreateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachTuan_CreateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachTuan_UpdateTime DEFAULT (GETDATE()),
		CONSTRAINT FK_tblSoGVCNKeHoachTuan_KeHoachThang
			FOREIGN KEY (KeHoachThangID)
			REFERENCES dbo.tblSoGVCNKeHoachThang(KeHoachThangID),
		CONSTRAINT CK_tblSoGVCNKeHoachTuan_Thang
			CHECK (ThangThucTe BETWEEN 1 AND 12),
		CONSTRAINT CK_tblSoGVCNKeHoachTuan_Tuan
			CHECK (TuanTrongThang BETWEEN 1 AND 6),
		CONSTRAINT CK_tblSoGVCNKeHoachTuan_Ngay
			CHECK (TuNgay <= DenNgay)
	);

	CREATE UNIQUE INDEX UX_tblSoGVCNKeHoachTuan_Thang_Tuan
		ON dbo.tblSoGVCNKeHoachTuan(KeHoachThangID, ThangThucTe, TuanTrongThang);

	CREATE INDEX IX_tblSoGVCNKeHoachTuan_Ngay
		ON dbo.tblSoGVCNKeHoachTuan(TuNgay, DenNgay)
		INCLUDE (KeHoachThangID, ThangThucTe, TuanTrongThang, Enable);
END;

COMMIT TRANSACTION;
GO
