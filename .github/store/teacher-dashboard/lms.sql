USE [LMS-LHBS];
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Teacher_Dashboard_Update_IsHided]    Script Date: 2026-05-05 2:43:33 PM ******/
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
ALTER PROCEDURE [dbo].[spAPI_EL_Teacher_Dashboard_Update_IsHided]
    @AssignToClassID   INT
  , @AssignToStudentID INT
  , @SYS_USERID        VARCHAR(9)
AS
BEGIN
    IF (@AssignToClassID > 0)
    BEGIN
        UPDATE tblEL_AssignToClass
        SET    IsHided = CASE WHEN CAST(ISNULL(IsHided, 0) AS INT) = 0 THEN 1 ELSE 0 END
             , UpdateTime = GETDATE()
             , UpdateUser = @SYS_USERID
        WHERE
               AssignToClassID = @AssignToClassID;
        SELECT *
        FROM
               tblEL_AssignToClass
        WHERE
               AssignToClassID = @AssignToClassID;
    END;
    ELSE IF (@AssignToStudentID > 0)
    BEGIN
        UPDATE dbo.tblEL_AssignToStudent
        SET    IsHided = CASE WHEN CAST(ISNULL(IsHided, 0) AS INT) = 0 THEN 1 ELSE 0 END
             , UpdateTime = GETDATE()
             , UpdateUser = @SYS_USERID
        WHERE
               AssignToStudentID = @AssignToStudentID;
        SELECT *
        FROM
               dbo.tblEL_AssignToStudent
        WHERE
               AssignToStudentID = @AssignToStudentID;
    END;




END;