function onSave() {
    const jsonData = vueData.items.map(x => {
        return {
            ...x,
            MonHocID: vueData.MonHocItem.MonHocID
        }
    })
    confirm({
        title: "Xác nhận lưu môn học lớp",
        action: () => {
            ajaxCALL('/lms/MonHocLop_Ins_Multiple', {
                jsonData: jsonData
            }, res => {
                Vue.$toast.success('Thêm môn học lớp thành công', { position: 'top' })
                CALL('getMonHocLop')
            })
        }
    })
}
function renderDSMonHocLop() {
    const filterDSByKhoi = vueData.DSMonHocLop.filter(x => x.KhoiID === vueData.KhoiID)
    const uniqueDSLop = [...new Set(filterDSByKhoi.map(x => x.LopNhomID))]
    let headers = [{
        title: "Tên môn học",
        value: "MonHocName",
        width: 200,
        minWidth: 200,
    }]
    vueData.uniqueDSLop = uniqueDSLop
    for (var LopNhomID of uniqueDSLop) {
        const lop = filterDSByKhoi.find(x => x.LopNhomID === LopNhomID)
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
    const items = []
    const DSMonHoc_WithoutSelectAll = vueData.DSMonHoc.filter(x => x.MonHocID !== 0)
    let DSMonHoc = DSMonHoc_WithoutSelectAll
    if (vueData.MonHocItem.MonHocID > 0) {
        DSMonHoc = DSMonHoc_WithoutSelectAll.filter(x => x.MonHocID === vueData.MonHocItem.MonHocID)
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
                obj.LopNhomIDs.push(lop)
            }
        }
        items.push(obj)
    }
    vueData.items = items
    vueData.headers = headers
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
        if (_item.MonHocID === item.MonHocID) {
            for (var key in _item) {
                if (key.includes('TemplateBangDiem_')) {
                    _item[key] = val
                }
            }
        }
    }
    console.log(val, item)
}
vueData.initSelectAll = initSelectAll
vueData.onSave = onSave
vueData.renderDSMonHocLop = renderDSMonHocLop
vueData.onSaveChonNhanh = onSaveChonNhanh