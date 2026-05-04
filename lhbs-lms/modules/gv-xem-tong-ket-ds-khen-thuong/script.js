function exportExcel() {
    const headers = [
        "TenLop",
        "HocSinhID",
        "HoTen",
        "NgaySinh",
        "Phai",
        "KT_Truong_XuatSac",
        "KT_Truong_TieuBieu",
        "ThuKhen",
        "NoiDungThuKhen",
        "ThanhTichKhac",
        "DanhHieu",
        "VaoSoKT",
        "SoQuyetDinhKT",
        "NgayKhenThuong_VI",
        "NgayKhenThuong_EN",
    ]
    const rawData = vueData.DSHocSinhQLD
    const data = rawData.map(item =>
        headers.map(h => item[h] ?? "")
    )
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, 'DanhSachKhenThuong.xlsx')
}
async function getFontBase64(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // bỏ 'data:...base64,'
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
async function exportThuKhen() {
    const base64 = await getFontBase64('/_cdn/lhbs-lms/00085-UTM-EdwardianKT.ttf');
    // Gán vào vfs và font
    pdfMake.vfs = pdfMake.vfs || {};
    pdfMake.vfs['UTM-EdwardianKT.ttf'] = base64;
    pdfMake.fonts = {
        UTM_Edwardian: {
            normal: 'UTM-EdwardianKT.ttf',
            bold: 'UTM-EdwardianKT.ttf',
            italics: 'UTM-EdwardianKT.ttf',
            bolditalics: 'UTM-EdwardianKT.ttf'
        }
    };
    const content = []
    for (var data of vueData.DSHocSinhQLD.filter(x => x.NoiDungThuKhen)) {
        let splitNoiDung = data.NoiDungThuKhen?.split('\n') ?? [];
        splitNoiDung = splitNoiDung.filter(x => x !== '')
        const NoiDungThuKhen = []
        let MarginTop = 220
        const tab = '\t\t\t'; // ~ 1 tab khoảng trắng
        const SoTu = splitNoiDung[0]?.split(' ').length
        const SoDong = SoTu / 11
        // if (SoDong > 7) {
        //     MarginTop = 160
        // }
        if (SoDong > 6) {
            MarginTop = 180
        }
        else if (SoDong > 5) {
            MarginTop = 200
        } else if (SoDong > 4) {
            MarginTop = 220
        }
        for (var noidung of splitNoiDung) {
            NoiDungThuKhen.push({
                text: tab + noidung,
                font: 'UTM_Edwardian',
                alignment: 'justify',       // 👈 Canh đều hai bên
                margin: [55, 0, 55, 0],    // 👈 Thụt lề trái/phải (36pt ≈ 1.27cm ~ một tab)
                style: "title",
                preserveLeadingSpaces: true
            })
        }
        const TITLE_HOCSINH = {
            text: `Học sinh: ${data.HoTen} lớp ${data.TenLop.substring(1, 4)}`, //Cắt bỏ số 0 trong tên lớp
            font: 'UTM_Edwardian',
            style: "title",
            margin: [0, MarginTop, 0, 0],
        }
        const pageBreak = { text: '', fontSize: 14, bold: true, pageBreak: 'before', margin: [0, 0, 0, 8] }
        content.push(TITLE_HOCSINH)
        content.push({ text: "", margin: [0, 20, 0, 0] })
        content.push(NoiDungThuKhen)
        content.push(pageBreak)
    }
    let val = {
        content: content.slice(0, -1)
    }
    const dd = {
        pageSize: "A4",
        content: val.content,
        styles: {
            title: {
                fontSize: 24,
                alignment: 'center'
            }
        },
        defaultStyle: {
            font: 'UTM_Edwardian' // 👈 đặt ở đây nếu muốn mặc định
        }
    };
    const pdf = pdfMake.createPdf(dd);
    pdf.open();
}
async function exportGiayKhen() {
    vueData.isLoadingExportGiayKhen = true
    const DSDanhHieu = [
        {
            List_CapID: [1, 2, 3],
            DanhHieu_VI: "Học sinh Xuất sắc", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of distinguished performance in Academic Achievements"
        },
        {
            List_CapID: [1],
            DanhHieu_VI: "Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of outstanding performance in Academic Achievements"
        },
        {
            List_CapID: [2, 3],
            DanhHieu_VI: "Học sinh Giỏi", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of outstanding performance in Academic Achievements"
        }
    ]
    const Certs = []
    for (var data of vueData.DSHocSinhQLD.filter(x => x.DanhHieu?.length > 0)) {
        const objEN_DanhHieu = DSDanhHieu.find(x => x.DanhHieu_VI === data.DanhHieu)
        // const tenLop = data.TenLop
        // if (data.TenLop.startWidth)
        Certs.push({
            KhenTang_Vi: "Khen tặng học sinh",
            KhenTang_En: "We gladly present",
            HoTen: data.HoTen.toUpperCase(),
            Lop: `CLASS ${data.TenLop}`,
            DanhHieu_Vi: "Đạt danh hiệu " + data.DanhHieu ?? "",
            DanhHieu_En: objEN_DanhHieu?.DanhHieu_EN ?? "",
            NamHoc_Vi: `Năm học ${vueData.NienKhoa}-${vueData.NienKhoa+1}`,
            NamHoc_En: `In the school year ${vueData.NienKhoa}-${vueData.NienKhoa+1}`,
            NgayThangNam_Vi: data.NgayKhenThuong_VI ?? "",
            NgayThangNam_En: data.NgayKhenThuong_EN ?? "",
            SoQuyetDinh: `${data.SoQuyetDinhKT ?? ""}/QĐ-SNLH. NO: ${data.VaoSoKT?.toString()?.padStart(2, '0') ?? ""}`,
            TenHieuTruong: "Hồ Thị Thương"
        })
    }
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ Certs: Certs }),
        redirect: "follow"
    };
    fetch("https://gencert.iotsoftvn.com/api/cert-generators/multi-pdf", requestOptions)
        .then((response) => response.blob())
        .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = `DanhSachGiayKhen.pdf`
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); //afterwards we remove the element again
            vueData.isLoadingExportGiayKhen = false
        })
        .catch((error) => {
            console.log(error)
            vueData.isLoadingExportGiayKhen = false
        });
}
function onSave_KT() {
    const Json_KhenThuong = vueData.DSHocSinhQLD.map(x => {
        const objHocSinhLop = vueData.DSKhenThuong.find(n => n.HocSinhID === x.HocSinhID)
        return {
            NienKhoa: vueData.NienKhoa,
            HSLopID: objHocSinhLop?.HSLopID,
            DanhHieu: x.DanhHieu,
        }
    })
    ajaxCALL('lms/KhenThuong_Ins', {
        Json_KhenThuong: Json_KhenThuong
    }, res => {
        Vue.$toast.success('Lưu danh hiệu về LMS thành công', { position: "top" })
    })
}
function getDiemTheoLop_QLD() {
    CALL('getKhenThuong')
    ajaxCALL(`https://tapi.lhbs.vn/psmark1/LMS_GetBangTongHopKetQua_TheoKhoi?KhoiID=${vueData.KhoiItem.KhoiID}&=&KyDanhGia=4&NamHoc=${vueData.NienKhoa}`, null, res => {
        vueData.DSHocSinh_API_QLD = res.data.map(item => {
            // let findObj = vueData.MonHoc_QLD.find(e => e.MonHocCode.toLowerCase() == item.MonHocID.toLowerCase())
            // if (!findObj) return item
            // return { ...item, MonHocName: findObj.MonHocName, Sort: findObj.Sort }
            return item
        })
        vueData.DSHocSinh_API_QLD = vueData.DSHocSinh_API_QLD.sort((a, b) => a.Sort - b.Sort);
        renderDSHocSinh_QLD()
    })
}
function renderDSHocSinh_QLD() {
    const _dsHocSinh = []
    const dsHocSinhID = [...new Set(vueData.DSHocSinh_API_QLD.map(x => x.HocSinhID))]
    // //Khởi tạo danh sách học sinh
    for (var HocSinhID of dsHocSinhID) {
        const objHocSinh = vueData.DSHocSinh_API_QLD.find(x => x.HocSinhID === HocSinhID)
        const objHocSinh_KhenThuong = vueData.DSKhenThuong.find(x => x.HocSinhID === HocSinhID)
        let ThuKhen = 'x'
        if (objHocSinh.KT_Truong_XuatSac == 'x' || objHocSinh_KhenThuong?.HocSinhTieuBieu) {
            ThuKhen = ''
        }
        if (objHocSinh) _dsHocSinh.push({
            STT: objHocSinh.STT,
            TenLop: objHocSinh?.TenLop ?? '',
            HocSinhID: objHocSinh.HocSinhID,
            HoTen: objHocSinh.HoTen,
            NgaySinh: objHocSinh.NgaySinh,
            Phai: objHocSinh.Phai,
            KT_Truong_XuatSac: objHocSinh.KT_Truong_XuatSac,
            KT_Truong_TieuBieu: objHocSinh_KhenThuong?.HocSinhTieuBieu ? 'x' : '',
            ThuKhen: ThuKhen,
            DanhHieu: objHocSinh.DanhHieu, //Danh hiệu vẫn lấy bên a Chiến
            NoiDungThuKhen: objHocSinh_KhenThuong?.NoiDungThuKhen,
            ThanhTichKhac: objHocSinh_KhenThuong?.ThanhTichKhac,
            VaoSoKT: objHocSinh_KhenThuong?.VaoSoKT,
            SoQuyetDinhKT: objHocSinh_KhenThuong?.SoQuyetDinhKT,
            NgayKhenThuong_VI: objHocSinh_KhenThuong?.NgayKhenThuong_VI,
            NgayKhenThuong_EN: objHocSinh_KhenThuong?.NgayKhenThuong_EN,
            Is_DaIn: objHocSinh_KhenThuong?.Is_DaIn,
        })
    }
    handleHeaders()
    vueData.DSHocSinhQLD = _dsHocSinh
}
function initSpread() {
    handleHeaders()
    handleData()
}
function handleHeaders() {
    if (!Array.isArray(vueData.DSHocSinh_API_QLD) || vueData.DSHocSinh_API_QLD.length === 0) {
        console.warn('Không có dữ liệu để tạo header');
        return;
    }
    let headerDefault = [
        "STT",
        "TenLop",
        "HocSinhID",
        "HoTen",
        "NgaySinh",
        "Phai",
        "KT_Truong_XuatSac",
        "KT_Truong_TieuBieu",
        "ThuKhen",
        "NoiDungThuKhen",
        "ThanhTichKhac",
        "DanhHieu",
        "VaoSoKT",
        "SoQuyetDinhKT",
        "NgayKhenThuong_VI",
        "NgayKhenThuong_EN",
        "Is_DaIn"
    ]
    let columnThongTinHocSinh = []
    const columnMapping = {
        STT: { width: 1, type: "hidden" },
        TenLop: { width: 60, title: "Tên lớp" },
        HocSinhID: { width: 80, title: "Mã học sinh" },
        HoTen: { width: 220, align: 'left', title: "Họ tên" },
        NgaySinh: { width: 100, title: "Ngày sinh" },
        Phai: { width: 50 },
        KT_Truong_XuatSac: { width: 60, title: "Xuất sắc" }, //KT Trường -
        KT_Truong_TieuBieu: { width: 80, title: "Tiêu biểu" }, //KT Trường -
        // KTLop: { width: 200, title: "KT Lớp - Thư Khen" },
        ThuKhen: { width: 80, title: "Thư Khen" }, //KT Lớp -
        NoiDungThuKhen: { width: 400, title: "Nội dung thư khen" },
        ThanhTichKhac: { width: 200, title: "Thành tích khác" },
        DanhHieu: { width: 150, title: "Danh hiệu" },
        VaoSoKT: { width: 100, title: "Số vào sổ KT" },
        SoQuyetDinhKT: { width: 100, title: "Số QĐ KT" },
        NgayKhenThuong_VI: { width: 150, title: "Ngày KT (VI)" },
        NgayKhenThuong_EN: { width: 150, title: "Ngày KT (EN)" },
        Is_DaIn: { width: 1, type: "hidden" },
    };
    for (var key of headerDefault) {
        let column = {
            type: 'text',
            title: key,
            name: key,
            width: 40,
            backGroundColor: null,
            wrap: true,
            align: "center",
            readOnly: true,
            style: 'font-size:8px',
            ...columnMapping[key], // Áp dụng thuộc tính từ object ánh xạ
        };
        columnThongTinHocSinh.push(column)
    }
    vueData.columnHeader = columnThongTinHocSinh
    vueData.keyComp++
}
function handleData() {
    for (var item of vueData.dataDiem) {
        vueData.DSHocSinh.push(item)
    }
    vueData.DSHocSinh = vueData.DSHocSinh.sort((a, b) => a.TenLop.localeCompare(b.TenLop));
}
async function getDSLop() {
    vueData.DSHocSinh = []
    vueData.DSHocSinhChange = [] //Clear lại ds học sinh change
}
function onSave() {
    confirm({
        title: `Xác nhận lưu ${vueData.DSHocSinh.length} học sinh?`,
        action: function () {
            //Tạo biến distinctHocSinhChange để lấy học sinh có thay đổi dữ liệu dùng Set để distint HocSinhID
            // let distinctHocSinhChange = [...new Set(vueData.DSHocSinhChange.map(HocSinhID => HocSinhID))]
            // let parseJSON = vueData.DSHocSinh.filter(item => distinctHocSinhChange.includes(item.HocSinhID)).map(item => {
            //     return {
            //         ...item,
            //         HocSinhID: item.HocSinhID,
            //         HocSinhLopID: item.HocSinhLopID,
            //         TenLop: item.TenLop,
            //         KQRL_Sau: item.KQRenLuyen,
            //         KQRenLuyen: item.KQRenLuyen
            //     }
            // })
        }
    })
}
function renderDSHocSinhChange() {
    const arr = []
    for (var HocSinhID of vueData.DSHocSinhChange) {
        const obj = vueData.dataDiem.find(x => x.HocSinhID === HocSinhID)
        if (obj) arr.push({
            HoTen: obj.HoTen,
            NgaySinh: obj.NgaySinh,
            Nu: obj.Nu,
            SoDanhBo: obj.SoDanhBo,
            HocSinhID: obj.HocSinhID,
            KQRenLuyen: obj.KQRenLuyen
        })
    }
    return arr
}
const UNICODE_TCVN3_MAP = {
    'à': 'à', 'á': 'á', 'ạ': 'ạ', 'ả': 'ả', 'ã': 'ã',
    'â': 'ê', 'ầ': 'ề', 'ấ': 'ế', 'ậ': 'ệ', 'ẩ': 'ể', 'ẫ': 'ễ',
    'ă': 'å', 'ằ': 'è', 'ắ': 'é', 'ặ': 'ẹ', 'ẳ': 'ẻ', 'ẵ': 'ẽ',
    'è': 'ì', 'é': 'í', 'ẹ': 'î', 'ẻ': 'ï', 'ẽ': 'ñ',
    'ê': 'ô', 'ề': 'ò', 'ế': 'ó', 'ệ': 'õ', 'ể': 'ô', 'ễ': 'ö',
    'ì': 'ù', 'í': 'ú', 'ị': 'û', 'ỉ': 'ü', 'ĩ': 'ý',
    'ò': 'ò', 'ó': 'ó', 'ọ': 'ô', 'ỏ': 'õ', 'õ': 'ö',
    'ô': '÷', 'ồ': 'ø', 'ố': 'ù', 'ộ': 'ú', 'ổ': 'û', 'ỗ': 'ü',
    'ơ': 'ü', 'ờ': 'ü', 'ớ': 'ý', 'ợ': 'þ', 'ở': 'ý', 'ỡ': 'ý',
    'ù': 'ì', 'ú': 'í', 'ụ': 'î', 'ủ': 'ï', 'ũ': 'ñ',
    'ư': 'ð', 'ừ': 'ñ', 'ứ': 'ò', 'ự': 'ó', 'ử': 'ô', 'ữ': 'õ',
    'ỳ': 'ö', 'ý': '÷', 'ỵ': 'ø', 'ỷ': 'ù', 'ỹ': 'ú',
    'đ': 'ñ',
    'À': 'À', 'Á': 'Á', 'Ạ': 'Ạ', 'Ả': 'Ả', 'Ã': 'Ã',
    'Â': 'Ê', 'Ầ': 'Ề', 'Ấ': 'Ế', 'Ậ': 'Ệ', 'Ẩ': 'Ể', 'Ẫ': 'Ễ',
    'Ă': 'Å', 'Ằ': 'È', 'Ắ': 'É', 'Ặ': 'Ẹ', 'Ẳ': 'Ẻ', 'Ẵ': 'Ẽ',
    'È': 'Ì', 'É': 'Í', 'Ẹ': 'Î', 'Ẻ': 'Ï', 'Ẽ': 'Ñ',
    'Ê': 'Ô', 'Ề': 'Ò', 'Ế': 'Ó', 'Ệ': 'Õ', 'Ể': 'Ô', 'Ễ': 'Ö',
    'Ì': 'Ù', 'Í': 'Ú', 'Ị': 'Û', 'Ỉ': 'Ü', 'Ĩ': 'Ý',
    'Ò': 'Ò', 'Ó': 'Ó', 'Ọ': 'Ô', 'Ỏ': 'Õ', 'Õ': 'Ö',
    'Ô': '×', 'Ồ': 'Ø', 'Ố': 'Ù', 'Ộ': 'Ú', 'Ổ': 'Û', 'Ỗ': 'Ü',
    'Ơ': 'Ü', 'Ờ': 'Ü', 'Ớ': 'Ý', 'Ợ': 'Þ', 'Ở': 'Ý', 'Ỡ': 'Ý',
    'Ù': 'Ì', 'Ú': 'Í', 'Ụ': 'Î', 'Ủ': 'Ï', 'Ũ': 'Ñ',
    'Ư': 'Ð', 'Ừ': 'Ñ', 'Ứ': 'Ò', 'Ự': 'Ó', 'Ử': 'Ô', 'Ữ': 'Õ',
    'Ỳ': 'Ö', 'Ý': '×', 'Ỵ': 'Ø', 'Ỷ': 'Ù', 'Ỹ': 'Ú',
    'Đ': 'Ð'
};
function unicodeToVNI(str) {
    return str.split('').map(char => UNICODE_TCVN3_MAP[char] || char).join('');
}
vueData.initSpread = initSpread
vueData.getDiemTheoLop_QLD = getDiemTheoLop_QLD
vueData.renderDSHocSinhChange = renderDSHocSinhChange
vueData.exportExcel = exportExcel
vueData.exportThuKhen = exportThuKhen
vueData.exportGiayKhen = exportGiayKhen
vueData.onSave_KT = onSave_KT