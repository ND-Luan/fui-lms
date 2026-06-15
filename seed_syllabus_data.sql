USE [LMS-LHBS];
GO

-- =================================================================================
-- SEED DATA MẪU TOÀN CẤP CHO CHƯƠNG TRÌNH HỌC (LMS SYLLABUS) - NIÊN KHÓA 2025
-- Tự động tạo chương trình học mẫu cho TẤT CẢ các môn học thực tế của niên khóa 2025
-- =================================================================================

DECLARE @NienKhoa INT = 2025;
DECLARE @UserID VARCHAR(9) = 'ADMIN';

-- Bảng tạm chứa danh sách môn học thực tế của niên khóa 2025
DECLARE @ActiveSubjects TABLE (
    MonHocID INT,
    MonHocName NVARCHAR(255),
    CapID INT
);

-- Chèn danh sách môn học thực tế của niên khóa 2025 từ file text.txt
INSERT INTO @ActiveSubjects (MonHocID, MonHocName, CapID) VALUES
(1, N'Tiếng Việt', 1),
(2, N'Toán', 1),
(3, N'Tự nhiên và Xã hội', 1),
(4, N'Khoa học', 1),
(5, N'Ngoại ngữ', 1),
(6, N'Tin học và Công nghệ (Tin học)', 1),
(8, N'Đạo đức', 1),
(9, N'Nghệ thuật (Âm nhạc)', 1),
(10, N'Nghệ thuật (Mĩ thuật)', 1),
(11, N'Hoạt động trải nghiệm', 1),
(12, N'Giáo dục thể chất', 1),
(19, N'Lịch sử và Địa lí', 1),
(20, N'Năng lực-Tự chủ và tự học', 1),
(21, N'Năng lực-Giao tiếp và hợp tác', 1),
(22, N'Năng lực-Giải quyết vấn đề và sáng tạo', 1),
(23, N'Phẩm chất-Yêu nước', 1),
(24, N'Phẩm chất-Nhân ái', 1),
(25, N'Phẩm chất-Chăm chỉ', 1),
(26, N'Phẩm chất-Trung thực', 1),
(27, N'Phẩm chất-Trách nhiệm', 1),
(28, N'Năng lực-Ngôn ngữ', 1),
(29, N'Năng lực-Tính toán', 1),
(30, N'Năng lực-Khoa học', 1),
(31, N'Năng lực-Công nghệ', 1),
(32, N'Năng lực-Tin học', 1),
(33, N'Năng lực-Thẩm mĩ', 1),
(34, N'Năng lực-Thể chất', 1),
(35, N'Tin học và Công nghệ (Công nghệ)', 1),
(36, N'STEM', 1),
(37, N'JA-GD Tài chính', 1),
(38, N'AI - Robotics', 1),
(40, N'Kĩ năng thế kỉ 21', 1),
(41, N'GDKN-Vận động theo nhạc', 1),
(42, N'GDKN-Cờ vua', 1),
(43, N'GDKN-Bóng rổ', 1),
(44, N'AI', 2),
(46, N'Ngoại ngữ', 2),
(47, N'Công nghệ', 2),
(52, N'GDCD', 2),
(53, N'Nội dung giáo dục của địa phương', 2),
(55, N'Hoạt động trải nghiệm, hướng nghiệp', 2),
(56, N'Khoa học tự nhiên', 2),
(58, N'JA', 2),
(60, N'Lịch sử và Địa lí', 2),
(65, N'Nghệ thuật', 2),
(69, N'STEM', 2),
(71, N'Giáo dục thể chất', 2),
(72, N'Tin học', 2),
(73, N'Toán', 2),
(74, N'Ngữ văn', 2),
(79, N'Địa lí', 3),
(83, N'Nội dung giáo dục của địa phương', 3),
(84, N'Giáo dục Kinh tế và Pháp luật', 3),
(85, N'GDQP', 3),
(86, N'Hoạt động trải nghiệm, hướng nghiệp', 3),
(88, N'Hóa học', 3),
(91, N'Vật lí', 3),
(97, N'Sinh học', 3),
(99, N'STEM', 3),
(100, N'Lịch sử', 3),
(101, N'Giáo dục thể chất', 3),
(103, N'Toán', 3),
(104, N'Ngữ văn', 3),
(105, N'JA', 3),
(106, N'GDKN-Ẩm thực nấu ăn', 1);

-- Duyệt qua từng môn học bằng Cursor để sinh sách giáo khoa mẫu
DECLARE @MonHocID INT, @MonHocName NVARCHAR(255), @CapID INT;

DECLARE curSubjects CURSOR LOCAL FOR
SELECT MonHocID, MonHocName, CapID FROM @ActiveSubjects;

