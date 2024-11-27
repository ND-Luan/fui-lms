const NhapDiem_Service = {
  NhomCauTrucDiemGetByTemplateBangDiemID: (params) => apiUtilLMS.post('NhomCauTrucDiem_Get_ByTemplateBangDiemID', params),
  HocSinhBangDiemGetByMonHocIDMaNhom: (params) => apiUtilLMS.post('HocSinhBangDiem_Get_ByMonHocID_MaNhom', params),
  KQHTMonHocLopIns: (params) => apiUtilLMS.post('KQHT_MonHocLop_Ins', params),
  /**   Params  KQHT_MonHocLop_TinhTrang_Udp
   * @NienKhoa
    @MonHocLopID INT,
    @LopID INT,
    @TinhTrang INT,  *Note: 1: Gửi tổ trưởng, 2: Duyệt điểm, 3: Từ chối điểm, 4: Công bố phụ huynh
    @MaNhomCotDiem NVARCH
  **/
  KQHT_MonHocLop_TinhTrang_Udp: (params) => apiUtilLMS.post('KQHT_MonHocLop_TinhTrang_Udp', params),
}