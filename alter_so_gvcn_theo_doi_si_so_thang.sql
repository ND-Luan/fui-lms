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
		TongSo nvarchar(255) NULL,
		Nu nvarchar(255) NULL,
		DanTocJson nvarchar(max) NULL,
		DoiVien nvarchar(255) NULL,
		NhiDong nvarchar(255) NULL,
		ConLietSi nvarchar(255) NULL,
		ConThuongBinh nvarchar(255) NULL,
		KhuyetTatCoDanhGia nvarchar(255) NULL,
		KhuyetTatKhongDanhGia nvarchar(255) NULL,
		HoNgheo nvarchar(255) NULL,
		TangGiamLiDo nvarchar(max) NULL,
		Enable bit NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiSiSoThang_Enable DEFAULT (1),
		CreateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiSiSoThang_CreateTime DEFAULT (GETDATE()),
		CreateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL CONSTRAINT DF_tblSoGVCNTheoDoiSiSoThang_UpdateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		CONSTRAINT PK_tblSoGVCNTheoDoiSiSoThang PRIMARY KEY CLUSTERED (TheoDoiSiSoID ASC)
	);
END;
GO

IF EXISTS (
	SELECT 1
	FROM sys.columns col
	JOIN sys.types typ ON typ.user_type_id = col.user_type_id
	WHERE col.object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	  AND col.name = 'CreateUser'
	  AND (typ.name <> 'varchar' OR col.max_length <> 9)
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang
	ALTER COLUMN CreateUser varchar(9) NULL;
END;
GO

IF EXISTS (
	SELECT 1
	FROM sys.columns col
	JOIN sys.types typ ON typ.user_type_id = col.user_type_id
	WHERE col.object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	  AND col.name = 'UpdateUser'
	  AND (typ.name <> 'varchar' OR col.max_length <> 9)
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang
	ALTER COLUMN UpdateUser varchar(9) NULL;
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
	ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang ADD KhuyetTatKhongDanhGia nvarchar(255) NULL;
END;
GO

DECLARE @TextColumns TABLE (ColumnName sysname);
INSERT INTO @TextColumns (ColumnName)
VALUES
	(N'TongSo'),
	(N'Nu'),
	(N'DoiVien'),
	(N'NhiDong'),
	(N'ConLietSi'),
	(N'ConThuongBinh'),
	(N'KhuyetTatCoDanhGia'),
	(N'KhuyetTatKhongDanhGia'),
	(N'HoNgheo');

DECLARE @ColumnName sysname;
DECLARE @AlterSql nvarchar(max);

DECLARE text_column_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT target.ColumnName
FROM @TextColumns target
JOIN sys.columns col
	ON col.object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	AND col.name = target.ColumnName
JOIN sys.types typ
	ON typ.user_type_id = col.user_type_id
WHERE typ.name <> N'nvarchar'
   OR col.max_length <> 510;

OPEN text_column_cursor;
FETCH NEXT FROM text_column_cursor INTO @ColumnName;

WHILE @@FETCH_STATUS = 0
BEGIN
	SET @AlterSql = N'ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang ALTER COLUMN '
		+ QUOTENAME(@ColumnName) + N' nvarchar(255) NULL;';
	EXEC sys.sp_executesql @AlterSql;

	FETCH NEXT FROM text_column_cursor INTO @ColumnName;
END;

CLOSE text_column_cursor;
DEALLOCATE text_column_cursor;
GO

IF NOT EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	  AND name = 'TongSo'
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang ADD TongSo nvarchar(255) NULL;
END;
GO

IF NOT EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	  AND name = 'Nu'
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang ADD Nu nvarchar(255) NULL;
END;
GO

IF NOT EXISTS (
	SELECT 1 FROM sys.columns
	WHERE object_id = OBJECT_ID('dbo.tblSoGVCNTheoDoiSiSoThang')
	  AND name = 'DanTocJson'
)
BEGIN
	ALTER TABLE dbo.tblSoGVCNTheoDoiSiSoThang ADD DanTocJson nvarchar(max) NULL;
END;
GO

UPDATE dbo.tblSoGVCNTheoDoiSiSoThang
SET ThoiDiem = CASE ThoiDiem
	WHEN N'Tháng 01' THEN N'Tháng 1'
	WHEN N'Tháng 02' THEN N'Tháng 2'
	ELSE ThoiDiem
END
WHERE ThoiDiem IN (N'Tháng 01', N'Tháng 02');
GO
