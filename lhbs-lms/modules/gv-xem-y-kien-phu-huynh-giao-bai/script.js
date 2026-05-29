function handleGetKhoi() {
    vueData.DSKhoi = vueData.DSLop.reduce((result, item) => {
        let objFind = result.find(o => o.value == item.KhoiID)
        if (result.length == 0 || !objFind) {
            result.push({ title: 'Khối ' + item.KhoiID, value: item.KhoiID, CapID: item.CapID })
        }
        return result
    }, [])
    console.log('DSKhoi', vueData.DSKhoi)
}
function handleGetCap() {
    vueData.DSCap = vueData.DSLop.reduce((result, item) => {
        let objFind = result.find(o => o.value == item.CapID)
        if (result.length == 0 || !objFind) {
            result.push({ title: 'Cấp ' + item.CapID, value: item.CapID })
        }
        return result
    }, [])
    console.log('vueData.DSCap', vueData.DSCap)
}
function handleGetKhoiFilter() {
    vueData.DSKhoiFilter = vueData.DSKhoi.filter(item => item.CapID == vueData.CapItem.value)
}
function handleGetLopFilter() {
    vueData.DSLopFilter = vueData.DSLop.filter(item => item.KhoiID == vueData.KhoiItem.value)
}
let data = `,
        "CapItem": {
            "EXE": "vueData.handleGetKhoiFilter()"
        },
        "KhoiItem": {
            "EXE": "vueData.handleGetLopFilter()"
        }`
vueData.handleGetKhoi = handleGetKhoi
vueData.handleGetCap = handleGetCap
vueData.handleGetKhoiFilter = handleGetKhoiFilter
vueData.handleGetLopFilter = handleGetLopFilter
vueData.dayjs = dayjs