function onSelectedHocSinh(item) {
    // const Semester = localStorage.getItem('Semester')
    // if (!Semester) return Vue.$toast.warning('Vui lòng chọn học kỳ', { position: 'top' })
    ajaxCALL('lms/HocSinh_Detail_GetBy_HocSinhID',
        {
            HocSinhID: item.StudentID
        }, data => {
            vueData.HocSinhSelected = { ...item, ...data }
            localStorage.setItem('HocSinhSelected', JSON.stringify({ ...item, ...data }))
            vueData.drawerSelectStudent = false
            vueData.drawerOnboarding = false
            const bottomNavigation = vueData.bottomNavigation
            if (bottomNavigation === 0) {
                vueData.keyComponentUcThang++
                CALL('getDSThang')
            }
            if (bottomNavigation === 1) {
                vueData.keyComponentUcTiengAnh++
            }
            if (bottomNavigation === 2) {
                vueData.keyComponentUcHocKy++
            }
            if (bottomNavigation === 3) {
                vueData.keyComponentUcTongDiemQuaTrinh++
            }
        }
    )
}
function setUrlTab() {
    let url = new URL(window.location.href);
    url.searchParams.set('tab', vueData.bottomNavigation); // Thêm tham số
    history.pushState(null, '', url); // Cập nhật URL
}