OPEN curSubjects;
FETCH NEXT FROM curSubjects INTO @MonHocID, @MonHocName, @CapID;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Xác định dải khối lớp tương ứng với CapID của môn học
    DECLARE @StartKhoi INT, @EndKhoi INT;
    IF @CapID = 1
    BEGIN
        SET @StartKhoi = 1;
        SET @EndKhoi = 5;
    END
    ELSE IF @CapID = 2
    BEGIN
        SET @StartKhoi = 6;
        SET @EndKhoi = 9;
    END
    ELSE IF @CapID = 3
    BEGIN
        SET @StartKhoi = 10;
        SET @EndKhoi = 12;
    END
    ELSE
    BEGIN
        -- Cấp học không thuộc 1, 2, 3
        SET @StartKhoi = 0;
        SET @EndKhoi = -1;
    END;

    -- Duyệt qua các khối thuộc cấp học đó để tạo sách mẫu
    DECLARE @KhoiIter INT = @StartKhoi;
    WHILE @KhoiIter <= @EndKhoi
    BEGIN
        -- Tên bộ sách mẫu: [Tên môn học] [Khối] - Tập 1 (Cánh Diều)
        DECLARE @SyllabusTitle NVARCHAR(255) = CONCAT(@MonHocName, N' ', @KhoiIter, N' - Tập 1 (Cánh Diều)');
        DECLARE @SyllabusID INT = NULL;

        -- 1. Thêm Syllabus (Sách giáo khoa)
        IF NOT EXISTS (SELECT 1 FROM dbo.tblEL_Syllabus WHERE Title = @SyllabusTitle AND IsDeleted = 0)
        BEGIN
            INSERT INTO dbo.tblEL_Syllabus (Title, Description, KhoiID, MonHocID, NienKhoa, HocKi, CreateUser, CreateTime)
            VALUES (@SyllabusTitle, CONCAT(N'Sách giáo khoa ', @MonHocName, N' lớp ', @KhoiIter, N', tập 1 chuẩn chương trình Cánh Diều.'), @KhoiIter, @MonHocID, @NienKhoa, 1, @UserID, GETDATE());
            
            SET @SyllabusID = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            SELECT @SyllabusID = SyllabusID FROM dbo.tblEL_Syllabus WHERE Title = @SyllabusTitle AND IsDeleted = 0;
        END;

        -- 2. Thêm các Node chương/bài mẫu nếu Syllabus chưa có cấu trúc chi tiết
        IF @SyllabusID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.tblEL_SyllabusNode WHERE SyllabusID = @SyllabusID AND IsDeleted = 0)
        BEGIN
            -- Chương I
            DECLARE @Ch1_ID INT;
            INSERT INTO dbo.tblEL_SyllabusNode (SyllabusID, ParentID, Title, NodeType, SortOrder, CreateUser, CreateTime)
            VALUES (@SyllabusID, NULL, N'Chương I: Kiến thức nền tảng và Mở đầu', 'CHAPTER', 10, @UserID, GETDATE());
            SET @Ch1_ID = SCOPE_IDENTITY();

            INSERT INTO dbo.tblEL_SyllabusNode (SyllabusID, ParentID, Title, NodeType, SortOrder, CreateUser, CreateTime) VALUES
            (@SyllabusID, @Ch1_ID, N'Bài 1: Làm quen với nội dung học tập và phương pháp nghiên cứu', 'LESSON', 10, @UserID, GETDATE()),
            (@SyllabusID, @Ch1_ID, N'Bài 2: Các khái niệm cơ bản và nguyên lý cốt lõi', 'LESSON', 20, @UserID, GETDATE());

            -- Chương II
            DECLARE @Ch2_ID INT;
            INSERT INTO dbo.tblEL_SyllabusNode (SyllabusID, ParentID, Title, NodeType, SortOrder, CreateUser, CreateTime)
            VALUES (@SyllabusID, NULL, N'Chương II: Luyện tập, Thực hành và Ứng dụng', 'CHAPTER', 20, @UserID, GETDATE());
            SET @Ch2_ID = SCOPE_IDENTITY();

            INSERT INTO dbo.tblEL_SyllabusNode (SyllabusID, ParentID, Title, NodeType, SortOrder, CreateUser, CreateTime) VALUES
            (@SyllabusID, @Ch2_ID, N'Bài 3: Thực hành và rèn luyện các kỹ năng quan trọng', 'LESSON', 10, @UserID, GETDATE()),
            (@SyllabusID, @Ch2_ID, N'Bài 4: Các ứng dụng thực tế và liên hệ đời sống', 'LESSON', 20, @UserID, GETDATE()),
            (@SyllabusID, @Ch2_ID, N'Bài 5: Ôn tập tổng hợp chương và kiểm tra đánh giá', 'LESSON', 30, @UserID, GETDATE());
        END;

        SET @KhoiIter = @KhoiIter + 1;
    END;

    FETCH NEXT FROM curSubjects INTO @MonHocID, @MonHocName, @CapID;
END;

CLOSE curSubjects;
DEALLOCATE curSubjects;

PRINT 'Seed data for all active 2025 subjects completed successfully.';
GO
