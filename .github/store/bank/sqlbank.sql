--------------------------------------------------------------------------------
-- CRUD stored procedures for Question Bank (naming: spAPI_EL_<Entity>_<Action>)
-- Tables expected: dbo.tblEL_QuestionBank_Group, dbo.tblEL_QuestionBank_Question
--------------------------------------------------------------------------------

-- Drop existing procs if any
IF OBJECT_ID('dbo.spAPI_EL_QuestionGroup_Create', 'P') IS NOT NULL
  DROP PROCEDURE dbo.spAPI_EL_QuestionGroup_Create;
IF OBJECT_ID('dbo.spAPI_EL_QuestionGroup_Update', 'P') IS NOT NULL
  DROP PROCEDURE dbo.spAPI_EL_QuestionGroup_Update;
IF OBJECT_ID('dbo.spAPI_EL_QuestionGroup_Delete', 'P') IS NOT NULL
  DROP PROCEDURE dbo.spAPI_EL_QuestionGroup_Delete;

IF OBJECT_ID('dbo.spAPI_EL_Question_Create', 'P') IS NOT NULL
  DROP PROCEDURE dbo.spAPI_EL_Question_Create;
IF OBJECT_ID('dbo.spAPI_EL_Question_Update', 'P') IS NOT NULL
  DROP PROCEDURE dbo.spAPI_EL_Question_Update;
IF OBJECT_ID('dbo.spAPI_EL_Question_Delete', 'P') IS NOT NULL
  DROP PROCEDURE dbo.spAPI_EL_Question_Delete;
GO

--------------------------------------------------------------------------------
-- spAPI_EL_QuestionGroup_Create
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_QuestionGroup_Create
  @SourceId VARCHAR(100) = NULL,
  @Title NVARCHAR(255) = NULL,
  @Description NVARCHAR(MAX) = NULL,
  @OrdinalNumber INT = NULL,
  @MediaJson NVARCHAR(MAX) = NULL,
  @RawJson NVARCHAR(MAX) = NULL,
  @User VARCHAR(9)
AS
BEGIN
  SET NOCOUNT ON;
  BEGIN TRY
    BEGIN TRANSACTION;

    INSERT INTO dbo.tblEL_QuestionBank_Group
      (SourceId, Title, Description, OrdinalNumber, MediaJson, RawJson, CreateUser, CreateTime, IsDeleted)
    VALUES
      (@SourceId, @Title, @Description, @OrdinalNumber, @MediaJson, @RawJson, @User, GETDATE(), 0);

    DECLARE @NewId INT = SCOPE_IDENTITY();

    COMMIT TRANSACTION;

    SELECT @NewId AS Id, 'Inserted' AS Action;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_QuestionGroup_Update
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_QuestionGroup_Update
  @Id INT,
  @SourceId VARCHAR(100) = NULL,
  @Title NVARCHAR(255) = NULL,
  @Description NVARCHAR(MAX) = NULL,
  @OrdinalNumber INT = NULL,
  @MediaJson NVARCHAR(MAX) = NULL,
  @RawJson NVARCHAR(MAX) = NULL,
  @User VARCHAR(9)
