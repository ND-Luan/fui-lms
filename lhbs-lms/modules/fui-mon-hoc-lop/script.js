async function loadCapAndInit() {
    const res = await fetchPromise('lms/CapHoc_Get', {})
    vueData.DSCap = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    vueData.DSKhoi_Init = renderDSKhoi()
    vueData.DSKhoi = renderDSKhoi()
}
async function loadLop() {
    const res = await fetchPromise('lms/Lop_Select', { NienKhoa: vueData.NienKhoa })
    vueData.DSLop = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
}
async function loadTemplateBangDiem() {
    const res = await fetchPromise('lms/TemplateBangDiem_Get', {
        NienKhoa: vueData.NienKhoa,
        CapID: vueData.CapItem?.CapID,
        TemplateBangDiemID: 0
    })
    vueData.DSTemplate = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
}
async function loadMonHoc() {
    const res = await fetchPromise('lms/MonHoc_Get_ByCapID', { CapID: vueData.CapItem?.CapID })
    vueData.DSMonHoc = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    initSelectAll()
}
function sameId(left, right) {
    return left !== undefined && left !== null && right !== undefined && right !== null && String(left) === String(right)
}
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
    const filterData = jsonData
        .filter(x => x.TemplateBangDiemID > 0)
    console.group('[fui-mon-hoc-lop] Kiểm tra payload lưu')
    console.log('Payload lưu:', filterData)
    console.log('Payload JSON:', JSON.stringify(filterData, null, 2))
    console.groupEnd()
    confirm({
        title: "Xác nhận lưu môn học lớp",
        action: () => {
            ajaxCALL('/lms/MonHocLop_Ins_Multiple', {
                jsonData: filterData
            }, res => {
                Vue.$toast.success('Thêm môn học lớp thành công', { position: 'top' })
                reloadMonHocLop().catch(error => {
                    console.error('[fui-mon-hoc-lop] Không thể tải lại dữ liệu sau khi lưu', error)
                })
            })
        }
    })
}
async function reloadMonHocLop() {
    const requestId = (vueData._monHocLopRequestId || 0) + 1
    vueData._monHocLopRequestId = requestId
    const res = await fetchPromise('lms/MonHocLop_Select_By_MonHocID', {
        MonHocID: vueData.MonHocItem?.MonHocID,
        NienKhoa: vueData.NienKhoa
    })
    if (requestId !== vueData._monHocLopRequestId) {
        return false
    }
    const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
    vueData.DSMonHocLopRaw = data.map(item => ({ ...item }))
    vueData.DSMonHocLop = data
    await renderDSMonHocLop()
    return true
}
async function normalizeMonHocLopByNhom() {
    if (vueData.CapItem?.CapID !== 3) {
        return false
    }
    if (vueData._hasLoadedDSNhom && vueData.DSNhom.length === 0) {
        return false
    }
    if (!vueData._hasLoadedDSNhom) {
        if (!vueData._dsNhomPromise) {
            vueData._isLoadingDSNhom = true
            vueData._dsNhomPromise = fetchPromise('lms/NhomAV_Get', { NienKhoa: vueData.NienKhoa })
                .then(res => {
                    vueData.DSNhom = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
                    vueData._hasLoadedDSNhom = true
                })
                .finally(() => {
                    vueData._isLoadingDSNhom = false
                    vueData._dsNhomPromise = null
                })
        }
        await vueData._dsNhomPromise
    }
    const source = vueData.DSMonHocLopRaw || vueData.DSMonHocLop
    const nhomHoc = vueData.DSNhom
    const isGroupMode = vueData.ShowNhom === true
    const nhomIds = new Set(nhomHoc.map(nhom => String(nhom.NhomID)))
    const sourceRoot = source.filter(item => !nhomIds.has(String(item.LopNhomID)))
    const sourceGroups = source.filter(item => nhomIds.has(String(item.LopNhomID)))
    const sourceForRoot = sourceRoot.length > 0 ? sourceRoot : source
    if (!isGroupMode) {
        vueData.DSMonHocLop = sourceForRoot
        return true
    }
    vueData.DSMonHocLop = sourceForRoot.flatMap(item => {
        const itemMonHocID = item.MonHocID ?? vueData.MonHocItem?.MonHocID
        const subjectGroups = nhomHoc.filter(nhom =>
            sameId(nhom.MonHocID, itemMonHocID) &&
            sameId(nhom.KhoiID, item.KhoiID)
        )
        if (subjectGroups.length > 0) {
            return subjectGroups.map(nhom => {
                const groupItem = sourceGroups.find(group =>
                    sameId(group.LopNhomID, nhom.NhomID) &&
                    sameId(group.MonHocID ?? itemMonHocID, itemMonHocID)
                )
                return {
                ...item,
                ...(groupItem || {}),
                MonHocID: itemMonHocID,
                LopNhomID: nhom.NhomID,
                TenLop: nhom.TenNhom,
                IsLopNhom: true
                }
            })
        }
        return [item]
    })
}
function toggleDisplayMode() {
    if (vueData.CapItem?.CapID === 3) {
        renderDSMonHocLop().catch(error => {
            console.error('[fui-mon-hoc-lop] Không thể render lại chế độ hiển thị', error)
        })
    }
}
async function renderDSMonHocLop() {
    await normalizeMonHocLopByNhom()
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
        if (vueData.MonHocItem?.MonHocID > 0) {
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
            .filter(x => sameId(x.KhoiID, khoiItem.value))
        const nhomByKhoi = vueData.CapItem?.CapID === 3 && vueData.ShowNhom === true
            ? (vueData.DSNhom || []).filter(x => sameId(x.KhoiID, khoiItem.value))
            : []
        if (vueData.CapItem?.CapID === 3 && vueData.ShowNhom === true) {
            const monHocCoNhom = new Set(nhomByKhoi.map(x => String(x.MonHocID)))
            DSMonHoc = DSMonHoc.filter(x => monHocCoNhom.has(String(x.MonHocID)))
        }
        const uniqueDSLop = vueData.CapItem?.CapID === 3 && vueData.ShowNhom === true
            ? [...new Set(nhomByKhoi.map(x => x.NhomID))]
            : [...new Set(filterDSByKhoi.map(x => x.LopNhomID))]
        console.log('uniqueDSLop', uniqueDSLop)
        console.log('filterDSByKhoi', filterDSByKhoi)
        for (var LopNhomID of uniqueDSLop) {
            const lop = filterDSByKhoi.find(x => x.LopNhomID == LopNhomID) ||
                nhomByKhoi.find(x => x.NhomID == LopNhomID)
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
                const lop = filterDSByKhoi.find(x =>
                    sameId(x.LopNhomID, LopNhomID) && sameId(x.MonHocID, monHoc.MonHocID)
                )
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
                        const LopNhomID = key.replace('TemplateBangDiem_', '')
                        if (vueData.CapItem?.CapID === 3 && vueData.ShowNhom === true && !(vueData.DSNhom || []).some(nhom => nhom.IsNhomLMS_GiaoBai === false && String(nhom.NhomID) === String(LopNhomID))) {
                            continue
                        }
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
vueData.toggleDisplayMode = toggleDisplayMode