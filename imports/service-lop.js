
const lopService = {
    GetByKhoiID: (params) => apiUtilLMS.post('Lop_Get_ByKhoiID', params),
    GetByNienKhoa: (params) => apiUtilLMS.post('Lop_Get_ByNienKhoa', params),
}

const hocSinhLopService = {
    Get: (params) => apiUtilLMS.post('HocSinhLop_Get', params),
    GetByLopID: (params) => apiUtilLMS.post('HocSinhLop_Get_ByLopID', params),
    HocSinh_Detail_GetBy_HocSinhID: (params) => apiUtilLMS.postSingle('HocSinh_Detail_GetBy_HocSinhID', params),
    Calen_GetInfoStudentByPhuHuynhID: (params) => apiUtilStudent.post('Calen_GetInfoStudentByPhuHuynhID', params),
}

const monHocService = {
    Get: (params) => apiUtilLMS.post('MonHoc_Get', params),
    GetByLopID: (params) => apiUtilLMS.post('MonHoc_Get_ByLopID', params),
    GetByCapID: (params) => apiUtilLMS.post('MonHoc_Get_ByCapID', params),
}

const IOService = {
    IO_IN_HocSinh_Ins: (params) => apiUtilLMS.post('IO_IN_HocSinh_Ins', params),
    IO_IN_HocSinhLop_Ins: (params) => apiUtilLMS.post('IO_IN_HocSinhLop_Ins', params),
}
