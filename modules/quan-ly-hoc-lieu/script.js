function loadItems() {
    // vueData.isLoading = true;
    const { page, itemsPerPage } = vueData.options;
    const params = {
        PageNumber: page,
        PageSize: itemsPerPage,
        KhoiID: vueData.filterKhoiID ?? 0,
        MonHocID: vueData.filterMonHocID ?? 0,
        BoSachID: vueData.filterBoSachID ?? 0
    };
    ajaxCALL("lms/FP_HocLieu_GetAll", params, res => {
        vueData.hocLieuList = res.data
    })
}
function onLoadKhoi_GetDSMonHoc(khoiId) {
    return new Promise(resolve => {
        ajaxCALL('lms/MonHoc_GetByKhoiID', {
            KhoiID: khoiId,
            NienKhoa: vueData.NienKhoa,
            HocKi: vueData.NienKhoaItem.HocKi
        }, res => resolve(res.data))
    })
}
vueData.onLoadKhoi_GetDSMonHoc = onLoadKhoi_GetDSMonHoc
vueData.loadItems = loadItems