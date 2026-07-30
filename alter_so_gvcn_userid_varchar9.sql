SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @AuditColumns TABLE
(
	TableName sysname NOT NULL,
	ColumnName sysname NOT NULL
);

INSERT INTO @AuditColumns (TableName, ColumnName)
SELECT auditTable.TableName, auditColumn.ColumnName
FROM (VALUES
	(N'tblSoGVCNHocSinhCanQuanTam'),
	(N'tblSoGVCNHocSinhNhanXetThangLms'),
	(N'tblSoGVCNKeHoachNamHoc'),
	(N'tblSoGVCNKeHoachNamHocChiTieu'),
	(N'tblSoGVCNKeHoachNamHocThongKeLop'),
	(N'tblSoGVCNKeHoachTuan'),
	(N'tblSoGVCNNoiDungHopPHHS'),
	(N'tblSoGVCNSoKetHKI'),
	(N'tblSoGVCNTheoDoiPhuHuynhHop'),
	(N'tblSoGVCNTheoDoiSiSoThang'),
	(N'tblSoGVCNTheoDoiThanhTichHocSinh'),
	(N'tblSoGVCNThongKeDoTuoi'),
	(N'tblSoGVCNToNhomHocSinh'),
	(N'tblSoGVCNTongKetNamHocC1')
) auditTable(TableName)
CROSS JOIN (VALUES
	(N'CreateUser'),
	(N'UpdateUser')
) auditColumn(ColumnName);

DECLARE
	@TableName sysname,
	@ColumnName sysname,
	@Sql nvarchar(max);

DECLARE audit_column_cursor CURSOR LOCAL FAST_FORWARD FOR
SELECT target.TableName, target.ColumnName
FROM @AuditColumns target
JOIN sys.tables tbl
	ON tbl.name = target.TableName
	AND tbl.schema_id = SCHEMA_ID(N'dbo')
JOIN sys.columns col
	ON col.object_id = tbl.object_id
	AND col.name = target.ColumnName
JOIN sys.types typ
	ON typ.user_type_id = col.user_type_id
WHERE typ.name <> N'varchar'
	OR col.max_length <> 9;

OPEN audit_column_cursor;
FETCH NEXT FROM audit_column_cursor INTO @TableName, @ColumnName;

WHILE @@FETCH_STATUS = 0
BEGIN
	SET @Sql = N'ALTER TABLE [dbo].' + QUOTENAME(@TableName)
		+ N' ALTER COLUMN ' + QUOTENAME(@ColumnName) + N' varchar(9) NULL;';
	EXEC sys.sp_executesql @Sql;

	FETCH NEXT FROM audit_column_cursor INTO @TableName, @ColumnName;
END;

CLOSE audit_column_cursor;
DEALLOCATE audit_column_cursor;
