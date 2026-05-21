USE [LMS-LHBS]
GO

ALTER PROCEDURE [dbo].[spAPI_BaoCao_ThongKe_NhanXet_Cap1]
    @LopID      NVARCHAR(100),
    @NienKhoa   INT,
    @HocKi      NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @MaCotDiem NVARCHAR(200) = N'NhanXet' + @HocKi + '%';

    -- ===================== Bước 1: Lọc CotDiemID theo HocKi =====================
    DROP TABLE IF EXISTS #CotDiem;
    SELECT ct.CotDiemID, ct.TemplateBangDiemID
    INTO #CotDiem
    FROM dbo.TemplateBangDiemChiTiet ct
    INNER JOIN dbo.TemplateBangDiem bd 
        ON bd.TemplateBangDiemID = ct.TemplateBangDiemID 
       AND bd.CapID = 1 
       AND bd.Enable = 1
    WHERE ct.MaCotDiem LIKE @MaCotDiem
      AND ct.Enable = 1;

    -- ===================== Bước 2: Lọc LopID hợp lệ =====================
    DROP TABLE IF EXISTS #Lop;
    SELECT l.LopID
    INTO #Lop
    FROM dbo.tblLop l
    INNER JOIN (
        SELECT value AS LopID 
        FROM STRING_SPLIT(@LopID, ',')
    ) split ON split.LopID = l.LopID
    WHERE l.Enable = 1 
      AND l.NienKhoa = @NienKhoa
      AND l.CapID = 1;

    -- ===================== Bước 3: Lọc dữ liệu gốc =====================
    DROP TABLE IF EXISTS #KetQua;
    SELECT 
        kqht.HocSinhID,
        kqht.LopID,
        kqht.NienKhoa,
        kqht.KetQuaDanhGia_VI,
        mhl.MonHocID
    INTO #KetQua
    FROM dbo.tblKetQuaHocTap kqht
    INNER JOIN #CotDiem cd 
        ON cd.CotDiemID = kqht.CotDiemID
    INNER JOIN #Lop l 
        ON l.LopID = kqht.LopID
    INNER JOIN dbo.tblMonHocLop mhl 
        ON mhl.MonHocLopID = kqht.MonHocLopID
       AND mhl.MonHocID IN (20,21,22, 23,24,25,26,27, 28,29,30,31,32,33,34)
       AND mhl.Enable = 1 
       AND mhl.NienKhoa = @NienKhoa
    WHERE kqht.Enable = 1
      AND kqht.NienKhoa = @NienKhoa;

    CREATE NONCLUSTERED INDEX IX_KetQua 
    ON #KetQua (HocSinhID, LopID, MonHocID);

    -- ===================== Bước 4: Gom nhóm từng loại =====================
    DROP TABLE IF EXISTS #NangLucChung;
    SELECT 
        HocSinhID, LopID,
        STRING_AGG(CAST(KetQuaDanhGia_VI AS NVARCHAR(MAX)), ' ') AS NhanXet_NangLucChung
    INTO #NangLucChung
    FROM #KetQua
    WHERE MonHocID IN (20, 21, 22)
    GROUP BY HocSinhID, LopID;

    DROP TABLE IF EXISTS #NangLucDacThu;
    SELECT 
        HocSinhID, LopID,
        STRING_AGG(CAST(KetQuaDanhGia_VI AS NVARCHAR(MAX)), ' ') AS NhanXet_NangLucDacThu
    INTO #NangLucDacThu
    FROM #KetQua
    WHERE MonHocID IN (28, 29, 30, 31, 32, 33, 34)
    GROUP BY HocSinhID, LopID;

    DROP TABLE IF EXISTS #PhamChat;
    SELECT 
        HocSinhID, LopID,
        STRING_AGG(CAST(KetQuaDanhGia_VI AS NVARCHAR(MAX)), ' ') AS NhanXet_PhamChat
    INTO #PhamChat
    FROM #KetQua
    WHERE MonHocID IN (23, 24, 25, 26, 27)
    GROUP BY HocSinhID, LopID;

    -- ===================== Bước 5: OUTPUT =====================
    SELECT 
        kq.HocSinhID,
        hs.Ho + ' ' + hs.Ten                                     AS HoTen,
        kq.LopID,
        l.TenLop,
        kq.NienKhoa,
        -- Tổng hợp theo nhóm
        LEN(nlc.NhanXet_NangLucChung)                            AS KiTu_NangLucChung,
        CASE WHEN LEN(nlc.NhanXet_NangLucChung)   >= 400 
             THEN 1 ELSE 0 END                                    AS VuotNhanXet_NangLucChung,
        LEN(nldt.NhanXet_NangLucDacThu)                          AS KiTu_NangLucDacThu,
        CASE WHEN LEN(nldt.NhanXet_NangLucDacThu) >= 400 
             THEN 1 ELSE 0 END                                    AS VuotNhanXet_NangLucDacThu,
        LEN(pc.NhanXet_PhamChat)                                  AS KiTu_PhamChat,
        CASE WHEN LEN(pc.NhanXet_PhamChat)        >= 400 
             THEN 1 ELSE 0 END                                    AS VuotNhanXet_PhamChat,
        -- Chi tiết từng môn
        CASE 
            WHEN kq.MonHocID IN (20,21,22)             THEN N'Năng lực chung'
            WHEN kq.MonHocID IN (28,29,30,31,32,33,34) THEN N'Năng lực đặc thù'
            WHEN kq.MonHocID IN (23,24,25,26,27)       THEN N'Phẩm chất'
        END                                                       AS NhomNhanXet,
        CASE kq.MonHocID
            WHEN 20 THEN N'Tự chủ và tự học'
            WHEN 21 THEN N'Giao tiếp và hợp tác'
            WHEN 22 THEN N'Giải quyết vấn đề và sáng tạo'
            WHEN 28 THEN N'Ngôn ngữ'
            WHEN 29 THEN N'Tính toán'
            WHEN 30 THEN N'Khoa học'
            WHEN 31 THEN N'Công nghệ'
            WHEN 32 THEN N'Tin học'
            WHEN 33 THEN N'Thẩm mĩ'
            WHEN 34 THEN N'Thể chất'
            WHEN 23 THEN N'Yêu nước'
            WHEN 24 THEN N'Nhân ái'
            WHEN 25 THEN N'Chăm chỉ'
            WHEN 26 THEN N'Trung thực'
            WHEN 27 THEN N'Trách nhiệm'
        END                                                       AS TenMon,
        kq.KetQuaDanhGia_VI                                       AS NhanXet,
        LEN(kq.KetQuaDanhGia_VI)                                  AS SoKyTu,
        400 - LEN(kq.KetQuaDanhGia_VI)                            AS ConLai,
        CASE WHEN LEN(kq.KetQuaDanhGia_VI) >= 400 
             THEN 1 ELSE 0 END                                    AS VuotNhanXet
    FROM #KetQua kq
    INNER JOIN dbo.tblHocSinh hs 
        ON hs.HocSinhID = kq.HocSinhID
    INNER JOIN dbo.tblLop l      
        ON l.LopID = kq.LopID AND l.NienKhoa = kq.NienKhoa
    LEFT JOIN #NangLucChung  nlc  
        ON nlc.HocSinhID = kq.HocSinhID AND nlc.LopID = kq.LopID
    LEFT JOIN #NangLucDacThu nldt 
        ON nldt.HocSinhID = kq.HocSinhID AND nldt.LopID = kq.LopID
    LEFT JOIN #PhamChat       pc  
        ON pc.HocSinhID  = kq.HocSinhID AND pc.LopID  = kq.LopID
    WHERE LEN(nlc.NhanXet_NangLucChung)   >= 400
       OR LEN(nldt.NhanXet_NangLucDacThu) >= 400
       OR LEN(pc.NhanXet_PhamChat)        >= 400
    ORDER BY l.TenLop, hs.Ho, hs.Ten, kq.MonHocID;

    -- ===================== Dọn dẹp =====================
    DROP TABLE IF EXISTS #CotDiem;
    DROP TABLE IF EXISTS #Lop;
    DROP TABLE IF EXISTS #KetQua;
    DROP TABLE IF EXISTS #NangLucChung;
    DROP TABLE IF EXISTS #NangLucDacThu;
    DROP TABLE IF EXISTS #PhamChat;

END;