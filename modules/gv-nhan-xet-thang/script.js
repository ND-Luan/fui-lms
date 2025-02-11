function processDataBeforePostAPI() {
    vueData.JSON_NhanXetThang = []
    const newData = []
    for (var item of vueData.items) {
        var html_KienThuc = null
        var html_NangLuc = null
        var htmlHoatDongKhac = null
        if (item.NoiDungKienThuc) html_KienThuc = convertDeltaToHtml(item.NoiDungKienThuc_Delta)
        if (item.NoiDungNangLuc) html_NangLuc = convertDeltaToHtml(item.NoiDungNangLuc_Delta)
        if (item.NoiDungHoatDongKhac) htmlHoatDongKhac = convertDeltaToHtml(item.NoiDungHoatDongKhac_Delta)
        newData.push({
            ...item,
            LopID: vueData.LopID,
            Thang: vueData.ThangObj.Thang,
            Nam: vueData.ThangObj.Nam,
            NienKhoa: vueData.ThangObj.NienKhoa,
            NoiDungKienThuc_HTML: html_KienThuc,
            NoiDungNangLuc_HTML: html_NangLuc,
            NoiDungHoatDongKhac_HTML: htmlHoatDongKhac
        })
    }
    vueData.JSON_NhanXetThang = newData
}

function convertDeltaToHtml(delta) {
    var cfg = {};
    var converter = new QuillDeltaToHtmlConverter(delta.ops, cfg);
    return converter.convert();
}

function onLuuTamByHocSinhID(item) {
    var html_KienThuc = null
    var html_NangLuc = null
    var htmlHoatDongKhac = null
    if (item.NoiDungKienThuc) html_KienThuc = convertDeltaToHtml(item.NoiDungKienThuc_Delta)
    if (item.NoiDungNangLuc) html_NangLuc = convertDeltaToHtml(item.NoiDungNangLuc_Delta)
    if (item.NoiDungHoatDongKhac) htmlHoatDongKhac = convertDeltaToHtml(item.NoiDungHoatDongKhac_Delta)
    ajaxCALL('lms/NhanXetThang_Ins_By_NhanXetThangID', {
        ...item,
        LopID: vueData.LopID,
        Thang: vueData.ThangObj.Thang,
        Nam: vueData.ThangObj.Nam,
        NienKhoa: vueData.ThangObj.NienKhoa,
        NoiDungKienThuc_HTML: html_KienThuc,
        NoiDungNangLuc_HTML: html_NangLuc,
        NoiDungHoatDongKhac_HTML: htmlHoatDongKhac
    }, res => {
        Vue.$toast.success('Lưu tạm thành công', { position: 'top' })
        CALL('NhanXetThang_Get')
    })
}

function convertItems() {
    // vueData.items = vueData.items.splice(0, 1).map(item => ({
    //     ...item,
    //     // NoiDungKienThuc_Delta: { "ops": [{ "insert": "12312312321\n123\n123\n123\n123\n" }] }, //item.NoiDungKienThuc_Delta ? JSON.parse(item.NoiDungKienThuc_Delta) : null,
    //     // NoiDungNangLuc_Delta: { "ops": [{ "insert": "12312312321\n123\n123\n123\n123\n" }] }, //item.NoiDungKienThuc_Delta ? JSON.parse(item.NoiDungKienThuc_Delta) : null,
    //     // NoiDungHoatDongKhac_Delta: { "ops": [{ "insert": "12312312321\n123\n123\n123\n123\n" }] }, //item.NoiDungKienThuc_Delta ? JSON.parse(item.NoiDungKienThuc_Delta) : null,
    //     // NoiDungNangLuc_Delta: { ops: [{}] }, //item.NoiDungNangLuc_Delta ? JSON.parse(item.NoiDungNangLuc_Delta) : null,
    //     // NoiDungHoatDongKhac_Delta: {
    //     //     ops: [{ insert: "3\n" }]
    //     // }, //: item.NoiDungHoatDongKhac_Delta ? JSON.parse(item.NoiDungHoatDongKhac_Delta) : null
    // }))
    // vueData.items = vueData.items.splice(0, 1)
    // vueData.items[0].NoiDungKienThuc_Delta = { "ops": [{ "insert": "Võ trương như anh\n" }] }
    // vueData.items[0].NoiDungNangLuc_Delta = { "ops": [{ "insert": "Võ trương như anh\n" }] }
    // vueData.items[0].NoiDungHoatDongKhac_Delta = { "ops": [{ "insert": "Võ trương như anh\n" }] }

}