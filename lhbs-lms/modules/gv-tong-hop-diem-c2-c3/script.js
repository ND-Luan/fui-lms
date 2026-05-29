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
function renderDSHocSinh() {
    const _dsHocSinh = []
    const dsHocSinhID = [...new Set(vueData.DSHocSinh_API.map(x => x.HocSinhID))]
    //Khởi tạo danh sách học sinh
    for (var HocSinhID of dsHocSinhID) {
        const objHocSinh = vueData.DSHocSinh_API.find(x => x.HocSinhID === HocSinhID)
        if (objHocSinh) _dsHocSinh.push({
            ...objHocSinh,
            DSCotDiem: vueData.DSHocSinh_API.filter(x => x.HocSinhID === HocSinhID)
        })
    }
    vueData.DSHocSinh = _dsHocSinh
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
const isShowReasonReject = () => {
    let defaultObj = {
        disabled: false,
        NoiDungNhanXet: null
    }
    const DSHocSinh_Semester = vueData.DSHocSinh_API.filter(x => x.MaCotDiem.includes(vueData.Semester?.value))
    if (DSHocSinh_Semester.length > 0) {
        const obj = DSHocSinh_Semester.find(x => x.TinhTrang === 3)
        defaultObj.disabled = obj ? true : false
        defaultObj.NoiDungNhanXet = obj?.NoiDungNhanXet ?? ''
    }
    console.log(defaultObj)
    return defaultObj
}