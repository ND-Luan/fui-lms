function processDataBeforePostAPI() {
    vueData.JSON_NhanXetThang = []
    const newData = []
    for (var item of vueData.items) {
        var cfg = {};
        var html_KienThuc = null
        var html_NangLuc = null
        var htmlHoatDongKhac = null
        if (item.NoiDungKienThuc) {
            var converter_KienThuc = new QuillDeltaToHtmlConverter(item.NoiDungKienThuc.ops, cfg);
            html_KienThuc = converter_KienThuc.convert();
        }
        if (item.NoiDungNangLuc) {
            var converter_NangLuc = new QuillDeltaToHtmlConverter(item.NoiDungNangLuc.ops, cfg);
            html_NangLuc = converter_NangLuc.convert();
        }
        if (item.NoiDungHoatDongKhac) {
            var converter_HoatdongKhac = new QuillDeltaToHtmlConverter(item.NoiDungHoatDongKhac.ops, cfg);
            htmlHoatDongKhac = converter_HoatdongKhac.convert();
        }
        newData.push({
            ...item,
            LopID: vueData.FormSearch.LopID,
            Thang: vueData.FormSearch.ThangObj.Thang,
            Nam: vueData.FormSearch.ThangObj.Nam,
            NienKhoa: vueData.FormSearch.ThangObj.NienKhoa,
            NoiDungKienThuc: html_KienThuc,
            NoiDungNangLuc: html_NangLuc,
            NoiDungHoatDongKhac: htmlHoatDongKhac,
        })
    }
    vueData.JSON_NhanXetThang = newData
}