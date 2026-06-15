USE [LMS-LHBS];
GO

-- =================================================================================
-- 3. CẬP NHẬT CÁC STORED PROCEDURES HIỆN TẠI ĐỂ LIÊN KẾT CHƯƠNG TRÌNH HỌC
-- =================================================================================

-- Cập nhật spAPI_EL_Lesson_Save để hỗ trợ lưu liên kết chương trình học
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Lesson_Save]
    @LessonID INT = 0,
    @TuanHocID INT,
    @Chuong NVARCHAR(2000),
    @Title NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @KhoiID INT, 
    @MonHocID INT, 
    @NienKhoa INT,
    @HocKi INT,
    @EstimatedDuration INT = NULL,
    @ThumbnailURL NVARCHAR(1000) = NULL,
    @Status INT,
    @sys_UserID VARCHAR(9),
    @IsPublic BIT,
    @SyllabusID INT = NULL,
    @NodeID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

    IF LTRIM(RTRIM(@Title)) = '' BEGIN RAISERROR(N'Tiêu đề bài giảng không được để trống.', 16, 1); RETURN; END;
   
    IF @LessonID > 0
    BEGIN
        -- --- UPDATE ---
        IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_Lessons WHERE LessonID = @LessonID AND CreateUser = @sys_UserID)
        BEGIN
            RAISERROR(N'Bạn không có quyền chỉnh sửa bài giảng này.', 16, 1);
            RETURN; 
        END;

        UPDATE dbo.tblEL_Lessons
        SET
            Title = @Title,
            TuanHocID = @TuanHocID,
            Chuong = @Chuong,
            KhoiID = @KhoiID,
            MonHocID = @MonHocID,
            Description = @Description,
            NienKhoa = @NienKhoa,
            HocKi = @HocKi,
            EstimatedDuration = @EstimatedDuration,
            ThumbnailURL = @ThumbnailURL,
            Status = @Status,
            UpdateTime = GETDATE(),
            UpdateUser = @sys_UserID,
            IsPublic = @IsPublic
        WHERE LessonID = @LessonID;

        -- Cập nhật bảng ánh xạ trung gian
        IF @SyllabusID IS NOT NULL AND @NodeID IS NOT NULL
        BEGIN
            IF EXISTS (SELECT 1 FROM dbo.tblEL_SyllabusMapping WHERE ResourceType = 'LESSON' AND ResourceID = @LessonID AND IsDeleted = 0)
            BEGIN
                UPDATE dbo.tblEL_SyllabusMapping
                SET SyllabusID = @SyllabusID, NodeID = @NodeID, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
                WHERE ResourceType = 'LESSON' AND ResourceID = @LessonID AND IsDeleted = 0;
            END;
            ELSE
            BEGIN
                INSERT INTO dbo.tblEL_SyllabusMapping (ResourceType, ResourceID, SyllabusID, NodeID, CreateUser, CreateTime)
                VALUES ('LESSON', @LessonID, @SyllabusID, @NodeID, @sys_UserID, GETDATE());
            END;
        END;
        ELSE
        BEGIN
            UPDATE dbo.tblEL_SyllabusMapping
            SET IsDeleted = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
            WHERE ResourceType = 'LESSON' AND ResourceID = @LessonID AND IsDeleted = 0;
        END;

        SELECT LessonID FROM dbo.tblEL_Lessons WHERE LessonID = @LessonID;
    END;
    ELSE
    BEGIN
        -- --- INSERT ---
        DECLARE @NewLessonID INT;

        INSERT INTO dbo.tblEL_Lessons (Title, Description, KhoiID, MonHocID, NienKhoa, HocKi, EstimatedDuration, ThumbnailURL, Status, CreateUser, TuanHocID, Chuong, IsPublic)
        VALUES (@Title, @Description, @KhoiID, @MonHocID, @NienKhoa, @HocKi, @EstimatedDuration, @ThumbnailURL, @Status, @sys_UserID, @TuanHocID, @Chuong, @IsPublic);
        
        SET @NewLessonID = SCOPE_IDENTITY();

        IF @SyllabusID IS NOT NULL AND @NodeID IS NOT NULL
        BEGIN
            INSERT INTO dbo.tblEL_SyllabusMapping (ResourceType, ResourceID, SyllabusID, NodeID, CreateUser, CreateTime)
            VALUES ('LESSON', @NewLessonID, @SyllabusID, @NodeID, @sys_UserID, GETDATE());
        END;
        
        SELECT LessonID FROM dbo.tblEL_Lessons WHERE LessonID = @NewLessonID;
    END;
