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