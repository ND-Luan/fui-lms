USE [LMS-LHBS];
GO

/*
    KHO TÀI NGUYÊN GIÁO VIÊN
    - Không tạo bảng mới.
    - tblHocLieu_FP: bộ tài liệu (Loai = 'TAI_NGUYEN').
    - tblNoiDungHocLieu_FP: thư mục và metadata file.
    - FileData: file vật lý; các API dưới đây chỉ lưu FILE_ID trong DataJson.
*/

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_GetAll]
    @KhoiID INT = 0,
    @MonHocID INT = 0,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        hl.HocLieuID,
        hl.TenHocLieu,
        hl.BoSachID,
        hl.MonHocID,
        hl.KhoiID,
        hl.HocKy,
        hl.ThumbnailURL,
        hl.TinhTrang,
        hl.Loai,
        hl.CreateUser,
        hl.CreateTime,
        hl.UpdateTime,
        mh.MonHocName AS TenMonHoc,
        (
            SELECT COUNT(*)
            FROM dbo.tblNoiDungHocLieu_FP nd
            WHERE nd.HocLieuID = hl.HocLieuID
                AND nd.Is_Xoa = 0
                AND nd.LoaiNoiDung <> 'THU_MUC'
        ) AS SoLuongFile
    FROM dbo.tblHocLieu_FP hl
    LEFT JOIN dbo.tblMonHoc mh ON mh.MonHocID = hl.MonHocID
    WHERE hl.Is_Xoa = 0
        AND hl.Loai = 'TAI_NGUYEN'
        AND hl.CreateUser = @sys_UserID
        AND (ISNULL(@KhoiID, 0) = 0 OR hl.KhoiID = @KhoiID)
        AND (ISNULL(@MonHocID, 0) = 0 OR hl.MonHocID = @MonHocID)
    ORDER BY ISNULL(hl.UpdateTime, hl.CreateTime) DESC, hl.TenHocLieu;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Save]
    @HocLieuID INT = 0,
    @TenHocLieu NVARCHAR(255),
    @MonHocID INT = NULL,
    @KhoiID INT = NULL,
    @HocKy INT = NULL,
    @TinhTrang VARCHAR(50) = 'Private',
    @ThumbnailURL NVARCHAR(1000) = NULL,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF ISNULL(@HocLieuID, 0) > 0
    BEGIN
        UPDATE dbo.tblHocLieu_FP
        SET TenHocLieu = @TenHocLieu,
            MonHocID = @MonHocID,
            KhoiID = @KhoiID,
            HocKy = @HocKy,
            TinhTrang = ISNULL(NULLIF(@TinhTrang, ''), 'Private'),
            ThumbnailURL = @ThumbnailURL,
            UpdateUser = @sys_UserID,
            UpdateTime = GETDATE()
        WHERE HocLieuID = @HocLieuID
            AND Loai = 'TAI_NGUYEN'
            AND CreateUser = @sys_UserID
            AND Is_Xoa = 0;

        IF @@ROWCOUNT = 0
            THROW 50001, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền cập nhật.', 1;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.tblHocLieu_FP
            (TenHocLieu, BoSachID, MonHocID, KhoiID, HocKy, ThumbnailURL, TinhTrang,
             Loai, Is_Xoa, CreateUser, CreateTime)
        VALUES
            (@TenHocLieu, NULL, @MonHocID, @KhoiID, @HocKy, @ThumbnailURL,
             ISNULL(NULLIF(@TinhTrang, ''), 'Private'), 'TAI_NGUYEN', 0,
             @sys_UserID, GETDATE());

        SET @HocLieuID = SCOPE_IDENTITY();
    END;

    SELECT *
    FROM dbo.tblHocLieu_FP
    WHERE HocLieuID = @HocLieuID;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Delete]
    @HocLieuID INT,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    UPDATE dbo.tblHocLieu_FP
    SET Is_Xoa = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
    WHERE HocLieuID = @HocLieuID
        AND Loai = 'TAI_NGUYEN'
        AND CreateUser = @sys_UserID
        AND Is_Xoa = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50002, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền xóa.', 1;
    END;

    UPDATE dbo.tblNoiDungHocLieu_FP
    SET Is_Xoa = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
    WHERE HocLieuID = @HocLieuID AND Is_Xoa = 0;

    COMMIT TRANSACTION;
    SELECT Success = 1;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_GetTree]
    @HocLieuID INT,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.tblHocLieu_FP
        WHERE HocLieuID = @HocLieuID
            AND Loai = 'TAI_NGUYEN'
            AND CreateUser = @sys_UserID
            AND Is_Xoa = 0
    )
        THROW 50003, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền truy cập.', 1;

    SELECT
        NoiDungID,
        HocLieuID,
        ParentID,
        TenNoiDung,
        LoaiNoiDung,
        ThuTu,
        DataJson,
        CreateUser,
        CreateTime,
        UpdateTime
    FROM dbo.tblNoiDungHocLieu_FP
    WHERE HocLieuID = @HocLieuID AND Is_Xoa = 0
    ORDER BY ISNULL(ParentID, 0), ThuTu, TenNoiDung;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Node_Save]
    @NoiDungID INT = 0,
    @HocLieuID INT,
    @ParentID INT = NULL,
    @TenNoiDung NVARCHAR(500),
    @LoaiNoiDung VARCHAR(50),
    @ThuTu INT = 0,
    @DataJson NVARCHAR(MAX) = NULL,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM dbo.tblHocLieu_FP
        WHERE HocLieuID = @HocLieuID
            AND Loai = 'TAI_NGUYEN'
            AND CreateUser = @sys_UserID
            AND Is_Xoa = 0
    )
        THROW 50004, N'Không tìm thấy bộ tài nguyên hoặc bạn không có quyền cập nhật.', 1;

    IF ISNULL(@ParentID, 0) = 0 SET @ParentID = NULL;

    IF @ParentID IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM dbo.tblNoiDungHocLieu_FP
        WHERE NoiDungID = @ParentID
            AND HocLieuID = @HocLieuID
            AND LoaiNoiDung = 'THU_MUC'
            AND Is_Xoa = 0
    )
        THROW 50005, N'Thư mục cha không hợp lệ.', 1;

    IF ISNULL(@DataJson, '') <> '' AND ISJSON(@DataJson) = 0
        THROW 50006, N'Metadata tài nguyên không phải JSON hợp lệ.', 1;

    IF ISNULL(@NoiDungID, 0) > 0
    BEGIN
        UPDATE dbo.tblNoiDungHocLieu_FP
        SET ParentID = @ParentID,
            TenNoiDung = @TenNoiDung,
            LoaiNoiDung = @LoaiNoiDung,
            ThuTu = @ThuTu,
            DataJson = @DataJson,
            UpdateUser = @sys_UserID,
            UpdateTime = GETDATE()
        WHERE NoiDungID = @NoiDungID
            AND HocLieuID = @HocLieuID
            AND Is_Xoa = 0;

        IF @@ROWCOUNT = 0
            THROW 50007, N'Không tìm thấy mục tài nguyên.', 1;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.tblNoiDungHocLieu_FP
            (HocLieuID, ParentID, TenNoiDung, LoaiNoiDung, ThuTu, DataJson,
             Is_Xoa, CreateUser, CreateTime)
        VALUES
            (@HocLieuID, @ParentID, @TenNoiDung, @LoaiNoiDung, @ThuTu, @DataJson,
             0, @sys_UserID, GETDATE());

        SET @NoiDungID = SCOPE_IDENTITY();
    END;

    SELECT *
    FROM dbo.tblNoiDungHocLieu_FP
    WHERE NoiDungID = @NoiDungID;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Node_Delete]
    @NoiDungID INT,
    @sys_UserID VARCHAR(50)
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
        AND hl.CreateUser = @sys_UserID
        AND hl.Is_Xoa = 0;

    IF @HocLieuID IS NULL
        THROW 50008, N'Không tìm thấy mục tài nguyên hoặc bạn không có quyền xóa.', 1;

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
    UPDATE dbo.tblNoiDungHocLieu_FP
    SET Is_Xoa = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
    WHERE NoiDungID IN (SELECT NoiDungID FROM NodesToDelete);

    -- Không xóa FileData tại đây. Metadata có thể còn được học liệu khác tham chiếu.
    SELECT Success = 1;
