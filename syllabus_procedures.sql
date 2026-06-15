USE [LMS-LHBS];
GO

-- =================================================================================
-- 1. TẠO CÁC BẢNG CHO PHÂN HỆ CHƯƠNG TRÌNH HỌC (LMS SYLLABUS)
-- =================================================================================

-- Tạo bảng Sách giáo khoa / Chương trình học
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tblEL_Syllabus]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.tblEL_Syllabus (
        SyllabusID INT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(1000) NULL,
        KhoiID INT NOT NULL,
        MonHocID INT NOT NULL,
        NienKhoa INT NULL,
        HocKi TINYINT NULL,
        IsDeleted BIT CONSTRAINT DF_tblEL_Syllabus_IsDeleted DEFAULT 0,
        CreateUser VARCHAR(9) NULL,
        CreateTime DATETIME CONSTRAINT DF_tblEL_Syllabus_CreateTime DEFAULT GETDATE(),
        UpdateUser VARCHAR(9) NULL,
        UpdateTime DATETIME NULL
    );
END;
GO

-- Tạo bảng Cấu trúc Chương/Bài chi tiết
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tblEL_SyllabusNode]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.tblEL_SyllabusNode (
        NodeID INT IDENTITY(1,1) PRIMARY KEY,
        SyllabusID INT NOT NULL,
        ParentID INT NULL,
        Title NVARCHAR(255) NOT NULL,
        NodeType VARCHAR(20) NOT NULL, -- 'CHAPTER' hoặc 'LESSON'
        SortOrder INT CONSTRAINT DF_tblEL_SyllabusNode_SortOrder DEFAULT 0,
        IsDeleted BIT CONSTRAINT DF_tblEL_SyllabusNode_IsDeleted DEFAULT 0,
        CreateUser VARCHAR(9) NULL,
        CreateTime CONSTRAINT DF_tblEL_SyllabusNode_CreateTime DEFAULT GETDATE(),
        UpdateUser VARCHAR(9) NULL,
        UpdateTime DATETIME NULL
    );
    CREATE INDEX IX_tblEL_SyllabusNode_Syllabus ON dbo.tblEL_SyllabusNode (SyllabusID) WHERE IsDeleted = 0;
END;
GO

-- Tạo bảng Liên kết Bài học/Bài tập của giáo viên
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tblEL_SyllabusMapping]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.tblEL_SyllabusMapping (
        MappingID INT IDENTITY(1,1) PRIMARY KEY,
        ResourceType VARCHAR(20) NOT NULL, -- 'LESSON' hoặc 'ASSIGNMENT'
        ResourceID INT NOT NULL,
        SyllabusID INT NOT NULL,
        NodeID INT NOT NULL,
        IsDeleted BIT CONSTRAINT DF_tblEL_SyllabusMapping_IsDeleted DEFAULT 0,
        CreateUser VARCHAR(9) NULL,
        CreateTime CONSTRAINT DF_tblEL_SyllabusMapping_CreateTime DEFAULT GETDATE(),
        UpdateUser VARCHAR(9) NULL,
        UpdateTime DATETIME NULL
    );
    CREATE INDEX IX_tblEL_SyllabusMapping_Resource ON dbo.tblEL_SyllabusMapping (ResourceType, ResourceID) WHERE IsDeleted = 0;
END;
GO


-- =================================================================================
-- 2. TẠO CÁC STORED PROCEDURES MỚI CHO CHƯƠNG TRÌNH HỌC
-- =================================================================================

-- Lấy danh sách Sách giáo khoa / Chương trình học theo khối lớp và môn học
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Syllabus_GetByLopMon]
    @KhoiID INT,
    @MonHocID INT,
    @NienKhoa INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT SyllabusID, Title, Description, KhoiID, MonHocID, NienKhoa, HocKi
    FROM dbo.tblEL_Syllabus
    WHERE KhoiID = @KhoiID
      AND MonHocID = @MonHocID
      AND IsDeleted = 0
    ORDER BY HocKi, Title;
END;
GO

-- Lấy cây thư mục chương trình học
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Syllabus_GetTree]
    @SyllabusID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT NodeID, SyllabusID, ParentID, Title, NodeType, SortOrder
    FROM dbo.tblEL_SyllabusNode
    WHERE SyllabusID = @SyllabusID
      AND IsDeleted = 0
    ORDER BY ISNULL(ParentID, 0), SortOrder, Title;
END;
GO

