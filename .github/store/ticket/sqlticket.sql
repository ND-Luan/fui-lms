USE [LMS-LHBS]
GO

-- =============================================
-- 0a. FIX: Patch NULL IsDeleted in TicketComments (existing rows)
-- =============================================
UPDATE [dbo].[TicketComments] SET [IsDeleted] = 0 WHERE [IsDeleted] IS NULL;
GO

-- Add DEFAULT constraint so new rows never get NULL
IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.TicketComments')
      AND name = 'DF_TicketComments_IsDeleted'
)
BEGIN
    ALTER TABLE [dbo].[TicketComments]
        ADD CONSTRAINT [DF_TicketComments_IsDeleted] DEFAULT (0) FOR [IsDeleted];
END
GO

-- =============================================
-- 0b. ALTER TABLE: Add CommentID to TicketAttachments
--    CommentID IS NULL  → attachment of the ticket itself
--    CommentID NOT NULL → attachment of a comment
-- =============================================
ALTER TABLE [dbo].[TicketAttachments]
    ADD [CommentID] INT NULL;
GO

ALTER TABLE [dbo].[TicketAttachments]
    ADD CONSTRAINT [FK_TicketAttachments_CommentID]
    FOREIGN KEY ([CommentID]) REFERENCES [dbo].[TicketComments]([CommentID]);
GO

/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_AddComment]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 2. ADD COMMENT (actor only)
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_AddComment]
    @TicketID INT,
    @Content NVARCHAR(MAX),
    @IsInternal BIT = 0,
    @IsIT BIT = 0,
    @AttachmentJSON NVARCHAR(MAX) = NULL,
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IsSeenByUser BIT = 0;
    DECLARE @IsSeenByIT BIT = 0;
    DECLARE @CommentID INT;

    IF (@IsInternal = 1)
    BEGIN
        SET @IsSeenByUser = 1;
        SET @IsSeenByIT = 1;
    END
    ELSE IF (@IsIT = 1)
    BEGIN
        SET @IsSeenByIT = 1;
        SET @IsSeenByUser = 0;
    END
    ELSE
    BEGIN
        SET @IsSeenByIT = 0;
        SET @IsSeenByUser = 1;
    END

    INSERT INTO TicketComments (
        TicketID, Content, IsInternal,
        IsSeenByUser, IsSeenByIT,
        IsDeleted, CreateUser, CreateTime
    )
    VALUES (
        @TicketID, @Content, @IsInternal,
        @IsSeenByUser, @IsSeenByIT,
        0, @SYS_USERID, GETDATE()
    );

    SET @CommentID = SCOPE_IDENTITY();

    IF (@AttachmentJSON IS NOT NULL AND LTRIM(RTRIM(@AttachmentJSON)) <> '')
    BEGIN
        INSERT INTO TicketAttachments (
            TicketID, CommentID, FileID, JSON_Annotation, CreateUser, CreateTime
        )
        SELECT @TicketID, @CommentID, FileID, JSON_Annotation, @SYS_USERID, GETDATE()
        FROM OPENJSON(@AttachmentJSON)
        WITH (
            FileID VARCHAR(100) '$.FileID',
            JSON_Annotation NVARCHAR(MAX) '$.Annotation'
        );
    END

    -- LOG (actor)
    INSERT INTO TicketLogs (TicketID, Action, Note, CreateUser, CreateTime)
    VALUES (@TicketID, 'COMMENT', @Content, @SYS_USERID, GETDATE());
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_Assign]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 3. ASSIGN (actor assigns owner)
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_Assign]
    @TicketID INT,
    @AssignedTo VARCHAR(9),
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @OldAssignedTo VARCHAR(9);

    SELECT @OldAssignedTo = AssignedTo FROM Tickets WHERE TicketID = @TicketID;

    UPDATE Tickets
    SET AssignedTo = @AssignedTo,
        Status = 'IN_PROGRESS',
        UpdateUser = @SYS_USERID,
        UpdateTime = GETDATE()
    WHERE TicketID = @TicketID AND IsDeleted = 0;

    -- LOG (actor = SYS_USERID, owner change tracked)
    INSERT INTO TicketLogs (TicketID, Action, OldValue, NewValue, CreateUser, CreateTime)
    VALUES (@TicketID, 'ASSIGN', @OldAssignedTo, @AssignedTo, @SYS_USERID, GETDATE());
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_Create]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- FINAL VERSION (Correct Actor vs Owner)
-- Actor = @SYS_USERID
-- Owner = AssignedTo
-- =============================================