END;
GO


-- Cập nhật spAPI_EL_Assignment_Ins để chèn liên kết chương trình học
CREATE OR ALTER PROC [dbo].[spAPI_EL_Assignment_Ins]
    @Title NVARCHAR(1000),
    @Instructions NVARCHAR(2000),
    @Chuong NVARCHAR(2000),
    @Tuan NVARCHAR(20),
    @TuanHocID INT,
    @MonHocID INT,
    @KhoiID INT,
    @NienKhoa INT,
    @HocKi INT,
    @SYS_USERID VARCHAR(9),
    @SyllabusID INT = NULL,
    @NodeID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @SYS_USERID = [dbo].[fn_GetUser_LMS](@SYS_USERID);

    IF @Title IS NULL OR LTRIM(RTRIM(@Title)) = ''
       OR @TuanHocID IS NULL OR LTRIM(RTRIM(@TuanHocID)) = ''
       OR @MonHocID IS NULL OR LTRIM(RTRIM(@MonHocID)) = ''
       OR @KhoiID IS NULL  OR LTRIM(RTRIM(@KhoiID)) = ''
       OR @NienKhoa IS NULL  OR LTRIM(RTRIM(@NienKhoa)) = ''
    BEGIN
        RAISERROR(N'Dữ liệu không hợp lệ: thiếu Title / TuanHocID / MonHocID / KhoiID / NienKhoa.', 16, 1);
        RETURN;
    END;

    DECLARE @NewAssignmentID INT;

    INSERT INTO tblEL_Assignments
    ( 
        [Title], 
        [Instructions], 
        [Chuong],
        [Tuan],
        TuanHocID,
        MonHocID,
        KhoiID,
        [AssignmentConfig], 
        [NienKhoa], 
        [HocKi], 
        [IsDeleted], 
        [CreateTime], 
        [CreateUser]
    )
    VALUES (
        @Title,
        @Instructions,
        @Chuong,
        @Tuan, 
        @TuanHocID,
        @MonHocID,
        @KhoiID,
        NULL,
        @NienKhoa,
        @HocKi,
        0,
        GETDATE(),
        @SYS_USERID
    );

    SET @NewAssignmentID = SCOPE_IDENTITY();

    IF @SyllabusID IS NOT NULL AND @NodeID IS NOT NULL
    BEGIN
        INSERT INTO dbo.tblEL_SyllabusMapping (ResourceType, ResourceID, SyllabusID, NodeID, CreateUser, CreateTime)
        VALUES ('ASSIGNMENT', @NewAssignmentID, @SyllabusID, @NodeID, @SYS_USERID, GETDATE());
    END;

    SELECT @NewAssignmentID AS AssignmentID;
END;
GO


