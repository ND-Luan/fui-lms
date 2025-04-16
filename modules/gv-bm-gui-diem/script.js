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
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}
function onDuyetDiem() {
    vueData.StatusButton = 'duyet'
    CALL("insKQHT_MonHocLop")
}
function renderDSHocSinh() {
    if (vueData.DSHocSinh_API.length === 0) return
    let headers = []
    const firstStudentID = vueData.DSHocSinh_API[0].HocSinhID
    const arrMaCotDiem_firstStudent = vueData.DSHocSinh_API.filter(x => x.HocSinhID === firstStudentID)
    const ListCotDiemFilter = [
        'GK_C1_HK1',
        'GK_C2_HK1',
        'GK_C3_HK1',
        'GK_C4_HK1',
        'GK_C5_HK1',
        'GK_C6_HK1',
        'GK_C7_HK1',
        'GK_C8_HK1',
        'GK_C9_HK1',
        'GK_C10_HK1',
        'CK_C1_HK1',
        'CK_C2_HK1',
        'CK_C3_HK1',
        'CK_C4_HK1',
        'CK_C5_HK1',
        'CK_C6_HK1',
        'CK_C7_HK1',
        'CK_C8_HK1',
        'CK_C9_HK1',
        'CK_C10_HK1'
    ]
    const uniqueMaCotDiem = [...new Set(arrMaCotDiem_firstStudent.map(x => x.MaCotDiem))].filter(x => !ListCotDiemFilter.includes(x))
    for (var maCotDiem of uniqueMaCotDiem) {
        const maCotDiemExist = vueData.DSHocSinh_API.find(x => x.MaCotDiem === maCotDiem)
        headers.push({
            title: maCotDiemExist.TenCotDiem_VI,
            value: maCotDiemExist.MaCotDiem,
            align: (maCotDiemExist.GiaTriCotDiem === 'number' || maCotDiemExist.MaCotDiem.includes('MucDoDanhGia')) ? 'center' : "left",
            width: maCotDiemExist.WidthCSS
        })
    }
    const infoStudentHeader = [
        {
            key: "hocSinh",
            title: "Học sinh",
            el: "uc-info-student",
            align: 'center',
            width: 300
        }
    ]
    headers = [...infoStudentHeader, ...headers]
    const _dsHocSinh = []
    const dsHocSinhID = [...new Set(vueData.DSHocSinh_API.map(x => x.HocSinhID))]
    //Khởi tạo danh sách học sinh
    for (var HocSinhID of dsHocSinhID) {
        const objHocSinh = vueData.DSHocSinh_API.find(x => x.HocSinhID === HocSinhID)
        if (objHocSinh) {
            const objGVCN_LyDoTuChoi = vueData.DSHocSinh_API.find(x => x.HocSinhID === HocSinhID && x.GVCN_LyDo_TuChoi_ID > 0)
            const objTT_LyDoTuChoi = vueData.DSHocSinh_API.find(x => x.HocSinhID === HocSinhID && x.TT_LyDo_TuChoi_ID > 0)
            const List_DSCotDiemHocSinh = vueData.DSHocSinh_API.filter(x => x.HocSinhID === HocSinhID)
            const List_TinhTrangHocSinh = [...new Set(List_DSCotDiemHocSinh.map(x => x.TinhTrang))]
            const { TinhTrang, TenTinhTrang, MauTinhTrang } = fn_TinhTrangHocSinh(List_TinhTrangHocSinh)
            const obj = {
                HocSinhID: objHocSinh.HocSinhID,
                HoTen: objHocSinh.HoTen,
                NgaySinh: objHocSinh.NgaySinh,
                SoDanhBo: objHocSinh.SoDanhBo,
                GVCN_LyDoTuChoi: objGVCN_LyDoTuChoi?.GVCN_LyDoTuChoi,
                TT_LyDoTuChoi: objTT_LyDoTuChoi?.TT_LyDoTuChoi,
                TinhTrang: objHocSinh.TinhTrang,
                TenTinhTrang: objHocSinh.TenTinhTrang,
                MauTinhTrang: objHocSinh.MauTinhTrang,
                NoiDungNhanXet: objHocSinh?.NoiDungNhanXet ?? ''
            }
            const arrDSMaCotDiem = vueData.DSHocSinh_API.filter(x => x.HocSinhID === objHocSinh.HocSinhID)
            for (var item of arrDSMaCotDiem) {
                obj[item.MaCotDiem] = item.KetQuaDanhGia_VI || item.KetQuaDanhGia_EN
            }
            _dsHocSinh.push(obj)
        }
    }
    vueData.DSHocSinh = _dsHocSinh
    vueData.DSHocSinhSelected = _dsHocSinh.map(x => x.HocSinhID)
    vueData.headers = headers
}
function onReject(item) {
    vueData.HocSinhItem = _.cloneDeep(item)
    vueData.IsShowDialogReject = true
}
function onApprove(item) {
    //Nếu = 1 là giáo viên chủ nhiệm thì gửi cho tổ trưởng
    if (vueData.VaiTro === 1) {
        confirm({
            title: "Bạn đang là giáo viên chủ nhiệm. Xác nhận gửi điểm học sinh cho Tổ trưởng",
            action() {
                ajaxCALL('lms/KQHT_MonHocLop_TinhTrang_Udp', {
                    MonHocLopID: vueData.MonHocItem.MonHocLopID,
                    LopID: vueData.LopItem.LopID,
                    TinhTrang: 4,
                    MaNhomCotDiem: vueData.MaNhomCotDiemItem.MaNhomCotDiem,
                    HocSinhID: item.HocSinhID
                }, res => {
                    CALL('HocSinhBangDiem_Get_ByMonHocID')
                })
            }
        })
    } else if (vueData.VaiTro === 3) {
        //Nếu = 3 là bộ môn gửi điểm cho giáo viên chủ nhiệm
        confirm({
            title: "Bạn đang là giáo viên bộ môn. Xác nhận gửi điểm học sinh cho giáo viên chủ nhiệm",
            action() {
                ajaxCALL('lms/KQHT_MonHocLop_TinhTrang_Udp', {
                    MonHocLopID: vueData.MonHocItem.MonHocLopID,
                    LopID: vueData.LopItem.LopID,
                    TinhTrang: 2,
                    MaNhomCotDiem: vueData.MaNhomCotDiemItem.MaNhomCotDiem,
                    HocSinhID: item.HocSinhID
                }, res => {
                    CALL('HocSinhBangDiem_Get_ByMonHocID')
                })
            }
        })
    }
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
function renderTextVaiTro(VaiTro) {
    if (!VaiTro) return ''
    let textVaiTro = ''
    if (VaiTro === 1) textVaiTro = 'Giáo viên chủ nhiệm'
    if (VaiTro === 2) textVaiTro = 'Khối trưởng'
    if (VaiTro === 3) textVaiTro = 'Giáo viên bộ môn'
    return textVaiTro
}
function isDisabledButtonTuChoi(item) {
    let flag = true
    if (vueData.VaiTro === EnumVaiTro.GVCN) {
        if (item.TinhTrang === EnumTinhTrang.GVBM_GuiDiem) flag = false
        if (item.TinhTrang === EnumTinhTrang.TT_TuChoi) flag = false
        // if (item.TinhTrang === 4) flag = false
    } else if (vueData.VaiTro === EnumVaiTro.GVBM) {
        // if (item.TinhTrang === 2) flag = true
        // if (item.TinhTrang === 4) flag = false
    }
    return flag
}
function isDisabledButtonGuiDiem(item) {
    let flag = true
    if (vueData.VaiTro === EnumVaiTro.GVCN) {
        if (item.TinhTrang === EnumTinhTrang.GVBM_GuiDiem) flag = false
        if (item.TinhTrang === EnumTinhTrang.TT_TuChoi) flag = false
        // if (item.TinhTrang === 3) flag = true
        // if (item.TinhTrang === 4) flag = false
    } else if (vueData.VaiTro === EnumVaiTro.GVBM) {
        if (item.TinhTrang === EnumTinhTrang.GVCN_TuChoi_GVBM) flag = false
        // if (item.TinhTrang === 4) flag = false
        // if (item.TinhTrang === 2) flag = true
    }
    return flag
}
function renderTextDSHocSinh_TuChoi() {
    return vueData.DSHocSinh.filter(x => x.TinhTrang === EnumTinhTrang.GVCN_TuChoi_GVBM).length
}
function renderTextDSHocSinh_GVBM_GuiDiem() {
    return vueData.DSHocSinh.filter(x => x.TinhTrang === EnumTinhTrang.GVBM_GuiDiem).length
}
function renderTextDSHocSinh_GVCN_GuiDiem() {
    return vueData.DSHocSinh.filter(x => x.TinhTrang === EnumTinhTrang.GVCN_GuiDiem).length
}
function renderTextDSHocSinh_Selected() {
    return 'Gửi điểm ' + vueData.DSHocSinhSelected.length + ' học sinh'
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
const onGuiDiem = () => {
    confirm({
        title: `Xác nhận - Giáo viên bộ môn gửi điểm cho ${vueData.DSHocSinh[0].TinhTrang === 5 ? 'Tổ trưởng' : 'Giáo viên chủ nhiệm'}`,
        action: function () {
            ajaxCALL('lms/KQHT_MonHocLop_TinhTrang_Udp', {
                "MonHocLopID": vueData.MonHocItem.MonHocLopID,
                "LopID": vueData.LopItem.LopID,
                "TinhTrang": 2,
                "MaNhomCotDiem": vueData.MaNhomCotDiemItem.MaNhomCotDiem
            },
                res => {
                    CALL('HocSinhBangDiem_Get_ByMonHocID')
                })
        }
    })
}