-- =============================================
-- 1. ALTER TICKET
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_Create]
    @Title NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @Url NVARCHAR(1000) = NULL,
    @Browser NVARCHAR(255) = NULL,
    @Os NVARCHAR(255) = NULL,
    @AttachmentJSON NVARCHAR(MAX) = NULL,
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TicketID INT;

    INSERT INTO Tickets (
        Title, Description, Status,
        Url, Browser, Os,
        CreateUser, CreateTime
    )
    VALUES (
        @Title, @Description, 'OPEN',
        @Url, @Browser, @Os,
        @SYS_USERID, GETDATE()
    );

    SET @TicketID = SCOPE_IDENTITY();

    IF (@AttachmentJSON IS NOT NULL AND LTRIM(RTRIM(@AttachmentJSON)) <> '')
    BEGIN
        INSERT INTO TicketAttachments (
            TicketID, FileID, JSON_Annotation, CreateUser, CreateTime
        )
        SELECT @TicketID, FileID, JSON_Annotation, @SYS_USERID, GETDATE()
        FROM OPENJSON(@AttachmentJSON)
        WITH (
            FileID VARCHAR(100) '$.FileID',
            JSON_Annotation NVARCHAR(MAX) '$.Annotation'
        );
    END

    -- LOG (actor = SYS_USERID)
    INSERT INTO TicketLogs (TicketID, Action, NewValue, CreateUser, CreateTime)
    VALUES (@TicketID, 'CREATE', @Title, @SYS_USERID, GETDATE());

    SELECT @TicketID AS TicketID;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_Delete]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 5. DELETE
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_Delete]
    @TicketID INT,
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Tickets
    SET IsDeleted = 1,
        UpdateUser = @SYS_USERID,
        UpdateTime = GETDATE()
    WHERE TicketID = @TicketID;

    INSERT INTO TicketLogs (TicketID, Action, CreateUser, CreateTime)
    VALUES (@TicketID, 'DELETE', @SYS_USERID, GETDATE());
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_GetDetail]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 7. GET DETAIL
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_GetDetail]
    @TicketID INT,
    @IsIT BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * FROM Tickets WHERE TicketID = @TicketID AND IsDeleted = 0;

    -- Result set 2: ticket-level attachments only (CommentID IS NULL)
    SELECT * FROM TicketAttachments
    WHERE TicketID = @TicketID AND CommentID IS NULL AND IsDeleted = 0;

    -- Result set 3: comments
    SELECT * FROM TicketComments
    WHERE TicketID = @TicketID
      AND IsDeleted = 0
      AND (@IsIT = 1 OR IsInternal = 0)
    ORDER BY CreateTime ASC;

    -- Result set 4: logs (IT only — always emitted to keep result-set index stable)
    IF (@IsIT = 1)
        SELECT * FROM TicketLogs
        WHERE TicketID = @TicketID
        ORDER BY CreateTime DESC;
    ELSE
        SELECT TOP 0 * FROM TicketLogs WHERE 1 = 0;

    -- Result set 5: comment attachments (keyed by CommentID for frontend mapping)
    SELECT ta.*
    FROM TicketAttachments ta
    INNER JOIN TicketComments c ON c.CommentID = ta.CommentID
    WHERE c.TicketID = @TicketID
      AND c.IsDeleted = 0
      AND ta.IsDeleted = 0
      AND (@IsIT = 1 OR c.IsInternal = 0)
    ORDER BY ta.CreateTime ASC;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_GetList]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- 6. GET LIST
-- =============================================
ALTER PROC [dbo].[spAPI_Ticket_GetList]
    @Status VARCHAR(20) = NULL,
    @AssignedTo VARCHAR(9) = NULL,
    @CreateUser VARCHAR(9) = NULL,
    @IsIT BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        t.TicketID,
        t.Title,
        t.Status,
        t.AssignedTo,
        t.CreateUser,
        t.CreateTime,
        (SELECT COUNT(*) FROM TicketComments c
         WHERE c.TicketID = t.TicketID
           AND c.IsSeenByIT = 0) AS UnreadIT,
        (SELECT COUNT(*) FROM TicketComments c
         WHERE c.TicketID = t.TicketID
           AND c.IsSeenByUser = 0
           AND c.IsInternal = 0) AS UnreadUser
    FROM Tickets t
    WHERE t.IsDeleted = 0
      AND (@Status IS NULL OR t.Status = @Status)
      AND (@AssignedTo IS NULL OR t.AssignedTo = @AssignedTo)
      AND (@CreateUser IS NULL OR t.CreateUser = @CreateUser)
    ORDER BY t.CreateTime DESC;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_GetUnreadCount]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 9. GET UNREAD COUNT
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_GetUnreadCount]
    @TicketID INT,
    @IsIT BIT
AS
BEGIN
    SET NOCOUNT ON;

    IF (@IsIT = 1)
    BEGIN
        SELECT COUNT(*) AS UnreadCount
        FROM TicketComments
        WHERE TicketID = @TicketID AND IsSeenByIT = 0;
    END
    ELSE
    BEGIN
        SELECT COUNT(*) AS UnreadCount
        FROM TicketComments
        WHERE TicketID = @TicketID
          AND IsSeenByUser = 0
          AND IsInternal = 0;
    END
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_MarkAsSeen]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 8. MARK AS SEEN
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_MarkAsSeen]
    @TicketID INT,
    @IsIT BIT,
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    IF (@IsIT = 1)
    BEGIN
        UPDATE TicketComments
        SET IsSeenByIT = 1
        WHERE TicketID = @TicketID AND IsSeenByIT = 0;
    END
    ELSE
    BEGIN
        UPDATE TicketComments
        SET IsSeenByUser = 1
        WHERE TicketID = @TicketID
          AND IsSeenByUser = 0
          AND IsInternal = 0;
    END
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_UpdateStatus]    Script Date: 2026-04-21 4:14:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 4. UPDATE STATUS
-- =============================================
ALTER   PROC [dbo].[spAPI_Ticket_UpdateStatus]
    @TicketID INT,
    @Status VARCHAR(20),
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @OldStatus VARCHAR(20);

    SELECT @OldStatus = Status FROM Tickets WHERE TicketID = @TicketID;

    UPDATE Tickets
    SET Status = @Status,
        UpdateUser = @SYS_USERID,
        UpdateTime = GETDATE()
    WHERE TicketID = @TicketID AND IsDeleted = 0;

    INSERT INTO TicketLogs (TicketID, Action, OldValue, NewValue, CreateUser, CreateTime)
    VALUES (@TicketID, 'STATUS', @OldStatus, @Status, @SYS_USERID, GETDATE());
END
GO
