const page = {
    isError: false,
    process: processBeforePushAPI
}
function validateSave(typeCell, value, min, max) {
    if (value == null || value == '') return 0
    if (typeCell === 'number' && (value < min || value > max)) return 1
    else return 0
}
function onChangeSheet(options) {
    setTimeout(() => {
        process(options)
    }, 0)
}
function process({ instance, cell, x, y, value, dataObjects }) {
    const cellName = instance.getValueFromCoords(x, y);
    console.log("cellName", cellName)
    // Nếu ô này chưa có trong danh sách thì thêm vào
    if (!vueData.editedCells.some(c => c.x === x && c.y === y)) {
        vueData.editedCells.push({ x, y, cellName, value });
    } else {
        // Nếu đã có, thì cập nhật lại giá trị mới
        const index = vueData.editedCells.findIndex(c => c.x === x && c.y === y);
        vueData.editedCells[index].value = value;
    }
    // vueData.DSHocSinh = dataObjects
    // console.log("dataObjects", dataObjects)
}
function isGetResultTopic(cotDiem) {
    return (vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('DiemGK_') || vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('DiemCK_'))
        && (!cotDiem.MaCotDiem.includes('DiemGK_') || !cotDiem.MaCotDiem.includes('DiemCK_'))
}
async function getKhoi() {
    vueData.KhoiID = null
    vueData.LopID = null
    vueData.MonHocItem = null
    vueData.MaNhomCotDiemItem = null
    vueData.DSHocSinh = []
    vueData.editedCells = []
    vueData.dataBeforeInsertToDB = []
    vueData.DSKhoi = await ajaxCALLPromise("lms/KhoiHocByCapHoc_Get", { CapID: vueData.CapID })
}
async function getLop() {
    vueData.LopID = null
    vueData.MonHocItem = null
    vueData.MaNhomCotDiemItem = null
    vueData.DSHocSinh = []
    vueData.editedCells = []
    vueData.dataBeforeInsertToDB = []
    vueData.DSLop = await ajaxCALLPromise("lms/Lop_Get_ByKhoiID", { KhoiID: vueData.KhoiID, NienKhoa: vueData.NienKhoa })
}
async function getMonHoc() {
    vueData.MonHocItem = null
    vueData.MaNhomCotDiemItem = null
    vueData.DSHocSinh = []
    vueData.editedCells = []
    vueData.dataBeforeInsertToDB = []
    vueData.DSMonHoc = await ajaxCALLPromise("lms/MonHoc_Get_ByLopID", { LopID: vueData.LopID, NienKhoa: vueData.NienKhoa })
}
async function getMaNhomCotDiem() {
    vueData.MaNhomCotDiemItem = null
    vueData.DSHocSinh = []
    vueData.editedCells = []
    vueData.dataBeforeInsertToDB = []
    vueData.DSMaNhomCotDiem = await ajaxCALLPromise("lms/NhomCauTrucDiem_Get_ByTemplateBangDiemID", { TemplateBangDiemID: vueData.MonHocItem.TemplateBangDiemID, NienKhoa: vueData.NienKhoa })
}
async function getHocSinhBangDiem() {
    vueData.DSHocSinh = []
    vueData.editedCells = []
    vueData.dataBeforeInsertToDB = []
    vueData.DSCotDiem = await ajaxCALLPromise("lms/HocSinhBangDiem_Get_ByMonHocID_MaNhom", {
        LopID: vueData.LopID,
        MonHocID: vueData.MonHocItem.MonHocID,
        TemplateBangDiemID: vueData.MonHocItem.TemplateBangDiemID,
        MaNhomCotDiem: vueData.MaNhomCotDiemItem.MaNhomCotDiem,
    })
    vueData.TinhTrang = fn_IsDisabledTinhTrangDiem({
        TinhTrang: fn_ProrityTinhTrang(vueData.DSCotDiem).TinhTrang,
        type: "GV",
        CapID: vueData.CapID
    })
    convertDSHocSinh()
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
    let DSMaNhomCotDiem = [...new Set(vueData.DSCotDiem.map(x => x.MaNhomCotDiem))]
    let nestedHeader = [
        [{
            title: 'Thông tin học sinh',
            colspan: 4
        }]
    ]
    for (item of DSMaNhomCotDiem) {
        nestedHeader[0].push(
            {
                title: DSCotDiem_ByMaNhomCotDiem.find(item1 => item1.MaNhomCotDiem == item).TenNhomCotDiem_VI,
                colspan: DSCotDiem_ByMaNhomCotDiem.filter(item1 => item1.MaNhomCotDiem == item).length
            }
        )
    }
    vueData.nestedHeader = nestedHeader
    //Xử lý động cột điểm header jexcel
    const arrCotDiemWithAlignCenter = [
        'MucDoDanhGia',
        'DiemGK_HK2',
        'DiemGK_HK1',
        'DiemGK_HK2',
        'DiemCK_HK1',
        'Theme1_Result',
        'Theme2_Result',
        'Theme3_Result',
        'Theme4_Result',
        'Theme5_Result',
        'Theme6_Result',
        'Theme7_Result',
        'Theme8_Result'
    ]
    const ListMonHoc = [5, 46, 76]
    const isDisabled = !vueData.TinhTrang.isDisabled
    let columnsCotDiem = SLCotDiem_OfFirstSTD
        .map((x) => {
            if (x.GiaTriCotDiem === 'number') { // cấu hình header cột điểm có dạng number
                let column = {
                    type: 'numeric',
                    title: ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? x.TenCotDiem_EN : x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    typeValue: x.GiaTriCotDiem,
                    autoWidth: true,
                    decimal: '.',
                    // mask: '0.0',
                    backGroundColor: x.HexBackground,
                    width: x.WidthCSS,
                    wrapText: true,
                    readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
                    align: 'center'
                }
                return column
            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'text',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    width: x.WidthCSS,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: arrCotDiemWithAlignCenter.some(item => x.MaCotDiem.includes(item)) ? 'center' : 'left',
                    readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
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
                    // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            }
            else if (x.GiaTriCotDiem === 'Dropdown_text') { // cấu hình header cột điểm có dạng ICO_Star
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
                    readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'Dropdown_THC') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: ['T', 'H', 'C'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'Dropdown_TDC') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: ['T', 'Đ', 'C'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
                }
                return column
            }
            else if (x.GiaTriCotDiem === 'Dropdown_CD_D') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'dropdown',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: ['CĐ', 'Đ'], //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    readOnly: x.LoaiCotDiem === 'Công thức' || isDisabled ? true : false,
                }
                return column
            }
        })
    //Nếu là gửi điểm thì freezecolumn = 4 để thêm cột từ chối
    if (vueData.MonHocItem.MonHocID == 5 || vueData.MonHocItem.MonHocID == 46) {
        vueData.freezeColumns = ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? 4 : 3
    }
    else if (vueData.MonHocItem.MonHocID == 76) {
        vueData.freezeColumns = ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? 5 : 3
    }
    else if (vueData.MonHocItem.MonHocID == 101) {
        vueData.freezeColumns = 4
    }
    let columnThongTinHocSinh = [
        {
            type: 'text',
            title: 'Mã học sinh',
            name: 'HocSinhID',
            width: 100,
            backGroundColor: null,
            wrap: true,
            readOnly: true
        },
        {
            type: 'text',
            title: 'Số Danh Bộ',
            name: 'SoDanhBo',
            width: 100,
            backGroundColor: null,
            wrap: true,
            readOnly: true
        },
        {
            type: 'text',
            title: 'Họ tên học sinh',
            name: 'HoVaTenHocSinh',
            width: 200,
            backGroundColor: null,
            wrap: true,
            align: "left",
            readOnly: true
        },
    ]
    const ListDSMonHocNhom = [101, 76]
    if (ListDSMonHocNhom.includes(vueData.MonHocItem.MonHocID)) {
        columnThongTinHocSinh.push(
            {
                type: 'text',
                title: 'Lớp chủ nhiệm',
                name: 'TenLop',
                width: 70,
                backGroundColor: null,
                wrap: true,
                align: "left",
                readOnly: true
            })
    }
    if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) {
        columnThongTinHocSinh.push({
            type: 'text',
            title: 'English Name',
            name: 'EnglishName',
            width: 100,
            backGroundColor: null,
            wrap: true,
            align: "left",
            readOnly: true
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
        if (ListDSMonHocNhom.includes(vueData.MonHocItem.MonHocID)) obj.TenLop = arrCotDiemExist[0].TenLop
        if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) obj.EnglishName = arrCotDiemExist[0].EnglishName;
        if (vueData.MonHocItem.MonHocID === 76) obj.TenLop = arrCotDiemExist[0]?.TenLop ?? '';
        //Xử lý nếu từ chối từ bên Tổ trưởng
        for (var cotDiemExist of arrCotDiemExist) {
            if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
                //Text
                obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (
                    (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null) ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)
                ) : cotDiemExist.KetQuaDanhGia_VI
                //Set default giá trị nếu cột điểm Mức độ đánhg giá null hoặc rỗng
                if (cotDiemExist.MaCotDiem.includes('MucDoDanhGia') && cotDiemExist.KQHTID === 0) {
                    if (obj[cotDiemExist.MaCotDiem] === null || obj[cotDiemExist.MaCotDiem] === '') obj[cotDiemExist.MaCotDiem] = 'T'
                }
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && (vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK1' || vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK2') && (cotDiemExist.MaCotDiem !== 'DiemTBCK_HK1' && cotDiemExist.MaCotDiem !== 'DiemTBCK_HK2' && !cotDiemExist.MaCotDiem.includes('DanhHieu'))) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
            }
            //Có sử dụng hàm isGetResultTopic => chỉ dùng cho các môn tiếng Anh
            else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && isGetResultTopic(cotDiemExist) && ListMonHoc.includes(vueData.MonHocItem.MonHocID)) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && arrCotDiemExist.length === 1) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
                //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow, vueData.freezeColumns)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'text') {
                //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow, vueData.freezeColumns)
            }
            else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
                //Ngôi sao
                //obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula.replace(/IIF/g, 'IF'), indexRow)})`
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0)
            }
        }
        indexRow++
        dataJexcel.push(obj)
    }
    //BEGIN CREATE EXCEL
    vueData.DataExcel = []
    let indexRow1 = 2
    for (var hocSinh of vueData.DSHocSinh) {
        const arrCotDiemExist = vueData.DSCotDiem.filter((x) => x.HocSinhID === hocSinh.HocSinhID) // Lấy danh sách điểm của học sinh
        if (arrCotDiemExist.length === 0) return
        let obj = {
            HocSinhID: arrCotDiemExist[0].HocSinhID,
            HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
            SoDanhBo: arrCotDiemExist[0].SoDanhBo
        }
        if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) obj.EnglishName = arrCotDiemExist[0].EnglishName;
        if (vueData.MonHocItem.MonHocID === 76) obj.TenLop = arrCotDiemExist[0]?.TenLop ?? '';
        //Xử lý nếu từ chối từ bên Tổ trưởng
        for (var cotDiemExist of arrCotDiemExist) {
            if (cotDiemExist.LoaiCotDiem !== 'Công thức') {
                //Text
                obj[cotDiemExist.MaCotDiem] = cotDiemExist.GiaTriCotDiem === 'number' ? (
                    (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null) ? null : parseFloat(cotDiemExist.KetQuaDanhGia_VI)
                ) : cotDiemExist.KetQuaDanhGia_VI
                //Set default giá trị nếu cột điểm Mức độ đánhg giá null hoặc rỗng
                if (cotDiemExist.MaCotDiem.includes('MucDoDanhGia') && cotDiemExist.KQHTID === 0) {
                    if (obj[cotDiemExist.MaCotDiem] === null || obj[cotDiemExist.MaCotDiem] === '') obj[cotDiemExist.MaCotDiem] = 'T'
                }
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && (vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK1' || vueData.MaNhomCotDiemItem.MaNhomCotDiem == 'DiemTBCK_HK2') && (cotDiemExist.MaCotDiem !== 'DiemTBCK_HK1' && cotDiemExist.MaCotDiem !== 'DiemTBCK_HK2' && !cotDiemExist.MaCotDiem.includes('DanhHieu'))) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
            }
            else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && isGetResultTopic(cotDiemExist) && ListMonHoc.includes(vueData.MonHocItem.MonHocID)) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = cotDiemExist?.KetQuaDanhGia_VI
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && arrCotDiemExist.length === 1) {
                //dùng cho formula để hiển thị
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist?.KetQuaDanhGia_VI ?? 0)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'number') {
                //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow1, vueData.freezeColumns)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'text') {
                //Công thức // parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0) //
                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow1, vueData.freezeColumns)
            }
            else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
                //Ngôi sao
                //obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula.replace(/IIF/g, 'IF'), indexRow)})`
                obj[cotDiemExist.MaCotDiem] = parseFloat(cotDiemExist.KetQuaDanhGia_VI ?? 0)
            }
        }
        indexRow1++
        vueData.DataExcel.push(obj)
    }
    // console.log("vueData.DataExcel", vueData.DataExcel)
    //END CREATE EXCEL
    const firstStudent = dataJexcel[0]
    const dsCotDiem = vueData.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
    vueData.styleSheet = {}
    vueData.comments = {}
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
            if (dsCotDiem[j].HexBackground) {
                vueData.styleSheet[cellAdresss] = `background-color: ${dsCotDiem[j].HexBackground ?? 'unset'}`
            }
            const giaTri = dataJexcel[i][dsCotDiem[j].MaCotDiem]
            if (giaTri === null || giaTri === '') {
                vueData.styleSheet[cellAdresss] = `background-color : #ffff0052`
            }
        }
    }
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
            const obj = vueData.DSCotDiem.find(x => x.HocSinhID === dataJexcel[i].HocSinhID && x.MaCotDiem === dsCotDiem[j].MaCotDiem && x.Is_Comment)
            if (obj) {
                // vueData.styleSheet[cellAdresss] = 'color: red !important;'
                vueData.comments[cellAdresss] = 'Cột điểm do ' + dsCotDiem[j].NhapDiemUser + ' đã nhập'
            }
        }
    }
    vueData.keyComp++
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
}
function onSubmit() {
    setTimeout(() => {
        processBeforePushAPI()
        vueData.isShowDialogSuaDiem = true
        console.log('vueData.dataBeforeInsertToDB', vueData.dataBeforeInsertToDB)
    }, 0)
}
function processBeforePushAPI() {
    vueData.dataBeforeInsertToDB = []
    let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
    console.table(DSCotDiem)
    for (var i = 0; i < vueData.DSHocSinh.length; i++) {
        const hocSinh = vueData.DSHocSinh[i]
        for (var j = 0; j < DSCotDiem.length; j++) {
            const exists = vueData.editedCells.find(cell => cell.x == j && cell.y == i)
            if (exists) {
                const currentJ = j - vueData.freezeColumns
                const currentI = i
                const cotDiem = DSCotDiem[currentJ]
                const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(currentJ, currentI) // (j+3) là địa chỉ cột điểm đầu tiên, i là row
                let giaTriCotDiem = hocSinh[cotDiem.MaCotDiem] //MaCotDiem
                if (cotDiem.LoaiCotDiem === 'Công thức')
                    giaTriCotDiem = vueData.jexcel[0].records[currentI][currentJ]?.element?.innerHTML
                if (cotDiem.GiaTriCotDiem === 'number') {
                    if (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '') {
                        giaTriCotDiem = ''
                    }
                }
                let cotDiem_HS = {
                    HocSinhID: hocSinh.HocSinhID,
                    LopID: vueData.LopID,
                    NienKhoa: vueData.NienKhoa,
                    CotDiemID: cotDiem.CotDiemID,
                    KetQuaDanhGia_VI: giaTriCotDiem,
                    KetQuaDanhGia_EN: giaTriCotDiem,
                    KQHTID: vueData.DSCotDiem.find(x => x.HocSinhID === hocSinh.HocSinhID && x.MaCotDiem === cotDiem.MaCotDiem)?.KQHTID ?? 0
                }
                let typeColumn = cotDiem.GiaTriCotDiem
                let value = cotDiem_HS.KetQuaDanhGia_VI
                const min = cotDiem.DiemMin
                const max = cotDiem.DiemMax
                cotDiem_HS.IsError = validateSave(typeColumn, value, min, max)
                if (cotDiem_HS.IsError === 1) {
                    vueData.jexcel[0].setStyle(cellAdresss, 'background-color', 'red')
                    Vue.$toast.error(`Cột điểm chỉ cho phép nhập thang điểm từ ${min} đến ${max}!`, { position: 'top' })
                    page.isError = true
                    return
                }
                cotDiem_HS.KetQuaDanhGia_VI = cotDiem_HS.KetQuaDanhGia_VI === NaN ? null : cotDiem_HS.KetQuaDanhGia_VI
                vueData.dataBeforeInsertToDB.push(cotDiem_HS)
            }
        }
    }
    let validIndex = vueData.dataBeforeInsertToDB.findIndex((item) => item.IsError === 1)
    if (validIndex != -1) {
        Vue.$toast.error('Cột điểm chỉ cho phép nhập thang điểm 10!', { position: 'top' })
        page.isError = true
        return
    }
}
function onRefresh() {
    getHocSinhBangDiem()
}
vueData.onRefresh = onRefresh
vueData.onChangeSheet = onChangeSheet
vueData.onSubmit = onSubmit