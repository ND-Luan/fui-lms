IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNTheoDoiPhuHuynhHop'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNTheoDoiPhuHuynhHop (
		TheoDoiPHHopID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		HSLopID int NOT NULL,
		HocSinhID int NULL,
		Lan1 bit NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiPhuHuynhHop_Lan1 DEFAULT (0),
		Lan2 bit NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiPhuHuynhHop_Lan2 DEFAULT (0),
		Lan3 bit NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiPhuHuynhHop_Lan3 DEFAULT (0),
		GhiChu nvarchar(max) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiPhuHuynhHop_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiPhuHuynhHop_CreateTime DEFAULT (GETDATE()),
		CreateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiPhuHuynhHop_UpdateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		CONSTRAINT PK_tblSoGVCNTheoDoiPhuHuynhHop PRIMARY KEY CLUSTERED (TheoDoiPHHopID ASC)
	);
END;
GO
