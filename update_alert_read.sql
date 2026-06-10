-- ===================================================================
-- SCRIPT CẬP NHẬT DATABASE CHO TÍNH NĂNG ĐÃ XEM THÔNG BÁO (ALERTS)
-- Người dùng chạy script này trực tiếp trên SQL Server Database.
-- ===================================================================

-- 1. Tạo bảng lưu vết đọc thông báo nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tblAlertRead]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tblAlertRead](
        [AlertReadID] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
        [AlertID] [int] NOT NULL,
        [UserID] [varchar](20) NOT NULL,
        [ReadTime] [datetime] NOT NULL DEFAULT (getdate())
    )
    
    -- Thêm Index để tối ưu truy vấn
    CREATE NONCLUSTERED INDEX [IX_tblAlertRead_Alert_User] ON [dbo].[tblAlertRead] ([AlertID], [UserID])
END
GO

-- 2. Thêm cột UserRight vào bảng tblAlert nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[tblAlert]') AND name = N'UserRight')
BEGIN
    ALTER TABLE [dbo].[tblAlert] ADD [UserRight] VARCHAR(50) NULL;
END
GO

-- 3. Tạo/Cập nhật Procedure đánh dấu đã xem thông báo
CREATE OR ALTER PROCEDURE [dbo].[spAPI_Alert_MarkAsRead]
    @AlertID    INT,
    @UserID     VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Kiểm tra nếu chưa tồn tại vết thì ghi nhận vào bảng
    IF NOT EXISTS (SELECT 1 FROM tblAlertRead WHERE AlertID = @AlertID AND UserID = @UserID)
    BEGIN
        INSERT INTO tblAlertRead (AlertID, UserID, ReadTime)
        VALUES (@AlertID, @UserID, GETDATE());
    END
END
GO

-- 4. Tạo/Cập nhật Procedure thêm thông báo mới
CREATE OR ALTER PROCEDURE [dbo].[spAPI_Alert_Insert]
    @TypeAlert      VARCHAR(100),
    @ContentAlert   NVARCHAR(100),
    @DateAlert      DATETIME,
    @CapID          INT,
    @NienKhoa       INT,
    @SYS_USERID     VARCHAR(20),
    @UserRight      VARCHAR(50) = 'ALL'
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO tblAlert (TypeAlert, ContentAlert, DateAlert, CapID, NienKhoa, Enable, CreateUser, CreateTime, UpdateUser, UpdateTime, UserRight)
    VALUES (@TypeAlert, @ContentAlert, @DateAlert, @CapID, @NienKhoa, 1, @SYS_USERID, GETDATE(), @SYS_USERID, GETDATE(), @UserRight);
    
    SELECT SCOPE_IDENTITY() AS AlertID;
END
GO

-- 5. Tạo/Cập nhật Procedure sửa thông báo
CREATE OR ALTER PROCEDURE [dbo].[spAPI_Alert_Update]
    @AlertID        INT,
    @TypeAlert      VARCHAR(100),
    @ContentAlert   NVARCHAR(100),
    @DateAlert      DATETIME,
    @CapID          INT,
    @NienKhoa       INT,
    @SYS_USERID     VARCHAR(20),
    @UserRight      VARCHAR(50) = 'ALL'
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE tblAlert
    SET TypeAlert = @TypeAlert,
        ContentAlert = @ContentAlert,
        DateAlert = @DateAlert,
        CapID = @CapID,
        NienKhoa = @NienKhoa,
        UpdateUser = @SYS_USERID,
        UpdateTime = GETDATE(),
        UserRight = @UserRight
    WHERE AlertID = @AlertID;
END
GO

