function initMaCotDiem() {
    if (vueData.CapID === 1) {
        vueData.MaCotDiem = 'DiemCK_HK2'
        vueData.HocKi = 'HK2'
    } else {
        vueData.MaCotDiem = 'DiemTB_CaNam'
        vueData.HocKi = 'CaNam'
    }
}
function exportExcel() {
    const headers = vueData.columns.map(x => x.name)
    const rawData = vueData.DSHocSinh
    const data = rawData.map(item =>
        headers.map(h => item[h] ?? "")
    )
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, `Bang_Diem_Chi_Tiet_Khoi${vueData.KhoiID}_${vueData.MonHocItem.MonHocName}.xlsx`)
}
function renderHocSinh() {
    const uniqueHocSinhID = [... new Set(vueData.DSCotDiem.map(x => x.HocSinhID))]
    console.log('uniqueHocSinhID', uniqueHocSinhID)
    const DSHocSinh = []
    for (var HocSinhID of uniqueHocSinhID) {
        const hocSinh = vueData.DSCotDiem.find(x => x.HocSinhID === HocSinhID)
        if (hocSinh) {
            const obj = {
                SoDanhBo: hocSinh.SoDanhBo,
                HoTen: hocSinh.HoTen,
                HocSinhID: hocSinh.HocSinhID
            }
            const arrDSCotDiemFilter = vueData.DSCotDiem.filter(x => x.HocSinhID === HocSinhID)
            for (var maCotDiem of arrDSCotDiemFilter) {
                obj[maCotDiem.MaCotDiem] = maCotDiem.KetQuaDanhGia_VI
            }
            DSHocSinh.push(obj)
        }
    }
    const arrDSCotDiemFirstStudent = vueData.DSCotDiem.filter(x => x.HocSinhID === uniqueHocSinhID[0])
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
            name: 'HoTen',
            width: 200,
            backGroundColor: null,
            wrap: true,
            align: "left",
            readOnly: true
        },
    ]
    const arrCotDiemWithAlignCenter = [
        'MucDoDanhGia',
    ]
    const ListMonHoc = [5, 46, 76]
    let columnsCotDiem = arrDSCotDiemFirstStudent
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
                    source: ['Done', 'Not Yet'] //x.MaCotDiem === '' ? ['Done', 'Not Yet'] : ['Đ', 'T', 'H']
                    // readOnly: x.LoaiCotDiem === 'Công thức' ? true : false,
                }
                return column
            }
        })
    //Nếu là gửi điểm thì freezecolumn = 4 để thêm cột từ chối
    vueData.freezeColumns = ListMonHoc.includes(vueData.MonHocItem.MonHocID) ? 4 : 3
    vueData.columns = [...columnThongTinHocSinh, ...columnsCotDiem]
    vueData.DSHocSinh = DSHocSinh
    vueData.keyComp = vueData.keyComp + 1
}
vueData.exportExcel = exportExcel
vueData.initMaCotDiem = initMaCotDiem