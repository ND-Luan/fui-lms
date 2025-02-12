function processDataBeforePostAPI() {
    vueData.JSON_NhanXetThang = []
    const newData = []
    for (var item of vueData.items) {
        newData.push({
            ...item,
            LopID: vueData.LopID,
            Thang: vueData.ThangObj.Thang,
            Nam: vueData.ThangObj.Nam,
            NienKhoa: vueData.ThangObj.NienKhoa,
        })
    }
    vueData.JSON_NhanXetThang = newData
}
function onLuuTamByHocSinhID(item) {
    console.log('NoiDungHoatDongKhac_HTML', item)
    ajaxCALL('lms/NhanXetThang_Ins_By_NhanXetThangID', {
        ...item,
        LopID: vueData.LopID,
        Thang: vueData.ThangObj.Thang,
        Nam: vueData.ThangObj.Nam,
        NienKhoa: vueData.ThangObj.NienKhoa,
    }, res => {
        Vue.$toast.success('Lưu tạm ' + item.HoTen + ' thành công học sinh ', { position: 'top' })
        CALL('NhanXetThang_Get')
    })
} 