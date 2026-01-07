function initAllClass() {
    const obj = vueData.DSLop.find(x => x.LopID == '-1')
    if (!obj) {
        vueData.DSLop.unshift({
            TenLop: "Tất cả các lớp",
            LopID: '-1'
        })
    }
}
function exportExcel() {
    // 1. Dữ liệu mẫu (mảng object)
    const rawData = vueData.DSHocSinh
    // 2. Định nghĩa header nhóm (dòng 1) và header cột (dòng 2)
    const headerRow1 = [
        "Thông tin học sinh", null, null, null, null,
        "Tiếng Việt", null,
        "Toán", null,
        "Ngoại ngữ", null,
        "Lịch sử và Địa lí", null,
        "Khoa học / TNXH", null,
        "Tin học và Công nghệ (Tin học)", null,
        "Tin học và Công nghệ (Công nghệ)", null,
        "Đạo đức",
        "Thể dục",
        "Âm nhạc",
        "Mĩ thuật",
        "Hoạt động trải nghiệm",
        "Tiếng dân tộc",
        "Năng lực chung", null, null,
        "Năng lực đặc thù", null, null, null, null, null, null,
        "Phẩm chất chủ yếu", null, null, null, null,
        "Đánh giá kết quả giáo dục", null, null, null,
        "Khen thưởng", null,
        //hết các cột row 1
    ]
    const headerRow2 = vueData.columnHeader.filter(item => item.title != 'STT' && item.title != 'HSLopID').map(item => item.title)
    // [
    //     "Lop",
    //     "SoDB",
    //     "HoTen",
    //     "NgaySinh",
    //     "Phai",
    //     "Mức đạt được",
    //     "Điểm KTĐK",
    //     "Mức đạt được",
    //     "Điểm KTĐK",
    //     "Mức đạt được",
    //     "Điểm KTĐK",
    //     "Mức đạt được",
    //     "Điểm KTĐK",
    //     "Mức đạt được",
    //     "Điểm KTĐK",
    //     "Mức đạt được",
    //     "Điểm KTĐK",
    //     "Mức đạt được",
    //     "Điểm KTĐK",
    //     "Mức đạt được",
    //     "Mức đạt được",
    //     "Mức đạt được",
    //     "Mức đạt được",
    //     "Mức đạt được",
    //     "Mức đạt được",
    //     "Tự học và tự chủ",
    //     "Giao tiếp và hợp tác",
    //     "Giải quyết vấn đề và sáng tạo",
    //     "Ngôn ngữ",
    //     "Tính toán",
    //     "Khoa học",
    //     "Công nghệ",
    //     "Tin học",
    //     "Thẩm mỹ",
    //     "Thể chất",
    //     "Yêu nước",
    //     "Nhân ái",
    //     "Chăm chỉ",
    //     "Trung thực",
    //     "Trách nhiệm",
    //     "Hoàn thành xuất sắc",
    //     "Hoàn thành tốt",
    //     "Hoàn Thành",
    //     "Chưa hoàn thành",
    //     "Cuối năm",
    //     "Đột xuất",
    //     "Chưa được lên lớp",
    //     "Đánh giá",
    //     "Danh hiệu",
    //     "Khen thưởng",
    //     "Phân loại tuyển thẳng",
    //     "Flyers",
    //     "Điểm Tiếng Anh",
    //     "Đăng ký học tiếp",
    //     "Phối hợp CMHS",
    //     "Nhận xét về Phụ Huynh",
    //     "Nhận xét về Học Sinh",
    //     "Đề xuất/Nội dung cam kết"
    // ]
    // 3. Đặt thứ tự key để đảm bảo map đúng cột theo headerRow2
    const keys = vueData.columnHeader.filter(item => item.title != 'STT' && item.title != 'HSLopID').map(item => item.name)
    // [
    //     "TenLop",
    //     "SoDanhBo",
    //     "HoTen",
    //     "NgaySinh",
    //     "Phai",
    //     "TVM",
    //     "TVD",
    //     "TOM",
    //     "TOD",
    //     "NNM",
    //     "NND",
    //     "SDM",
    //     "SDD",
    //     "KHM",
    //     "KHD",
    //     "THM",
    //     "THD",
    //     "CNM",
    //     "CND",
    //     "DDM",
    //     "TDM",
    //     "ANM",
    //     "MTM",
    //     "KTM",
    //     "DTM",
    //     "NL1",
    //     "NL2",
    //     "NL3",
    //     "NL4",
    //     "NL5",
    //     "NL6",
    //     "NL7",
    //     "NL8",
    //     "NL9",
    //     "NL10",
    //     "PC1",
    //     "PC2",
    //     "PC3",
    //     "PC4",
    //     "PC5",
    //     "HoanThanhXuatSac",
    //     "HoanThanhTot",
    //     "HoanThanh",
    //     "ChuaHoanThanh",
    //     "KTCN",
    //     "KTDX",
    //     "ChuaLenLop",
    //     "DanhGia",
    //     "DanhHieu",
    //     "KhenThuong",
    //     "PhanLoai_TuyenThang",
    //     "Flyers",
    //     "DiemTA",
    //     "DKHocTiep",
    //     "PhoiHopCMHS",
    //     "NhanXetGVCN_VePhuHuynh_HTML",
    //     "NhanXetGVCN_VeHocSinh_HTML",
    //     "DeXuat_NDCamKet"
    // ]
    // 4. Chuyển rawData thành mảng 2 chiều
    const dataRows = rawData.map(item =>
        keys.map(k => item[k] != null ? item[k] : "")
    )
    console.log('dataRows', dataRows)
    // 5. Gom lại AOA (array of arrays)
    const aoa = [
        headerRow1,
        headerRow2,
        ...dataRows
    ]
    // 6. Tạo worksheet từ AOA và thiết lập merge
    const worksheet = XLSX.utils.aoa_to_sheet(aoa)
    worksheet['!merges'] = [
        //Thông tin học sinh
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        //Tiếng Việt
        { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } },
        //Toán
        { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } },
        //Ngoại ngữ
        { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } },
        //Lịch sử và Địa lí
        { s: { r: 0, c: 11 }, e: { r: 0, c: 12 } },
        //Khoa học / TNXH
        { s: { r: 0, c: 13 }, e: { r: 0, c: 14 } },
        //Tin học và Công nghệ (Tin học)
        { s: { r: 0, c: 15 }, e: { r: 0, c: 16 } },
        //Tin học và Công nghệ (Công nghệ)
        { s: { r: 0, c: 17 }, e: { r: 0, c: 18 } },
        //Đạo đức
        { s: { r: 0, c: 19 }, e: { r: 0, c: 19 } },
        //Thể dục
        { s: { r: 0, c: 20 }, e: { r: 0, c: 20 } },
        //Âm nhạc
        { s: { r: 0, c: 21 }, e: { r: 0, c: 21 } },
        //Mĩ thuật
        { s: { r: 0, c: 22 }, e: { r: 0, c: 22 } },
        //Hoạt động trải nghiệm
        { s: { r: 0, c: 23 }, e: { r: 0, c: 23 } },
        //Tiếng dân tộc
        { s: { r: 0, c: 24 }, e: { r: 0, c: 24 } },
        //Năng lực chung
        { s: { r: 0, c: 25 }, e: { r: 0, c: 27 } },
        //Năng lực đặc thù
        { s: { r: 0, c: 28 }, e: { r: 0, c: 34 } },
        //Phẩm chất chủ yếu
        { s: { r: 0, c: 35 }, e: { r: 0, c: 39 } },
        //Đánh giá kết quả giáo dục
        { s: { r: 0, c: 40 }, e: { r: 0, c: 43 } },
        //Khen thưởng
        { s: { r: 0, c: 44 }, e: { r: 0, c: 45 } },
        //con lai
        { s: { r: 0, c: 46 }, e: { r: 0, c: 57 } },
    ]
    // 7. Tạo workbook, append sheet và ghi file
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "TongKetHocKiCap1")
    XLSX.writeFile(workbook, "TongKetHocKiCap1.xlsx")
}
async function TongKet_GetDTBMonHocByKhoiLop() {
    vueData.DSHocSinh = []
    if (vueData.Is_InCaKhoi) {
        getDSLop()
    } else {
        await ajaxCALL(`https://tapi.lhbs.vn/psmark1/LMS_GetBangTongHopKetQua`,
            {
                LopID: vueData.LopItem.LopID,
                KyDanhGia: vueData.Semester.value
            }, res => {
                vueData.DSHocSinh_API_TongKet = res.data
                vueData.dataDiem = res.data
                ajaxCALL('lms/NhanXetThang_CuoiNam_Get', {
                    LopID: vueData.LopItem.LopID
                }, res => {
                    vueData.dataDiem_ChuyenCap = res.data
                    initSpread()
                })
            })
    }
}
const LMS_GetBangTongHopKetQua = (lopid) => {
    return new Promise(resolve => {
        ajaxCALL(`/psmark1/LMS_GetBangTongHopKetQua`,
            {
                LopID: lopid,
                KyDanhGia: vueData.Semester.value
            },
            res => {
                vueData.dataDiem = res.data
                resolve()
            }
        )
    })
}
const NhanXetThang_CuoiNam_Get = (lopid) => {
    return new Promise(resolve => {
        ajaxCALL('lms/NhanXetThang_CuoiNam_Get', {
            LopID: lopid
        }, res_nxt => {
            vueData.dataDiem_ChuyenCap = res_nxt.data
            resolve()
        })
    })
}
async function TongKet_GetDTBMonHocByKhoiLopHangLoat(lopid) {
    return new Promise(async resolve => {
        await LMS_GetBangTongHopKetQua(lopid)
        await NhanXetThang_CuoiNam_Get(lopid)
        initSpread()
        resolve()
    })
}
function renderDSKhoi() {
    const DSKhoi = Array.from({ length: 12 }).map((_, i) => {
        const value = i + 1;
        let CapID;
        if (value >= 1 && value <= 5) {
            CapID = 1;
        } else if (value >= 6 && value <= 9) {
            CapID = 2;
        } else if (value >= 10 && value <= 12) {
            CapID = 3;
        }
        return {
            title: `Khối ${value}`,
            value,
            CapID,
        };
    });
    vueData.DSKhoi = DSKhoi.filter((x) => x.CapID === vueData.CapID);
    return DSKhoi;
}
function renderDSHocSinh_QLD() {
    const _dsHocSinh = []
    const dsHocSinhID = [...new Set(vueData.DSHocSinh_API_QLD.map(x => x.HocSinhID))]
    //Khởi tạo danh sách học sinh
    for (var HocSinhID of dsHocSinhID) {
        const objHocSinh = vueData.DSHocSinh_API_QLD.find(x => x.HocSinhID === HocSinhID)
        if (objHocSinh) _dsHocSinh.push({
            ...objHocSinh,
            DSCotDiem: vueData.DSHocSinh_API_QLD.filter(x => x.HocSinhID === HocSinhID)
        })
    }
    vueData.DSHocSinhQLD = _dsHocSinh
}
function initSpread() {
    handleHeaders()
    handleData()
}
function handleHeaders() {
    console.log('vueData.dataDiem', vueData.dataDiem)
    if (!Array.isArray(vueData.dataDiem) || vueData.dataDiem.length === 0) {
        console.warn('Không có dữ liệu để tạo header');
        return;
    }
    vueData.nestedHeaders = [
        [
            { title: 'Thông tin học sinh', colspan: 5 },
            { title: 'Tiếng Việt', colspan: 2 },
            { title: 'Toán', colspan: 2 },
            { title: 'Ngoại ngữ', colspan: 2 },
            { title: 'Lịch sử và Địa lí', colspan: 2 },
            { title: 'Khoa học / TNXH', colspan: 2 },
            { title: 'Tin học và Công nghệ (Tin học)', colspan: 2 },
            { title: 'Tin học và Công nghệ (Công nghệ)', colspan: 2 },
            { title: 'Đạo đức', colspan: 1 },
            { title: 'Thể dục', colspan: 1 },
            { title: 'Âm nhạc', colspan: 1 },
            { title: 'Mĩ thuật', colspan: 1 },
            { title: 'Hoạt động trải nghiệm', colspan: 1 },
            { title: 'Tiếng dân tộc', colspan: 1 },
            { title: 'Năng lực chung', colspan: 3 },
            { title: 'Năng lực đặc thù', colspan: 7 },
            { title: 'Phẩm chất chủ yếu', colspan: 5 },
            { title: 'Đánh giá kết quả giáo dục', colspan: 4 },
            { title: 'Khen thưởng', colspan: 2 }
        ],
    ];
    // let headerDefault = Object.keys(vueData.dataDiem[0])
    // let keyData = Object.keys(vueData.dataDiem[0])
    // let headerDefault = [...new Set(['STT', 'TenLop', 'SoDanhBo', 'HoTen', 'NgaySinh', 'Phai', ...keyData])]
    // const header_ChuyenCap = [
    //     "PhanLoai_TuyenThang",
    //     "Flyers",
    //     "DiemTA",
    //     "DKHocTiep",
    //     "PhoiHopCMHS",
    //     "NhanXetGVCN_VePhuHuynh_HTML",
    //     "NhanXetGVCN_VeHocSinh_HTML",
    //     "DeXuat_NDCamKet",
    // ]
    // headerDefault = [...headerDefault, ...header_ChuyenCap]
    // console.log('headerDefault', headerDefault)
    const headerDefault = [
        'STT', 'TenLop', 'HocSinhID', 'SoDanhBo', 'HoTen', 'NgaySinh', 'Phai',
        'TVM', 'TVD', 'TOM', 'TOD', 'NNM', 'NND',
        'SDM', 'SDD', 'KHM', 'KHD', 'THM', 'THD',
        'CNM', 'CND', 'DDM', 'TDM', 'ANM', 'MTM',
        'KTM', 'DTM',
        'NL1', 'NL2', 'NL3', 'NL4', 'NL5', 'NL6', 'NL7', 'NL8', 'NL9', 'NL10',
        'PC1', 'PC2', 'PC3', 'PC4', 'PC5',
        'HoanThanhXuatSac', 'HoanThanhTot', 'HoanThanh', 'ChuaHoanThanh',
        'KTCN', 'KTDX', 'ChuaLenLop',
        'DanhGia', 'DanhHieu', 'KhenThuong',
        'PhanLoai_TuyenThang', 'Flyers', 'DiemTA',
        'DKHocTiep', 'PhoiHopCMHS',
        'NhanXetGVCN_VePhuHuynh_HTML',
        'NhanXetGVCN_VeHocSinh_HTML',
        'DeXuat_NDCamKet'
    ];
    let columnThongTinHocSinh = []
    const columnMapping = {
        STT: { width: 1, type: 'hidden' },
        HSLopID: { width: 1, type: 'hidden' },
        Khoi: { width: 1, type: 'hidden' },
        SoDanhBo: { width: 60, title: 'SoDB' },
        HocSinhID: { width: 80, title: "Mã học sinh" },
        HoTen: { width: 180, align: 'left' },
        TenLop: { width: 50, title: 'Lop' },
        UuDiem: { width: 600, title: 'Ưu điểm', align: 'left' },
        NhuocDiem: { width: 450, title: 'Nhược điểm', align: 'left' },
        DeXuat: { width: 700, title: 'Đề xuất', align: 'left' },
        NgaySinh: { width: 100 },
        DanhHieu: { width: 120, title: 'Danh hiệu' },
        DanhGia: { width: 130, title: 'Đánh giá' },
        DTB: { title: 'ĐTB' },
        Phep: { title: 'vP' },
        KhongPhep: { title: 'vKP' },
        TongBuoiNghi: { title: 'vTong' },
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
    const titleMapping = {
        TVM: 'Mức đạt được', TOM: 'Mức đạt được', KHM: 'Mức đạt được',
        SDM: 'Mức đạt được', NNM: 'Mức đạt được', THM: 'Mức đạt được',
        CNM: 'Mức đạt được', DDM: 'Mức đạt được', ANM: 'Mức đạt được',
        MTM: 'Mức đạt được', KTM: 'Mức đạt được', TDM: 'Mức đạt được',
        DTM: 'Mức đạt được',
        TVD: 'Điểm KTĐK', TOD: 'Điểm KTĐK', KHD: 'Điểm KTĐK',
        SDD: 'Điểm KTĐK', NND: 'Điểm KTĐK', THD: 'Điểm KTĐK',
        CND: 'Điểm KTĐK', DTD: 'Điểm KTĐK'
    };
    const NLMapping = {
        NL1: { width: 60, title: 'Tự học và tự chủ' },
        NL2: { width: 60, title: 'Giao tiếp và hợp tác' },
        NL3: { width: 60, title: 'Giải quyết vấn đề và sáng tạo' },
        NL4: { width: 60, title: 'Ngôn ngữ' },
        NL5: { width: 60, title: 'Tính toán' },
        NL6: { width: 60, title: 'Khoa học' },
        NL7: { width: 60, title: 'Công nghệ' },
        NL8: { width: 60, title: 'Tin học' },
        NL9: { width: 60, title: 'Thẩm mỹ' },
        NL10: { width: 60, title: 'Thể chất' }
    };
    const PCMapping = {
        PC1: { width: 60, title: 'Yêu nước' },
        PC2: { width: 60, title: 'Nhân ái' },
        PC3: { width: 60, title: 'Chăm chỉ' },
        PC4: { width: 60, title: 'Trung thực' },
        PC5: { width: 60, title: 'Trách nhiệm' }
    };
    const DGKQ_GGMapping = {
        HoanThanhXuatSac: { width: 60, title: 'Hoàn thành xuất sắc' },
        HoanThanhTot: { width: 60, title: 'Hoàn thành tốt' },
        HoanThanh: { width: 60, title: 'Hoàn Thành' },
        ChuaHoanThanh: { width: 60, title: 'Chưa hoàn thành' },
    };
    const KhenThuong_Mapping = {
        KTCN: { width: 60, title: 'Cuối năm' },
        KTDX: { width: 60, title: 'Đột xuất' },
    };
    const LenLop_Mapping = {
        ChuaLenLop: { width: 60, title: "Chưa được lên lớp" }
    }
    const KhenThuong_ND_Mapping = {
        KhenThuong: { title: 120, title: "Khen thưởng" }
    }
    const TTChuyenCapMapping = {
        PhoiHopCMHS: { width: 60, title: 'Phối hợp CMHS' },
        PhanLoai_TuyenThang: { width: 120, title: 'Phân loại tuyển thẳng' },
        Flyers: { width: 60, title: 'Flyers' },
        DiemTA: { width: 60, title: 'Điểm Tiếng Anh' },
        DKHocTiep: { width: 60, title: 'Đăng ký học tiếp', type: "checkbox" },
        DeXuat_NDCamKet: { width: 400, title: 'Đề xuất/Nội dung cam kết', align: 'left' },
        NhanXetGVCN_VePhuHuynh_HTML: { width: 400, title: 'Nhận xét về Phụ Huynh', type: "html", align: 'left' },
        NhanXetGVCN_VeHocSinh_HTML: { width: 400, title: 'Nhận xét về Học Sinh', type: "html", align: 'left' }
    }
    for (const key of headerDefault) {
        let column = {
            type: 'text',
            title: key,
            name: key,
            // width: 40,
            backGroundColor: null,
            wrap: true,
            align: "center",
            readOnly: true,
            style: 'font-size:8px',
            ...columnMapping[key], // Áp dụng thuộc tính từ object ánh xạ
            ...NLMapping[key],  // Áp dụng thuộc tính từ object ánh xạ NL
            ...PCMapping[key],
            ...DGKQ_GGMapping[key],
            ...KhenThuong_Mapping[key],
            ...LenLop_Mapping[key],
            ...KhenThuong_ND_Mapping[key],
            ...TTChuyenCapMapping[key],
        };
        if (titleMapping[key]) {
            column.title = titleMapping[key];
            column.width = 50;
        }
        if (NLMapping[key]) {
            column.title = NLMapping[key].title;
        }
        if (PCMapping[key]) {
            column.title = PCMapping[key].title;
        }
        if (DGKQ_GGMapping[key]) {
            column.title = DGKQ_GGMapping[key].title;
        }
        if (KhenThuong_Mapping[key]) {
            column.title = KhenThuong_Mapping[key].title;
        }
        if (LenLop_Mapping[key]) {
            column.title = LenLop_Mapping[key].title;
        }
        if (KhenThuong_ND_Mapping[key]) {
            column.title = KhenThuong_ND_Mapping[key].title;
        }
        if (TTChuyenCapMapping[key]) {
            column.title = TTChuyenCapMapping[key].title;
        }
        columnThongTinHocSinh.push(column);
    }
    vueData.columnHeader = [...columnThongTinHocSinh];
    console.log('vueData.columnHeader', vueData.columnHeader);
    vueData.keyComp++;
}
function handleData() {
    for (var item of vueData.dataDiem) {
        const objHocSinh = vueData.dataDiem_ChuyenCap.find(x => x.SoDanhBo === item.SoDanhBo)
        let obj = {}
        if (objHocSinh) {
            obj.PhoiHopCMHS = objHocSinh.PhoiHopCMHS
            obj.NhanXetGVCN_VePhuHuynh_HTML = objHocSinh.NhanXetGVCN_VePhuHuynh_HTML
            obj.NhanXetGVCN_VeHocSinh_HTML = objHocSinh.NhanXetGVCN_VeHocSinh_HTML
            obj.PhanLoai_TuyenThang = objHocSinh.PhanLoai_TuyenThang
            obj.Flyers = objHocSinh.Flyers
            obj.DiemTA = objHocSinh.DiemTA
            obj.DKHocTiep = objHocSinh.DKHocTiep
            obj.DeXuat_NDCamKet = objHocSinh.DeXuat_NDCamKet
        }
        vueData.DSHocSinh.push({ ...item, ...obj })
    }
    vueData.DSHocSinh = vueData.DSHocSinh.sort((a, b) => a.TenLop.localeCompare(b.TenLop));
}
async function getDSLop() {
    vueData.DSHocSinh = []
    vueData.DSHocSinhChange = []
    vueData.dataDiem_ChuyenCap = []
    let dslopFilter = vueData.DSLop.filter(item => !item.LopID.includes('N'))
    for (var item of dslopFilter) {
        await TongKet_GetDTBMonHocByKhoiLopHangLoat(item.LopID)
    }
}
function onSave() {
    let parseJSON = vueData.DSHocSinh.map(item => {
        return {
            HocSinhID: item.HocSinhID,
            LopID: item.LopID,
            KQRL_Sau: item.KQRenLuyen
        }
    })
    ajaxCALL('lms/XetKetQuaRenLuyen_Upsert_JSON',
        {
            json: JSON.stringify(parseJSON)
        },
        res => {
            console.log('res', res)
        }
    )
}
function initColumn() {
    for (var column of vueData.columnHeader) {
        column.render = function (cell, value, x, y, instance, options) {
            if (cell.innerHTML !== '') {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = value;
                // Thêm DOM vào ô
                cell.innerHTML = '';
                cell.appendChild(tempDiv.firstChild); // Gắn DOM vào ô
            }
        }
    }
}
function renderDSHocSinhChange() {
    const arr = []
    for (var HocSinhID of vueData.DSHocSinhChange) {
        const obj = vueData.dataDiem_ChuyenCap.find(x => x.HocSinhID === HocSinhID)
        if (obj) arr.push({
            HoTen: obj.HoTen,
            NgaySinh: obj.NgaySinh,
            Nu: obj.Nu,
            SoDanhBo: obj.SoDanhBo,
            HocSinhID: obj.HocSinhID,
        })
    }
    return renderDSHocSinhChange
}
vueData.onSave = onSave
vueData.getDSLop = getDSLop
vueData.initSpread = initSpread
vueData.TongKet_GetDTBMonHocByKhoiLop = TongKet_GetDTBMonHocByKhoiLop
vueData.renderDSHocSinhChange = renderDSHocSinhChange
vueData.exportExcel = exportExcel
vueData.initAllClass = initAllClass