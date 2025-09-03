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
                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
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
                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'html',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
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
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: x.WidthCSS,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    source: [{ id: '1', name: 'Done' }, { id: '0', name: 'Not Yet' }] //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            }
        })
    //Nếu là gửi điểm thì freezecolumn = 4 để thêm cột từ chối
    vueData.freezeColumns = ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? 4 : 3
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
        if (ListMonHoc.includes(vueData.MonHocItem.MonHocID)) obj.EnglishName = arrCotDiemExist[0].EnglishName
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
            else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.Formula !== null && isGetResultTopic(cotDiemExist)) {
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
            // if(obj.)
        }
    }
    vueData.keyComp++
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
}
function validateSave(typeCell, value, min, max) {
    if (value == null || value == '') return 0
    if (typeCell === 'number' && (value < min || value > max)) return 1
    else return 0
}
const page = {
    isError: false,
    process: processBeforePushAPI
}
function onLuuDiem() {
    page.isError = false
    vueData.StatusButton = 'luu'
    processBeforePushAPI()
    if (!page.isError) {
        const dataFilter = vueData.dataBeforeInsertToDB
            .filter(x =>
                (x.KQHTID && x.KQHTID > 0) || // Nếu KQHTID tồn tại và lớn hơn 0 thì giữ lại
                (
                    x.KetQuaDanhGia_VI != null &&
                    x.KetQuaDanhGia_VI !== '' &&
                    !Number.isNaN(x.KetQuaDanhGia_VI)
                ) // Hoặc KetQuaDanhGia_VI hợp lệ thì giữ lại
            );
        vueData.dataBeforeInsertToDB = dataFilter.filter(x => !Number.isNaN(x.KetQuaDanhGia_VI)) //Filter thêm lần nữa khi có Công thức ko có tính được 'Error: #VALUE!'
        console.log('dataFilter', vueData.dataBeforeInsertToDB)
        // Insert xong cập nhật tình trạng
        CALL("insKQHT_MonHocLop")
        vueData.keyComp++
    }
}
function processBeforePushAPI() {
    vueData.dataBeforeInsertToDB = []
    let val = vueData.DSHocSinh
    //val là dữ liệu trên sheet jexcel
    let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
    //Xử lý data mapping giá trị
    //B1: Vòng lặp thứ nhất để lặp các học sinh
    //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
    for (let i = 0; i < val.length; i++) {
        for (let j = 0; j < DSCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + vueData.freezeColumns, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row
            let giaTriCotDiem = val[i][DSCotDiem[j].MaCotDiem] //vueData.instance[0].getValueFromCoords(j + vueData.freezeColumns, i)
            // console.log(val[i].HocSinhID, vueData.instance[0])
            // console.log(val[i].HocSinhID, val[i][DSCotDiem[j].MaCotDiem], vueData.instance[0].getValueFromCoords(j + vueData.freezeColumns, i))
            if (DSCotDiem[j].LoaiCotDiem === 'Công thức') {
                giaTriCotDiem = vueData.instance[0].records[i][j + vueData.freezeColumns]?.element?.innerHTML
            }
            if (DSCotDiem[j].GiaTriCotDiem === 'number') {
                if (giaTriCotDiem === null || giaTriCotDiem === NaN || giaTriCotDiem === '') {
                    console.log('FIND NULL OR NaN=>', val[i].HocSinhID, DSCotDiem[j].MaCotDiem, giaTriCotDiem)
                    giaTriCotDiem = ''
                } else {
                    console.log('NUMBER =>', val[i].HocSinhID, DSCotDiem[j].MaCotDiem, giaTriCotDiem)
                    giaTriCotDiem = parseFloat(giaTriCotDiem)
                }
            }
            let cotDiem_HS = {
                HocSinhID: val[i].HocSinhID,
                LopID: vueData.LopItem.LopID,
                NienKhoa: vueData.NienKhoa,
                CotDiemID: DSCotDiem[j].CotDiemID,
                KetQuaDanhGia_VI: giaTriCotDiem,
                KetQuaDanhGia_EN: giaTriCotDiem,
                KQHTID: vueData.DSCotDiem.find(x => x.HocSinhID === val[i].HocSinhID && x.MaCotDiem === DSCotDiem[j].MaCotDiem)?.KQHTID ?? 0
            }
            let typeColumn = DSCotDiem[j].GiaTriCotDiem
            let value = cotDiem_HS.KetQuaDanhGia_VI
            const min = DSCotDiem[j].DiemMin
            const max = DSCotDiem[j].DiemMax
            cotDiem_HS.IsError = validateSave(typeColumn, value, min, max)
            if (cotDiem_HS.IsError === 1) {
                vueData.instance[0].setStyle(cellAdresss, 'background-color', 'red')
                Vue.$toast.error(`Cột điểm chỉ cho phép nhập thang điểm từ ${min} đến ${max}!`, { position: 'top' })
                page.isError = true
                return
            }
            cotDiem_HS.KetQuaDanhGia_VI = cotDiem_HS.KetQuaDanhGia_VI === NaN ? null : cotDiem_HS.KetQuaDanhGia_VI
            if (DSCotDiem[j].CotDiemID === 2772) {
                console.log(val[i].HocSinhID, DSCotDiem[j].MaCotDiem, giaTriCotDiem, cotDiem_HS)
            }
            vueData.dataBeforeInsertToDB.push(cotDiem_HS)
        }
    }
    let validIndex = vueData.dataBeforeInsertToDB.findIndex((item) => item.IsError === 1)
    if (validIndex != -1) {
        Vue.$toast.error('Cột điểm chỉ cho phép nhập thang điểm 10!', { position: 'top' })
        page.isError = true
        return
    }
}
const isShowReasonReject = () => {
    let defaultObj = {
        disabled: false,
        NoiDungNhanXet: null
    }
    const DSHocSinh_Semester = vueData.DSCotDiem
    if (DSHocSinh_Semester.length > 0) {
        const obj = DSHocSinh_Semester.find(x => x.TinhTrang === 3 || x.TinhTrang === 5 || x.TinhTrang === 7)
        defaultObj.disabled = obj ? true : false
        defaultObj.NoiDungNhanXet = obj?.NoiDungNhanXet ?? ''
        defaultObj.TinhTrang = obj?.TinhTrang ?? ''
    }
    return defaultObj
}
const renderText_Person_Reject = (TinhTrang) => {
    if (!TinhTrang) return
    let text = ''
    if (vueData.CapID === 1) {
        if (TinhTrang === 3) text = 'Giáo viên chủ nhiệm từ chối'
        if (TinhTrang === 5) text = 'Tổ trưởng từ chối'
        if (TinhTrang === 7) text = 'BGH chủ nhiệm từ chối'
    } else {
        if (TinhTrang === 3) text = 'BGH từ chối'
    }
    return text
}
function isNotTopic() {
    let isNotTopic = false
    try {
        if (vueData.MonHocItem?.MonHocID == 5 && (vueData.MaNhomCotDiemItem?.MaNhomCotDiem.includes('DiemCK') || vueData.MaNhomCotDiemItem?.MaNhomCotDiem.includes('DiemGK'))) {
            isNotTopic = true
        }
    } catch (error) {
        console.log('error', error)
    }
    console.log('isNotTopic', isNotTopic)
    return isNotTopic
}
function reloadBangDiem() {
    if (isNotTopic()) {
        runAction('HocSinhBangDiem_Get_ByThuTuNhom')
    }
    else {
        runAction('getHocSinhBangDiem')
    }
}
function isGetResultTopic(cotDiem) {
    return (vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('DiemGK_') || vueData.MaNhomCotDiemItem.MaNhomCotDiem.includes('DiemCK_')) && (!cotDiem.MaCotDiem.includes('DiemGK_') || !cotDiem.MaCotDiem.includes('DiemCK_'))
}
vueData.isNotTopic = isNotTopic
vueData.reloadBangDiem = reloadBangDiem