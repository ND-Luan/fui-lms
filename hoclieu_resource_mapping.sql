USE [LMS-LHBS];
GO

/*
    Liên kết bài học/bài tập với cây học liệu số.
    Chỉ cho phép gắn vào node loại BAI thuộc học liệu loại HOC_LIEU.
*/
IF OBJECT_ID(N'dbo.tblEL_HocLieuResourceMapping', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblEL_HocLieuResourceMapping
    (
        MappingID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_tblEL_HocLieuResourceMapping PRIMARY KEY,
        ResourceType VARCHAR(20) NOT NULL,
        ResourceID INT NOT NULL,
        HocLieuID INT NOT NULL,
        NoiDungID INT NOT NULL,
        IsDeleted BIT NOT NULL CONSTRAINT DF_tblEL_HocLieuResourceMapping_IsDeleted DEFAULT 0,
        CreateUser VARCHAR(50) NULL,
        CreateTime DATETIME NOT NULL CONSTRAINT DF_tblEL_HocLieuResourceMapping_CreateTime DEFAULT GETDATE(),
        UpdateUser VARCHAR(50) NULL,
        UpdateTime DATETIME NULL,
        CONSTRAINT CK_tblEL_HocLieuResourceMapping_ResourceType CHECK (ResourceType IN ('LESSON', 'ASSIGNMENT'))
    );

    CREATE UNIQUE INDEX UX_tblEL_HocLieuResourceMapping_Resource
        ON dbo.tblEL_HocLieuResourceMapping (ResourceType, ResourceID)
        WHERE IsDeleted = 0;

    CREATE INDEX IX_tblEL_HocLieuResourceMapping_Node
        ON dbo.tblEL_HocLieuResourceMapping (HocLieuID, NoiDungID)
        WHERE IsDeleted = 0;

    ALTER TABLE dbo.tblEL_HocLieuResourceMapping
        ADD CONSTRAINT FK_tblEL_HocLieuResourceMapping_HocLieu
        FOREIGN KEY (HocLieuID) REFERENCES dbo.tblHocLieu_FP(HocLieuID);

    ALTER TABLE dbo.tblEL_HocLieuResourceMapping
        ADD CONSTRAINT FK_tblEL_HocLieuResourceMapping_Node
        FOREIGN KEY (NoiDungID) REFERENCES dbo.tblNoiDungHocLieu_FP(NoiDungID);
END;
GO

CREATE OR ALTER PROCEDURE dbo.spAPI_EL_HocLieuResource_Get
    @ResourceType VARCHAR(20),
    @ResourceID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP (1)
        m.MappingID,
        m.ResourceType,
        m.ResourceID,
        m.HocLieuID,
        m.NoiDungID,
        hl.TenHocLieu,
        nd.TenNoiDung,
        nd.ParentID,
        nd.LoaiNoiDung
    FROM dbo.tblEL_HocLieuResourceMapping m
    INNER JOIN dbo.tblHocLieu_FP hl ON hl.HocLieuID = m.HocLieuID
        AND hl.Loai = 'HOC_LIEU' AND hl.Is_Xoa = 0
    INNER JOIN dbo.tblNoiDungHocLieu_FP nd ON nd.NoiDungID = m.NoiDungID
        AND nd.HocLieuID = m.HocLieuID AND nd.LoaiNoiDung = 'BAI' AND nd.Is_Xoa = 0
    WHERE m.ResourceType = UPPER(@ResourceType)
      AND m.ResourceID = @ResourceID
      AND m.IsDeleted = 0;
END;
GO
GRANT EXECUTE ON dbo.spAPI_EL_HocLieuResource_Get TO [lmslhbs];
REVOKE EXECUTE ON dbo.spAPI_EL_HocLieuResource_Get FROM [public];
GO

CREATE OR ALTER PROCEDURE dbo.spAPI_EL_HocLieuResource_Save
    @ResourceType VARCHAR(20),
    @ResourceID INT,
    @HocLieuID INT = NULL,
    @NoiDungID INT = NULL,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @ResourceType = UPPER(LTRIM(RTRIM(@ResourceType)));

    IF @ResourceType NOT IN ('LESSON', 'ASSIGNMENT') OR @ResourceID IS NULL OR @ResourceID <= 0
        THROW 51001, N'Loại hoặc mã nội dung LMS không hợp lệ.', 1;

    IF @HocLieuID IS NULL OR @NoiDungID IS NULL
    BEGIN
        UPDATE dbo.tblEL_HocLieuResourceMapping
        SET IsDeleted = 1, UpdateUser = @sys_UserID, UpdateTime = GETDATE()
        WHERE ResourceType = @ResourceType AND ResourceID = @ResourceID AND IsDeleted = 0;
        SELECT @ResourceID AS ResourceID, @ResourceType AS ResourceType, CAST(0 AS BIT) AS IsLinked;
        RETURN;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.tblHocLieu_FP
        WHERE HocLieuID = @HocLieuID AND Loai = 'HOC_LIEU' AND Is_Xoa = 0
    )
        THROW 51002, N'Chỉ được liên kết với học liệu số loại HOC_LIEU.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM dbo.tblNoiDungHocLieu_FP
        WHERE NoiDungID = @NoiDungID AND HocLieuID = @HocLieuID
          AND LoaiNoiDung = 'BAI' AND Is_Xoa = 0
    )
        THROW 51003, N'Vị trí học liệu không hợp lệ; hãy chọn một node BAI.', 1;

    BEGIN TRANSACTION;
        IF EXISTS (
            SELECT 1 FROM dbo.tblEL_HocLieuResourceMapping
            WHERE ResourceType = @ResourceType AND ResourceID = @ResourceID AND IsDeleted = 0
        )
        BEGIN
            UPDATE dbo.tblEL_HocLieuResourceMapping
            SET HocLieuID = @HocLieuID, NoiDungID = @NoiDungID,
                UpdateUser = @sys_UserID, UpdateTime = GETDATE()
            WHERE ResourceType = @ResourceType AND ResourceID = @ResourceID AND IsDeleted = 0;
        END
        ELSE
        BEGIN
            UPDATE dbo.tblEL_HocLieuResourceMapping
            SET IsDeleted = 0, HocLieuID = @HocLieuID, NoiDungID = @NoiDungID,
                UpdateUser = @sys_UserID, UpdateTime = GETDATE()
            WHERE ResourceType = @ResourceType AND ResourceID = @ResourceID AND IsDeleted = 1;

            IF @@ROWCOUNT = 0
                INSERT INTO dbo.tblEL_HocLieuResourceMapping
                    (ResourceType, ResourceID, HocLieuID, NoiDungID, CreateUser, CreateTime)
                VALUES (@ResourceType, @ResourceID, @HocLieuID, @NoiDungID, @sys_UserID, GETDATE());
        END;
    COMMIT TRANSACTION;

    EXEC dbo.spAPI_EL_HocLieuResource_Get @ResourceType, @ResourceID;
