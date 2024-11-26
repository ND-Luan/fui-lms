const NhapDiem_Service = {
    NhomCauTrucDiemGetByTemplateBangDiemID: (params) => apiUtilLMS.post('NhomCauTrucDiem_Get_ByTemplateBangDiemID', params),
    HocSinhBangDiemGetByMonHocIDMaNhom: (params) => apiUtilLMS.post('HocSinhBangDiem_Get_ByMonHocID_MaNhom', params),
}