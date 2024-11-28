const hocSinhService = {
    GetByHocSinhID: async (params) => apiUtilLMS.postSingle('HocSinh_Detail_GetBy_HocSinhID', params),
    // "HocSinhID": "AnsiString",
    // "LopID": "Int32",
    // "Semester": "AnsiString"
    KQHT: async (params) => apiUtilLMS.post('HocSinh_KQHT', params)
}