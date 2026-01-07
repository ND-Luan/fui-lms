function renderDSHocBong() {
    if (!Array.isArray(vueData.DSHocBong) || vueData.DSHocBong.length === 0) {
        console.warn('Không có dữ liệu để tạo header');
        return;
    }
    let keys = [];
    vueData.DSHocBong.forEach(obj => {
        Object.keys(obj).forEach(key => {
            if (!keys.includes(key)) {
                keys.push(key);
            }
        });
    });
    console.log('keys', keys)
    if (vueData.CapID === 2) {
        keys = [
            'STT', 'HocSinhID', 'HoTen', 'TenLop', 'NgaySinh',
            'GDDP', 'HDTN', 'HKTN', 'JA', 'LS-DL',
            'NT', 'AI', 'toan', 'tin', 'van', 'anh',
            'gdcd', 'cn', 'td', 'DTB', 'HocLuc',
            // 'KQRenLuyen',
            "HanhKiem",
            'HocBong',
            // 'DanhHieu',
            'Phep', 'KhongPhep', 'TongBuoiNghi',
        ]
    } else {
        keys = [
            "STT", "HocSinhID", "HoTen", "TenLop", "NgaySinh",
            "GDDP", "GDKT-PL", "gdqp", "HDTN", "JA", "toan", "ly", "hoa",
            "sinh", "tin", "van", "su", "dia", "anh", "td", "DTB",
            "HocLuc",
            // "KQRenLuyen",
            "HanhKiem",
            'HocBongID',
            // "DanhHieu",
            "Phep", "KhongPhep",
            "TongBuoiNghi",
        ]
    }
    let headerDefault = keys//Object.keys(vueData.dataDiem)
    // headerDefault = [...headerDefault, 'VaoSoKT', 'SoQuyetDinhKT', 'NgayKhenThuong_VI', 'NgayKhenThuong_EN']
    let columnThongTinHocSinh = []
    const columnMapping = {
        STT: { width: 1, type: 'hidden' },
        HocSinhID: { width: 80, title: "Mã học sinh" },
        HoTen: { width: 180, align: 'left', title: "Họ tên" },
        TenLop: { width: 50, title: 'Lớp' },
        UuDiem: { width: 600, title: 'Ưu điểm', align: 'left' },
        NhuocDiem: { width: 450, title: 'Nhược điểm', align: 'left' },
        DeXuat: { width: 700, title: 'Đề xuất', align: 'left' },
        NgaySinh: { width: 100 },
        DanhHieu: { width: 120, title: 'Danh hiệu', type: 'hidden' },
        DanhGia: { width: 130, title: 'Đánh giá' },
        DTB: { title: 'ĐTB' },
        Phep: { title: 'vP' },
        KhongPhep: { title: 'vKP' },
        TongBuoiNghi: { title: 'vTong' },
        HocLuc: { title: 'KQHT' },
        HanhKiem: { title: 'Hạnh kiểm' },
        HocBongID: {
            title: 'Học bổng',
            type: 'dropdown',
            source: [
                { id: 1, name: '' },
                { id: 2, name: "25%" },
                { id: 3, name: "50%" },
                { id: 4, name: "100%" }
            ],
            readOnly: false,
            width: 100,
            typeValue: 'HocBongID'
        },
        VaoSoKT: { title: "Số vào sổ KT", width: 100 },
        SoQuyetDinhKT: { title: "Số quyết định KT", width: 100 },
        NgayKhenThuong_VI: { title: "Ngày KT (VI)", width: 200 },
        NgayKhenThuong_EN: { title: "Ngày KT (EN)", width: 200 },
        HocSinhLopID: {
            width: 60,
            type: 'hidden'
        },
        // KhenThuongID: { width: 1, type: "hidden" }
    };
    for (var key of headerDefault) {
        let column = {
            type: 'text',
            title: key,
            name: key,
            width: 100,
            backGroundColor: null,
            wrap: true,
            align: "center",
            readOnly: true,
            style: 'font-size:8px',
            ...columnMapping[key], // Áp dụng thuộc tính từ object ánh xạ
        };
        columnThongTinHocSinh.push(column)
    }
    vueData.columnHeader = [...columnThongTinHocSinh]
    vueData.keyComp++
    vueData.DSHocSinh = vueData.DSHocBong
}
function onSave() {
    const Data = []
    for (var hsid of vueData.DSHocSinhChange) {
        const _ds = vueData.DSHocSinh.find(x => x.HocSinhID == hsid)
        Data.push({
            HocSinhID: parseInt(hsid),
            TenLop: _ds?.TenLop ?? '',
            HocBongID: _ds?.HocBongID ? parseInt(_ds?.HocBongID) : null,
            HocBong_Sau: _ds?.HocBongID ? parseInt(_ds?.HocBongID) : null
        })
    }
    confirm({
        title: `Xác nhận lưu ${vueData.DSHocSinhChange.length} học sinh?`,
        action: async function () {
            //Tạo biến distinctHocSinhChange để lấy học sinh có thay đổi dữ liệu dùng Set để distint HocSinhID
            await ajaxCALLPromise('lms/XetKetQuaHocBong_Upsert_JSON', { json: Data, NienKhoa: vueData.NienKhoa })
            await ajaxCALLPromise(`/diemc3/LMS_UpdateXetHocBong`, {
                Data,
                HocKy: vueData.Semester.value,
                KhoiID: vueData.KhoiItem.value
            }).then(() => {
                Vue.$toast.success('Lưu học bổng thành công', { position: 'top' })
                vueData.DSHocSinhChange = []
                CALL('getHocBong')
            })
        }
    })
}
function onExportExcel() {
    if (!Array.isArray(vueData.DSHocBong) || vueData.DSHocBong.length === 0) {
        Vue.$toast.warning('Không có dữ liệu để xuất Excel', { position: 'top' });
        return;
    }
    // Xác định các cột cần xuất dựa trên CapID
    let keys = [];
    if (vueData.CapID === 2) {
        keys = [
            'STT', 'HocSinhID', 'HoTen', 'TenLop', 'NgaySinh',
            'GDDP', 'HDTN', 'HKTN', 'JA', 'LS-DL',
            'NT', 'AI', 'toan', 'tin', 'van', 'anh',
            'gdcd', 'cn', 'td', 'DTB', 'HocLuc',
            'HanhKiem', 'HocBong', 'Phep', 'KhongPhep', 'TongBuoiNghi'
        ];
    } else {
        keys = [
            "STT", "HocSinhID", "HoTen", "TenLop", "NgaySinh",
            "GDDP", "GDKT-PL", "gdqp", "HDTN", "JA", "toan", "ly", "hoa",
            "sinh", "tin", "van", "su", "dia", "anh", "td", "DTB",
            "HocLuc", "HanhKiem", 'HocBongID', "Phep", "KhongPhep", "TongBuoiNghi"
        ];
    }
    // Mapping tiêu đề tiếng Việt
    const headerMapping = {
        STT: 'STT',
        HocSinhID: 'Mã học sinh',
        HoTen: 'Họ và tên',
        TenLop: 'Lớp',
        NgaySinh: 'Ngày sinh',
        DTB: 'Điểm trung bình',
        Phep: 'Vắng có phép',
        KhongPhep: 'Vắng không phép',
        TongBuoiNghi: 'Tổng buổi nghỉ',
        HocLuc: 'Học lực',
        HanhKiem: 'Hạnh kiểm',
        HocBongID: 'Học bổng',
        HocBong: 'Học bổng'
    };
    // Mapping giá trị học bổng
    const hocBongMapping = {
        1: '',
        2: '25%',
        3: '50%',
        4: '100%'
    };
    // Tạo header row
    const headerRow = keys.map(key => headerMapping[key] || key);
    // Tạo data rows
    const dataRows = vueData.DSHocBong.map((item, index) => {
        return keys.map(key => {
            if (key === 'STT') {
                return index + 1;
            }
            if (key === 'HocBongID' || key === 'HocBong') {
                return hocBongMapping[item[key]] || '';
            }
            return item[key] !== null && item[key] !== undefined ? item[key] : '';
        });
    });
    // Kết hợp header và data
    const worksheetData = [headerRow, ...dataRows];
    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    // Tự động điều chỉnh độ rộng cột
    const colWidths = keys.map((key, i) => {
        const headerLength = headerRow[i].length;
        const maxDataLength = Math.max(
            ...dataRows.map(row => String(row[i] || '').length),
            headerLength
        );
        return { wch: Math.min(Math.max(maxDataLength + 2, 10), 50) };
    });
    ws['!cols'] = colWidths;
    // Thêm worksheet vào workbook
    const sheetName = `Học bổng ${vueData.NienKhoa || ''}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    // Tạo tên file
    const fileName = `Danh_sach_hoc_bong_${vueData.NienKhoa || ''}_HK${vueData.Semester?.value || ''}_Khoi${vueData.KhoiItem?.value || ''}.xlsx`;
    // Xuất file
    XLSX.writeFile(wb, fileName);
    Vue.$toast.success('Xuất Excel thành công', { position: 'top' });
}
vueData.renderDSHocBong = renderDSHocBong
vueData.onSave = onSave
vueData.onExportExcel = onExportExcel