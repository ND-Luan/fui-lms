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
                    readOnly: true
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
                    readOnly: true
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
    for (var hocSinh of vueData.DSHocSinh) {
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
    console.log('dataJexcel', dataJexcel)
    vueData.keyComp++
    vueData.columnHeader = headers
    vueData.DSHocSinh = dataJexcel
    vueData.DSCotDiem_ByMaNhomCotDiem = DSCotDiem_ByMaNhomCotDiem
}
function validateSave(typeCell, value, min, max) {
    if ((typeCell === 'number' && value < min) || value > max) return 1
    else return 0
}

function onTuChoiDiem() {
    const TINH_TRANG = 3
    const promise = () => {
        return new Promise(resolve => {
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
        Vue.$toast.success('Từ chối điểm thành công', { postion: 'top' })
        vueData.keyComp++
    })
}
function onDuyetDiem() {
    const TINH_TRANG = 4
    const promise = () => {
        return new Promise(resolve => {
            CALL("udpKQHT_MonHocLop_TinhTrang", {
                MonHocLopID: vueData.MonHocItem.MonHocLopID,
                LopID: vueData.LopItem.LopID,
                TinhTrang: TINH_TRANG,
                MaNhomCotDiem: vueData.MaNhomCotDiemItem.MaNhomCotDiem,
                IsSendToManager: true
            })
            CALL("udpKQHT_NhomDiem_TinhTrang", {
                TinhTrang: TINH_TRANG,
                NhomDiem_MonHocLopID: vueData.MaNhomCotDiemItem.NhomDiem_MonHocLopID
            })
            resolve()
        })
    }
    promise().then(() => {
        Vue.$toast.success('Duyệt điểm thành công', { postion: 'top' })
        vueData.keyComp++
    })
}