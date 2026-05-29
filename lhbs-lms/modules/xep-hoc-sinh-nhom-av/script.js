function addHocSinhVaoNhom() {
    confirm({
        title: "Xác nhận thêm học sinh?",
        message: "Bạn có chắc muốn thêm những học sinh đã chọn vào nhóm này?",
        action: () => {
            ajaxCALL('lms/HocSinhNhom_Ins', {
                Json_HocSinhNhom: vueData.ListHocSinhThem,
                NhomID: vueData.NhomItem?.NhomID
            }, res => {
                Vue.$toast.success("Đã thêm học sinh vào nhóm!", { position: "top" });;
                vueData.dialogVisible = false;
                CALL('getHS');
                vueData.DSHSSelected = []
            })
        }
    })
}
function delHocSinh(item) {
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
async function apiXepBangdiem(item) {
    return await ajaxCALLPromise("lms/XepBangDiem_ChuyenLop_ByHocSinhID", {
        HocSinhID: item.HocSinhID,
        NhomID_Chuyen: vueData.NhomItemmm.NhomID,
        MonHocID: vueData.NhomItem.MonHocID,
        NienKhoa: vueData.NienKhoa
    })
}
async function apiUpdHocSinh(item, isMultiple) {
    if (vueData.NhomItem.MonHocID === 76) {
        await apiXepBangdiem(item)
        await ajaxCALLPromise('lms/HocSinhNhom_Upd_NhomID', {
            NhomID: vueData.NhomItemmm.NhomID,
            HSNhomID: item.HSNhomID,
        }).then(() => {
            //Chuyển Bảng điểm sang bảng điểm mới
            Vue.$toast.success(`Đã chuyển học sinh ${item.HocSinhID} - ${item.HoTen} qua nhóm ${vueData.NhomItemmm.NhomID}`, { position: "top" });
            vueData.dialogThem = false;
            CALL('getHS');
            vueData.keyTable_HS++
            vueData.keyTable_Nhom++
            if (!isMultiple) vueData.NhomItemmm = []
        })
    } else {
        await apiXepBangdiem(item)
        await ajaxCALLPromise('lms/HocSinhNhom_Upd_NhomID', {
            NhomID: vueData.NhomItemmm.NhomID,
            HSNhomID: item.HSNhomID,
        }).then(() => {
            //Chuyển Bảng điểm sang bảng điểm mới
            Vue.$toast.success(`Đã chuyển học sinh ${item.HocSinhID} - ${item.HoTen} qua nhóm ${vueData.NhomItemmm.NhomID}`, { position: "top" });
            vueData.dialogThem = false;
            CALL('getHS');
            vueData.keyTable_HS++
            vueData.keyTable_Nhom++
            if (!isMultiple) vueData.NhomItemmm = []
        })
    }
}
function upHocSinh(item) {
    confirm({
        title: "Xác nhận chuyển học sinh?",
        message: "Bạn có chắc muốn chuyển học sinh đã chọn vào nhóm này?",
        action: async function () {
            await apiUpdHocSinh(item)
        }
    })
}
function upHocSinhMultiple() {
    confirm({
        title: "Xác nhận chuyển nhiều học sinh?",
        message: "Bạn có chắc muốn chuyển học sinh đã chọn vào nhóm này?",
        action: function () {
            const promise = () => {
                return new Promise(async resolve => {
                    for (const hs of vueData.DSHocSinhChuyen) {
                        await apiUpdHocSinh(hs, true)
                    }
                    resolve()
                })
            }
            promise().then(() => {
                vueData.NhomItemmm = []
                vueData.dialogThemMultiple = false;
            })
        }
    })
}
function onDetailHocSinh(item) {
    vueData.NhomItem = item
    ajaxCALL("lms/HocSinhNhom_Get_ByNhomID", {
        NienKhoa: vueData.NienKhoa,
        NhomID: item.NhomID
    }, res => {
        vueData.DSHSTheoNhom = res.data
        vueData.keyTable_HS++
        vueData.keyTable++
    })
}
function moDialogChuyen(item) {
    vueData.HocSinhChuyen = item;
    vueData.dialogThem = true;
}
function moDialogChuyenMultiple() {
    vueData.DSHocSinhChuyen = _.cloneDeep(vueData.HocSinhSelected)
    vueData.dialogThemMultiple = true;
}
function blurSoTT(e, item) {
    const SoTT = e.target.value
    if (!SoTT || SoTT == item.SoTT) return
    ajaxCALL("lms/SoTT_Udp_ByHSNhomID", {
        HSNhomID: item.HSNhomID,
        SoTT
    }, () => {
        Vue.$toast.success("Cập nhật số thứ tự thành công", { "position": "top" })
        CALL('getHS')
    })
}
vueData.onDetailHocSinh = onDetailHocSinh
vueData.addHocSinhVaoNhom = addHocSinhVaoNhom
vueData.moDialogChuyen = moDialogChuyen
vueData.moDialogChuyenMultiple = moDialogChuyenMultiple
vueData.delHocSinh = delHocSinh
vueData.upHocSinh = upHocSinh
vueData.upHocSinhMultiple = upHocSinhMultiple
vueData.blurSoTT = blurSoTT