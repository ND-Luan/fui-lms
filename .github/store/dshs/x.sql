CREATE PROC spAPI_NhanXet_HocSinh_NienKhoaSau_Get_ByLopID
@NienKhoa INT,
@LopID int
AS
BEGIN
    SELECT nxt.HSLopID, hsl.HocSinhID, NhanXet_ChuanBiNienKhoaSau  
	FROM dbo.tblNhanXetThang nxt
		INNER JOIN dbo.tblNhanXetThang_Lop nxt_l ON nxt_l.Lop_NhanXetThangID = nxt.Lop_NhanXetThangID AND nxt_l.Enable = 1
		INNER JOIN dbo.tblHocSinhLop hsl ON hsl.HSLopID = nxt.HSLopID AND hsl.Enable = 1 
		INNER JOIN dbo.tblLop l ON l.LopID = hsl.LopID AND l.Enable = 1 AND l.NienKhoa = @NienKhoa 
	WHERE nxt_l.Enable = 1 
	AND nxt_l.NienKhoa = 2025
	AND nxt_l.Is_HienThiPhuHuynh = 0
	AND nxt_l.Thang = 5
	AND l.LopID = @LopID
END
