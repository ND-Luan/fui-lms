
function promiseAjax(item) {
    return new Promise(resolve => {
        ajaxCALL(`diemc2/LMS_GetDiemTheoLop?LopID=${item.LopID}&MonHocID=${item.MonHocCode}`,
            null,
            res => {
                resolve(res?.data)
            })
    })
}
async function fn_Save() {
    for (var item of vueData.items) {
        const data = await promiseAjax(item)
        const mapData_LopID_MonHocCode = data.map(x => ({ ...x, LopID: item.LopID, MonHocID: item.MonHocCode }))
        ajaxCALL('lms/MonHocLop_C2_Ins', { JSON_DiemHocSinh: mapData_LopID_MonHocCode })
    }
}