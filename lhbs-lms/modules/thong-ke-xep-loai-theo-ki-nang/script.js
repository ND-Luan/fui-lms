function renderDSKhoi() {
    const DSKhoi = Array.from({ length: 12 }).map((_, i) => {
        const value = i + 1;
        let CapID;
        if (value >= 1 && value <= 5) {
            CapID = 1;
        } else if (value >= 6 && value <= 9) {
            CapID = 2;
        } else if (value >= 10 && value <= 12) {
            CapID = 3;
        }
        return {
            title: `Khối ${value}`,
            value,
            CapID,
        };
    });
    vueData.DSKhoi = DSKhoi.filter((x) => x.CapID === vueData.CapID);
    return DSKhoi;
}
function loadAPIChart(){
    console.log('item' , item)
}
vueData.loadAPIChart = loadAPIChart