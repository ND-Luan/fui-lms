USE [LMS-LHBS]
GO
/****** Object:  StoredProcedure [dbo].[spAPI_EL_Student_GetAssignmentDetail]    Script Date: 2026-05-25 10:58:45 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- EXEC [dbo].[spAPI_EL_Student_GetAssignmentDetail] 957, 1, '24100091'
ALTER PROCEDURE [dbo].[spAPI_EL_Student_GetAssignmentDetail]
    @AssignToClassID INT
	, @HocSinhID INT
  , @LanNop          INT = 1
  , @sys_UserID      VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;
    SET @LanNop = COALESCE(@LanNop, 1);
    DECLARE @NienKhoa_HienTai INT = dbo.fn_GetNienKhoa_HienTai();
    DECLARE @AssignedUnitID VARCHAR(100);

    IF @AssignToClassID IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy thông tin giao bài.', 16, 1);
        RETURN;
    END;

    -- Lấy ra Lớp/Nhóm mà bài tập này được giao
    SELECT @AssignedUnitID = mhl.LopNhomID
    FROM   dbo.tblEL_AssignToClass atc
    JOIN   dbo.tblMonHocLop        mhl ON atc.MonHocLopID = mhl.MonHocLopID
    WHERE  atc.AssignToClassID = @AssignToClassID
      AND  atc.IsDeleted        = 0;
    -- Kiểm tra học sinh có thuộc Lớp/Nhóm được giao không
    IF @AssignedUnitID IS NULL
    OR NOT EXISTS
    (
        SELECT 1
        FROM (
            SELECT l.LopID AS UnitID
            FROM   dbo.tblHocSinhLop hsl
            JOIN   dbo.tblLop        l ON hsl.LopID = l.LopID
            WHERE  hsl.HocSinhID = @HocSinhID
              AND  hsl.Enable     = 1
              AND  l.NienKhoa     = @NienKhoa_HienTai
            UNION
            SELECT n.NhomID
            FROM   dbo.tblHocSinhNhom hsn
            JOIN   dbo.tblNhom        n ON hsn.NhomID = n.NhomID
            WHERE  hsn.HocSinhID = @HocSinhID
              AND  hsn.Enable     = 1
              AND  n.NienKhoa     = @NienKhoa_HienTai
        ) AS MyUnits
        WHERE MyUnits.UnitID = @AssignedUnitID
    )
    BEGIN
        RAISERROR(N'[Unauthorized] Bạn không có quyền truy cập bài tập này.', 16, 1);
        RETURN;
    END;

    -- ── Lấy thông tin submission của đúng lần @LanNop ──────────────────────────
    -- Dùng cho Bảng 1 (AssignmentConfig) và Bảng 2
    DECLARE @SubmissionID_Current    INT;
    DECLARE @SubmissionStatus        INT;
    DECLARE @AssignmentConfig_Sub    NVARCHAR(MAX);
    DECLARE @Log_ChamBaiID_Current   INT;

    SELECT TOP 1
           @SubmissionID_Current  = SubmissionID
         , @SubmissionStatus      = SubmissionStatus
         , @AssignmentConfig_Sub  = AssignmentConfig
         , @Log_ChamBaiID_Current = Log_ChamBaiID
    FROM   dbo.tblEL_Submissions
    WHERE  AssignToClassID = @AssignToClassID
      AND  HocSinhID        = @HocSinhID
      AND  IsDeleted        = 0
      AND  (LanNop IS NULL OR LanNop = @LanNop)
    ORDER BY LanNop DESC;   -- lấy đúng lần @LanNop, nếu NULL thì lấy mới nhất

    -- ── Bảng 1: Thông tin Assignment (Đề bài) ──────────────────────────────────
    SELECT
           atc.AssignmentID
         , asm.Title
         , asm.Instructions
         , CASE
               WHEN @AssignmentConfig_Sub IS NULL THEN atc.AssignmentConfig_NoAnswer
               ELSE @AssignmentConfig_Sub
           END                                                                    AS AssignmentConfig
         , CASE WHEN @SubmissionStatus = 4 THEN atc.AssignmentConfig ELSE '' END  AS AssignmentConfig_HadAnswer
         , atc.DueDate
         , atc.MaxScore
         , mh.MonHocName
         , atc.AssignToClassID
         , asm.KhoiID
         , asm.MonHocID
         , asm.IsBlockCopy_Paste
		 , atc.Is_Full_Quiz
         , CASE WHEN @AssignmentConfig_Sub IS NULL THEN 0 ELSE 1 END              AS Is_Shuffle
         , lcb.Reason
         , CONCAT(gv.HoGV, ' ', gv.TenGV)                                        AS TeacherAssigned
    FROM   dbo.tblEL_AssignToClass          atc
    JOIN   dbo.tblEL_Assignments            asm ON atc.ResourceID   = asm.AssignmentID
                                               AND atc.ResourceType = 'ASSIGNMENT'
                                               AND asm.IsDeleted    = 0
    JOIN   dbo.tblMonHocLop                 mhl ON atc.MonHocLopID  = mhl.MonHocLopID
    JOIN   dbo.tblMonHoc                    mh  ON asm.MonHocID     = mh.MonHocID
    LEFT JOIN dbo.tblEL_Log_ChamBai         lcb ON lcb.Log_ChamBaiID = @Log_ChamBaiID_Current
    LEFT JOIN dbo.tblGiaoVien               gv  ON gv.GiaoVienID    = atc.CreateUser
    WHERE  atc.AssignToClassID = @AssignToClassID
      AND  atc.IsDeleted        = 0;

    -- ── Bảng 2: Thông tin Submission (Bài làm) ─────────────────────────────────
    SELECT
           SubmissionID
         , SubmissionContent
         , SubmissionStatus
         , Score
         , TeacherComment
         , GradedDate
         , GradedByTeacherID
         , LanNop
         , ISNULL(DurationTime, 0) AS DurationTime
    FROM   dbo.tblEL_Submissions
    WHERE  SubmissionID = @SubmissionID_Current
      AND  IsDeleted     = 0;

END;
