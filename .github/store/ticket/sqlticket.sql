USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_AddComment]    Script Date: 2026-04-09 9:39:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 4. Add Comment (chat / internal note)
-- =============================================
CREATE   PROC [dbo].[spAPI_Ticket_AddComment]
    @TicketID     INT,
    @Content      NVARCHAR(MAX),
    @IsInternal   BIT = 0,
    @SYS_USERID   VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO TicketComments (
        TicketID,
        Content,
        IsInternal,
        CreateUser,
        CreateTime
    )
    VALUES (
        @TicketID,
        @Content,
        @IsInternal,
        @SYS_USERID,
        GETDATE()
    );
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_Assign]    Script Date: 2026-04-09 9:39:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 5. Assign Ticket (set owner + move to IN_PROGRESS)
-- =============================================
CREATE   PROC [dbo].[spAPI_Ticket_Assign]
    @TicketID     INT,
    @AssignedTo   VARCHAR(9),
    @SYS_USERID   VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE t
    SET 
        t.AssignedTo = @AssignedTo,
        t.Status = 'IN_PROGRESS',
        t.UpdateUser = @SYS_USERID,
        t.UpdateTime = GETDATE()
    FROM Tickets t
    WHERE t.TicketID = @TicketID
      AND t.IsDeleted = 0;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_Create]    Script Date: 2026-04-09 9:39:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Ticket Module Stored Procedures (Using @SYS_USERID)
-- Version: FINAL (CREATE OR ALTER) + JSON_Annotation
-- =============================================

-- =============================================
-- 1. Create Ticket (with attachments + annotation JSON)
-- =============================================
CREATE   PROC [dbo].[spAPI_Ticket_Create]
    @Title          NVARCHAR(255),
    @Description    NVARCHAR(MAX),
    @Url            NVARCHAR(1000) = NULL,
    @Browser        NVARCHAR(255) = NULL,
    @Os             NVARCHAR(255) = NULL,

    @AttachmentJSON NVARCHAR(MAX) = NULL, -- [{"FileID":"abc","Annotation":"{...json...}"}]

    @SYS_USERID     VARCHAR(9)
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
        SELECT 
            @TicketID,
            j.FileID,
            j.JSON_Annotation,
            @SYS_USERID,
            GETDATE()
        FROM OPENJSON(@AttachmentJSON)
        WITH (
            FileID VARCHAR(100) '$.FileID',
            JSON_Annotation NVARCHAR(MAX) '$.Annotation'
        ) AS j
        WHERE j.FileID IS NOT NULL AND j.FileID <> '';
    END

    SELECT @TicketID AS TicketID;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_Delete]    Script Date: 2026-04-09 9:39:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 7. Delete Ticket (Soft delete)
-- =============================================
CREATE   PROC [dbo].[spAPI_Ticket_Delete]
    @TicketID     INT,
    @SYS_USERID   VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE t
    SET 
        t.IsDeleted = 1,
        t.UpdateUser = @SYS_USERID,
        t.UpdateTime = GETDATE()
    FROM Tickets t
    WHERE t.TicketID = @TicketID;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_GetDetail]    Script Date: 2026-04-09 9:39:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 3. Get Ticket Detail (ticket + attachments + comments)
-- =============================================
CREATE   PROC [dbo].[spAPI_Ticket_GetDetail]
    @TicketID INT,
    @IsIT BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Ticket
    SELECT * 
    FROM Tickets
    WHERE TicketID = @TicketID AND IsDeleted = 0;

    -- Attachments
    SELECT *
    FROM TicketAttachments
    WHERE TicketID = @TicketID AND IsDeleted = 0;

    -- Comments (hide internal for user)
    SELECT *
    FROM TicketComments
    WHERE TicketID = @TicketID
      AND IsDeleted = 0
      AND (@IsIT = 1 OR IsInternal = 0)
    ORDER BY CreateTime ASC;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_GetList]    Script Date: 2026-04-09 9:39:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 2. Get Ticket List (filter basic)
-- =============================================
CREATE   PROC [dbo].[spAPI_Ticket_GetList]
    @Status       VARCHAR(20) = NULL,
    @AssignedTo   VARCHAR(9) = NULL,
    @CreateUser   VARCHAR(9) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        t.TicketID,
        t.Title,
        t.Status,
        t.AssignedTo,
        t.CreateUser,
        t.CreateTime
    FROM Tickets t
    WHERE t.IsDeleted = 0
      AND (@Status IS NULL OR t.Status = @Status)
      AND (@AssignedTo IS NULL OR t.AssignedTo = @AssignedTo)
      AND (@CreateUser IS NULL OR t.CreateUser = @CreateUser)
    ORDER BY t.CreateTime DESC;
END
GO
/****** Object:  StoredProcedure [dbo].[spAPI_Ticket_UpdateStatus]    Script Date: 2026-04-09 9:39:19 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- 6. Update Status
-- =============================================
CREATE   PROC [dbo].[spAPI_Ticket_UpdateStatus]
    @TicketID     INT,
    @Status       VARCHAR(20),
    @SYS_USERID   VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE t
    SET 
        t.Status = @Status,
        t.UpdateUser = @SYS_USERID,
        t.UpdateTime = GETDATE()
    FROM Tickets t
    WHERE t.TicketID = @TicketID
      AND t.IsDeleted = 0;
END
GO
