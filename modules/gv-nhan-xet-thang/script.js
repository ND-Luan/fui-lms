addEventListener('resize', () => {
    if (window.innerWidth < 1366) {
        vueData.isLowScreen = true
        renderHeaderTable()
    } else {
        vueData.isLowScreen = false
        renderHeaderTable()
    }
})
vueData.renderTextLop = renderTextLop
function renderTextLop(item) {
    let string = item.TenLop
    if (item.GVCN === vueData.user.UserID) string += ' (Bạn đang giáo viên chủ nhiệm của lớp)'
    return string
}
function processDataBeforePostAPI() {
    vueData.JSON_NhanXetThang = []
    const newData = []
    for (var item of vueData.items) {
        newData.push({
            ...item,
            LopID: vueData.LopID,
            Lop_NhanXetThangID: vueData.ThangObj.Lop_NhanXetThangID,
            Is_Reject: false,
            DiemToan: item.DiemToan,
            DiemTiengViet: item.DiemTiengViet,
            PhoiHopCMHS: item.PhoiHopCMHS,
            NhanXetGVCN_VePhuHuynh_HTML: item.NhanXetGVCN_VePhuHuynh_HTML,
            NhanXetGVCN_VeHocSinh_HTML: item.NhanXetGVCN_VeHocSinh_HTML,
            PhanLoai_TuyenThang: item.PhanLoai_TuyenThang,
            Flyers: item.Flyers,
            DiemTA: item.DiemTA,
            DKHocTiep: item.DKHocTiep ?? false,
            DeXuat_NDCamKet: item.DeXuat_NDCamKet,
        })
    }
    vueData.JSON_NhanXetThang = newData
}
function onLuuTamByHocSinhID(item) {
    console.log(item)
    item.DiemToan = item.DiemToan //?? 0
    item.DiemTiengViet = item.DiemTiengViet //?? 0
    item.Flyers = item.Flyers //?? 0
    item.DiemTA = item.DiemTA //?? 0
    item.DKHocTiep = item.DKHocTiep ?? false
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
    vueData.headers = []
    let columns = [
        {
            "key": "hocSinh",
            "el": "uc-info-student",
            "title": "Học sinh",
            "minWidth": 240,
            "width": 240,
            "align": "center",
            "attr": {
                "v-on:click": ""
            }
        }
    ]
    if (!vueData.ThangObj?.Is_HienThiPhuHuynh) {
        const lop = vueData.DSLop.find(x => x.LopID === vueData.LopID)
        console.log(lop)
        const DSKhoi_CanLoai = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12]
        columns.push({
            "align": "center",
            "title": "",
            "value": "_",
            "key": "_",
            "el": "div",
            "attr": {
                "class": "d-flex ga-2 flex-column pa-2"
            },
            "innerHTML": [
                {
                    "el": "v-select",
                    "attr": {
                        "v-model": "item.PhoiHopCMHS",
                        "label": "Phối hợp CMHS",
                        ":items": ["Tốt", "Đạt", "Không đạt"],
                        "placeholder": "Chọn"
                    }
                },
                !DSKhoi_CanLoai.includes(lop?.KhoiID) &&
                {
                    "el": "v-select",
                    "attr": {
                        "v-model": "item.PhanLoai_TuyenThang",
                        ":items": ["Tuyển thẳng", "Tuyển thẳng có cam kết"],
                        "label": "Phân loại tuyển thẳng"
                    }
                },
                !DSKhoi_CanLoai.includes(lop?.KhoiID) &&
                {
                    "el": "v-text-field",
                    "attr": {
                        "v-model": "item.Flyers",
                        "label": "Flyers"
                    }
                },
                !DSKhoi_CanLoai.includes(lop?.KhoiID) &&
                {
                    "el": "v-text-field",
                    "attr": {
                        "v-model": "item.DiemTA",
                        "label": "Điểm Tiếng Anh"
                    }
                },
                !DSKhoi_CanLoai.includes(lop?.KhoiID) &&
                {
                    "el": "v-checkbox",
                    "attr": {
                        "v-model": "item.DKHocTiep",
                        "label": "Đăng ký học tiếp"
                    }
                },
                !DSKhoi_CanLoai.includes(lop?.KhoiID) &&
                {
                    "el": "v-textarea",
                    "attr": {
                        "v-model": "item.DeXuat_NDCamKet",
                        "label": "Đề xuất / ND cam kết",
                        "hide-details": false
                    }
                }
            ],
            "width": 250
        })
        columns.push({
            "key": "NhanXetCuoiNam_PH",
            "align": "center",
            "title": "Nhận xét về Phụ huynh",
            "value": "VePhuHuynh",
            "el": "div",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NhanXetGVCN_VePhuHuynh_HTML' + item.HocSinhID",
                        "v-model": "item.NhanXetGVCN_VePhuHuynh_HTML",
                        ":spellcheck": "false"
                    }
                }
            ],
            "attr": {
                "style": "padding: 10px"
            },
        })
        columns.push({
            "key": "NhanXetCuoiNam_HS",
            "align": "center",
            "title": "Nhận xét về Học sinh",
            "value": "VeHocSinh",
            "el": "div",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'NhanXetGVCN_VeHocSinh_HTML' + item.HocSinhID",
                        "v-model": "item.NhanXetGVCN_VeHocSinh_HTML",
                        ":spellcheck": "false"
                    }
                }
            ],
            "attr": {
                "style": "padding: 10px"
            },
        })
        // columns.push({
        //     "key": "NhanXetCuoiNam",
        //     "el": "div",
        //     "align": "center",
        //     "innerHTML": [
        //         {
        //             "el": "uc-quill-editor",
        //             "attr": {
        //                 ":key": "'NhanXetCuoiNam_HTML' + item.HocSinhID",
        //                 "v-model": "item.NhanXetCuoiNam_HTML",
        //                 ":spellcheck": "false"
        //             }
        //         }
        //     ],
        //     "title": "Nhận xét cuối năm",
        //     "value": "NhanXetCuoiNam",
        // })
    }
    if ((vueData.CapID === 1) && vueData.ThangObj?.Is_HienThiPhuHuynh) {
        if (vueData.isLowScreen) {
            columns.push({
                "key": "Nhanxet",
                "el": "div",
                "align": "center",
                "innerHTML": [
                    {
                        el: "v-row",
                        innerHTML: [
                            {
                                el: "v-col",
                                attr: {
                                    class: "d-flex flex-column ga-2",
                                    ":cols": 6
                                },
                                innerHTML: [
                                    {
                                        el: "b",
                                        attr: {
                                            class: "text-left"
                                        },
                                        "innerHTML": "Nhận xét môn Toán"
                                    },
                                    {
                                        "el": "uc-quill-editor",
                                        "attr": {
                                            ":key": "'NhanXetToan_HTML' + item.HocSinhID",
                                            "v-model": "item.NhanXetToan_HTML",
                                            ":spellcheck": "false",
                                            ":readOnly": true,
                                            style: "height: 100px;"
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
                                ]
                            },
                            {
                                el: "v-col",
                                attr: {
                                    class: "d-flex flex-column ga-2",
                                    ":cols": 6
                                },
                                innerHTML: [
                                    {
                                        el: "b",
                                        attr: {
                                            class: "text-left"
                                        },
                                        "innerHTML": "Nhận xét môn Tiếng Việt"
                                    },
                                    {
                                        "el": "uc-quill-editor",
                                        "attr": {
                                            ":key": "'NhanXetTiengViet_HTML' + item.HocSinhID",
                                            "v-model": "item.NhanXetTiengViet_HTML",
                                            ":spellcheck": "false",
                                            ":readOnly": true,
                                            style: "height: 100px;"
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
                                ]
                            },
                            {
                                el: "v-col",
                                attr: {
                                    class: "d-flex flex-column ga-2",
                                    ":cols": 6
                                },
                                innerHTML: [
                                    {
                                        el: "b",
                                        attr: {
                                            class: "text-left"
                                        },
                                        "innerHTML": "Nhận xét môn học khác"
                                    },
                                    {
                                        "el": "uc-quill-editor",
                                        "attr": {
                                            ":key": "'NhanXetMonHocKhac_HTML' + item.HocSinhID",
                                            "v-model": "item.NhanXetMonHocKhac_HTML",
                                            ":spellcheck": "false",
                                            ":clearable": false,
                                            ":readOnly": true,
                                            style: "height: 100px;"
                                        }
                                    }
                                ]
                            },
                            {
                                el: "v-col",
                                attr: {
                                    class: "d-flex flex-column ga-2",
                                    ":cols": 6
                                },
                                innerHTML: [
                                    {
                                        el: "b",
                                        attr: {
                                            class: "text-left"
                                        },
                                        "innerHTML": "Hoạt đông giáo dục khác"
                                    },
                                    {
                                        "el": "uc-quill-editor",
                                        "attr": {
                                            ":key": "'HoatDongGiaoDucKhac_HTML' + item.HocSinhID",
                                            "v-model": "item.HoatDongGiaoDucKhac_HTML",
                                            ":spellcheck": "false",
                                            ":readOnly": true,
                                            style: "height: 100px;"
                                        }
                                    }
                                ]
                            },
                            {
                                el: "v-col",
                                attr: {
                                    class: "d-flex flex-column ga-2",
                                    ":cols": 6
                                },
                                innerHTML: [
                                    {
                                        el: "b",
                                        attr: {
                                            class: "text-left"
                                        },
                                        "innerHTML": "Phẩm chất - Năng lực"
                                    },
                                    {
                                        "el": "uc-quill-editor",
                                        "attr": {
                                            ":key": "'PhamChatNangLuc_HTML' + item.HocSinhID",
                                            "v-model": "item.PhamChatNangLuc_HTML",
                                            ":spellcheck": "false",
                                            ":readOnly": true,
                                            style: "height: 100px;"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                "title": "Nhận xét",
                "value": "NhanXet",
                "attr": {
                    style: "padding:10px;witdh: 300px;",
                    class: "d-flex flex-column ga-2"
                }
            })
        } else {
            columns.push({
                "key": "NhanXetToan_HTML",
                "el": "div",
                "align": "center",
                "innerHTML": [
                    {
                        "el": "uc-quill-editor",
                        "attr": {
                            ":key": "'NhanXetToan_HTML' + item.HocSinhID",
                            "v-model": "item.NhanXetToan_HTML",
                            ":spellcheck": "false",
                            ":readOnly": true
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
                "attr": {
                    style: "padding:10px;"
                }
            })
            columns.push({
                "key": "NhanXetTiengViet_HTML",
                "el": "div",
                "align": "center",
                "innerHTML": [
                    {
                        "el": "uc-quill-editor",
                        "attr": {
                            ":key": "'NhanXetTiengViet_HTML' + item.HocSinhID",
                            "v-model": "item.NhanXetTiengViet_HTML",
                            ":spellcheck": "false",
                            ":readOnly": true
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
                "attr": {
                    style: "padding:10px;"
                }
            })
            columns.push({
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
                            ":clearable": false,
                            ":readOnly": true
                        }
                    },
                    {
                        "el": "v-text-field",
                        "attr": {
                            class: "mt-2",
                            style: "visibility: hidden;",
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
                "title": "Nhận xét môn học khác",
                "value": "NhanXetMonHocKhac_HTML",
                "attr": {
                    style: "padding:10px;"
                }
            })
            columns.push({
                "key": "HoatDongGiaoDucKhac_HTML",
                "el": "div",
                "align": "center",
                "innerHTML": [
                    {
                        "el": "uc-quill-editor",
                        "attr": {
                            ":key": "'HoatDongGiaoDucKhac_HTML' + item.HocSinhID",
                            "v-model": "item.HoatDongGiaoDucKhac_HTML",
                            ":spellcheck": "false",
                            ":readOnly": true
                        }
                    },
                    {
                        "el": "v-text-field",
                        "attr": {
                            class: "mt-2",
                            style: "visibility: hidden;",
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
                "title": "Hoạt động giáo dục khác",
                "value": "HoatDongGiaoDucKhac_HTML",
                "attr": {
                    style: "padding:10px;"
                }
            })
            columns.push({
                "key": "PhamChatNangLuc_HTML",
                "el": "div",
                "align": "center",
                "innerHTML": [
                    {
                        "el": "uc-quill-editor",
                        "attr": {
                            ":key": "'PhamChatNangLuc_HTML' + item.HocSinhID",
                            "v-model": "item.PhamChatNangLuc_HTML",
                            ":spellcheck": "false",
                            ":readOnly": true
                        }
                    },
                    {
                        "el": "v-text-field",
                        "attr": {
                            class: "mt-2",
                            style: "visibility: hidden;",
                            "placeholder": "Nhập điểm...",
                            messages: "*Lưu ý: Thang điểm 10",
                            "variant": "filled",
                            ":solo": true,
                            ":clearable": false,
                            "suffix": "Điểm",
                            ":reverse": true
                        }
                    }
                ], width: 280,
                "title": "Phẩm chất - Năng lực",
                "value": "PhamChatNangLuc_HTML",
                "attr": {
                    style: "padding:10px;"
                }
            })
        }
    }
    if ((vueData.CapID == 2 || vueData.CapID === 3) && vueData.ThangObj?.Is_HienThiPhuHuynh) {
        columns.push({
            key: "NgayNghi",
            title: "Ngày nghỉ",
            value: "NgayNghi",
            align: "center",
            width: 200,
            el: "div",
            sortable: false,
            innerHTML: [
                {
                    "el": "div",
                    attr: {
                        class: "d-flex ga-2 flex-column"
                    },
                    innerHTML: [
                        {
                            el: "div",
                            attr: {
                                class: "d-flex justify-space-between"
                            },
                            innerHTML: [{
                                "el": "p",
                                "attr": {
                                    class: "text-left font-weight-medium",
                                    "v-if": "item.NgayNghi?.TongSoTiet > 0",
                                },
                                innerHTML: "Tổng số tiết: {{item.NgayNghi?.TongSoTiet}}"
                            },
                            {
                                el: "t-button",
                                attr: {
                                    "v-if": "item.NgayNghi?.TongSoTiet > 0",
                                    "icon": "mdi-eye",
                                    ":title": "'Xem báo nghỉ chi tiết học sinh - ' + item.HoTen",
                                    ":url": "'/gv-xem-vang-tre-nghi-phep?hocsinhid='+item.HocSinhID+'&lopid='+item.LopID+'&ngaybatdau='+item.firstDay+'&ngayketthuc='+item.lastDay"
                                }
                            },]
                        },
                        {
                            "el": "v-chip",
                            attr: {
                                "v-for": "mon in item.NgayNghi?.MonVang",
                                "color": "orange",
                                "size": "small",
                                style: "width: fit-content;"
                            },
                            innerHTML: "{{mon.TenMonHoc}}"
                        }
                    ]
                },
                {
                    "el": "div",
                    attr: {
                        "v-if": "item.LoaiViPham_Group?.length > 0"
                    },
                    innerHTML: [
                        {
                            el: "v-divider",
                            attr: {
                                class: "mt-2"
                            }
                        },
                        {
                            "el": "p",
                            attr: {
                                class: "text-left font-weight-medium"
                            },
                            innerHTML: "Loại vi phạm"
                        },
                        {
                            el: "div",
                            attr: {
                                "v-for": "lvp in item.LoaiViPham_Group"
                            },
                            innerHTML: [
                                {
                                    el: "div",
                                    attr: {
                                        "class": "text-left text-body-2"
                                    },
                                    innerHTML: "• {{lvp.TenViPham}}"
                                },
                                {
                                    el: "div",
                                    attr: {
                                        "v-for": "ngayVP in lvp.Ngay",
                                        "class": "text-body-2 text-left"
                                    },
                                    innerHTML: [
                                        {
                                            el: "p",
                                            innerHTML: "Ngày: {{ngayVP.Ngay}}"
                                        },
                                        {
                                            "el": "div",
                                            attr: {
                                                "class": "ml-2",
                                                "v-for": "ngay in ngayVP.DSNgay"
                                            },
                                            innerHTML: [
                                                {
                                                    el: "p",
                                                    innerHTML: "{{ngay.Buoi}}"
                                                },
                                                {
                                                    el: "v-chip",
                                                    attr: {
                                                        "v-for": "buoi in ngay.DS",
                                                        class: "mt-1",
                                                        size: "small",
                                                        color: "orange"
                                                    },
                                                    innerHTML: "Tiết: {{buoi.Tiet}} - {{buoi.TenMonHoc}}"
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        if (vueData.isLowScreen) {
            columns.push({
                "key": "NoiDungHoatDongKhacMobile",
                "el": "div",
                "align": "center",
                "innerHTML": [
                    {
                        el: "div",
                        attr: {
                            class: "d-flex flex-column ga-2"
                        },
                        innerHTML: [
                            {
                                el: "b",
                                attr: {
                                    class: "text-left"
                                },
                                "innerHTML": "Về học tập"
                            },
                            {
                                "el": "uc-quill-editor",
                                "attr": {
                                    ":key": "'NoiDungKienThuc_HTML_' + item.HocSinhID",
                                    "v-model": "item.NoiDungKienThuc_HTML",
                                    ":spellcheck": "false",
                                    style: "height: 100px;"
                                }
                            }
                        ]
                    },
                    {
                        el: "div",
                        attr: {
                            class: "d-flex flex-column ga-2"
                        },
                        innerHTML: [
                            {
                                el: "b",
                                attr: {
                                    class: "text-left"
                                },
                                "innerHTML": "Về nền nếp"
                            },
                            {
                                "el": "uc-quill-editor",
                                "attr": {
                                    ":key": "'NoiDungNangLuc_HTML_' + item.HocSinhID",
                                    "v-model": "item.NoiDungNangLuc_HTML",
                                    ":spellcheck": "false",
                                    style: "height: 100px;"
                                }
                            }
                        ]
                    },
                    {
                        el: "div",
                        attr: {
                            class: "d-flex flex-column ga-2"
                        },
                        innerHTML: [
                            {
                                el: "b",
                                attr: {
                                    class: "text-left"
                                },
                                "innerHTML": "Mong muốn phối hợp"
                            },
                            {
                                "el": "uc-quill-editor",
                                "attr": {
                                    ":key": "'NoiDungHoatDongKhac_HTML_' + item.HocSinhID",
                                    "v-model": "item.NoiDungHoatDongKhac_HTML",
                                    ":spellcheck": "false",
                                    style: "height: 100px;"
                                }
                            }
                        ]
                    },
                ],
                "title": "Nhận xét",
                "value": "NoiDungHoatDongKhacMobile",
                "attr": {
                    style: "padding:10px;witdh: 300px;",
                    class: "d-flex flex-column ga-2"
                }
            })
        } else {
            columns.push(
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
                    "title": "Về học tập",
                    "value": "NoiDungKienThuc",
                    "attr": {
                        style: "padding:10px;",
                    }
                }
            )
            columns.push({
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
                "title": "Về nền nếp",
                "value": "NoiDungNangLuc",
                "attr": {
                    style: "padding:10px;"
                }
            })
            columns.push({
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
                "title": "Mong muốn phối hợp",
                "value": "NoiDungHoatDongKhac",
                "attr": {
                    style: "padding:10px;"
                }
            })
        }
    }
    if (!vueData.TinhTrang) {
        columns.push({
            "key": "v_btn",
            "el": "v-btn",
            "attr": {
                "color": "primary",
                "variant": "tonal",
                "v-on:click": "() => vueData.onLuuTamByHocSinhID(item)"
            },
            "innerHTML": "Lưu tạm",
            "align": "center",
            "width": 150,
        })
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
function getFirstAndLastDay(year, month) {
    let firstDay = dayjs(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
    let lastDay = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
    return { firstDay, lastDay };
}
async function convertItems() {
    vueData.items = vueData.items.map(x => {
        const existDSTreVang = vueData.DSChuyenCan_TreVang?.find(n => n.HocSinhID === x.HocSinhID)
        x.NgayNghi = {
            MonVang: existDSTreVang ? JSON.parse(existDSTreVang.MonVang) : [],
            TongSoTiet: existDSTreVang?.TongSoTiet || null
        }
        x.firstDay = vueData.firstDay;
        x.lastDay = vueData.lastDay;
        x.LopID = vueData.LopID;
        return x
    })
    vueData.DSTongHop_LoaiViPham = vueData.DSTongHop_LoaiViPham?.filter(x => x.SoLuong > 0)
    const promise = (LoaiViPham) => {
        return new Promise(resolve => {
            ajaxCALL('quansinh/GVCN_SoDauBai_TongHopTheoLoaiViPham_ChiTiet',
                {
                    TuNgay: vueData.firstDay,
                    DenNgay: vueData.lastDay,
                    LopHocID: vueData.LopID,
                    LoaiViPham: LoaiViPham
                }, res => {
                    resolve(res.data)
                })
        })
    }
    // Dùng Promise.all để đợi tất cả các request hoàn thành
    const DSHocSinh_ViPham = await Promise.all(
        vueData.DSTongHop_LoaiViPham.map(async item => {
            const data = await promise(item.LoaiViPham)
            return { ...item, data }
        })
    )
    const List_HocSinh_ViPham = []
    for (const viPham of DSHocSinh_ViPham) {
        for (const hocSinh of viPham.data) {
            List_HocSinh_ViPham.push({ ...hocSinh, ...viPham })
        }
    }
    vueData.List_HocSinh_ViPham = List_HocSinh_ViPham.map(x => {
        return {
            STT: x.STT,
            HocSinhID: x.HocSinhID,
            Ho: x.Ho,
            Ten: x.Ten,
            Thu: x.Thu,
            Ngay: x.Ngay,
            Buoi: x.Buoi,
            Tiet: x.Tiet,
            TenMonHoc: x.TenMonHoc,
            GiaoVien: x.GiaoVien,
            GhiChu: x.GhiChu,
            LoaiViPham: x.LoaiViPham,
            TenViPham: x.TenViPham,
            SoLuong: x.SoLuong,
        }
    })
    vueData.items = vueData.items.map(x => {
        x.LoaiViPham = vueData.List_HocSinh_ViPham.filter(n => n.HocSinhID === x.HocSinhID)
        x.LoaiViPham_Group = transformData(x.LoaiViPham)
        return x
    })
}
function transformData(data) {
    const grouped = {};
    data.forEach(item => {
        const { LoaiViPham, Ngay, TenViPham, HocSinhID, Ho, Ten, Thu, Buoi, Tiet, TenMonHoc, GiaoVien, GhiChu, SoLuong } = item;
        // Tạo nhóm theo LoaiViPham
        if (!grouped[LoaiViPham]) {
            grouped[LoaiViPham] = {
                TenViPham: TenViPham,
                LoaiViPham: LoaiViPham,
                Ngay: []
            };
        }
        // Kiểm tra nếu ngày đã tồn tại trong nhóm, nếu không thì thêm mới
        const existingDate = grouped[LoaiViPham].Ngay.find(d => d.Ngay === Ngay);
        if (!existingDate) {
            grouped[LoaiViPham].Ngay.push({
                Ngay,
                DSNgay: []
            });
        }
        // Thêm thông tin học sinh vào mảng DSNgay của ngày tương ứng
        const dateGroup = grouped[LoaiViPham].Ngay.find(d => d.Ngay === Ngay);
        // Kiểm tra nếu Buổi đã tồn tại trong DSNgay, nếu không thì thêm mới
        const existingSession = dateGroup.DSNgay.find(s => s.Buoi === Buoi);
        if (!existingSession) {
            dateGroup.DSNgay.push({
                Buoi,
                DS: []  // Mảng chứa danh sách học sinh cho buổi này
            });
        }
        // Thêm thông tin học sinh vào DS của Buổi tương ứng
        const sessionGroup = dateGroup.DSNgay.find(s => s.Buoi === Buoi);
        sessionGroup.DS.push({
            STT: 1,
            HocSinhID,
            Ho,
            Ten,
            Thu,
            Ngay,
            Buoi,
            Tiet,
            TenMonHoc,
            GiaoVien,
            GhiChu,
            LoaiViPham,
            TenViPham,
            SoLuong
        });
    });
    // Chuyển kết quả từ object về array
    return Object.values(grouped);
}