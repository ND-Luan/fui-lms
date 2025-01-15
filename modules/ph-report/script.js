function convertDSHocTapThang() {
    const data = Array.from({ length: 12 }).fill(0).map((_, index) => {
        return {
            title: "Tháng " + (index + 1),
            icon: `/_cdn/lhbs-lms/icon_thang/icon_thang_${index + 1}.png`
        }
    })
    vueData.DSHocTapThang = data
}
function convertDSHocTapTiengAnh() {
    const data = Array.from({ length: 5 }).fill(0).map((_, index) => {
        return {
            title: "Theme " + (index + 1),
            icon: "/_cdn/lhbs-lms/icon_tieng_anh/icon_tieng_anh.png"
        }
    })
    vueData.DSHocTapThangTiengAnh = data
}
function onSelectedHocSinh(item) {
    console.log(item)
    vueData.HocSinhSelected = item
    localStorage.setItem('HocSinhSelected', JSON.stringify(item))
    vueData.drawer = false
}