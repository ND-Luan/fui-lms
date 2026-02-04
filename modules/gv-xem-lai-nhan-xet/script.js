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
                "style": "padding: 10px; max-width: 250px;"
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
                "style": "padding: 10px; max-width: 250px;"
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
                                    ":cols": 4
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
                                    ":cols": 4
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
                                    ":cols": 4
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
                                    ":cols": 4
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
                                    ":cols": 4
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
                    style: "padding:10px; max-witdh: 250px;",
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
                    style: "padding:10px; max-width: 250px"
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
                    style: "padding:10px; max-width:250px"
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
                    style: "padding:10px; max-width:250px"
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
                    style: "padding:10px; max-width:250px"
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
                ],
                "title": "Phẩm chất - Năng lực",
                "value": "PhamChatNangLuc_HTML",
                "attr": {
                    style: "padding:10px; max-width: 250px"
                },
                width: 280,
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
    function convertNewLineToP(text) {
        if (!text) return '';
        return text
            .split(/\n+/)
            .map(line => `<p>${line}</p>`)
            .join('');
    }
    vueData.items = vueData.items.map(x => {
        const existDSTreVang = vueData.DSChuyenCan_TreVang?.find(n => n.HocSinhID === x.HocSinhID)
        x.NgayNghi = {
            MonVang: existDSTreVang ? JSON.parse(existDSTreVang.MonVang) : [],
            TongSoTiet: existDSTreVang?.TongSoTiet || null
        }
        x.firstDay = vueData.firstDay;
        x.lastDay = vueData.lastDay;
        x.LopID = vueData.LopID;
        x.RenderNhanXet = (
            (x.NoiDungKienThuc_HTML ? ('<b>Học tập: </b>' + convertNewLineToP(x.NoiDungKienThuc_HTML) + '<br/>') : '<b>Học tập: - </b><br/>')
            + (x.NoiDungNangLuc_HTML ? ('<b>Nền nếp: </b>' + convertNewLineToP(x.NoiDungNangLuc_HTML) + '<br/>') : '<b>Nền nếp: - </b><br/>')
            + (x.NoiDungHoatDongKhac_HTML ? ('<b>Mong muốn phối hợp: </b>' + convertNewLineToP(x.NoiDungHoatDongKhac_HTML) + '<br/>') : '<b>Mong muốn phối hợp: - </b><br/>'))
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
async function onExport() {
    console.log('export...')
    const logoUrl = window.location.origin + '/_cdn/lhbs-lms/logo_lhbs_2.jpg';
    const logoBase64 = await getBase64FromUrl(logoUrl)
    const content = []
    const lopItem = vueData.DSLop.find(x => x.LopID === vueData.LopID)
    const PAGE_WIDTH = 595.28
    const PAGE_MARGIN = 40 * 2
    const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN // ≈ 515px
    function percentWidth(percent) {
        return CONTENT_WIDTH * (percent / 100)
    }
    for (var item of vueData.items) {
        console.log(item.HoTen, item.SoSao_Toan, item.SoSao_TiengViet)
        const IMG = {
            image: 'logo',
            width: 64,
            height: 64,
        }
        const PROFILE = {
            text: [
                'Học sinh: ',
                {
                    text: item.HoTen + '\t\t\t',
                    bold: true,
                    margin: [0, 0, 20, 0]
                },
                'Lớp: ',
                {
                    text: lopItem?.TenLop,
                    bold: true
                }
            ],
            alignment: "center",
            fontSize: 14,
            margin: [0, 20, 0, 0]
        }
        const HEADER = {
            alignment: "center",
            columns: [IMG, PROFILE]
        }
        const TITLE = {
            text: [
                "THÔNG TIN VỀ HỌC TẬP VÀ RÈN LUYỆN \n",
                {
                    text: 'THÁNG ' + vueData.ThangObj?.Thang
                }
            ],
            bold: true,
            fontSize: 20,
            alignment: "center",
            margin: [0, 10, 0, 10]
        }
        const pageBreak = { text: '', fontSize: 14, bold: true, pageBreak: 'before', margin: [0, 0, 0, 8] }
        const margins = { text: '', fontSize: 14, bold: true, margin: [0, 0, 0, 12] }
        content.push(HEADER)
        content.push(TITLE)
        const SIGNATURE = {
            table: {
                widths: ['*', 150],
                body: [
                    ['', { text: 'Giáo viên chủ nhiệm', alignment: "center" }],
                    ['', { text: lopItem.Ten_GVCN, bold: true, alignment: "center" }]
                ]
            },
            layout: {
                defaultBorder: false,
            }
        }
        if (vueData.CapID === 1) {
            const TITLE_SUBJECT_TOAN = [{
                text: "Môn Toán",
                border: [true, true, true, true],
                bold: true
            }]
            const TITLE_SUBJECT_TIENG_VIET = [{
                text: "Môn Tiếng Việt",
                border: [true, true, true, true],
                bold: true
            }]
            const TITLE_SUBJECT_KHAC = [{
                text: "Môn học khác",
                border: [true, true, true, true],
                bold: true
            }]
            const TITLE_HD_GD_KHAC = [{
                text: "Hoạt động giáo dục khác",
                border: [true, true, true, true],
                bold: true
            }]
            const TITLE_PC_NL = [{
                text: "Phẩm chất - Năng lực",
                border: [true, true, true, true],
                bold: true
            }]
            const TITLE_EMPTY = {
                text: "",
                border: [false, false, false, false]
            }
            const CONTENT_SUBJECT_TOAN = [{
                text: item.NhanXetToan_HTML,
                alignment: 'justify',
                border: [true, false, item.DiemToan === 0 || item.DiemToan === null ? true : true, true]
            }]
            const CONTENT_SUBJECT_TIENG_VIET = [{
                text: item.NhanXetTiengViet_HTML,
                alignment: 'justify',
                border: [true, false, item.DiemTiengViet === 0 || item.DiemTiengViet === null ? true : true, true]
            }]
            const CONTENT_SUBJECT_MON_HOC_KHAC = [{
                text: item.NhanXetMonHocKhac_HTML,
                alignment: 'justify',
                border: [true, false, true, true]
            }]
            const CONTENT_SUBJECT_HD_GD_KHAC = [{
                text: item.HoatDongGiaoDucKhac_HTML,
                alignment: 'justify',
                border: [true, false, true, true]
            }]
            const CONTENT_SUBJECT_PC_NL = [{
                text: item.PhamChatNangLuc_HTML,
                border: [true, false, true, true]
            }]
            const STAR_SUBJECT_TOAN = {
                text: [
                    'Sản phẩm\n học tập \n\n',
                    {
                        text: item.SoSao_Toan,
                    }
                ], alignment: "center",
                border: [false, true, true, true]
            }
            const STAR_SUBJECT_TIENG_VIET = {
                text: [
                    'Sản phẩm\n học tập \n\n',
                    {
                        text: item.SoSao_TiengViet,
                    }
                ], alignment: "center",
                border: [false, true, true, true]
            }
            const CONTENT_WIDTH = 515 // A4 - margin
            let toan_widths =
                Number(item.DiemToan ?? 0) > 0
                    ? [CONTENT_WIDTH * 0.8, CONTENT_WIDTH * 0.2]
                    : ['*']
            let tieng_viet_widths =
                Number(item.DiemTiengViet ?? 0) > 0
                    ? [CONTENT_WIDTH * 0.8, CONTENT_WIDTH * 0.2]
                    : ['*']
            // if (item.DiemToan > 0 || item.DiemToan !== null) {
            //     TITLE_SUBJECT_TOAN.push(TITLE_EMPTY)
            //     CONTENT_SUBJECT_TOAN.push(STAR_SUBJECT_TOAN)
            // }
            // if (item.DiemTiengViet > 0 || item.DiemTiengViet !== null) {
            //     TITLE_SUBJECT_TIENG_VIET.push(TITLE_EMPTY)
            //     CONTENT_SUBJECT_TIENG_VIET.push(STAR_SUBJECT_TIENG_VIET)
            // }
            // TOÁN
            if (Number(item.DiemToan ?? 0) > 0) {
                TITLE_SUBJECT_TOAN.push(TITLE_EMPTY);
                CONTENT_SUBJECT_TOAN.push(STAR_SUBJECT_TOAN);
            }
            // TIẾNG VIỆT
            if (Number(item.DiemTiengViet ?? 0) > 0) {
                TITLE_SUBJECT_TIENG_VIET.push(TITLE_EMPTY);
                CONTENT_SUBJECT_TIENG_VIET.push(STAR_SUBJECT_TIENG_VIET);
            }
            const TABLE_CONTENT_TOAN = {
                table: {
                    widths: toan_widths,
                    body: [
                        TITLE_SUBJECT_TOAN,
                        CONTENT_SUBJECT_TOAN
                    ]
                },
                layout: {
                    defaultBorder: false,
                }
            }
            const TABLE_CONTENT_TIENG_VIET = {
                table: {
                    widths: tieng_viet_widths,
                    body: [
                        TITLE_SUBJECT_TIENG_VIET,
                        CONTENT_SUBJECT_TIENG_VIET
                    ]
                },
                layout: {
                    defaultBorder: false,
                }
            }
            const TABLE_CONTENT_MON_HOC_KHAC = {
                table: {
                    widths: ['*'],
                    body: [
                        TITLE_SUBJECT_KHAC,
                        CONTENT_SUBJECT_MON_HOC_KHAC
                    ]
                },
                layout: {
                    defaultBorder: false,
                }
            }
            const TABLE_CONTENT_HD_GD_KHAC = {
                table: {
                    widths: ['*'],
                    body: [
                        TITLE_HD_GD_KHAC,
                        CONTENT_SUBJECT_HD_GD_KHAC
                    ]
                },
                layout: {
                    defaultBorder: false,
                }
            }
            const TABLE_CONTENT_PC_NL = {
                table: {
                    widths: ['*'],
                    body: [
                        TITLE_PC_NL,
                        CONTENT_SUBJECT_PC_NL
                    ]
                },
                layout: {
                    defaultBorder: false,
                }
            }
            content.push(TABLE_CONTENT_TOAN)
            content.push(margins)
            content.push(TABLE_CONTENT_TIENG_VIET)
            content.push(margins)
            content.push(TABLE_CONTENT_MON_HOC_KHAC)
            content.push(margins)
            content.push(TABLE_CONTENT_HD_GD_KHAC)
            content.push(margins)
            content.push(TABLE_CONTENT_PC_NL)
            content.push(margins)
            content.push(SIGNATURE)
            content.push(pageBreak)
        } else if (vueData.CapID === 2 || vueData.CapID == 3) {
            const TABLE_CONTENT_HOCTAP = {
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: "Học tập", bold: true }],
                        [item.NoiDungKienThuc_HTML]
                    ]
                },
            }
            const TABLE_CONTENT_NENEP = {
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: "Nền nếp", bold: true }],
                        [item.NoiDungNangLuc_HTML]
                    ]
                },
            }
            const TABLE_CONTENT_THONGBAO = {
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: "Mong muốn phối hợp", bold: true }],
                        [item.NoiDungHoatDongKhac_HTML]
                    ]
                },
            }
            content.push(TABLE_CONTENT_HOCTAP)
            content.push(margins)
            content.push(TABLE_CONTENT_NENEP)
            content.push(margins)
            content.push(TABLE_CONTENT_THONGBAO)
            content.push(SIGNATURE)
            content.push(pageBreak)
        }
    }
    let val = {
        content: content.slice(0, -1)
    }
    var dd = {
        pageSize: "A4",
        content: val.content,
        images: {
            logo: logoBase64
        },
        styles: {},
        defaultStyle: {
            fontSize: 12
        }
    };
    const pdf = pdfMake.createPdf(dd);
    pdf.print()
}
async function getBase64FromUrl(url) {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
        };
        reader.onerror = reject;
    });
}