AS
BEGIN
  SET NOCOUNT ON;
  IF @Id IS NULL
  BEGIN
    RAISERROR('Parameter @Id is required.', 16, 1);
    RETURN;
  END

  BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_QuestionBank_Group WHERE Id = @Id AND IsDeleted = 0)
    BEGIN
      RAISERROR('Group Id not found or is deleted.', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END

    UPDATE dbo.tblEL_QuestionBank_Group
    SET SourceId = @SourceId,
        Title = @Title,
        Description = @Description,
        OrdinalNumber = @OrdinalNumber,
        MediaJson = @MediaJson,
        RawJson = @RawJson,
        UpdateUser = @User,
        UpdateTime = GETDATE()
    WHERE Id = @Id;

    COMMIT TRANSACTION;

    SELECT @Id AS Id, 'Updated' AS Action;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_QuestionGroup_Delete (soft delete; also soft-deletes related questions)
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_QuestionGroup_Delete
  @Id INT,
  @User VARCHAR(9)
AS
BEGIN
  SET NOCOUNT ON;
  IF @Id IS NULL
  BEGIN
    RAISERROR('Parameter @Id is required.', 16, 1);
    RETURN;
  END

  BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_QuestionBank_Group WHERE Id = @Id AND IsDeleted = 0)
    BEGIN
      RAISERROR('Group Id not found or already deleted.', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END

    UPDATE dbo.tblEL_QuestionBank_Group
    SET IsDeleted = 1,
        UpdateUser = @User,
        UpdateTime = GETDATE()
    WHERE Id = @Id;

    UPDATE dbo.tblEL_QuestionBank_Question
    SET IsDeleted = 1,
        UpdateUser = @User,
        UpdateTime = GETDATE()
    WHERE GroupId = @Id AND IsDeleted = 0;

    COMMIT TRANSACTION;

    SELECT @Id AS Id, 'Deleted' AS Action;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_Question_Create
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_Question_Create
  @GroupId INT,
  @SourceId VARCHAR(100) = NULL,
  @Type VARCHAR(60),
  @Label NVARCHAR(200) = NULL,
  @QuestionText NVARCHAR(MAX) = NULL,
  @OrdinalNumber INT = NULL,
  @Points DECIMAL(9,2) = NULL,
  @GradingType VARCHAR(50) = NULL,
  @IsAdvanced BIT = 0,
  @ConfigJson NVARCHAR(MAX) = NULL,
  @SkillsJson NVARCHAR(MAX) = NULL,
  @RawJson NVARCHAR(MAX) = NULL,
  @User VARCHAR(9)
AS
BEGIN
  SET NOCOUNT ON;
  IF @GroupId IS NULL
  BEGIN
    RAISERROR('Parameter @GroupId is required.', 16, 1);
    RETURN;
  END
  IF @Type IS NULL OR LEN(@Type) = 0
  BEGIN
    RAISERROR('Parameter @Type is required.', 16, 1);
    RETURN;
  END

  BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_QuestionBank_Group WHERE Id = @GroupId AND IsDeleted = 0)
    BEGIN
      RAISERROR('GroupId not found or deleted.', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END

    INSERT INTO dbo.tblEL_QuestionBank_Question
      (GroupId, SourceId, Type, Label, QuestionText, OrdinalNumber, Points, GradingType, IsAdvanced, ConfigJson, SkillsJson, RawJson, CreateUser, CreateTime, IsDeleted)
    VALUES
      (@GroupId, @SourceId, @Type, @Label, @QuestionText, @OrdinalNumber, @Points, @GradingType, @IsAdvanced, @ConfigJson, @SkillsJson, @RawJson, @User, GETDATE(), 0);

    DECLARE @NewId INT = SCOPE_IDENTITY();

    COMMIT TRANSACTION;

    SELECT @NewId AS Id, 'Inserted' AS Action;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_Question_Update
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_Question_Update
  @Id INT,
  @GroupId INT = NULL,
  @SourceId VARCHAR(100) = NULL,
  @Type VARCHAR(60) = NULL,
  @Label NVARCHAR(200) = NULL,
  @QuestionText NVARCHAR(MAX) = NULL,
  @OrdinalNumber INT = NULL,
  @Points DECIMAL(9,2) = NULL,
  @GradingType VARCHAR(50) = NULL,
  @IsAdvanced BIT = NULL,
  @ConfigJson NVARCHAR(MAX) = NULL,
  @SkillsJson NVARCHAR(MAX) = NULL,
  @RawJson NVARCHAR(MAX) = NULL,
  @User VARCHAR(9)
AS
BEGIN
  SET NOCOUNT ON;
  IF @Id IS NULL
  BEGIN
    RAISERROR('Parameter @Id is required.', 16, 1);
    RETURN;
  END

  BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_QuestionBank_Question WHERE Id = @Id AND IsDeleted = 0)
    BEGIN
      RAISERROR('Question Id not found or is deleted.', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END

    IF @GroupId IS NOT NULL
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_QuestionBank_Group WHERE Id = @GroupId AND IsDeleted = 0)
      BEGIN
        RAISERROR('Provided GroupId not found or is deleted.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
      END
    END

    UPDATE dbo.tblEL_QuestionBank_Question
    SET GroupId = ISNULL(@GroupId, GroupId),
        SourceId = @SourceId,
        Type = ISNULL(@Type, Type),
        Label = @Label,
        QuestionText = @QuestionText,
        OrdinalNumber = @OrdinalNumber,
        Points = @Points,
        GradingType = @GradingType,
        IsAdvanced = ISNULL(@IsAdvanced, IsAdvanced),
        ConfigJson = @ConfigJson,
        SkillsJson = @SkillsJson,
        RawJson = @RawJson,
        UpdateUser = @User,
        UpdateTime = GETDATE()
    WHERE Id = @Id;

    COMMIT TRANSACTION;

    SELECT @Id AS Id, 'Updated' AS Action;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_Question_Delete (soft delete)
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_Question_Delete
  @Id INT,
  @User VARCHAR(9)
AS
BEGIN
  SET NOCOUNT ON;
  IF @Id IS NULL
  BEGIN
    RAISERROR('Parameter @Id is required.', 16, 1);
    RETURN;
  END

  BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_QuestionBank_Question WHERE Id = @Id AND IsDeleted = 0)
    BEGIN
      RAISERROR('Question Id not found or already deleted.', 16, 1);
      ROLLBACK TRANSACTION;
      RETURN;
    END

    UPDATE dbo.tblEL_QuestionBank_Question
    SET IsDeleted = 1,
        UpdateUser = @User,
        UpdateTime = GETDATE()
    WHERE Id = @Id;

    COMMIT TRANSACTION;

    SELECT @Id AS Id, 'Deleted' AS Action;
  END TRY
  BEGIN CATCH
    IF XACT_STATE() <> 0
      ROLLBACK TRANSACTION;
    THROW;
  END CATCH
