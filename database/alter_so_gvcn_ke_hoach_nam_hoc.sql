/*
	Tạo bảng lưu Kế hoạch chủ nhiệm năm học của Sổ GVCN Tiểu học.
	Script triển khai có kiểm soát; không tự động thực thi.
*/

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.tblSoGVCNKeHoachNamHoc', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblSoGVCNKeHoachNamHoc
	(
		KeHoachNamHocID int IDENTITY(1,1) NOT NULL
			CONSTRAINT PK_tblSoGVCNKeHoachNamHoc PRIMARY KEY,
		SoGVCNID int NOT NULL,
		JsonData nvarchar(max) NOT NULL,
		Enable bit NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachNamHoc_Enable DEFAULT (1),
		CreateUser varchar(9) NULL,
		CreateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachNamHoc_CreateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachNamHoc_UpdateTime DEFAULT (GETDATE()),
		CONSTRAINT FK_tblSoGVCNKeHoachNamHoc_SoGVCN
			FOREIGN KEY (SoGVCNID) REFERENCES dbo.tblSoGVCN(SoGVCNID),
		CONSTRAINT CK_tblSoGVCNKeHoachNamHoc_JsonData
			CHECK (ISJSON(JsonData) = 1)
	);

	CREATE UNIQUE INDEX UX_tblSoGVCNKeHoachNamHoc_SoGVCNID
		ON dbo.tblSoGVCNKeHoachNamHoc(SoGVCNID);
END;

