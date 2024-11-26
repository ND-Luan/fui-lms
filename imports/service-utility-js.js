let response = {
    IsSuccess: false,
    Message: null,
    Result: null
}
const EnumMethod = {
    GET: 'Get',
    DELETE: 'Del',
    UPDATE: 'Udp',
    INSERT: 'Ins'
}
const SUB_DOMAIN = {
    STUDENT: 'student/',
    LMS: 'lms/'
}

const AJAX = (url, params = null) => {
    return new Promise((resolve) => {
        vueData.v_Loading = true
        $.ajax({
            type: 'POST',
            headers: {
                authorization: $awt,
            },
            url: vueData.v_Set.apiDomain + url,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify(params),
            success: function (d) {
                console.log(d, 1)
                response = {
                    IsSuccess: true,
                    Message: null,
                    Result: d.data
                }
                resolve(response)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                Toast.error({
                    title: 'Thông báo',
                    text: xhr?.responseJSON?.Message,
                })
                response = {
                    IsSuccess: false,
                    Message: xhr.responseJSON?.Message,
                    Result: null
                }
                resolve(response)
            },
            complete: function (data) {
                vueData.v_Loading = false
            },
        })

    })
}
const AJAX_SINGLE = (url, params = null) => {
    return new Promise((resolve) => {
        vueData.v_Loading = true
        $.ajax({
            type: 'POST',
            headers: {
                authorization: $awt,
            },
            url: vueData.v_Set.apiDomain + url,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            crossDomain: true,
            data: JSON.stringify(params),
            success: function (d) {
                console.log(d, 1)
                response = {
                    IsSuccess: true,
                    Message: null,
                    Result: d.data
                }
                resolve(response)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                Toast.error({
                    title: 'Thông báo',
                    text: xhr?.responseJSON?.Message,
                })
                response = {
                    IsSuccess: false,
                    Message: xhr.responseJSON?.Message,
                    Result: null
                }
                resolve(response)
            },
            complete: function (data) {
                vueData.v_Loading = false
            },
        })

    })
}

const apiUtilLMS = {
    post: (url, params = null) => {
        return AJAX(SUB_DOMAIN.LMS + url, params)
    },
    postSingle: () => {
        return AJAX_SINGLE(SUB_DOMAIN.LMS + url, params)
    },
}
const apiUtilStudent = {
    post: () => {
        return AJAX(SUB_DOMAIN.STUDENT + url, params)
    },
    postSingle: () => {
        return AJAX_SINGLE(SUB_DOMAIN.STUDENT + url, params)
    }
}

