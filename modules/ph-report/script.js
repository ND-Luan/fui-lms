function convertDSHocTapThang() {
    const startMonth = 8; // Tháng bắt đầu (tháng 8)
    const startYear = 2024; // Năm bắt đầu
    const endMonth = 5; // Tháng kết thúc (tháng 5)
    const endYear = 2025; // Năm kết thúc
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const data = [];
    for (let year = startYear; year <= endYear; year++) {
        const monthStart = year === startYear ? startMonth : 1;
        const monthEnd = year === endYear ? endMonth : 12;
        for (let month = monthStart; month <= monthEnd; month++) {
            data.push({
                title: `Tháng ${month}/${year}`,
                titleEnglish: `${monthNames[month - 1]} - ${year}`,
                icon: `/_cdn/lhbs-lms/icon_thang/icon_thang_${month}.png`,
                month: month,
                year: year
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
    ajaxCALL('lms/HocSinh_Detail_GetBy_HocSinhID',
        {
            HocSinhID: item.StudentID
        }, data => {
            vueData.HocSinhSelected = { ...item, ...data }


            localStorage.setItem('HocSinhSelected', JSON.stringify({ ...item, ...data }))
            vueData.drawerSelectStudent = false
            vueData.drawerOnboarding = false
            const bottomNavigation = vueData.bottomNavigation
            if (bottomNavigation === 0) vueData.keyComponentUcThang++
            if (bottomNavigation === 1) vueData.keyComponentUcTiengAnh++
            if (bottomNavigation === 2) vueData.keyComponentUcHocKy++

            if (vueData.HocSinhSelected.Khoi > 5) {
                vueData.bottomNavigation = 1
            }
        }
    )
}
function setUrlTab() {
    let url = new URL(window.location.href);
    url.searchParams.set('tab', vueData.bottomNavigation); // Thêm tham số
    history.pushState(null, '', url); // Cập nhật URL

}