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
        //C2 - C3
        const NoiDungKienThuc_HTML = null
        const NoiDungNangLuc_HTML = null
        const NoiDungHoatDongKhac_HTML = null
        let arr = [
            s.HocSinhID,
            s.SoDanhBo,
            s.HoTen
        ]
        const arrC1 = [
            DiemToan,
            NhanXetToan_HTML,
            DiemTiengViet,
            NhanXetTiengViet_HTML,
            NhanXetMonHocKhac_HTML,
            HoatDongGiaoDucKhac_HTML,
            PhamChatNangLuc_HTML
        ]
        const arrC2_C3 = [
            NoiDungKienThuc_HTML,
            NoiDungNangLuc_HTML,
            NoiDungHoatDongKhac_HTML
        ]
        if (vueData.dataSource_API[0].CapID === 1) arr = [...arr, ...arrC1]
        else arr = [...arr, ...arrC2_C3]
        return arr
    }
    )
    vueData.dataSource = tableData
}
function convertHocSinhToAPI() {
    vueData.JSON_NhanXetThang = []
    const tableData = vueData.dataSource.map((s) => {
        const hsl = vueData.dataSource_API.find(h => h.HocSinhID == s.HocSinhID)
        console.log('hsl', hsl, s);
        if (hsl?.CapID === 1) {
            console.log('s')
            return {
                HocSinhID: s.HocSinhID,
                SoDanhBo: s.SoDanhBo,
                HoTen: s.HoTen,
                DiemToan: s.DiemToan || null,
                NhanXetToan_HTML: s.NhanXetToan_HTML || null,
                DiemTiengViet: s.DiemTiengViet || null,
                NhanXetTiengViet_HTML: s.NhanXetTiengViet_HTML || null,
                NhanXetMonHocKhac_HTML: s.NhanXetMonHocKhac_HTML || null,
                HoatDongGiaoDucKhac_HTML: s.HoatDongGiaoDucKhac_HTML || null,
                PhamChatNangLuc_HTML: s.PhamChatNangLuc_HTML || null,
                LopID: vueData.LopID,
                Lop_NhanXetThangID: vueData.Lop_NhanXetThangID,
                HSLopID: hsl.HSLopID
            }
        } else if (hsl?.CapID === 2 || hsl?.CapID === 3) {
            return {
                HocSinhID: s.HocSinhID,
                SoDanhBo: s.SoDanhBo,
                HoTen: s.HoTen,
                NoiDungKienThuc_HTML: s.NoiDungKienThuc_HTML || null,
                NoiDungNangLuc_HTML: s.NoiDungNangLuc_HTML || null,
                NoiDungHoatDongKhac_HTML: s.NoiDungHoatDongKhac_HTML || null,
                LopID: vueData.LopID,
                Lop_NhanXetThangID: vueData.Lop_NhanXetThangID,
                HSLopID: hsl.HSLopID,
                DiemToan: s.DiemToan || null,
                DiemTiengViet: s.DiemTiengViet || null,
            }
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
function renderColumn() {
    vueData.columns = []
    let columns = []
    if (vueData.dataSource_API[0].CapID === 1) {
        columns = [
            {
                "type": "text",
                "title": "Mã học sinh",
                "name": "HocSinhID",
                "width": 120,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Số Danh Bộ",
                "name": "SoDanhBo",
                "width": 120,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Họ tên học sinh",
                "name": "HoTen",
                "width": 300,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Điểm Toán",
                "name": "DiemToan",
                "width": 300,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Nhận xét Toán",
                "name": "NhanXetToan_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                align: "left"
            },
            {
                "type": "text",
                "title": "Điểm Tiếng Việt",
                "name": "DiemTiengViet",
                "width": 300,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Nhận xét Tiếng Việt",
                "name": "NhanXetTiengViet_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                align: "left"
            },
            {
                "type": "text",
                "title": "Nhận xét môn học khác",
                "name": "NhanXetMonHocKhac_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                align: "left"
            },
            {
                "type": "text",
                "title": "Hoạt động giáo dục khác",
                "name": "HoatDongGiaoDucKhac_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                align: "left"
            },
            {
                "type": "text",
                "title": "Phẩm chất - Năng lực",
                "name": "PhamChatNangLuc_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                align: "left"
            }
        ]
    }
    else {
        columns = [
            {
                "type": "text",
                "title": "Mã học sinh",
                "name": "HocSinhID",
                "width": 120,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Số Danh Bộ",
                "name": "SoDanhBo",
                "width": 120,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Họ tên học sinh",
                "name": "HoTen",
                "width": 300,
                "backGroundColor": null,
                "wrap": true
            },
            {
                "type": "text",
                "title": "Nội dung kiến thức",
                "name": "NoiDungKienThuc_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                "align": "left"
            },
            {
                "type": "text",
                "title": "Nội dung năng lực",
                "name": "NoiDungNangLuc_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                "align": "left"
            },
            {
                "type": "text",
                "title": "Nội dung hoạt động khác",
                "name": "NoiDungHoatDongKhac_HTML",
                "width": 300,
                "backGroundColor": null,
                "wrap": true,
                "align": "left"
            }
        ]
    }
    vueData.columns = columns
}