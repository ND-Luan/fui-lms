function convert() {
    let headers = [
        {
            title: "Lớp",
            value: "TenLop"
        },
        {
            title: "Tháng",
            value: "Thang_HienThi"
        },
        {
            title: "Tình trạng",
            value: "TinhTrang",
            key: "TinhTrang",
            el: "v-select",
            attr: {
                "v-model": "item.TinhTrang",
                ":items": "vueData.DSTinhTrang",
                "item-title": "title",
                "item-value": "value",
                ":disabled": "!vueData.List_Lop_NhanXetThangID.includes(item.Lop_NhanXetThangID)"
            }
        }
    ]
    let DSNXTLop_ByCap = vueData.DSNXTLop_API.filter(x =>
        (vueData.CapID === 0 || x.CapID === vueData.CapID)
        //   &&  (vueData.Thang === null || x.Thang_HienThi === vueData.Thang)
    )
    if (vueData.Thang) {
        DSNXTLop_ByCap = DSNXTLop_ByCap.filter(x =>
            (vueData.Thang === 'Tất cả' || x.Thang_HienThi === vueData.Thang)
        )
    }
    const items = DSNXTLop_ByCap
    const DSTinhTrang = [
        { title: "Chưa lưu", value: 0 },
        { title: "Lưu tạm", value: 1 },
        { title: "Gửi tổ trưởng", value: 2 },
        { title: "Từ chối", value: 3 },
        { title: "Duyệt", value: 4 },
    ]
    const DSThang = ['Tất cả', ... new Set(vueData.DSNXTLop_API.map(x => x.Thang_HienThi))]
    vueData.DSTinhTrang = DSTinhTrang
    vueData.DSThang = DSThang
    vueData.headers = headers
    vueData.items = items
}
async function onUpdateStatus() {
    for (var Lop_NhanXetThangID of vueData.List_Lop_NhanXetThangID) {
        const item = vueData.items.find(x => x.Lop_NhanXetThangID === Lop_NhanXetThangID)
        const titleTinhTrang = vueData.DSTinhTrang.find(x => x.value === item.TinhTrang)?.title ?? ''
        ajaxCALLPromise("lms/NhanXetThang_Upd_TinhTrang", {
            TinhTrang: item.TinhTrang,
            Lop_NhanXetThangID,
            ReasonReject: ''
        }).then(() => {
            Vue.$toast.success(`Cập nhật lớp ${item.TenLop} - ${titleTinhTrang}`, { position: "top" })
        })
    }
}
vueData.onUpdateStatus = onUpdateStatus