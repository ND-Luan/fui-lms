ALTER PROC [dbo].[spAPI_PH_TA_CotDiem_Get_By_HocSinhID_MaNhomCotDiem] --'19100002','Theme_1'
    @NienKhoa INT,
    @HocSinhID INT
  , @MaNhomCotDiem NVARCHAR(200)
AS
BEGIN
    SELECT kqht.HocSinhID
         , tbdct.ThuTuNhom
         , tbdct.MaNhomCotDiem
         , tbdct.TenNhomCotDiem_EN
         , tbdct.TenNhomCotDiem_VI
         , tbdct.ThuTuCotDiem
         , tbdct.MaCotDiem
         , tbdct.TenCotDiem_VI
         , tbdct.TenCotDiem_EN
         , kqht.KetQuaDanhGia_VI
         , kqht.KetQuaDanhGia_EN
         , tbdct.DiemMin
         , tbdct.DiemMax
         , tbdct.LamTronBaoNhieuSo
         , tbdct.LoaiCotDiem
         , tbdct.GiaTriCotDiem
         , tbdct.HexBackground
         , tbdct.CssClass
    FROM
           dbo.tblKetQuaHocTap                    AS kqht
           INNER JOIN dbo.TemplateBangDiemChiTiet AS tbdct ON tbdct.CotDiemID          = kqht.CotDiemID
                                                          AND tbdct.MaNhomCotDiem      = @MaNhomCotDiem
                                                          AND tbdct.IsVisibleToParents = 1
                                                          AND tbdct.Enable             = 1
                                                          AND tbdct.MaCotDiem not in ('DanhHieu_HK1','DiemTBCK_HK1','DanhHieu_HK2','DiemTBCK_HK2')
           INNER JOIN dbo.tblMonHocLop            AS mhl ON mhl.MonHocLopID            = kqht.MonHocLopID
                                                        AND mhl.Enable                 = 1
                                                        AND mhl.NienKhoa              = @NienKhoa
                                                        AND mhl.MonHocID IN (5, 46, 76) -- Id: 46 Là môn tiếng anh
    WHERE
           kqht.HocSinhID = @HocSinhID
      AND
           (
               kqht.KetQuaDanhGia_VI IS NOT NULL
          OR   kqht.KetQuaDanhGia_EN IS NOT NULL
           )
      AND  kqht.Enable     = 1
      AND  kqht.NienKhoa  = @NienKhoa
    ORDER BY
           tbdct.ThuTuNhom
         , tbdct.ThuTuCotDiem;
END;

GRANT EXECUTE ON [dbo].[spAPI_PH_TA_CotDiem_Get_By_HocSinhID_MaNhomCotDiem] TO [lmslhbs];
