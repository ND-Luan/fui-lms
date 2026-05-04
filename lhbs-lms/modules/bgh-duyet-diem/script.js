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
function convertDSHocSinh() {
    let headers = []
    let DSCotDiem_ByMaNhomCotDiem = []
    vueData.DSHocSinh = [...new Set(vueData.DSCotDiem.map(x => x.HocSinhID))].map(id => {
        const hs = vueData.DSCotDiem.find(y => y.HocSinhID === id)
        return {
            Ho: hs.Ho,
            HocSinhID: hs.HocSinhID,
            NgaySinh: hs.NgaySinh,
            Nu: hs.Nu,
            SoDanhBo: hs.SoDanhBo,
            Ten: hs.Ten,
            TinhTrang: hs.TinhTrang,
        }
    })
    let SLCotDiem_OfFirstSTD = vueData.DSCotDiem.filter((item) => item.HocSinhID === fn_ProrityTinhTrang(vueData.DSHocSinh).HocSinhID) // lấy ra các cột điểm của học sinh đầu tiên
    DSCotDiem_ByMaNhomCotDiem = SLCotDiem_OfFirstSTD
    //Xử lý động cột điểm header jexcel
    let columnsCotDiem = SLCotDiem_OfFirstSTD
        .map((x) => {
            if (x.GiaTriCotDiem === 'number') { // cấu hình header cột điểm có dạng number
                let column = {
                    type: 'numeric',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    typeValue: x.GiaTriCotDiem,
                    width: 80,
                    decimal: '.',
                    mask: '0.00',
                    backGroundColor: x.HexBackground,
                    wrapText: true,
                    readOnly: true// x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'text',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    typeValue: x.GiaTriCotDiem,
                    width: x.WidthCSS,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'html',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    readOnly: true
                    // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            }
        })
    //Nếu là gửi điểm thì freezecolumn = 4 để thêm cột từ chối
    vueData.freezeColumns = (vueData.TinhTrang?.TinhTrang === 2 || vueData.TinhTrang?.TinhTrang === 3) ? 4 : 3
    let columnThongTinHocSinh = [
        {
            type: 'text',
            title: 'Mã học sinh',
            name: 'HocSinhID',
            width: 120,
            backGroundColor: null,
            wrap: true,
            readOnly: true
        },
        {
            type: 'text',
            title: 'Số Danh Bộ',
            name: 'SoDanhBo',
            width: 120,
            backGroundColor: null,
            wrap: true,
            readOnly: true
        },
        {
            type: 'text',
            title: 'Họ tên học sinh',
            name: 'HoVaTenHocSinh',
            width: 300,
            backGroundColor: null,
            wrap: true,
            align: "left",
            readOnly: true
        }
    ]
    if (vueData.TinhTrang?.TinhTrang === 2 || vueData.TinhTrang?.TinhTrang === 3) {
        columnThongTinHocSinh.push({
            type: 'text',
            title: 'Từ chối',
            name: 'ReasonReject',
            width: 300,
            backGroundColor: null,
            wrap: true,
            align: "left",
            readOnly: vueData.TinhTrang?.TinhTrang === 3
        })
    }
    headers = [...columnThongTinHocSinh, ...columnsCotDiem]
    //Xử lý data jexcel
    const dataJexcel = []
    let indexRow = 1
    for (var hocSinh of vueData.DSHocSinh) {
        const arrCotDiemExist = vueData.DSCotDiem.filter((x) => x.HocSinhID === hocSinh.HocSinhID) // Lấy danh sách điểm của học sinh
        if (arrCotDiemExist.length === 0) return
        let obj = {
            HocSinhID: arrCotDiemExist[0].HocSinhID,
            HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
            SoDanhBo: arrCotDiemExist[0].SoDanhBo,
        }
        if (arrCotDiemExist[0].ReasonReject) obj.ReasonReject = arrCotDiemExist[0].ReasonReject
        for (var cotDiemExist of arrCotDiemExist) {
            if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
                //Text
                obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)) : cotDiemExist.KetQuaDanhGia_VI
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && arrCotDiemExist.length === 1) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
                //Công thức
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //'=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
                //Ngôi sao
                obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)})`
            }
        }
        indexRow++
        dataJexcel.push(obj)
    }
    const firstStudent = dataJexcel[0]
    const dsCotDiem = vueData.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
    vueData.keyComp++
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
}
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}
function onTuChoiDiem() {
    vueData.StatusButton = 'tu-choi'
    vueData.dataBeforeInsertToDB = []
    let val = vueData.DSHocSinh
    //val là dữ liệu trên sheet jexcel
    let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
    //   let arrCotDiem = Object.keys(val[0]).splice(2); //Lấy các cột điểm của 1 học sinh
    //Xử lý data mapping giá trị
    //B1: Vòng lặp thứ nhất để lặp các học sinh
    //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
    for (let i = 0; i < val.length; i++) {
        let ReasonReject = null
        for (let j = 0; j < DSCotDiem.length; j++) {
            //j chỗ ReasonReject ko được phép tăng theo khi tăng theo thì làm lệch cột
            if (vueData.TinhTrang?.TinhTrang === 2 || vueData.TinhTrang?.TinhTrang === 3) ReasonReject = vueData.instance[0].getValueFromCoords(vueData.freezeColumns - 1, i)
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row
            let giaTriCotDiem = vueData.instance[0].getValueFromCoords(j + vueData.freezeColumns, i)
            let cotDiem_HS = {
                HocSinhID: val[i].HocSinhID,
                LopID: vueData.LopItem.LopID,
                NienKhoa: vueData.NienKhoa,
                CotDiemID: DSCotDiem[j].CotDiemID,
                KetQuaDanhGia_VI: DSCotDiem[j].GiaTriCotDiem === 'number' ? (giaTriCotDiem === '' || giaTriCotDiem === NaN ? null : parseFloat(giaTriCotDiem)) : giaTriCotDiem,
                KetQuaDanhGia_EN: DSCotDiem[j].GiaTriCotDiem === 'number' ? (giaTriCotDiem === '' || giaTriCotDiem === NaN ? null : parseFloat(giaTriCotDiem)) : giaTriCotDiem,
                Is_Reject: !!ReasonReject, //Khi có nội dung = true và ngược lại
                ReasonReject: ReasonReject,
            }
            let typeColumn = DSCotDiem[j].GiaTriCotDiem
            let value = cotDiem_HS.KetQuaDanhGia_VI
            const min = DSCotDiem[j].DiemMin
            const max = DSCotDiem[j].DiemMax
            cotDiem_HS.IsError = validateSave(typeColumn, value, min, max)
            if (cotDiem_HS.IsError === 1) {
                vueData.instance[0].setStyle(cellAdresss, 'background-color', 'red')
                Vue.$toast.error(`Cột điểm chỉ cho phép nhập thang điểm từ ${min} đến ${max}!`, { position: 'top' })
                return
            }
            cotDiem_HS.KetQuaDanhGia_VI = cotDiem_HS.KetQuaDanhGia_VI === NaN ? null : cotDiem_HS.KetQuaDanhGia_VI
            vueData.dataBeforeInsertToDB.push(cotDiem_HS)
        }
    }
    console.log('dataBeforeInsertToDB', vueData.dataBeforeInsertToDB)
    let validIndex = vueData.dataBeforeInsertToDB.findIndex((item) => item.IsError === 1)
    if (validIndex != -1) {
        Vue.$toast.error('Cột điểm chỉ cho phép nhập thang điểm 10!', { position: 'top' })
        return
    }
}
function onDuyetDiem() {
    vueData.StatusButton = 'duyet'
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
const renderDSMonHoc = () => {
    const uniqueMonHocID = [...new Set(vueData.DSHocSinh_API.map(x => x.MonHocID))]
    const DSMonHoc = []
    for (var MonHocID of uniqueMonHocID) {
        const obj = vueData.DSHocSinh_API.find(x => x.MonHocID === MonHocID)
        DSMonHoc.push({
            TenMonHoc_HienThi: obj.TenMonHoc_HienThi,
            MonHocLopID: obj.MonHocLopID
        })
    }
    vueData.DSMonHoc = DSMonHoc
}
async function onUpdateKyGuiDiem() {
    let KyDanhGia = null
    if (vueData.Semester.value === 'GK_HK1') KyDanhGia = 1
    if (vueData.Semester.value === 'CK_HK1') KyDanhGia = 2
    if (vueData.Semester.value === 'GK_HK2') KyDanhGia = 3
    if (vueData.Semester.value === 'CK_HK2') KyDanhGia = 4
    const params = {
        LopID: vueData.LopItem.LopID,
        KyDanhGia
    }
    return await ajaxCALLPromise("psmark1/LMS_UpdateKyGuiDiemPhuHuynh", params)
}
async function onPushMessageToME() {
    for (var hocSinh of vueData.DSHocSinh.filter(x => x.HocSinhID !== 25100126)) {
        await onPushMessageToME_ByHocSinh(hocSinh)
    }
}
async function onPushMessageToME_ByHocSinh(hocSinh) {
    let textSemester = ''
    if (vueData.Semester.value === 'GK_HK1') textSemester = "Giữa HK1"
    if (vueData.Semester.value === 'CK_HK1') textSemester = "Cuối HK1"
    if (vueData.Semester.value === 'GK_HK2') textSemester = "Giữa HK2"
    if (vueData.Semester.value === 'CK_HK2') textSemester = "Cuối HK2"
    const plainText = `Thông báo kết quả học tập học sinh: ${hocSinh?.HoTen} - Lớp ${vueData.LopItem.TenLop}`
        + `\nNăm học: ${vueData.NienKhoa}-${vueData.NienKhoa + 1} - ${textSemester}`
        + `\nQuý phụ huynh vui lòng xem nhận xét chi tiết tại: https://lms.lhbs.vn/ph-report?tab=2&HocSinhID=${hocSinh.HocSinhID}`
    return await ajaxCALLPromise("student/LMS_SendMessageToME", {
        HocSinhID: hocSinh.HocSinhID,
        NoiDung: plainText
    }).then(() => {
        Vue.$toast.success(`Đẩy ${hocSinh.HocSinhID} - ${hocSinh.HoTen} dữ liệu điểm sang ME`, { position: "top" })
    })
}