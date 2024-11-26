
const URL = 'TemplateBangDiem_'
const URL_GET = URL + EnumMethod.GET
const URL_INS = URL + EnumMethod.INSERT
const URL_UDP = URL + EnumMethod.UPDATE
const URL_DEL = URL + EnumMethod.DELETE

const URL_CT = 'TemplateBangDiemChiTiet_'
const URL_CT_GET = URL_CT + EnumMethod.GET
const URL_CT_INS = URL_CT + EnumMethod.INSERT
const URL_CT_UDP = URL_CT + EnumMethod.UPDATE
const URL_CT_DEL = URL_CT + EnumMethod.DELETE
const URL_CT_GET_BY_ID = URL_CT + 'Get_ById'
const URL_CT_COPY = URL_CT + 'Copy'

const TemplateBangDiem_Service = {
    //TemplateBangDiemID (0: Lấy tất cả)
    Get: (params) => apiUtilLMS.post(URL_GET, params),
    Ins: (params) => apiUtilLMS.post(URL_INS, params),
    Udp: (params) => apiUtilLMS.post(URL_UDP, params),
    Del: (params) => apiUtilLMS.post(URL_DEL, params),
}

const TemplateBangDiemChiTiet_Service = {
    Del: (params) => apiUtilLMS.post(URL_CT_DEL, params),
    Get_ById: (params) => apiUtilLMS.post(URL_CT_GET_BY_ID, params),
    Upd: (params) => apiUtilLMS.post(URL_CT_UDP, params),
    Ins: (params) => apiUtilLMS.post(URL_CT_INS, params),
    Copy: (params) => apiUtilLMS.post(URL_CT_COPY, params),
}
