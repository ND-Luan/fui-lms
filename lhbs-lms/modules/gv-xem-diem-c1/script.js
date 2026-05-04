function initSemester() {
    console.log('vueData.CapID', vueData.CapID)
    if (vueData.CapID === 1) {
        vueData.DSSemester = [
            {
                "title": "Giữa kì 1",
                "value": "GK_HK1",
                KyDanhGia: 1
            },
            {
                "title": "Cuối kì 1",
                "value": "CK_HK1",
                KyDanhGia: 2
            },
            {
                "title": "Giữa kì 2",
                "value": "GK_HK2",
                KyDanhGia: 3
            },
            {
                "title": "Cuối kì 2",
                "value": "CK_HK2",
                KyDanhGia: 4
            }
        ]
    } else {
        vueData.DSSemester = []
    }
}
function getDiemTheoLop_QLD() {
    if (vueData.CapID === 1) {
        ajaxCALL('psmark1/LMS_GetDanhGiaHocSinh', {
            LopID: vueData.LopItem.LopID,
            KyDanhGia: vueData.Semester.KyDanhGia,
            NamHoc: vueData.NienKhoa
        }, res => {
            vueData.DSHocSinh_API_QLD = res.data
            renderDSHocSinh_QLD()
        })
    } else {
        ajaxCALL(`diemc${vueData.CapID}/LMS_GetDiemTheoLop?LopID=${vueData.LopItem.LopID}&MonHocID=anh&HocKy=2`)
    }
    // ajaxCALL(`https://tapi.lhbs.vn/diemc${vueData.CapID}/LMS_GetDiemTheoLop?LopID=${vueData.LopItem.LopID}&MonHocID=anh&HocKy=2`, null, res => {
    //     vueData.DSHocSinh_API_QLD = res.data.map(item => {
    //         let findObj = vueData.MonHoc_QLD.find(e => e.MonHocCode.toLowerCase() == item.MonHocID.toLowerCase())
    //         if (!findObj) return item
    //         return { ...item, MonHocName: findObj.MonHocName, Sort: findObj.Sort}
    //     })
    //     vueData.DSHocSinh_API_QLD = vueData.DSHocSinh_API_QLD.sort((a, b) => a.Sort - b.Sort);
    //     renderDSHocSinh_QLD()
    // })
}
function promiseAjaxCALL(url, params) {
    return new Promise(resolve => {
        ajaxCALL(url, params, res => {
            resolve(res)
        })
    })
}
function fn_KeoDiem() {
    const uniqueHocSinhID = [...new Set(vueData.DSHocSinh_API_QLD.map(x => x.HocSinhID))]
    const uniqueTenMon = [...new Set(vueData.DSHocSinh_API_QLD.map(x => x.TenMon))]
    const promise = () => {
        return new Promise(async resolve => {
            for (var HocSinhID of uniqueHocSinhID) {
                for (var tenMon of uniqueTenMon) {
                    const JsonHocSinh_KeoDiem = vueData.DSHocSinh_API_QLD.filter(x => x.HocSinhID === HocSinhID && x.TenMon === tenMon)
                    await promiseAjaxCALL('lms/fn_HocSinh_KeoDiem', {
                        NienKhoa: vueData.NienKhoa,
                        JsonData: JsonHocSinh_KeoDiem
                    }).then(res => {
                        console.log('Kéo ', HocSinhID, ' - ', tenMon, ' Thành công!')
                    })
                }
            }
            resolve()
        })
    }
    promise().then(() => {
        //Sau khi chạy xong vòng for thì show thông báo
        Vue.$toast.success(`Kéo điểm thành công`, { position: "top" })
    })
}
vueData.getDiemTheoLop_QLD = getDiemTheoLop_QLD
function renderDSKhoi() {
    const DSKhoi = Array.from({ length: 12 }).map((_, i) => {
        const value = i + 1;
        let CapID;
        if (value >= 1 && value <= 5) {
            CapID = 1;
        } else if (value >= 6 && value <= 9) {
            CapID = 2;
        } else if (value >= 10 && value <= 12) {
            CapID = 3;
        }
        return {
            title: `Khối ${value}`,
            value,
            CapID,
        };
    });
    vueData.DSKhoi = DSKhoi.filter((x) => x.CapID === vueData.CapID);
    return DSKhoi;
}
function renderDSHocSinh_QLD() {
    const _dsHocSinh = []
    const dsHocSinhID = [...new Set(vueData.DSHocSinh_API_QLD.map(x => x.HocSinhID))]
    //Khởi tạo danh sách học sinh
    for (var HocSinhID of dsHocSinhID) {
        const objHocSinh = vueData.DSHocSinh_API_QLD.find(x => x.HocSinhID === HocSinhID)
        if (objHocSinh) _dsHocSinh.push({
            ...objHocSinh,
            DSCotDiem: vueData.DSHocSinh_API_QLD.filter(x => x.HocSinhID === HocSinhID)
        })
    }
    vueData.DSHocSinhQLD = _dsHocSinh
}
function getTinhTrangCaoNhat(tinhTrangList) {
    return Math.max(...tinhTrangList);
}
function fn_TinhTrangHocSinh(ListTinhTrang) {
    if (!ListTinhTrang) return
    const TinhTrang = getTinhTrangCaoNhat(ListTinhTrang)
    let TenTinhTrang = ''
    let MauTinhTrang = ''
    if (TinhTrang === 0) { TenTinhTrang = 'Chưa lưu'; MauTinhTrang = '' }
    if (TinhTrang === 1) { TenTinhTrang = 'Lưu tạm'; MauTinhTrang = 'yellow' }
    if (TinhTrang === 2) { TenTinhTrang = 'GVBM gửi điểm'; MauTinhTrang = 'orange' }
    if (TinhTrang === 3) { TenTinhTrang = 'GVCN từ chối điểm GVBM'; MauTinhTrang = 'error' }
    if (TinhTrang === 4) { TenTinhTrang = 'GVCN gửi điểm'; MauTinhTrang = 'primary' }
    if (TinhTrang === 5) { TenTinhTrang = 'Tổ trưởng từ chối GVCN'; MauTinhTrang = 'error' }
    if (TinhTrang === 6) { TenTinhTrang = 'Tổ trưởng gửi BGH'; MauTinhTrang = 'primary' }
    if (TinhTrang === 7) { TenTinhTrang = 'BGH từ chối Tổ trưởng'; MauTinhTrang = 'error' }
    if (TinhTrang === 8) { TenTinhTrang = 'BGH duyệt (Công bố phụ huynh)'; MauTinhTrang = 'success' }
    return { TinhTrang, TenTinhTrang, MauTinhTrang }
}
function isDisabledButton_TuChoi() {
    let flag = true
    if (vueData.DSHocSinh.length > 0) {
        const TinhTrang = vueData.DSHocSinh[0].TinhTrang
        if (TinhTrang === EnumTinhTrang.TT_TuChoi) flag = true
        if (TinhTrang === EnumTinhTrang.TT_GuiBGH) flag = false
    }
    return flag
}
function isDisabledButton_GuiDiem() {
    let flag = true
    if (vueData.DSHocSinh.length > 0) {
        const TinhTrang = vueData.DSHocSinh[0].TinhTrang
        if (TinhTrang === EnumTinhTrang.TT_TuChoi) flag = true
        if (TinhTrang === EnumTinhTrang.TT_GuiBGH) flag = true
    }
    return flag
}
const EnumTinhTrang = {
    ChuaLuu: 0, //: Chưa lưu,
    LuuTam: 1, //: Lưu tạm,
    GVBM_GuiDiem: 2, //: GVBM gửi điểm,
    GVCN_TuChoi_GVBM: 3, //: GVCN từ chối gửi điểm bộ môn,
    GVCN_GuiDiem: 4, //: GVCN gửi điểm,
    TT_TuChoi: 5, //: Tổ trưởng từ chối,
    TT_GuiBGH: 6, //: Tổ trưởng Gửi BGH,
    BGH_TuChoi: 7, //: BGH từ chối,
    BGH_Duyet: 8, //: BGH duyệt(Công bố phụ huynh)
}
const EnumVaiTro = {
    GVCN: 1,
    KhoiTruong: 2,
    GVBM: 3,
}