function processDataBeforePushAPI() {
    vueData.Json_KhenThuong = vueData.DSDanhHieu_Filter.map(x => {
        return {
            NienKhoa: vueData.NienKhoa,
            HSLopID: x.HSLopID,
            DanhHieu: x.DanhHieu
        }
    })
}
// const ajaxCALLPromise = async (url, params) => {
//     return new Promise(resolve => {
//         ajaxCALL(url, params, res => {
//             resolve(res.data)
//         })
//     })
// }
function getDSDanhHieu() {
    const List_Khoi = vueData.DSKhoi.filter(x => x.CapID === vueData.CapID)
    const list_HocSinhDanhHieu = []
    const list_HocSinh = []
    const promise = () => {
        return new Promise(async resolve => {
            for (var khoiItem of List_Khoi) {
                const dataDanhHieu = await ajaxCALLPromise('diemc3/LMS_GetDanhHieuToanTruong', {
                    KhoiID: khoiItem.KhoiID,
                    NamHoc: vueData.NienKhoa
                })
                const DSHocSinh = await ajaxCALLPromise('lms/HocSinhLop_Get_By_KhoiID', {
                    KhoiID: khoiItem.KhoiID,
                })
                list_HocSinhDanhHieu.push(dataDanhHieu)
                list_HocSinh.push(DSHocSinh)
                console.log(' - ', khoiItem.KhoiID)
            }
            resolve()
        })
    }
    promise().then(() => {
        vueData.DSDanhHieu = list_HocSinhDanhHieu.flat()
        vueData.DSDanhHieu_Filter = list_HocSinhDanhHieu.flat()
        vueData.DSHocSinhLop = list_HocSinh.flat()
        convertHocSinh()
    })
}
function convertHocSinh() {
    vueData.DanhHieu = 0
    const uniqueHeader = [... new Set(vueData.DSDanhHieu.map(x => x.DanhHieu))]
    vueData.DSDanhHieu_Select = []
    uniqueHeader.forEach((item, index) => {
        vueData.DSDanhHieu_Select.push({
            title: item,
            value: index + 1
        })
    })
    vueData.DSDanhHieu_Select.unshift({
        title: "Tất cả danh hiệu",
        value: 0
    })
    for (var item of vueData.DSDanhHieu_Filter) {
        const objHSL = vueData.DSHocSinhLop.find(x => x.HSLopID === item.HSLopID)
        item.HocSinhID = objHSL?.HocSinhID
        item.SoDanhBo = objHSL?.SoDanhBo
        let _danhHieu = vueData.DSDanhHieu_Select.find(x => x.title === item.DanhHieu).value
        item.DanhHieu_Select = _danhHieu
    }
    vueData.DSDanhHieu = sortHocSinh(vueData.DSDanhHieu)
    vueData.DSDanhHieu_Filter = sortHocSinh(vueData.DSDanhHieu_Filter)
}
function sortHocSinh(danhSach) {
    return danhSach.sort((a, b) => {
        // So sánh TenLop
        if (a.TenLop < b.TenLop) return -1;
        if (a.TenLop > b.TenLop) return 1;
        // Hàm lấy số phía sau dấu '-' trong SoDanhBo
        const extractSoDanhBoNumber = (soDanhBo) => {
            if (!soDanhBo) return null; // null/undefined => giá trị đặc biệt
            const match = soDanhBo.match(/-(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
        };
        const numA = extractSoDanhBoNumber(a.SoDanhBo);
        const numB = extractSoDanhBoNumber(b.SoDanhBo);
        // Nếu một trong hai là null => đưa lên đầu
        if (numA === null && numB !== null) return -1;
        if (numA !== null && numB === null) return 1;
        if (numA === null && numB === null) return 0;
        // Còn lại so sánh số bình thường
        return numA - numB;
    });
}
vueData.convertHocSinh = convertHocSinh
vueData.getDSDanhHieu = getDSDanhHieu