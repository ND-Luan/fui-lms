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
		KhuyetTat int NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNThongKeDoTuoi_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNThongKeDoTuoi_CreateTime DEFAULT (GETDATE()),
		CreateUser int NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNThongKeDoTuoi_UpdateTime DEFAULT (GETDATE()),
		UpdateUser int NULL,
		CONSTRAINT PK_tblSoGVCNThongKeDoTuoi PRIMARY KEY CLUSTERED (ThongKeID ASC)
	);
END;
GO