-- Cập nhật spAPI_EL_Assignment_Upd để hỗ trợ cập nhật liên kết chương trình học
CREATE OR ALTER PROC [dbo].[spAPI_EL_Assignment_Upd]
    @AssignmentID INT,
    @Title NVARCHAR(500),
    @Instructions NVARCHAR(2000),
    @IsPublic BIT,
    @SYS_USERID VARCHAR(9),
    @SyllabusID INT = NULL,
    @NodeID INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET @SYS_USERID = [dbo].[fn_GetUser_LMS](@SYS_USERID);
    
    UPDATE dbo.tblEL_Assignments
    SET
        Title = @Title,
        Instructions = @Instructions,
        IsPublic = @IsPublic,
        UpdateUser = @SYS_USERID,
        UpdateTime = GETDATE()
    WHERE AssignmentID = @AssignmentID;
    
    -- Cập nhật bảng ánh xạ trung gian
    IF @SyllabusID IS NOT NULL AND @NodeID IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.tblEL_SyllabusMapping WHERE ResourceType = 'ASSIGNMENT' AND ResourceID = @AssignmentID AND IsDeleted = 0)
        BEGIN
            UPDATE dbo.tblEL_SyllabusMapping
            SET SyllabusID = @SyllabusID, NodeID = @NodeID, UpdateUser = @SYS_USERID, UpdateTime = GETDATE()
            WHERE ResourceType = 'ASSIGNMENT' AND ResourceID = @AssignmentID AND IsDeleted = 0;
        END;
        ELSE
        BEGIN
            INSERT INTO dbo.tblEL_SyllabusMapping (ResourceType, ResourceID, SyllabusID, NodeID, CreateUser, CreateTime)
            VALUES ('ASSIGNMENT', @AssignmentID, @SyllabusID, @NodeID, @SYS_USERID, GETDATE());
        END;
    END;
    ELSE
    BEGIN
        UPDATE dbo.tblEL_SyllabusMapping
        SET IsDeleted = 1, UpdateUser = @SYS_USERID, UpdateTime = GETDATE()
        WHERE ResourceType = 'ASSIGNMENT' AND ResourceID = @AssignmentID AND IsDeleted = 0;
    END;
END;
GO