END
GO

--------------------------------------------------------------------------------
-- Examples (use new proc names)
-- Create group:
-- EXEC dbo.spAPI_EL_QuestionGroup_Create
--   @SourceId = 'group_1775719953261',
--   @Title = N'Phần 2',
--   @Description = N'',
--   @MediaJson = N'{"type":"YOUTUBE"}',
--   @RawJson = N'{ ... }',
--   @User = 'sysuser';

-- Update group:
-- EXEC dbo.spAPI_EL_QuestionGroup_Update
--   @Id = 1,
--   @Title = N'Phần 2 (cập nhật)',
--   @User = 'editor01';

-- Delete group:
-- EXEC dbo.spAPI_EL_QuestionGroup_Delete @Id = 1, @User = 'admin';

-- Create question:
-- EXEC dbo.spAPI_EL_Question_Create
--   @GroupId = 1,
--   @SourceId = 'q_1691b4f7-9849-4838-bcb7-ffe4e6eeb30f',
--   @Type = 'QUIZ_MULTIPLE_CHOICE',
--   @Label = N'Trắc nghiệm',
--   @QuestionText = N'<p>Nội dung câu 2</p>',
--   @OrdinalNumber = 2,
--   @Points = 1.0,
--   @ConfigJson = N'{ "options": [...], "correctAnswers": [...] }',
--   @SkillsJson = N'[{"KyNang_MonHoc_ChiTietID":1,"TenKyNang":"..."}]',
--   @RawJson = N'{ ... }',
--   @User = 'sysuser';

-- Update question:
-- EXEC dbo.spAPI_EL_Question_Update
--   @Id = 10,
--   @Label = N'Trắc nghiệm (sửa)',
--   @Points = 2.0,
--   @User = 'editor01';

