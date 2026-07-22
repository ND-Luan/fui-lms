# Database Schema - LMS-LHBS

Tai lieu nay luu tru cau truc cac bang du lieu cua he thong LMS-LHBS duoi dang Mermaid diagram de cac Agent co the tra cuu nhanh.

## 1. ER Diagram

```mermaid
classDiagram
direction BT
class tbl_ChiTieu {
   int ChiTieu_ID
   float ChiTieuDatRa
   float ChiTieuThucTe
   float SoVoiThucTe
   bit Enable
   varchar(9) CreateUser
   varchar(9) UpdateUser
   datetime CreateTime
   datetime UpdateTime
   int MucDo_ID
   int LopID
   float DiemMin
   float DiemMax
   varchar(2) Suffix
   varchar(2) Prefix
   nvarchar(50) TrinhDo
   varchar(10) NhomID
   int HocKi
   bit Is_GroupName
}
class tbl_DiemTA_C2_C3 {
   int CapID
   int HocSinhID
   varchar(50) LopID
   varchar(50) LopNhom
   nvarchar(50) MaNhomCotDiem
   nvarchar(50) MaCotDiem
   nvarchar(50) KetQuaDanhGia
}
class tbl_DiemTiengAnh_THCS {
   int STT
   varchar(20) StudentID
   varchar(10) Class
   nvarchar(50) Surname
   nvarchar(50) Name
   nvarchar(100) EnglishName
   nvarchar(100) GVVN
   nvarchar(100) GVNN
   nvarchar(100) GK1_Nghe
   nvarchar(100) GK1_Nghe_Convert
   nvarchar(100) GK1_NgonNgu
   nvarchar(100) GK1_NgonNgu_Convert
   nvarchar(100) GK1_Doc
   nvarchar(100) GK1_Doc_Convert
   nvarchar(100) GK1_Viet
   nvarchar(100) GK1_Viet_Convert
   nvarchar(100) GK1_Noi
   nvarchar(100) GK1_Noi_Convert
   nvarchar(100) GK1_Tong
   nvarchar(100) GK1_Tong_Convert
   nvarchar(100) CK1_Nghe
   nvarchar(100) CK1_Nghe_Convert
   nvarchar(100) CK1_NgonNgu
   nvarchar(100) CK1_NgonNgu_Convert
   nvarchar(100) CK1_Doc
   nvarchar(100) CK1_Doc_Convert
   nvarchar(100) CK1_Viet
   nvarchar(100) CK1_Viet_Convert
   nvarchar(100) CK1_Noi
   nvarchar(100) CK1_Noi_Convert
   nvarchar(100) CK1_Tong
   nvarchar(100) CK1_Tong_Convert
   nvarchar(100) GK2_Nghe
   nvarchar(100) GK2_Nghe_Convert
   nvarchar(100) GK2_NgonNgu
   nvarchar(100) GK2_NgonNgu_Convert
   nvarchar(100) GK2_Doc
   nvarchar(100) GK2_Doc_Convert
   nvarchar(100) GK2_Viet
   nvarchar(100) GK2_Viet_Convert
   nvarchar(100) GK2_Noi
   nvarchar(100) GK2_Noi_Convert
   nvarchar(100) GK2_Tong
   nvarchar(100) GK2_Tong_Convert
}
class tbl_DiemTiengAnh_THPT {
   int STT
   nvarchar(100) Student_ID
   nvarchar(100) Class
   nvarchar(100) Group
   nvarchar(100) Surname
   nvarchar(100) Name
   nvarchar(100) English_name
   int STT_Nhom
   nvarchar(100) GVVN
   nvarchar(100) GVNN
   nvarchar(100) S1_Mid_Listening_Point
   nvarchar(100) S1_Mid_Reading_Point
   nvarchar(100) S1_Mid_Writing_Point
   nvarchar(100) S1_Mid_Speaking_Point
   nvarchar(100) S1_Mid_Language_Point
   nvarchar(100) S1_Mid_Total_Point
   nvarchar(100) S1_Mid_Listening_Conv
   nvarchar(100) S1_Mid_Reading_Conv
   nvarchar(100) S1_Mid_Writing_Conv
   nvarchar(100) S1_Mid_Speaking_Conv
   nvarchar(100) S1_Mid_Language_Conv
   nvarchar(100) S1_Mid_Total_Conv
   nvarchar(100) S1_Mid_TA2_Listening_Point
   nvarchar(100) S1_Mid_TA2_Listening_Conv
   nvarchar(100) S1_Mid_TA2_Reading_Point
   nvarchar(100) S1_Mid_TA2_Reading_Conv
   nvarchar(100) S1_Mid_TA2_Writing_Point
   nvarchar(100) S1_Mid_TA2_Writing_Conv
   nvarchar(100) S1_Mid_TA2_Speaking_Point
   nvarchar(100) S1_Mid_TA2_Speaking_Conv
   nvarchar(100) S1_Mid_TA2_Avg_Point
   nvarchar(100) S1_Mid_TA2_Avg_Conv
   nvarchar(100) S1_Mid_IELTS_Listening_Conv
   nvarchar(100) S1_Mid_IELTS_Speaking_Conv
   nvarchar(100) S1_Mid_IELTS_Reading_Conv
   nvarchar(100) S1_Mid_IELTS_Writing_Conv
   nvarchar(100) S1_Mid_IELTS_Band_Conv
   nvarchar(100) S1_Final_Listening_Point
   nvarchar(100) S1_Final_Reading_Point
   nvarchar(100) S1_Final_Writing_Point
   nvarchar(100) S1_Final_Speaking_Point
   nvarchar(100) S1_Final_Language_Point
   nvarchar(100) S1_Final_Total_Point
   nvarchar(100) S1_Final_Listening_Conv
   nvarchar(100) S1_Final_Reading_Conv
   nvarchar(100) S1_Final_Writing_Conv
   nvarchar(100) S1_Final_Speaking_Conv
   nvarchar(100) S1_Final_Language_Conv
   nvarchar(100) S1_Final_Total_Conv
   nvarchar(100) S1_Final_TA2_Listening_Point
   nvarchar(100) S1_Final_TA2_Listening_Conv
   nvarchar(100) S1_Final_TA2_Reading_Point
   nvarchar(100) S1_Final_TA2_Reading_Conv
   nvarchar(100) S1_Final_TA2_Writing_Point
   nvarchar(100) S1_Final_TA2_Writing_Conv
   nvarchar(100) S1_Final_TA2_Speaking_Point
   nvarchar(100) S1_Final_TA2_Speaking_Conv
   nvarchar(100) S1_Final_TA2_Avg_Point
   nvarchar(100) S1_Final_TA2_Avg_Conv
   nvarchar(100) S1_Final_IELTS_Listening_Conv
   nvarchar(100) S1_Final_IELTS_Speaking_Conv
   nvarchar(100) S1_Final_IELTS_Reading_Conv
   nvarchar(100) S1_Final_IELTS_Writing_Conv
   nvarchar(100) S1_Final_IELTS_Band_Conv
   nvarchar(100) S2_Mid_Listening_Point
   nvarchar(100) S2_Mid_Reading_Point
   nvarchar(100) S2_Mid_Writing_Point
   nvarchar(100) S2_Mid_Speaking_Point
   nvarchar(100) S2_Mid_Language_Point
   nvarchar(100) S2_Mid_Total_Point
   nvarchar(100) S2_Mid_Listening_Conv
   nvarchar(100) S2_Mid_Reading_Conv
   nvarchar(100) S2_Mid_Writing_Conv
   nvarchar(100) S2_Mid_Speaking_Conv
   nvarchar(100) S2_Mid_Language_Conv
   nvarchar(100) S2_Mid_Total_Conv
   nvarchar(100) S2_Mid_IELTS_Listening_Conv
   nvarchar(100) S2_Mid_IELTS_Speaking_Conv
   nvarchar(100) S2_Mid_IELTS_Reading_Conv
   nvarchar(100) S2_Mid_IELTS_Writing_Conv
   nvarchar(100) S2_Mid_IELTS_Band_Conv
   nvarchar(100) S2_Mid_TA2_Listening_Point
   nvarchar(100) S2_Mid_TA2_Listening_Conv
   nvarchar(100) S2_Mid_TA2_Reading_Point
   nvarchar(100) S2_Mid_TA2_Reading_Conv
   nvarchar(100) S2_Mid_TA2_Writing_Point
   nvarchar(100) S2_Mid_TA2_Writing_Conv
   nvarchar(100) S2_Mid_TA2_Speaking_Point
   nvarchar(100) S2_Mid_TA2_Speaking_Conv
   nvarchar(100) S2_Mid_TA2_Avg_Point
   nvarchar(100) S2_Mid_TA2_Avg_Conv
}
class tbl_LOG_HocSinhNhom {
   int Log_HocSinhNhomID
   int HSNhomID
   int HocSinhID
   int LopID
   varchar(50) NhomID
   varchar(10) NhomID_HK1
   varchar(10) SoDanhBo
   int SoTT
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tbl_LOG_HocSinhNhom_2025 {
   int Log_HocSinhNhomID
   int HSNhomID
   int HocSinhID
   int LopID
   varchar(50) NhomID
   varchar(10) NhomID_HK1
   varchar(10) SoDanhBo
   int SoTT
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tbl_LOG_KetQuaHocTap {
   int BackupID
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   tinyint TinhTrang
   bit Is_Edit
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
   int KhoaCotDiemID
}
class tbl_LOG_KetQuaHocTap_2024_2025 {
   int BackupID
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   tinyint TinhTrang
   bit Is_Edit
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
   int KhoaCotDiemID
}
class tbl_LOG_KhoaCotDiem {
   int Log_KhoaCotDiemID
   int KhoaCotDiemID
   bit TinhTrang
   nvarchar(1000) LyDo
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tbl_LOG_KhoaCotDiem_2025 {
   int Log_KhoaCotDiemID
   int KhoaCotDiemID
   bit TinhTrang
   nvarchar(1000) LyDo
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tbl_LOG_NhanXetThang {
   int BackupID
   int NhanXetThangID
   int Lop_NhanXetThangID
   int HSLopID
   int HocSinhID
   nvarchar(max) NoiDungKienThuc_HTML
   nvarchar(max) NoiDungNangLuc_HTML
   nvarchar(max) NoiDungHoatDongKhac_HTML
   nvarchar(max) NoiDungToan_HTML
   nvarchar(max) NoiDungTiengViet_HTML
   nvarchar(max) NoiDungMonHocKhac_HTML
   nvarchar(max) NhanXetCuoiNam_HTML
   float DiemToan
   int SoSao_Toan
   nvarchar(max) NhanXetToan_HTML
   float DiemTiengViet
   int SoSao_TiengViet
   nvarchar(max) NhanXetTiengViet_HTML
   nvarchar(max) NhanXetMonHocKhac_HTML
   nvarchar(max) HoatDongGiaoDucKhac_HTML
   nvarchar(max) PhamChatNangLuc_HTML
   bit Is_Reject
   nvarchar(max) ReasonReject
   nvarchar(max) Parent_Comment
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   varchar(9) ParentConfirmUser
   datetime ParentConfirmTime
   nvarchar(max) UuDiem
   nvarchar(max) NhuocDiem
   nvarchar(max) DeXuat
   nvarchar(500) NhanXetGVCN
   bit Is_Viewed
   nvarchar(50) PhoiHopCMHS
   nvarchar(4000) NhanXetGVCN_VePhuHuynh_HTML
   nvarchar(4000) NhanXetGVCN_VeHocSinh_HTML
   nvarchar(50) PhanLoai_TuyenThang
   nvarchar(50) Flyers
   float DiemTA
   bit DKHocTiep
   nvarchar(500) DeXuat_NDCamKet
   nvarchar(1000) NhanXet_ChuanBiNienKhoaSau
}
class tbl_LOG_NhanXetThang_2025 {
   int BackupID
   int NhanXetThangID
   int Lop_NhanXetThangID
   int HSLopID
   int HocSinhID
   nvarchar(max) NoiDungKienThuc_HTML
   nvarchar(max) NoiDungNangLuc_HTML
   nvarchar(max) NoiDungHoatDongKhac_HTML
   nvarchar(max) NoiDungToan_HTML
   nvarchar(max) NoiDungTiengViet_HTML
   nvarchar(max) NoiDungMonHocKhac_HTML
   nvarchar(max) NhanXetCuoiNam_HTML
   float DiemToan
   int SoSao_Toan
   nvarchar(max) NhanXetToan_HTML
   float DiemTiengViet
   int SoSao_TiengViet
   nvarchar(max) NhanXetTiengViet_HTML
   nvarchar(max) NhanXetMonHocKhac_HTML
   nvarchar(max) HoatDongGiaoDucKhac_HTML
   nvarchar(max) PhamChatNangLuc_HTML
   bit Is_Reject
   nvarchar(max) ReasonReject
   nvarchar(max) Parent_Comment
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   varchar(9) ParentConfirmUser
   datetime ParentConfirmTime
   nvarchar(max) UuDiem
   nvarchar(max) NhuocDiem
   nvarchar(max) DeXuat
   nvarchar(500) NhanXetGVCN
   bit Is_Viewed
   nvarchar(50) PhoiHopCMHS
   nvarchar(4000) NhanXetGVCN_VePhuHuynh_HTML
   nvarchar(4000) NhanXetGVCN_VeHocSinh_HTML
   nvarchar(50) PhanLoai_TuyenThang
   nvarchar(50) Flyers
   float DiemTA
   bit DKHocTiep
   nvarchar(500) DeXuat_NDCamKet
   nvarchar(1000) NhanXet_ChuanBiNienKhoaSau
}
class tbl_LOG_NhanXetThang_Lop {
   int BackupID
   int Lop_NhanXetThangID
   int LopID
   nvarchar(50) HocKy
   int Thang
   int Nam
   nvarchar(20) Text_Thang_VI
   nvarchar(20) Text_Thang_EN
   int NienKhoa
   varchar(100) IconUrl
   tinyint TinhTrang
   bit Is_HienThiPhuHuynh
   nvarchar(400) ReasonReject
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   bit Is_Showing
   datetime LogTime
   varchar(9) LogUser
}
class tbl_LOG_NhanXetThang_Lop_2025 {
   int BackupID
   int Lop_NhanXetThangID
   int LopID
   nvarchar(50) HocKy
   int Thang
   int Nam
   nvarchar(20) Text_Thang_VI
   nvarchar(20) Text_Thang_EN
   int NienKhoa
   varchar(100) IconUrl
   tinyint TinhTrang
   bit Is_HienThiPhuHuynh
   nvarchar(400) ReasonReject
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   bit Is_Showing
   datetime LogTime
   varchar(9) LogUser
}
class tbl_MucDo {
   int MucDo_ID
   nvarchar(100) TenMucDo
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   int CapID
   int NienKhoa
   bit Is_TA2
   int Sort
}
class tbl_QLDiem_Tam_C1 {
   int KyDanhGia
   int LopID
   varchar(50) STT
   varchar(200) SoDanhBo
   int HocSinhID
   nvarchar(200) HoTen
   nvarchar(10) NgaySinh
   nvarchar(100) TenLop
   nvarchar(200) TenMon
   nvarchar(200) ThoiDiemDanhGia
   nvarchar(500) NhanXet
   float DiemMonHoc
   varchar(100) MucDoDanhGia
   bit Is_Insert
   bit Is_Update
   varchar(9) CreateUser
   date CreateTime
   date UpdateTime
   varchar(9) UpdateUser
}
class tbl_QLDiem_Tam_C2 {
   int LopID
   varchar(50) MonHocID
   int STT
   varchar(50) TenLop
   varchar(9) HocSinhID
   nvarchar(200) HoTen
   varchar(10) NgaySinh
   float DTB
   float TX1
   float TX2
   float TX3
   float TX4
   float TX5
   float GK
   float CK
   bit Is_Insert
   bit Is_Update
   varchar(9) CreateUser
   date CreateTime
   date UpdateTime
   varchar(9) UpdateUser
}
class tbl_QLDiem_Tam_C2_HK2 {
   int LopID
   varchar(50) MonHocID
   int STT
   varchar(50) TenLop
   varchar(9) HocSinhID
   nvarchar(200) HoTen
   varchar(10) NgaySinh
   float DTB
   float TX1
   float TX2
   float TX3
   float TX4
   float TX5
   float GK
   float CK
   bit Is_Insert
   bit Is_Update
   varchar(9) CreateUser
   date CreateTime
   date UpdateTime
   varchar(9) UpdateUser
}
class tbl_QLDiem_Tam_C3 {
   int LopID
   varchar(50) MonHocID
   int STT
   varchar(50) TenLop
   varchar(9) HocSinhID
   nvarchar(200) HoTen
   varchar(10) NgaySinh
   float DTB
   float TX1
   float TX2
   float TX3
   float TX4
   float TX5
   float GK
   float CK
   bit Is_Insert
   bit Is_Update
   varchar(9) CreateUser
   date CreateTime
   date UpdateTime
   varchar(9) UpdateUser
}
class tbl_XepNhomTiengAnh {
   int ID
   int HocSinhID
   nvarchar(50) LopCu
   nvarchar(100) Ho
   nvarchar(100) Ten
   date NgaySinh
   nvarchar(10) Phai
   nvarchar(20) SDT
   float Doc
   float Nghe
   float Noi
   float Viet
   float Chung
   float TongDiem
   float Diem_Cambridge
   nvarchar(20) CEFR_Nghe
   nvarchar(20) CEFR_Language
   nvarchar(20) CEFR_Viet
   nvarchar(20) CEFR_Noi
   nvarchar(20) CEFR_Tong
   nvarchar(255) GhiChu
   nvarchar(50) XepNhomTiengAnh
   nvarchar(20) LoaiHocSinh
}
class tblAI {
   int ID
   nvarchar(50) Code
   varchar(1000) API_KEY
}
class tblAlert {
   int AlertID
   varchar(100) TypeAlert
   nvarchar(100) ContentAlert
   datetime DateAlert
   int CapID
   int NienKhoa
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   varchar(50) UserRight
}
class tblAlertRead {
   int AlertReadID
   int AlertID
   varchar(20) UserID
   datetime ReadTime
}
class tblBangDiemChiTiet_CK1_C1 {
   int LopID
   nvarchar(100) TenLop
   nvarchar(200) TenMon
   nvarchar(200) TenKyNang
   int HocSinhID
   int HinhThuc
   int STT
   nvarchar(50) TenCau
   nvarchar(200) cauhoi
   float diem
   nvarchar(50) TenCau_VI
   nvarchar(200) TenCau_HinhThucThi_VI
   nvarchar(200) TenCau_STT
}
class tblBangDiemChiTiet_GK1_C1 {
   int LopID
   nvarchar(100) TenLop
   nvarchar(200) TenMon
   nvarchar(200) HinhThuc
   int KyDanhGia
   int HocSinhID
   int STT
   nvarchar(50) TenCau
   float Diem
}
class tblBaoCao {
   int BaoCaoID
   int CapID
   int MonHocID
   nvarchar(400) TenBaoCao
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   datetime UpdateTime
   varchar(9) UpdateUser
}
class tblBaoCao_Cambridge {
   int BaoCao_HocSinhID
   int NienKhoa
   int CapID
   int HocSinhID
   nvarchar(50) HocKi
   decimal DocTL
   decimal NgheTL
   decimal NoiTL
   decimal VietTL
   nvarchar(50) DocPL
   nvarchar(50) NghePL
   nvarchar(50) NoiPL
   nvarchar(50) VietPL
   decimal PhanTramChung
   nvarchar(50) DanhGiaChung
}
class tblBaoCao_ChiTiet {
   int BaoCao_ChiTietID
   int BaoCaoID
   nvarchar(200) TenBaoCao_ChiTiet
   int NienKhoa
   varchar(50) HocKi
   nvarchar(max) JSON_BaoCao
   varchar(200) Url_BaoCao
   bit IsChotBaoCao
   bit Enable
   datetime NgayChot
   varchar(9) NguoiChot
   varchar(9) NguoiTao
   datetime NgayTao
   varchar(9) NguoiCapNhat
   datetime NgayCapNhat
}
class tblBoSach_FP {
   int BoSachID
   nvarchar(255) TenBoSach
   nvarchar(1000) MoTa
   varchar(500) ThumbnailURL
   int TrangThai
   bit Is_Xoa
   datetime CreateTime
   varchar(50) CreateUser
   datetime UpdateTime
   varchar(50) UpdateUser
}
class tblCap {
   int CapID
   nvarchar(254) TenCapHoc
   varchar(10) CapHocCode
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblChiTieu_C1 {
   int ChiTieuID
   int NienKhoa
   int KhoiID
   int MonHocID
   float ChiTieu_HoanThanhTot
   float ChiTieu_HoanThanh
   float ChiTieu_ChuaHoanThanh
   float ChiTieu_Tot
   float ChiTieu_Dat
   float ChiTieu_CanCoGang
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblChiTieu_C2 {
   int ChiTieuID
   int NienKhoa
   int KhoiID
   nvarchar(200) TenMonHoc
   int MonHocID
   float ChiTieu_Tot
   float ChiTieu_Kha
   float ChiTieu_Dat
   float ChiTieu_ChuaDat
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblChiTieu_DanhHieu_CuoiNam {
   int ChiTieuID
   int CapID
   int NienKhoa
   int KhoiID
   float DanhHieu_HS_XuatSac
   float DanhHieu_HS_Gioi
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblChiTieu_KQHT_CuoiNam {
   int ChiTieuID
   int NienKhoa
   int KhoiID
   float Tot
   float Kha
   float Dat
   float ChuaDat
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblChiTieu_TA1 {
   int ChiTieuID
   int CapID
   nvarchar(50) LopID
   nvarchar(100) HocKi
   float ChuaDat
   float Dat
   float Kha
   float Tot
   float C1_HoanThanh
   float C1_ChuaHoanThanh
   float C1_Tot
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblChiTieu_TA2 {
   int ChiTieuID
   int CapID
   nvarchar(200) LopID
   float ChiTieu
   int HocKi
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblChuKy {
   int ChuKyID
   char(32) HinhAnhChuKy
   varchar(10) GiaoVienID
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblCommentDetail {
   int CommentDetailID
   int CommentGroupID
   nvarchar(500) CommentDetailName_VI
   nvarchar(500) CommentDetailName_EN
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblCommentGroup {
   int CommentGroupID
   nvarchar(300) CommentGroupName_VI
   nvarchar(300) CommentGroupName_EN
   int MonHocID
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblConfig_STEM {
   int ConfigID
   int NienKhoa
   int KhoiID
   nvarchar(50) HocKi
   nvarchar(50) HocKi_LayTongDiemChuDe
   nchar(10) Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblCongBoBangDiem {
   int ID
   int CapID
   int KyDanhGia
   int Is_Public
   int NamHoc
}
class tblDanhSachHocSinh_CoIELTS {
   int DSHS_Ielts_ID
   int NienKhoa
   varchar(50) LoaiDiem
   nvarchar(50) HocKi
   int HocSinhID
   nvarchar(50) LopID
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblDiem_HocSinh_Keo_Diem {
   nvarchar(50) LopID
   nvarchar(50) TenLop
   int HocKy
   int STT
   nvarchar(50) MonHocID
   int HocSinhID
   nvarchar(200) HoTen
   nvarchar(50) NgaySinh
   float TX1
   float TX2
   float TX3
   float TX4
   float GK
   float CK
   float DTB
   int LuotCapNhat
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblDinhNghiaKieuDanhGia {
   int KieuDanhGiaID
   nvarchar(100) KieuDanhGia
   nvarchar(100) KieuDanhGiaType
   nvarchar(100) TenGiaTri1_VI
   nvarchar(100) TenGiaTri2_VI
   nvarchar(100) TenGiaTri3_VI
   nvarchar(100) TenGiaTri4_VI
   nvarchar(100) TenGiaTri5_VI
   nvarchar(100) TenGiaTri1_EN
   nvarchar(100) TenGiaTri2_EN
   nvarchar(100) TenGiaTri3_EN
   nvarchar(100) TenGiaTri4_EN
   nvarchar(100) TenGiaTri5_EN
}
class tblEL_Achievement_Definitions {
   varchar(200) AchievementCode
   varchar(20) AchievementType
   varchar(200) PeriodType
   nvarchar(255) Title
   nvarchar(500) Description
   varchar(50) Icon
   varchar(20) Color
   int Points
   nvarchar(500) ImageUrl
   bit IsDeleted
}
class tblEL_Achievements {
   bigint AchievementID
   int HocSinhID
   varchar(50) AchievementCode
   int PointsEarned
   int ContextResourceID
   varchar(50) ContextResourceType
   datetime EarnedDate
   int NienKhoa
   bit IsDeleted
   datetime CreateTime
   varchar(9) CreateUser
}
class tblEL_Activity_Logs {
   bigint ActivityID
   int HocSinhID
   varchar(50) ActivityType
   int ResourceID
   varchar(50) ResourceType
   nvarchar(max) ActivityData
   bit IsDeleted
   datetime CreateTime
   varchar(9) CreateUser
}
class tblEL_Analytics_QuestionResults {
   bigint ResultID
   bigint SubmissionID
   int AssignmentID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int MonHocLopID
   nvarchar(max) Skills
   varchar(50) QuestionID_InJSON
   varchar(50) QuestionType
   decimal Score
   decimal MaxScore
   bit IsCorrect
   datetime SubmissionTime
   bigint AssignToClassID
   int MonHocID
   bit IsDeleted
   int AssignToStudentID
}
class tblEL_Assignments {
   int AssignmentID
   int MonHocID
   int KhoiID
   nvarchar(20) Tuan
   int TuanHocID
   nvarchar(2000) Chuong
   nvarchar(255) Title
   nvarchar(max) Instructions
   nvarchar(max) AssignmentConfig
   nvarchar(max) AssignmentConfig_NoAnswer
   decimal MaxScore
   int NienKhoa
   tinyint HocKi
   nvarchar(200) IntegrationSource
   bit IsDev
   bit IsDeleted
   bit IsBlockCopy_Paste
   bit IsPublic
   bit IsCopy
   int CopyFromAssignmentID
   varchar(9) CopyFromUserID
   datetime CopyTime
   datetime CreateTime
   varchar(9) CreateUser
   datetime UpdateTime
   varchar(9) UpdateUser
}
class tblEL_AssignToClass {
   bigint AssignToClassID
   int AssignmentID
   int MonHocLopID
   nvarchar(max) AssignmentConfig
   nvarchar(max) AssignmentConfig_NoAnswer
   datetime StartDate
   datetime DueDate
   decimal MaxScore
   bit IsAllowLateSubmission
   varchar(20) ResourceType
   int ResourceID
   int NienKhoa
   int LimitAssigned
   bit Is_Full_Quiz
   int Status
   bit IsHided
   bit IsDeleted
   datetime CreateTime
   varchar(9) CreateUser
   datetime UpdateTime
   varchar(9) UpdateUser
}
class tblEL_AssignToStudent {
   bigint AssignToStudentID
   int AssignmentID
   int HocSinhID
   int MonHocLopID
   nvarchar(max) AssignmentConfig
   nvarchar(max) AssignmentConfig_NoAnswer
   datetime StartDate
   datetime DueDate
   decimal MaxScore
   bit IsAllowLateSubmission
   varchar(20) ResourceType
   int ResourceID
   int NienKhoa
   int LimitAssigned
   bit Is_Full_Quiz
   bit IsHided
   int Status
   bit IsDeleted
   datetime CreateTime
   varchar(9) CreateUser
   datetime UpdateTime
   varchar(9) UpdateUser
}
class tblEL_Elements {
   bigint ElementID
   int LessonID
   varchar(50) ElementType
   nvarchar(max) ElementData
   int SortOrder
   bit IsDeleted
   datetime CreateTime
   varchar(9) CreateUser
   datetime UpdateTime
   varchar(9) UpdateUser
}
class tblEL_GiaoVienLop {
   int GVLopID
   varchar(10) GiaoVienID
   int KhoiID
   varchar(50) LopID
   int MonHocID
   int MaDonVi
   bit Enable
   tinyint VaiTro
   int NienKhoa
   nvarchar(50) HocKy
   int ToGiangDayID
   varchar(254) GhiChu
   bit Is_PhanCong_QLDiem
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblEL_KyNang_MonHoc {
   int KyNang_MonHocID
   int MonHocID
   nvarchar(200) NhomKyNang
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblEL_KyNang_MonHoc_ChiTiet {
   int KyNang_MonHoc_ChiTietID
   int KyNang_MonHocID
   nvarchar(200) TenKyNang
   nvarchar(1000) MoTaKyNang
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblEL_Learning_Progress {
   bigint ProgressID
   int HocSinhID
   int LessonID
   int TimeSpentSeconds
   bit IsCompleted
   datetime CompletedDate
   datetime LastAccessed
   bit IsDeleted
}
class tblEL_Lessons {
   int LessonID
   nvarchar(255) Title
   nvarchar(max) Description
   int NienKhoa
   tinyint HocKi
   int EstimatedDuration
   nvarchar(1000) ThumbnailURL
   tinyint Status
   bit IsDev
   nvarchar(50) Tuan
   int TuanHocID
   nvarchar(2000) Chuong
   int KhoiID
   int MonHocID
   bit IsPublic
   bit IsCopy
   int CopyFromLessonID
   varchar(9) CopyFromUserID
   datetime CopyTime
   bit IsDeleted
   datetime CreateTime
   varchar(9) CreateUser
   datetime UpdateTime
   varchar(9) UpdateUser
}
class tblEL_Log_ChamBai {
   int Log_ChamBaiID
   int SubmissionID
   int AssignToClassID
   nvarchar(max) AssignmentConfig
   int SubmissionStatus
   nvarchar(max) SubmissionContent
   nvarchar(2000) Reason
   varchar(9) CreateUser
   datetime CreateTime
   varbinary(50) UpdateUser
   datetime UpdateTime
   int AssignToStudentID
}
class tblEL_Log_ChamBai_2025 {
   int Log_ChamBaiID
   int SubmissionID
   int AssignToClassID
   nvarchar(max) AssignmentConfig
   int SubmissionStatus
   nvarchar(max) SubmissionContent
   nvarchar(2000) Reason
   varchar(9) CreateUser
   datetime CreateTime
   varbinary(50) UpdateUser
   datetime UpdateTime
   int AssignToStudentID
}
class tblEL_Log_NopBai {
   int Log_SubmissionID
   int SubmissionID
   nvarchar(max) SubmissionContent
   datetime SubmissionTime
   varchar(9) CreateUser
   datetime CreateTime
   varbinary(50) UpdateUser
   datetime UpdateTime
}
class tblEL_Log_NopBai_2025 {
   int Log_SubmissionID
   int SubmissionID
   nvarchar(max) SubmissionContent
   datetime SubmissionTime
   varchar(9) CreateUser
   datetime CreateTime
   varbinary(50) UpdateUser
   datetime UpdateTime
}
class tblEL_QuestionBank_Group {
   int Id
   int KhoiID
   int MonHocID
   varchar(100) SourceId
   nvarchar(255) Title
   nvarchar(max) Description
   int OrdinalNumber
   nvarchar(max) MediaJson
   nvarchar(max) RawJson
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   bit IsDeleted
}
class tblEL_QuestionBank_Question {
   int Id
   int GroupId
   varchar(100) SourceId
   varchar(60) Type
   nvarchar(max) QuestionText
   int OrdinalNumber
   decimal Points
   varchar(50) GradingType
   bit IsAdvanced
   nvarchar(max) ConfigJson
   nvarchar(max) SkillsJson
   nvarchar(max) RawJson
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   bit IsDeleted
}
class tblEL_Resoucre_TeacherPermissions {
   int ResourcePermissionID
   int AssignToClassID
   bit IsGrade
   bit IsEdit
   datetime CreateTime
   varchar(9) CreateUser
   datetime UpdateTime
   varchar(9) UpdateUser
   varchar(9) GiaoVienID
   int MonHocID
   bit Enable
   int NienKhoa
}
class tblEL_Student_SubmitTokens {
   bigint SubmitTokenID
   int AssignToClassID
   int AssignToStudentID
   int HocSinhID
   varbinary(32) TokenHash
   datetime2 ExpireTime
   bit IsUsed
   datetime2 UsedTime
   datetime2 CreateTime
   varchar(9) CreateUser
}
class tblEL_Submissions {
   bigint SubmissionID
   int AssignToClassID
   int AssignToStudentID
   int HocSinhID
   nvarchar(max) SubmissionContent
   datetime SubmissionTime
   tinyint SubmissionStatus
   nvarchar(max) AssignmentConfig
   int LanNop
   decimal Score
   nvarchar(max) TeacherComment
   varchar(20) GradedByTeacherID
   datetime GradedDate
   bit IsOverDue
   int Log_ChamBaiID
   bit IsDeleted
   datetime CreateTime
   varchar(9) CreateUser
   datetime UpdateTime
   varchar(9) UpdateUser
   int DurationTime
   int AccessTime
}
class tblEL_Syllabus {
   int SyllabusID
   nvarchar(255) Title
   nvarchar(1000) Description
   int KhoiID
   int MonHocID
   int NienKhoa
   tinyint HocKi
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblEL_SyllabusMapping {
   int MappingID
   varchar(20) ResourceType
   int ResourceID
   int SyllabusID
   int NodeID
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblEL_SyllabusNode {
   int NodeID
   int SyllabusID
   int ParentID
   nvarchar(255) Title
   varchar(20) NodeType
   int SortOrder
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblEL_ThongBao {
   int ThongBaoID
   int SubmissionID
   int ResourceID
   varchar(200) ResourceType
   int ThongBao_TemplateID
   bit Is_DaXem
   bit IsDeleted
   varchar(9) NguoiXem
   datetime ThoiGianXem
   varchar(9) NguoiNhan
   datetime ThoiGianNhan
   varchar(9) NguoiGiao
   datetime ThoiGianGiao
}
class tblEL_ThongBao_Template {
   int ThongBao_TemplateID
   int ThongBao_TypeID
   nvarchar(max) TemplateContent
   nvarchar(1000) List_ParamContentID
   bit IsSendME
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblEL_ThongBao_Template_DinhNghia {
   int ParamContentID
   nvarchar(100) Param
   nvarchar(100) Header
}
class tblEL_ThongBao_Template_Type {
   int ThongBao_TypeID
   nvarchar(100) TypeTitle
   nvarchar(50) Icon
   varchar(10) Color
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblEL_User_Assign {
   varchar(9) SYS_USERID
   int SYS_SYSTEMRIGHT
   bit IsActive
}
class tblEL_YKienPhuHuynh {
   int YKienPhuHuynhID
   int ThongBaoID
   int SubmissionID
   int SoLanXem
   bit IsDeleted
   nvarchar(1000) NoiDungPhuHuynh
   varchar(9) PhuHuynhXacNhan
   datetime ThoiGianXacNhan
   varchar(9) PhuHuynhTruyCap
   datetime PhuHuynhTruyCapLanCuoi
}
class tblGiaoVien {
   varchar(10) GiaoVienID
   nvarchar(60) HoGV
   nvarchar(20) TenGV
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   bit Enable
}
class tblGiaoVien_Import_C1 {
   int LopID
   nvarchar(100) TenLop
   int MonHocID
   nvarchar(100) GiaoVienID
}
class tblGiaoVien_Import_C2 {
   int LopID
   nvarchar(100) TenLop
   nvarchar(100) MonHocID
   nvarchar(100) GVMHID
   nvarchar(100) GiaoVienID
}
class tblGiaoVien_Import_C3 {
   int LopID
   nvarchar(100) TenLop
   nvarchar(100) MonHocID
   nvarchar(100) GVMHID
   nvarchar(100) GiaoVienID
}
class tblGiaoVienDPDTiengAnh {
   varchar(9) GiaoVienID
   nvarchar(250) HoTenGiaoVien
   int HocKi
   decimal DiemPDP
   bit IsGVTiengAnh
}
class tblGiaoVienLop {
   int GVLopID
   varchar(10) GiaoVienID
   int KhoiID
   varchar(50) LopID
   int MonHocID
   int MaDonVi
   bit Enable
   tinyint VaiTro
   int NienKhoa
   nvarchar(50) HocKy
   int ToGiangDayID
   varchar(254) GhiChu
   bit Is_PhanCong_QLDiem
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblGiaoVienLopTiengAnh {
   varchar(9) LopNhomID
   varchar(9) TenLop
   varchar(9) GiaoVienID1
   nvarchar(250) HoTenGiaoVien1
   varchar(9) GiaoVienID2
   nvarchar(250) HoTenGiaoVien2
}
class tblHocLieu_FP {
   int HocLieuID
   nvarchar(255) TenHocLieu
   int BoSachID
   int MonHocID
   int KhoiID
   int HocKy
   nvarchar(1000) ThumbnailURL
   varchar(50) TinhTrang
   bit Is_Xoa
   datetime CreateTime
   varchar(50) CreateUser
   datetime UpdateTime
   varchar(50) UpdateUser
   varchar(50) Loai
}
class tblHocSinh {
   int HocSinhID
   nvarchar(60) Ho
   nvarchar(20) Ten
   nvarchar(100) EnglishName
   varchar(10) NgaySinh
   bit Nu
   tinyint TinhTrang
   nvarchar(50) TenTinhTrang
}
class tblHocSinhLop {
   int HSLopID
   int HocSinhID
   varchar(10) LopID
   varchar(10) SoDanhBo
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblHocSinhNhom {
   int HSNhomID
   int HocSinhID
   int LopID
   varchar(50) NhomID
   varchar(10) NhomID_HK1
   varchar(10) SoDanhBo
   int SoTT
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblHocSinhYKienThang {
   int HocSinh_NhanXetThangID
   int HSLopID
   int Lop_NhanXetThangID
   nvarchar(max) YKienPhuHuynh
   int LuotXem
   tinyint TrangThai
   bit Enable
   varchar(9) PHConfirm
   datetime PHConfirmTime
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblHocSinhYKienThang_ManHinh {
   int NhanXetThangManHinhID
   int HocSinhID
   int LopID
   nvarchar(50) TypeID
   int TypeScreen
   int LuotXem
   ntext(1073741823) YKienPhuHuynh
   tinyint TrangThai
   bit Enable
   varchar(9) PHConfirm
   datetime PHConfirmTime
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblKetQuaHocTap {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   tinyint TinhTrang
   bit Is_Edit
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
   int KhoaCotDiemID
}
class tblKetQuaHocTap_KeoDiem {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
}
class tblKetQuaHocTap_Old {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   tinyint TinhTrang
   bit Is_Reject
   nvarchar(500) ReasonReject
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
}
class tblKetQuaHocTap_Tam {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   int LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   tinyint TinhTrang
   bit Is_Reject
   nvarchar(500) ReasonReject
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblKetQuaHocTap2025_05_27_10_03_22 {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   tinyint TinhTrang
   bit Is_Edit
   int GVCN_LyDo_TuChoi_ID
   int TT_LyDo_TuChoi_ID
   int BGH_LyDo_TuChoi_ID
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
   varchar(9) GuiDiemUser
   datetime GuiDiemTime
   varchar(9) TuChoi_GuiDiemUser
   datetime TuChoi_GuiDiemTime
   varchar(9) GuiDiem_BGHUser
   datetime GuiDiem_BGHTime
   varchar(9) TuChoi_DuyetDiemUser
   datetime TuChoi_DuyetDiemTime
   varchar(9) DuyetDiemUser
   datetime DuyetDiemTime
   varchar(9) GVCN_GuiDiem_User
   datetime GVCN_GuiDiem_Time
   varchar(9) GVBM_GuiDiem_User
   datetime GVBM_GuiDiem_Time
   varchar(9) GVCN_TuChoiGuiDiem_User
   datetime GVCN_TuChoiGuiDiem_Time
}
class tblKetQuaHocTap2025_10_21_11_09_32 {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   tinyint TinhTrang
   bit Is_Edit
   int GVCN_LyDo_TuChoi_ID
   int TT_LyDo_TuChoi_ID
   int BGH_LyDo_TuChoi_ID
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
   varchar(9) GuiDiemUser
   datetime GuiDiemTime
   varchar(9) TuChoi_GuiDiemUser
   datetime TuChoi_GuiDiemTime
   varchar(9) GuiDiem_BGHUser
   datetime GuiDiem_BGHTime
   varchar(9) TuChoi_DuyetDiemUser
   datetime TuChoi_DuyetDiemTime
   varchar(9) DuyetDiemUser
   datetime DuyetDiemTime
   varchar(9) GVCN_GuiDiem_User
   datetime GVCN_GuiDiem_Time
   varchar(9) GVBM_GuiDiem_User
   datetime GVBM_GuiDiem_Time
   varchar(9) GVCN_TuChoiGuiDiem_User
   datetime GVCN_TuChoiGuiDiem_Time
}
class tblKetQuaHocTap2025_10_22_17_32_25 {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   tinyint TinhTrang
   bit Is_Edit
   int GVCN_LyDo_TuChoi_ID
   int TT_LyDo_TuChoi_ID
   int BGH_LyDo_TuChoi_ID
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
   varchar(9) GuiDiemUser
   datetime GuiDiemTime
   varchar(9) TuChoi_GuiDiemUser
   datetime TuChoi_GuiDiemTime
   varchar(9) GuiDiem_BGHUser
   datetime GuiDiem_BGHTime
   varchar(9) TuChoi_DuyetDiemUser
   datetime TuChoi_DuyetDiemTime
   varchar(9) DuyetDiemUser
   datetime DuyetDiemTime
   varchar(9) GVCN_GuiDiem_User
   datetime GVCN_GuiDiem_Time
   varchar(9) GVBM_GuiDiem_User
   datetime GVBM_GuiDiem_Time
   varchar(9) GVCN_TuChoiGuiDiem_User
   datetime GVCN_TuChoiGuiDiem_Time
}
class tblKetQuaHocTap2026_05_23_12_15_37 {
   int KQHTID
   int MonHocLopID
   int HocSinhID
   varchar(10) LopID
   int NienKhoa
   int CotDiemID
   nvarchar(1000) KetQuaDanhGia_VI
   nvarchar(1000) KetQuaDanhGia_EN
   int Lop_TinhTrangID
   tinyint TinhTrang
   bit Is_Edit
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   varchar(9) NhapDiemUser
   datetime NhapDiemTime
   int KhoaCotDiemID
}
class tblKhenThuong {
   int KhenThuongID
   int KhoiID
   int HSLopID
   bit HocSinhTieuBieu
   nvarchar(2000) NoiDungThuKhen
   nvarchar(400) ThanhTichKhac
   nvarchar(1000) DanhHieu
   int VaoSoKT
   nvarchar(50) SoQuyetDinhKT
   nvarchar(100) NgayKhenThuong_VI
   nvarchar(100) NgayKhenThuong_EN
   nvarchar(100) NgayKhenThuong_ThuKhen_VI
   nvarchar(100) NgayKhenThuong_ThuKhen_EN
   bit Is_DaIn
   int NienKhoa
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblKhenThuong_Old {
   int KhenThuongID
   int KhoiID
   int HSLopID
   bit HocSinhTieuBieu
   nvarchar(2000) NoiDungThuKhen
   nvarchar(400) ThanhTichKhac
   nvarchar(1000) DanhHieu
   int VaoSoKT
   nvarchar(50) SoQuyetDinhKT
   nvarchar(100) NgayKhenThuong_VI
   nvarchar(100) NgayKhenThuong_EN
   int NienKhoa
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblKhoaCotDiem {
   int KhoaCotDiemID
   varchar(50) LopID
   int MonHocLopID
   varchar(200) MaCotDiem
   bit Enable
   bit TinhTrang
   int Log_KhoaCotDiemID
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblKhoi {
   int KhoiID
   nvarchar(254) TenKhoiHoc
   varchar(10) KhoiHocCode
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   int CapID
}
class tblLMS_LessonElements {
   bigint ElementID
   int LessonID
   varchar(50) ElementType
   nvarchar(max) ElementData
   int SortOrder
   bit IsDeleted
   varchar(10) CreateUser
   datetime CreateTime
   varchar(10) UpdateUser
   datetime UpdateTime
}
class tblLMS_Lessons {
   int LessonID
   int ModuleID
   nvarchar(500) Title
   nvarchar(max) Description
   tinyint Status
   int SortOrder
   bit IsDeleted
   varchar(10) CreateUser
   datetime CreateTime
   varchar(10) UpdateUser
   datetime UpdateTime
}
class tblLMS_View_Schedule {
   int ViewID
   date NgayBatDau
   date NgayKetThuc
   date Date
   int ViewCount
   int TypeScreen
   bit IsDeleted
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblLop {
   varchar(10) LopID
   int MaDonVi
   varchar(20) TenLop
   int KhoiID
   int PhanBanID
   nvarchar(100) TenKhoiPhanBan
   int NienKhoa
   varchar(20) GVCN
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
   int CapID
   int LopIDQLD
}
class tblLop_TinhTrang {
   int Lop_TinhTrangID
   varchar(10) LopID
   int MonHocLopID
   varchar(100) MaNhomCotDiem
   int TinhTrang
   nvarchar(4000) NoiDungNhanXet
   bit Is_GVCN_DaDuyet
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblMonHoc {
   int MonHocID
   int Sort
   int CapID
   varchar(8) MonHocCode
   nvarchar(50) MonHocName
   tinyint MonHocGroup
   bit Enable
   tinyint TrangThai
   nvarchar(50) MaMonDuLieuNganh
   nvarchar(100) TenMonDuLieuNganh
   nvarchar(50) TenMonHoc_HienThi
   int ToGiangDayDayID
   tinyint SoTietHK1
   tinyint SoTietHocKy2
   tinyint SoTuanHK1
   tinyint SoTuanHK2
   nvarchar(10) Color
   varchar(50) Icon
   int Is_MonHoc_BoTro
   bit Is_MonHoc_NLPC
   nvarchar(50) List_MonHoc_NLPC_ID
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblMonHoc_PhanBan {
   int KhoiID
   int KhoiPhanBanID
   nvarchar(200) MoTa
   varchar(10) MonHocID
   int NamHoc
   int HocKy
   int KiemTraThuongXuyen
   int KiemTraDinhKy
   int KiemTraCuoiKy
   int HeSo
}
class tblMonHocLop {
   int MonHocLopID
   int MonHocID
   varchar(50) LopNhomID
   bit ChiaTheoLop
   int NienKhoa
   varchar(20) GVGiangDay1
   varchar(20) GVGiangDay2
   int TemplateBangDiemID
   int TemplateReportHTML
   int TemplateReportPDF
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblNhanXetThang {
   int NhanXetThangID
   int Lop_NhanXetThangID
   int HSLopID
   int HocSinhID
   nvarchar(max) NoiDungKienThuc_HTML
   nvarchar(max) NoiDungNangLuc_HTML
   nvarchar(max) NoiDungHoatDongKhac_HTML
   nvarchar(max) NoiDungToan_HTML
   nvarchar(max) NoiDungTiengViet_HTML
   nvarchar(max) NoiDungMonHocKhac_HTML
   nvarchar(max) NhanXetCuoiNam_HTML
   float DiemToan
   int SoSao_Toan
   nvarchar(max) NhanXetToan_HTML
   float DiemTiengViet
   int SoSao_TiengViet
   nvarchar(max) NhanXetTiengViet_HTML
   nvarchar(max) NhanXetMonHocKhac_HTML
   nvarchar(max) HoatDongGiaoDucKhac_HTML
   nvarchar(max) PhamChatNangLuc_HTML
   nvarchar(max) UuDiem
   nvarchar(max) NhuocDiem
   nvarchar(max) DeXuat
   nvarchar(500) NhanXetGVCN
   bit Is_Viewed
   bit Is_Reject
   nvarchar(2000) ReasonReject
   nvarchar(2000) Parent_Comment
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   varchar(9) ParentConfirmUser
   datetime ParentConfirmTime
   nvarchar(50) PhoiHopCMHS
   nvarchar(4000) NhanXetGVCN_VePhuHuynh_HTML
   nvarchar(4000) NhanXetGVCN_VeHocSinh_HTML
   nvarchar(50) PhanLoai_TuyenThang
   nvarchar(50) Flyers
   float DiemTA
   bit DKHocTiep
   nvarchar(500) DeXuat_NDCamKet
   nvarchar(1000) NhanXet_ChuanBiNienKhoaSau
}
class tblNhanXetThang_Lop {
   int Lop_NhanXetThangID
   int LopID
   nvarchar(50) HocKy
   int Thang
   int Nam
   nvarchar(20) Text_Thang_VI
   nvarchar(20) Text_Thang_EN
   int NienKhoa
   varchar(100) IconUrl
   tinyint TinhTrang
   bit Is_HienThiPhuHuynh
   nvarchar(400) ReasonReject
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   bit Is_Showing
}
class tblNhom {
   varchar(50) NhomID
   int MaDonVi
   varchar(20) TenNhom
   int KhoiID
   int NienKhoa
   varchar(20) GVCN
   int CapID
   int MonHocID
   bit IsNhomLMS_GiaoBai
   varchar(50) ListNhomID_Child
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblNhomDiem_MonHocLop {
   int NhomDiem_MonHocLopID
   int MonHocLopID
   varchar(100) MaNhomCotDiem
   nvarchar(200) TenNhomCotDiem_VI
   nvarchar(200) TenNhomCotDiem_EN
   int ThuTuNhom
   int NienKhoa
   varchar(50) Semester
   tinyint TinhTrang
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblNhomDiemCotDiem {
   int NhomCotDiemID
   int CotDiemID
   int NhomDiemID
}
class tblNienKhoa {
   int NienKhoaID
   int NienKhoa
   tinyint HocKi
   bit IsActive
}
class tblNoiDungHocLieu_FP {
   int NoiDungID
   int HocLieuID
   int ParentID
   nvarchar(500) TenNoiDung
   varchar(50) LoaiNoiDung
   int ThuTu
   nvarchar(max) DataJson
   bit Is_Xoa
   datetime CreateTime
   varchar(50) CreateUser
   datetime UpdateTime
   varchar(50) UpdateUser
}
class tblNXT_aChien {
   int HocSinhID
   nvarchar(max) HoTen
   nvarchar(max) Lop
   nvarchar(max) NgaySinh
   nvarchar(max) UuDiem
   nvarchar(max) NhuocDiem
   nvarchar(max) DeXuat
}
class tblPhanCongQL_Diem {
   int NamHoc
   int HocKy
   nvarchar(50) LopID
   int MonHocID
   nvarchar(50) MonHocCode
   nvarchar(50) GiaoVienID
   int CapID
}
class tblPhucKhao {
   int PhucKhaoID
   int MonHocLopID
   int HocSinhID
   int CotDiemID
   nvarchar(2000) KetQuaBanDau
   nvarchar(2000) PhucKhao_Lan1
   nvarchar(2000) PhucKhao_Lan2
   nvarchar(2000) PhucKhao_Lan3
   nvarchar(2000) PhucKhao_Lan4
   nvarchar(2000) PhucKhao_Lan5
   nvarchar(2000) LyDoPhucKhao_Lan1
   nvarchar(2000) LyDoPhucKhao_Lan2
   nvarchar(2000) LyDoPhucKhao_Lan3
   nvarchar(2000) LyDoPhucKhao_Lan4
   nvarchar(2000) LyDoPhucKhao_Lan5
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblSoGVCN {
   int SoGVCNID
   int NienKhoa
   varchar(10) LopID
   int CapID
   varchar(10) GiaoVienID
   varchar(20) TrangThai
   nvarchar(max) ThongTinLop
   nvarchar(max) ChiTieu
   nvarchar(max) SiSo
   nvarchar(max) GiaoVienBoMon
   nvarchar(max) BanDaiDienCMHS
   nvarchar(max) CanBoLop
   nvarchar(max) HuongNghiep
   bit Enable
   datetime SubmitTime
   varchar(20) SubmitUser
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCN_Bak_20260718 {
   int SoGVCNID
   int NienKhoa
   int LopID
   int CapID
   varchar(20) GiaoVienID
   varchar(20) TrangThai
   nvarchar(max) ThongTinLop
   nvarchar(max) ChiTieu
   nvarchar(max) SiSo
   nvarchar(max) GiaoVienBoMon
   nvarchar(max) BanDaiDienCMHS
   nvarchar(max) CanBoLop
   nvarchar(max) HuongNghiep
   bit Enable
   datetime SubmitTime
   varchar(20) SubmitUser
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCNBanDaiDienCMHS {
   int BanDaiDienCMHSID
   int SoGVCNID
   int STT
   int HSLopID
   int HocSinhID
   varchar(30) MaHocSinh
   nvarchar(200) HocSinh
   nvarchar(max) ChaMe
   nvarchar(max) NgheNghiep
   nvarchar(200) DienThoai
   nvarchar(200) NhiemVu
   int RowIndex
   bit Enable
   int CreateUser
   datetime CreateTime
   int UpdateUser
   datetime UpdateTime
   int NhiemVuDanhMucID
}
class tblSoGVCNCanBoLop {
   int CanBoLopID
   int SoGVCNID
   int STT
   int HSLopID
   int HocSinhID
   varchar(30) MaHocSinh
   nvarchar(200) HocSinh
   nvarchar(200) ChucVu
   nvarchar(max) GhiChu
   int RowIndex
   bit Enable
   int CreateUser
   datetime CreateTime
   int UpdateUser
   datetime UpdateTime
   int ChucVuDanhMucID
}
class tblSoGVCNChiTieu {
   int ChiTieuID
   int SoGVCNID
   varchar(30) LoaiChiTieu
   nvarchar(200) MatGiaoDuc
   nvarchar(max) YeuCau
   int Tot
   int Kha
   int Dat
   int ChuaDat
   nvarchar(max) BienPhap
   int HSXS
   int HSG
   nvarchar(max) NoiDung
   nvarchar(max) GhiChu
   int RowIndex
   bit Enable
   int CreateUser
   datetime CreateTime
   int UpdateUser
   datetime UpdateTime
}
class tblSoGVCNDanhMuc {
   int DanhMucID
   varchar(30) Loai
   varchar(30) Ma
   nvarchar(200) Ten
   int ThuTu
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCNGiaoVienBoMon {
   int GiaoVienBoMonID
   int SoGVCNID
   nvarchar(200) BoMon
   int HocKy
   varchar(10) GiaoVienID
   nvarchar(300) GiaoVien
   nvarchar(max) ThayDoi
   int RowIndex
   bit Enable
   int CreateUser
   datetime CreateTime
   int UpdateUser
   datetime UpdateTime
   int MonHocID
}
class tblSoGVCNHuongNghiep {
   int HuongNghiepID
   int SoGVCNID
   int STT
   int HSLopID
   int HocSinhID
   varchar(30) MaHocSinh
   nvarchar(200) HoTen
   nvarchar(500) MonThiTN
   nvarchar(max) KQTracNghiem
   int RowIndex
   bit Enable
   int CreateUser
   datetime CreateTime
   int UpdateUser
   datetime UpdateTime
   int MonThiTNDanhMucID
}
class tblSoGVCNKeHoachThang {
   int KeHoachThangID
   int SoGVCNID
   int Thang
   nvarchar(500) ChuDe
   nvarchar(max) MucTieu
   nvarchar(max) NhiemVu
   nvarchar(max) KeHoachTuan
   nvarchar(max) DanhGia
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCNKeHoachThang_Bak_20260718 {
   int KeHoachThangID
   int SoGVCNID
   int Thang
   nvarchar(500) ChuDe
   nvarchar(max) MucTieu
   nvarchar(max) NhiemVu
   nvarchar(max) KeHoachTuan
   nvarchar(max) DanhGia
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCNNhanXetSoLienLac {
   int NhanXetSoLienLacID
   int SoGVCNID
   int HSLopID
   int Thang
   nvarchar(max) NhanXet
   nvarchar(max) DeNghiPHHS
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCNNhanXetSoLienLac_Bak_20260718 {
   int NhanXetSoLienLacID
   int SoGVCNID
   int HocSinhID
   int Thang
   nvarchar(max) NhanXet
   nvarchar(max) DeNghiPHHS
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCNSiSo {
   int SiSoID
   int SoGVCNID
   nvarchar(50) Moc
   int SiSo
   int Nam
   int ChuyenDi
   int ChuyenDen
   bit Enable
   int CreateUser
   datetime CreateTime
   int UpdateUser
   datetime UpdateTime
   int MocDanhMucID
}
class tblSoGVCNTheoDoiRenLuyen {
   int TheoDoiRenLuyenID
   int SoGVCNID
   int HSLopID
   int Thang
   nvarchar(max) NoiDung
   nvarchar(max) BienPhap
   nvarchar(max) KetQua
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSoGVCNTheoDoiRenLuyen_Bak_20260718 {
   int TheoDoiRenLuyenID
   int SoGVCNID
   int HocSinhID
   int Thang
   nvarchar(max) NoiDung
   nvarchar(max) BienPhap
   nvarchar(max) KetQua
   bit Enable
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblSystemConfig {
   varchar(100) ConfigKey
   nvarchar(500) ConfigValue
   nvarchar(500) Description
   bit IsEncrypted
   datetime UpdateTime
}
class tblTemplateDataJson_FP {
   int TemplateID
   varchar(50) LoaiNoiDung
   nvarchar(255) TenTemplate
   nvarchar(max) TemplateJson
   nvarchar(500) MoTa
   bit Is_Active
   bit Is_Xoa
   datetime CreateTime
   varchar(50) CreateUser
   datetime UpdateTime
   varchar(50) UpdateUser
}
class tblThietLap_KiNang {
   int ThietLapID
   int NienKhoa
   nvarchar(50) HocKi
   nvarchar(1000) List_NhomID
   nvarchar(50) LoaiDiem
   nvarchar(50) TenKiNang
   nvarchar(200) MaCotDiem
   int SoCau
   bit Enable
   varchar(50) CreateUser
   datetime CreateTime
   varchar(50) UpdateUser
   datetime UpdateTime
}
class tblThietLap_KiNang_IELTS {
   int ThietLapID
   nvarchar(200) TenKiNang
   int MinCorrectAns
   int MaxCorrectAns
   float BandScore
}
class tblToGiangDay {
   int ToGiangDayID
   nvarchar(254) ToDayName
   int ToDayGroup
   int NienKhoa
   int HocKy
   nvarchar(500) GhiChu
   bit Enable
   int CapID
   varchar(20) CreateUser
   datetime CreateTime
   varchar(20) UpdateUser
   datetime UpdateTime
}
class tblToGiangDay_GiaoVien_MonHoc {
   int ID
   int ToGiangDayID
   varchar(10) GiaoVienID
   int MonHocID
   int NienKhoa
   bit Enable
   nvarchar(255) GhiChu
}
class tblTong_Hop_Du_Lieu_Cuoc_Thi {
   int TongHopDuLieuCuocThiID
   int NienKhoa
   int HocSinhID
   varchar(50) LopID
   nvarchar(50) ThoiGianThi
   nvarchar(50) HocKi
   nvarchar(100) TenCuocThi
   nvarchar(50) LinhVucDuAn
   nvarchar(200) MoTaNganGonNoiDung_MucTieu
   nvarchar(50) GVHuongDan
   nvarchar(50) To_BoPhan
   nvarchar(50) GV_ToHoTro
   nvarchar(50) ToChucCongNhan
   nvarchar(50) CapDoGiaiThuong
   nvarchar(50) GiaiThuongDatDuoc
   nvarchar(50) MinhChung_SoHieuQD_LinkChungNhan
   nvarchar(50) GhiChuBoSung
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblTuanHocTap {
   int TuanHocID
   int NienKhoa
   int Nam
   int ThangHoc
   int Tuan
   date NgayBatDau
   date NgayKetThuc
   int TuanTrongNam
   bit Is_NoiTru
   varchar(100) Khoi_List_NoiTruID
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblTuChoi {
   int LyDo_TuChoiID
   int TinhTrang
   int HocSinhID
   int MonHocLopID
   int LopID
   nvarchar(50) MaNhomCotDiem
   nvarchar(2000) LyDoTuChoi
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
   bit Enable
}
class tblTuChoi_NhanXetThang {
   int LyDo_TuChoiID
   int Lop_NhanXetThangID
   nvarchar(4000) LyDoTuChoi
   bit Enable
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}
class tblXetKetQuaHocBong {
   int HocSinhID
   int LopID
   varchar(9) TenLop
   nvarchar(50) HocBong_Truoc
   nvarchar(50) HocBong_Sau
   int NienKhoa
   varchar(9) CreateUser
   smalldatetime CreateTime
   varchar(9) UpdateUser
   smalldatetime UpdateTime
}
class tblXetKetQuaRenLuyen {
   int HocSinhID
   int HocKi
   int LopID
   varchar(9) TenLop
   nvarchar(50) KQRL_Truoc
   nvarchar(50) KQRL_Sau
   int NienKhoa
   bit IsChotDiem
   varchar(9) CreateUser
   datetime CreateTime
   varchar(9) UpdateUser
   datetime UpdateTime
}

tblNoiDungHocLieu_FP --|> tblHocLieu_FP : HocLieuID
tblSoGVCNKeHoachThang_Bak_20260718 --|> tblSoGVCN_Bak_20260718 : SoGVCNID
tblSoGVCNTheoDoiRenLuyen_Bak_20260718 --|> tblSoGVCN_Bak_20260718 : SoGVCNID
tblSoGVCNNhanXetSoLienLac_Bak_20260718 --|> tblSoGVCN_Bak_20260718 : SoGVCNID
tblToGiangDay_GiaoVien_MonHoc --|> tblToGiangDay : ToGiangDayID
tbl_ChiTieu --|> tbl_MucDo : MucDo_ID
tblEL_Learning_Progress --|> tblEL_Lessons : LessonID
tblEL_Elements --|> tblEL_Lessons : LessonID
tblSoGVCN --|> tblGiaoVien : GiaoVienID
tblToGiangDay_GiaoVien_MonHoc --|> tblGiaoVien : GiaoVienID
tblGiaoVienLop --|> tblGiaoVien : GiaoVienID
tblSoGVCNGiaoVienBoMon --|> tblGiaoVien : GiaoVienID
tblSoGVCNKeHoachThang --|> tblSoGVCN : SoGVCNID
tblSoGVCNTheoDoiRenLuyen --|> tblSoGVCN : SoGVCNID
tblSoGVCNNhanXetSoLienLac --|> tblSoGVCN : SoGVCNID
tblSoGVCNSiSo --|> tblSoGVCN : SoGVCNID
tblSoGVCNGiaoVienBoMon --|> tblSoGVCN : SoGVCNID
tblSoGVCNBanDaiDienCMHS --|> tblSoGVCN : SoGVCNID
tblSoGVCNCanBoLop --|> tblSoGVCN : SoGVCNID
tblSoGVCNHuongNghiep --|> tblSoGVCN : SoGVCNID
tblSoGVCNChiTieu --|> tblSoGVCN : SoGVCNID
tblSoGVCNHuongNghiep --|> tblHocSinhLop : HSLopID
tblSoGVCNTheoDoiRenLuyen --|> tblHocSinhLop : HSLopID
tblSoGVCNNhanXetSoLienLac --|> tblHocSinhLop : HSLopID
tblSoGVCNBanDaiDienCMHS --|> tblHocSinhLop : HSLopID
tblSoGVCNCanBoLop --|> tblHocSinhLop : HSLopID
tblSoGVCNBanDaiDienCMHS --|> tblHocSinh : HocSinhID
tblSoGVCNCanBoLop --|> tblHocSinh : HocSinhID
tblSoGVCNHuongNghiep --|> tblHocSinh : HocSinhID
tblSoGVCN --|> tblLop : LopID
tblLMS_LessonElements --|> tblLMS_Lessons : LessonID
tblToGiangDay_GiaoVien_MonHoc --|> tblMonHoc : MonHocID
tblSoGVCNGiaoVienBoMon --|> tblMonHoc : MonHocID
tblEL_QuestionBank_Question --|> tblEL_QuestionBank_Group : GroupId
tblHocLieu_FP --|> tblBoSach_FP : BoSachID
tblSoGVCNSiSo --|> tblSoGVCNDanhMuc : MocDanhMucID
tblSoGVCNCanBoLop --|> tblSoGVCNDanhMuc : ChucVuDanhMucID
tblSoGVCNBanDaiDienCMHS --|> tblSoGVCNDanhMuc : NhiemVuDanhMucID
tblSoGVCNHuongNghiep --|> tblSoGVCNDanhMuc : MonThiTNDanhMucID
tblNoiDungHocLieu_FP --|> tblNoiDungHocLieu_FP : ParentID
```
