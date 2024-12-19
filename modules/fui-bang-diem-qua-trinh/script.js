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
    const DSHocSinh = [...new Set(vueData.DSCotDiem.map(x => x.HocSinhID))].map(id => {
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
    let SLCotDiem_OfFirstSTD = vueData.DSCotDiem.filter((item) => item.HocSinhID === DSHocSinh[0].HocSinhID) // lấy ra các cột điểm của học sinh đầu tiên
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
                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            } else if (x.GiaTriCotDiem === 'text') { // cấu hình header cột điểm có dạng text
                let column = {
                    type: 'text',
                    title: x.TenCotDiem_VI,
                    name: x.MaCotDiem,
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
                    readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
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
            title: 'Họ tên học sinh',
            name: 'HoVaTenHocSinh',
            width: 300,
            backGroundColor: null,
            wrap: true,
        }
    ]
    headers = [...columnThongTinHocSinh, ...columnsCotDiem]
    //Xử lý data jexcel
    const dataJexcel = []
    let indexRow = 1
    for (var hocSinh of DSHocSinh) {
        const arrCotDiemExist = vueData.DSCotDiem.filter((x) => x.HocSinhID === hocSinh.HocSinhID) // Lấy danh sách điểm của học sinh
        if (arrCotDiemExist.length === 0) return
        let obj = {
            HocSinhID: arrCotDiemExist[0].HocSinhID,
            HoVaTenHocSinh: arrCotDiemExist[0].Ho + ' ' + arrCotDiemExist[0].Ten,
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
                obj[cotDiemExist.MaCotDiem] = '=' + replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)
            } else if (cotDiemExist.LoaiCotDiem == 'Công thức' && cotDiemExist.GiaTriCotDiem === 'ICO_Star') {
                //Ngôi sao
                obj[cotDiemExist.MaCotDiem] = `=RATING(${replaceFormula(columnsCotDiem, cotDiemExist.Formula, indexRow)})`
            }
        }
        indexRow++
        dataJexcel.push(obj)
    }
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
    vueData.keyComp++
}
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}
function onLuuDiem() {
    //Khởi tạo lại mảng dataBeforeInsertToDB rỗng
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
            const cellAdresss = jexcel.getColumnNameFromId([j + 2, i]) // (j+2) là địa chỉ cột điểm đầu tiên, i là row
            // let giaTriCotDiem = val[i][arrCotDiem[j]]
            let giaTriCotDiem = vueData.instance.getCell(cellAdresss).innerHTML
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
                vueData.instance.setStyle(cellAdresss, 'background-color', 'red')
                Vue.$toast.error(`Cột điểm chỉ cho phép nhập thang điểm từ ${min} đến ${max}!`, { position: 'top' })
                return
            }
            console.log('.....');
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
    const TINH_TRANG = 1
    const promise = () => {
        return new Promise(resolve => {
            CALL("insKQHT_MonHocLop")
            CALL("udpKQHT_MonHocLop_TinhTrang", {
                MonHocLopID: vueData.MonHocItem.MonHocLopID,
                LopID: vueData.LopItem.LopID,
                TinhTrang: TINH_TRANG,
                MaNhomCotDiem: vueData.MaNhomCotDiemItem.MaNhomCotDiem,
                IsSendToManager: false
            })
            CALL("udpKQHT_NhomDiem_TinhTrang", {
                TinhTrang: TINH_TRANG,
                NhomDiem_MonHocLopID: vueData.MaNhomCotDiemItem.NhomDiem_MonHocLopID
            })
            resolve()
        })
    }
    promise().then(() => {
        Vue.$toast.success('Lưu tạm thành công', { position: 'top' })
        vueData.keyComp++
    })
}
function onGuiDiem() {
    const TINH_TRANG = 2
    const promise = () => {
        return new Promise(resolve => {
            CALL("insKQHT_MonHocLop")
            CALL("udpKQHT_MonHocLop_TinhTrang", {
                MonHocLopID: vueData.MonHocItem.MonHocLopID,
                LopID: vueData.LopItem.LopID,
                TinhTrang: TINH_TRANG,
                MaNhomCotDiem: vueData.MaNhomCotDiemItem.MaNhomCotDiem,
                IsSendToManager: false
            })
            CALL("udpKQHT_NhomDiem_TinhTrang", {
                TinhTrang: TINH_TRANG,
                NhomDiem_MonHocLopID: vueData.MaNhomCotDiemItem.NhomDiem_MonHocLopID
            })
            resolve()
        })
    }
    promise().then(() => {
        Vue.$toast.success('Gửi điểm thành công', { position: 'top' })
        vueData.keyComp++
    })
}