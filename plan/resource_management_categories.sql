USE [LMS-LHBS];
GO

/*
    PHÂN LOẠI KHO TÀI NGUYÊN
    - Loai = 'TAI_NGUYEN' trên tblHocLieu_FP vẫn giữ nguyên để tương thích.
    - TaiNguyenLoaiID xác định nghiệp vụ của bộ tài liệu.
    - TaiNguyenMucID dùng cho các nghiệp vụ có mức phân loại riêng.
*/

IF OBJECT_ID(N'dbo.tblFP_TaiNguyenLoai', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblFP_TaiNguyenLoai
    (
        TaiNguyenLoaiID INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_tblFP_TaiNguyenLoai PRIMARY KEY,
        Code VARCHAR(50) NOT NULL
            CONSTRAINT UQ_tblFP_TaiNguyenLoai_Code UNIQUE,
        TenLoai NVARCHAR(255) NOT NULL,
        KieuLoc VARCHAR(50) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_tblFP_TaiNguyenLoai_IsActive DEFAULT 1,
        ThuTu INT NOT NULL CONSTRAINT DF_tblFP_TaiNguyenLoai_ThuTu DEFAULT 0,
        CreateTime DATETIME NOT NULL CONSTRAINT DF_tblFP_TaiNguyenLoai_CreateTime DEFAULT GETDATE(),
        CONSTRAINT CK_tblFP_TaiNguyenLoai_KieuLoc CHECK (KieuLoc IN ('KHOI_MON', 'MUC_RIENG'))
    );
END;
GO

IF OBJECT_ID(N'dbo.tblFP_TaiNguyenMuc', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblFP_TaiNguyenMuc
    (
        TaiNguyenMucID INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_tblFP_TaiNguyenMuc PRIMARY KEY,
        TaiNguyenLoaiID INT NOT NULL,
        Code VARCHAR(50) NOT NULL,
        TenMuc NVARCHAR(255) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_tblFP_TaiNguyenMuc_IsActive DEFAULT 1,
        ThuTu INT NOT NULL CONSTRAINT DF_tblFP_TaiNguyenMuc_ThuTu DEFAULT 0,
        CONSTRAINT FK_tblFP_TaiNguyenMuc_Loai FOREIGN KEY (TaiNguyenLoaiID)
            REFERENCES dbo.tblFP_TaiNguyenLoai(TaiNguyenLoaiID),
        CONSTRAINT UQ_tblFP_TaiNguyenMuc_Loai_Code UNIQUE (TaiNguyenLoaiID, Code)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.tblHocLieu_FP') AND name = 'TaiNguyenLoaiID')
    ALTER TABLE dbo.tblHocLieu_FP ADD TaiNguyenLoaiID INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.tblHocLieu_FP') AND name = 'TaiNguyenMucID')
    ALTER TABLE dbo.tblHocLieu_FP ADD TaiNguyenMucID INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.tblNoiDungHocLieu_FP') AND name = 'NguonTaiNguyenCode')
    ALTER TABLE dbo.tblNoiDungHocLieu_FP ADD NguonTaiNguyenCode VARCHAR(50) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.tblNoiDungHocLieu_FP') AND name = 'NguonResourceType')
    ALTER TABLE dbo.tblNoiDungHocLieu_FP ADD NguonResourceType VARCHAR(50) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.tblNoiDungHocLieu_FP') AND name = 'NguonResourceID')
    ALTER TABLE dbo.tblNoiDungHocLieu_FP ADD NguonResourceID INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_tblHocLieu_FP_TaiNguyenLoai')
    ALTER TABLE dbo.tblHocLieu_FP ADD CONSTRAINT FK_tblHocLieu_FP_TaiNguyenLoai
        FOREIGN KEY (TaiNguyenLoaiID) REFERENCES dbo.tblFP_TaiNguyenLoai(TaiNguyenLoaiID);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_tblHocLieu_FP_TaiNguyenMuc')
    ALTER TABLE dbo.tblHocLieu_FP ADD CONSTRAINT FK_tblHocLieu_FP_TaiNguyenMuc
        FOREIGN KEY (TaiNguyenMucID) REFERENCES dbo.tblFP_TaiNguyenMuc(TaiNguyenMucID);
GO

INSERT INTO dbo.tblFP_TaiNguyenLoai (Code, TenLoai, KieuLoc, ThuTu)
SELECT 'SANG_KIEN', N'Sáng kiến', 'MUC_RIENG', 10
WHERE NOT EXISTS (SELECT 1 FROM dbo.tblFP_TaiNguyenLoai WHERE Code = 'SANG_KIEN');

INSERT INTO dbo.tblFP_TaiNguyenLoai (Code, TenLoai, KieuLoc, ThuTu)
SELECT 'TAI_LIEU_THAM_KHAO', N'Tài liệu chia sẻ/tham khảo', 'KHOI_MON', 20
WHERE NOT EXISTS (SELECT 1 FROM dbo.tblFP_TaiNguyenLoai WHERE Code = 'TAI_LIEU_THAM_KHAO');
GO

/* Mức ban đầu của Sáng kiến có thể bổ sung/sửa mà không đổi code giao diện. */
INSERT INTO dbo.tblFP_TaiNguyenMuc (TaiNguyenLoaiID, Code, TenMuc, ThuTu)
SELECT l.TaiNguyenLoaiID, v.Code, v.TenMuc, v.ThuTu
FROM dbo.tblFP_TaiNguyenLoai l
CROSS JOIN (VALUES
    ('CAP_TRUONG', N'Cấp trường', 10),
    ('CAP_HUYEN', N'Cấp huyện/quận', 20),
    ('CAP_TINH', N'Cấp tỉnh', 30)
) v(Code, TenMuc, ThuTu)
WHERE l.Code = 'SANG_KIEN'
  AND NOT EXISTS (
      SELECT 1 FROM dbo.tblFP_TaiNguyenMuc m
      WHERE m.TaiNguyenLoaiID = l.TaiNguyenLoaiID AND m.Code = v.Code
  );
GO

/* Tài nguyên cũ và kho upload tự động được xem là tài liệu tham khảo. */
UPDATE hl
SET TaiNguyenLoaiID = l.TaiNguyenLoaiID
FROM dbo.tblHocLieu_FP hl
INNER JOIN dbo.tblFP_TaiNguyenLoai l ON l.Code = 'TAI_LIEU_THAM_KHAO'
WHERE hl.Loai = 'TAI_NGUYEN' AND hl.TaiNguyenLoaiID IS NULL;
GO

/* Backfill nguồn file cũ; JSON vẫn được giữ nguyên để tương thích các màn hình cũ. */
UPDATE nd
SET NguonTaiNguyenCode = CASE
        WHEN JSON_VALUE(nd.DataJson, '$.origin') IN ('HOC_LIEU', 'LESSON') THEN 'HOC_LIEU'
        WHEN JSON_VALUE(nd.DataJson, '$.origin') IN ('GIAO_BAI', 'ASSIGNMENT') THEN 'GIAO_BAI'
        WHEN JSON_VALUE(nd.DataJson, '$.origin') IN ('RESOURCE_LIBRARY', 'QUAN_LY_TAI_NGUYEN') THEN 'QUAN_LY_TAI_NGUYEN'
        WHEN hl.TenHocLieu = N'Tài nguyên đã tải lên' THEN 'HOC_LIEU'
        ELSE 'QUAN_LY_TAI_NGUYEN'
    END
FROM dbo.tblNoiDungHocLieu_FP nd
INNER JOIN dbo.tblHocLieu_FP hl ON hl.HocLieuID = nd.HocLieuID
WHERE hl.Loai = 'TAI_NGUYEN'
  AND nd.LoaiNoiDung <> 'THU_MUC'
  AND nd.NguonTaiNguyenCode IS NULL;
GO

/* Sửa lại các file cũ đã bị gán mặc định Học liệu nhưng không có nguồn rõ ràng. */
UPDATE nd
SET NguonTaiNguyenCode = CASE
        WHEN hl.TenHocLieu = N'Tài nguyên đã tải lên' THEN 'HOC_LIEU'
        ELSE 'QUAN_LY_TAI_NGUYEN'
    END
FROM dbo.tblNoiDungHocLieu_FP nd
INNER JOIN dbo.tblHocLieu_FP hl ON hl.HocLieuID = nd.HocLieuID
WHERE hl.Loai = 'TAI_NGUYEN'
  AND nd.LoaiNoiDung <> 'THU_MUC'
  AND ISNULL(JSON_VALUE(nd.DataJson, '$.origin'), '') NOT IN ('HOC_LIEU', 'LESSON', 'GIAO_BAI', 'ASSIGNMENT', 'RESOURCE_LIBRARY', 'QUAN_LY_TAI_NGUYEN')
  AND nd.NguonTaiNguyenCode = 'HOC_LIEU';
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyenLoai_GetAll]
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BoSachID INT;
    SET @MonHocID = ISNULL(@MonHocID, 0);
    SET @KhoiID = ISNULL(@KhoiID, 0);
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    SELECT TaiNguyenLoaiID, Code, TenLoai, KieuLoc, IsActive, ThuTu
    FROM dbo.tblFP_TaiNguyenLoai
    WHERE IsActive = 1
    ORDER BY ThuTu, TenLoai;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyenLoai_GetAll] TO [lmslhbs];
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyenMuc_GetAll]
    @TaiNguyenLoaiID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TaiNguyenMucID, TaiNguyenLoaiID, Code, TenMuc, IsActive, ThuTu
    FROM dbo.tblFP_TaiNguyenMuc
    WHERE TaiNguyenLoaiID = @TaiNguyenLoaiID AND IsActive = 1
    ORDER BY ThuTu, TenMuc;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyenMuc_GetAll] TO [lmslhbs];
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_GetAll]
    @KhoiID INT = 0,
    @MonHocID INT = 0,
    @TaiNguyenLoaiID INT = 0,
    @TaiNguyenMucID INT = 0,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        hl.HocLieuID, hl.TenHocLieu, hl.BoSachID, hl.MonHocID, hl.KhoiID,
        hl.HocKy, hl.ThumbnailURL, hl.TinhTrang, hl.Loai,
        hl.TaiNguyenLoaiID, hl.TaiNguyenMucID,
        l.Code AS TaiNguyenLoaiCode, l.TenLoai, l.KieuLoc,
        m.Code AS TaiNguyenMucCode, m.TenMuc,
        hl.CreateUser, hl.CreateUser AS NguoiUploadID, hl.CreateTime, hl.UpdateTime,
        gv.HoGV + N' ' + gv.TenGV AS NguoiUploadName,
        mh.MonHocName AS TenMonHoc,
        (SELECT COUNT(*) FROM dbo.tblNoiDungHocLieu_FP nd
         WHERE nd.HocLieuID = hl.HocLieuID AND nd.Is_Xoa = 0
           AND nd.LoaiNoiDung <> 'THU_MUC') AS SoLuongFile
    FROM dbo.tblHocLieu_FP hl
    LEFT JOIN dbo.tblMonHoc mh ON mh.MonHocID = hl.MonHocID
    LEFT JOIN dbo.tblGiaoVien gv ON gv.GiaoVienID = hl.CreateUser
    LEFT JOIN dbo.tblFP_TaiNguyenLoai l ON l.TaiNguyenLoaiID = hl.TaiNguyenLoaiID
    LEFT JOIN dbo.tblFP_TaiNguyenMuc m ON m.TaiNguyenMucID = hl.TaiNguyenMucID
    WHERE hl.Is_Xoa = 0 AND hl.Loai = 'TAI_NGUYEN'
      AND (@sys_SystemRight IN (3, 9) OR hl.CreateUser = @sys_UserID)
      AND (ISNULL(@KhoiID, 0) = 0 OR hl.KhoiID = @KhoiID)
      AND (ISNULL(@MonHocID, 0) = 0 OR hl.MonHocID = @MonHocID)
      AND (ISNULL(@TaiNguyenLoaiID, 0) = 0 OR hl.TaiNguyenLoaiID = @TaiNguyenLoaiID)
      AND (ISNULL(@TaiNguyenMucID, 0) = 0 OR hl.TaiNguyenMucID = @TaiNguyenMucID)
    ORDER BY ISNULL(hl.UpdateTime, hl.CreateTime) DESC, hl.TenHocLieu;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_GetAll] TO [lmslhbs];
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Save]
    @HocLieuID INT = 0,
    @TenHocLieu NVARCHAR(255),
    @MonHocID INT = NULL,
    @KhoiID INT = NULL,
    @TaiNguyenLoaiID INT = NULL,
    @TaiNguyenMucID INT = NULL,
    @HocKy INT = NULL,
    @TinhTrang VARCHAR(50) = 'Private',
    @ThumbnailURL NVARCHAR(1000) = NULL,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @TaiNguyenLoaiID IS NULL
        SELECT @TaiNguyenLoaiID = TaiNguyenLoaiID
        FROM dbo.tblFP_TaiNguyenLoai WHERE Code = 'TAI_LIEU_THAM_KHAO';

    IF NOT EXISTS (SELECT 1 FROM dbo.tblFP_TaiNguyenLoai WHERE TaiNguyenLoaiID = @TaiNguyenLoaiID AND IsActive = 1)
        THROW 50101, N'Loại tài nguyên không hợp lệ.', 1;

    IF @TaiNguyenMucID IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM dbo.tblFP_TaiNguyenMuc
        WHERE TaiNguyenMucID = @TaiNguyenMucID AND TaiNguyenLoaiID = @TaiNguyenLoaiID AND IsActive = 1
    )
        THROW 50102, N'Mức tài nguyên không hợp lệ.', 1;

    IF ISNULL(@HocLieuID, 0) > 0
    BEGIN
        UPDATE dbo.tblHocLieu_FP
        SET TenHocLieu = @TenHocLieu, MonHocID = @MonHocID, KhoiID = @KhoiID,
            TaiNguyenLoaiID = @TaiNguyenLoaiID, TaiNguyenMucID = @TaiNguyenMucID,
            HocKy = @HocKy, TinhTrang = ISNULL(NULLIF(@TinhTrang, ''), 'Private'),
            ThumbnailURL = @ThumbnailURL, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
        WHERE HocLieuID = @HocLieuID AND Loai = 'TAI_NGUYEN'
          AND (@sys_SystemRight IN (3, 9) OR CreateUser = @sys_UserID) AND Is_Xoa = 0;

        IF @@ROWCOUNT = 0
            THROW 50103, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền cập nhật.', 1;
    END
    ELSE
    BEGIN
        SELECT TOP (1) @BoSachID = BoSachID
        FROM dbo.tblBoSach_FP
        WHERE Is_Xoa = 0
        ORDER BY BoSachID;

        IF @BoSachID IS NULL
            THROW 50104, N'Không tìm thấy bộ sách đang hoạt động để tạo bộ tài nguyên.', 1;

        INSERT INTO dbo.tblHocLieu_FP
            (TenHocLieu, BoSachID, MonHocID, KhoiID, TaiNguyenLoaiID, TaiNguyenMucID,
             HocKy, ThumbnailURL, TinhTrang, Loai, Is_Xoa, CreateUser, CreateTime)
        VALUES
            (@TenHocLieu, @BoSachID, @MonHocID, @KhoiID, @TaiNguyenLoaiID, @TaiNguyenMucID,
             @HocKy, @ThumbnailURL, ISNULL(NULLIF(@TinhTrang, ''), 'Private'),
             'TAI_NGUYEN', 0, @sys_UserID, GETDATE());
        SET @HocLieuID = SCOPE_IDENTITY();
    END;

    SELECT * FROM dbo.tblHocLieu_FP WHERE HocLieuID = @HocLieuID;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Save] TO [lmslhbs];
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Node_Save]
    @NoiDungID INT = 0,
    @HocLieuID INT,
    @ParentID INT = NULL,
    @TenNoiDung NVARCHAR(500),
    @LoaiNoiDung VARCHAR(50),
    @ThuTu INT = 0,
    @DataJson NVARCHAR(MAX) = NULL,
    @NguonTaiNguyenCode VARCHAR(50) = NULL,
    @NguonResourceType VARCHAR(50) = NULL,
    @NguonResourceID INT = NULL,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.tblHocLieu_FP
        WHERE HocLieuID = @HocLieuID AND Loai = 'TAI_NGUYEN'
          AND (@sys_SystemRight IN (3, 9) OR CreateUser = @sys_UserID) AND Is_Xoa = 0
    )
        THROW 50105, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền cập nhật.', 1;

    IF ISNULL(@ParentID, 0) = 0 SET @ParentID = NULL;
    IF ISNULL(@DataJson, '') <> '' AND ISJSON(@DataJson) = 0
        THROW 50106, N'Metadata tài nguyên không phải JSON hợp lệ.', 1;

    IF ISNULL(@NguonTaiNguyenCode, '') = '' AND @LoaiNoiDung <> 'THU_MUC'
        SET @NguonTaiNguyenCode = 'QUAN_LY_TAI_NGUYEN';

    IF ISNULL(@NoiDungID, 0) > 0
    BEGIN
        UPDATE dbo.tblNoiDungHocLieu_FP
        SET ParentID = @ParentID, TenNoiDung = @TenNoiDung, LoaiNoiDung = @LoaiNoiDung,
            ThuTu = @ThuTu, DataJson = @DataJson,
            NguonTaiNguyenCode = COALESCE(@NguonTaiNguyenCode, NguonTaiNguyenCode),
            NguonResourceType = COALESCE(@NguonResourceType, NguonResourceType),
            NguonResourceID = COALESCE(@NguonResourceID, NguonResourceID),
            UpdateUser = @sys_UserID, UpdateTime = GETDATE()
        WHERE NoiDungID = @NoiDungID AND HocLieuID = @HocLieuID AND Is_Xoa = 0;
        IF @@ROWCOUNT = 0 THROW 50107, N'Không tìm thấy mục tài nguyên.', 1;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.tblNoiDungHocLieu_FP
            (HocLieuID, ParentID, TenNoiDung, LoaiNoiDung, ThuTu, DataJson,
             NguonTaiNguyenCode, NguonResourceType, NguonResourceID,
             Is_Xoa, CreateUser, CreateTime)
        VALUES
            (@HocLieuID, @ParentID, @TenNoiDung, @LoaiNoiDung, @ThuTu, @DataJson,
             @NguonTaiNguyenCode, @NguonResourceType, @NguonResourceID,
             0, @sys_UserID, GETDATE());
        SET @NoiDungID = SCOPE_IDENTITY();
    END;

    SELECT * FROM dbo.tblNoiDungHocLieu_FP WHERE NoiDungID = @NoiDungID;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Node_Save] TO [lmslhbs];
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_GetTree]
    @HocLieuID INT,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.tblHocLieu_FP
        WHERE HocLieuID = @HocLieuID AND Loai = 'TAI_NGUYEN'
          AND (@sys_SystemRight IN (3, 9) OR CreateUser = @sys_UserID) AND Is_Xoa = 0
    )
        THROW 50108, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền truy cập.', 1;

    SELECT NoiDungID, HocLieuID, ParentID, TenNoiDung, LoaiNoiDung, ThuTu, DataJson,
           NguonTaiNguyenCode, NguonResourceType, NguonResourceID,
           CreateUser, CreateTime, UpdateTime
    FROM dbo.tblNoiDungHocLieu_FP
    WHERE HocLieuID = @HocLieuID AND Is_Xoa = 0
    ORDER BY ISNULL(ParentID, 0), ThuTu, TenNoiDung;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_GetTree] TO [lmslhbs];
