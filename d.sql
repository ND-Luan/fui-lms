USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Student_GetAssignmentDetail_AssignToStudent]    Script Date: 2026-05-25 11:18:03 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
--  [dbo].[spAPI_EL_Student_GetAssignmentDetail] 193, '22200036'
ALTER PROCEDURE [dbo].[spAPI_EL_Student_GetAssignmentDetail_AssignToStudent]
    @AssignToStudentID INT
  , @HocSinhID         INT
  , @LanNop            INT = 1
  , @sys_UserID        VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @LanNop = COALESCE(@LanNop, 1);
    DECLARE @NienKhoa_HienTai INT = dbo.fn_GetNienKhoa_HienTai();
    DECLARE @AssignedUnitID VARCHAR(10);

    IF @AssignToStudentID IS NULL
    OR NOT EXISTS
    (
        SELECT AssignToStudentID
        FROM
               tblEL_AssignToStudent
        WHERE
               AssignToStudentID = @AssignToStudentID
          AND  HocSinhID          = @HocSinhID
    )
    BEGIN
        RAISERROR(N'Không tìm thấy thông tin giao bài.', 16, 1);
        RETURN;
    END;



    DECLARE @SubmissionStatus INT;
    DECLARE @AssignmentConfig_Submission NVARCHAR(MAX);
    SELECT TOP 1
           @SubmissionStatus            = SubmissionStatus
         , @AssignmentConfig_Submission = AssignmentConfig
    FROM
           dbo.tblEL_Submissions
    WHERE
           AssignToStudentID = @AssignToStudentID
      AND  HocSinhID          = @HocSinhID;


    -- Nếu đã qua được bước kiểm tra quyền, các câu lệnh SELECT bên dưới có thể chạy an toàn.
    -- === Bảng 1: Thông tin Assignment (Đề bài) ===
    SELECT ats.AssignmentID
         , asm.Title
         , asm.Instructions
         , CASE
                WHEN @AssignmentConfig_Submission IS NULL THEN ats.AssignmentConfig_NoAnswer
                ELSE @AssignmentConfig_Submission
           END                                                                   AS AssignmentConfig
         , CASE WHEN @SubmissionStatus = 4 THEN ats.AssignmentConfig ELSE '' END AS AssignmentConfig_HadAnswer
         , ats.DueDate
         , ats.MaxScore
         , mh.MonHocName
         , ats.AssignToStudentID
         , asm.KhoiID
         , asm.MonHocID
         , asm.IsBlockCopy_Paste
		 , ats.Is_Full_Quiz
         , CASE WHEN @AssignmentConfig_Submission IS NULL THEN 0 ELSE 1 END      AS Is_Shuffle
         , lcb.Reason
    FROM
           dbo.tblEL_AssignToStudent        AS ats
           INNER JOIN dbo.tblEL_Assignments AS asm ON ats.ResourceID   = asm.AssignmentID
                                                  AND ats.ResourceType = 'ASSIGNMENT'
                                                  AND ats.IsDeleted    = 0
           INNER JOIN dbo.tblMonHocLop      mhl ON ats.MonHocLopID     = mhl.MonHocLopID
           INNER JOIN dbo.tblMonHoc         mh ON asm.MonHocID         = mh.MonHocID
           LEFT JOIN dbo.tblEL_Submissions  s ON ats.AssignToStudentID = s.AssignToStudentID
                                             AND s.HocSinhID           = @HocSinhID
                                             AND s.IsDeleted           = 0
           LEFT JOIN dbo.tblEL_Log_ChamBai  lcb ON lcb.Log_ChamBaiID   = s.Log_ChamBaiID
    WHERE
           ats.AssignToStudentID = @AssignToStudentID
      AND  ats.IsDeleted          = 0;

    -- === Bảng 2: Thông tin Submission (Bài làm) ===
    SELECT TOP 1
           SubmissionID
         , SubmissionContent
         , SubmissionStatus
         , Score
         , TeacherComment
         , GradedDate
         , GradedByTeacherID
         , LanNop
    FROM
           dbo.tblEL_Submissions
    WHERE
           AssignToStudentID = @AssignToStudentID
      AND  HocSinhID          = @HocSinhID
      AND  IsDeleted          = 0
      AND
           (
               (LanNop IS NULL)
          OR   (LanNop            = @LanNop)
           )
    ORDER BY
           LanNop DESC;


END;

