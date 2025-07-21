function addHocSinhVaoNhom() {
    debugger
    confirm({
        title: "Xác nhận thêm học sinh?",
        message: "Bạn có chắc muốn thêm những học sinh đã chọn vào nhóm này?",
        action: function () {
            ajaxCALL('lms/HocSinhNhom_Ins', {
                Json_HocSinhNhom: vueData.ListHocSinhThem,
                NhomID: vueData.NhomItem?.NhomID
            }, res => {
                Vue.$toast.success("Đã thêm học sinh vào nhóm!", { position: "top" });;
                vueData.dialogVisible = false;
                CALL('getHS');
                vueData.NhomItem=[]
            })
        }
    })
}
function delHocSinh(item) {
    debugger
    confirm({
        title: "Xác nhận xóa học sinh?",
        message: "Bạn có chắc muốn xóa học sinh đã chọn vào nhóm này?",
        action: function () {
            ajaxCALL('lms/HocSinhNhom_Del_HSNhomID', {
                HSNhomID: item.HSNhomID,
            }, res => {
                Vue.$toast.success("Đã xóa học sinh!", { position: "top" });
                CALL('getHS');
            })
        }
    })
}
function upHocSinh(item) {
    debugger
    confirm({
        title: "Xác nhận chuyển học sinh?",
        message: "Bạn có chắc muốn chuyển học sinh đã chọn vào nhóm này?",
        action: function () {
            ajaxCALL('lms/HocSinhNhom_Upd_NhomID', {
                NhomID: vueData.NhomItemmm.NhomID,
                HSNhomID: item.HSNhomID,
            }, res => {
                debugger
                Vue.$toast.success("Đã chuyển học sinh!", { position: "top" });
                vueData.dialogThem = false;
                CALL('getHS');
                vueData.NhomItemmm = []
            })
        }
    })
}
function onDetailHocSinh(item) {
    vueData.NhomItem = item
    console.log(item, vueData.DSNhomTheoKhoi)
    vueData.DSHSTheoNhom = vueData.DSHocSinh.filter(n => n.NhomID === item.NhomID);
    vueData.keyTable_HS++
}
function moDialogChuyen(item) {
    vueData.HocSinhChuyen = item;
    vueData.dialogThem = true;
}
vueData.onDetailHocSinh = onDetailHocSinh
vueData.addHocSinhVaoNhom = addHocSinhVaoNhom
vueData.moDialogChuyen = moDialogChuyen
vueData.delHocSinh = delHocSinh
vueData.upHocSinh = upHocSinh