END;
GO

/*
    Đăng ký file vừa upload từ trình soạn học liệu vào kho cá nhân.
    API tự tìm/tạo bộ "Tài nguyên đã tải lên" theo Khối + Môn, sau đó lưu metadata.
*/
CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_File_Register]
    @KhoiID INT = NULL,
    @MonHocID INT = NULL,
    @TenNoiDung NVARCHAR(500),
    @LoaiNoiDung VARCHAR(50),
    @DataJson NVARCHAR(MAX),
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF ISJSON(@DataJson) = 0
        THROW 50009, N'Metadata file không phải JSON hợp lệ.', 1;

    DECLARE @HocLieuID INT;
    DECLARE @TenKho NVARCHAR(255) = N'Tài nguyên đã tải lên';

    BEGIN TRANSACTION;

    SELECT TOP (1) @HocLieuID = HocLieuID
    FROM dbo.tblHocLieu_FP WITH (UPDLOCK, HOLDLOCK)
    WHERE Loai = 'TAI_NGUYEN'
        AND CreateUser = @sys_UserID
        AND Is_Xoa = 0
        AND ISNULL(KhoiID, -1) = ISNULL(@KhoiID, -1)
        AND ISNULL(MonHocID, -1) = ISNULL(@MonHocID, -1)
        AND TenHocLieu = @TenKho
    ORDER BY HocLieuID;

    IF @HocLieuID IS NULL
    BEGIN
        INSERT INTO dbo.tblHocLieu_FP
            (TenHocLieu, MonHocID, KhoiID, TinhTrang, Loai, Is_Xoa, CreateUser, CreateTime)
        VALUES
            (@TenKho, @MonHocID, @KhoiID, 'Private', 'TAI_NGUYEN', 0, @sys_UserID, GETDATE());
        SET @HocLieuID = SCOPE_IDENTITY();
    END;

    DECLARE @FileID VARCHAR(100) = JSON_VALUE(@DataJson, '$.fileId');
    DECLARE @SourceNoiDungID INT = TRY_CAST(JSON_VALUE(@DataJson, '$.sourceNoiDungID') AS INT);
    DECLARE @NoiDungID INT;

    SELECT TOP (1) @NoiDungID = NoiDungID
    FROM dbo.tblNoiDungHocLieu_FP
    WHERE HocLieuID = @HocLieuID
        AND Is_Xoa = 0
        AND JSON_VALUE(DataJson, '$.fileId') = @FileID
        AND (
            @SourceNoiDungID IS NULL
            OR TRY_CAST(JSON_VALUE(DataJson, '$.sourceNoiDungID') AS INT) = @SourceNoiDungID
        )
    ORDER BY NoiDungID;

    IF @NoiDungID IS NOT NULL
    BEGIN
        COMMIT TRANSACTION;
        SELECT @HocLieuID AS HocLieuID, @NoiDungID AS NoiDungID;
        RETURN;
    END;

    INSERT INTO dbo.tblNoiDungHocLieu_FP
        (HocLieuID, ParentID, TenNoiDung, LoaiNoiDung, ThuTu, DataJson,
         Is_Xoa, CreateUser, CreateTime)
    SELECT
        @HocLieuID, NULL, @TenNoiDung, @LoaiNoiDung,
        ISNULL(MAX(ThuTu), -1) + 1, @DataJson, 0, @sys_UserID, GETDATE()
    FROM dbo.tblNoiDungHocLieu_FP
    WHERE HocLieuID = @HocLieuID AND ParentID IS NULL AND Is_Xoa = 0;

    SET @NoiDungID = SCOPE_IDENTITY();
    COMMIT TRANSACTION;

    SELECT @HocLieuID AS HocLieuID, @NoiDungID AS NoiDungID;
