USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_LMS_Screen_Schedule_Get]    Script Date: 2026-06-02 9:56:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[spAPI_LMS_Screen_Schedule_Get]
    @NienKhoa INT,
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @TypeScreen TINYINT = NULL,
    @Search NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @PageNumber IS NULL OR @PageNumber < 1 SET @PageNumber = 1;
    IF @PageSize IS NULL OR @PageSize < 1 SET @PageSize = 10;
    IF @PageSize > 200 SET @PageSize = 200;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    DECLARE @SearchTerm NVARCHAR(120) = NULL;

    IF @Search IS NOT NULL
    BEGIN
        SET @Search = LTRIM(RTRIM(@Search));
        IF @Search <> ''
        BEGIN
            SET @SearchTerm = '%' + @Search + '%';
        END
    END

    ;WITH DataSource AS (
        SELECT sch.*
             , lop.TenLop
             , lop.HocSinhID
        FROM dbo.tblLMS_View_Schedule sch
        OUTER APPLY (
            SELECT TRY_CAST(sch.CreateUser AS INT) AS CreateUserHocSinhID
        ) cu
        OUTER APPLY (
            SELECT TOP 1 l.TenLop, hsl.HocSinhID
            FROM dbo.tblHocSinhLop hsl
            JOIN dbo.tblLop l ON l.LopID     = hsl.LopID
                              AND l.NienKhoa = @NienKhoa
                              AND l.Enable   = 1
            WHERE cu.CreateUserHocSinhID IS NOT NULL
              AND hsl.HocSinhID = cu.CreateUserHocSinhID
        ) lop
        WHERE sch.IsDeleted = 0
          AND (@TypeScreen IS NULL OR sch.TypeScreen = @TypeScreen)
          AND (
                @SearchTerm IS NULL
                OR CAST(sch.ViewID AS NVARCHAR(30)) LIKE @SearchTerm
                OR ISNULL(sch.CreateUser, '') LIKE @SearchTerm
                OR ISNULL(sch.UpdateUser, '') LIKE @SearchTerm
                OR ISNULL(lop.TenLop, '') LIKE @SearchTerm
              )
    )
    SELECT ds.*
         , COUNT(1) OVER() AS TotalRows
         , SUM(ISNULL(ds.ViewCount, 0)) OVER() AS TotalViewCount
         , SUM(CASE WHEN ds.TypeScreen = 0 THEN ISNULL(ds.ViewCount, 0) ELSE 0 END) OVER() AS MobileViewCount
         , SUM(CASE WHEN ds.TypeScreen = 1 THEN ISNULL(ds.ViewCount, 0) ELSE 0 END) OVER() AS DesktopViewCount
    FROM DataSource ds
    ORDER BY ds.[Date] DESC, ds.ViewID DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;