-- 6. Cập nhật Procedure spAPI_Alert_Get để loại trừ những thông báo đã đọc và lọc theo UserRight
CREATE OR ALTER PROCEDURE [dbo].[spAPI_Alert_Get]
    @AlertID            INT           = 0,
    @CapID              INT           = 0,
    @NienKhoa           INT           = 0,
    @TypeAlert          VARCHAR(100)  = '',
    @UserID             VARCHAR(20)   = '', -- Hỗ trợ truyền tay từ client (nếu có)
    @GroupID            INT           = 0,  -- Hỗ trợ truyền tay từ client (nếu có)
    @SystemRight        VARCHAR(50)   = '', -- Hỗ trợ truyền tay từ client (nếu có)
    @IsAdminQuery       INT           = 0,  -- 1: Bỏ qua lọc quyền để admin xem hết quản lý
    @sys_UserID         VARCHAR(20)   = '', -- Tự động tiêm từ session backend
    @sys_GroupID        INT           = 0,  -- Tự động tiêm từ session backend (1: GV, 2: PH, 3: HS)
    @sys_DepartmentID   VARCHAR(9)    = '', -- Tự động tiêm từ session backend
    @sys_SystemRight    INT           = 0,  -- Tự động tiêm từ session backend (1, 2, 3, 5, 9)
    @sys_FunctionRight  VARCHAR(2000) = ''  -- Tự động tiêm từ session backend
AS
BEGIN
    SET NOCOUNT ON;

    -- Map fallback values để tương thích cả cơ chế session backend tự động lẫn truyền tay từ client
    DECLARE @TargetUserID VARCHAR(20);
    SET @TargetUserID = ISNULL(NULLIF(@sys_UserID, ''), @UserID);

    DECLARE @TargetGroupID INT;
    SET @TargetGroupID = CASE WHEN ISNULL(@sys_GroupID, 0) > 0 THEN @sys_GroupID ELSE @GroupID END;

    DECLARE @TargetSystemRight INT;
    SET @TargetSystemRight = CASE WHEN ISNULL(@sys_SystemRight, 0) > 0 THEN @sys_SystemRight ELSE TRY_CAST(@SystemRight AS INT) END;

    SELECT
        a.AlertID, a.TypeAlert, a.ContentAlert, a.DateAlert,
        a.CapID, a.NienKhoa, a.Enable,
        a.CreateUser, a.CreateTime,
        a.UpdateUser, a.UpdateTime,
        a.UserRight,
        CASE WHEN r.AlertID IS NOT NULL THEN 1 ELSE 0 END AS IsRead
    FROM tblAlert a
    LEFT JOIN tblAlertRead r ON a.AlertID = r.AlertID AND r.UserID = @TargetUserID
    WHERE
        (ISNULL(@AlertID, 0) = 0 OR a.AlertID = @AlertID)
        AND (ISNULL(@NienKhoa, 0) = 0 OR a.NienKhoa = @NienKhoa)
        AND (ISNULL(@TypeAlert, '') = '' OR a.TypeAlert = @TypeAlert)
        AND (ISNULL(@CapID, 0) = 0 OR a.CapID = @CapID OR a.CapID = 0)
        AND a.Enable = 1
        -- Lọc theo đối tượng nhận thông báo (UserRight)
        AND (
            @IsAdminQuery = 1
            OR a.UserRight IS NULL 
            OR a.UserRight = '' 
            OR a.UserRight = 'ALL'
            OR (a.UserRight = 'STUDENT' AND @TargetGroupID = 3)
            OR (a.UserRight = '3' AND @TargetGroupID = 3)
            OR (a.UserRight = 'TEACHER' AND @TargetGroupID = 1)
            -- Lọc chi tiết theo vai trò Giáo viên (sys_GroupID = 1 và khớp sys_SystemRight)
            OR (@TargetGroupID = 1 AND (
                (a.UserRight = '1' AND @TargetSystemRight = 1)
                OR (a.UserRight = '2' AND @TargetSystemRight = 2)
                OR (a.UserRight = '3' AND @TargetSystemRight = 3)
                OR (a.UserRight = '5' AND @TargetSystemRight = 5)
                OR (a.UserRight = '9' AND @TargetSystemRight = 9)
            ))
            -- Phục vụ màn hình quản lý admin-alert (khi không chạy qua session hoặc không có sys_UserID / sys_GroupID)
            OR (ISNULL(@TargetUserID, '') = '' AND ISNULL(@TargetGroupID, 0) = 0)
        )
    ORDER BY a.DateAlert DESC;
END
GO
