function exportExcel() {
    // 1. Dữ liệu mẫu (mảng object)
    const rawData = vueData.DSHocSinhQLD
    // 2. Định nghĩa header nhóm (dòng 1) và header cột (dòng 2)
    const headerRow1 = [
        "SỐ LƯỢNG", null, null,
        "ĐG KẾT QUẢ GIÁO DỤC", null, null, null,
        "KT Trường", null, null,
        "KT Lớp",
        "Tỉ lệ - KT Trường", null,
        "Tỉ lệ - KT Lớp"
    ]
    const headerRow2 = [
        "Tên lớp",
        "Tổng số",
        "Tổng số nữ",
        "Hoàn thành xuất sắc",
        "Hoàn thành tốt",
        "Hoàn thành",
        "Chưa hoàn thành",
        "Học sinh xuất sắc",
        "Học sinh tiêu biểu",
        "Thành tích khác",
        "Thư khen",
        "Học sinh xuất sắc",
        "Học sinh tiêu biểu",
        "Thư khen"
    ]
    // 3. Đặt thứ tự key để đảm bảo map đúng cột theo headerRow2
    const keys = [
        "TenLop",
        "TongSo",
        "TongSoNu",
        "DG_HoanThanhXuatSac",
        "DG_HoanThanhTot",
        "DG_HoanThanh",
        "DG_ChuaHoanThanh",
        "KT_Truong_XuatSac",
        "KT_Truong_TieuBieu",
        "ThanhTichKhac",
        "KT_ThuKhen",
        "TiLe_KT_Truong_XuatSac",
        "TiLe_KT_Truong_TieuBieu",
        "TiLe_KT_ThuKhen"
    ]
    // 4. Chuyển rawData thành mảng 2 chiều
    const dataRows = rawData.map(item =>
        keys.map(k => item[k] != null ? item[k] : "")
    )
    // 5. Gom lại AOA (array of arrays)
    const aoa = [
        headerRow1,
        headerRow2,
        ...dataRows
    ]
    // 6. Tạo worksheet từ AOA và thiết lập merge
    const worksheet = XLSX.utils.aoa_to_sheet(aoa)
    worksheet['!merges'] = [
        // Merge SỐ LƯỢNG (A1:C1)
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        // Merge ĐG KẾT QUẢ GIÁO DỤC (D1:G1)
        { s: { r: 0, c: 3 }, e: { r: 0, c: 6 } },
        // Merge KT Trường (H1:I1)
        { s: { r: 0, c: 7 }, e: { r: 0, c: 9 } },
        { s: { r: 0, c: 10 }, e: { r: 0, c: 10 } },
        { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } },
        { s: { r: 0, c: 13 }, e: { r: 0, c: 13 } },
    ]
    // 7. Tạo workbook, append sheet và ghi file
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "KhenThuong")
    XLSX.writeFile(workbook, "DanhSachKhenThuong.xlsx")
}
function getDiemTheoLop_QLD() {
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
        //Nếu có dữ liệuu
        if (objHocSinh.KT_Truong_XuatSac == 'x' || objHocSinh_KhenThuong.HocSinhTieuBieu) {
            ThuKhen = ''
        }
        if (objHocSinh) _dsHocSinh.push({
            STT: objHocSinh.STT,
            TenLop: objHocSinh?.TenLop ?? '',
            HocSinhID: objHocSinh.HocSinhID,
            HoTen: objHocSinh.HoTen,
            NgaySinh: objHocSinh.NgaySinh,
            Phai: objHocSinh.Phai,
            HoanThanhXuatSac: objHocSinh.HoanThanhXuatSac,
            HoanThanhTot: objHocSinh.HoanThanhTot,
            HoanThanh: objHocSinh.HoanThanh,
            ChuaHoanThanh: objHocSinh.ChuaHoanThanh,
            KT_Truong_XuatSac: objHocSinh.KT_Truong_XuatSac,
            KT_Truong_TieuBieu: objHocSinh_KhenThuong.HocSinhTieuBieu ? 'x' : '',
            ThuKhen: ThuKhen,
            ThanhTichKhac: objHocSinh_KhenThuong?.ThanhTichKhac,
        })
    }
    console.log('_dsHocSinh', _dsHocSinh.filter(x => x.TenLop === '01A'))
    const groupHocSinh = []
    const uniqueTenLop = [... new Set(_dsHocSinh.map(x => x.TenLop))]
    for (var tenLop of uniqueTenLop) {
        const obj = {}
        const arrHocSinh_Lop = _dsHocSinh.filter(x => x.TenLop === tenLop)
        const TongSo = arrHocSinh_Lop.length
        const TongSoNu = arrHocSinh_Lop.filter(x => x.Phai === 'x').length //Nữ
        const HoanThanhXuatSac = arrHocSinh_Lop.filter(x => x.HoanThanhXuatSac === 'x').length
        const HoanThanhTot = arrHocSinh_Lop.filter(x => x.HoanThanhTot === 'x').length
        const HoanThanh = arrHocSinh_Lop.filter(x => x.HoanThanh === 'x').length
        const ChuaHoanThanh = arrHocSinh_Lop.filter(x => x.ChuaHoanThanh === 'x').length
        const KT_Truong_XuatSac = arrHocSinh_Lop.filter(x => x.KT_Truong_XuatSac === 'x').length
        const KT_Truong_TieuBieu = arrHocSinh_Lop.filter(x => x.KT_Truong_TieuBieu === 'x').length
        const ThanhTichKhac = arrHocSinh_Lop.filter(x => x.ThanhTichKhac).length
        console.log(ThanhTichKhac, arrHocSinh_Lop)
        const KT_ThuKhen = arrHocSinh_Lop.filter(x => x.ThuKhen === 'x').length
        obj.TenLop = tenLop
        obj.TongSo = TongSo
        obj.TongSoNu = TongSoNu
        obj.DG_HoanThanhXuatSac = HoanThanhXuatSac
        obj.DG_HoanThanhTot = HoanThanhTot
        obj.DG_HoanThanh = HoanThanh
        obj.DG_ChuaHoanThanh = ChuaHoanThanh
        obj.KT_Truong_XuatSac = KT_Truong_XuatSac
        obj.KT_Truong_TieuBieu = KT_Truong_TieuBieu
        obj.ThanhTichKhac = ThanhTichKhac
        obj.KT_ThuKhen = KT_ThuKhen
        const sumKT_Truong = KT_Truong_XuatSac + KT_Truong_TieuBieu + KT_ThuKhen
        obj.TiLe_KT_Truong_XuatSac = parseFloat((KT_Truong_XuatSac / sumKT_Truong) * 100).toFixed(2)
        obj.TiLe_KT_Truong_TieuBieu = parseFloat((KT_Truong_TieuBieu / sumKT_Truong) * 100).toFixed(2)
        const calc_ThanhTichKhac = parseFloat((ThanhTichKhac / ThanhTichKhac) * 100).toFixed(2)
        // console.log('calc_ThanhTichKhac', calc_ThanhTichKhac)
        // obj.TiLe_ThanhTichKhac = calc_ThanhTichKhac === 'NaN' ? 0.00 : calc_ThanhTichKhac
        obj.TiLe_KT_ThuKhen = parseFloat((KT_ThuKhen / sumKT_Truong) * 100).toFixed(2)
        groupHocSinh.push(obj)
    }
    handleHeaders()
    vueData.DSHocSinhQLD = groupHocSinh
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
    vueData.nestedHeaders = [
        [
            { title: 'SỐ LƯỢNG', colspan: 3 },
            { title: 'ĐG KẾT QUẢ GIÁO DỤC', colspan: 4 },
            { title: 'KT Trường', colspan: 3 },
            { title: 'KT Lớp', colspan: 1 },
            { title: 'Tỉ lệ - KT Trường', colspan: 2 }, //3
            { title: 'Tỉ lệ - KT Lớp', colspan: 1 },
        ],
    ];
    let headerDefault = [
        "TenLop",
        "TongSo",
        "TongSoNu",
        "DG_HoanThanhXuatSac",
        "DG_HoanThanhTot",
        "DG_HoanThanh",
        "DG_ChuaHoanThanh",
        "KT_Truong_XuatSac",
        "KT_Truong_TieuBieu",
        "ThanhTichKhac",
        "KT_ThuKhen",
        "TiLe_KT_Truong_XuatSac",
        "TiLe_KT_Truong_TieuBieu",
        // "TiLe_ThanhTichKhac",
        "TiLe_KT_ThuKhen",
    ]
    const DG_KQGD = {
        DG_HoanThanhXuatSac: { width: 150, title: "Hoàn thành xuất sắc" },
        DG_HoanThanhTot: { width: 120, title: "Hoàn thành tốt" },
        DG_HoanThanh: { width: 120, title: "Hoàn thành" },
        DG_ChuaHoanThanh: { width: 150, title: "Chưa hoàn thành" },
    }
    const KT_TruongMapping = {
        KT_Truong_XuatSac: { width: 150, title: "Học sinh xuất sắc" },
        KT_Truong_TieuBieu: { width: 150, title: "Học sinh tiêu biểu" },
        ThanhTichKhac: { width: 150, title: "Thành tích khác" },
    }
    const KT_ThuKhenMapping = {
        KT_ThuKhen: { width: 150, title: "Thư khen" },
    }
    const TiLe_KT_TruongMapping = {
        TiLe_KT_Truong_XuatSac: { width: 150, title: "Học sinh xuất sắc" },
        TiLe_KT_Truong_TieuBieu: { width: 150, title: "Học sinh tiêu biểu" },
        // TiLe_ThanhTichKhac: { width: 150, title: "Thành tích khác" },
    }
    const Tile_KT_ThuKhenMapping = {
        TiLe_KT_ThuKhen: { width: 150, title: "Thư khen" },
    }
    let columnThongTinHocSinh = []
    const columnMapping = {
        TenLop: { width: 60, title: "Tên lớp" },
        TongSo: { width: 100, title: "Tổng số" },
        TongSoNu: { width: 100, title: "Tổng số nữ" },
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
            ...DG_KQGD[key],
            ...KT_TruongMapping[key],
            ...KT_ThuKhenMapping[key],
            ...TiLe_KT_TruongMapping[key],
            ...Tile_KT_ThuKhenMapping[key]
        };
        if (DG_KQGD[key]) {
            column.title = DG_KQGD[key].title
        }
        if (KT_TruongMapping[key]) {
            column.title = KT_TruongMapping[key].title
        }
        if (KT_ThuKhenMapping[key]) {
            column.title = KT_ThuKhenMapping[key].title
        }
        console.log(key, TiLe_KT_TruongMapping[key])
        if (TiLe_KT_TruongMapping[key]) {
            column.title = TiLe_KT_TruongMapping[key].title
        }
        if (Tile_KT_ThuKhenMapping[key]) {
            column.title = Tile_KT_ThuKhenMapping[key].title
        }
        columnThongTinHocSinh.push(column)
    }
    vueData.columnHeader = columnThongTinHocSinh
    console.log('columns', vueData.columnHeader)
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
vueData.initSpread = initSpread
vueData.getDiemTheoLop_QLD = getDiemTheoLop_QLD
vueData.renderDSHocSinhChange = renderDSHocSinhChange
vueData.exportExcel = exportExcel