
const lopService = {
    GetByKhoiID: (params) => apiUtilLMS.post('Lop_Get_ByKhoiID', params),
    GetByNienKhoa: (params) => apiUtilLMS.post('Lop_Get_ByNienKhoa', params),
}

const hocSinhLopService = {
    Get: (params) => apiUtilLMS.post('HocSinhLop_Get', params),
    Get_ByLopID: (params) => apiUtilLMS.post('HocSinhLop_Get_ByLopID', params),
}

const monHocService = {
    Get: (params) => apiUtilLMS.post('MonHoc_Get', params),
    GetByLopID: (params) => apiUtilLMS.post('MonHoc_Get_ByLopID', params),
    GetByCapID: (params) => apiUtilLMS.post('MonHoc_Get_ByCapID', params),
    KQHT_MonHocLop_Ins: (params) => apiUtilLMS.post('KQHT_MonHocLop_Ins', params),
}

const IOService = {
    IO_IN_HocSinh_Ins: (params) => apiUtilLMS.post('IO_IN_HocSinh_Ins', params),
    IO_IN_HocSinhLop_Ins: (params) => apiUtilLMS.post('IO_IN_HocSinhLop_Ins', params),
}
