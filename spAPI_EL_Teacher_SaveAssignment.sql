USE [LMS-LHBS];
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Teacher_SaveAssignment]    Script Date: 2026-06-03 9:09:31 AM ******/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
ALTER PROCEDURE [dbo].[spAPI_EL_Teacher_SaveAssignment]
    @AssignmentID              INT = 0
  , @AssignToClassID           INT = 0
  , @MonHocID                  INT
  , @KhoiID                    INT
  , @Title                     NVARCHAR(255)
  , @Instructions              NVARCHAR(MAX)
  , @AssignmentConfig          NVARCHAR(MAX)
  , @AssignmentConfig_NoAnswer NVARCHAR(MAX)
  , @MaxScore                  FLOAT
  , @NienKhoa                  INT
  , @HocKi                     TINYINT
  , @Is_Full_Quiz              BIT
  , @IsBlockCopy_Paste         BIT
  , @IntegrationSource         NVARCHAR(200)
  , @sys_UserID                VARCHAR(9)
AS
BEGIN
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);
    IF ISJSON(@AssignmentConfig) = 0
    BEGIN
        RAISERROR('AssignmentConfig is not a valid JSON.', 16, 1);
        RETURN;
    END;

    --Kiểm tra @AssignToClassID có chưa?
    --Nếu có thì thì update vô bảng AssignToClass
    --Còn không thì về bảng Assignment
    IF (@AssignToClassID > 0)
    BEGIN
        UPDATE dbo.tblEL_AssignToClass
        SET    AssignmentConfig = @AssignmentConfig
             , AssignmentConfig_NoAnswer = @AssignmentConfig_NoAnswer
             , MaxScore = @MaxScore
             , UpdateUser = @sys_UserID
             , UpdateTime = GETDATE()
             , Is_Full_Quiz = @Is_Full_Quiz
             , LimitAssigned = CASE WHEN @Is_Full_Quiz = 1 THEN LimitAssigned ELSE 1 END
        WHERE
               AssignToClassID = @AssignToClassID;
    END;
    ELSE
    BEGIN
        IF @AssignmentID > 0
        BEGIN
            UPDATE dbo.tblEL_Assignments
            SET    Title = ISNULL(@Title, Title)
                 , Instructions = ISNULL(@Instructions, Instructions)
                 , MonHocID = ISNULL(@MonHocID, MonHocID)
                 , KhoiID = ISNULL(@KhoiID, KhoiID)
                 , AssignmentConfig = ISNULL(@AssignmentConfig, AssignmentConfig)
                 , AssignmentConfig_NoAnswer = ISNULL(@AssignmentConfig_NoAnswer, AssignmentConfig_NoAnswer)
                 , HocKi = ISNULL(@HocKi, HocKi)
                 , IsBlockCopy_Paste = ISNULL(@IsBlockCopy_Paste, IsBlockCopy_Paste)
                 , MaxScore = ISNULL(@MaxScore, MaxScore)
                 , IntegrationSource = ISNULL(@IntegrationSource, IntegrationSource)
                 , UpdateTime = GETDATE()
                 , UpdateUser = @sys_UserID
            WHERE
                   AssignmentID = @AssignmentID; --AND CreateUser = @sys_UserID;
            SELECT *
            FROM
                   dbo.tblEL_Assignments
            WHERE
                   AssignmentID = @AssignmentID;
        END;
        ELSE
        BEGIN
            INSERT INTO dbo.tblEL_Assignments
            (
                MonHocID
              , KhoiID
              , Title
              , Instructions
              , AssignmentConfig
              , NienKhoa
              , HocKi
              , IsBlockCopy_Paste
              , MaxScore
              , IntegrationSource
              , CreateUser
            )
            VALUES
            (
                @MonHocID
              , @KhoiID
              , @Title
              , @Instructions
              , @AssignmentConfig
              , @NienKhoa
              , @HocKi
              , @IsBlockCopy_Paste
              , @MaxScore
              , @IntegrationSource
              , @sys_UserID
            );
            SELECT AssignmentID = SCOPE_IDENTITY();
        END;
    END;
END;
