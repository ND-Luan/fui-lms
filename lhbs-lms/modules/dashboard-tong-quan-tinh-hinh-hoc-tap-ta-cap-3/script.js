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
async function GET_Dashboard_KyNang_TA2() {
    const params = {
        CapID: 3,
        NienKhoa: vueData.NienKhoa,
        Semester: 'HK' + vueData.HocKiValue
    }
    await ajaxCALL('lms/Dashboard_KyNang_TA2', params, function (res) {
        vueData.Dashboard_KyNang_TA2_GK = res.data[0];
        vueData.Dashboard_KyNang_TA2_CK = res.data[1];
    });
}
const itemTabs = [
    {
        title: "Chủ đề",
        value: 3
    },
    // {
    //     "title": "Kĩ năng theo cấp",
    //     "value": 0
    // },
    // {
    //     "title": "Kĩ năng theo khối",
    //     "value": 1
    // },
    // {
    //     "title": "Kĩ năng theo lớp",
    //     "value": 2
    // },
    // {
    //     "title": "Tương quan điểm giữa kì và cuối kì",
    //     "value": 4
    // }
    {
        title: "Kĩ năng nghe",
        value: 5
    },
    {
        title: "Kĩ năng nói",
        value: 6
    },
    {
        title: "Kĩ năng đọc",
        value: 7
    },
    {
        title: "Kĩ năng viết",
        value: 8
    },
    {
        title: "Điểm trung bình",
        value: 9
    },
]
vueData.GET_Dashboard_KyNang_TA2 = GET_Dashboard_KyNang_TA2
console.log('itemTabs', itemTabs);
vueData.itemTabs = itemTabs;