function convertHocSinh() {
    // Chuyển đổi danh sách object thành mảng hai chiều
    const tableData = vueData.dataSource_API.map((s) => {
        const DiemToan = null
        const NhanXetToan_HTML = null
        const DiemTiengViet = null
        const NhanXetTiengViet_HTML = null
        const NhanXetMonHocKhac_HTML = null
        const HoatDongGiaoDucKhac_HTML = null
        const PhamChatNangLuc_HTML = null
        return [
            s.HocSinhID,
            s.SoDanhBo,
            s.HoTen,
            DiemToan,
            NhanXetToan_HTML,
            DiemTiengViet,
            NhanXetTiengViet_HTML,
            NhanXetMonHocKhac_HTML,
            HoatDongGiaoDucKhac_HTML,
            PhamChatNangLuc_HTML,
        ]
    }
    )
    vueData.dataSource = tableData
}
function convertHocSinhToAPI() {
    vueData.JSON_NhanXetThang = []
    const tableData = vueData.dataSource.map((s) => {
        const hsl = vueData.dataSource_API.find(h => h.HocSinhID == s[0])
        return {
            HocSinhID: s[0],
            SoDanhBo: s[1],
            HoTen: s[2],
            DiemToan: s[3] || null,
            NhanXetToan_HTML: s[4] || null,
            DiemTiengViet: s[5] || null,
            NhanXetTiengViet_HTML: s[6] || null,
            NhanXetMonHocKhac_HTML: s[7] || null,
            HoatDongGiaoDucKhac_HTML: s[8] || null,
            PhamChatNangLuc_HTML: s[9] || null,
            LopID: vueData.LopID,
            Lop_NhanXetThangID: vueData.Lop_NhanXetThangID,
            HSLopID: hsl.HSLopID
        }
    })
    vueData.JSON_NhanXetThang = tableData
}
function convertToHTML(text) {
    // Thay thế ký tự xuống dòng đôi (\n\n) bằng <br>
    let html = text.replace(/\n\n/g, "<br>");
    // Thay thế dấu "" (trích dẫn kép) thành thẻ <em> để in nghiêng
    html = html.replace(/""(.*?)""/g, "<em>$1</em>");
    // Nếu bắt đầu bằng dấu '-', chuyển thành danh sách <ul>
    if (html.startsWith("- ")) {
        html = html.replace(/^- /, "<ul><li>") + "</li></ul>";
    }
    return html;
}
function initColumn() {
    for (var column of vueData.columns) {
        column.render = function (cell, value, x, y, instance, options) {
            if (cell.innerHTML !== '') {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = value;
                // Thêm DOM vào ô
                cell.innerHTML = '';
                cell.appendChild(tempDiv.firstChild); // Gắn DOM vào ô
            }
        }
    }
}