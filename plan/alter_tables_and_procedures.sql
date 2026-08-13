USE [LMS-LHBS];
GO

-- =================================================================================
-- 1. BỔ SUNG CỘT PHÂN LOẠI VÀO BẢNG tblHocLieu_FP
-- =================================================================================

-- Thêm cột Loai nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[tblHocLieu_FP]') AND name = 'Loai')
BEGIN
    ALTER TABLE dbo.tblHocLieu_FP ADD Loai VARCHAR(50) NULL;
END;
GO

-- Cập nhật toàn bộ học liệu cũ thành loại 'HOC_LIEU'
UPDATE dbo.tblHocLieu_FP SET Loai = 'HOC_LIEU' WHERE Loai IS NULL;
GO

-- Tạo ràng buộc Default Constraint cho cột Loai là 'HOC_LIEU'
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'DF_tblHocLieu_FP_Loai' AND type = 'D')
BEGIN
    ALTER TABLE dbo.tblHocLieu_FP ADD CONSTRAINT DF_tblHocLieu_FP_Loai DEFAULT 'HOC_LIEU' FOR Loai;
END;
GO

-- Giữ ThumbnailURL làm ảnh chính để tương thích với các màn hình cũ.
-- ThumbnailURLs lưu toàn bộ danh sách ảnh dưới dạng JSON.
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[tblHocLieu_FP]') AND name = 'ThumbnailURLs')
BEGIN
    ALTER TABLE dbo.tblHocLieu_FP ADD ThumbnailURLs NVARCHAR(MAX) NULL;
END;
GO

UPDATE dbo.tblHocLieu_FP
SET ThumbnailURLs = N'["' + STRING_ESCAPE(ThumbnailURL, 'json') + N'"]'
WHERE NULLIF(ThumbnailURL, '') IS NOT NULL
    AND NULLIF(ThumbnailURLs, '') IS NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_tblHocLieu_FP_ThumbnailURLs_JSON')
BEGIN
    ALTER TABLE dbo.tblHocLieu_FP
    ADD CONSTRAINT CK_tblHocLieu_FP_ThumbnailURLs_JSON
    CHECK (ThumbnailURLs IS NULL OR ISJSON(ThumbnailURLs) = 1);
END;
GO


-- =================================================================================
-- 2. CẬP NHẬT CÁC STORED PROCEDURES ĐỂ HỖ TRỢ PHÂN LOẠI
-- =================================================================================

-- Cập nhật spAPI_FP_HocLieu_GetAll
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[spAPI_FP_HocLieu_GetAll]
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @KhoiID INT = 0,
    @MonHocID INT = 0,
    @BoSachID INT = 0,
    @Loai VARCHAR(50) = 'HOC_LIEU' -- Mặc định là học liệu cũ để tương thích ngược
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        hl.HocLieuID, hl.TenHocLieu, hl.KhoiID, hl.HocKy, hl.TinhTrang,
        bs.TenBoSach, mh.MonHocName AS TenMonHoc,
        hl.ThumbnailURL,
        hl.ThumbnailURLs,
        hl.MonHocID,
        hl.BoSachID,
        hl.Loai,
        COUNT(*) OVER () AS TotalRecords
    FROM
        dbo.tblHocLieu_FP hl
    LEFT JOIN dbo.tblBoSach_FP bs ON hl.BoSachID = bs.BoSachID
    LEFT JOIN dbo.tblMonHoc mh ON hl.MonHocID = mh.MonHocID
    WHERE
        hl.Is_Xoa = 0
        AND (@Loai IS NULL OR hl.Loai = @Loai OR hl.Loai IS NULL)
        AND (ISNULL(@KhoiID, 0) = 0 OR hl.KhoiID = @KhoiID)
        AND (ISNULL(@MonHocID, 0) = 0 OR hl.MonHocID = @MonHocID)
        AND (ISNULL(@BoSachID, 0) = 0 OR hl.BoSachID = @BoSachID)
    ORDER BY
        hl.UpdateTime DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

GRANT EXECUTE ON [dbo].[spAPI_FP_HocLieu_GetAll] TO [lmslhbs];
GO


-- Cập nhật spAPI_FP_HocLieu_Save
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[spAPI_FP_HocLieu_Save]
    @HocLieuID INT,
    @TenHocLieu NVARCHAR(255),
    @BoSachID INT = NULL,
    @MonHocID INT = NULL,
    @KhoiID INT = NULL,
    @HocKy INT = NULL,
    @TinhTrang VARCHAR(50),
    @ThumbnailURL NVARCHAR(1000),
    @ThumbnailURLs NVARCHAR(MAX) = NULL,
    @Loai VARCHAR(50) = 'HOC_LIEU', -- Thêm mới để hỗ trợ lưu loại tài nguyên
    @sys_UserID VARCHAR(50)
AS
BEGIN
    IF ISNULL(@HocLieuID, 0) > 0
    BEGIN
        UPDATE dbo.tblHocLieu_FP 
        SET TenHocLieu = @TenHocLieu, 
            BoSachID = @BoSachID, 
            MonHocID = @MonHocID, 
            KhoiID = @KhoiID, 
            HocKy = @HocKy, 
            TinhTrang = @TinhTrang, 
            ThumbnailURL = @ThumbnailURL, 
            ThumbnailURLs = @ThumbnailURLs,
            Loai = @Loai,
            UpdateUser = @sys_UserID, 
            UpdateTime = GETDATE() 
        WHERE HocLieuID = @HocLieuID;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.tblHocLieu_FP (TenHocLieu, BoSachID, MonHocID, KhoiID, HocKy, TinhTrang, ThumbnailURL, ThumbnailURLs, Loai, CreateUser, CreateTime) 
        VALUES (@TenHocLieu, @BoSachID, @MonHocID, @KhoiID, @HocKy, @TinhTrang, @ThumbnailURL, @ThumbnailURLs, @Loai, @sys_UserID, GETDATE());
    END

    SELECT * FROM dbo.tblHocLieu_FP WHERE HocLieuID = ISNULL(@HocLieuID, SCOPE_IDENTITY());
END
GO

GRANT EXECUTE ON [dbo].[spAPI_FP_HocLieu_Save] TO [lmslhbs];
GO


-- Tạo spAPI_FileData_Delete để xóa dữ liệu filedata
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FileData_Delete]
    @FileID VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.FileData 
    WHERE FileID = @FileID;

    SELECT @@ROWCOUNT AS DeletedRows;
END
GO

-- Cấp quyền thực thi cho Stored Procedure
GRANT EXECUTE ON [dbo].[spAPI_FileData_Delete] TO [lmslhbs];
GRANT ALTER, CONTROL, TAKE OWNERSHIP, VIEW DEFINITION ON OBJECT::[dbo].[spAPI_FP_HocLieu_GetAll] TO [lmslhbs];
GRANT ALTER, CONTROL, TAKE OWNERSHIP, VIEW DEFINITION ON OBJECT::[dbo].[spAPI_FP_HocLieu_Save] TO [lmslhbs];
GRANT ALTER, CONTROL, TAKE OWNERSHIP, VIEW DEFINITION ON OBJECT::[dbo].[spAPI_FileData_Delete] TO [lmslhbs];
GO
