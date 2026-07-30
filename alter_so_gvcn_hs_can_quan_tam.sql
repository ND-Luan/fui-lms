/*
	Tạo bảng tblSoGVCNHocSinhCanQuanTam lưu thông tin Hồ sơ theo dõi học sinh cần quan tâm của Sổ GVCN Cấp 1 (Tiểu học).
	Không dùng lưu JSON string. Triển khai có kiểm soát; không tự động thực thi.
*/

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.tblSoGVCNHocSinhCanQuanTam', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblSoGVCNHocSinhCanQuanTam
	(
		HsCanQuanTamID int IDENTITY(1,1) NOT NULL
			CONSTRAINT PK_tblSoGVCNHocSinhCanQuanTam PRIMARY KEY,
		SoGVCNID int NOT NULL,
		HSLopID int NOT NULL,
		HocSinhID int NULL,

		-- 1. HS cần hỗ trợ đặc biệt (ghi rõ vấn đề-nếu có)
		CanHoTroDacBiet nvarchar(max) NULL,

		-- 2. Ghi nhận / Theo dõi rèn luyện theo tháng (HKI)
		Thang8 nvarchar(max) NULL,
		Thang9 nvarchar(max) NULL,
		Thang10 nvarchar(max) NULL,
		Thang11 nvarchar(max) NULL,
		Thang12 nvarchar(max) NULL,
		NhanXetHKI nvarchar(max) NULL,
		KetQuaHKI nvarchar(500) NULL,

		-- 3. Ghi nhận / Theo dõi rèn luyện theo tháng (HKII & Cuối năm)
		Thang1_2 nvarchar(max) NULL,
		Thang3 nvarchar(max) NULL,
		Thang4 nvarchar(max) NULL,
		Thang5 nvarchar(max) NULL,
		NhanXetCuoiNam nvarchar(max) NULL,
		KetQuaCuoiNam nvarchar(500) NULL,

		Enable bit NOT NULL
			CONSTRAINT DF_tblSoGVCNHocSinhCanQuanTam_Enable DEFAULT (1),
		CreateUser varchar(9) NULL,
		CreateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNHocSinhCanQuanTam_CreateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNHocSinhCanQuanTam_UpdateTime DEFAULT (GETDATE()),
		CONSTRAINT FK_tblSoGVCNHocSinhCanQuanTam_SoGVCN
			FOREIGN KEY (SoGVCNID) REFERENCES dbo.tblSoGVCN(SoGVCNID),
		CONSTRAINT FK_tblSoGVCNHocSinhCanQuanTam_HSLop
			FOREIGN KEY (HSLopID) REFERENCES dbo.tblHocSinhLop(HSLopID)
	);

	CREATE UNIQUE INDEX UX_tblSoGVCNHocSinhCanQuanTam_SoGVCN_HSLop
		ON dbo.tblSoGVCNHocSinhCanQuanTam(SoGVCNID, HSLopID);
END;

COMMIT TRANSACTION;
