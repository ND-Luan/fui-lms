
function promiseAjax(item) {
    return new Promise(resolve => {
    })
}
async function fn_Save() {
    for (var item of vueData.items) {
        ajaxCALL(`psmark1/LMS_GetDanhGiaHocSinh?LopID=${item.LopID}&KyDanhGia=${vueData.KyDanhGia}&NamHoc=2024`,
            null,
            res => {
                if (res.data?.length > 0) {
                    const mapData_LopID_MonHocCode = res.data.map(x => ({ ...x, LopID: item.LopID, KyDanhGia: vueData.KyDanhGia }))
                    ajaxCALL('lms/MonHocLop_C1_Ins', { JSON_DiemHocSinh: mapData_LopID_MonHocCode })
                }
            })
    }
}