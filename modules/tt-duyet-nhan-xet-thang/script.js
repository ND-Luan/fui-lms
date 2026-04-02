// Shared across uc-main-layout.vue + uc-dialog-duyet-all.vue
function buildPushMEText(item, capID, nienKhoa, thangObj) {
    if (capID === 1) {
        return `Nội dung nhận xét học sinh: ${item.HoTen}\n`
            + `Năm học: ${nienKhoa}-${nienKhoa + 1} - Tháng ${thangObj.Thang}\n`
            + `Quý phụ huynh vui lòng xem nhận xét chi tiết tại: https://lms.lhbs.vn/ph-report?tab=0&HocSinhID=${item.HocSinhID}`
    }
    if (capID === 2 || capID === 3) {
        if ([12, 5].includes(thangObj.Thang)) {
            return `Kết quả học tập của học sinh: ${item.HoTen}\n`
                + `Năm học: ${nienKhoa} - ${nienKhoa + 1} - Kỳ đánh giá: Tháng ${thangObj.Thang} - Học kì ${thangObj.HocKy}\n`
                + `Ưu điểm: \n${item.UuDiem?.trim() || '-'} \nNhược điểm: \n${item.NhuocDiem?.trim() || '-'} \nĐề xuất: \n${item.DeXuat?.trim() || '-'} `
                + `\nXem chi tiết kết quả học tập: https://lms.lhbs.vn/ph-report?tab=0&HocSinhID=${item.HocSinhID}`
        }
        return `Kết quả học tập của học sinh: ${item.HoTen}\n`
            + `Năm học: ${nienKhoa} - ${nienKhoa + 1} - Kỳ đánh giá: Tháng ${thangObj.Thang} - Học kì ${thangObj.HocKy}\n`
            + `Học tập: \n${item.NoiDungKienThuc_HTML?.trim() || '-'} \nNề nếp: \n${item.NoiDungNangLuc_HTML?.trim() || '-'} \nMong muốn phối hợp: \n${item.NoiDungHoatDongKhac_HTML?.trim() || '-'} `
            + `\nXem chi tiết kết quả học tập: https://lms.lhbs.vn/ph-report?tab=0&HocSinhID=${item.HocSinhID}`
    }
    return ''
}
