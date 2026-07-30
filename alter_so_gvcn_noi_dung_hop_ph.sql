IF NOT EXISTS (
	SELECT 1
	FROM sys.tables
	WHERE name = 'tblSoGVCNNoiDungHopPHHS'
)
BEGIN
	CREATE TABLE dbo.tblSoGVCNNoiDungHopPHHS (
		NoiDungHopID int IDENTITY(1,1) NOT NULL,
		SoGVCNID int NOT NULL,
		MeetingIndex int NOT NULL,
		DotHop nvarchar(255) NULL,
		ThoiGian nvarchar(255) NULL,
		DiaDiem nvarchar(255) NULL,
		NoiDungChinh nvarchar(max) NULL,
		YKienPHHS nvarchar(max) NULL,
		KetLuan nvarchar(max) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNNoiDungHopPHHS_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNNoiDungHopPHHS_CreateTime DEFAULT (GETDATE()),
		CreateUser int NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNNoiDungHopPHHS_UpdateTime DEFAULT (GETDATE()),
		UpdateUser int NULL,
		CONSTRAINT PK_tblSoGVCNNoiDungHopPHHS PRIMARY KEY CLUSTERED (NoiDungHopID ASC)
	);
END;
GO
