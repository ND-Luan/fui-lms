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
    return DSKhoi;
}
function renderMonHocID() {
    if (vueData.CapID === 1) {
        vueData.MonHocID = 5
    } else if (vueData.CapID === 2) {
        vueData.MonHocID = 46
    } else if (vueData.CapID === 3) {
        vueData.MonHocID = 76
    }
}