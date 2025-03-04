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
            "key": "combine_hsid_sdb",
            "el": "div",
            "title": "Mã học sinh / SDB",
            "innerHTML": [
                {
                    "el": "div",
                    "innerHTML": [
                        {
                            el: "div",
                            innerHTML: [
                                { el: "span", innerHTML: "{{item.HocSinhID}}" },
                                {
                                    "el": "t-button",
                                    "attr": {
                                        ":title": "item.HocSinhID + ' - ' + item.HoTen",
                                        ":url": "'/report-ket-qua-hoc-tap-thang-hoc-sinh?id=' + item.HocSinhID + '&lop_nxtid=' + vueData.ThangObj.Lop_NhanXetThangID",
                                        "icon": "mdi-arrow-right"
                                    }
                                }
                            ]
                        },
                        {
                            "el": "p",
                            "innerHTML": "SDB: <b>{{item.SoDanhBo}}</b>"
                        }
                    ]
                },
            ],
            "minWidth": 150,
            "width": 150,
        },
        {
            "key": "ho_ten",
            "el": "div",
            "title": "Họ tên",
            "minWidth": 240,
            "width": 240,
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
        vueData.ThangObj.Is_HienThiPhuHuynh && {
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
        vueData.ThangObj.Is_HienThiPhuHuynh && {
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
        vueData.ThangObj.Is_HienThiPhuHuynh && {
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
        !vueData.ThangObj.Is_HienThiPhuHuynh && {
            "key": "NhanXetCuoiNam",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NhanXetCuoiNam_HTML_' + item.HocSinhID",
                        "v-model": "item.NhanXetCuoiNam_HTML",
                        ":spellcheck": "false"
                    }
                }
            ],
            "title": "Nhận xét cuối năm",
            "value": "NhanXetCuoiNam",
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