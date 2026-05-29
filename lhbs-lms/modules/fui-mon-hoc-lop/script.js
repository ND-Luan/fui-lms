function onSave() {
    // const jsonData = vueData.items.map(x => {
    //     return {
    //         ...x,
    //         MonHocID: vueData.MonHocItem.MonHocID
    //     }
    // })
    const jsonData = []
    for (var Khoi of vueData.items) {
        for (var item of Khoi.items) {
            for (var key in item) {
                console.log('key', key, key.includes('TemplateBangDiem_'))
                if (key.includes('TemplateBangDiem_')) {
                    const [name, lopid] = key.toString().split('_')
                    console.log('in')
                    jsonData.push({
                        MonHocID: item.MonHocID,
                        LopNhomID: lopid,
                        NienKhoa: vueData.NienKhoa,
                        TemplateBangDiemID: item[key] ?? 0,
                        ChiaTheoLop: false
                    })
                }
            }
        }
    }
    const filterData = jsonData.filter(x => x.TemplateBangDiemID > 0)
    confirm({
        title: "Xác nhận lưu môn học lớp",
        action: () => {
            ajaxCALL('/lms/MonHocLop_Ins_Multiple', {
                jsonData: filterData
            }, res => {
                Vue.$toast.success('Thêm môn học lớp thành công', { position: 'top' })
                CALL('getMonHocLop')
            })
        }
    })
}
function renderDSMonHocLop() {
    const ITEMS = []
    const HEADERS = []
    let _listKhoi = []
    if (vueData.KhoiID === 0) {
        _listKhoi = vueData.DSKhoi_Init.filter(x => x.CapID === vueData.CapItem.CapID)
    } else {
        console.log('vueData.KhoiID', vueData.KhoiID)
        const khoi = vueData.DSKhoi.find(x => x.value === vueData.KhoiID)
        _listKhoi.push(khoi)
    }
    console.log('_listKhoi', _listKhoi)
    for (var khoiItem of _listKhoi) {
        const _items = []
        const DSMonHoc_WithoutSelectAll = vueData.DSMonHoc.filter(x => x.MonHocID !== 0)
        let DSMonHoc = DSMonHoc_WithoutSelectAll
        if (vueData.MonHocItem.MonHocID > 0) {
            DSMonHoc = DSMonHoc_WithoutSelectAll.filter(x => x.MonHocID === vueData.MonHocItem.MonHocID)
        }
        let headers = [{
            title: "Tên môn học",
            value: "MonHocName",
            width: 200,
            minWidth: 200,
        }]
        const filterDSByKhoi = vueData.DSMonHocLop
            .map(x => ({ ...x, TemplateBangDiemID: x.TemplateBangDiemID === 0 ? null : x.TemplateBangDiemID }))
            .filter(x => x.KhoiID === khoiItem.value)
        const uniqueDSLop = [...new Set(filterDSByKhoi.map(x => x.LopNhomID))]
        console.log('uniqueDSLop', uniqueDSLop)
        console.log('filterDSByKhoi', filterDSByKhoi)
        for (var LopNhomID of uniqueDSLop) {
            const lop = filterDSByKhoi.find(x => x.LopNhomID == LopNhomID)
            console.log('lop', lop)
            if (lop) {
                headers.push({
                    title: lop.TenLop,
                    value: 'TemplateBangDiem_' + lop.LopNhomID,
                    key: 'TemplateBangDiem_' + lop.LopNhomID,
                    align: "center",
                    sortable: false
                })
            }
        }
        for (const monHoc of DSMonHoc) {
            const obj = {
                MonHocID: monHoc.MonHocID,
                MonHocName: monHoc.MonHocName,
                LopNhomIDs: []  // thêm mảng để lưu LopNhomID
            }
            for (const LopNhomID of uniqueDSLop) {
                const lop = filterDSByKhoi.find(x => x.LopNhomID === LopNhomID && x.MonHocID === monHoc.MonHocID)
                if (lop) {
                    obj['TemplateBangDiem_' + lop.LopNhomID] = lop.TemplateBangDiemID
                } else {
                    obj['TemplateBangDiem_' + LopNhomID] = null
                }
                obj.LopNhomIDs.push(lop)
            }
            _items.push(obj)
        }
        ITEMS.push({
            KhoiItem: khoiItem,
            uniqueDSLop: uniqueDSLop,
            items: _items,
            headers: headers
        })
    }
    console.log('ITEMS', ITEMS)
    console.log('HEADERS', HEADERS)
    vueData.items = ITEMS
}
function initSelectAllKhoi() {
    const objSelectAll = {
        value: 0,
        title: "Chọn tất cả",
    }
    const existSelectAll = vueData.DSKhoi.find(x => x.value === 0)
    if (!existSelectAll) {
        vueData.DSKhoi.unshift(objSelectAll)
    }
}
function initSelectAll() {
    const objSelectAll = {
        "MonHocID": 0,
        "MonHocCode": "all",
        "MonHocName": "Chọn tất cả",
        "TenMonDuLieuNganh": "Chọn tất cả",
        "TenMonHoc_HienThi": "Chọn tất cả",
    }
    const existSelectAll = vueData.DSMonHoc.find(x => x.MonHocID === 0)
    if (!existSelectAll) {
        vueData.DSMonHoc.unshift(objSelectAll)
    }
}
function onSaveChonNhanh(val, item) {
    for (var _item of vueData.items) {
        for (var itemCT of _item.items) {
            if (itemCT.MonHocID === item.MonHocID) {
                for (var key in itemCT) {
                    if (key.includes('TemplateBangDiem_')) {
                        itemCT[key] = val
                    }
                }
            }
        }
    }
    console.log(val, item)
}
vueData.initSelectAllKhoi = initSelectAllKhoi
vueData.initSelectAll = initSelectAll
vueData.onSave = onSave
vueData.renderDSMonHocLop = renderDSMonHocLop
vueData.onSaveChonNhanh = onSaveChonNhanh