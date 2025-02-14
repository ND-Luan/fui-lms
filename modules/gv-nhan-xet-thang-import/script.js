function convertHocSinh() {
    // Chuyển đổi danh sách object thành mảng hai chiều
    const tableData = vueData.dataSource_API.map((s) => [s.HocSinhID, s.SoDanhBo, s.HoTen, s.NoiDungKienThuc_HTML, s.NoiDungNangLuc_HTML, s.NoiDungHoatDongKhac_HTML])
    vueData.dataSource = tableData
}
function convertHocSinhToAPI() {
    vueData.JSON_NhanXetThang = []
    const tableData = vueData.dataSource.map((s) => {
        const hsl = vueData.dataSource_API.find(h => h.HocSinhID === s[0])
        return {
            HocSinhID: s[0],
            SoDanhBo: s[1],
            HoTen: s[2],
            NoiDungKienThuc_HTML: convertToHTML(s[3]),
            NoiDungNangLuc_HTML: convertToHTML(s[4]),
            NoiDungHoatDongKhac_HTML: convertToHTML(s[5]),
            LopID: vueData.LopID,
            Lop_NhanXetThangID: vueData.Lop_NhanXetThangID,
            HSLopID: hsl.HSLopID
        }
    })
    vueData.JSON_NhanXetThang = tableData
    console.log('vueData.JSON_NhanXetThang', vueData.JSON_NhanXetThang)
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
                console.log(cell, value)
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = value;
                // Thêm DOM vào ô
                cell.innerHTML = '';
                cell.appendChild(tempDiv.firstChild); // Gắn DOM vào ô
            }
        }
    }
}