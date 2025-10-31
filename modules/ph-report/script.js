function initPage() {
    let bottomNavigation = 0
    // let HocSinhSelected = null
    let IsLanguage = false
    let IsPassRoleParent = false
    if (window.localStorage) {
        if (localStorage.getItem('tabBottomNavigation')) bottomNavigation = parseInt(localStorage.getItem('tabBottomNavigation'))
        // if (localStorage.getItem('HocSinhSelected')) HocSinhSelected = JSON.parse(localStorage.getItem('HocSinhSelected'))
        if (localStorage.getItem('IsLanguage')) IsLanguage = Boolean(localStorage.getItem('IsLanguage'))
        if (localStorage.getItem('IsPassRoleParent')) IsPassRoleParent = Boolean(localStorage.getItem('IsPassRoleParent'))
    }
    vueData.bottomNavigation = bottomNavigation
    // vueData.HocSinhSelected = HocSinhSelected
    vueData.IsLanguage = IsLanguage
    vueData.IsPassRoleParent = IsPassRoleParent
}
function onSelectedHocSinh(item, options = { IsSelect: false }) {
    console.log('onSelectedHocSinh...')
    //Xử lý thêm nếu ko có truyền param HocSinhID thì lấy học sinh đầu tiên trong danh sách
    let _hocSinhID = null
    //Không có HocSinh lấy default
    if (!item.HocSinhID) {
        const existHocSinhInSchool = vueData.DSHocSinh.find(x => x.Khoi >= 1)
        console.log('existHocSinhInSchool', existHocSinhInSchool)
        if (existHocSinhInSchool) {
            _hocSinhID = existHocSinhInSchool.HocSinhID
        }
    } else {
        _hocSinhID = item.HocSinhID
    }
    if (!_hocSinhID) {
        Vue.$toast.error("Không tìm thấy học sinh", { position: "top" })
        return
    }
    ajaxCALL('lms/HocSinh_Detail_GetBy_HocSinhID',
        {
            HocSinhID: _hocSinhID,
            NienKhoa: vueData.NienKhoa
        }, data => {
            vueData.HocSinhSelected = { ...item, ...data }
            if (vueData.HocSinhSelected.NienKhoaHoc.length > 0) {
                vueData.HocSinhSelected.NienKhoaHoc = JSON.parse(vueData.HocSinhSelected.NienKhoaHoc)
                vueData.DSNienKhoa = vueData.HocSinhSelected.NienKhoaHoc
            }
            let url = new URL(window.location.href);
            // console.log('vueData.HocSinhSelected script', vueData.HocSinhSelected)
            url.searchParams.set('HocSinhID', data.HocSinhID); // Thêm tham số
            history.pushState(null, '', url); // Cập nhật URL
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
    console.log('bottomNavigation', bottomNavigation)
    console.log('vueData.keyComponentUcThang', vueData.keyComponentUcThang)
    if (bottomNavigation === 0) {
        // if (vueData.IsPassRoleParent) CALL('getDSThang_GV')
        // else CALL('getDSThang')
        vueData.keyComponentUcThang++
        console.log('vueData.keyComponentUcThang', vueData.keyComponentUcThang)
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
addEventListener('resize', HandleWidth)
// addEventListener("beforeunload", () => {
// });
vueData.onSelectedHocSinh = onSelectedHocSinh