
const isCheckKeyExist = (paramKey) => {
    let flag = false
    for (var hocSinh of vueData.DSHocSinh) {
        for (var key in hocSinh) {
            if (key === paramKey) {
                console.log(key, paramKey)
                flag = true
                return flag
            }
        }
    }
    return flag
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
async function exportGiayKhen() {
    vueData.isLoadingExportGiayKhen = true
    const DSDanhHieu = [
        {
            List_CapID: [1, 2, 3],
            DanhHieu_VI: "Học sinh Xuất sắc", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of distinguished performance in Academic Achievements"
        },
        {
            List_CapID: [2, 3],
            DanhHieu_VI: "Học sinh Giỏi", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of outstanding performance in Academic Achievements"
        },
        {
            List_CapID: [1],
            DanhHieu_VI: "Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of outstanding performance in Academic Achievements"
        }
    ]
    const Certs = []
    const priority = DSDanhHieu.map(x => x.DanhHieu_VI)
    console.log('priority', priority)
    const sortDSHocSinh_By_DanhHieu = vueData.DSHocSinh
        .map(x => {
            if (x.TenLop === '10B1' || x.TenLop === '10B2') x.TenLop = '10C'
            if (x.TenLop === '11C1' || x.TenLop === '11C2') x.TenLop = '11C'
            if (x.TenLop === '12C1' || x.TenLop === '12C2') x.TenLop = '12C'
            return {
                ...x,
            }
        })
        .filter(x => x.DanhHieu?.length > 0)
        .sort((a, b) => {
            // So sánh theo TenLop trước
            const tenLopCompare = a.TenLop.localeCompare(b.TenLop);
            if (tenLopCompare !== 0) return tenLopCompare;
            // Nếu TenLop giống nhau, so sánh theo thứ tự DanhHieu trong priority
            return priority.indexOf(a.DanhHieu?.trim()) - priority.indexOf(b.DanhHieu?.trim());
        });
    console.log('sortDSHocSinh_By_DanhHieu', sortDSHocSinh_By_DanhHieu.map(x => x.DanhHieu))
    for (var data of sortDSHocSinh_By_DanhHieu) {
        const objEN_DanhHieu = DSDanhHieu.find(x => x.DanhHieu_VI === data.DanhHieu)
        // const tenLop = data.TenLop
        // if (data.TenLop.startWidth)
        Certs.push({
            KhenTang_Vi: "Khen tặng học sinh",
            KhenTang_En: "We gladly present",
            HoTen: data.HoTen.toUpperCase(),
            Lop: `CLASS ${data.TenLop}`,
            DanhHieu_Vi: "Đạt danh hiệu " + data.DanhHieu ?? "",
            DanhHieu_En: objEN_DanhHieu?.DanhHieu_EN ?? "",
            NamHoc_Vi: `Năm học ${vueData.NienKhoa}-${vueData.NienKhoa + 1}`,
            NamHoc_En: `In the school year ${vueData.NienKhoa}-${vueData.NienKhoa + 1}`,
            NgayThangNam_Vi: data.NgayKhenThuong_VI ?? "",
            NgayThangNam_En: data.NgayKhenThuong_EN ?? "",
            SoQuyetDinh: `${data.SoQuyetDinhKT ?? ""}/QĐ-SNLH. NO: ${data.VaoSoKT?.toString()?.padStart(2, '0') ?? ""}`,
            TenHieuTruong: "Phan Quang Vinh"
        })
    }
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({ Certs: Certs }),
        redirect: "follow"
    };
    fetch("https://gencert.iotsoftvn.com/api/cert-generators/multi-pdf", requestOptions)
        .then((response) => response.blob())
        .then(blob => {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = `DanhSachGiayKhen.pdf`
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); //afterwards we remove the element again
            vueData.isLoadingExportGiayKhen = false
        })
        .catch((error) => {
            console.log(error)
            vueData.isLoadingExportGiayKhen = false
        });
}
function TongKet_GetDTBMonHocByKhoiLop() {
    vueData.DSHocSinh = []
    vueData.DSKhenThuong = []
    if (vueData.Is_InCaKhoi) {
        getDSLop()
        return
    }
    // Detect paired classes by base TenLop (e.g. "12C1","12C2" share base "12C")
    const selectedTenLop = vueData.LopItem.TenLop ?? ''
    const baseName = selectedTenLop.replace(/\d+$/, '')
    const isNamedWithDigit = baseName !== selectedTenLop
    const pairedLops = isNamedWithDigit
        ? vueData.DSLop.filter(l =>
            !String(l.LopID).includes('N') &&
            String(l.LopID) !== String(vueData.LopItem.LopID) &&
            (l.TenLop ?? '').replace(/\d+$/, '') === baseName
          )
        : []
    if (pairedLops.length > 0) {
        const allLops = [vueData.LopItem, ...pairedLops]
        ;(async () => {
            const khenThuongArr = await Promise.all(
                allLops.map(l => fetchPromise('lms/KhenThuong_Get', { LopID: l.LopID }))
            )
            khenThuongArr.forEach(kt => vueData.DSKhenThuong.push(kt))
            for (const lop of allLops) {
                await TongKet_GetDTBMonHocByKhoiLopHangLoat(lop.LopID)
            }
        })()
        return
    }
    ;(async () => {
        await new Promise(resolve => {
            ajaxCALL(`https://tapi.lhbs.vn/diemc${vueData.CapID}/LMS_GetTongKetDTBMonHocByLop`,
                {
                    KhoiID: vueData.KhoiID,
                    LopID: vueData.LopItem.LopID,
                    HocKy: vueData.Semester.value,
                    NienKhoa: vueData.NienKhoa
                }, res => {
                    vueData.DSHocSinh_API_TongKet = res.data
                    vueData.dataDiem = res.data
                    resolve()
                })
        })
        const khenThuong = await fetchPromise('lms/KhenThuong_Get', { LopID: vueData.LopItem.LopID })
        vueData.DSKhenThuong.push(khenThuong)
        initSpread()
        await mergeNhanXetThang(vueData.LopItem.LopID)
    })()
}
async function mergeNhanXetThang(lopid) {
    try {
        const dsNhanXet = await fetchPromise('lms/NhanXetThang_Thang1_Thang5_Get', {
            LopID: lopid,
            HocKi: vueData.Semester.value,
            NienKhoa: vueData.NienKhoa
        })
        if (!Array.isArray(dsNhanXet) || dsNhanXet.length === 0) return
        for (var item of vueData.DSHocSinh) {
            const obj = dsNhanXet.find(x => x.HocSinhID == item.HocSinhID)
            if (obj) {
                item.UuDiem = obj.UuDiem ?? item.UuDiem ?? ''
                item.NhuocDiem = obj.NhuocDiem ?? item.NhuocDiem ?? ''
                item.DeXuat = obj.DeXuat ?? item.DeXuat ?? ''
            }
        }
        vueData.keyComp++
    } catch (e) {
        console.error('mergeNhanXetThang error', e)
    }
}
async function TongKet_GetDTBMonHocByKhoiLopHangLoat(lopid) {
    await new Promise(resolve => {
        ajaxCALL(`https://tapi.lhbs.vn/diemc${vueData.CapID}/LMS_GetTongKetDTBMonHocByLop`,
            {
                KhoiID: vueData.KhoiItem?.KhoiID,
                LopID: lopid,
                HocKy: vueData.Semester.value,
                NienKhoa: vueData.NienKhoa
            }, res => {
                vueData.dataDiem = res.data
                console.log('lopid', lopid)
                initSpread()
                resolve()
            })
    })
    await mergeNhanXetThang(lopid)
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
    handleData()
    handleHeaders()
}
function handleHeaders() {
    if (!Array.isArray(vueData.dataDiem) || vueData.dataDiem.length === 0) {
        console.warn('Không có dữ liệu để tạo header');
        return;
    }
    let keys = [];
    if (vueData.CapID === 2) {
        keys = [
            'STT', 'HocSinhID', 'HoTen', 'TenLop', 'NgaySinh',
            'GDDP', 'HDTN', 'HKTN', 'JA', 'LS-DL',
            'NT', 'AI', 'toan', 'tin', 'van', 'anh',
            'gdcd', 'cn', 'td',
            // 'DTB',
            'HocLuc', 'KQRenLuyen', 'DanhHieu',
            'Phep', 'KhongPhep', 'TongBuoiNghi',
            'UuDiem', 'NhuocDiem', 'DeXuat', 'HocSinhLopID',
            'SoQuyetDinhKT',
            'VaoSoKT'
        ]
    } else {
        keys = [
            "STT", "HocSinhID", "HoTen", "TenLop", "NgaySinh",
            "GDDP", "GDKT-PL", "gdqp", "HDTN", "JA", "toan", "ly", "hoa",
            "sinh", "tin", "van", "su", "dia", "anh", "td",
            // "DTB",
            "HocLuc", "KQRenLuyen", "DanhHieu",
            "Phep", "KhongPhep",
            "TongBuoiNghi", "UuDiem", "NhuocDiem", "DeXuat",
            "HocSinhLopID",
            "SoQuyetDinhKT", "VaoSoKT"
        ]
    }
    let headerDefault = keys//Object.keys(vueData.dataDiem)
    headerDefault = [...headerDefault, 'NgayKhenThuong_VI', 'NgayKhenThuong_EN']
    let columnThongTinHocSinh = []
    const columnMapping = {
        STT: { width: 1, type: 'hidden' },
        HocSinhID: { width: 100, title: "Mã học sinh" },
        HoTen: { width: 180, align: 'left', title: "Họ tên" },
        TenLop: { width: 50, title: 'Lớp' },
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
        },
        VaoSoKT: { title: "Số vào sổ KT", width: 100 },
        SoQuyetDinhKT: { title: "Số quyết định KT", width: 150 },
        NgayKhenThuong_VI: { title: "Ngày KT (VI)", width: 200 },
        NgayKhenThuong_EN: { title: "Ngày KT (EN)", width: 200 },
        HocSinhLopID: {
            width: 60,
            type: 'hidden'
        },
        KhenThuongID: { width: 1, type: "hidden" }
    };
    console.log('data', vueData.DSHocSinh[0])
    for (var key of headerDefault) {
        let column = {
            type: 'text',
            title: key.toLocaleUpperCase(),
            name: key,
            width: 100,
            backGroundColor: null,
            wrap: true,
            align: "center",
            readOnly: true,
            style: 'font-size:8px',
            ...columnMapping[key], // Áp dụng thuộc tính từ object ánh xạ
        };
        if (key === 'HKTN') {
            column = { title: 'KHTN', ...columnMapping[key], };
        }
        // if (key === 'hoa' && isCheckKeyExist('hoa')) {
        //     column = { title: 'HOA', ...columnMapping[key], };
        // }
        // if (key === 'sinh' && isCheckKeyExist('sinh')) {
        //     column = { title: 'SINH', ...columnMapping[key], };
        // }
        columnThongTinHocSinh.push(column)
    }
    vueData.columnHeader = [...columnThongTinHocSinh]
    vueData.keyComp++
}
function handleData() {
    for (var item of vueData.dataDiem) {
        vueData.DSHocSinh.push(item)
    }
    const flatArrDSKhenThuong = vueData.DSKhenThuong.flat()
    for (var item of vueData.DSHocSinh) {
        const objHS = flatArrDSKhenThuong.find(x => x.HocSinhID == item.HocSinhID)
        item.NgayKhenThuong_EN = objHS?.NgayKhenThuong_EN ?? ''
        item.NgayKhenThuong_VI = objHS?.NgayKhenThuong_VI ?? ''
        item.SoQuyetDinhKT = objHS?.SoQuyetDinhKT ?? ''
        item.VaoSoKT = objHS?.VaoSoKT ?? ''
    }
    vueData.DSHocSinh = vueData.DSHocSinh.sort((a, b) => a.TenLop.localeCompare(b.TenLop));
}
async function getDSLop() {
    vueData.DSHocSinh = []
    vueData.DSHocSinhChange = [] //Clear lại ds học sinh change
    vueData.DSKhenThuong = []
    ajaxCALL('lms/KhenThuong_Get_By_KhoiID', {
        KhoiID: vueData.KhoiItem.KhoiID,
        NienKhoa: vueData.NienKhoa
    }, res => {
        vueData.DSKhenThuong = res.data
    })
    let dslopFilter = vueData.DSLop.filter(item => !item.LopID.includes('N'))
    const promise = () => {
        return new Promise(async resolve => {
            for (var item of dslopFilter) {
                await TongKet_GetDTBMonHocByKhoiLopHangLoat(item.LopID)
            }
            resolve()
        })
    }
    promise().then(() => {
        console.log('done')
    })
}
function onSave() {
    confirm({
        title: `Xác nhận lưu ${vueData.DSHocSinh.length} học sinh?`,
        action: function () {
            //Tạo biến distinctHocSinhChange để lấy học sinh có thay đổi dữ liệu dùng Set để distint HocSinhID
            // let distinctHocSinhChange = [...new Set(vueData.DSHocSinhChange.map(HocSinhID => HocSinhID))]
            // let parseJSON = vueData.DSHocSinh.filter(item => distinctHocSinhChange.includes(item.HocSinhID)).map(item => {
            //     return {
            //         ...item,
            //         HocSinhID: item.HocSinhID,
            //         HocSinhLopID: item.HocSinhLopID,
            //         TenLop: item.TenLop,
            //         KQRL_Sau: item.KQRenLuyen,
            //         KQRenLuyen: item.KQRenLuyen
            //     }
            // })
            ajaxCALL('lms/XetKetQuaRenLuyen_Upsert_JSON',
                {
                    json: vueData.DSHocSinh.map(x => ({ ...x, KQRL_Sau: x.KQRenLuyen })),
                    NienKhoa: vueData.NienKhoa,
                },
                res => {
                    console.log('res', res)
                    // Vue.$toast.success('Lưu xếp loại kết quả rèn luyện thành công', { position: 'top' })
                    vueData.DSHocSinhChange = []
                }
            )
            if (vueData.CapID === 2) {
                ajaxCALL('/diemc2/LMS_UpdateXetHanhKiem', {
                    jsData: vueData.DSHocSinh,
                    HocKy: vueData.Semester.value
                },
                    res => {
                        Vue.$toast.success('Lưu KQRL thành công', { position: 'top' })
                        vueData.DSHocSinhChange = []
                        TongKet_GetDTBMonHocByKhoiLop()
                        // vueData.IsShowDialogConfirm = false
                    }
                )
            }
            if (vueData.CapID === 3) {
                ajaxCALL('/diemc3/LMS_UpdateXetHanhKiem', {
                    jsData: vueData.DSHocSinh,
                    HocKy: vueData.Semester.value
                },
                    res => {
                        Vue.$toast.success('Lưu KQRL thành công', { position: 'top' })
                        vueData.DSHocSinhChange = []
                        TongKet_GetDTBMonHocByKhoiLop()
                        // vueData.IsShowDialogConfirm = false
                    }
                )
            }
        }
    })
}
function renderDSHocSinhChange() {
    const arr = []
    for (var HocSinhID of vueData.DSHocSinhChange) {
        const obj = vueData.dataDiem.find(x => x.HocSinhID === HocSinhID)
        if (obj) arr.push({
            HoTen: obj.HoTen,
            NgaySinh: obj.NgaySinh,
            Nu: obj.Nu,
            SoDanhBo: obj.SoDanhBo,
            HocSinhID: obj.HocSinhID,
            KQRenLuyen: obj.KQRenLuyen
        })
    }
    return arr
}
vueData.onSave = onSave
vueData.getDSLop = getDSLop
vueData.initSpread = initSpread
vueData.TongKet_GetDTBMonHocByKhoiLop = TongKet_GetDTBMonHocByKhoiLop
vueData.renderDSHocSinhChange = renderDSHocSinhChange
vueData.exportExcel = exportExcel
vueData.exportGiayKhen = exportGiayKhen