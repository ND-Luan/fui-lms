function convertItems() {
    const headers = vueData.items.map(x => {
        return {
            key: x.MaNhomCotDiem,
            title: x.TenNhomCotDiem_VI,
            value: x.MaNhomCotDiem,
            el: "v-chip",
            align: "center",
            attr: {
                color: "success"
            },
            innerHTML: "<v-icon>mdi-check-circle</v-icon>"
        }
    })
    vueData.headers = [{
        "title": "Mẫu bảng điểm",
        "value": "TemplateBangDiemName"
    }, ...headers]
    const mergedData = vueData.items.reduce((acc, item) => {
        let existing = acc.find(x => x.TemplateBangDiemID === item.TemplateBangDiemID);
        if (!existing) {
            existing = { ...item };
            acc.push(existing);
        }
        existing[item.MaNhomCotDiem] = true;
        return acc;
    }, []);
    vueData.items = mergedData
}