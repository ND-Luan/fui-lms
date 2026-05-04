function renderDSKhoi() {
    vueData.DSKhoi = Array.from({ length: 12 }, (_, i) => {
        const khoi = i + 1;
        const capid = khoi <= 5 ? 1 : khoi <= 9 ? 2 : 3;
        return { title: `Khối ${khoi}`, value: khoi, CapID: capid };
    }).filter(x => x.CapID === parseInt(vueData.capid));
}
async function convertDSHocSinh() {
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
    let SLCotDiem_OfFirstSTD = vueData.DSCotDiem.filter((item) => item.HocSinhID === vueData.DSHocSinh[0].HocSinhID) // lấy ra các cột điểm của học sinh đầu tiên
    // DSCotDiem_ByMaNhomCotDiem = SLCotDiem_OfFirstSTD
    DSCotDiem_ByMaNhomCotDiem = vueData.DSNhomDiem
    const uniqueNhomDiem = [...new Set(DSCotDiem_ByMaNhomCotDiem.sort((a, b) => a.ThuTuNhom - b.ThuTuNhom).map(x => x.MaNhomCotDiem))]
    let newDSCotDiem_ByMaNhomCotDiem = []
    for (var nhomDiem of uniqueNhomDiem) {
        const NhomDiemFilter = DSCotDiem_ByMaNhomCotDiem.filter(x => x.MaNhomCotDiem === nhomDiem)
        NhomDiemFilter.sort((a, b) => a.ThuTuCotDiem - b.ThuTuCotDiem)
        newDSCotDiem_ByMaNhomCotDiem.push(NhomDiemFilter)
    }
    newDSCotDiem_ByMaNhomCotDiem = newDSCotDiem_ByMaNhomCotDiem.flat()
    const DSNhomDiem = []
    for (var nhomDiem of uniqueNhomDiem) {
        const DSNhomDiemFilter = newDSCotDiem_ByMaNhomCotDiem.filter(x => x.MaNhomCotDiem === nhomDiem)
        DSNhomDiem.push({
            title: DSNhomDiemFilter[0].TenNhomCotDiem_VI,
            colspan: DSNhomDiemFilter.length,
            MaNhom: DSNhomDiemFilter[0].MaNhomCotDiem
        })
    }
    vueData.DSNhomDiem = DSNhomDiem
    vueData.DSNhomDiemFilter = DSNhomDiem
    //Xử lý động cột điểm header jexcel
    let columnsCotDiem = newDSCotDiem_ByMaNhomCotDiem
        .map((x) => {
            if (x.GiaTriCotDiem === 'number') { // cấu hình header cột điểm có dạng number
                let column = {
                    type: 'numeric',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    typeValue: x.GiaTriCotDiem,
                    width: x.WidthCSS,
                    autoWidth: true,
                    decimal: '.',
                    mask: '0.00',
                    backGroundColor: x.HexBackground,
                    wrapText: true,
                    readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'text',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    autoWidth: true,
                    typeValue: x.GiaTriCotDiem,
                    width: this.calculateColumnWidth(x.TenCotDiem_VI),
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'Dropdown_text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: [{ id: '1', name: 'Done' }, { id: '0', name: 'Not Yet' }], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'html',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    autoWidth: true,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'Dropdown_text') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: [{ id: '1', name: 'Done' }, { id: '0', name: 'Not Yet' }], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'Dropdown_THC') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: ['T', 'H', 'C'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'Dropdown_TDC') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: ['T', 'Đ', 'C'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: true
                }
                return column
            }
            else if (x.GiaTriCotDiem === 'Dropdown_CD_D') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: ['CĐ', 'Đ'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: true
                }
                return column
            }
        })
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
    headers = [...columnThongTinHocSinh, ...columnsCotDiem]
    //Xử lý data jexcel
    const dataJexcel = []
    let indexRow = 1
    //xử lý học sinh gắn vô excel
    for (var hocSinh of vueData.DSHocSinh) {
        const arrCotDiemExist = vueData.DSCotDiem.filter((x) => x.HocSinhID === hocSinh.HocSinhID) // Lấy danh sách điểm của học sinh
        if (arrCotDiemExist.length === 0) return
        let obj = {
            HocSinhID: arrCotDiemExist[0].HocSinhID,
            HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
            SoDanhBo: arrCotDiemExist[0].SoDanhBo,
        }
        const newArr = []
        const newArrCotDiemExist = arrCotDiemExist.sort((a, b) => a.ThuTuNhom - b.ThuTuNhom)
        for (var item of vueData.DSNhomDiem_HocSinh) {
            const obj = newArrCotDiemExist.find(x => x.MaCotDiem === item.MaCotDiem)
            if (obj) newArr.push(obj)
            else newArr.push({ ...hocSinh, ...item })
        }
        for (var cotDiemExist of newArr.sort((a, b) => a.ThuTuNhom - b.ThuTuNhom)) {
            if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
                let giaTri = null
                if (cotDiemExist.GiaTriCotDiem === 'number') {
                    if (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null) {
                        giaTri = null
                    } else {
                        giaTri = parseFloat(cotDiemExist?.KetQuaDanhGia_VI)
                    }
                } else {
                    if (cotDiemExist?.KetQuaDanhGia_VI) {
                        giaTri = cotDiemExist?.KetQuaDanhGia_VI
                    } else {
                        giaTri = null
                    }
                }
                //Text
                obj[cotDiemExist.MaCotDiem] = _.isNaN(giaTri) ? null : giaTri
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && arrCotDiemExist.length === 1) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
                //Công thức
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0) //'=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
                //Ngôi sao
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0) //`=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)})`
            } else {
                obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI ?? ''
            }
        }
        indexRow++
        dataJexcel.push(obj)
    }
    const firstStudent = dataJexcel[0]
    const dsCotDiem = vueData.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
    vueData.styleSheet = {}
    vueData.comments = {}
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+2) là địa chỉ cột điểm đầu tiên, i là row let
            if (dsCotDiem[j].HexBackground) {
                vueData.styleSheet[cellAdresss] = `background-color: ${dsCotDiem[j].HexBackground ?? 'unset'};`
            }
        }
    }
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
            const obj = vueData.DSCotDiem.find(x => x.HocSinhID === dataJexcel[i].HocSinhID && x.MaCotDiem === dsCotDiem[j].MaCotDiem && x.Is_Comment)
            if (obj) {
                vueData.styleSheet[cellAdresss] = 'color: red;'
                vueData.comments[cellAdresss] = 'Cột điểm do ' + dsCotDiem[j].NhapDiemUser + ' đã nhập'
            }
        }
    }
    vueData.MaNhomCotDiem = [...new Set(DSCotDiem_ByMaNhomCotDiem.map(item => item.MaNhomCotDiem))]
    vueData.Columns = headers.map(item => item.name)
    vueData.headers = headers
    vueData.dataJexcel = dataJexcel
    vueData.MaNhomCotDiemSelected = vueData.MaNhomCotDiem
    console.log("vueData.Columns", vueData.Columns)
    console.log("vueData.MaNhomCotDiemSelected", vueData.MaNhomCotDiemSelected)
    console.log("vueData.DSCotDiem_ByMaNhomCotDiem", DSCotDiem_ByMaNhomCotDiem)
    let ColumnsFiltered = []
    if ([5, 46, 76].includes(vueData.MonHocItem?.MonHocID)) {
        ColumnsFiltered = vueData.Columns.filter(item =>
            vueData.MaNhomCotDiemSelected.some(el =>
                item.includes(el)
                || (item).includes(el.split('_')[0] + el.split('_')[1])
                || ['HocSinhID', 'HoVaTenHocSinh', 'SoDanhBo'].includes(item)
            ));
    } else {
        ColumnsFiltered = vueData.Columns
    }
    console.log("Columns", vueData.Columns)
    console.log("ColumnsFiltered", vueData.ColumnsFiltered)
    vueData.ColumnsSelected = ColumnsFiltered;
    let BindingData = vueData.handleShowColumn(vueData.ColumnsSelected, vueData.headers, vueData.dataJexcel)
    console.log("BindingData", BindingData)
    vueData.columnHeader = BindingData.columns
    vueData.DSHocSinh = BindingData.data
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
    vueData.keyComp++
}
function changeMaNhomCotDiem() {
    vueData.ColumnsFiltered = vueData.Columns.filter(item => vueData.MaNhomCotDiemSelected.some(el => item.includes(el) || (item).includes(el.split('_')[0] + el.split('_')[1]) || ['HocSinhID', 'HoVaTenHocSinh', 'SoDanhBo'].includes(item)));
    ReloadFilterData()
}
function handleShowColumn(ColumnsFiltered, headers, dataJexcel) {
    let columns = []
    let data = []
    columns = headers.filter(item => ColumnsFiltered.some(el => item.name == el))
    data = dataJexcel.map(item => {
        const filtered = Object.fromEntries(
            Object.entries(item).filter(([key]) => ColumnsFiltered.includes(key))
        );
        return filtered
    })
    return { columns, data }
}
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}
function exportExcel() {
    // 1. Dữ liệu mẫu (mảng object)
    const rawData = vueData.DSHocSinh
    // 2. Định nghĩa header nhóm (dòng 1) và header cột (dòng 2)
    const headerRow1 = [
        "Thông tin học sinh", null, null,
        "Theme 1", null, null, null, null, null, null, null, null, null,
        "Theme 2", null, null, null, null, null, null, null, null, null,
        "Giữa HK1", null, null, null, null, null, null, null, null, null, null, null,
        "Điểm TA2 Giữa HK1", null, null, null, null, null, null, null, null, null, null,
        "Quy đổi IELTS Giữa HK1", null, null, null, null,
        "Theme 3", null, null, null, null, null, null, null, null, null,
        "Theme 4", null, null, null, null, null, null, null, null, null,
        "Cuối HK1", null, null, null, null, null, null, null, null, null, null, null,
        "Cuối TA2 HK1", null, null, null, null, null, null, null, null, null, null,
        "Quy đổi IELTS Cuối HK1", null, null, null, null,
        "Theme 5", null, null, null, null, null, null, null, null, null,
        "Theme 6", null, null, null, null, null, null, null, null, null,
        "Giữa HK2", null, null, null, null, null, null, null, null, null, null, null,
        "Giữa TA2 HK2", null, null, null, null, null, null, null, null, null, null,
        "Quy đổi IELTS Giữa HK2", null, null, null, null,
        "Theme 7", null, null, null, null, null, null, null, null, null,
        "Theme 8", null, null, null, null, null, null, null, null, null,
        "Cuối HK2", null, null, null, null, null, null, null, null, null, null, null,
        "Cuối TA2 HK2", null, null, null, null, null, null, null, null, null, null,
        "Quy đổi IELTS Cuối HK2", null, null, null, null,
        "Điểm trung bình"
    ]
    const headerRow2 = vueData.columnHeader.filter(item => item.title != 'STT' && item.title != 'HSLopID' && item.title != 'Điểm TB HK1' && item.title != 'Điểm TB HK2').map(item => item.title)
    // 3. Đặt thứ tự key để đảm bảo map đúng cột theo headerRow2
    const keys = vueData.columnHeader.filter(item => item.title != 'STT' && item.title != 'HSLopID' && item.title != 'Điểm TB HK1' && item.title != 'Điểm TB HK2').map(item => item.name)
    //     "TenLop",
    //     "SoDanhBo",
    //     "HoTen",
    //     "NgaySinh",
    //     "Phai",
    //     "TVM",
    //     "TVD",
    //     "TOM",
    //     "TOD",
    //     "NNM",
    //     "NND",
    //     "SDM",
    //     "SDD",
    //     "KHM",
    //     "KHD",
    //     "THM",
    //     "THD",
    //     "CNM",
    //     "CND",
    //     "DDM",
    //     "TDM",
    //     "ANM",
    //     "MTM",
    //     "KTM",
    //     "DTM",
    //     "NL1",
    //     "NL2",
    //     "NL3",
    //     "NL4",
    //     "NL5",
    //     "NL6",
    //     "NL7",
    //     "NL8",
    //     "NL9",
    //     "NL10",
    //     "PC1",
    //     "PC2",
    //     "PC3",
    //     "PC4",
    //     "PC5",
    //     "HoanThanhXuatSac",
    //     "HoanThanhTot",
    //     "HoanThanh",
    //     "ChuaHoanThanh",
    //     "KTCN",
    //     "KTDX",
    //     "ChuaLenLop",
    //     "DanhGia",
    //     "DanhHieu",
    //     "KhenThuong",
    //     "PhanLoai_TuyenThang",
    //     "Flyers",
    //     "DiemTA",
    //     "DKHocTiep",
    //     "PhoiHopCMHS",
    //     "NhanXetGVCN_VePhuHuynh_HTML",
    //     "NhanXetGVCN_VeHocSinh_HTML",
    //     "DeXuat_NDCamKet"
    // ]
    // 4. Chuyển rawData thành mảng 2 chiều
    const dataRows = rawData.map(item =>
        keys.map(k => item[k] != null ? item[k] : "")
    )
    console.log('dataRows', dataRows)
    // 5. Gom lại AOA (array of arrays)
    const aoa = [
        headerRow1,
        headerRow2,
        ...dataRows
    ]
    // 6. Tạo worksheet từ AOA và thiết lập merge
    const worksheet = XLSX.utils.aoa_to_sheet(aoa)
    worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 0, c: 3 }, e: { r: 0, c: 12 } },
        { s: { r: 0, c: 13 }, e: { r: 0, c: 22 } },
        { s: { r: 0, c: 23 }, e: { r: 0, c: 34 } },
        { s: { r: 0, c: 35 }, e: { r: 0, c: 45 } },
        { s: { r: 0, c: 46 }, e: { r: 0, c: 50 } },
        { s: { r: 0, c: 51 }, e: { r: 0, c: 60 } },
        { s: { r: 0, c: 61 }, e: { r: 0, c: 70 } },
        { s: { r: 0, c: 71 }, e: { r: 0, c: 82 } },
        { s: { r: 0, c: 83 }, e: { r: 0, c: 93 } },
        { s: { r: 0, c: 94 }, e: { r: 0, c: 98 } },
        { s: { r: 0, c: 99 }, e: { r: 0, c: 108 } },
        { s: { r: 0, c: 109 }, e: { r: 0, c: 118 } },
        { s: { r: 0, c: 119 }, e: { r: 0, c: 130 } },
        { s: { r: 0, c: 131 }, e: { r: 0, c: 141 } },
        { s: { r: 0, c: 142 }, e: { r: 0, c: 144 } },
        { s: { r: 0, c: 147 }, e: { r: 0, c: 156 } },
        { s: { r: 0, c: 157 }, e: { r: 0, c: 166 } },
        { s: { r: 0, c: 167 }, e: { r: 0, c: 178 } },
        { s: { r: 0, c: 179 }, e: { r: 0, c: 189 } },
        { s: { r: 0, c: 190 }, e: { r: 0, c: 194 } },
        { s: { r: 0, c: 195 }, e: { r: 0, c: 195 } }
    ]
    // 7. Tạo workbook, append sheet và ghi file
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "TongBangDiemQuaTrinh")
    XLSX.writeFile(workbook, "TongBangDiemQuaTrinh.xlsx")
}
vueData.exportExcel = exportExcel
function buildMergeRanges(lengths, startRow = 0, startCol = 0) {
    const result = [];
    let col = startCol;
    for (let len of lengths) {
        result.push({
            s: { r: startRow, c: col },
            e: { r: startRow, c: col + len - 1 }
        });
        col += len;
    }
    return result;
}
async function ReloadFilterData() {
    //Chỉ xử lý reload khi là các môn ngoại ngữ
    if (![5, 46, 76].includes(vueData.MonHocItem?.MonHocID)) return
    console.log('reload...')
    let ColumnsGet = vueData.ColumnsFiltered.filter(item => vueData.ColumnsSelected.includes(item))
    let BindingData = await vueData.handleShowColumn(ColumnsGet, vueData.headers, vueData.dataJexcel)
    vueData.columnHeader = BindingData.columns
    vueData.DSHocSinh = BindingData.data
    vueData.keyComp++
}
vueData.handleShowColumn = handleShowColumn
vueData.ReloadFilterData = ReloadFilterData
vueData.changeMaNhomCotDiem = changeMaNhomCotDiem