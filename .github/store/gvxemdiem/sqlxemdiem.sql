ALTER PROC [dbo].[spAPI_HocSinhBangDiem_Get_ByLopID_Semester]
    @Semester NVARCHAR(20)
  , @NienKhoa INT
  , @LopID    NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ValidCot TABLE (MaCotDiem NVARCHAR(50));
    INSERT INTO @ValidCot VALUES
        ('TX_L1_' + @Semester), ('TX_L2_' + @Semester), ('TX_L3_' + @Semester),
        ('TX_L4_' + @Semester), ('TX_L5_' + @Semester),
        ('DiemGK_' + @Semester), ('DiemCK_' + @Semester), ('DiemTB_' + @Semester),
        ('Theme1_Total'), ('Theme2_Total'), ('Theme3_Total'), ('Theme4_Total'),
        ('Theme5_Total'), ('Theme6_Total'), ('Theme7_Total'), ('Theme8_Total'),
        ('S1_Mid_Total_Point'), ('S1_Final_Total_Point'),
        ('S2_Mid_Total_Point'), ('S2_Final_Total_Point');

    SELECT SoDanhBo, HocSinhID, MonHocCode, MaCotDiem,
           KetQuaDanhGia_VI, mhSort, ctThuTuNhom, ctThuTuCotDiem,
           IsLock  -- *** cột mới ***
    FROM (
        -- Lấy theo lớp
        SELECT hsl.SoDanhBo
             , kqht.HocSinhID
             , mh.MonHocCode
             , ct.MaCotDiem
             , kqht.KetQuaDanhGia_VI
             , mh.Sort         AS mhSort
             , ct.ThuTuNhom    AS ctThuTuNhom
             , ct.ThuTuCotDiem AS ctThuTuCotDiem
             , CASE
                   WHEN ct.MaCotDiem LIKE 'TX[_]%'      THEN 1  -- TX không cần khóa, luôn = 1
                   WHEN kcd.KhoaCotDiemID IS NOT NULL    THEN 1  -- Đã khóa
                   ELSE                                       0  -- Chưa khóa
               END AS IsLock
        FROM dbo.tblKetQuaHocTap AS kqht
            INNER JOIN dbo.tblLop AS l
                ON  l.LopID    = kqht.LopID
                AND l.Enable   = 1
                AND l.NienKhoa = @NienKhoa
            INNER JOIN dbo.TemplateBangDiemChiTiet AS ct
                ON  ct.CotDiemID = kqht.CotDiemID
                AND ct.Enable    = 1
                AND ct.Semester  = @Semester
                AND EXISTS (SELECT 1 FROM @ValidCot v WHERE v.MaCotDiem = ct.MaCotDiem)
            INNER JOIN dbo.tblMonHocLop AS mhl
                ON  mhl.MonHocLopID = kqht.MonHocLopID
                AND mhl.Enable      = 1
                AND mhl.NienKhoa    = @NienKhoa
            INNER JOIN dbo.tblMonHoc AS mh
                ON  mh.MonHocID = mhl.MonHocID
                AND mh.Enable   = 1
            INNER JOIN dbo.tblHocSinhLop AS hsl
                ON  hsl.HocSinhID = kqht.HocSinhID
                AND hsl.LopID     = l.LopID
                AND hsl.Enable    = 1
            LEFT JOIN dbo.tblKhoaCotDiem AS kcd
                ON  kcd.MonHocLopID = kqht.MonHocLopID
                AND kcd.LopID       = kqht.LopID
                AND kcd.MaCotDiem   = ct.MaCotDiem
                AND kcd.Enable      = 1
                AND kcd.TinhTrang   = 1
        WHERE kqht.Enable   = 1
          AND kqht.NienKhoa = @NienKhoa
          AND kqht.LopID    = @LopID

        UNION ALL

        -- Lấy theo nhóm
        SELECT CAST(hsn.SoTT AS VARCHAR(2)) AS SoDanhBo
             , kqht.HocSinhID
             , mh.MonHocCode
             , ct.MaCotDiem
             , kqht.KetQuaDanhGia_VI
             , mh.Sort         AS mhSort
             , ct.ThuTuNhom    AS ctThuTuNhom
             , ct.ThuTuCotDiem AS ctThuTuCotDiem
             , CASE
                   WHEN ct.MaCotDiem LIKE 'TX[_]%'      THEN 1  -- TX không cần khóa, luôn = 1
                   WHEN kcd.KhoaCotDiemID IS NOT NULL    THEN 1  -- Đã khóa
                   ELSE                                       0  -- Chưa khóa
               END AS IsLock
        FROM dbo.tblHocSinhLop AS hsl
            INNER JOIN dbo.tblHocSinhNhom AS hsn
                ON  hsn.HocSinhID = hsl.HocSinhID
                AND hsn.Enable    = 1
            INNER JOIN dbo.tblKetQuaHocTap AS kqht
                ON  kqht.LopID     = hsn.NhomID
                AND kqht.HocSinhID = hsl.HocSinhID
                AND kqht.HocSinhID = hsn.HocSinhID
                AND kqht.NienKhoa  = @NienKhoa
                AND kqht.Enable    = 1
            INNER JOIN dbo.TemplateBangDiemChiTiet AS ct
                ON  ct.CotDiemID  = kqht.CotDiemID
                AND ct.Enable     = 1
                AND ct.MaCotDiem IN (SELECT MaCotDiem FROM @ValidCot)
            INNER JOIN dbo.tblMonHocLop AS mhl
                ON  mhl.MonHocLopID = kqht.MonHocLopID
                AND mhl.Enable      = 1
                AND mhl.NienKhoa    = @NienKhoa
            INNER JOIN dbo.tblMonHoc AS mh
                ON  mh.MonHocID = mhl.MonHocID
                AND mh.Enable   = 1
            LEFT JOIN dbo.tblKhoaCotDiem AS kcd
                ON  kcd.MonHocLopID = kqht.MonHocLopID
                AND kcd.LopID       = kqht.LopID
                AND kcd.MaCotDiem   = ct.MaCotDiem
                AND kcd.Enable      = 1
                AND kcd.TinhTrang   = 1
        WHERE hsl.Enable = 1
          AND hsl.LopID  = @LopID
    ) AS kq
    ORDER BY SoDanhBo, mhSort, ctThuTuNhom, ctThuTuCotDiem;
END;