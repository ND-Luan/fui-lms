function convertHocSinh() {
    const isCuoiKi = [5, 12].includes(vueData.currentThangObj?.Thang)
    const isThang5 = vueData.currentThangObj?.Thang === 5
    const tableData = vueData.dataSource_API.map((s) => {
        let arr = [s.HocSinhID, s.SoDanhBo, s.HoTen]
        const cap = vueData.dataSource_API[0].CapID
        if (cap === 1) {
            arr = [...arr, null, null, null, null, null, null, null]
        } else if (cap === 2 || cap === 3) {
            if (isCuoiKi) {
                arr = [...arr, null, null, null]
                if (isThang5) arr.push(null)
            } else {
                arr = [...arr, null, null, null]
            }
        }
        return arr
    })
    vueData.dataSource = tableData
}
function convertHocSinhToAPI() {
    vueData.JSON_NhanXetThang = []
    const isCuoiKi = [5, 12].includes(vueData.currentThangObj?.Thang)
    const isThang5 = vueData.currentThangObj?.Thang === 5
    const tableData = vueData.dataSource.map((s) => {
        const hsl = vueData.dataSource_API.find(h => h.HocSinhID == s.HocSinhID)
        if (hsl?.CapID === 1) {
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
            const base = {
                HocSinhID: s.HocSinhID,
                SoDanhBo: s.SoDanhBo,
                HoTen: s.HoTen,
                LopID: vueData.LopID,
                Lop_NhanXetThangID: vueData.Lop_NhanXetThangID,
                HSLopID: hsl.HSLopID
            }
            if (isCuoiKi) {
                base.UuDiem = s.UuDiem || null
                base.NhuocDiem = s.NhuocDiem || null
                base.DeXuat = s.DeXuat || null
                if (isThang5) {
                    const nxt = s.NhanXetGVCN || null
                    if (nxt && nxt.length > 500) {
                        Toast.warning({ text: `Học sinh <b>${s.HoTen}</b>: Nhận xét ghi học bạ vượt quá 500 ký tự (${nxt.length} ký tự). Dữ liệu sẽ được cắt bớt còn 500 ký tự.` })
                    }
                    base.NhanXetGVCN = nxt ? nxt.slice(0, 500) : null
                }
            } else {
                base.NoiDungKienThuc_HTML = s.NoiDungKienThuc_HTML || null
                base.NoiDungNangLuc_HTML = s.NoiDungNangLuc_HTML || null
                base.NoiDungHoatDongKhac_HTML = s.NoiDungHoatDongKhac_HTML || null
            }
            return base
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
                "title": "Nhận xét môn Toán",
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
                "title": "Nhận xét môn Tiếng Việt",
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
        const isCuoiKi = [5, 12].includes(vueData.currentThangObj?.Thang)
        const isThang5 = vueData.currentThangObj?.Thang === 5
        const baseColumns = [
            { "type": "text", "title": "Mã học sinh", "name": "HocSinhID", "width": 120, "backGroundColor": null, "wrap": true },
            { "type": "text", "title": "Số Danh Bộ", "name": "SoDanhBo", "width": 120, "backGroundColor": null, "wrap": true },
            { "type": "text", "title": "Họ tên học sinh", "name": "HoTen", "width": 300, "backGroundColor": null, "wrap": true }
        ]
        let additionalColumns = []
        if (isCuoiKi) {
            additionalColumns = [
                { "type": "text", "title": "Ưu điểm", "name": "UuDiem", "width": 300, "backGroundColor": null, "wrap": true, "align": "left" },
                { "type": "text", "title": "Nhược điểm", "name": "NhuocDiem", "width": 300, "backGroundColor": null, "wrap": true, "align": "left" },
                { "type": "text", "title": "Đề xuất", "name": "DeXuat", "width": 300, "backGroundColor": null, "wrap": true, "align": "left" }
            ]
            if (isThang5) {
                additionalColumns.push({ "type": "text", "title": "Nhận xét ghi học bạ", "name": "NhanXetGVCN", "width": 300, "backGroundColor": null, "wrap": true, "align": "left" })
            }
        } else {
            additionalColumns = [
                { "type": "text", "title": "Về học tập", "name": "NoiDungKienThuc_HTML", "width": 300, "backGroundColor": null, "wrap": true, "align": "left" },
                { "type": "text", "title": "Về nền nếp", "name": "NoiDungNangLuc_HTML", "width": 300, "backGroundColor": null, "wrap": true, "align": "left" },
                { "type": "text", "title": "Mong muốn phối hợp", "name": "NoiDungHoatDongKhac_HTML", "width": 300, "backGroundColor": null, "wrap": true, "align": "left" }
            ]
        }
        columns = [...baseColumns, ...additionalColumns]
    }
    vueData.columns = columns
}