END;
GO

/*
    VÙNG KIỂM TRA BGH / ADMIN
    Hai API này cố ý tách khỏi API giáo viên. Khi khai báo route API phải gắn
    quyền BGH/Admin; không công bố route này cho role giáo viên.
*/
CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Audit_GetAll]
    @KhoiID INT = 0,
    @MonHocID INT = 0,
    @OwnerUserID VARCHAR(50) = NULL,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF ISNULL(@sys_UserID, '') = '' OR ISNULL(@sys_SystemRight, 0) NOT IN (3, 5, 9)
        THROW 50010, N'Bạn không có quyền kiểm tra kho tài nguyên giáo viên.', 1;

    SELECT
        hl.HocLieuID,
        hl.TenHocLieu,
        hl.MonHocID,
        hl.KhoiID,
        hl.TinhTrang,
        hl.CreateUser AS OwnerUserID,
        hl.CreateTime,
        hl.UpdateTime,
        mh.MonHocName AS TenMonHoc,
        COUNT(CASE WHEN nd.LoaiNoiDung <> 'THU_MUC' AND nd.Is_Xoa = 0 THEN 1 END) AS SoLuongFile
    FROM dbo.tblHocLieu_FP hl
    LEFT JOIN dbo.tblMonHoc mh ON mh.MonHocID = hl.MonHocID
    LEFT JOIN dbo.tblNoiDungHocLieu_FP nd ON nd.HocLieuID = hl.HocLieuID
    WHERE hl.Is_Xoa = 0
        AND hl.Loai = 'TAI_NGUYEN'
        AND (ISNULL(@KhoiID, 0) = 0 OR hl.KhoiID = @KhoiID)
        AND (ISNULL(@MonHocID, 0) = 0 OR hl.MonHocID = @MonHocID)
        AND (@OwnerUserID IS NULL OR hl.CreateUser = @OwnerUserID)
    GROUP BY
        hl.HocLieuID, hl.TenHocLieu, hl.MonHocID, hl.KhoiID, hl.TinhTrang,
        hl.CreateUser, hl.CreateTime, hl.UpdateTime, mh.MonHocName
    ORDER BY ISNULL(hl.UpdateTime, hl.CreateTime) DESC;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spAPI_FP_TaiNguyen_Audit_GetTree]
    @HocLieuID INT,
    @sys_UserID VARCHAR(50),
    @sys_SystemRight INT = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF ISNULL(@sys_UserID, '') = '' OR ISNULL(@sys_SystemRight, 0) NOT IN (3, 5, 9)
        THROW 50011, N'Bạn không có quyền xem chi tiết kho tài nguyên giáo viên.', 1;

    SELECT
        nd.NoiDungID,
        nd.HocLieuID,
        nd.ParentID,
        nd.TenNoiDung,
        nd.LoaiNoiDung,
        nd.ThuTu,
        nd.DataJson,
        nd.CreateUser,
        nd.CreateTime,
        nd.UpdateTime,
        hl.CreateUser AS OwnerUserID,
        hl.KhoiID,
        hl.MonHocID
    FROM dbo.tblNoiDungHocLieu_FP nd
    INNER JOIN dbo.tblHocLieu_FP hl ON hl.HocLieuID = nd.HocLieuID
    WHERE nd.HocLieuID = @HocLieuID
        AND nd.Is_Xoa = 0
        AND hl.Is_Xoa = 0
        AND hl.Loai = 'TAI_NGUYEN'
    ORDER BY ISNULL(nd.ParentID, 0), nd.ThuTu, nd.TenNoiDung;
END;
GO

/*
    Quyền thực thi cho API gateway.
    Quyền dữ liệu vẫn được khóa trong từng store bằng @sys_UserID; riêng vùng
    Audit kiểm tra thêm @sys_SystemRight IN (3, 5, 9).
*/
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_GetAll] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Save] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Delete] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_GetTree] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Node_Save] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Node_Delete] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_File_Register] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Audit_GetAll] TO [lmslhbs];
GRANT EXECUTE ON [dbo].[spAPI_FP_TaiNguyen_Audit_GetTree] TO [lmslhbs];
GO
