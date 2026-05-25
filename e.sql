USE [LMS-LHBS]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*
    One-time token cho luong nop bai hoc sinh.
    Muc tieu: chi cap token ngan han khi hoc sinh bam Nop bai,
    va SaveSubmission chi chap nhan trang thai nop/cham khi token hop le.
*/

IF OBJECT_ID('dbo.tblEL_Student_SubmitTokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tblEL_Student_SubmitTokens
    (
        SubmitTokenID      BIGINT IDENTITY(1,1) PRIMARY KEY,
        AssignToClassID    INT NULL,
        AssignToStudentID  INT NULL,
        HocSinhID          INT NOT NULL,
        TokenHash          VARBINARY(32) NOT NULL,
        ExpireTime         DATETIME2(0) NOT NULL,
        IsUsed             BIT NOT NULL CONSTRAINT DF_tblEL_Student_SubmitTokens_IsUsed DEFAULT (0),
        UsedTime           DATETIME2(0) NULL,
        CreateTime         DATETIME2(0) NOT NULL CONSTRAINT DF_tblEL_Student_SubmitTokens_CreateTime DEFAULT (SYSDATETIME()),
        CreateUser         VARCHAR(9) NULL,
        CONSTRAINT CK_tblEL_Student_SubmitTokens_Target CHECK (
            (AssignToClassID IS NOT NULL AND AssignToStudentID IS NULL)
            OR (AssignToClassID IS NULL AND AssignToStudentID IS NOT NULL)
        )
    );

    CREATE INDEX IX_tblEL_Student_SubmitTokens_Validate
        ON dbo.tblEL_Student_SubmitTokens(HocSinhID, AssignToClassID, AssignToStudentID, IsUsed, ExpireTime)
        INCLUDE (TokenHash);
END;
GO

BEGIN TRY
    IF NOT EXISTS
    (
        SELECT 1
        FROM fn_listextendedproperty('MS_Description', 'SCHEMA', 'dbo', 'TABLE', 'tblEL_Student_SubmitTokens', NULL, NULL)
    )
    BEGIN
        EXEC sys.sp_addextendedproperty
            @name = N'MS_Description',
            @value = N'Bang luu one-time token cho luong hoc sinh nop bai. Token chi dung mot lan, co thoi han ngan de han che goi API trai phep.',
            @level0type = N'SCHEMA', @level0name = N'dbo',
            @level1type = N'TABLE',  @level1name = N'tblEL_Student_SubmitTokens';
    END;
END TRY
BEGIN CATCH
    -- Bo qua neu DB khong cho phep cap nhat extended property trong moi truong hien tai.
END CATCH;
GO

ALTER PROCEDURE [dbo].[spAPI_EL_Student_SubmitToken_Begin]
      @HocSinhID         INT
    , @AssignToClassID   INT = NULL
    , @AssignToStudentID INT = NULL
    , @sys_UserID        VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    IF (@AssignToClassID IS NULL AND @AssignToStudentID IS NULL)
    OR (@AssignToClassID IS NOT NULL AND @AssignToStudentID IS NOT NULL)
    BEGIN
        RAISERROR(N'Yeu cau token khong hop le: chi duoc chon 1 loai bai giao.', 16, 1);
        RETURN;
    END;

    -- TTL ngan: 30 giay
    DECLARE @Now DATETIME2(0) = SYSDATETIME();
    DECLARE @ExpireTime DATETIME2(0) = DATEADD(SECOND, 30, @Now);

    -- Don dep token het han/chua dung de tranh phinh bang.
    DELETE TOP (200)
    FROM dbo.tblEL_Student_SubmitTokens
    WHERE IsUsed = 0
      AND ExpireTime < DATEADD(MINUTE, -5, @Now);

    DECLARE @TokenBytes VARBINARY(32) = CRYPT_GEN_RANDOM(32);
    DECLARE @TokenPlain VARCHAR(128) = CONVERT(VARCHAR(128), @TokenBytes, 2); -- Hex string
    DECLARE @TokenHash VARBINARY(32) = HASHBYTES('SHA2_256', @TokenPlain);

    INSERT INTO dbo.tblEL_Student_SubmitTokens
    (
        AssignToClassID,
        AssignToStudentID,
        HocSinhID,
        TokenHash,
        ExpireTime,
        CreateUser
    )
    VALUES
    (
        @AssignToClassID,
        @AssignToStudentID,
        @HocSinhID,
        @TokenHash,
        @ExpireTime,
        @sys_UserID
    );

    SELECT
        @TokenPlain AS SubmitToken,
        @ExpireTime AS ExpireTime;
END;
GO
