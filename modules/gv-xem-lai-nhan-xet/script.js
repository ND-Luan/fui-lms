addEventListener('resize', () => {
    if (window.innerWidth < 1366) {
        vueData.isLowScreen = true
        renderHeaderTable()
    } else {
        vueData.isLowScreen = false
        renderHeaderTable()
    }
})
function processDataBeforePostAPI() {
    vueData.JSON_NhanXetThang = []
    const newData = []
    for (var item of vueData.items) {
        newData.push({
            ...item,
            LopID: vueData.LopID,
            Lop_NhanXetThangID: vueData.ThangObj.Lop_NhanXetThangID,
            Is_Reject: false,
            DiemToan: item.DiemToan ?? 0,
            DiemTiengViet: item.DiemTiengViet ?? 0
        })
    }
    vueData.JSON_NhanXetThang = newData
    console.log(' vueData.JSON_NhanXetThang', vueData.JSON_NhanXetThang)
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
            "key": "NhanXet",
            "el": "div",
            "innerHTML": [
                {
                    "el": "uc-quill-editor",
                    "attr": {
                        ":key": "'RenderNhanXet' + item.HocSinhID",
                        "v-model": "item.RenderNhanXet",
                        ":spellcheck": "false",
                        "class": "custom-height-uc-quill-editor"
                    }
                }
            ],
            "title": "Nhận xét",
            "value": "NhanXet",
            "attr": {
                style: "padding: 10px 0;",
                "class": "d-flex flex-column ga-2"
            }
        })
    }
    vueData.headers = columns
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
        x.RenderNhanXet = ((x.NoiDungKienThuc_HTML ? ('<b>Học tập: </b>' + x.NoiDungKienThuc_HTML.toString() + '<br/>') : '<b>Học tập: - </b><br/>') + (x.NoiDungNangLuc_HTML ? ('<b>Nền nếp: </b>' + x.NoiDungNangLuc_HTML.toString() + '<br/>') : '<b>Nền nếp: - </b><br/>') + (x.NoiDungHoatDongKhac_HTML ? ('<b>Thông báo: </b>' + x.NoiDungHoatDongKhac_HTML.toString() + '<br/>') : '<b>Thông báo: - </b><br/>'))
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