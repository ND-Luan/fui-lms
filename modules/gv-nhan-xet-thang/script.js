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
    vueData.headers = []
    let columns = [
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
        }
    ]
    if (!vueData.ThangObj.Is_HienThiPhuHuynh) {
        columns.push({
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
            ],
            "title": "Nhận xét cuối năm",
            "value": "NhanXetCuoiNam",
        })
    }
    if ((vueData.CapID === 1) && vueData.ThangObj.Is_HienThiPhuHuynh) {
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
        })
    }
    if ((vueData.CapID == 2 || vueData.CapID === 3) && vueData.ThangObj.Is_HienThiPhuHuynh) {
        columns.push({
            key: "NgayNghi",
            title: "Ngày nghỉ",
            value: "NgayNghi",
            align: "center",
            width: 200,
            el: "div",
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
                "title": "Nội dung kiến thức",
                "value": "NoiDungKienThuc",
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
            "title": "Nội dung năng lực",
            "value": "NoiDungNangLuc",
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
            "title": "Nội dung hoạt động khác",
            "value": "NoiDungHoatDongKhac",
        })
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
            "innerHTML": "Lưu tạm"
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
        const existDSTreVang = vueData.DSChuyenCan_TreVang.find(n => n.HocSinhID === x.HocSinhID)
        x.NgayNghi = {
            MonVang: existDSTreVang ? JSON.parse(existDSTreVang.MonVang) : [],
            TongSoTiet: existDSTreVang?.TongSoTiet || null
        }
        x.firstDay = vueData.firstDay;
        x.lastDay = vueData.lastDay;
        x.LopID = vueData.LopID;
        return x
    })
    vueData.DSTongHop_LoaiViPham = vueData.DSTongHop_LoaiViPham.filter(x => x.SoLuong > 0)
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