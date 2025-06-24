
function getDiemTheoLop_Mon_QLD() {
    if (vueData.Semester.HocKi === 0) {
        getDiemTBLop_Mon()
    } else {
        ajaxCALL(`diemc${vueData.CapID}/LMS_GetDiemTheoLop`, {
            LopID: vueData.LopItem.LopID,
            MonHocID: 'toan', //Truyền tĩnh 1 môn thì sẽ lấy hết tất cả các môn
            HocKy: vueData.Semester.HocKi,
            NamHoc: vueData.NienKhoa
        }, res => {
            const newData = res.data.map(x => {
                return {
                    ...x,
                    // MonHocID: x.MonHocID.toUpperCase(),
                    HocKi: vueData.Semester.value
                }
            })
            vueData.DSHocSinh_API_QLD = newData
            renderDSHocSinh_QLD(newData)
        })
    }
}
function getDiemTBLop_Mon() {
    ajaxCALL(
        `diemc${vueData.CapID}/LMS_GetTongKetDTBMonHocByLop`,
        {
            LopID: vueData.LopItem.LopID,
            HocKy: vueData.Semester.HocKi,
            NienKhoa: vueData.NienKhoa,
        },
        res => {
            // [{
            //     "STT": 1,
            //     "HocSinhID": "19100146",
            //     "HoTen": "Đào Bảo An",
            //     "TenLop": "06A",
            //     "NgaySinh": "23/11/2013",
            //     "GDDP": "Đ",
            //     "HDTN": "Đ",
            //     "HKTN": "9.20",
            //     "JA": "9.5",
            //     "LS-DL": "9.80",
            //     "NT": "Đ",
            //     "AI": "9.40",
            //     "toan": "9.60",
            //     "tin": "9.60",
            //     "van": "9.50",
            //     "anh": "7.40",
            //     "gdcd": "9.90",
            //     "cn": "9.90",
            //     "td": "Đ",
            //     "DTB": "9.4",
            //     "HocSinhLopID": 40362
            // }]
            const newData = res.data.map(x => {
                return {
                    ...x,
                    HocKi: vueData.Semester.value,
                }
            })
            const MonHocID = [
                "GDDP",
                "HDTN",
                "HKTN",
                "JA",
                "LS-DL",
                "NT",
                "AI",
                "toan",
                "tin",
                "van",
                "anh",
                "gdcd",
                "cn",
                "td",
            ]
            const _data = []
            for (var item of newData) {
                for (var key in item) {
                    if (MonHocID.includes(key)) {
                        _data.push({
                            HocSinhID: item.HocSinhID,
                            HoTen: item.HoTen,
                            MonHocID: key,
                            TenLop: item.TenLop,
                            DiemTB_CaNam: item[key],
                            HocKi: vueData.Semester.value,
                        })
                    }
                }
            }
            vueData.DSHocSinh_API_QLD = _data
            renderDSHocSinh_QLD(_data)
        }
    )
}
// function getDiemTheoLop_QLD() {
//     if (vueData.CapID === 1) {
//         ajaxCALL('psmark1/LMS_GetDanhGiaHocSinh', {
//             LopID: vueData.LopItem.LopID,
//             KyDanhGia: vueData.Semester.KyDanhGia,
//             NamHoc: 2024
//         }, res => {
//             vueData.DSHocSinh_API_QLD = res.data
//             renderDSHocSinh_QLD()
//         })
//     } else {
//         ajaxCALL(`diemc${vueData.CapID}/LMS_GetDiemTheoLop?LopID=${vueData.LopItem.LopID}&MonHocID=anh&HocKy=2`)
//     }
//     // ajaxCALL(`https://tapi.lhbs.vn/diemc${vueData.CapID}/LMS_GetDiemTheoLop?LopID=${vueData.LopItem.LopID}&MonHocID=anh&HocKy=2`, null, res => {
//     //     vueData.DSHocSinh_API_QLD = res.data.map(item => {
//     //         let findObj = vueData.MonHoc_QLD.find(e => e.MonHocCode.toLowerCase() == item.MonHocID.toLowerCase())
//     //         if (!findObj) return item
//     //         return { ...item, MonHocName: findObj.MonHocName, Sort: findObj.Sort}
//     //     })
//     //     vueData.DSHocSinh_API_QLD = vueData.DSHocSinh_API_QLD.sort((a, b) => a.Sort - b.Sort);
//     //     renderDSHocSinh_QLD()
//     // })
// }
function promiseAjaxCALL(url, params) {
    return new Promise(resolve => {
        ajaxCALL(url, params, res => {
            resolve(res)
        })
    })
}
function fn_KeoDiem() {
    const uniqueHocSinhID = [...new Set(vueData.DSHocSinh_API_QLD.map(x => x.HocSinhID))]
    const uniqueTenMon = [...new Set(vueData.DSHocSinh_API_QLD.map(x => x.MonHocID))]//.map(item => item.toUpperCase());
    const promise = () => {
        return new Promise(async resolve => {
            for (var HocSinhID of uniqueHocSinhID) {
                for (var MonHocID of uniqueTenMon) {
                    const JsonHocSinh_KeoDiem = vueData.DSHocSinh_API_QLD.filter(x => x.HocSinhID === HocSinhID && x.MonHocID === MonHocID)
                    // console.log('JsonHocSinh_KeoDiem', JsonHocSinh_KeoDiem)
                    await promiseAjaxCALL(`lms/fn_HocSinh_KeoDiem_C${vueData.CapID}`, {
                        JsonData: JsonHocSinh_KeoDiem
                    }).then(res => {
                        console.log('Kéo ', HocSinhID, ' - ', MonHocID, ' Thành công!')
                    })
                }
            }
            resolve()
        })
    }
    promise().then(() => {
        //Sau khi chạy xong vòng for thì show thông báo
        Vue.$toast.success(`Kéo điểm thành công`, { position: "top" })
    })
}
function renderDSHocSinh_QLD(newData) {
    const _dsHocSinh = []
    const dsHocSinhID = [...new Set(newData.map(x => x.HocSinhID))]
    //Khởi tạo danh sách học sinh
    for (var HocSinhID of dsHocSinhID) {
        const objHocSinh = newData.find(x => x.HocSinhID === HocSinhID)
        if (objHocSinh) _dsHocSinh.push({
            ...objHocSinh,
            DSCotDiem: newData.filter(x => x.HocSinhID === HocSinhID)
        })
    }
    vueData.DSHocSinhQLD = _dsHocSinh
}
vueData.getDiemTheoLop_Mon_QLD = getDiemTheoLop_Mon_QLD