GO

/* Giữ nguyên luồng upload bài học/bài tập: kho tự sinh thuộc tài liệu tham khảo. */
CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_File_Register]
    @KhoiID INT = NULL,
    @MonHocID INT = NULL,
    @BoSachID INT = NULL,
    @TenNoiDung NVARCHAR(500),
    @LoaiNoiDung VARCHAR(50),
    @DataJson NVARCHAR(MAX),
    @NguonTaiNguyenCode VARCHAR(50) = 'HOC_LIEU',
    @NguonResourceType VARCHAR(50) = NULL,
    @NguonResourceID INT = NULL,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ISJSON(@DataJson) = 0
        THROW 50104, N'Metadata file không phải JSON hợp lệ.', 1;

    DECLARE @HocLieuID INT, @TenKho NVARCHAR(255) = N'Tài nguyên đã tải lên';
    DECLARE @TaiNguyenLoaiID INT;
    SELECT @TaiNguyenLoaiID = TaiNguyenLoaiID FROM dbo.tblFP_TaiNguyenLoai WHERE Code = 'TAI_LIEU_THAM_KHAO';

    /* BoSachID là bắt buộc ở tblHocLieu_FP; 0/null được quy về bộ sách đang hoạt động. */
    SET @BoSachID = NULLIF(@BoSachID, 0);
    IF @BoSachID IS NULL
        SELECT TOP (1) @BoSachID = BoSachID
        FROM dbo.tblBoSach_FP
        WHERE Is_Xoa = 0
        ORDER BY BoSachID;

    IF @BoSachID IS NULL
        THROW 50105, N'Không tìm thấy bộ sách đang hoạt động để tạo kho tài nguyên.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.tblBoSach_FP WHERE BoSachID = @BoSachID AND Is_Xoa = 0)
        THROW 50106, N'Bộ sách không hợp lệ hoặc đã bị xóa.', 1;

    BEGIN TRANSACTION;
    SELECT TOP (1) @HocLieuID = HocLieuID
    FROM dbo.tblHocLieu_FP WITH (UPDLOCK, HOLDLOCK)
    WHERE Loai = 'TAI_NGUYEN' AND CreateUser = @sys_UserID AND Is_Xoa = 0
      AND ISNULL(KhoiID, -1) = ISNULL(@KhoiID, -1)
      AND ISNULL(MonHocID, -1) = ISNULL(@MonHocID, -1)
      AND TenHocLieu = @TenKho;

    IF @HocLieuID IS NULL
    BEGIN
        INSERT INTO dbo.tblHocLieu_FP
            (TenHocLieu, BoSachID, MonHocID, KhoiID, TaiNguyenLoaiID, TinhTrang, Loai, Is_Xoa, CreateUser, CreateTime)
        VALUES (@TenKho, @BoSachID, @MonHocID, @KhoiID, @TaiNguyenLoaiID, 'Private', 'TAI_NGUYEN', 0, @sys_UserID, GETDATE());
        SET @HocLieuID = SCOPE_IDENTITY();
    END
    ELSE IF EXISTS (SELECT 1 FROM dbo.tblHocLieu_FP WHERE HocLieuID = @HocLieuID AND TaiNguyenLoaiID IS NULL)
    BEGIN
        UPDATE dbo.tblHocLieu_FP SET TaiNguyenLoaiID = @TaiNguyenLoaiID WHERE HocLieuID = @HocLieuID;
    END;

    DECLARE @FileID VARCHAR(100) = JSON_VALUE(@DataJson, '$.fileId');
    DECLARE @SourceNoiDungID INT = TRY_CAST(JSON_VALUE(@DataJson, '$.sourceNoiDungID') AS INT);
    DECLARE @NoiDungID INT;
    SELECT TOP (1) @NoiDungID = NoiDungID FROM dbo.tblNoiDungHocLieu_FP
    WHERE HocLieuID = @HocLieuID AND Is_Xoa = 0 AND JSON_VALUE(DataJson, '$.fileId') = @FileID
      AND (@SourceNoiDungID IS NULL OR TRY_CAST(JSON_VALUE(DataJson, '$.sourceNoiDungID') AS INT) = @SourceNoiDungID)
    ORDER BY NoiDungID;

    IF @NoiDungID IS NOT NULL
    BEGIN
        COMMIT TRANSACTION;
        SELECT @HocLieuID AS HocLieuID, @NoiDungID AS NoiDungID;
        RETURN;
    END;

    INSERT INTO dbo.tblNoiDungHocLieu_FP
        (HocLieuID, ParentID, TenNoiDung, LoaiNoiDung, ThuTu, DataJson,
         NguonTaiNguyenCode, NguonResourceType, NguonResourceID,
         Is_Xoa, CreateUser, CreateTime)
    SELECT @HocLieuID, NULL, @TenNoiDung, @LoaiNoiDung, ISNULL(MAX(ThuTu), -1) + 1,
           @DataJson, @NguonTaiNguyenCode, @NguonResourceType, @NguonResourceID,
           0, @sys_UserID, GETDATE()
    FROM dbo.tblNoiDungHocLieu_FP
    WHERE HocLieuID = @HocLieuID AND ParentID IS NULL AND Is_Xoa = 0;

    SET @NoiDungID = SCOPE_IDENTITY();
    COMMIT TRANSACTION;
    SELECT @HocLieuID AS HocLieuID, @NoiDungID AS NoiDungID;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_File_Register] TO [lmslhbs];
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Delete]
    @HocLieuID INT,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    UPDATE dbo.tblHocLieu_FP
    SET Is_Xoa = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
    WHERE HocLieuID = @HocLieuID
      AND Loai = 'TAI_NGUYEN'
      AND (@sys_SystemRight IN (3, 9) OR CreateUser = @sys_UserID)
      AND Is_Xoa = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50109, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền xóa.', 1;
    END;

    UPDATE dbo.tblNoiDungHocLieu_FP
    SET Is_Xoa = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
    WHERE HocLieuID = @HocLieuID AND Is_Xoa = 0;

    COMMIT TRANSACTION;
    SELECT Success = 1;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Delete] TO [lmslhbs];
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Node_Delete]
    @NoiDungID INT,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @HocLieuID INT;
    SELECT @HocLieuID = nd.HocLieuID
    FROM dbo.tblNoiDungHocLieu_FP nd
    INNER JOIN dbo.tblHocLieu_FP hl ON hl.HocLieuID = nd.HocLieuID
    WHERE nd.NoiDungID = @NoiDungID
      AND nd.Is_Xoa = 0
      AND hl.Loai = 'TAI_NGUYEN'
      AND (@sys_SystemRight IN (3, 9) OR hl.CreateUser = @sys_UserID)
      AND hl.Is_Xoa = 0;

    IF @HocLieuID IS NULL
        THROW 50110, N'Không tìm thấy mục tài nguyên hoặc bạn không có quyền xóa.', 1;

    DECLARE @NodesToDelete TABLE (NoiDungID INT PRIMARY KEY);
    DECLARE @FileIDs TABLE (FileID VARCHAR(100) PRIMARY KEY);

    ;WITH NodesToDelete AS (
        SELECT NoiDungID
        FROM dbo.tblNoiDungHocLieu_FP
        WHERE NoiDungID = @NoiDungID
        UNION ALL
        SELECT child.NoiDungID
        FROM dbo.tblNoiDungHocLieu_FP child
        INNER JOIN NodesToDelete parent ON child.ParentID = parent.NoiDungID
        WHERE child.HocLieuID = @HocLieuID AND child.Is_Xoa = 0
    )
    INSERT INTO @NodesToDelete (NoiDungID)
    SELECT NoiDungID FROM NodesToDelete;

    INSERT INTO @FileIDs (FileID)
    SELECT DISTINCT CASE WHEN ISJSON(nd.DataJson) = 1 THEN JSON_VALUE(nd.DataJson, '$.fileId') END
    FROM dbo.tblNoiDungHocLieu_FP nd
    INNER JOIN @NodesToDelete deletedNode ON deletedNode.NoiDungID = nd.NoiDungID
    WHERE nd.NguonTaiNguyenCode = 'QUAN_LY_TAI_NGUYEN'
      AND NULLIF(CASE WHEN ISJSON(nd.DataJson) = 1 THEN JSON_VALUE(nd.DataJson, '$.fileId') END, '') IS NOT NULL;

    UPDATE dbo.tblNoiDungHocLieu_FP
    SET Is_Xoa = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
    WHERE NoiDungID IN (SELECT NoiDungID FROM @NodesToDelete);

    DELETE fd
    FROM dbo.FileData fd
    INNER JOIN @FileIDs fileItem ON fileItem.FileID = fd.FileID
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.tblNoiDungHocLieu_FP nd
        WHERE nd.Is_Xoa = 0
          AND CASE WHEN ISJSON(nd.DataJson) = 1 THEN JSON_VALUE(nd.DataJson, '$.fileId') END = fileItem.FileID
    )
      AND NOT EXISTS (
        SELECT 1
        FROM dbo.tblEL_Lessons l
        INNER JOIN dbo.tblEL_Elements e ON e.LessonID = l.LessonID AND e.IsDeleted = 0
        WHERE l.IsDeleted = 0
          AND CHARINDEX('"' + fileItem.FileID + '"', CONVERT(NVARCHAR(MAX), e.ElementData)) > 0
    )
      AND NOT EXISTS (
        SELECT 1
        FROM dbo.tblEL_Assignments a
        WHERE a.IsDeleted = 0
          AND CHARINDEX('"' + fileItem.FileID + '"', CONVERT(NVARCHAR(MAX), a.AssignmentConfig)) > 0
    );

    COMMIT TRANSACTION;

    SELECT Success = 1;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Node_Delete] TO [lmslhbs];