-- Delete question:
-- EXEC dbo.spAPI_EL_Question_Delete @Id = 10, @User = 'admin';
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Read (API) stored procedures for Question Bank (spAPI_EL_...)
-- Drop existing
IF OBJECT_ID('dbo.spAPI_EL_QuestionGroup_List', 'P') IS NOT NULL DROP PROCEDURE dbo.spAPI_EL_QuestionGroup_List;
IF OBJECT_ID('dbo.spAPI_EL_QuestionGroup_Get', 'P') IS NOT NULL DROP PROCEDURE dbo.spAPI_EL_QuestionGroup_Get;
IF OBJECT_ID('dbo.spAPI_EL_Question_List', 'P') IS NOT NULL DROP PROCEDURE dbo.spAPI_EL_Question_List;
IF OBJECT_ID('dbo.spAPI_EL_Question_Get', 'P') IS NOT NULL DROP PROCEDURE dbo.spAPI_EL_Question_Get;
IF OBJECT_ID('dbo.spAPI_EL_Question_FindBySkillSourceId', 'P') IS NOT NULL DROP PROCEDURE dbo.spAPI_EL_Question_FindBySkillSourceId;
GO

--------------------------------------------------------------------------------
-- spAPI_EL_QuestionGroup_List
-- Params:
--   @IncludeDeleted BIT = 0
--   @PageNumber INT = 1, @PageSize INT = 100
-- Returns: paged list of groups (Id, SourceId, Title, Description, OrdinalNumber, MediaJson, CreateTime, UpdateTime, IsDeleted)
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_QuestionGroup_List
  @IncludeDeleted BIT = 0,
  @PageNumber INT = 1,
  @PageSize INT = 100
AS
BEGIN
  SET NOCOUNT ON;

  IF @PageNumber < 1 SET @PageNumber = 1;
  IF @PageSize < 1 SET @PageSize = 100;

  ;WITH CTE AS (
    SELECT
      Id, SourceId, Title, Description, OrdinalNumber, MediaJson, RawJson,
      CreateUser, CreateTime, UpdateUser, UpdateTime, IsDeleted,
      ROW_NUMBER() OVER (ORDER BY OrdinalNumber ASC, Id ASC) AS rn
    FROM dbo.tblEL_QuestionBank_Group
    WHERE (@IncludeDeleted = 1 OR IsDeleted = 0)
  )
  SELECT
    Id, SourceId, Title, Description, OrdinalNumber, MediaJson, RawJson,
    CreateUser, CreateTime, UpdateUser, UpdateTime, IsDeleted
  FROM CTE
  WHERE rn BETWEEN ((@PageNumber - 1) * @PageSize) + 1 AND (@PageNumber * @PageSize)
  ORDER BY rn;
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_QuestionGroup_Get
-- Params: provide either @Id or @SourceId (Id preferred). Returns one row with QuestionsJson (array)
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_QuestionGroup_Get
  @Id INT = NULL,
  @SourceId VARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @GroupId INT = @Id;

  IF @GroupId IS NULL AND @SourceId IS NOT NULL
  BEGIN
    SELECT TOP (1) @GroupId = Id
    FROM dbo.tblEL_QuestionBank_Group
    WHERE SourceId = @SourceId AND IsDeleted = 0;
  END

  IF @GroupId IS NULL
  BEGIN
    -- no group found: return empty result set
    SELECT CAST(NULL AS INT) AS Id, CAST(NULL AS VARCHAR(100)) AS SourceId, CAST(NULL AS NVARCHAR(255)) AS Title,
           CAST(NULL AS NVARCHAR(MAX)) AS Description, CAST(NULL AS INT) AS OrdinalNumber,
           CAST(NULL AS NVARCHAR(MAX)) AS MediaJson, CAST(NULL AS NVARCHAR(MAX)) AS RawJson,
           CAST(NULL AS VARCHAR(9)) AS CreateUser, CAST(NULL AS DATETIME) AS CreateTime,
           CAST(NULL AS VARCHAR(9)) AS UpdateUser, CAST(NULL AS DATETIME) AS UpdateTime,
           CAST(NULL AS BIT) AS IsDeleted, CAST(NULL AS NVARCHAR(MAX)) AS QuestionsJson
    WHERE 1 = 0; -- return no rows
    RETURN;
  END

  -- Return group columns + nested questions as JSON array (QuestionsJson)
  SELECT
    g.Id, g.SourceId, g.Title, g.Description, g.OrdinalNumber, g.MediaJson, g.RawJson,
    g.CreateUser, g.CreateTime, g.UpdateUser, g.UpdateTime, g.IsDeleted,
    (
      SELECT
        q.Id, q.SourceId, q.Type, q.Label, q.QuestionText, q.OrdinalNumber, q.Points, q.GradingType,
        q.IsAdvanced, q.ConfigJson, q.SkillsJson, q.RawJson, q.CreateUser, q.CreateTime, q.UpdateUser, q.UpdateTime, q.IsDeleted
      FROM dbo.tblEL_QuestionBank_Question q
      WHERE q.GroupId = g.Id AND q.IsDeleted = 0
      ORDER BY q.OrdinalNumber, q.Id
      FOR JSON PATH
    ) AS QuestionsJson
  FROM dbo.tblEL_QuestionBank_Group g
  WHERE g.Id = @GroupId;
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_Question_List
-- Params:
--   @GroupId INT = NULL (optional)
--   @Type VARCHAR(60) = NULL (optional)
--   @Search NVARCHAR(400) = NULL  -- simple substring search on Label or QuestionText
--   @IncludeDeleted BIT = 0
--   @PageNumber INT = 1, @PageSize INT = 100
-- Returns: paged list of questions
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_Question_List
  @GroupId INT = NULL,
  @Type VARCHAR(60) = NULL,
  @Search NVARCHAR(400) = NULL,
  @IncludeDeleted BIT = 0,
  @PageNumber INT = 1,
  @PageSize INT = 100
