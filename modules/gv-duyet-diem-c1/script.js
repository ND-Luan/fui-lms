pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
    },
    times: {
        normal: 'times.ttf',
        bold: 'timesbd.ttf',
        italics: 'timesbi.ttf',
        bolditalics: 'timesi.ttf',
    }
}
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
async function onExportPDF() {
    const logoUrl = window.location.origin + '/_cdn/lhbs-lms/logo_lhbs_2.jpg';
    const logoBase64 = await getBase64FromUrl(logoUrl)
    const content = []
    const lopItem = vueData.LopItem
    for (var hocSinh of vueData.DSHocSinh) {
        const IMG = {
            image: 'logo',
            width: 64,
            height: 64,
        }
        const PROFILE = {
            text: [
                'Học sinh: ',
                {
                    text: hocSinh.HoTen + '\t\t\t',
                    bold: true,
                    margin: [0, 0, 20, 0]
                },
                'Lớp: ',
                {
                    text: lopItem?.TenLop,
                    bold: true
                }
            ],
            alignment: "center",
            fontSize: 14,
            margin: [0, 20, 0, 0]
        }
        const HEADER = {
            alignment: "center",
            columns: [IMG, PROFILE]
        }
        const TITLE = {
            text: [
                "BẢNG ĐIỂM ",
                {
                    text: vueData.Semester?.title?.toUpperCase()
                }
            ],
            bold: true,
            fontSize: 20,
            alignment: "center",
            margin: [0, 10, 0, 10]
        }
        const pageBreak = { text: '', fontSize: 14, bold: true, pageBreak: 'before', margin: [0, 0, 0, 8] }
        const margins = { text: '', fontSize: 14, bold: true, margin: [0, 0, 0, 12] }
        content.push(HEADER)
        content.push(TITLE)
        content.push(margins)
        const HEADER_TABLE = [
            {
                text: "Nội dung đánh giá",
                border: [true, true, true, true],
                alignment: "center",
                bold: true
            },
            {
                text: "Mức đạt được",
                border: [true, true, true, true],
                alignment: "center",
                bold: true
            },
            {
                text: "Điểm",
                border: [true, true, true, true],
                alignment: "center",
                bold: true
            },
            {
                text: "Sao",
                border: [true, true, true, true],
                alignment: "center",
                bold: true
            },
            {
                text: "Nhận xét",
                border: [true, true, true, true],
                alignment: "left",
                bold: true
            },
        ]
        const CONTENT_TABLE = []
        const dsMonHocID = [... new Set(hocSinh.DSCotDiem.map(x => x.MonHocID))]
        for (var MonHocID of dsMonHocID) {
            let dsCotDiem = hocSinh.DSCotDiem
                .filter(x => x.MonHocID === MonHocID)
            const TenMonHoc = hocSinh.DSCotDiem.find(x => x.MonHocID === MonHocID)
            const columnNoiDung = {
                text: TenMonHoc?.TenMonHoc_HienThi ?? '',
                border: [true, true, true, true]
            }
            const MucDoDanhGiaObj = dsCotDiem.find(x => x.MaCotDiem.includes('MucDoDanhGia'))
            const columnMucDoDatDuoc = {
                text: MucDoDanhGiaObj?.KetQuaDanhGia_VI ?? '',
                border: [true, true, true, true],
                alignment: 'center'
            }
            const DiemObj = dsCotDiem.find(x => x.MaCotDiem.includes('Diem'))
            const columnDiem = {
                text: DiemObj?.KetQuaDanhGia_VI ?? '',
                border: [true, true, true, true],
                alignment: 'center'
            }
            const SaoObj = dsCotDiem.find(x => x.MaCotDiem.includes('Sao'))
            const columnQuyDoiSao = {
                text: SaoObj?.KetQuaDanhGia_VI ?? '',
                border: [true, true, true, true],
                alignment: 'center'
            }
            const NhanXetObj = dsCotDiem.find(x => x.MaCotDiem.includes('NhanXet'))
            const columnNhanXet = {
                text: NhanXetObj?.KetQuaDanhGia_VI ?? '',
                border: [true, true, true, true],
                alignment: 'left'
            }
            CONTENT_TABLE.push([columnNoiDung, columnMucDoDatDuoc, columnDiem, columnQuyDoiSao, columnNhanXet])
        }
        const monHocIDFirst = hocSinh.DSCotDiem[0]?.MonHocID ?? 0
        const columnNoiDungDanhGia = 100
        const columnMucDoDatDuoc = 80
        const columnDiem = 50
        const columnSao = 50
        const getWidths = [
            columnNoiDungDanhGia
            , columnMucDoDatDuoc
            , columnDiem
            , columnSao
            , '*'
        ]
        console.log("CONTENT_TABLE", CONTENT_TABLE)
        console.log("getWidths", getWidths)
        const TABLE = {
            table: {
                widths: getWidths,
                body: [
                    HEADER_TABLE,
                    ...CONTENT_TABLE
                ]
            }
        }
        content.push(TABLE)
        content.push(pageBreak)
    }
    let val = {
        content: content.slice(0, -1)
    }
    var dd = {
        pageSize: "A4",
        content: val.content,
        images: {
            logo: logoBase64
        },
        styles: {},
        defaultStyle: {
            fontSize: 12,
            font: 'times'
        }
    };
    const pdf = pdfMake.createPdf(dd);
    pdf.print()
}
async function getBase64FromUrl(url) {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        };
        reader.onerror = reject;
    });
}
vueData.renderDSMonHoc = renderDSMonHoc
vueData.onExportPDF = onExportPDF