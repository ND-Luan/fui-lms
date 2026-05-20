USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_KhoaCotDiem_Get]    Script Date: 2026-05-20 10:10:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROC [dbo].[spAPI_KhoaCotDiem_Get]
    @LopID         VARCHAR(50),
    @MonHocLopID   INT,
    @MaNhomCotDiem VARCHAR(100),
    @NienKhoa      INT,
    @Semester      VARCHAR(50),
    @SYS_USERID    VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    -- =========================================================================
    -- BƯỚC 1: Lấy thông tin môn học và danh sách môn học năng lực phẩm chất
    -- =========================================================================
    DECLARE @MonHocID            INT          = 0;
    DECLARE @List_MonHoc_NLPC_ID NVARCHAR(50) = N'';

    SELECT
        @MonHocID            = mhl.MonHocID,
        @List_MonHoc_NLPC_ID = ISNULL(mh.List_MonHoc_NLPC_ID, N'')
    FROM dbo.tblMonHocLop mhl
    INNER JOIN dbo.tblMonHoc mh ON mh.MonHocID = mhl.MonHocID
    WHERE mhl.MonHocLopID = @MonHocLopID;

    -- =========================================================================
    -- BƯỚC 2: Xác định TemplateBangDiemID của môn học chính
    -- =========================================================================
    DECLARE @TemplateBangDiemID_Main INT = 0;

    SELECT @TemplateBangDiemID_Main = TemplateBangDiemID
    FROM dbo.tblMonHocLop
    WHERE MonHocLopID = @MonHocLopID;

    -- =========================================================================
    -- BƯỚC 3: Xác định danh sách môn học NLPC (Năng Lực Phẩm Chất)
    -- =========================================================================
    DECLARE @TemplateBangDiemID_NLPCs TABLE
    (
        TemplateBangDiemID INT NOT NULL,
        MonHocLopID        INT NOT NULL
    );

    IF @List_MonHoc_NLPC_ID <> N''
    BEGIN
        INSERT INTO @TemplateBangDiemID_NLPCs (TemplateBangDiemID, MonHocLopID)
        SELECT DISTINCT
            mhl.TemplateBangDiemID,
            mhl.MonHocLopID
        FROM dbo.tblMonHocLop mhl
        WHERE mhl.MonHocID IN (
                SELECT CAST(value AS INT)
                FROM STRING_SPLIT(@List_MonHoc_NLPC_ID, ',')
                WHERE RTRIM(value) <> ''
            )
          AND mhl.NienKhoa    = @NienKhoa
          AND mhl.LopNhomID   = @LopID
          AND mhl.Enable      = 1
          AND mhl.MonHocLopID <> @MonHocLopID;
    END

    -- =========================================================================
    -- BƯỚC 4: Xây dựng danh sách MaCotDiem đặc biệt cho MonHocID = 36
    -- =========================================================================
    DECLARE @ListMaCotDiem36 TABLE (MaCotDiem VARCHAR(100));

    IF @MonHocID = 36
    BEGIN
        INSERT INTO @ListMaCotDiem36 VALUES
            ('TongDiem_CD1_' + @Semester),
            ('TongDiem_CD2_' + @Semester),
            ('TongDiem_CD3_' + @Semester);
    END

    -- =========================================================================
    -- BƯỚC 5: Xây dựng danh sách MaCotDiem đặc biệt cho MonHocID = 5
    -- =========================================================================
    DECLARE @ListMaCotDiem5 TABLE (MaCotDiem VARCHAR(100));

    IF @MonHocID = 5
    BEGIN
        IF @Semester = 'HK1'
        BEGIN
            IF @MaNhomCotDiem = 'DiemGK_HK1'
                INSERT INTO @ListMaCotDiem5 VALUES
                    ('Topic1_Result'), ('Topic2_Result'), ('DiemGK_HK1');
            ELSE IF @MaNhomCotDiem = 'DiemCK_HK1'
                INSERT INTO @ListMaCotDiem5 VALUES
                    ('Topic1_Result'), ('Topic2_Result'),
                    ('Topic3_Result'), ('Topic4_Result');
        END
        ELSE IF @Semester = 'HK2'
        BEGIN
            IF @MaNhomCotDiem = 'DiemGK_HK2'
                INSERT INTO @ListMaCotDiem5 VALUES
                    ('Topic5_Result'), ('Topic6_Result'), ('DiemGK_HK2');
            ELSE IF @MaNhomCotDiem = 'DiemCK_HK2'
                INSERT INTO @ListMaCotDiem5 VALUES
                    ('Topic5_Result'), ('Topic6_Result'),
                    ('Topic7_Result'), ('Topic8_Result');
        END
    END

    -- =========================================================================
    -- BƯỚC 6: Lấy danh sách cột điểm và trạng thái khóa
    -- =========================================================================

    -- -------------------------------------------------------------------------
    -- PHẦN A: Cột điểm của môn học CHÍNH
    -- -------------------------------------------------------------------------
    SELECT
        ISNULL(kcd.KhoaCotDiemID, 0)          AS KhoaCotDiemID,
        @LopID                                AS LopID,
        @MonHocLopID                          AS MonHocLopID,
        ct.MaCotDiem                          AS MaCotDiem,
        CAST(ISNULL(kcd.TinhTrang, 0) AS BIT) AS TinhTrang
    FROM dbo.TemplateBangDiemChiTiet ct
    INNER JOIN dbo.tblMonHocLop mhl
        ON  mhl.MonHocLopID        = @MonHocLopID
        AND mhl.TemplateBangDiemID = @TemplateBangDiemID_Main
        AND mhl.Enable             = 1
        AND mhl.NienKhoa           = @NienKhoa
    OUTER APPLY (
        SELECT TOP 1
            k.KhoaCotDiemID,
            k.TinhTrang
        FROM dbo.tblKhoaCotDiem k
        WHERE k.MaCotDiem = ct.MaCotDiem
          AND k.MonHocLopID = @MonHocLopID
          AND k.LopID = @LopID
          AND k.Enable = 1
        ORDER BY ISNULL(k.UpdateTime, k.CreateTime) DESC, k.KhoaCotDiemID DESC
    ) kcd
    WHERE
        ct.TemplateBangDiemID = @TemplateBangDiemID_Main
        AND ct.Enable         = 1
        AND (
            ct.MaNhomCotDiem = @MaNhomCotDiem
            OR (@MonHocID = 36 AND ct.MaCotDiem IN (SELECT MaCotDiem FROM @ListMaCotDiem36))
            OR (@MonHocID = 5  AND ct.MaCotDiem IN (SELECT MaCotDiem FROM @ListMaCotDiem5))
        )

    UNION

    -- -------------------------------------------------------------------------
    -- PHẦN B: Cột điểm của các môn học NLPC
    -- -------------------------------------------------------------------------
    SELECT
        ISNULL(kcd.KhoaCotDiemID, 0)                    AS KhoaCotDiemID,
        @LopID                                          AS LopID,
        nlpc.MonHocLopID                                AS MonHocLopID,
        CONCAT(ct.CotDiemID, '_', ct.MaCotDiem)         AS MaCotDiem,
        CAST(ISNULL(kcd.TinhTrang, 0) AS BIT)           AS TinhTrang
    FROM dbo.TemplateBangDiemChiTiet ct
    INNER JOIN @TemplateBangDiemID_NLPCs nlpc
        ON  nlpc.TemplateBangDiemID = ct.TemplateBangDiemID
    INNER JOIN dbo.tblMonHocLop mhl
        ON  mhl.MonHocLopID        = nlpc.MonHocLopID
        AND mhl.TemplateBangDiemID = nlpc.TemplateBangDiemID
        AND mhl.Enable             = 1
        AND mhl.NienKhoa           = @NienKhoa
    OUTER APPLY (
        SELECT TOP 1
            k.KhoaCotDiemID,
            k.TinhTrang
        FROM dbo.tblKhoaCotDiem k
        WHERE k.MaCotDiem = ct.MaCotDiem
          AND k.MonHocLopID = nlpc.MonHocLopID
          AND k.LopID = @LopID
          AND k.Enable = 1
        ORDER BY ISNULL(k.UpdateTime, k.CreateTime) DESC, k.KhoaCotDiemID DESC
    ) kcd
    WHERE
        ct.MaNhomCotDiem = @MaNhomCotDiem
        AND ct.Enable    = 1

    ORDER BY MaCotDiem;

END;