GO

/* Lấy đúng file/source file từ Học liệu và Giao bài, không trả về bản ghi bài học/bài tập. */
CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_SourceFile_GetAll]
    @KhoiID INT = 0,
    @MonHocID INT = 0,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH SourceFiles AS
    (
        SELECT
            l.LessonID AS ResourceID,
            'LESSON' AS ResourceType,
            'HOC_LIEU' AS NguonTaiNguyenCode,
            COALESCE(NULLIF(src.LmsFileID, ''), src.OriginalFileID) AS FileID,
            src.FileName,
            CASE WHEN NULLIF(src.LmsFileID, '') IS NULL THEN src.FileURL ELSE '/FileData/' + src.LmsFileID END AS FileURL,
            src.ContentType,
            COALESCE(src.FileSize, src.SourceSize) AS FileSize,
            l.KhoiID,
            l.MonHocID,
            l.CreateUser AS NguoiUploadID,
            l.CreateTime,
            l.Title AS ContentTitle,
            l.Chuong AS ContentChapter,
            e.ElementType,
            e.SortOrder AS ElementSortOrder
        FROM dbo.tblEL_Lessons l
        INNER JOIN dbo.tblEL_Elements e ON e.LessonID = l.LessonID AND e.IsDeleted = 0
        CROSS APPLY OPENJSON(e.ElementData, '$.sources')
        WITH
        (
            OriginalFileID NVARCHAR(500) '$.id',
            LmsFileID NVARCHAR(500) '$.resourceFileId',
            FileName NVARCHAR(500) '$.name',
            FileURL NVARCHAR(2000) '$.source',
            ContentType NVARCHAR(100) '$.contentType',
            FileSize BIGINT '$.fileSize',
            SourceSize BIGINT '$.size'
        ) src
        WHERE l.IsDeleted = 0
          AND (@sys_SystemRight IN (3, 9) OR l.CreateUser = @sys_UserID)

        UNION ALL

        SELECT
            a.AssignmentID,
            'ASSIGNMENT',
            'GIAO_BAI',
            COALESCE(NULLIF(src.LmsFileID, ''), src.OriginalFileID),
            src.FileName,
            CASE WHEN NULLIF(src.LmsFileID, '') IS NULL THEN src.FileURL ELSE '/FileData/' + src.LmsFileID END,
            src.ContentType,
            COALESCE(src.FileSize, src.SourceSize),
            a.KhoiID,
            a.MonHocID,
            a.CreateUser,
            a.CreateTime,
            a.Title,
            NULL,
            NULL,
            NULL
        FROM dbo.tblEL_Assignments a
        CROSS APPLY OPENJSON(a.AssignmentConfig, '$.groups') g
        CROSS APPLY OPENJSON(JSON_QUERY(g.value, '$.media.sourceFiles.file'))
        WITH
        (
            OriginalFileID NVARCHAR(500) '$.id',
            LmsFileID NVARCHAR(500) '$.resourceFileId',
            FileName NVARCHAR(500) '$.name',
            FileURL NVARCHAR(2000) '$.source',
            ContentType NVARCHAR(100) '$.contentType',
            FileSize BIGINT '$.fileSize',
            SourceSize BIGINT '$.size'
        ) src
        WHERE a.IsDeleted = 0
          AND (@sys_SystemRight IN (3, 9) OR a.CreateUser = @sys_UserID)

        UNION ALL

        SELECT
            a.AssignmentID,
            'ASSIGNMENT',
            'GIAO_BAI',
            COALESCE(NULLIF(src.LmsFileID, ''), src.OriginalFileID),
            src.FileName,
            CASE WHEN NULLIF(src.LmsFileID, '') IS NULL THEN src.FileURL ELSE '/FileData/' + src.LmsFileID END,
            src.ContentType,
            COALESCE(src.FileSize, src.SourceSize),
            a.KhoiID,
            a.MonHocID,
            a.CreateUser,
            a.CreateTime,
            a.Title,
            NULL,
            NULL,
            NULL
        FROM dbo.tblEL_Assignments a
        CROSS APPLY OPENJSON(a.AssignmentConfig, '$.groups') g
        CROSS APPLY OPENJSON(JSON_QUERY(g.value, '$.media.sourceFiles.image'))
        WITH
        (
            OriginalFileID NVARCHAR(500) '$.id',
            LmsFileID NVARCHAR(500) '$.resourceFileId',
            FileName NVARCHAR(500) '$.name',
            FileURL NVARCHAR(2000) '$.source',
            ContentType NVARCHAR(100) '$.contentType',
            FileSize BIGINT '$.fileSize',
            SourceSize BIGINT '$.size'
        ) src
        WHERE a.IsDeleted = 0
          AND (@sys_SystemRight IN (3, 9) OR a.CreateUser = @sys_UserID)

        UNION ALL

        SELECT
            a.AssignmentID,
            'ASSIGNMENT',
            'GIAO_BAI',
            COALESCE(NULLIF(src.LmsFileID, ''), src.OriginalFileID),
            src.FileName,
            CASE WHEN NULLIF(src.LmsFileID, '') IS NULL THEN src.FileURL ELSE '/FileData/' + src.LmsFileID END,
            src.ContentType,
            COALESCE(src.FileSize, src.SourceSize),
            a.KhoiID,
            a.MonHocID,
            a.CreateUser,
            a.CreateTime,
            a.Title,
            NULL,
            NULL,
            NULL
        FROM dbo.tblEL_Assignments a
        CROSS APPLY OPENJSON(a.AssignmentConfig, '$.groups') g
        CROSS APPLY OPENJSON(g.value, '$.questions') q
        CROSS APPLY OPENJSON(JSON_QUERY(q.value, '$.config.media.sourceFiles.file'))
        WITH
        (
            OriginalFileID NVARCHAR(500) '$.id',
            LmsFileID NVARCHAR(500) '$.resourceFileId',
            FileName NVARCHAR(500) '$.name',
            FileURL NVARCHAR(2000) '$.source',
            ContentType NVARCHAR(100) '$.contentType',
            FileSize BIGINT '$.fileSize',
            SourceSize BIGINT '$.size'
        ) src
        WHERE a.IsDeleted = 0
          AND (@sys_SystemRight IN (3, 9) OR a.CreateUser = @sys_UserID)

        UNION ALL

        SELECT
            a.AssignmentID,
            'ASSIGNMENT',
            'GIAO_BAI',
            COALESCE(NULLIF(src.LmsFileID, ''), src.OriginalFileID),
            src.FileName,
            CASE WHEN NULLIF(src.LmsFileID, '') IS NULL THEN src.FileURL ELSE '/FileData/' + src.LmsFileID END,
            src.ContentType,
            COALESCE(src.FileSize, src.SourceSize),
            a.KhoiID,
            a.MonHocID,
            a.CreateUser,
            a.CreateTime,
            a.Title,
            NULL,
            NULL,
            NULL
        FROM dbo.tblEL_Assignments a
        CROSS APPLY OPENJSON(a.AssignmentConfig, '$.groups') g
        CROSS APPLY OPENJSON(g.value, '$.questions') q
        CROSS APPLY OPENJSON(JSON_QUERY(q.value, '$.config.media.sourceFiles.image'))
        WITH
        (
            OriginalFileID NVARCHAR(500) '$.id',
            LmsFileID NVARCHAR(500) '$.resourceFileId',
            FileName NVARCHAR(500) '$.name',
            FileURL NVARCHAR(2000) '$.source',
            ContentType NVARCHAR(100) '$.contentType',
            FileSize BIGINT '$.fileSize',
            SourceSize BIGINT '$.size'
        ) src
        WHERE a.IsDeleted = 0
          AND (@sys_SystemRight IN (3, 9) OR a.CreateUser = @sys_UserID)
    )
    SELECT DISTINCT
        sf.ResourceID, sf.ResourceType, sf.NguonTaiNguyenCode,
        sf.FileID, sf.FileName, sf.FileURL, sf.ContentType, sf.FileSize,
        sf.ContentTitle, sf.ContentChapter, sf.ElementType, sf.ElementSortOrder,
        CASE
            WHEN sf.ResourceType = 'LESSON' THEN CONCAT(sf.ContentTitle,
                CASE WHEN NULLIF(sf.ContentChapter, '') IS NULL THEN '' ELSE N' / ' + sf.ContentChapter END,
                CASE WHEN NULLIF(sf.ElementType, '') IS NULL THEN '' ELSE N' / ' + sf.ElementType END)
            WHEN sf.ResourceType = 'ASSIGNMENT' THEN sf.ContentTitle
            ELSE NULL
        END AS ThuocNoiDung,
        sf.KhoiID, sf.MonHocID, sf.NguoiUploadID, sf.CreateTime,
        mh.MonHocName, k.TenKhoiHoc AS TenKhoi,
        gv.HoGV + N' ' + gv.TenGV AS NguoiUploadName
    FROM SourceFiles sf
    LEFT JOIN dbo.tblMonHoc mh ON mh.MonHocID = sf.MonHocID
    LEFT JOIN dbo.tblKhoi k ON k.KhoiID = sf.KhoiID
    LEFT JOIN dbo.tblGiaoVien gv ON gv.GiaoVienID = sf.NguoiUploadID
    WHERE ISNULL(sf.FileID, '') <> ''
      AND (ISNULL(@KhoiID, 0) = 0 OR sf.KhoiID = @KhoiID)
      AND (ISNULL(@MonHocID, 0) = 0 OR sf.MonHocID = @MonHocID)
    ORDER BY sf.KhoiID, sf.MonHocID, sf.CreateTime DESC, sf.FileName;
END;
GO
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_SourceFile_GetAll] TO [lmslhbs];
GO
