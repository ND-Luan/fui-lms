USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Teacher_PublishGrade]    Script Date: 2026-05-25 12:10:39 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[spAPI_EL_Teacher_PublishGrade]
    @SubmissionID      BIGINT
  , @Score             DECIMAL(5, 2)
  , @TeacherComment    NVARCHAR(MAX)
  , @SubmissionContent NVARCHAR(MAX)
  , @sys_UserID        VARCHAR(9)
AS
BEGIN
    BEGIN TRY
        SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);

        -- === BƯỚC 1: CẬP NHẬT BẢNG SUBMISSIONS (Không đổi) ===
        UPDATE dbo.tblEL_Submissions
        SET    Score = @Score
             , TeacherComment = @TeacherComment
             , SubmissionContent = @SubmissionContent
             , SubmissionStatus = 4
             , GradedByTeacherID = @sys_UserID
             , GradedDate = GETDATE()
             , UpdateUser = @sys_UserID
             , UpdateTime = GETDATE()
        WHERE
               SubmissionID = @SubmissionID;

        IF ISJSON(@SubmissionContent) = 0
        BEGIN
            PRINT 'Warning: SubmissionContent for SubmissionID ' + CAST(@SubmissionID AS VARCHAR) + ' is not a valid JSON. Analytics sync skipped.';
            SELECT Success = 1
                 , Message = N'Đã trả bài thành công (bỏ qua đồng bộ analytics).';
            RETURN;
        END;

        -- === BƯỚC 2: ĐỒNG BỘ DỮ LIỆU SANG BẢNG ANALYTICS ===
        DELETE FROM
        dbo.tblEL_Analytics_QuestionResults
        WHERE
            SubmissionID = @SubmissionID;

        DECLARE @AssignToClassID  INT
              , @HocSinhID        INT
              , @AssignmentConfig NVARCHAR(MAX)
              , @AssignmentID     INT
              , @LopID            VARCHAR(10)
              , @NienKhoa         INT
              , @MonHocLopID      INT
              , @MonHocID         INT
              , @SubmissionTime   DATETIME;

        SELECT @AssignToClassID  = s.AssignToClassID
             , @HocSinhID        = s.HocSinhID
             , @SubmissionTime   = ISNULL(s.SubmissionTime, s.CreateTime)
             , @AssignmentConfig = ISNULL(atc.AssignmentConfig, a.AssignmentConfig)
             , @AssignmentID     = a.AssignmentID
             , @LopID            = mhl.LopNhomID
             , @NienKhoa         = a.NienKhoa
             , @MonHocLopID      = atc.MonHocLopID
             , @MonHocID         = a.MonHocID
        FROM
               dbo.tblEL_Submissions        s
               JOIN dbo.tblEL_AssignToClass atc ON s.AssignToClassID = atc.AssignToClassID
               JOIN dbo.tblEL_Assignments   a ON atc.ResourceID      = a.AssignmentID
                                             AND atc.ResourceType    = 'ASSIGNMENT'
               JOIN dbo.tblMonHocLop        mhl ON atc.MonHocLopID   = mhl.MonHocLopID
        WHERE
               s.SubmissionID = @SubmissionID;

        DECLARE @Questions TABLE
        (
            QuestionID_InJSON VARCHAR(50)
          , QuestionType      VARCHAR(50)
          , MaxScore          DECIMAL(5, 2)
          , Skills            NVARCHAR(MAX) -- ← THÊM DÒNG NÀY
        );
        INSERT INTO @Questions
        (
            QuestionID_InJSON
          , QuestionType
          , MaxScore
          , Skills -- ← THÊM DÒNG NÀY
        )
        SELECT JSON_VALUE(q.Value, '$.id')
             , JSON_VALUE(q.Value, '$.type')
             , CAST(JSON_VALUE(q.Value, '$.points') AS DECIMAL(5, 2))
             , JSON_QUERY(q.Value, '$.skills') -- ← THÊM DÒNG NÀY - Lấy nguyên mảng JSON
        FROM
               OPENJSON(@AssignmentConfig, '$.groups')           AS groups
               CROSS APPLY OPENJSON(groups.Value, '$.questions') AS q;


        -- Chèn dữ liệu mới vào bảng Analytics
        INSERT INTO dbo.tblEL_Analytics_QuestionResults
        (
            SubmissionID
          , AssignmentID
          , AssignToClassID
          , HocSinhID
          , LopID
          , NienKhoa
          , MonHocLopID
          , MonHocID
          , QuestionID_InJSON
          , QuestionType
          , Score
          , MaxScore
          , IsCorrect
          , SubmissionTime
          , Skills -- ← THÊM DÒNG NÀY
        )
        SELECT @SubmissionID
             , @AssignmentID
             , @AssignToClassID
             , @HocSinhID
             , @LopID
             , @NienKhoa
             , @MonHocLopID
             , @MonHocID
             , answers.[Key]
             , ISNULL(q_info.QuestionType, '')
                             -- Tính điểm cho câu hỏi (Không đổi)
             , ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.manualScore') AS DECIMAL(5, 2)), 0) + ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.autoScore') AS DECIMAL(5, 2)), 0) AS QuestionScore
             , q_info.MaxScore
                             -- =================================================================
                             -- == LOGIC TÍNH IsCorrect ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN            ==
                             -- =================================================================
             , CASE
                    -- Trường hợp 1: Có trường isCorrect và nó là 'true'
                    WHEN JSON_VALUE(answers.Value, '$.grading.isCorrect') = 'true' THEN 1

                    -- Trường hợp 2: Điểm đạt được bằng điểm tối đa (và > 0)
                    WHEN q_info.MaxScore > 0
                     AND (ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.manualScore') AS DECIMAL(5, 2)), 0) + ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.autoScore') AS DECIMAL(5, 2)), 0)) = q_info.MaxScore THEN 1

                    -- Trường hợp 3: Có trường isCorrect và nó là 'false'
                    WHEN JSON_VALUE(answers.Value, '$.grading.isCorrect') = 'false' THEN 0

                    -- Trường hợp 4: Điểm số là 0
                    WHEN (ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.manualScore') AS DECIMAL(5, 2)), 0) + ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.autoScore') AS DECIMAL(5, 2)), 0)) = 0 THEN 0

                    -- Các trường hợp còn lại (ví dụ: đúng một phần)
                    ELSE NULL
               END                                                                                                                                                                       AS IsCorrect
             , @SubmissionTime
             , q_info.Skills -- ← THÊM DÒNG NÀY
        FROM
               OPENJSON(@SubmissionContent, '$.answers') AS answers
               LEFT JOIN @Questions                      q_info ON answers.[Key] COLLATE DATABASE_DEFAULT = q_info.QuestionID_InJSON COLLATE DATABASE_DEFAULT;



        --Insert log Chấm bài
        EXEC spAPI_EL_Log_ChamBai_Ins @SubmissionID = @SubmissionID
                                    , @AssignToClassID = @AssignToClassID
                                    , @AssignmentConfig = @AssignmentConfig
                                    , @SubmissionContent = @SubmissionContent
                                    , @SubmissionStatus = 4 -- Do API là này trả bài
                                    , @SYS_USERID = @sys_UserID;
        EXEC [dbo].[spAPI_ThongBao_Ins] @SubmissionID = @SubmissionID
                                      , @ThongBao_TemplateID = 8
                                      , @NguoiNhan = @HocSinhID
                                      , @SYS_USERID = @sys_UserID;


        --Gắn thêm thông báo
        EXEC [dbo].[spAPI_ThongBao_Ins] @ResourceID = @SubmissionID
                                      , @ResourceType = 'SUBMISSION'
                                      , @ThongBao_TemplateID = 8
                                      , @NguoiNhan = @HocSinhID
                                      , @SYS_USERID = @sys_UserID;
        --Gắn thêm Achievement
        EXEC spAPI_EL_Achievement_Submit_ByHocSinhID @HocSinhID = @HocSinhID;
    END TRY
    BEGIN CATCH
        SELECT ERROR_NUMBER()    AS ErrorNumber
             , ERROR_MESSAGE()   AS ErrorMessage
             , ERROR_LINE()      AS ErrorLine
             , ERROR_PROCEDURE() AS ErrorProcedure
             , ERROR_SEVERITY()  AS ErrorSeverity
             , ERROR_STATE()     AS ErrorState;
    END CATCH;

    -- === BƯỚC 3: TRẢ VỀ KẾT QUẢ THÀNH CÔNG ===
    SELECT Success = 1
         , Message = N'Đã trả bài và đồng bộ báo cáo thành công.';