AS
BEGIN
  SET NOCOUNT ON;

  IF @PageNumber < 1 SET @PageNumber = 1;
  IF @PageSize < 1 SET @PageSize = 100;

  ;WITH CTE AS (
    SELECT
      q.Id, q.GroupId, q.SourceId, q.Type, q.Label, q.QuestionText, q.OrdinalNumber, q.Points, q.GradingType,
      q.IsAdvanced, q.ConfigJson, q.SkillsJson, q.RawJson, q.CreateUser, q.CreateTime, q.UpdateUser, q.UpdateTime, q.IsDeleted,
      ROW_NUMBER() OVER (ORDER BY q.OrdinalNumber ASC, q.Id ASC) AS rn
    FROM dbo.tblEL_QuestionBank_Question q
    WHERE (@IncludeDeleted = 1 OR q.IsDeleted = 0)
      AND (@GroupId IS NULL OR q.GroupId = @GroupId)
      AND (@Type IS NULL OR q.Type = @Type)
      AND (
            @Search IS NULL
            OR (
                (q.Label IS NOT NULL AND q.Label LIKE '%' + @Search + '%')
                OR (q.QuestionText IS NOT NULL AND q.QuestionText LIKE '%' + @Search + '%')
                OR (q.ConfigJson IS NOT NULL AND q.ConfigJson LIKE '%' + @Search + '%')
               )
          )
  )
  SELECT
    Id, GroupId, SourceId, Type, Label, QuestionText, OrdinalNumber, Points, GradingType,
    IsAdvanced, ConfigJson, SkillsJson, RawJson, CreateUser, CreateTime, UpdateUser, UpdateTime, IsDeleted
  FROM CTE
  WHERE rn BETWEEN ((@PageNumber - 1) * @PageSize) + 1 AND (@PageNumber * @PageSize)
  ORDER BY rn;
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_Question_Get
-- Params: provide either @Id or @SourceId (Id preferred). Returns the question row.
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_Question_Get
  @Id INT = NULL,
  @SourceId VARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF @Id IS NULL AND @SourceId IS NULL
  BEGIN
    RAISERROR('Provide either @Id or @SourceId.', 16, 1);
    RETURN;
  END

  IF @Id IS NULL
  BEGIN
    SELECT TOP (1) @Id = Id
    FROM dbo.tblEL_QuestionBank_Question
    WHERE SourceId = @SourceId AND IsDeleted = 0;
  END

  SELECT
    q.Id, q.GroupId, g.SourceId AS GroupSourceId, g.Title AS GroupTitle,
    q.SourceId, q.Type, q.Label, q.QuestionText, q.OrdinalNumber, q.Points, q.GradingType,
    q.IsAdvanced, q.ConfigJson, q.SkillsJson, q.RawJson, q.CreateUser, q.CreateTime, q.UpdateUser, q.UpdateTime, q.IsDeleted
  FROM dbo.tblEL_QuestionBank_Question q
  LEFT JOIN dbo.tblEL_QuestionBank_Group g ON g.Id = q.GroupId
  WHERE q.Id = @Id;
