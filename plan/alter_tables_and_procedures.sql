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
    @KhoiID INT = NULL,
    @MonHocID INT = NULL,
    @BoSachID INT = NULL,
    @Loai VARCHAR(50) = 'HOC_LIEU' -- Mặc định là học liệu cũ để tương thích ngược
AS
BEGIN
    SET NOCOUNT ON;

	DECLARE @Table_HocLieu_Exist TABLE (HocLieuID INT)
	INSERT INTO @Table_HocLieu_Exist 
	SELECT DISTINCT hl.HocLieuID FROM dbo.tblNoiDungHocLieu_FP nd 
		INNER JOIN dbo.tblHocLieu_FP hl ON hl.HocLieuID = nd.HocLieuID AND hl.Is_Xoa = 0 
            AND (@KhoiID IS NULL OR @KhoiID = 0 OR hl.KhoiID = @KhoiID)
            AND (hl.Loai = @Loai)
	WHERE nd.Is_Xoa = 0

    SELECT
        hl.HocLieuID, hl.TenHocLieu, hl.KhoiID, hl.HocKy, hl.TinhTrang,
        bs.TenBoSach, mh.MonHocName AS TenMonHoc,
		hl.ThumbnailURL,
		hl.MonHocID,
		bs.BoSachID,
        hl.Loai,
        (SELECT COUNT(*) FROM dbo.tblHocLieu_FP WHERE Is_Xoa = 0 AND Loai = @Loai) AS TotalRecords
    FROM
        dbo.tblHocLieu_FP hl
    INNER JOIN dbo.tblBoSach_FP bs ON hl.BoSachID = bs.BoSachID
    INNER JOIN dbo.tblMonHoc mh ON hl.MonHocID = mh.MonHocID
    WHERE
        hl.Is_Xoa = 0
        AND hl.Loai = @Loai
        AND (@KhoiID IS NULL OR @KhoiID = 0 OR hl.KhoiID = @KhoiID)
        AND (@MonHocID IS NULL  OR @MonHocID = 0 OR hl.MonHocID = @MonHocID)
        AND (@BoSachID IS NULL  OR @BoSachID = 0 OR hl.BoSachID = @BoSachID)
		AND hl.HocLieuID IN (SELECT HocLieuID FROM @Table_HocLieu_Exist)
    ORDER BY
        hl.UpdateTime DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO


-- Cập nhật spAPI_FP_HocLieu_Save
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[spAPI_FP_HocLieu_Save]
    @HocLieuID INT,
    @TenHocLieu NVARCHAR(255),
    @BoSachID INT,
    @MonHocID INT,
    @KhoiID INT,
    @HocKy INT,
    @TinhTrang VARCHAR(50),
    @ThumbnailURL VARCHAR(500),
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
            Loai = @Loai,
            UpdateUser = @sys_UserID, 
            UpdateTime = GETDATE() 
        WHERE HocLieuID = @HocLieuID;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.tblHocLieu_FP (TenHocLieu, BoSachID, MonHocID, KhoiID, HocKy, TinhTrang, ThumbnailURL, Loai, CreateUser, CreateTime) 
        VALUES (@TenHocLieu, @BoSachID, @MonHocID, @KhoiID, @HocKy, @TinhTrang, @ThumbnailURL, @Loai, @sys_UserID, GETDATE());
    END

    SELECT * FROM dbo.tblHocLieu_FP WHERE HocLieuID = ISNULL(@HocLieuID, SCOPE_IDENTITY());
END
GO