const apiUtil = {
    TemplateBangDiem: (METHOD, params = null) => {
        return AJAX('lms/TemplateBangDiem_' + METHOD, params)
    },
    TemplateBangDiemChiTiet: (METHOD, params = null) => {
        return AJAX('lms/TemplateBangDiemChiTiet_' + METHOD, params)
    },
    NhapDiem: (url, params = null) => {
        return AJAX('lms/' + url, params)
    },
    ChuKy: (url, params = null) => {
        return new Promise((resolve, reject) => {
            vueData.v_Loading = true
            $.ajax({
                type: 'POST',
                headers: {
                    authorization: $awt,
                },
                url: vueData.v_Set.apiDomain + 'lms/' + url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                crossDomain: true,
                data: JSON.stringify(params),
                success: function (d) {
                    resolve(d)
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    Toast.error({
                        title: 'Thông báo',
                        text: xhr?.responseJSON?.Message,
                    })
                    reject(xhr)
                },
                complete: function (data) {
                    vueData.v_Loading = false
                },
            })
        })
    },
    HocSinh: (url, params = null) => {
        return new Promise((resolve, reject) => {
            vueData.v_Loading = true
            $.ajax({
                type: 'POST',
                headers: {
                    authorization: $awt,
                },
                url: vueData.v_Set.apiDomain + 'lms/' + url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                crossDomain: true,
                data: JSON.stringify(params),
                success: function (d) {
                    resolve(d)
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    Toast.error({
                        title: 'Thông báo',
                        text: xhr?.responseJSON?.Message,
                    })
                    reject(xhr)
                },
                complete: function (data) {
                    vueData.v_Loading = false
                },
            })
        })
    },
    GiaoVien: (url, params = null) => {
        return new Promise((resolve, reject) => {
            vueData.v_Loading = true
            $.ajax({
                type: 'POST',
                headers: {
                    authorization: $awt,
                },
                url: vueData.v_Set.apiDomain + 'lms/' + url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                crossDomain: true,
                data: JSON.stringify(params),
                success: function (d) {
                    resolve(d)
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    Toast.error({
                        title: 'Thông báo',
                        text: xhr?.responseJSON?.Message,
                    })
                    reject(xhr)
                },
                complete: function (data) {
                    vueData.v_Loading = false
                },
            })
        })
    },
    // Edubot: (url, params = null) => {
    //     return new Promise((resolve, reject) => {
    //         vueData.v_Loading = true
    //         $.ajax({
    //             type: 'POST',
    //             headers: {
    //                 authorization: $awt,
    //             },
    //             url: vueData.v_Set.apiDomain + 'lms/' + url,
    //             contentType: 'application/json; charset=utf-8',
    //             dataType: 'json',
    //             crossDomain: true,
    //             data: JSON.stringify(params),
    //             success: function (d) {
    //                 resolve(d)
    //             },
    //             error: function (xhr, ajaxOptions, thrownError) {
    //                 Toast.error({
    //                     title: 'Thông báo',
    //                     text: xhr?.responseJSON?.Message,
    //                 })
    //                 reject(xhr)
    //             },
    //             complete: function (data) {
    //                 vueData.v_Loading = false
    //             },
    //         })
    //     })
    // },
    lhbs: (url, params = null) => {
        return new Promise((resolve, reject) => {
            vueData.v_Loading = true
            $.ajax({
                type: 'POST',
                headers: {
                    authorization: $awt,
                },
                url: vueData.v_Set.apiDomain + 'student/' + url,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                crossDomain: true,
                data: JSON.stringify(params),
                success: function (d) {
                    resolve(d)
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $.dialog({
                        icon: 'fas fa-exclamation',
                        title: 'Error',
                        content: xhr.responseJSON ? xhr.responseJSON.Message : xhr.responseText ? xhr.responseText : '',
                        type: 'red',
                        columnClass: 'col-xs-6 col-xs-offset-6 col-sm-8 col-sm-offset-8 col-md-5 col-md-offset-8',
                        closeIcon: true,
                        buttons: {
                            ok: {
                                text: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Close&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                                btnClass: 'btn-blue',
                            },
                        },
                    })
                    reject(xhr)
                },
                complete: function (data) {
                    vueData.v_Loading = false
                },
            })
        })
    },
}

//Xem params https://tapi.lhbs.vn/help/lms/

// //Page cấu hình mẫu bảng điểm
// const TemplateBangDiem_Service = {
//     //TemplateBangDiemID (0: Lấy tất cả)
//     Get: (params) => apiUtil.TemplateBangDiem(EnumMethod.GET, params),
//     //"TemplateBangDiemName": "String"
//     Ins: async (params) => apiUtil.TemplateBangDiem(EnumMethod.INSERT, params),
//     // "TemplateBangDiemID": "Int32",
//     // "TemplateBangDiemName": "String"
//     Upd: async (params) => apiUtil.TemplateBangDiem(EnumMethod.UPDATE, params),
//     // "TemplateBangDiemID": "Int32",
//     Del: async (params) => apiUtil.TemplateBangDiem(EnumMethod.DELETE, params)
// }