END
GO

--------------------------------------------------------------------------------
-- spAPI_EL_Question_FindBySkillSourceId
-- Params:
--   @SourceSkillId INT (KyNang_MonHoc_ChiTietID inside SkillsJson objects)
--   @PageNumber INT = 1, @PageSize INT = 100
-- Uses OPENJSON to parse SkillsJson and match KyNang_MonHoc_ChiTietID
--------------------------------------------------------------------------------
CREATE PROCEDURE dbo.spAPI_EL_Question_FindBySkillSourceId
  @SourceSkillId INT,
  @PageNumber INT = 1,
  @PageSize INT = 100
AS
BEGIN
  SET NOCOUNT ON;

  IF @SourceSkillId IS NULL
  BEGIN
    RAISERROR('Parameter @SourceSkillId is required.', 16, 1);
    RETURN;
  END

  IF @PageNumber < 1 SET @PageNumber = 1;
  IF @PageSize < 1 SET @PageSize = 100;

  ;WITH Matched AS (
    SELECT
      q.Id, q.GroupId, q.SourceId, q.Type, q.Label, q.QuestionText, q.OrdinalNumber, q.Points, q.GradingType,
      q.IsAdvanced, q.ConfigJson, q.SkillsJson, q.RawJson, q.CreateUser, q.CreateTime, q.UpdateUser, q.UpdateTime, q.IsDeleted,
      ROW_NUMBER() OVER (ORDER BY q.OrdinalNumber ASC, q.Id ASC) AS rn
    FROM dbo.tblEL_QuestionBank_Question q
    CROSS APPLY OPENJSON(q.SkillsJson) WITH (KyNang_MonHoc_ChiTietID INT '$.KyNang_MonHoc_ChiTietID') AS s
    WHERE s.KyNang_MonHoc_ChiTietID = @SourceSkillId
      AND q.IsDeleted = 0
  )
  SELECT
    Id, GroupId, SourceId, Type, Label, QuestionText, OrdinalNumber, Points, GradingType,
    IsAdvanced, ConfigJson, SkillsJson, RawJson, CreateUser, CreateTime, UpdateUser, UpdateTime, IsDeleted
  FROM Matched
  WHERE rn BETWEEN ((@PageNumber - 1) * @PageSize) + 1 AND (@PageNumber * @PageSize)
  ORDER BY rn;
END
GO

--------------------------------------------------------------------------------
-- Examples:
-- EXEC dbo.spAPI_EL_QuestionGroup_List @IncludeDeleted = 0, @PageNumber = 1, @PageSize = 50;
-- EXEC dbo.spAPI_EL_QuestionGroup_Get @Id = 1;
-- EXEC dbo.spAPI_EL_QuestionGroup_Get @SourceId = 'group_1775719953261';
-- EXEC dbo.spAPI_EL_Question_List @GroupId = 1, @Type = 'QUIZ_MULTIPLE_CHOICE', @Search = 'Nội dung', @PageNumber = 1, @PageSize = 20;
-- EXEC dbo.spAPI_EL_Question_Get @SourceId = 'q_1691b4f7-9849-4838-bcb7-ffe4e6eeb30f';
-- EXEC dbo.spAPI_EL_Question_FindBySkillSourceId @SourceSkillId = 1, @PageNumber = 1, @PageSize = 50;
--------------------------------------------------------------------------------