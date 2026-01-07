async function TongKet_GetDTBMonHocByKhoiLop() {
    if (!vueData.LopItem?.LopID) return
    if (vueData.LopItem?.LopID == '0') {
        const ListDataDiem = []
        for (var lop of vueData.DSLop.filter(x => x.LopID != '0')) {
            const dataDiem = await fn_TongKetByLopID(lop.LopID)
            ListDataDiem.push(dataDiem)
        }
        const flat_ListDataDiem = ListDataDiem.flat()
        vueData.columnHeader = getHeaders()
        vueData.DSHocSinh = flat_ListDataDiem
        vueData.keyComp++
    } else {
        const dataDiem = await fn_TongKetByLopID(vueData.LopItem?.LopID)
        vueData.columnHeader = getHeaders()
        vueData.DSHocSinh = dataDiem.sort((a, b) => a.TenLop.localeCompare(b.TenLop));
        vueData.keyComp++
    }
}
async function fn_TongKetByLopID(LopID) {
    return await ajaxCALLPromise(`diemc${vueData.CapID}/LMS_GetTongKetDTBMonHocByLop`, {
        KhoiID: vueData.KhoiItem.KhoiID,
        LopID: LopID,
        HocKy: vueData.Semester,
        NienKhoa: vueData.NienKhoa
    })
}
function getHeaders() {
    let headerDefault = []
    if (vueData.CapID === 2) {
        headerDefault = [
            'STT', 'HocSinhID', 'HoTen', 'TenLop', 'NgaySinh',
            'GDDP', 'HDTN', 'HKTN', 'JA', 'LS-DL',
            'NT', 'AI', 'toan', 'tin', 'van', 'anh',
            'gdcd', 'cn', 'td', 'DTB', 'HocLuc', 'KQRenLuyen',
            'DanhHieu', 'Phep', 'KhongPhep', 'TongBuoiNghi',
            'UuDiem', 'NhuocDiem', 'DeXuat'
        ]
    } else if (vueData.CapID === 3) {
        headerDefault = [
            "STT", "HocSinhID", "HoTen", "TenLop", "NgaySinh",
            "GDDP", "GDKT-PL", "gdqp", "HDTN", "JA", "toan", "ly", "hoa",
            "sinh", "tin", "van", "su", "dia", "anh", "td", "DTB",
            "HocLuc", "KQRenLuyen", "DanhHieu", "Phep", "KhongPhep",
            "TongBuoiNghi", "UuDiem", "NhuocDiem", "DeXuat"
        ]
    }
    let columnThongTinHocSinh = []
    const columnMapping = {
        STT: { width: 1, type: 'hidden' },
        HocSinhID: { width: 80, title: "Mã học sinh" },
        HoTen: { width: 180, title: "Họ tên", align: 'left' },
        TenLop: { width: 50, title: 'Lớp' },
        UuDiem: { width: 600, title: 'Ưu điểm', align: 'left' },
        NhuocDiem: { width: 450, title: 'Nhược điểm', align: 'left' },
        DeXuat: { width: 700, title: 'Đề xuất', align: 'left' },
        NgaySinh: { width: 100, title: "Ngày sinh" },
        DanhHieu: { width: 120, title: 'Danh hiệu' },
        DanhGia: { width: 130, title: 'Đánh giá' },
        DTB: { title: 'ĐTB' },
        Phep: { title: 'vP', title: "Vắng phép", width: 80 },
        KhongPhep: { title: 'vKP', title: "Vắng KP", width: 80 },
        TongBuoiNghi: { title: 'vTong', title: "Vắng tổng", width: 80 },
        HocLuc: { title: 'KQHT' },
        KQRenLuyen: {
            title: 'KQRL',
            type: 'dropdown',
            source: ['Chưa đạt', 'Khá', 'Tốt', 'Đạt'],
            readOnly: false,
            width: 100,
            typeValue: 'KQRenLuyen'
        }
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
        };
        if (key === 'HKTN') {
            column.title = "KHTN"
        }
        columnThongTinHocSinh.push(column)
    }
    return columnThongTinHocSinh
}
function insertItemShowAllbyLop() {
    const newDSLop = vueData.DSLop.filter(x => {
        return !isNaN(Number(x.LopID));
    });
    const existShowAll = newDSLop.find(x => x.LopID == '0')
    console.log("existShowAll", existShowAll)
    if (!existShowAll) {
        newDSLop.unshift({ LopID: '0', TenLop: "Xem tất cả lớp" })
    }
    console.log(" vueData.DSLop", vueData.DSLop)
    vueData.DSLop = newDSLop
}
function exportExcel() {
    // 1. Dữ liệu mẫu (mảng object)
    const rawData = vueData.DSHocSinh
    // 2. Định nghĩa header nhóm (dòng 1) và header cột (dòng 2)
    const headerRow1 = vueData.columnHeader.filter(item => item.title != 'STT' && item.title != 'HocSinhLopID').map(item => item.title)
    const keys = vueData.columnHeader.filter(item => item.title != 'STT' && item.title != 'HocSinhLopID').map(item => item.name)
    // 4. Chuyển rawData thành mảng 2 chiều
    const dataRows = rawData.map(item =>
        keys.map(k => item[k] != null ? item[k] : "")
    )
    // 5. Gom lại AOA (array of arrays)
    const aoa = [
        headerRow1,
        ...dataRows
    ]
    // 6. Tạo worksheet từ AOA và thiết lập merge
    const worksheet = XLSX.utils.aoa_to_sheet(aoa)
    // 7. Tạo workbook, append sheet và ghi file
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "TongKetHocKi")
    XLSX.writeFile(workbook, "TongKetHocKi.xlsx")
}
vueData.TongKet_GetDTBMonHocByKhoiLop = TongKet_GetDTBMonHocByKhoiLop
vueData.insertItemShowAllbyLop = insertItemShowAllbyLop
vueData.exportExcel = exportExcel