IF OBJECT_ID('dbo.tblSoGVCNKeHoachNamHocChiTieu', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblSoGVCNKeHoachNamHocChiTieu
	(
		KeHoachNamHocChiTieuID int IDENTITY(1,1) NOT NULL
			CONSTRAINT PK_tblSoGVCNKeHoachNamHocChiTieu PRIMARY KEY,
		SoGVCNID int NOT NULL,
		LopID varchar(10) NOT NULL,
		MonHocID int NOT NULL,

		Tot_SoLuong int NULL,
		Tot_TiLe decimal(5,2) NULL,
		Dat_SoLuong int NULL,
		Dat_TiLe decimal(5,2) NULL,
		CanCoGang_SoLuong int NULL,
		CanCoGang_TiLe decimal(5,2) NULL,

		HoanThanhTot_SoLuong int NULL,
		HoanThanhTot_TiLe decimal(5,2) NULL,
		HoanThanh_SoLuong int NULL,
		HoanThanh_TiLe decimal(5,2) NULL,
		ChuaHoanThanh_SoLuong int NULL,
		ChuaHoanThanh_TiLe decimal(5,2) NULL,

		CreateUser varchar(9) NULL,
		CreateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachNamHocChiTieu_CreateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachNamHocChiTieu_UpdateTime DEFAULT (GETDATE()),

		CONSTRAINT FK_tblSoGVCNKeHoachNamHocChiTieu_SoGVCN
			FOREIGN KEY (SoGVCNID) REFERENCES dbo.tblSoGVCN(SoGVCNID),
		CONSTRAINT FK_tblSoGVCNKeHoachNamHocChiTieu_Lop
			FOREIGN KEY (LopID) REFERENCES dbo.tblLop(LopID),
		CONSTRAINT FK_tblSoGVCNKeHoachNamHocChiTieu_MonHoc
			FOREIGN KEY (MonHocID) REFERENCES dbo.tblMonHoc(MonHocID),
		CONSTRAINT CK_tblSoGVCNKeHoachNamHocChiTieu_SoLuong
			CHECK (
				(Tot_SoLuong IS NULL OR Tot_SoLuong >= 0)
				AND (Dat_SoLuong IS NULL OR Dat_SoLuong >= 0)
				AND (CanCoGang_SoLuong IS NULL OR CanCoGang_SoLuong >= 0)
				AND (HoanThanhTot_SoLuong IS NULL OR HoanThanhTot_SoLuong >= 0)
				AND (HoanThanh_SoLuong IS NULL OR HoanThanh_SoLuong >= 0)
				AND (ChuaHoanThanh_SoLuong IS NULL OR ChuaHoanThanh_SoLuong >= 0)
			),
		CONSTRAINT CK_tblSoGVCNKeHoachNamHocChiTieu_TiLe
			CHECK (
				(Tot_TiLe IS NULL OR Tot_TiLe BETWEEN 0 AND 100)
				AND (Dat_TiLe IS NULL OR Dat_TiLe BETWEEN 0 AND 100)
				AND (CanCoGang_TiLe IS NULL OR CanCoGang_TiLe BETWEEN 0 AND 100)
				AND (HoanThanhTot_TiLe IS NULL OR HoanThanhTot_TiLe BETWEEN 0 AND 100)
				AND (HoanThanh_TiLe IS NULL OR HoanThanh_TiLe BETWEEN 0 AND 100)
				AND (ChuaHoanThanh_TiLe IS NULL OR ChuaHoanThanh_TiLe BETWEEN 0 AND 100)
			)
	);

	CREATE UNIQUE INDEX UX_tblSoGVCNKeHoachNamHocChiTieu_SoGVCN_Lop_MonHoc
		ON dbo.tblSoGVCNKeHoachNamHocChiTieu(SoGVCNID, LopID, MonHocID);

	CREATE INDEX IX_tblSoGVCNKeHoachNamHocChiTieu_Lop_MonHoc
		ON dbo.tblSoGVCNKeHoachNamHocChiTieu(LopID, MonHocID);
END;

IF OBJECT_ID('dbo.tblSoGVCNKeHoachNamHocThongKeLop', 'U') IS NULL
BEGIN
	CREATE TABLE dbo.tblSoGVCNKeHoachNamHocThongKeLop
	(
		KeHoachNamHocThongKeLopID int IDENTITY(1,1) NOT NULL
			CONSTRAINT PK_tblSoGVCNKeHoachNamHocThongKeLop PRIMARY KEY,
		SoGVCNID int NOT NULL,
		LopID varchar(10) NOT NULL,
		ThoiDiem nvarchar(100) NOT NULL,
		ThoiDiemCode varchar(20) NOT NULL,
		TongSo int NULL,
		Nu int NULL,
		DanToc int NULL,
		LuuBan int NULL,
		CanQuanTam int NULL,
		ConThuongBinh int NULL,
		ConLietSi int NULL,
		HoNgheo int NULL,
		HoCanNgheo int NULL,
		CBCCVC int NULL,
		GhiChu nvarchar(500) NULL,
		CreateUser varchar(9) NULL,
		CreateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachNamHocThongKeLop_CreateTime DEFAULT (GETDATE()),
		UpdateUser varchar(9) NULL,
		UpdateTime datetime NOT NULL
			CONSTRAINT DF_tblSoGVCNKeHoachNamHocThongKeLop_UpdateTime DEFAULT (GETDATE()),
		CONSTRAINT FK_tblSoGVCNKeHoachNamHocThongKeLop_SoGVCN
			FOREIGN KEY (SoGVCNID) REFERENCES dbo.tblSoGVCN(SoGVCNID),
		CONSTRAINT FK_tblSoGVCNKeHoachNamHocThongKeLop_Lop
			FOREIGN KEY (LopID) REFERENCES dbo.tblLop(LopID),
		CONSTRAINT CK_tblSoGVCNKeHoachNamHocThongKeLop_SoLuong
			CHECK (
				(TongSo IS NULL OR TongSo >= 0) AND (Nu IS NULL OR Nu >= 0)
				AND (DanToc IS NULL OR DanToc >= 0) AND (LuuBan IS NULL OR LuuBan >= 0)
				AND (CanQuanTam IS NULL OR CanQuanTam >= 0)
				AND (ConThuongBinh IS NULL OR ConThuongBinh >= 0)
				AND (ConLietSi IS NULL OR ConLietSi >= 0)
				AND (HoNgheo IS NULL OR HoNgheo >= 0)
				AND (HoCanNgheo IS NULL OR HoCanNgheo >= 0)
				AND (CBCCVC IS NULL OR CBCCVC >= 0)
			)
	);

	CREATE UNIQUE INDEX UX_tblSoGVCNKeHoachNamHocThongKeLop_SoGVCN_Lop_ThoiDiemCode
		ON dbo.tblSoGVCNKeHoachNamHocThongKeLop(SoGVCNID, LopID, ThoiDiemCode);

	CREATE INDEX IX_tblSoGVCNKeHoachNamHocThongKeLop_Lop_ThoiDiemCode
		ON dbo.tblSoGVCNKeHoachNamHocThongKeLop(LopID, ThoiDiemCode);
END;

COMMIT TRANSACTION;
