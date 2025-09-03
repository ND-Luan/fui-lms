async function onUpdateGiaoVien() {
    const GiaoVienObjArr = await ajaxCALLPromise('student/Edubot_GetGiaoVien')
    console.log('GiaoVienObjArr', GiaoVienObjArr)
    const isIns = ajaxCALLPromise('lms/IO_IN_GiaoVien_Ins', {
        GiaoVienObjArr: GiaoVienObjArr
    })
    if (isIns) {
        Vue.$toast.success('Cập nhật giáo viên thành công', { position: "top" })
    }
}
function ajaxCALLPromise(url, params = null) {
    return new Promise(resolve => {
        ajaxCALL(url, params, res => resolve(res.data))
    })
}
vueData.onUpdateGiaoVien = onUpdateGiaoVien