-- Cập nhật spAPI_EL_Teacher_GetMyContentLibrary để trả thêm thông tin chương trình học đã ánh xạ
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Teacher_GetMyContentLibrary]
    @sys_UserID      VARCHAR(9),
    @KhoiID          INT           = NULL,
    @MonHocID        INT           = NULL,
    @SearchTerm      NVARCHAR(255) = NULL,
    @NienKhoa        VARCHAR(10)   = NULL,
    @sys_SystemRight INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @sys_UserID = [dbo].[fn_GetUser_LMS](@sys_UserID);

    DECLARE @AssignmentToClassID_Permissions   INT;
    DECLARE @AssignmentToStudentID_Permissions INT;

    SET @AssignmentToClassID_Permissions = (
        SELECT TOP 1 AssignToClassID
        FROM   tblEL_Resoucre_TeacherPermissions
        WHERE  Enable     = 1
          AND  GiaoVienID = @sys_UserID
    );

    SET @AssignmentToStudentID_Permissions = (
        SELECT TOP 1 AssignToStudentID
        FROM   dbo.tblEL_AssignToStudent
        WHERE  IsDeleted   = 0
          AND  CreateUser  = @sys_UserID
    );

    ;WITH AllContent AS
    (
        SELECT a.AssignmentID                     AS ResourceID
             , 'ASSIGNMENT'                       AS ResourceType
             , a.Title
             , a.Instructions
             , a.KhoiID
             , a.MonHocID
             , a.TuanHocID
             , a.Chuong
             , 3                                  AS Status_Internal
             , ISNULL(a.UpdateTime, a.CreateTime) AS LastUpdateTime
             , a.IsPublic
         FROM dbo.tblEL_Assignments a
        WHERE (
                  a.CreateUser = @sys_UserID
               OR a.AssignmentID IN (
                        SELECT AssignmentID FROM tblEL_AssignToClass
                        WHERE  AssignToClassID = @AssignmentToClassID_Permissions
                        UNION
                        SELECT AssignmentID FROM dbo.tblEL_AssignToStudent
                        WHERE  AssignToStudentID = @AssignmentToStudentID_Permissions
                    )
               )
          AND a.IsDeleted = 0

        UNION ALL

        SELECT l.LessonID
             , 'LESSON'
             , l.Title
             , l.[Description]
             , l.KhoiID
             , l.MonHocID
             , l.TuanHocID
             , l.Chuong
             , l.Status
             , ISNULL(l.UpdateTime, l.CreateTime)
             , l.IsPublic
        FROM dbo.tblEL_Lessons l
        WHERE l.CreateUser = @sys_UserID
          AND l.IsDeleted  = 0
    )
    , ClassAgg AS
    (
        SELECT atc.ResourceID
             , atc.ResourceType
             , COUNT(DISTINCT atc.MonHocLopID)                              AS ClassCount
             , STRING_AGG(COALESCE(l.TenLop, n.TenNhom), ', ')
                   WITHIN GROUP (ORDER BY COALESCE(l.TenLop, n.TenNhom))   AS ClassNames
        FROM dbo.tblEL_AssignToClass atc
        JOIN dbo.tblMonHocLop mhl
            ON mhl.MonHocLopID = atc.MonHocLopID
        LEFT JOIN dbo.tblLop l
            ON l.LopID = mhl.LopNhomID AND l.NienKhoa = @NienKhoa
        LEFT JOIN dbo.tblNhom n
            ON n.NhomID = mhl.LopNhomID AND n.NienKhoa = @NienKhoa
        WHERE atc.IsDeleted = 0
        GROUP BY atc.ResourceID, atc.ResourceType
    )
    , ClassAggPublic AS
    (
        SELECT atc.ResourceID
             , atc.ResourceType
             , STRING_AGG(COALESCE(l.TenLop, n.TenNhom), ', ')
                   WITHIN GROUP (ORDER BY COALESCE(l.TenLop, n.TenNhom))   AS ClassNamesPublic
        FROM dbo.tblEL_AssignToClass atc
        JOIN dbo.tblMonHocLop mhl
            ON mhl.MonHocLopID = atc.MonHocLopID
        LEFT JOIN dbo.tblLop l
            ON l.LopID = mhl.LopNhomID AND l.NienKhoa = @NienKhoa
        LEFT JOIN dbo.tblNhom n
            ON n.NhomID = mhl.LopNhomID AND n.NienKhoa = @NienKhoa
        WHERE atc.IsDeleted = 0
          AND atc.Status    = 1
        GROUP BY atc.ResourceID, atc.ResourceType
    )
    , StudentAgg AS
    (
        SELECT s.ResourceID
             , s.ResourceType
             , COUNT(DISTINCT s.HocSinhID)                                  AS StudentCount
             , STRING_AGG(
                   hs.Ho + ' ' + hs.Ten + ' (' + ISNULL(lp.TenLop, '') + ')',
                   ', '
               ) WITHIN GROUP (
                   ORDER BY hs.Ho + ' ' + hs.Ten
               )                                                            AS StudentNames
        FROM dbo.tblEL_AssignToStudent s
        JOIN dbo.tblHocSinh hs ON hs.HocSinhID = s.HocSinhID
        OUTER APPLY (
            SELECT TOP 1 l.TenLop
            FROM dbo.tblHocSinhLop hsl
            JOIN dbo.tblLop l
                ON l.LopID = hsl.LopID AND l.Enable = 1 AND l.NienKhoa = @NienKhoa
            WHERE hsl.HocSinhID = hs.HocSinhID
        ) lp (TenLop)
        WHERE s.IsDeleted = 0
        GROUP BY s.ResourceID, s.ResourceType
    )
    , StudentAggPublic AS
    (
        SELECT s.ResourceID
             , s.ResourceType
             , STRING_AGG(
                   hs.Ho + ' ' + hs.Ten + ' (' + ISNULL(lp.TenLop, '') + ')',
                   ', '
               ) WITHIN GROUP (
                   ORDER BY hs.Ho + ' ' + hs.Ten
               )                                                            AS StudentNamesPublic
        FROM dbo.tblEL_AssignToStudent s
        JOIN dbo.tblHocSinh hs ON hs.HocSinhID = s.HocSinhID
        OUTER APPLY (
            SELECT TOP 1 l.TenLop
            FROM dbo.tblHocSinhLop hsl
            JOIN dbo.tblLop l
                ON l.LopID = hsl.LopID AND l.Enable = 1 AND l.NienKhoa = @NienKhoa
            WHERE hsl.HocSinhID = hs.HocSinhID
        ) lp (TenLop)
        WHERE s.IsDeleted = 0
          AND s.Status    = 1
        GROUP BY s.ResourceID, s.ResourceType
    )
    , AssignedDetailsJson AS
    (
        SELECT ResourceID, ResourceType
             , (
                   SELECT *
                   FROM (
                       SELECT 'Class'                           AS Type
                            , COALESCE(l.TenLop, n.TenNhom)    AS TenLopHoacNhom
                            , mhl.LopNhomID                    AS LopHoacNhomID
                            , i.AssignToClassID
                            , NULL                             AS AssignToStudentID
                            , i.AssignmentID
                            , i.ResourceType
                            , i.ResourceID
                            , i.Status
                            , i.DueDate
                            , i.MaxScore
                            , i.LimitAssigned
                            , i.Is_Full_Quiz
                            , 1                                AS Is_AssignedToClass
                       FROM dbo.tblEL_AssignToClass i
                       JOIN dbo.tblMonHocLop mhl ON mhl.MonHocLopID = i.MonHocLopID
                       LEFT JOIN dbo.tblLop l
                           ON l.LopID = mhl.LopNhomID AND l.NienKhoa = @NienKhoa
                       LEFT JOIN dbo.tblNhom n
                           ON n.NhomID = mhl.LopNhomID AND n.NienKhoa = @NienKhoa
                       WHERE i.ResourceID   = sub.ResourceID
                         AND i.ResourceType = sub.ResourceType
                         AND i.IsDeleted    = 0

                       UNION ALL

                       SELECT 'Student'
                            , hs.Ho + ' ' + hs.Ten + ' (' + ISNULL(lp.TenLop, '') + ')'
                            , CAST(hs.HocSinhID AS VARCHAR(20))
                            , NULL
                            , s.AssignToStudentID
                            , s.AssignmentID
                            , s.ResourceType
                            , s.ResourceID
                            , s.Status
                            , s.DueDate
                            , s.MaxScore
                            , s.LimitAssigned
                            , s.Is_Full_Quiz
                            , 0
                       FROM dbo.tblEL_AssignToStudent s
                       JOIN dbo.tblHocSinh hs ON hs.HocSinhID = s.HocSinhID
                       OUTER APPLY (
                           SELECT TOP 1 l.TenLop
                           FROM dbo.tblHocSinhLop hsl
                           JOIN dbo.tblLop l
                               ON l.LopID = hsl.LopID AND l.Enable = 1 AND l.NienKhoa = @NienKhoa
                           WHERE hsl.HocSinhID = hs.HocSinhID
                       ) lp (TenLop)
                       WHERE s.ResourceID   = sub.ResourceID
                         AND s.ResourceType = sub.ResourceType
                         AND s.IsDeleted    = 0
                   ) AS Combined
                   FOR JSON PATH
               ) AS AssignedDetails
        FROM (
            SELECT ResourceID, ResourceType FROM dbo.tblEL_AssignToClass  WHERE IsDeleted = 0
            UNION
            SELECT ResourceID, ResourceType FROM dbo.tblEL_AssignToStudent WHERE IsDeleted = 0
        ) sub
    )

    SELECT ac.ResourceID
         , ac.ResourceType
         , ac.Title
         , ac.Instructions
         , mh.MonHocName
         , k.TenKhoiHoc                                               AS TenKhoi
         , ISNULL(ca.ClassCount, 0) + ISNULL(sa.StudentCount, 0)      AS AssignedClassCount
         , RTRIM(LTRIM(
               CONCAT(
                   ISNULL(ca.ClassNames, ''),
                   CASE WHEN ca.ClassNames IS NOT NULL AND sa.StudentNames IS NOT NULL
                        THEN ', ' ELSE '' END,
                   ISNULL(sa.StudentNames, '')
               )
           ))                                                          AS AssignedClassNames
         , RTRIM(LTRIM(
               CONCAT(
                   ISNULL(cap.ClassNamesPublic, ''),
                   CASE WHEN cap.ClassNamesPublic IS NOT NULL AND sap.StudentNamesPublic IS NOT NULL
                        THEN ', ' ELSE '' END,
                   ISNULL(sap.StudentNamesPublic, '')
               )
           ))                                                          AS AssignedClassNamesPublic
         , adj.AssignedDetails
         , CASE
               WHEN (ca.ResourceID IS NOT NULL OR sa.ResourceID IS NOT NULL) THEN 3
               WHEN ac.Status_Internal = 2 THEN 2
               ELSE 1
           END                                                         AS Status
         , ac.LastUpdateTime
         , ac.KhoiID
         , ac.MonHocID
         , ac.TuanHocID
         , dbo.fnGetTuanHoc_HienThi(
               tht.Tuan, tht.ThangHoc, tht.NgayBatDau, tht.NgayKetThuc
           )                                                           AS Tuan_HienThi
         , ac.Chuong
         , CASE WHEN ac.ResourceType = 'ASSIGNMENT' THEN ac.ResourceID ELSE NULL END AS AssignmentID
         , ac.IsPublic
         , CASE
               WHEN ca.ResourceID IS NOT NULL THEN 1
               WHEN sa.ResourceID IS NOT NULL THEN 0
               ELSE NULL
           END                                                         AS Is_AssignedToClass
         -- Trả thêm cột ánh xạ của phân hệ Syllabus
         , sm.SyllabusID
         , sm.NodeID

    FROM AllContent ac
    LEFT JOIN dbo.tblMonHoc    mh  ON mh.MonHocID  = ac.MonHocID
    LEFT JOIN dbo.tblKhoi      k   ON k.KhoiID     = ac.KhoiID
    LEFT JOIN dbo.tblTuanHocTap tht ON tht.TuanHocID = ac.TuanHocID
    LEFT JOIN ClassAgg         ca  ON ca.ResourceID   = ac.ResourceID AND ca.ResourceType   = ac.ResourceType
    LEFT JOIN ClassAggPublic   cap ON cap.ResourceID  = ac.ResourceID AND cap.ResourceType  = ac.ResourceType
    LEFT JOIN StudentAgg       sa  ON sa.ResourceID   = ac.ResourceID AND sa.ResourceType   = ac.ResourceType
    LEFT JOIN StudentAggPublic sap ON sap.ResourceID  = ac.ResourceID AND sap.ResourceType  = ac.ResourceType
    LEFT JOIN AssignedDetailsJson adj ON adj.ResourceID = ac.ResourceID AND adj.ResourceType = ac.ResourceType
    -- Join lấy dữ liệu Syllabus
    LEFT JOIN dbo.tblEL_SyllabusMapping sm ON sm.ResourceType = ac.ResourceType AND sm.ResourceID = ac.ResourceID AND sm.IsDeleted = 0

    WHERE (@KhoiID    IS NULL OR ac.KhoiID   = @KhoiID)
      AND (@MonHocID  IS NULL OR ac.MonHocID = @MonHocID)
      AND (@SearchTerm IS NULL OR ac.Title LIKE '%' + @SearchTerm + '%')

     ORDER BY 
        ac.KhoiID,
        ac.MonHocID,
        tht.NgayBatDau DESC,
        CASE 
            WHEN ac.ResourceType = 'LESSON' THEN 0 
            ELSE 1 
        END,
        TRY_CAST(ac.Chuong AS INT),
        ac.Chuong,
        ac.LastUpdateTime DESC;
END;
GO
