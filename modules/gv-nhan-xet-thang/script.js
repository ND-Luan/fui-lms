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
    console.log('item', item)
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
        vueData.CapID === 1 && {
            "key": "NhanXetToan_HTML",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NhanXetToan_HTML' + item.HocSinhID",
                        "v-model": "item.NhanXetToan_HTML",
                        ":spellcheck": "false"
                    }
                },
                {
                    "el": "v-text-field",
                    "attr": {
                        class: "mt-2",
                        "v-model": "item.DiemToan",
                        "placeholder": "Nhập điểm...",
                        messages: "*Lưu ý: Thang điểm 10",
                        "variant": "filled",
                        ":solo": true,
                        ":clearable": false,
                        "suffix": "Điểm",
                        ":reverse": true
                    }
                }
            ],
            width: 280,
            "title": "Nhận xét môn Toán",
            "value": "NhanXetToan_HTML",
        },
        vueData.CapID === 1 && {
            "key": "NhanXetTiengViet_HTML",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NhanXetTiengViet_HTML' + item.HocSinhID",
                        "v-model": "item.NhanXetTiengViet_HTML",
                        ":spellcheck": "false"
                    }
                },
                {
                    "el": "v-text-field",
                    "attr": {
                        class: "mt-2",
                        "v-model": "item.DiemTiengViet",
                        "placeholder": "Nhập điểm...",
                        messages: "*Lưu ý: Thang điểm 10",
                        "variant": "filled",
                        ":solo": true,
                        ":clearable": false,
                        "suffix": "Điểm",
                        ":reverse": true
                    }
                }
            ],
            width: 280,
            "title": "Nhận xét môn Tiếng Việt",
            "value": "NhanXetTiengViet_HTML",
        },
        vueData.CapID === 1 && {
            "key": "NhanXetMonHocKhac_HTML",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NhanXetMonHocKhac_HTML' + item.HocSinhID",
                        "v-model": "item.NhanXetMonHocKhac_HTML",
                        ":spellcheck": "false",
                        ":clearable": false
                    }
                }
            ],
            width: 280,
            "title": "Nhận xét môn học khác",
            "value": "NhanXetMonHocKhac_HTML",
        },
        // vueData.ThangObj.Is_HienThiPhuHuynh && {
        //     "key": "NoiDungKienThuc",
        //     "el": "div",
        //     "align": "center",
        //     "innerHTML": [
        //         {
        //             "el": "uc-quill-editor",
        //             "attr": {
        //                 ":key": "'NoiDungKienThuc_HTML_' + item.HocSinhID",
        //                 "v-model": "item.NoiDungKienThuc_HTML",
        //                 ":spellcheck": "false"
        //             }
        //         }
        //     ], width: 280,
        //     "title": "Nội dung kiến thức",
        //     "value": "NoiDungKienThuc",
        // },
        vueData.ThangObj.Is_HienThiPhuHuynh && {
            "key": "HoatDongGiaoDucKhac_HTML",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'HoatDongGiaoDucKhac_HTML' + item.HocSinhID",
                        "v-model": "item.HoatDongGiaoDucKhac_HTML",
                        ":spellcheck": "false"
                    }
                }
            ], width: 280,
            "title": "Hoạt động giáo dục khác",
            "value": "HoatDongGiaoDucKhac_HTML",
        },
        vueData.ThangObj.Is_HienThiPhuHuynh && {
            "key": "PhamChatNangLuc_HTML",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'PhamChatNangLuc_HTML' + item.HocSinhID",
                        "v-model": "item.PhamChatNangLuc_HTML",
                        ":spellcheck": "false"
                    }
                }
            ], width: 280,
            "title": "Phẩm chất - Năng lực",
            "value": "PhamChatNangLuc_HTML",
        },
        !vueData.ThangObj.Is_HienThiPhuHuynh && {
            "key": "NhanXetCuoiNam",
            "el": "div",
            "align": "center",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NhanXetCuoiNam_HTML' + item.HocSinhID",
                        "v-model": "item.NhanXetCuoiNam_HTML",
                        ":spellcheck": "false"
                    }
                }
            ], width: 280,
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
const renderTextDSHocSinhDaLuu = () => {
    let count = 0
    for (var item of vueData.items) {
        if (item.NhanXetThangID > 0) count++
    }
    return count
}