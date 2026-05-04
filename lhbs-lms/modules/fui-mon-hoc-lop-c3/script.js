function promiseAjax(item) {
    return new Promise(resolve => {
    })
}
function fn_Save() {
    vueData.items.forEach(item => {
        ajaxCALL(`diemc3/LMS_GetDiemTheoLop?LopID=${item.LopID}&MonHocID=${item.MonHocCode}`,
            null,
            res => {
                if (res?.data.length > 0) {
                    const mapData_LopID_MonHocCode = res.data.map(x => ({ ...x, LopID: item.LopID, MonHocID: item.MonHocCode }))
                    ajaxCALL('lms/MonHocLop_C3_Ins', { JSON_DiemHocSinh: mapData_LopID_MonHocCode })
                }
            })
    })
}