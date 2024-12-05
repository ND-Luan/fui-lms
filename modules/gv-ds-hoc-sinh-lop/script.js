function renderDSCap() {
    const DSCap = Array.from({ length: 3 }).fill(0).map((_, index) => {
        return {
            TenCap: "Cấp " + (index + 1),
            CapID: index + 1
        }
    });
    vueData.DSCap = DSCap;
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
    const currentDSHocSinhLop_LMS = vueData.DSHocSinhLop_LMS.filter(x => x.LopID === vueData.LopItem.LopID)
    for (var hsl of currentDSHocSinhLop_LMS) {
        const hs = vueData.DSHocSinh_LMS.find(x => x.HocSinhID === hsl.HocSinhID)
        if (hs) {
            eduBotHocSinhLop.push({ ...hsl, ...hs })
        }
    }
    const uniqueHocSinhID = [...new Set(eduBotHocSinhLop.map(x => x.HocSinhID))]
    for (var id of uniqueHocSinhID) {
        const hocSinhLMS = eduBotHocSinhLop.find(x => x.HocSinhID === id)
        const hocSinh = vueData.DSHocSinhLop.find(x => x.HocSinhID === id)
        let HocSinhID = 0
        let Ho = 0
        let Ten = 0
        let NgaySinh = 0
        let Nu = 0
        let TinhTrang = 0
        let TenTinhTrang = 0
        let TinhTrangKQHT
        let TinhTrangQLHS
        if (hocSinh) {
            console.log('hs', hocSinh)
            HocSinhID = hocSinh.HocSinhID
            Ho = hocSinh.Ho
            Ten = hocSinh.Ten
            NgaySinh = hocSinh.NgaySinh
            Nu = hocSinh.Nu
            TinhTrang = hocSinh.TinhTrang
            TenTinhTrang = hocSinh.TenTinhTrang
            TinhTrangKQHT = hocSinh?.TenTinhTrang ?? 'Không có'
            TinhTrangQLHS = hocSinhLMS?.TenTinhTrang ?? 'Không có'
        } else {
            console.log('lms', hocSinhLMS)
            HocSinhID = hocSinhLMS.HocSinhID
            Ho = hocSinhLMS.Ho
            Ten = hocSinhLMS.Ten
            NgaySinh = hocSinhLMS.NgaySinh
            Nu = hocSinhLMS.Nu
            TinhTrang = hocSinhLMS.TinhTrang
            TenTinhTrang = hocSinhLMS.TenTinhTrang
            TinhTrangKQHT = hocSinh?.TenTinhTrang ?? 'Không có'
            TinhTrangQLHS = hocSinhLMS?.TenTinhTrang ?? 'Không có'
        }
        vueData.items.push({
            HocSinhID: HocSinhID,
            Ho: Ho,
            Ten: Ten,
            NgaySinh: NgaySinh,
            Nu: Nu,
            TinhTrang: TinhTrang,
            TenTinhTrang: TenTinhTrang,
            HSLopID: hocSinhLMS.HSLopID,
            LopID: hocSinhLMS.LopID,
            SoDanhBo: hocSinhLMS.SoDanhBo,
            CreateUser: hocSinhLMS.CreateUser,
            CreateTime: hocSinhLMS.CreateTime,
            UpdateUser: hocSinhLMS.UpdateUser,
            UpdateTime: hocSinhLMS.UpdateTime,
            TinhTrangKQHT: TinhTrangKQHT,
            TinhTrangQLHS: TinhTrangQLHS,
        })
    }
    vueData.items = vueData.items.map((x, index) => {
        return {
            ...x,
            STT: index + 1,
            HoTen: x.Ho + ' ' + x.Ten,
        }
    })
    console.log(uniqueHocSinhID)
}