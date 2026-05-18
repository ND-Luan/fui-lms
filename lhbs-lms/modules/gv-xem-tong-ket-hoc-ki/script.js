
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
function getTongKetBaseKeys() {
    if (vueData.CapID === 2) {
        return [
            'STT', 'HocSinhID', 'HoTen', 'TenLop', 'NgaySinh',
            'GDDP', 'HDTN', 'HKTN', 'JA', 'LS-DL',
            'NT', 'AI', 'toan', 'tin', 'van', 'anh',
            'gdcd', 'cn', 'td',
            'HocLuc', 'KQRenLuyen', 'DanhHieu',
            'Phep', 'KhongPhep', 'TongBuoiNghi',
            'UuDiem', 'NhuocDiem', 'DeXuat', 'HocSinhLopID',
            'SoQuyetDinhKT', 'VaoSoKT'
        ]
    }
    return [
        'STT', 'HocSinhID', 'HoTen', 'TenLop', 'NgaySinh',
        'GDDP', 'GDKT-PL', 'gdqp', 'HDTN', 'JA', 'toan', 'ly', 'hoa',
        'sinh', 'tin', 'van', 'su', 'dia', 'anh', 'td',
        'HocLuc', 'KQRenLuyen', 'DanhHieu',
        'Phep', 'KhongPhep', 'TongBuoiNghi', 'UuDiem', 'NhuocDiem', 'DeXuat',
        'HocSinhLopID', 'SoQuyetDinhKT', 'VaoSoKT'
    ]
}
function showModuleSnackbar(message, color = 'warning') {
    if (vueData.snackbarRef?.value?.showSnackbar) {
        vueData.snackbarRef.value.showSnackbar({ message, color })
        return
    }
    if (color === 'success') {
        Vue.$toast?.success?.(message, { position: 'top' })
        return
    }
    if (color === 'error') {
        Vue.$toast?.error?.(message, { position: 'top' })
        return
    }
    Vue.$toast?.warning?.(message, { position: 'top' })
}
function isTongKetHocKiTestingUser() {
    return true
}
function getErrorMessage(error) {
    return error?.message ?? error?.responseJSON?.Message ?? error?.responseText ?? ''
}
function isTongKetChuaChotDiemError(error) {
    const message = getErrorMessage(error)
    return message.includes("Incorrect syntax near ','.")
        && message.includes("Incorrect syntax near 'pvs'.")
}
function createFallbackHocSinhRow(item, index, lopItem = null) {
    const row = Object.fromEntries(getTongKetBaseKeys().map(key => [key, '']))
    return {
        ...row,
        STT: item.STT ?? index + 1,
        HocSinhID: item.HocSinhID ?? '',
        HoTen: item.HoTen ?? '',
        TenLop: item.TenLop ?? lopItem?.TenLop ?? vueData.LopItem?.TenLop ?? '',
        NgaySinh: item.NgaySinh ?? '',
        HocSinhLopID: item.HocSinhLopID ?? '',
        KQRenLuyen: item.KQRenLuyen ?? item.KQRL ?? '',
        DanhHieu: item.DanhHieu ?? '',
        Phep: item.Phep ?? '',
        KhongPhep: item.KhongPhep ?? '',
        TongBuoiNghi: item.TongBuoiNghi ?? '',
        UuDiem: item.UuDiem ?? '',
        NhuocDiem: item.NhuocDiem ?? '',
        DeXuat: item.DeXuat ?? '',
        SoQuyetDinhKT: item.SoQuyetDinhKT ?? '',
        VaoSoKT: item.VaoSoKT ?? ''
    }
}
async function loadHocSinhFallbackForKQRL(lopItem, silent = false) {
    const dsHocSinh = await fetchPromise('lms/HocSinhLop_Get_ByLopID', {
        LopID: lopItem.LopID,
        NienKhoa: vueData.NienKhoa
    }, {
        cache: false,
        suppressError: true,
        silent
    })
    if (!Array.isArray(dsHocSinh)) return []
    return dsHocSinh.map((item, index) => createFallbackHocSinhRow(item, index, lopItem))
}
async function fetchTongKetByLop(lopItem, khoiIDOverride = null, silent = false) {
    if (!lopItem?.LopID) {
        return {
            data: [],
            usedFallback: false
        }
    }
    const khoiID = khoiIDOverride ?? vueData.KhoiItem?.KhoiID ?? vueData.KhoiID
    try {
        const res = await fetchPromise(`diemc${vueData.CapID}/LMS_GetTongKetDTBMonHocByLop`, {
            KhoiID: khoiID,
            LopID: lopItem.LopID,
            HocKy: vueData.Semester.value,
            NienKhoa: vueData.NienKhoa
        }, {
            cache: false,
            suppressError: true,
            silent
        })
        return {
            data: Array.isArray(res) ? res : [],
            usedFallback: false
        }
    } catch (error) {
        if (!isTongKetChuaChotDiemError(error)) {
            throw error
        }
        showModuleSnackbar('Chưa chốt điểm học kỳ, bạn vẫn có thể nhập KQRL trước.', 'warning')
        const fallbackData = await loadHocSinhFallbackForKQRL(lopItem, silent)
        return {
            data: fallbackData,
            usedFallback: true
        }
    }
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
            DanhHieu_EN: "In recognition of outstanding academic achievement"
        },
        {
            List_CapID: [2, 3],
            DanhHieu_VI: "Học sinh Giỏi", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of excellent academic achievement"
        },
        {
            List_CapID: [1],
            DanhHieu_VI: "Học sinh Tiêu biểu hoàn thành tốt trong học tập và rèn luyện", //Đạt danh hiệu
            DanhHieu_EN: "In recognition of excellent academic and personal achievement"
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
            TenHieuTruong: "Hoàng Thị Diễm Trang"
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
    vueData.isChuaChotDiem = false
    if (vueData.Is_InCaKhoi) {
        getDSLop()
        return
    }
    if (!vueData.LopItem?.LopID) {
        showModuleSnackbar('Vui lòng chọn lớp trước khi tải tổng kết học kỳ.', 'warning')
        return
    }
    // Detect paired classes by base TenLop (e.g. "12C1","12C2" share base "12C")
    const selectedTenLop = vueData.LopItem?.TenLop ?? ''
    const baseName = selectedTenLop.replace(/\d+$/, '')
    const isNamedWithDigit = baseName !== selectedTenLop
    const pairedLops = isNamedWithDigit
        ? vueData.DSLop.filter(l =>
            !String(l.LopID).includes('N') &&
            String(l.LopID) !== String(vueData.LopItem?.LopID) &&
            (l.TenLop ?? '').replace(/\d+$/, '') === baseName
        )
        : []
    if (pairedLops.length > 0) {
        const allLops = [vueData.LopItem, ...pairedLops]
            ; (async () => {
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
    ; (async () => {
        const tongKetRes = await fetchTongKetByLop(vueData.LopItem)
        vueData.isChuaChotDiem = tongKetRes.usedFallback
        vueData.DSHocSinh_API_TongKet = tongKetRes.data
        vueData.dataDiem = tongKetRes.data
        const khenThuong = await fetchPromise('lms/KhenThuong_Get', { LopID: vueData.LopItem?.LopID })
        vueData.DSKhenThuong.push(khenThuong)
        initSpread()
        if (tongKetRes.usedFallback) {
            await mergeKQRLFromDB(vueData.LopItem?.LopID)
        }
        await mergeNhanXetThang(vueData.LopItem?.LopID)
    })().catch(error => {
        console.error('TongKet_GetDTBMonHocByKhoiLop error', error)
        showModuleSnackbar(getErrorMessage(error) || 'Tải tổng kết học kỳ thất bại', 'error')
    })
}
async function mergeKQRLFromDB(lopid, silent = false) {
    try {
        const dsKQRL = await fetchPromise('lms/XetKetQuaRenLuyen_Get', {
            LopID: lopid,
            HocKi: vueData.Semester.value,
            NienKhoa: vueData.NienKhoa
        }, { suppressError: true, cache: false, silent })
        if (!Array.isArray(dsKQRL) || dsKQRL.length === 0) return
        for (var item of vueData.DSHocSinh) {
            const obj = dsKQRL.find(x => x.HocSinhID == item.HocSinhID)
            if (obj && obj.KQRL_Sau) {
                item.KQRenLuyen = obj.KQRL_Sau
            }
        }
        vueData.keyComp++
    } catch (e) {
        console.error('mergeKQRLFromDB error', e)
    }
}
async function mergeNhanXetThang(lopid, silent = false) {
    try {
        const dsNhanXet = await fetchPromise('lms/NhanXetThang_Thang1_Thang5_Get', {
            LopID: lopid,
            HocKi: vueData.Semester.value,
            NienKhoa: vueData.NienKhoa
        }, { silent })
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
async function TongKet_GetDTBMonHocByKhoiLopHangLoat(lopid, khoiIDOverride = null, silent = false) {
    const lopItem = vueData.DSLop.find(item => String(item.LopID) === String(lopid)) ?? { LopID: lopid }
    const tongKetRes = await fetchTongKetByLop(lopItem, khoiIDOverride, silent)
    vueData.isChuaChotDiem = vueData.isChuaChotDiem || tongKetRes.usedFallback
    vueData.dataDiem = tongKetRes.data
    console.log('lopid', lopid)
    initSpread()
    if (tongKetRes.usedFallback) {
        await mergeKQRLFromDB(lopid, silent)
    }
    await mergeNhanXetThang(lopid, silent)
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
    let keys = getTongKetBaseKeys();
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
        NgayKhenThuong_VI: { title: "Ngày KT - Giấy khen (VI)", width: 200 },
        NgayKhenThuong_EN: { title: "Ngày KT - Giấy khen (EN)", width: 200 },
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
    if (!isTongKetHocKiTestingUser()) {
        showModuleSnackbar('Tính năng đang được kiểm thử, hiện chưa chạy cho tài khoản này.', 'warning')
        return
    }
    const generation = ++vueData._loadGeneration
    const khoiID = vueData.KhoiItem?.KhoiID
    if (!khoiID) return
    vueData.DSHocSinh = []
    vueData.DSHocSinhChange = []
    vueData.DSKhenThuong = []
    vueData.isChuaChotDiem = false
    const khenThuongRes = await fetchPromise('lms/KhenThuong_Get_By_KhoiID', {
        KhoiID: khoiID,
        NienKhoa: vueData.NienKhoa
    }, { silent: true })
    if (generation !== vueData._loadGeneration) return
    vueData.DSKhenThuong = Array.isArray(khenThuongRes) ? khenThuongRes : []
    const dslopFilter = vueData.DSLop.filter(item => !item.LopID.includes('N'))
    vueData.loadingDialog = { show: true, title: 'Đang tải dữ liệu tất cả các lớp...', total: 0, current: 0, currentName: '', currentLopName: '', currentLop: 0, totalLop: dslopFilter.length }
    for (const lop of dslopFilter) {
        if (generation !== vueData._loadGeneration) { vueData.loadingDialog.show = false; return }
        vueData.loadingDialog.currentLopName = lop.TenLop ?? lop.LopID
        await TongKet_GetDTBMonHocByKhoiLopHangLoat(lop.LopID, null, true)
        vueData.loadingDialog.currentLop += 1
    }
    if (generation !== vueData._loadGeneration) { vueData.loadingDialog.show = false; return }
    vueData.loadingDialog.show = false
}
function onSave() {
    if (!isTongKetHocKiTestingUser()) {
        showModuleSnackbar('Tính năng đang được kiểm thử, hiện chưa chạy cho tài khoản này.', 'warning')
        return
    }
    confirm({
        title: `Xác nhận lưu ${vueData.DSHocSinh.length} học sinh?`,
        action: function () {
            // vueData.DSHocSinh đã được sync realtime qua handleChange khi user edit cell
            const latestDSHocSinh = vueData.DSHocSinh
            ajaxCALL('lms/XetKetQuaRenLuyen_Upsert_JSON',
                {
                    json: latestDSHocSinh
                        .filter(x => x.KQRenLuyen != null && x.KQRenLuyen !== '')
                        .map(x => ({
                            HocSinhID: x.HocSinhID,
                            LopID: x.LopID ?? vueData.LopItem?.LopID,
                            TenLop: x.TenLop,
                            HocKi: vueData.Semester.value,
                            KQRL_Sau: x.KQRenLuyen,
                            IsChotDiem: !vueData.isChuaChotDiem
                        })),
                    NienKhoa: vueData.NienKhoa,
                },
                res => {
                    console.log('res', res)
                    if (vueData.isChuaChotDiem) {
                        Vue.$toast.success('Lưu KQRL thành công (chưa chốt điểm)', { position: 'top' })
                        vueData.DSHocSinhChange = []
                        return
                    }
                },
                err => {
                    console.error('XetKetQuaRenLuyen_Upsert_JSON error', err)
                    showModuleSnackbar(getErrorMessage(err) || 'Lưu KQRL thất bại, vui lòng thử lại.', 'error')
                }
            )
            if (!vueData.isChuaChotDiem) {
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
vueData._loadGeneration = 0
vueData.loadingDialog = { show: false, title: '', total: 0, current: 0, currentName: '', currentLopName: '', currentLop: 0, totalLop: 0 }
async function getDSTatCaKhoi() {
    const generation = ++vueData._loadGeneration
    const realKhoi = vueData.DSKhoi
    if (!realKhoi || realKhoi.length === 0) {
        showModuleSnackbar('Không có dữ liệu khối để tải.', 'warning')
        return
    }
    vueData.DSHocSinh = []
    vueData.DSHocSinhChange = []
    vueData.DSKhenThuong = []
    vueData.isChuaChotDiem = false
    vueData.loadingDialog = { show: true, title: 'Đang tải dữ liệu tất cả các khối...', total: realKhoi.length, current: 0, currentName: '', currentLopName: '', currentLop: 0, totalLop: 0 }
    for (const khoi of realKhoi) {
        if (generation !== vueData._loadGeneration) { vueData.loadingDialog.show = false; return }
        vueData.loadingDialog.currentName = khoi.TenKhoiHoc
        const [dsLopRes, khenThuongRes] = await Promise.all([
            fetchPromise('lms/Lop_Get_ByKhoiID', {
                NienKhoa: vueData.NienKhoa,
                KhoiID: khoi.KhoiID
            }, { silent: true }),
            fetchPromise('lms/KhenThuong_Get_By_KhoiID', {
                KhoiID: khoi.KhoiID,
                NienKhoa: vueData.NienKhoa
            }, { silent: true })
        ])
        if (generation !== vueData._loadGeneration) { vueData.loadingDialog.show = false; return }
        if (Array.isArray(khenThuongRes)) vueData.DSKhenThuong.push(khenThuongRes)
        const filteredLops = (Array.isArray(dsLopRes) ? dsLopRes : []).filter(l => !String(l.LopID).includes('N'))
        vueData.loadingDialog.totalLop = filteredLops.length
        vueData.loadingDialog.currentLop = 0
        for (const lop of filteredLops) {
            if (generation !== vueData._loadGeneration) { vueData.loadingDialog.show = false; return }
            vueData.loadingDialog.currentLopName = lop.TenLop ?? lop.LopID
            await TongKet_GetDTBMonHocByKhoiLopHangLoat(lop.LopID, khoi.KhoiID, true)
            vueData.loadingDialog.currentLop += 1
        }
        if (generation !== vueData._loadGeneration) { vueData.loadingDialog.show = false; return }
        vueData.loadingDialog.current += 1
    }
    vueData.loadingDialog.show = false
}
vueData.onSave = onSave
vueData.getDSLop = getDSLop
vueData.getDSTatCaKhoi = getDSTatCaKhoi
vueData.initSpread = initSpread
vueData.TongKet_GetDTBMonHocByKhoiLop = TongKet_GetDTBMonHocByKhoiLop
vueData.renderDSHocSinhChange = renderDSHocSinhChange
vueData.exportExcel = exportExcel
vueData.exportGiayKhen = exportGiayKhen
vueData.isTongKetHocKiTestingUser = isTongKetHocKiTestingUser
// ===== Import KQRL từ Excel =====
const IMPORT_KQRL_COLUMNS = [
    {
        type: 'text',
        title: 'Mã học sinh (HocSinhID)',
        name: 'HocSinhID',
        width: 200,
        align: 'left'
    },
    {
        type: 'dropdown',
        title: 'KQRL',
        name: 'KQRenLuyen',
        source: ['Chưa đạt', 'Khá', 'Tốt', 'Đạt'],
        width: 120,
        align: 'center'
    }
]
vueData.importKQRL_Columns = IMPORT_KQRL_COLUMNS
vueData.importKQRL_Key = 0
function openImportKQRL() {
    // Khởi tạo 30 hàng trống để user paste vào
    vueData.ImportKQRL_Data = Array.from({ length: 30 }, () => ({ HocSinhID: '', KQRenLuyen: '' }))
    vueData.importKQRL_Key++
    vueData.IsShowDialogImportKQRL = true
}
function applyImportKQRL() {
    let matched = 0
    let notFound = []
    for (const row of vueData.ImportKQRL_Data) {
        const id = String(row.HocSinhID ?? '').trim()
        const kqrl = String(row.KQRenLuyen ?? '').trim()
        if (!id || !kqrl) continue
        const target = vueData.DSHocSinh.find(x => String(x.HocSinhID).trim() === id)
        if (target) {
            target.KQRenLuyen = kqrl
            // Đánh dấu có thay đổi
            if (!vueData.DSHocSinhChange.includes(target.HocSinhID)) {
                vueData.DSHocSinhChange.push(target.HocSinhID)
            }
            matched++
        } else {
            notFound.push(id)
        }
    }
    // Re-render jspreadsheet chính
    vueData.keyComp++
    vueData.IsShowDialogImportKQRL = false
    if (notFound.length > 0) {
        showModuleSnackbar(`Áp dụng ${matched} học sinh. Không tìm thấy: ${notFound.join(', ')}`, 'warning')
    } else {
        showModuleSnackbar(`Áp dụng KQRL thành công cho ${matched} học sinh.`, 'success')
    }
}
vueData.openImportKQRL = openImportKQRL
vueData.applyImportKQRL = applyImportKQRL