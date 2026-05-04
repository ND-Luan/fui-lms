function renderDSHocSinh() {
    const eduBotHocSinhLop = []
    let items = []
    const currentDSHocSinhLop_LMS = vueData.DSHocSinhLop_LMS.filter(x => x.LopID == vueData.LopItem.LopID)
    for (var hsl of currentDSHocSinhLop_LMS) {
        const hs = vueData.DSHocSinh_LMS.find(x => x.HocSinhID === hsl.HocSinhID)
        if (hs) {
            eduBotHocSinhLop.push({ ...hsl, ...hs })
        }
    }
    const uniqueHocSinhID = [...new Set(eduBotHocSinhLop.map(x => x.HocSinhID))]
    for (var id of uniqueHocSinhID) {
        let obj = {}
        const hocSinh = vueData.DSHocSinhLop.find(x => x.HocSinhID === id)
        const hocSinhLMS = eduBotHocSinhLop.find(x => x.HocSinhID === id)
        if (hocSinh) {
            //KQHT
            const _hs = vueData.DSHocSinhLop.find(x => x.HocSinhID === hocSinh.HocSinhID)
            obj.HSLopID = hocSinh.HSLopID
            obj.LopID = hocSinh.LopID
            obj.HocSinhID = _hs.HocSinhID
            obj.HoTen = _hs.Ho + ' ' + _hs.Ten
            obj.Ho = _hs.Ho
            obj.Ten = _hs.Ten
            obj.NgaySinh = _hs.NgaySinh
            obj.Nu = _hs.Nu
            obj.TinhTrangKQHT = _hs?.TinhTrang
            obj.TenTinhTrangKQHT = _hs?.TenTinhTrang
            obj.EnglishName = _hs?.EnglishName
        }
        if (hocSinhLMS) {
            //EDUBOT
            const _hs = eduBotHocSinhLop.find(x => x.HocSinhID === hocSinhLMS.HocSinhID)
            obj.HSLopID = hocSinhLMS.HSLopID
            obj.LopID = hocSinhLMS.LopID
            obj.HocSinhID = _hs.HocSinhID
            obj.HoTen = _hs.Ho + ' ' + _hs.Ten
            obj.Ho = _hs.Ho
            obj.Ten = _hs.Ten
            obj.NgaySinh = _hs.NgaySinh
            obj.Nu = _hs.Nu
            obj.TinhTrangQLHS = _hs?.TinhTrang
            obj.TenTinhTrangQLHS = _hs?.TenTinhTrang
        }
        items.push({
            ...obj,
            HSLopID: hocSinhLMS.HSLopID,
            LopID: hocSinhLMS.LopID,
            SoDanhBo: hocSinhLMS.SoDanhBo,
            CreateUser: hocSinhLMS.CreateUser,
            CreateTime: hocSinhLMS.CreateTime,
            UpdateUser: hocSinhLMS.UpdateUser,
            UpdateTime: hocSinhLMS.UpdateTime,
        })
    }
    vueData.items = items.sort((a, b) => {
        // Ưu tiên sắp xếp theo SoDanhBo (chuyển sang số nếu cần)
        const soA = isNaN(a.SoDanhBo) ? a.SoDanhBo : parseInt(a.SoDanhBo)
        const soB = isNaN(b.SoDanhBo) ? b.SoDanhBo : parseInt(b.SoDanhBo)
        if (soA < soB) return -1
        if (soA > soB) return 1
        // Nếu SoDanhBo giống nhau, sắp tiếp theo Tên
        const tenA = a.Ten?.toLowerCase() || ''
        const tenB = b.Ten?.toLowerCase() || ''
        return tenA.localeCompare(tenB)
    }).map((x, index) => {
        return {
            ...x,
            STT: index + 1,
            HoTen: x.Ho + ' ' + x.Ten,
        }
    })
}
function localStorageSetItem(item) {
    console.log('item',item)
    const bottomNavigation = localStorage.getItem('tabBottomNavigation')
    if (bottomNavigation === null) localStorage.setItem('tabBottomNavigation', 0)
    const Semester = localStorage.getItem('Semester')
    if (Semester === null) localStorage.setItem('Semester', 1)
    localStorage.setItem('IsPassRoleParent', true)
    openWindow({
        title: 'Xem chi tiết ' + item.HoTen,
        url: `/ph-report?HocSinhID=${item.HocSinhID}`
    })
}
function onOpenModalEditProfile(item) {
    vueData.StudentProfile = { ...item }
    vueData.isOpenModalEditProfile = true
}
vueData.TitlePage = getTitlePageByURL(window.location.pathname + window.location.search)
vueData.localStorageSetItem = localStorageSetItem
vueData.onOpenModalEditProfile = onOpenModalEditProfile