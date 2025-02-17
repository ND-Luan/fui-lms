function renderDSKhoi() {
    vueData.DSKhoi = Array.from({ length: 12 }, (_, i) => {
        const khoi = i + 1;
        const capid = khoi <= 5 ? 1 : khoi <= 9 ? 2 : 3;
        return { title: `Khối ${khoi}`, value: khoi, CapID: capid };
    }).filter(x => x.CapID === parseInt(vueData.capid));
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
    let SLCotDiem_OfFirstSTD = vueData.DSCotDiem.filter((item) => item.HocSinhID === vueData.DSHocSinh[0].HocSinhID) // lấy ra các cột điểm của học sinh đầu tiên
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
                    autoWidth: true,
                    decimal: '.',
                    mask: '0.00',
                    backGroundColor: x.HexBackground,
                    wrapText: true,
                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'text',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: 80,
                    typeValue: x.GiaTriCotDiem,
                    width: calculateColumnWidth(x.TenCotDiem_VI),
                    backGroundColor: x.HexBackground,
                    wrap: true,
                }
                return column
            } else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'html',
                    title: x.TenCotDiem_VI, // + fn_IsDisabledTinhTrangDiem(x.TinhTrang, 'GV').isDisabled,
                    name: x.MaCotDiem,
                    width: 120,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
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
        },
        {
            type: 'text',
            title: 'Số Danh Bộ',
            name: 'SoDanhBo',
            width: 120,
            backGroundColor: null,
            wrap: true,
        },
        {
            type: 'text',
            title: 'Họ tên học sinh',
            name: 'HoVaTenHocSinh',
            width: 300,
            backGroundColor: null,
            wrap: true,
            align: "left"
        }
    ]
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
    vueData.styleSheet = {}
    vueData.comments = {}
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + 3, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
            if (dsCotDiem[j].HexBackground) {
                vueData.styleSheet[cellAdresss] = `background-color: ${dsCotDiem[j].HexBackground ?? 'unset'}`
            }
        }
    }
    console.log('dsCotDiem', dsCotDiem)
    console.log('dataJexcel', dataJexcel)
    for (var i = 0; i < dataJexcel.length; i++) {
        console.log('dataJexcel', dataJexcel[i])
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + 3, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row let
            const obj = vueData.DSCotDiem.find(x => {
                return x.HocSinhID === dataJexcel[i].HocSinhID && x.MaCotDiem === dsCotDiem[j].MaCotDiem && x.Is_Comment
            }
            )
            if (obj) {
                console.log(i, dsCotDiem[j])
                vueData.styleSheet[cellAdresss] = 'color: red;'
                vueData.comments[cellAdresss] = 'THIS COMMENT'
            }
        }
    }
    vueData.keyComp++
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
}
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}
function fn_IsDisabledTinhTrangDiem({ TinhTrang, type }) {
    console.log(TinhTrang, type)
    const arrStatusGV = [0, 1, 2, 3, 4]
    const obj = {
        color: getColorTinhTrangDiem(TinhTrang),
        isDisabled: false,
        text: getTextTinhTrangDiem(TinhTrang)
    }
    if (type === 'GV') {
        if (arrStatusGV.indexOf(TinhTrang) >= 0) {
            if (TinhTrang == 0 || TinhTrang == 3) {
                obj.isDisabled = false
            } else {
                obj.isDisabled = true
            }
        }
    } else {
        if (TinhTrang == 1) {
            obj.isDisabled = false
        } else {
            obj.isDisabled = true
        }
    }
    return obj
}
function onLuuDiem() {
    vueData.dataBeforeInsertToDB = []
    vueData.StatusButton = 'luu'
    let val = vueData.DSHocSinh
    //val là dữ liệu trên sheet jexcel
    let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
    //   let arrCotDiem = Object.keys(val[0]).splice(2); //Lấy các cột điểm của 1 học sinh
    //Xử lý data mapping giá trị
    //B1: Vòng lặp thứ nhất để lặp các học sinh
    //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
    for (let i = 0; i < val.length; i++) {
        for (let j = 0; j < DSCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + 3, i) // (j+3) là địa chỉ cột điểm đầu tiên, i là row
            let giaTriCotDiem = vueData.instance[0].getValueFromCoords(j + 3, i)
            let cotDiem_HS = {
                HocSinhID: val[i].HocSinhID,
                LopID: vueData.LopItem.LopID,
                NienKhoa: 2024,
                CotDiemID: DSCotDiem[j].CotDiemID,
                KetQuaDanhGia_VI: DSCotDiem[j].GiaTriCotDiem === 'number' ? (giaTriCotDiem === '' || giaTriCotDiem === NaN ? null : parseFloat(giaTriCotDiem)) : giaTriCotDiem,
                KetQuaDanhGia_EN: DSCotDiem[j].GiaTriCotDiem === 'number' ? (giaTriCotDiem === '' || giaTriCotDiem === NaN ? null : parseFloat(giaTriCotDiem)) : giaTriCotDiem,
                Is_Reject: '',
                ReasonReject: '',
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
    let validIndex = vueData.dataBeforeInsertToDB.findIndex((item) => item.IsError === 1)
    if (validIndex != -1) {
        Vue.$toast.error('Cột điểm chỉ cho phép nhập thang điểm 10!', { position: 'top' })
        return
    }
    // //Insert xong cập nhật tình trạng
    CALL("insKQHT_MonHocLop")
    vueData.keyComp++
}
function onGuiDiem() {
    vueData.StatusButton = 'gui-diem'
    CALL("insKQHT_MonHocLop")
    vueData.keyComp++
}
function onImport() {
}