END;
GO
GRANT EXECUTE ON dbo.spAPI_EL_HocLieuResource_Save TO [lmslhbs];
REVOKE EXECUTE ON dbo.spAPI_EL_HocLieuResource_Save FROM [public];
GO

/* Chỉ trả học liệu số; tài nguyên TAI_NGUYEN không được dùng làm mục lục. */
CREATE OR ALTER PROCEDURE dbo.spAPI_FP_HocLieu_GetByLopMon
    @KhoiID INT,
    @MonHocID INT,
    @sys_UserID VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT hl.HocLieuID, hl.TenHocLieu, hl.ThumbnailURL, hl.HocKy,
           bs.TenBoSach, bs.MoTa AS MoTaBoSach, hl.TinhTrang
    FROM dbo.tblHocLieu_FP hl
    INNER JOIN dbo.tblBoSach_FP bs ON hl.BoSachID = bs.BoSachID
    WHERE hl.KhoiID = @KhoiID
      AND hl.MonHocID = @MonHocID
      AND hl.Loai = 'HOC_LIEU'
      AND hl.Is_Xoa = 0
      AND bs.Is_Xoa = 0
      AND hl.TinhTrang = 'Public'
    ORDER BY hl.HocKy, hl.TenHocLieu;
END;
GO
GRANT EXECUTE ON dbo.spAPI_FP_HocLieu_GetByLopMon TO [lmslhbs];
REVOKE EXECUTE ON dbo.spAPI_FP_HocLieu_GetByLopMon FROM [public];
GO
