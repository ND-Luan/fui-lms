USE [LMS-LHBS];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

ALTER PROCEDURE [dbo].[spAPI_FP_HocLieu_GetAll]
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @KhoiID INT = NULL,
    @MonHocID INT = NULL,
    @BoSachID INT = NULL,
    @Loai VARCHAR(50) = 'HOC_LIEU'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        hl.HocLieuID,
        hl.TenHocLieu,
        hl.KhoiID,
        hl.HocKy,
        hl.TinhTrang,
        bs.TenBoSach,
        mh.MonHocName AS TenMonHoc,
        hl.ThumbnailURL,
        hl.ThumbnailURLs,
        hl.MonHocID,
        hl.BoSachID,
        hl.Loai,
        COUNT(*) OVER () AS TotalRecords
    FROM dbo.tblHocLieu_FP hl
    LEFT JOIN dbo.tblBoSach_FP bs ON hl.BoSachID = bs.BoSachID
    LEFT JOIN dbo.tblMonHoc mh ON hl.MonHocID = mh.MonHocID
    WHERE
        hl.Is_Xoa = 0
        AND hl.Loai = @Loai
        AND (@KhoiID IS NULL OR @KhoiID = 0 OR hl.KhoiID = @KhoiID)
        AND (@MonHocID IS NULL OR @MonHocID = 0 OR hl.MonHocID = @MonHocID)
        AND (@BoSachID IS NULL OR @BoSachID = 0 OR hl.BoSachID = @BoSachID)
    ORDER BY hl.UpdateTime DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_FP_HocLieu_GetAll] TO [lmslhbs];
GRANT ALTER, CONTROL, TAKE OWNERSHIP, VIEW DEFINITION ON OBJECT::[dbo].[spAPI_FP_HocLieu_GetAll] TO [lmslhbs];
GO