-- Thêm/Sửa Syllabus
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Syllabus_Save]
    @SyllabusID INT = 0,
    @Title NVARCHAR(255),
    @Description NVARCHAR(1000) = NULL,
    @KhoiID INT,
    @MonHocID INT,
    @NienKhoa INT = NULL,
    @HocKi TINYINT = NULL,
    @sys_UserID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

    IF LTRIM(RTRIM(@Title)) = '' BEGIN RAISERROR(N'Tiêu đề chương trình học không được để trống.', 16, 1); RETURN; END;

    IF @SyllabusID > 0
    BEGIN
        UPDATE dbo.tblEL_Syllabus
        SET Title = @Title,
            Description = @Description,
            KhoiID = @KhoiID,
            MonHocID = @MonHocID,
            NienKhoa = @NienKhoa,
            HocKi = @HocKi,
            UpdateUser = @sys_UserID,
            UpdateTime = GETDATE()
        WHERE SyllabusID = @SyllabusID;

        SELECT SyllabusID FROM dbo.tblEL_Syllabus WHERE SyllabusID = @SyllabusID;
    END;
    ELSE
    BEGIN
        INSERT INTO dbo.tblEL_Syllabus (Title, Description, KhoiID, MonHocID, NienKhoa, HocKi, CreateUser, CreateTime)
        VALUES (@Title, @Description, @KhoiID, @MonHocID, @NienKhoa, @HocKi, @sys_UserID, GETDATE());

        SELECT SyllabusID = SCOPE_IDENTITY();
    END;
END;
GO

-- Xóa Syllabus
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Syllabus_Delete]
    @SyllabusID INT,
    @sys_UserID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

    UPDATE dbo.tblEL_Syllabus
    SET IsDeleted = 1,
        UpdateUser = @sys_UserID,
        UpdateTime = GETDATE()
    WHERE SyllabusID = @SyllabusID;
END;
GO

-- Thêm/Sửa SyllabusNode
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_SyllabusNode_Save]
    @NodeID INT = 0,
    @SyllabusID INT,
    @ParentID INT = NULL,
    @Title NVARCHAR(255),
    @NodeType VARCHAR(20), -- 'CHAPTER' hoặc 'LESSON'
    @SortOrder INT = 0,
    @sys_UserID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

    IF LTRIM(RTRIM(@Title)) = '' BEGIN RAISERROR(N'Tiêu đề bài/chương không được để trống.', 16, 1); RETURN; END;

    IF @NodeID > 0
    BEGIN
        UPDATE dbo.tblEL_SyllabusNode
        SET Title = @Title,
            ParentID = @ParentID,
            NodeType = @NodeType,
            SortOrder = @SortOrder,
            UpdateUser = @sys_UserID,
            UpdateTime = GETDATE()
        WHERE NodeID = @NodeID;

        SELECT NodeID FROM dbo.tblEL_SyllabusNode WHERE NodeID = @NodeID;
    END;
    ELSE
    BEGIN
        IF ISNULL(@SortOrder, 0) = 0
        BEGIN
            SELECT @SortOrder = ISNULL(MAX(SortOrder), 0) + 10
            FROM dbo.tblEL_SyllabusNode
            WHERE SyllabusID = @SyllabusID
              AND ISNULL(ParentID, 0) = ISNULL(@ParentID, 0)
              AND IsDeleted = 0;
        END;

        INSERT INTO dbo.tblEL_SyllabusNode (SyllabusID, ParentID, Title, NodeType, SortOrder, CreateUser, CreateTime)
        VALUES (@SyllabusID, @ParentID, @Title, @NodeType, @SortOrder, @sys_UserID, GETDATE());

        SELECT NodeID = SCOPE_IDENTITY();
    END;
END;
GO

-- Xóa SyllabusNode
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_SyllabusNode_Delete]
    @NodeID INT,
    @sys_UserID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

    UPDATE dbo.tblEL_SyllabusNode
    SET IsDeleted = 1,
        UpdateUser = @sys_UserID,
        UpdateTime = GETDATE()
    WHERE NodeID = @NodeID;

    -- Xóa các node con trực tiếp
    UPDATE dbo.tblEL_SyllabusNode
    SET IsDeleted = 1,
        UpdateUser = @sys_UserID,
        UpdateTime = GETDATE()
    WHERE ParentID = @NodeID;
END;
GO