// const TemplateBangDiemChiTiet_Service = {
//     Del: async (params) => {
//         //   "CotDiemID": "Int32",
//         //   "TemplateBangDiemID": "Int32"
//         const res = await apiUtil.TemplateBangDiemChiTiet('Del', params)
//         if (res?.data) {
//             return true
//         } else {
//             return false
//         }
//     },
//     Get_ById: async (params) => {
//         //TemplateBangDiemID : Int32
//         const res = await apiUtil.TemplateBangDiemChiTiet('Get_ById', params)
//         if (res?.data) {
//             return res.data
//         } else {
//             return []
//         }
//     },
//     Upd: async (params) => {
//         //         "CotDiemID": "Int32",
//         //   "TemplateBangDiemID": "Int32",
//         //   "IDHeThong": "String",
//         //   "MaCotDiem": "String",
//         //   "TenCotDiem_VI": "String",
//         //   "TenCotDiem_EN": "String",
//         //   "TenHienThi_VI": "String",
//         //   "TenHienThi_EN": "String",
//         //   "MotaCotDiem_VI": "String",
//         //   "MotaCotDiem_EN": "String",
//         //   "LoaiCotDiem": "String",
//         //   "KieuDanhGiaID": "Byte",
//         //   "GiaTriCotDiem": "AnsiString",
//         //   "LamTronBaoNhieuSo": "Byte",
//         //   "Formula": "String",
//         //   "ThuTuCotDiem": "Byte",
//         //   "MaNhomCotDiem": "String",
//         //   "TenNhomCotDiem_VI": "String",
//         //   "TenNhomCotDiem_EN": "String",
//         //   "ThuTuNhom": "Byte",
//         //   "IsUserInput": "Boolean",
//         //   "IsVisibleToParents": "Boolean",
//         //   "IsSendToManager": "Boolean"
//         const res = await apiUtil.TemplateBangDiemChiTiet('Upd', params)
//         if (res?.data) {
//             return true
//         } else {
//             return false
//         }
//     },
//     Ins: async (params) => {
//         //   "TemplateBangDiemID": "Int32",
//         // JsonData: {
//         //     IDHeThong NVARCHAR(50),
//         //     MaCotDiem NVARCHAR(50),
//         //     TenCotDiem_VI NVARCHAR(200),
//         //     TenCotDiem_EN NVARCHAR(200),
//         //     TenHienThi_VI NVARCHAR(200),
//         //     TenHienThi_EN NVARCHAR(200),
//         //     MotaCotDiem_VI NVARCHAR(200),
//         //     MotaCotDiem_EN NVARCHAR(200),
//         //     LoaiCotDiem NVARCHAR(50),
//         //     KieuDanhGiaID TINYINT,
//         //     GiaTriCotDiem VARCHAR(50),
//         //     LamTronBaoNhieuSo TINYINT,
//         //     Formula NVARCHAR(255),
//         //     ThuTuCotDiem TINYINT,
//         //     MaNhomCotDiem NVARCHAR(50),
//         //     TenNhomCotDiem_VI NVARCHAR(500),
//         //     TenNhomCotDiem_EN NVARCHAR(500),
//         //     ThuTuNhom TINYINT,
//         //     IsUserInput BIT,
//         //     IsVisibleToParents BIT,
//         //     IsSendToManager BIT
//         // }
//         const res = await apiUtil.TemplateBangDiemChiTiet('Ins', params)
//         if (res?.data) {
//             return true
//         } else {
//             return false
//         }
//     },
//     Copy: async (params) => {
//         // @TemplateBangDiemID_Src INT,
//         // @TemplateBangDiemID_Des INT,
//         const res = await apiUtil.TemplateBangDiemChiTiet('Copy', params)
//         if (res?.data) {
//             return true
//         } else {
//             return false
//         }
//     },
// }

