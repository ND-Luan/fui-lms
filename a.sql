USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Student_SaveSubmission]    Script Date: 2026-05-25 10:37:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[spAPI_EL_Student_SaveSubmission]
    @AssignToClassID   INT
  , @HocSinhID         INT
  , @SubmissionContent NVARCHAR(MAX)
       , @SubmissionStatus  TINYINT -- 1: Draft, 2: Submitted, 4: Graded (full-quiz auto grade)
       , @Score             DECIMAL(10, 2) = NULL
         , @Is_Full_Quiz      BIT = 0
       , @SubmitToken       VARCHAR(128) = NULL
  , @sys_UserID        VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

              IF @SubmissionStatus = 4 AND @Score IS NULL AND ISJSON(@SubmissionContent) = 1
              BEGIN
                            SELECT @Score = ROUND(SUM(ISNULL(
                                   COALESCE(
                                          TRY_CAST(JSON_VALUE(ans.[value], '$.grading.manualScore') AS DECIMAL(10, 2)),
                                          TRY_CAST(JSON_VALUE(ans.[value], '$.grading.autoScore') AS DECIMAL(10, 2)),
                                          0
                                   ),
                                   0
                            )), 2)
                            FROM OPENJSON(JSON_QUERY(@SubmissionContent, '$.answers')) ans;
              END;

              IF @SubmissionStatus >= 2
              BEGIN
                            DECLARE @SubmitTokenNorm VARCHAR(128) = NULLIF(LTRIM(RTRIM(@SubmitToken)), '');
                            DECLARE @TokenHash VARBINARY(32) = NULL;
                            IF @SubmitTokenNorm IS NOT NULL
                                   SET @TokenHash = HASHBYTES('SHA2_256', @SubmitTokenNorm);

                            DECLARE @ConsumedRows INT = 0;

                            ;WITH TokenPick AS
                            (
                                          SELECT TOP 1 SubmitTokenID
                                          FROM dbo.tblEL_Student_SubmitTokens WITH (UPDLOCK, ROWLOCK, READPAST)
                                          WHERE HocSinhID = @HocSinhID
                                                 AND AssignToClassID = @AssignToClassID
                                                 AND AssignToStudentID IS NULL
                                                 AND (@TokenHash IS NULL OR TokenHash = @TokenHash)
                                                 AND IsUsed = 0
                                                 AND ExpireTime >= SYSDATETIME()
                                          ORDER BY SubmitTokenID DESC
                            )
                            UPDATE tok
                                    SET IsUsed = 1,
                                                  UsedTime = SYSDATETIME()
                            FROM dbo.tblEL_Student_SubmitTokens tok
                            JOIN TokenPick pick ON tok.SubmitTokenID = pick.SubmitTokenID;

                            SET @ConsumedRows = @@ROWCOUNT;

                            IF @ConsumedRows = 0
                            BEGIN
                                          RAISERROR(N'Khong tim thay one-time token hop le. Vui long yeu cau token moi va nop lai.', 16, 1);
                                          RETURN;
                            END;
              END;

    -- Chuẩn hóa: Luôn sử dụng HocSinhID từ token đã xác thực
    DECLARE @SubmissionID_Out BIGINT;
    -- Lần nộp
    DECLARE @LanNop INT = 1;
    DECLARE @CheckLanNop INT;
    SET @CheckLanNop = ISNULL((
                                  SELECT TOP 1
                                         LanNop
                                  FROM
                                         tblEL_Submissions
                                  WHERE
                                         HocSinhID       = @HocSinhID
                                    AND  AssignToClassID  = @AssignToClassID
                                    AND  IsDeleted        = 0
                                    AND  SubmissionStatus >= 2
                                  ORDER BY
                                         1 DESC
                              ), 0
                             );
    SET @LanNop = @CheckLanNop + 1;
    DECLARE @Is_OverDue BIT = 0;
    DECLARE @Duedate DATETIME;
    SET @Duedate =
    (
        SELECT [DueDate]
        FROM
               tblEL_AssignToClass
        WHERE
               AssignToClassID = @AssignToClassID
          AND  IsDeleted        = 0
    );
    IF GETDATE() > @Duedate
        SET @Is_OverDue = 1;

    -- Sử dụng MERGE để chèn hoặc cập nhật
    MERGE dbo.tblEL_Submissions AS target
    USING
    (
        SELECT @AssignToClassID AS AssignToClassID
             , @HocSinhID       AS HocSinhID
    ) AS source
    ON (
           target.AssignToClassID = source.AssignToClassID
     AND   target.HocSinhID = source.HocSinhID
     AND   target.IsDeleted = 0
       )

        -- Khi đã có bản ghi: luôn cho cập nhật nháp; cho cập nhật bài đã nộp nếu là full-quiz hoặc status=4
               WHEN MATCHED AND (
                              target.SubmissionStatus < 2
                              OR (@Is_Full_Quiz = 1 AND @SubmissionStatus >= 2)
                              OR (@SubmissionStatus = 4)
               ) THEN UPDATE SET SubmissionContent = @SubmissionContent
                                                                                                             , SubmissionStatus = @SubmissionStatus
                                                                                                             , SubmissionTime = CASE
                                                                                                                                                WHEN @SubmissionStatus >= 2 THEN GETDATE()
                                                                                                                                                ELSE target.SubmissionTime
                                                                                                                                         END
                                                                                                             , Score = CASE
                                                                                                                                WHEN @SubmissionStatus >= 2 AND @Score IS NOT NULL THEN @Score
                                                                                                                                WHEN @SubmissionStatus >= 2 THEN target.Score
                                                                                                                                ELSE target.Score
                                                                                                                         END
                                                                                                             , GradedDate = CASE
                                                                                                                                WHEN @SubmissionStatus = 4 THEN GETDATE()
                                                                                                                                ELSE target.GradedDate
                                                                                                                           END
                                                                                                             , IsOverDue = @Is_OverDue
                                                                                                             , UpdateTime = GETDATE()
                                                                                                             , UpdateUser = @HocSinhID

       -- Khi chưa có bản ghi nào
    WHEN NOT MATCHED THEN INSERT
                          (
                              AssignToClassID
                            , HocSinhID
                            , SubmissionContent
                            , SubmissionStatus
                            , SubmissionTime
                            , Score
                            , GradedDate
                            , Log_ChamBaiID
                            , CreateUser
                            , CreateTime
                            , IsOverDue
                            , LanNop
                          )
                          VALUES
                          (
                              @AssignToClassID
                            , @HocSinhID
                            , @SubmissionContent
                            , @SubmissionStatus
                                                                                                  , CASE WHEN @SubmissionStatus >= 2 THEN GETDATE() ELSE NULL END
                                                                                                  , @Score
                                                                                                  , CASE WHEN @SubmissionStatus = 4 THEN GETDATE() ELSE NULL END
                                                                                                  , NULL
                            , @HocSinhID
                            , GETDATE()
                            , @Is_OverDue
                            , @LanNop
                          );

    -- Lấy ID của bản ghi vừa được tác động để ghi log
    -- SCOPE_IDENTITY() chỉ hoạt động cho INSERT, nên cần SELECT lại để chắc chắn
    SELECT TOP 1
           @SubmissionID_Out = SubmissionID
    FROM
           dbo.tblEL_Submissions
    WHERE
           AssignToClassID = @AssignToClassID
      AND  HocSinhID        = @HocSinhID
      AND  IsDeleted        = 0;

    -- Chỉ ghi log khi nộp bài thành công (Status=2), không ghi khi lưu nháp (Status=1)
       IF @SubmissionStatus >= 2
   AND @SubmissionID_Out IS NOT NULL
    BEGIN
        -- Ghi log, sử dụng SubmissionID vừa lấy được
        INSERT INTO dbo.tblEL_Activity_Logs
        (
            HocSinhID
          , ActivityType
          , ResourceID
          , ResourceType
          , CreateUser
          , CreateTime
        )
        VALUES
        (
            @HocSinhID
          , 'SUBMISSION_NEW'
          , @SubmissionID_Out
          , 'SUBMISSION'
          , @sys_UserID
          , GETDATE()
        );

        DECLARE @CurrentTime DATETIME = GETDATE();
        --insert log nộp bài
        EXEC spAPI_EL_Log_NopBai_Ins @SubmissionID = @SubmissionID_Out
                                   , @SubmissionContent = @SubmissionContent
                                   , @SubmissionTime = @CurrentTime
                                   , @SYS_USERID = @HocSinhID;

              IF @SubmissionStatus = 4
              BEGIN
                     DECLARE @Log_ChamBaiID_New INT = NULL;
                     DECLARE @AssignmentConfig_Log NVARCHAR(MAX) = NULL;

                     SELECT TOP 1 @AssignmentConfig_Log = AssignmentConfig
                     FROM dbo.tblEL_Submissions
                     WHERE SubmissionID = @SubmissionID_Out
                       AND IsDeleted = 0;

                     INSERT INTO dbo.tblEL_Log_ChamBai
                     (
                            SubmissionID,
                            AssignToClassID,
                            AssignToStudentID,
                            AssignmentConfig,
                            SubmissionStatus,
                            SubmissionContent,
                            Reason,
                            CreateUser,
                            CreateTime,
                            UpdateUser,
                            UpdateTime
                     )
                     VALUES
                     (
                            @SubmissionID_Out,
                            @AssignToClassID,
                            NULL,
                            @AssignmentConfig_Log,
                            @SubmissionStatus,
                            @SubmissionContent,
                            NULL,
                            @HocSinhID,
                            GETDATE(),
                            @HocSinhID,
                            GETDATE()
                     );

                     SET @Log_ChamBaiID_New = SCOPE_IDENTITY();

                     UPDATE dbo.tblEL_Submissions
                     SET GradedDate = GETDATE(),
                            Log_ChamBaiID = @Log_ChamBaiID_New,
                            UpdateTime = GETDATE(),
                            UpdateUser = @HocSinhID
                     WHERE SubmissionID = @SubmissionID_Out
                       AND IsDeleted = 0;
              END;
    END;
    -- Lấy lại dữ liệu để load lại UI 
    EXEC spAPI_EL_Student_GetAssignmentDetail @AssignToClassID = @AssignToClassID
                                            , @HocSinhID = @HocSinhID
                                            , @LanNop = @LanNop
                                            , @sys_UserID = @HocSinhID;

    SELECT @SubmissionStatus;
    --Gắn thêm thông báo
       IF (@SubmissionStatus >= 2)
    BEGIN
        EXEC [dbo].[spAPI_ThongBao_Ins] @ResourceID = @SubmissionID_Out
                                      , @ResourceType = 'SUBMISSION'
                                      , @ThongBao_TemplateID = 7
                                      , @NguoiNhan = @HocSinhID
                                      , @SYS_USERID = @HocSinhID;
    END;
END;
