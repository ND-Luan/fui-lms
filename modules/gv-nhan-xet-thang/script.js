function processDataBeforePostAPI() {
    vueData.JSON_NhanXetThang = []
    const newData = []
    for (var item of vueData.items) {
        newData.push({
            ...item,
            LopID: vueData.LopID,
            Lop_NhanXetThangID: vueData.ThangObj.Lop_NhanXetThangID,
            Is_Reject: false,
        })
    }
    vueData.JSON_NhanXetThang = newData
}
function onLuuTamByHocSinhID(item) {
    ajaxCALL('lms/NhanXetThang_Ins_By_NhanXetThangID', {
        ...item,
        LopID: vueData.LopID,
        Lop_NhanXetThangID: vueData.ThangObj.Lop_NhanXetThangID,
    }, res => {
        Vue.$toast.success('Lưu tạm ' + item.HoTen + ' thành công học sinh ', { position: 'top' })
        CALL('NhanXetThang_Get')
    })
}

function renderHeaderTable() {
    const columns = [
        {
            "title": "Mã học sinh",
            "value": "HocSinhID",
            "minWidth": 100
        },
        {
            "title": "Số danh bộ",
            "value": "SoDanhBo",
            "align": "center",
            "minWidth": 150
        },
        {
            "key": "ho_ten",
            "el": "div",
            "title": "Họ tên",
            "minWidth": 350,
            "innerHTML": [
                {
                    "el": "span",
                    "attr": {
                        "class": "font-weight-medium"
                    },
                    "innerHTML": "{{item.HoTen}}"
                },
                {
                    "el": "uc-gender",
                    "attr": {
                        "v-model": "item.Nu"
                    }
                },
                {
                    "el": "p",
                    "attr": {
                        "class": "text-caption"
                    },
                    "innerHTML": "{{item.NgaySinh}}"
                }
            ]
        },
        {
            "key": "NoiDungKienThuc",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NoiDungKienThuc_HTML_' + item.HocSinhID",
                        "v-model": "item.NoiDungKienThuc_HTML",
                        ":spellcheck": "false"
                    }
                }
            ],
            "title": "Nội dung kiến thức",
            "value": "NoiDungKienThuc",
        },
        {
            "key": "NoiDungNangLuc",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NoiDungNangLuc_HTML_' + item.HocSinhID",
                        "v-model": "item.NoiDungNangLuc_HTML",
                        ":spellcheck": "false"
                    }
                }
            ],
            "title": "Nội dung năng lực",
            "value": "NoiDungNangLuc",
        },
        {
            "key": "NoiDungHoatDongKhac",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NoiDungHoatDongKhac_HTML_' + item.HocSinhID",
                        "v-model": "item.NoiDungHoatDongKhac_HTML",
                        ":spellcheck": "false"
                    }
                }
            ],
            "title": "Nội dung hoạt động khác",
            "value": "NoiDungHoatDongKhac",
        },
        !vueData.TinhTrang && {
            "key": "v_btn",
            "el": "v-btn",
            "attr": {
                "color": "primary",
                "variant": "tonal",
                "v-on:click": "() => vueData.onLuuTamByHocSinhID(item)"
            },
            "innerHTML": "Lưu tạm"
        }
    ]
    //Nếu tình trạng = từ chối
    if (vueData.ThangObj.TinhTrang === 3) {
        columns.splice(3, 0, vueData.columnReject)
    }
    vueData.headers = columns
}

const renderLabelTable = () => {
    let label = `Nhận xét tháng <span class="text-red"> cấp ${vueData.CapID}</span> `
    const lop = vueData.DSLop.find(x => x.LopID === vueData.LopID)
    if (lop) {
        label += ` - <span class="text-red">${lop?.TenLop ?? ""}</span>`
    }
    if (vueData.ThangObj?.Thang_HienThi) {
        label += ` - <span class="text-red">${vueData.ThangObj?.Thang_HienThi ?? ""} <span class="text-${vueData.ThangObj.MauTinhTrang}"> • ${vueData.ThangObj?.TenTinhTrang ?? ""} </span> </span>`
    }
    return label
}  