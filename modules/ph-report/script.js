function initPage() {
    let bottomNavigation = 0
    let HocSinhSelected = null
    let IsLanguage = false
    let IsPassRoleParent = false
    if (window.localStorage) {
        if (localStorage.getItem('tabBottomNavigation')) bottomNavigation = parseInt(localStorage.getItem('tabBottomNavigation'))
        if (localStorage.getItem('HocSinhSelected')) HocSinhSelected = JSON.parse(localStorage.getItem('HocSinhSelected'))
        if (localStorage.getItem('IsLanguage')) IsLanguage = Boolean(localStorage.getItem('IsLanguage'))
        if (localStorage.getItem('IsPassRoleParent')) IsPassRoleParent = Boolean(localStorage.getItem('IsPassRoleParent'))
    }
    vueData.bottomNavigation = bottomNavigation
    vueData.HocSinhSelected = HocSinhSelected
    vueData.IsLanguage = IsLanguage
    vueData.IsPassRoleParent = IsPassRoleParent
}
function onSelectedHocSinh(item) {
    // let NienKhoaBefore = vueData.NienKhoa
    // const Semester = localStorage.getItem('Semester')
    // if (!Semester) return Vue.$toast.warning('Vui lòng chọn học kỳ', { position: 'top' })
    ajaxCALL('lms/HocSinh_Detail_GetBy_HocSinhID',
        {
            HocSinhID: item.StudentID,
            NienKhoa: vueData.NienKhoa ?? vueData.DSNienKhoa.find(item => item.IsActive == 1)?.IsActive
        }, data => {
            vueData.HocSinhSelected = { ...item, ...data }
            localStorage.setItem('HocSinhSelected', JSON.stringify({ ...item, ...data }))
            vueData.drawerSelectStudent = false
            vueData.drawerOnboarding = false
            setActiveComponentKey()
        }
    )
}
function setUrlTab() {
    let url = new URL(window.location.href);
    url.searchParams.set('tab', vueData.bottomNavigation); // Thêm tham số
    history.pushState(null, '', url); // Cập nhật URL
}
function setActiveComponentKey() {
    const bottomNavigation = vueData.bottomNavigation
    if (bottomNavigation === 0) {
        if (vueData.IsPassRoleParent) CALL('getDSThang_GV')
        else CALL('getDSThang')
        vueData.keyComponentUcThang++
    }
    else if (bottomNavigation === 1) vueData.keyComponentUcTiengAnh++
    else if (bottomNavigation === 2) vueData.keyComponentUcHocKy++
    else if (bottomNavigation === 3) vueData.keyComponentUcTongDiemQuaTrinh++
}
function HandleWidth() {
    if (window.innerWidth < 960) {
        vueData.isLowScreen = true
    } else {
        vueData.isLowScreen = false
    }
}
addEventListener('resize', () => {
    if (window.innerWidth < 960) {
        vueData.isLowScreen = true
    } else {
        vueData.isLowScreen = false
    }
})
// addEventListener("beforeunload", () => {
// });
vueData.onSelectedHocSinh = onSelectedHocSinh