async function initPage(){
    if(!vueData.NienKhoaItem){
        let NienKhoaItem = await window.GET_NienKhoa_Info()
        vueData.NienKhoaItem = NienKhoaItem
    }
}
async function GET_TuanHoc(){
    const res = await window.API_Promise('lms/TuanHocTap_Get',{
        NienKhoa:vueData.NienKhoaItem?.NienKhoa
    })
    return res
}