function convertDSHocTapThang() {
    const startMonth = 8; // Tháng bắt đầu (tháng 8)
    const startYear = 2024; // Năm bắt đầu
    const endMonth = 5; // Tháng kết thúc (tháng 5)
    const endYear = 2025; // Năm kết thúc
    const data = [];
    for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 1;
        const monthEnd = year === endYear ? endMonth : 12;
        for (let month = monthStart; month <= monthEnd; month++) {
            data.push({
                title: `Tháng ${month}/${year}`,
                icon: `/_cdn/lhbs-lms/icon_thang/icon_thang_${month}.png`
            });
        }
    }
    vueData.DSHocTapThang = data;
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