END;

USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Teacher_PublishGrade_AssignToStudent]    Script Date: 2026-05-25 12:10:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[spAPI_EL_Teacher_PublishGrade_AssignToStudent]
    @SubmissionID      BIGINT
  , @Score             DECIMAL(5, 2)
  , @TeacherComment    NVARCHAR(MAX)
  , @SubmissionContent NVARCHAR(MAX)
  , @sys_UserID        VARCHAR(9)
AS
BEGIN
    SET @sys_UserID = dbo.fn_GetUser_LMS(@sys_UserID);
    -- === BƯỚC 1: CẬP NHẬT BẢNG SUBMISSIONS (Không đổi) ===
    UPDATE dbo.tblEL_Submissions
    SET    Score = @Score
         , TeacherComment = @TeacherComment
         , SubmissionContent = @SubmissionContent
         , SubmissionStatus = 4
         , GradedByTeacherID = @sys_UserID
         , GradedDate = GETDATE()
         , UpdateUser = @sys_UserID
         , UpdateTime = GETDATE()
    WHERE
           SubmissionID = @SubmissionID;

    IF ISJSON(@SubmissionContent) = 0
    BEGIN
        PRINT 'Warning: SubmissionContent for SubmissionID ' + CAST(@SubmissionID AS VARCHAR) + ' is not a valid JSON. Analytics sync skipped.';
        SELECT Success = 1
             , Message = N'Đã trả bài thành công (bỏ qua đồng bộ analytics).';
        RETURN;
    END;

    -- === BƯỚC 2: ĐỒNG BỘ DỮ LIỆU SANG BẢNG ANALYTICS ===
    DELETE FROM
    dbo.tblEL_Analytics_QuestionResults
    WHERE
        SubmissionID = @SubmissionID;

    DECLARE @AssignToStudentID INT
          , @HocSinhID         INT
          , @AssignmentConfig  NVARCHAR(MAX)
          , @AssignmentID      INT
          , @LopID             VARCHAR(10)
          , @NienKhoa          INT
          , @MonHocLopID       INT
          , @MonHocID          INT
          , @SubmissionTime    DATETIME;

    SELECT @AssignToStudentID = s.AssignToStudentID
         , @HocSinhID         = s.HocSinhID
         , @SubmissionTime    = ISNULL(s.SubmissionTime, s.CreateTime)
         , @AssignmentConfig  = ISNULL(ats.AssignmentConfig, a.AssignmentConfig)
         , @AssignmentID      = a.AssignmentID
         , @LopID             = mhl.LopNhomID
         , @NienKhoa          = a.NienKhoa
         , @MonHocLopID       = ats.MonHocLopID
         , @MonHocID          = a.MonHocID
    FROM
           dbo.tblEL_Submissions          s
           JOIN dbo.tblEL_AssignToStudent ats ON s.AssignToStudentID = ats.AssignToStudentID
           JOIN dbo.tblEL_Assignments     a ON ats.ResourceID        = a.AssignmentID
                                           AND ats.ResourceType      = 'ASSIGNMENT'
           JOIN dbo.tblMonHocLop          mhl ON ats.MonHocLopID     = mhl.MonHocLopID
    WHERE
           s.SubmissionID = @SubmissionID;

    DECLARE @Questions TABLE
    (
        QuestionID_InJSON VARCHAR(50)
      , QuestionType      VARCHAR(50)
      , MaxScore          DECIMAL(5, 2)
    );
    INSERT INTO @Questions
    (
        QuestionID_InJSON
      , QuestionType
      , MaxScore
    )
    SELECT JSON_VALUE(q.Value, '$.id')
         , JSON_VALUE(q.Value, '$.type')
         , CAST(JSON_VALUE(q.Value, '$.points') AS DECIMAL(5, 2))
    FROM
           OPENJSON(@AssignmentConfig, '$.groups')           AS groups
           CROSS APPLY OPENJSON(groups.Value, '$.questions') AS q;
    -- Chèn dữ liệu mới vào bảng Analytics
    INSERT INTO dbo.tblEL_Analytics_QuestionResults
    (
        SubmissionID
      , AssignmentID
      , AssignToStudentID
      , HocSinhID
      , LopID
      , NienKhoa
      , MonHocLopID
      , MonHocID
      , QuestionID_InJSON
      , QuestionType
      , Score
      , MaxScore
      , IsCorrect
      , SubmissionTime
    )
    SELECT @SubmissionID
         , @AssignmentID
         , @AssignToStudentID
         , @HocSinhID
         , @LopID
         , @NienKhoa
         , @MonHocLopID
         , @MonHocID
         , answers.[Key]
         , ISNULL(q_info.QuestionType, '')
         -- Tính điểm cho câu hỏi (Không đổi)
         , ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.manualScore') AS DECIMAL(5, 2)), 0) + ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.autoScore') AS DECIMAL(5, 2)), 0) AS QuestionScore
         , q_info.MaxScore
         -- =================================================================
         -- == LOGIC TÍNH IsCorrect ĐÃ ĐƯỢC VIẾT LẠI HOÀN TOÀN            ==
         -- =================================================================
         , CASE
                -- Trường hợp 1: Có trường isCorrect và nó là 'true'
                WHEN JSON_VALUE(answers.Value, '$.grading.isCorrect') = 'true' THEN 1

                -- Trường hợp 2: Điểm đạt được bằng điểm tối đa (và > 0)
                WHEN q_info.MaxScore > 0
                 AND (ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.manualScore') AS DECIMAL(5, 2)), 0) + ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.autoScore') AS DECIMAL(5, 2)), 0)) = q_info.MaxScore THEN 1

                -- Trường hợp 3: Có trường isCorrect và nó là 'false'
                WHEN JSON_VALUE(answers.Value, '$.grading.isCorrect') = 'false' THEN 0

                -- Trường hợp 4: Điểm số là 0
                WHEN (ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.manualScore') AS DECIMAL(5, 2)), 0) + ISNULL(CAST(JSON_VALUE(answers.Value, '$.grading.autoScore') AS DECIMAL(5, 2)), 0)) = 0 THEN 0

                -- Các trường hợp còn lại (ví dụ: đúng một phần)
                ELSE NULL
           END                                                                                                                                                                       AS IsCorrect
         , @SubmissionTime
    FROM
           OPENJSON(@SubmissionContent, '$.answers') AS answers
           LEFT JOIN @Questions                      q_info ON answers.[Key] COLLATE DATABASE_DEFAULT = q_info.QuestionID_InJSON COLLATE DATABASE_DEFAULT;

    --Insert log Chấm bài
    EXEC spAPI_EL_Log_ChamBai_Ins_AssignToStudent @SubmissionID = @SubmissionID
                                                , @AssignToStudentID = @AssignToStudentID
                                                , @AssignmentConfig = @AssignmentConfig
                                                , @SubmissionContent = @SubmissionContent
                                                , @SubmissionStatus = 4 -- Do API là này trả bài
                                                , @SYS_USERID = @sys_UserID;


    --Gắn thêm thông báo
    EXEC [dbo].[spAPI_ThongBao_Ins] @ResourceID = @SubmissionID
                                  , @ResourceType = 'SUBMISSION'
                                  , @ThongBao_TemplateID = 8
                                  , @NguoiNhan = @HocSinhID
                                  , @SYS_USERID = @sys_UserID;

    --Gắn thêm Achievement
    EXEC spAPI_EL_Achievement_Submit_ByHocSinhID @HocSinhID = @HocSinhID;
    -- === BƯỚC 3: TRẢ VỀ KẾT QUẢ THÀNH CÔNG ===
    SELECT Success = 1
         , Message = N'Đã trả bài và đồng bộ báo cáo thành công.';
END;

USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Teacher_PublishGrade_Multiple]    Script Date: 2026-05-25 12:10:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[spAPI_EL_Teacher_PublishGrade_Multiple]
    @Json_HocSinhSubmited NVARCHAR(MAX),
    @sys_UserID VARCHAR(9)
