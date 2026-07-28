/*
	Chuẩn hóa dữ liệu Tổ chức lớp dùng chung cho Tiểu học và Trung học.
	Script chỉ dùng để triển khai có kiểm soát; không tự động thực thi.
*/

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.tblSoGVCNBanDaiDienCMHS', 'GhiChu') IS NULL
BEGIN
	ALTER TABLE dbo.tblSoGVCNBanDaiDienCMHS
	ADD GhiChu nvarchar(max) NULL;
END;

IF OBJECT_ID('dbo.tblSoGVCNToNhomHocSinh', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblSoGVCNToNhomHocSinh
	(
		ToNhomHocSinhID int IDENTITY(1,1) NOT NULL
			CONSTRAINT PK_tblSoGVCNToNhomHocSinh PRIMARY KEY,
		SoGVCNID int NOT NULL,
		HSLopID int NULL,
		HocSinhID int NULL,
		MaHocSinh varchar(30) NULL,
		HocSinh nvarchar(200) NULL,
		ToNhom nvarchar(100) NULL,
		NhiemVu nvarchar(200) NULL,
		Ban nvarchar(200) NULL,
		RowIndex int NULL,
		Enable bit NOT NULL
			CONSTRAINT DF_tblSoGVCNToNhomHocSinh_Enable DEFAULT (1),
		CreateUser int NULL,
		CreateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNToNhomHocSinh_CreateTime DEFAULT (GETDATE()),
		UpdateUser int NULL,
		UpdateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNToNhomHocSinh_UpdateTime DEFAULT (GETDATE()),
		CONSTRAINT FK_tblSoGVCNToNhomHocSinh_SoGVCN
			FOREIGN KEY (SoGVCNID) REFERENCES dbo.tblSoGVCN(SoGVCNID),
		CONSTRAINT FK_tblSoGVCNToNhomHocSinh_HSLop
			FOREIGN KEY (HSLopID) REFERENCES dbo.tblHocSinhLop(HSLopID),
		CONSTRAINT FK_tblSoGVCNToNhomHocSinh_HocSinh
			FOREIGN KEY (HocSinhID) REFERENCES dbo.tblHocSinh(HocSinhID)
	);

	CREATE INDEX IX_tblSoGVCNToNhomHocSinh_SoGVCNID_Enable
		ON dbo.tblSoGVCNToNhomHocSinh(SoGVCNID, Enable, RowIndex);
END;

-- Mô tả các cột có cách hiển thị khác nhau giữa các cấp học.
IF NOT EXISTS (
	SELECT 1 FROM sys.extended_properties
	WHERE major_id = OBJECT_ID('dbo.tblSoGVCNCanBoLop')
	  AND minor_id = COLUMNPROPERTY(OBJECT_ID('dbo.tblSoGVCNCanBoLop'), 'ChucVu', 'ColumnId')
	  AND name = 'MS_Description'
)
	EXEC sys.sp_addextendedproperty
		@name = N'MS_Description',
		@value = N'Vai trò của học sinh trong ban cán sự lớp. Trung học hiển thị là Chức vụ; Tiểu học hiển thị là Nhiệm vụ.',
		@level0type = N'SCHEMA', @level0name = N'dbo',
		@level1type = N'TABLE', @level1name = N'tblSoGVCNCanBoLop',
		@level2type = N'COLUMN', @level2name = N'ChucVu';

IF NOT EXISTS (
	SELECT 1 FROM sys.extended_properties
	WHERE major_id = OBJECT_ID('dbo.tblSoGVCNBanDaiDienCMHS')
	  AND minor_id = COLUMNPROPERTY(OBJECT_ID('dbo.tblSoGVCNBanDaiDienCMHS'), 'ChaMe', 'ColumnId')
	  AND name = 'MS_Description'
)
	EXEC sys.sp_addextendedproperty
		@name = N'MS_Description',
		@value = N'Họ tên phụ huynh hoặc người đại diện học sinh. Dùng chung cho Tiểu học và Trung học.',
		@level0type = N'SCHEMA', @level0name = N'dbo',
		@level1type = N'TABLE', @level1name = N'tblSoGVCNBanDaiDienCMHS',
		@level2type = N'COLUMN', @level2name = N'ChaMe';

IF NOT EXISTS (
	SELECT 1 FROM sys.extended_properties
	WHERE major_id = OBJECT_ID('dbo.tblSoGVCNBanDaiDienCMHS')
	  AND minor_id = COLUMNPROPERTY(OBJECT_ID('dbo.tblSoGVCNBanDaiDienCMHS'), 'NhiemVu', 'ColumnId')
	  AND name = 'MS_Description'
)
	EXEC sys.sp_addextendedproperty
		@name = N'MS_Description',
		@value = N'Vai trò trong ban đại diện cha mẹ học sinh, ví dụ Trưởng ban, Phó ban hoặc Thành viên.',
		@level0type = N'SCHEMA', @level0name = N'dbo',
		@level1type = N'TABLE', @level1name = N'tblSoGVCNBanDaiDienCMHS',
		@level2type = N'COLUMN', @level2name = N'NhiemVu';

IF NOT EXISTS (
	SELECT 1 FROM sys.extended_properties
	WHERE major_id = OBJECT_ID('dbo.tblSoGVCNBanDaiDienCMHS')
	  AND minor_id = COLUMNPROPERTY(OBJECT_ID('dbo.tblSoGVCNBanDaiDienCMHS'), 'GhiChu', 'ColumnId')
	  AND name = 'MS_Description'
)
	EXEC sys.sp_addextendedproperty
		@name = N'MS_Description',
		@value = N'Ghi chú bổ sung của ban đại diện CMHS; được hiển thị trực tiếp trên mẫu Tổ chức lớp Tiểu học.',
		@level0type = N'SCHEMA', @level0name = N'dbo',
		@level1type = N'TABLE', @level1name = N'tblSoGVCNBanDaiDienCMHS',
		@level2type = N'COLUMN', @level2name = N'GhiChu';

IF NOT EXISTS (
	SELECT 1 FROM sys.extended_properties
	WHERE major_id = OBJECT_ID('dbo.tblSoGVCNToNhomHocSinh')
	  AND minor_id = 0
	  AND name = 'MS_Description'
)
	EXEC sys.sp_addextendedproperty
		@name = N'MS_Description',
		@value = N'Danh sách phân tổ hoặc nhóm học sinh của một Sổ GVCN; cấu trúc dùng chung cho Tiểu học và Trung học.',
		@level0type = N'SCHEMA', @level0name = N'dbo',
		@level1type = N'TABLE', @level1name = N'tblSoGVCNToNhomHocSinh';

DECLARE @ColumnDescriptions TABLE
(
	ColumnName sysname,
	[Description] nvarchar(1000)
);

INSERT INTO @ColumnDescriptions (ColumnName, [Description])
VALUES
	(N'ToNhom', N'Tên hoặc số tổ/nhóm của học sinh, ví dụ Tổ 1 hoặc Nhóm 2.'),
	(N'NhiemVu', N'Nhiệm vụ của học sinh trong tổ/nhóm, ví dụ Tổ trưởng hoặc Tổ phó.'),
	(N'Ban', N'Ban hoạt động mà học sinh tham gia; để trống nếu không áp dụng.'),
	(N'RowIndex', N'Thứ tự hiển thị của học sinh theo mẫu sổ chủ nhiệm.');

DECLARE @ColumnName sysname;
DECLARE @Description nvarchar(1000);

DECLARE description_cursor CURSOR LOCAL FAST_FORWARD FOR
	SELECT ColumnName, [Description] FROM @ColumnDescriptions;

OPEN description_cursor;
FETCH NEXT FROM description_cursor INTO @ColumnName, @Description;

WHILE @@FETCH_STATUS = 0
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM sys.extended_properties
		WHERE major_id = OBJECT_ID('dbo.tblSoGVCNToNhomHocSinh')
		  AND minor_id = COLUMNPROPERTY(OBJECT_ID('dbo.tblSoGVCNToNhomHocSinh'), @ColumnName, 'ColumnId')
		  AND name = 'MS_Description'
	)
		EXEC sys.sp_addextendedproperty
			@name = N'MS_Description',
			@value = @Description,
			@level0type = N'SCHEMA', @level0name = N'dbo',
			@level1type = N'TABLE', @level1name = N'tblSoGVCNToNhomHocSinh',
			@level2type = N'COLUMN', @level2name = @ColumnName;

	FETCH NEXT FROM description_cursor INTO @ColumnName, @Description;
END;

CLOSE description_cursor;
DEALLOCATE description_cursor;

COMMIT TRANSACTION;
