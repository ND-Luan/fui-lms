-- Groups
CREATE TABLE tblEL_QuestionBank_Group (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  SourceId VARCHAR(100) NULL,        -- id gốc từ JSON (ví dụ "group_...")
  Title NVARCHAR(255) NULL,
  Description NVARCHAR(MAX) NULL,
  OrdinalNumber INT NULL,
  MediaJson NVARCHAR(MAX) NULL,      -- media object nếu có (JSON text)
  RawJson NVARCHAR(MAX) NULL,        -- nguyên group JSON
  CreateUser VARCHAR(9) NULL,
  CreateTime DATETIME NULL,
  UpdateUser VARCHAR(9) NULL,
  UpdateTime DATETIME NULL,
  IsDeleted BIT DEFAULT 0
);
CREATE INDEX IX_QB_Group_SourceId ON tblEL_QuestionBank_Group(SourceId);
-- optional unique filtered index to prevent duplicate groups by SourceId
CREATE UNIQUE INDEX UX_QB_Group_SourceId ON tblEL_QuestionBank_Group(SourceId) WHERE SourceId IS NOT NULL;


-- Questions
CREATE TABLE tblEL_QuestionBank_Question (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  GroupId INT NOT NULL REFERENCES tblEL_QuestionBank_Group(Id) ON DELETE CASCADE,
  SourceId VARCHAR(100) NULL,        -- id gốc từ JSON (ví dụ "q_...")
  Type VARCHAR(60) NOT NULL,         -- QUIZ_SINGLE_CHOICE, QUIZ_MULTIPLE_CHOICE, QUIZ_TRUE_FALSE, ...
  Label NVARCHAR(200) NULL,
  QuestionText NVARCHAR(MAX) NULL,   -- canonical text/html (can be NULL if inside ConfigJson)
  OrdinalNumber INT NULL,
  Points DECIMAL(9,2) NULL,
  GradingType VARCHAR(50) NULL,
  IsAdvanced BIT DEFAULT 0,
  ConfigJson NVARCHAR(MAX) NULL,     -- store options[], parts[], correctAnswers[], media, scoringMode, etc.
  SkillsJson NVARCHAR(MAX) NULL,     -- store the skills array from JSON as raw JSON text
  RawJson NVARCHAR(MAX) NULL,        -- original question JSON
  CreateUser VARCHAR(9) NULL,
  CreateTime DATETIME NULL,
  UpdateUser VARCHAR(9) NULL,
  UpdateTime DATETIME NULL,
  IsDeleted BIT DEFAULT 0
);
CREATE INDEX IX_QB_Question_GroupId ON tblEL_QuestionBank_Question(GroupId);
CREATE INDEX IX_QB_Question_SourceId ON tblEL_QuestionBank_Question(SourceId);
CREATE INDEX IX_QB_Question_Type ON tblEL_QuestionBank_Question(Type);
-- optional unique filtered index on SourceId to avoid duplicate question imports
CREATE UNIQUE INDEX UX_QB_Question_SourceId ON tblEL_QuestionBank_Question(SourceId) WHERE SourceId IS NOT NULL;