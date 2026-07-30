IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNThongKeDoTuoi'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNThongKeDoTuoi (
		ThongKeID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		AgeLabel nvarchar(255) NOT NULL,
		Nam nvarchar(255) NULL,
		Nu nvarchar(255) NULL,
		DanTocJson nvarchar(max) NULL,
		KhuyetTat nvarchar(255) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNThongKeDoTuoi_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNThongKeDoTuoi_CreateTime DEFAULT (GETDATE()),
		CreateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNThongKeDoTuoi_UpdateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		CONSTRAINT PK_tblSoGVCNThongKeDoTuoi PRIMARY KEY CLUSTERED (ThongKeID ASC)
	);
END;
GO

IF NOT EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNThongKeDoTuoi')
	  AND name = 'Nam'
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNThongKeDoTuoi ADD Nam nvarchar(255) NULL;
END;
GO

IF NOT EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNThongKeDoTuoi')
	  AND name = 'Nu'
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNThongKeDoTuoi ADD Nu nvarchar(255) NULL;
END;
GO

IF NOT EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNThongKeDoTuoi')
	  AND name = 'DanTocJson'
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNThongKeDoTuoi ADD DanTocJson nvarchar(max) NULL;
END;
GO

IF EXISTS (
	SELECT 1
	FROM sys.columns col
	JOIN sys.types typ ON typ.user_type_id = col.user_type_id
	WHERE col.object_id = OBJECT_ID('dbo.tblSoGVCNThongKeDoTuoi')
	  AND col.name = 'KhuyetTat'
	  AND (typ.name <> N'nvarchar' OR col.max_length <> 510)
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNThongKeDoTuoi
	ALTER COLUMN KhuyetTat nvarchar(255) NULL;
END;
GO
