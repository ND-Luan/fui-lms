function renderDSCap() {
    const DSCap = Array.from({ length: 3 }).fill(0).map((_, index) => {
        return {
            TenCap: "Cấp " + (index + 1),
            CapID: index + 1
        }
    });
    console.log(123, vueData.capid)
    vueData.DSCap = DSCap.filter(x => x.CapID === parseInt(vueData.capid));
}
function renderDSKhoi() {
    const DSKhoi = Array.from({ length: 12 }).fill(0).map((_, index) => {
        const khoiId = index + 1;
        let capId = 0;
        if (khoiId >= 1 && khoiId <= 5) {
            capId = 1;
        } else if (khoiId >= 6 && khoiId <= 9) {
            capId = 2;
        } else if (khoiId >= 10 && khoiId <= 12) {
            capId = 3;
        }
        return {
            TenKhoi: "Khối " + khoiId,
            KhoiID: khoiId,
            CapID: capId
        }
    });
    vueData.DSKhoi = DSKhoi;
    vueData.DSKhoi_Init = DSKhoi;
}
function renderDSHocSinh() {
    const eduBotHocSinhLop = []
    let items = []
    const currentDSHocSinhLop_LMS = vueData.DSHocSinhLop_LMS.filter(x => x.LopID == vueData.LopItem.LopID)
    console.log('currentDSHocSinhLop_LMS', currentDSHocSinhLop_LMS)
    for (var hsl of currentDSHocSinhLop_LMS) {
        const hs = vueData.DSHocSinh_LMS.find(x => x.HocSinhID === hsl.HocSinhID)
        if (hs) {
            eduBotHocSinhLop.push({ ...hsl, ...hs })
        }
    }
    const uniqueHocSinhID = [...new Set(eduBotHocSinhLop.map(x => x.HocSinhID))]
    console.log('uniqueHocSinhID', uniqueHocSinhID)
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
    items = items.map((x, index) => {
        return {
            ...x,
            STT: index + 1,
            HoTen: x.Ho + ' ' + x.Ten,
        }
    })
    vueData.items = items
}
function localStorageSetItem(item) {
    const lop = vueData.DSLop.find(x => x.LopID == item.LopID)
    localStorage.setItem('HocSinhSelected',
        JSON.stringify({
            StudentID: item.HocSinhID,
            HocSinhID: item.HocSinhID,
            HoTen: item.HoTen,
            TenLop: lop.TenLop,
            Khoi: vueData.KhoiItem.KhoiID,
            HinhThucHoc: item.HinhThucHoc,
            MaDonVi: item.MaDonVi,
            NgaySinh: item.NgaySinh,
            Nu: item.Nu,
            LopID: item.LopID,
            HSLopID: item.HSLopID,
            NienKhoa: 2024,
            KhoiID: vueData.KhoiItem.KhoiID
        })
    )
    localStorage.setItem('IsPassRoleParent', true)
    openWindow({
        title: 'Xem chi tiết học sinh ' + item.HocSinhID + ' - ' + item.HoTen,
        url: '/ph-report',
        onclose: () => {
        }
    });
}