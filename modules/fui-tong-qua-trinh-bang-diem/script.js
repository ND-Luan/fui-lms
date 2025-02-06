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
                    // width: 80,
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
                    autoWidth: true,
                    typeValue: x.GiaTriCotDiem,
                    width: this.calculateColumnWidth(x.TenCotDiem_VI),
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
                    // width: 120,
                    autoWidth: true,
                    typeValue: x.GiaTriCotDiem,
                    backGroundColor: x.HexBackground,
                    wrap: true,
                    align: 'center',
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
                // let giaTri = null
                // if (cotDiemExist.GiaTriCotDiem === 'number') {
                //     if (cotDiemExist.KetQuaDanhGia_VI === '' || cotDiemExist.KetQuaDanhGia_VI === null) {
                //         giaTri = null
                //     } else {
                //         giaTri = parseFloat(cotDiemExist?.KetQuaDanhGia_VI)
                //     }
                // } else {
                //     if (cotDiemExist?.KetQuaDanhGia_VI) {
                //         giaTri = cotDiemExist?.KetQuaDanhGia_VI
                //     } else {
                //         giaTri = null
                //     }
                // }
                // //Text
                // obj[cotDiemExist.MaCotDiem] = _.isNaN(giaTri) ? null : giaTri
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