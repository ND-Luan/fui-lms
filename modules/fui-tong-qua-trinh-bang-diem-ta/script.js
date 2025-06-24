function renderDSKhoi() {
    const DSKhoi = Array.from({ length: 12 })
        .fill(0)
        .map((_, i) => {
            return {
                title: `Khối ${i + 1}`,
                value: i + 1,
            }
        })
    // vueData.KhoiID = DSKhoi[0].value
    vueData.DSKhoi = DSKhoi
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
    // DSCotDiem_ByMaNhomCotDiem = SLCotDiem_OfFirstSTD
    DSCotDiem_ByMaNhomCotDiem = vueData.DSNhomDiem
    const uniqueNhomDiem = [...new Set(DSCotDiem_ByMaNhomCotDiem.sort((a, b) => a.ThuTuNhom - b.ThuTuNhom).map(x => x.MaNhomCotDiem))]
    console.log(uniqueNhomDiem)
    let newDSCotDiem_ByMaNhomCotDiem = []
    for (var nhomDiem of uniqueNhomDiem) {
        const NhomDiemFilter = DSCotDiem_ByMaNhomCotDiem.filter(x => x.MaNhomCotDiem === nhomDiem)
        NhomDiemFilter.sort((a, b) => a.ThuTuCotDiem - b.ThuTuCotDiem)
        console.log('=>', NhomDiemFilter)
        newDSCotDiem_ByMaNhomCotDiem.push(NhomDiemFilter)
    }
    newDSCotDiem_ByMaNhomCotDiem = newDSCotDiem_ByMaNhomCotDiem.flat()
    // console.log('newDSCotDiem_ByMaNhomCotDiem', newDSCotDiem_ByMaNhomCotDiem)
    const DSNhomDiem = []
    for (var nhomDiem of uniqueNhomDiem) {
        const DSNhomDiemFilter = newDSCotDiem_ByMaNhomCotDiem.filter(x => x.MaNhomCotDiem === nhomDiem)
        DSNhomDiem.push({
            title: DSNhomDiemFilter[0].TenNhomCotDiem_VI,
            colspan: DSNhomDiemFilter.length,
        })
    }
    vueData.DSNhomDiem = DSNhomDiem
    //Xử lý động cột điểm header jexcel
    console.log('newDSCotDiem_ByMaNhomCotDiem', newDSCotDiem_ByMaNhomCotDiem)
    let columnsCotDiem = newDSCotDiem_ByMaNhomCotDiem
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
                    // readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'text',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    typeValue: x.GiaTriCotDiem,
                    width: this.calculateColumnWidth(x.TenCotDiem_VI),
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    // readOnly: true
                }
                return column
            } else if (x.GiaTriCotDiem === 'ICO_Star') { // cấu hình header cột điểm có dạng ICO_Star
                let column = {
                    type: 'html',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
                    width: 120,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
                    // readOnly: true
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
            // readOnly: true
        },
        {
            type: 'text',
            title: 'Số Danh Bộ',
            name: 'SoDanhBo',
            width: 120,
            backGroundColor: null,
            wrap: true,
            //  readOnly: true
        },
        {
            type: 'text',
            title: 'Họ tên học sinh',
            name: 'HoVaTenHocSinh',
            width: 300,
            backGroundColor: null,
            wrap: true,
            align: "left",
            // readOnly: true
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
            if (obj) {
                newArr.push(obj)
            } else {
                newArr.push({ ...hocSinh, ...item })
            }
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
            }
        }
        indexRow++
        dataJexcel.push(obj)
    }
    console.log('dataJexcel', dataJexcel)
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
    const firstStudent = dataJexcel[0]
    const dsCotDiem = vueData.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
    vueData.styleSheet = {}
    for (var i = 0; i < dataJexcel.length; i++) {
        for (var j = 0; j < dsCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + 3, i) // (j+2) là địa chỉ cột điểm đầu tiên, i là row let
            if (dsCotDiem[j].HexBackground) {
                vueData.styleSheet[cellAdresss] = `background-color: ${dsCotDiem[j].HexBackground}`
            }
        }
    }
    console.log('headers', headers)
    vueData.keyComp++
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
}
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}
function onSave() {
    vueData.dataBeforeInsertToDB = []
    let val = vueData.DSHocSinh
    //val là dữ liệu trên sheet jexcel
    let DSCotDiem = vueData.DSCotDiem_ByMaNhomCotDiem //DS cột điểm của nhóm bảng điểm
    //   let arrCotDiem = Object.keys(val[0]).splice(2); //Lấy các cột điểm của 1 học sinh
    //Xử lý data mapping giá trị
    //B1: Vòng lặp thứ nhất để lặp các học sinh
    //B2: Vòng lặp bên trong để lặp các cột điểm của 1 học sinh
    for (let i = 0; i < val.length; i++) {
        for (let j = 0; j < DSCotDiem.length; j++) {
            const cellAdresss = jspreadsheet.helpers.getCellNameFromCoords(j + 2, i) // (j+2) là địa chỉ cột điểm đầu tiên, i là row
            let giaTriCotDiem = vueData.instance[0].getValueFromCoords(j + 2, i)
            let cotDiem_HS = {
                HocSinhID: val[i].HocSinhID,
                LopID: vueData.LopItem.LopID,
                NienKhoa: vueData.NienKhoa,
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
    //Insert xong cập nhật tình trạng
    const promise = () => {
        return new Promise(resolve => {
            CALL("insKQHT_MonHocLop")
            resolve()
        })
    }
    promise().then(() => {
        CALL('getHocSinhBangDiem')
        Vue.$toast.success('Lưu điểm thành công!', { position: 'top' })
        vueData.keyComp++
    })
}