const NhapDiem_Service = {
    Lop_Get_ByKhoiID: async (params) => {
        //"KhoiID":"Int32"
        const res = await apiUtil.NhapDiem('Lop_Get_ByKhoiID', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    HocSinhLop_Get_ByLopID: async (params) => {
        //"LopID":"Int32"
        const res = await apiUtil.NhapDiem('HocSinhLop_Get_ByLopID', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    HocSinhLop_Get: async (params) => {
        //"LopID":"Int32"
        const res = await apiUtil.NhapDiem('HocSinhLop_Get', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    MonHoc_Get_ByLopID: async (params) => {
        //"LopID":"Int32"
        const res = await apiUtil.NhapDiem('MonHoc_Get_ByLopID', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    MonHoc_Get: async (params) => {
        // CapID: int
        const res = await apiUtil.NhapDiem('MonHoc_Get', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    MonHoc_Get_ByCapID: async (params) => {
        // CapID INT
        const res = await apiUtil.NhapDiem('MonHoc_Get_ByCapID', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    NhomCauTrucDiem_Get_ByTemplateBangDiemID: async (params) => {
        //"TemplateBangDiemID":"Int32"
        const res = await apiUtil.NhapDiem('NhomCauTrucDiem_Get_ByTemplateBangDiemID', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },

    HocSinhBangDiem_Get_ByMonHocID_MaNhom: async (params) => {
        // @LopID INT,
        // @MonHocID INT,
        // @TemplateBangDiemID INT,
        // @MaNhomCotDiem NVARCHAR(100),
        const res = await apiUtil.NhapDiem('HocSinhBangDiem_Get_ByMonHocID_MaNhom', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    KQHT_MonHocLop_Ins: async (params) => {
        // @MonHocLopID INT,
        // @LopID INT,
        // @MonHocID INT,
        // @TemplateBangDiemID INT,
        // @KetQuaObjArr NVARCHAR(MAX),
        const res = await apiUtil.NhapDiem('KQHT_MonHocLop_Ins', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
    IO_IN_HocSinh_Ins: async (params) => {
        // @HocSinhObjArr Object Jason,
        const res = await apiUtil.NhapDiem('IO_IN_HocSinh_Ins', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
    IO_IN_HocSinhLop_Ins: async (params) => {
        // @HocSinhLopObjArr Object Jason,
        const res = await apiUtil.NhapDiem('IO_IN_HocSinhLop_Ins', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
    Lop_Get_ByNienKhoa: async (params) => {
        // @NienKhoa INT,
        const res = await apiUtil.NhapDiem('Lop_Get_ByNienKhoa', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
}

const GiaoVien_Service = {
    GiaoVien_Get: async () => {
        const res = await apiUtil.GiaoVien('GiaoVien_Get')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    GiaoVienLop_Get_ByLopID: async (params) => {
        //"LopID":"Int32"
        const res = await apiUtil.GiaoVien('GiaoVienLop_Get_ByLopID', params)
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    GiaoVienLop_Ins: async (params) => {
        // KhoiID: Int
        // LopID: Int
        // GiaoVienID: Int
        // VaiTro: NVARCHAR
        // MaDonVi: NVARCHAR
        // MonHocID: INT
        const res = await apiUtil.GiaoVien('GiaoVienLop_Ins', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
    GiaoVienLop_Upd: async (params) => {
        // GVLopID: Int
        // KhoiID: Int
        // LopID: Int
        // GiaoVienID: Int
        // VaiTro: NVARCHAR
        // MonHocID: INT
        const res = await apiUtil.GiaoVien('GiaoVienLop_Upd', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
    GiaoVienLop_Del: async (params) => {
        // GVLopID: Int
        const res = await apiUtil.GiaoVien('GiaoVienLop_Del', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
}

const LMS_Service = {
    LMS_GetLop: async () => {
        const res = await apiUtil.lhbs('LMS_GetLop')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    LMS_GetHocSinh: async () => {
        const res = await apiUtil.lhbs('LMS_GetHocSinh')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    LMS_GetHocSinhLop: async () => {
        const res = await apiUtil.lhbs('LMS_GetHocSinhLop')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
}

const Edubot_Service = {
    Edubot_GetLop: async () => {
        const res = await apiUtil.lhbs('Edubot_GetLop')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    Edubot_GetHocSinh: async () => {
        const res = await apiUtil.lhbs('Edubot_GetHocSinh')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    Edubot_GetHocSinhLop: async () => {
        const res = await apiUtil.lhbs('Edubot_GetHocSinhLop')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
}

const ChuKy_Service = {
    ChuKy_Get: async () => {
        const res = await apiUtil.ChuKy('ChuKy_Get')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },
    ChuKy_Ins: async (params) => {
        // @GiaoVienID INT,
        // @HinhAnhChuKy NVARCHAR,
        const res = await apiUtil.ChuKy('ChuKy_Ins', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
    ChuKy_Udp: async (params) => {
        // @ChuKyId INT
        // @GiaoVienID INT,
        // @HinhAnhChuKy NVARCHAR,
        const res = await apiUtil.ChuKy('ChuKy_Udp', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
    ChuKy_Del: async (params) => {
        // @ChuKyId INT
        const res = await apiUtil.ChuKy('ChuKy_Del', params)
        if (res?.data) {
            return true
        } else {
            return false
        }
    },
}

const HocSinh_Service = {
    Calen_GetInfoStudentByPhuHuynhID: async () => {
        const res = await apiUtil.lhbs('Calen_GetInfoStudentByPhuHuynhID')
        if (res?.data) {
            return res.data
        } else {
            return []
        }
    },

}
const HocSinhLMS_Service = {
    HocSinh_Detail_GetBy_HocSinhID: async (params) => {
        // HocSinhID
        const res = await apiUtil.HocSinh('HocSinh_Detail_GetBy_HocSinhID', params)
        if (res && res?.data) {
            return res.data[0]
        }
    },
    HocSinh_KQHT: async (params) => {
        // "HocSinhID": "AnsiString",
        // "LopID": "Int32",
        // "Semester": "AnsiString"
        const res = await apiUtil.HocSinh('HocSinh_KQHT', params)
        if (res && res?.data) {
            const DSMonHoc = res.data[0]
            const DSDiem = res.data[1]
            return { DSMonHoc, DSDiem }
        } else {
            return []
        }
    },
}