-- Cập nhật cấu trúc cây sau khi kéo thả (Update Tree Structure)
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_SyllabusNode_UpdateTreeStructure]
    @JsonData NVARCHAR(MAX),
    @sys_UserID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

    UPDATE T
    SET 
        T.SortOrder = J.sortOrder,
        T.ParentID = J.parentId,
        T.UpdateUser = @sys_UserID,
        T.UpdateTime = GETDATE()
    FROM 
        dbo.tblEL_SyllabusNode AS T
    INNER JOIN 
        OPENJSON(@JsonData) WITH (
            id INT '$.id',
            sortOrder INT '$.order',
            parentId INT '$.parent'
        ) AS J ON T.NodeID = J.id;

    SELECT Success = 1, Message = N'Đã cập nhật cấu trúc cây chương trình học.';
END;
GO

-- Sao chép cấu trúc chương trình học từ một Syllabus nguồn sang Syllabus đích
CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Syllabus_CloneStructure]
    @SourceSyllabusID INT,
    @TargetSyllabusID INT,
    @sys_UserID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

    -- 1. Kiểm tra tồn tại của Source và Target
    IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_Syllabus WHERE SyllabusID = @SourceSyllabusID AND IsDeleted = 0)
    BEGIN
        RAISERROR(N'Chương trình học nguồn không tồn tại.', 16, 1);
        RETURN;
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_Syllabus WHERE SyllabusID = @TargetSyllabusID AND IsDeleted = 0)
    BEGIN
        RAISERROR(N'Chương trình học đích không tồn tại.', 16, 1);
        RETURN;
    END;

    -- 2. Xóa các node cũ của Target (nếu có)
    UPDATE dbo.tblEL_SyllabusNode
    SET IsDeleted = 1,
        UpdateUser = @sys_UserID,
        UpdateTime = GETDATE()
    WHERE SyllabusID = @TargetSyllabusID;

    -- Bảng tạm để lưu trữ quá trình ánh xạ ID cũ -> ID mới
    DECLARE @NodeMap TABLE (
        OldNodeID INT PRIMARY KEY,
        NewNodeID INT NULL,
        ParentID_Old INT NULL,
        Title NVARCHAR(255),
        NodeType VARCHAR(20),
        SortOrder INT,
        Processed BIT DEFAULT 0
    );

    -- Nạp toàn bộ cấu trúc cây nguồn vào bảng tạm
    INSERT INTO @NodeMap (OldNodeID, ParentID_Old, Title, NodeType, SortOrder)
    SELECT NodeID, ParentID, Title, NodeType, SortOrder
    FROM dbo.tblEL_SyllabusNode
    WHERE SyllabusID = @SourceSyllabusID
      AND IsDeleted = 0;

    -- Vòng lặp copy: copy cấp root trước
    WHILE EXISTS (SELECT 1 FROM @NodeMap WHERE Processed = 0)
    BEGIN
        DECLARE @CurrentOldID INT, @ParentOldID INT, @Title NVARCHAR(255), @NodeType VARCHAR(20), @SortOrder INT;
        
        DECLARE cur CURSOR LOCAL FOR
        SELECT OldNodeID, ParentID_Old, Title, NodeType, SortOrder
        FROM @NodeMap
        WHERE Processed = 0
          AND (ParentID_Old IS NULL OR ParentID_Old IN (SELECT OldNodeID FROM @NodeMap WHERE NewNodeID IS NOT NULL));

        OPEN cur;
        FETCH NEXT FROM cur INTO @CurrentOldID, @ParentOldID, @Title, @NodeType, @SortOrder;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            DECLARE @NewParentID INT = NULL;
            IF @ParentOldID IS NOT NULL
            BEGIN
                SELECT @NewParentID = NewNodeID FROM @NodeMap WHERE OldNodeID = @ParentOldID;
            END;

            -- Chèn node mới vào bảng thật
            INSERT INTO dbo.tblEL_SyllabusNode (SyllabusID, ParentID, Title, NodeType, SortOrder, CreateUser, CreateTime)
            VALUES (@TargetSyllabusID, @NewParentID, @Title, @NodeType, @SortOrder, @sys_UserID, GETDATE());

            DECLARE @NewNodeID INT = SCOPE_IDENTITY();

            -- Cập nhật ánh xạ ID mới
            UPDATE @NodeMap
            SET NewNodeID = @NewNodeID,
                Processed = 1
            WHERE OldNodeID = @CurrentOldID;

            FETCH NEXT FROM cur INTO @CurrentOldID, @ParentOldID, @Title, @NodeType, @SortOrder;
        END;

        CLOSE cur;
        DEALLOCATE cur;
    END;

    SELECT Success = 1, Message = N'Sao chép cấu trúc chương trình học thành công.';
END;
GO
