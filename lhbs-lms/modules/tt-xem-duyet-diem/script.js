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
    const newHeader = [{
        "title": "Mẫu bảng điểm",
        "value": "TemplateBangDiemName"
    }, ...headers].filter((item, index, self) =>
        index === self.findIndex(t => t.key === item.key)
    );
    console.log(newHeader)
    vueData.headers = newHeader
    const mergedData = vueData.items.reduce((acc, item) => {
        let existing = acc.find(x => x.TemplateBangDiemID === item.TemplateBangDiemID);
        if (!existing) {
            existing = { ...item };
            acc.push(existing);
        }
        existing[item.MaNhomCotDiem] = true;
        return acc;
    }, []);
    console.log('mergedData', mergedData)
    vueData.items = mergedData
}