AS
BEGIN
    IF @sys_UserID = 'NA0000022'
        SET @sys_UserID = 'NV0000873';
    IF @sys_UserID = 'NV0000888'
        SET @sys_UserID = 'NV0000677';


    DECLARE @Table_HocSinhSubmited TABLE
    (
        SubmissionID INT,
        SubmissionContent NVARCHAR(MAX),
        Score DECIMAL(5, 2)
    );
    INSERT INTO @Table_HocSinhSubmited (SubmissionID, SubmissionContent, Score)
    SELECT SubmissionID, SubmissionContent, Score
    FROM OPENJSON(@Json_HocSinhSubmited)
    WITH (
        SubmissionID INT '$.SubmissionID',
        SubmissionContent NVARCHAR(MAX) '$.SubmissionContent',
        Score DECIMAL(5, 2) '$.Score'
    );
    -- 🔹 Duyệt từng dòng bằng CURSOR
   DECLARE 
       @SubmissionID INT,
       @SubmissionContent NVARCHAR(MAX),
       @Score DECIMAL(5,2);

   DECLARE cur CURSOR FOR
       SELECT SubmissionID, SubmissionContent, Score FROM @Table_HocSinhSubmited;

   OPEN cur;
   FETCH NEXT FROM cur INTO @SubmissionID, @SubmissionContent, @Score;

   WHILE @@FETCH_STATUS = 0
   BEGIN
       EXEC dbo.spAPI_EL_Teacher_PublishGrade 
           @SubmissionID = @SubmissionID,
           @Score = @Score,
           @TeacherComment = NULL, 
           @SubmissionContent = @SubmissionContent,
           @sys_UserID = @sys_UserID;

       FETCH NEXT FROM cur INTO @SubmissionID, @SubmissionContent, @Score;
   END;

   CLOSE cur;
   DEALLOCATE cur;
END;
