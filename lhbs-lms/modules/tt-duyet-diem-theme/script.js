function convertHocSinh() {
    const firstStudent = vueData.DSCotDiem[0]
    const _headers = vueData.DSCotDiem.filter(x => x.HocSinhID === firstStudent.HocSinhID)
    const uniqueHocSinhID = [...new Set(vueData.DSCotDiem.map(x => x.HocSinhID))]
    const DSHocSinh = []
    for (var HocSinhID of uniqueHocSinhID) {
        const hocSinh = vueData.DSCotDiem.find(x => x.HocSinhID === HocSinhID)
        if (hocSinh) DSHocSinh.push({
            HocSinhID: HocSinhID,
            HoTen: hocSinh.HoTen,
            NgaySinh: hocSinh.NgaySinh,
            SoDanhBo: hocSinh.SoDanhBo,
            Nu: hocSinh.Nu,
        })
    }
    console.log('1', DSHocSinh)
    for (var hocSinh of DSHocSinh) {
        const arrCotDiemOfHocSinh = vueData.DSCotDiem.filter(x => x.HocSinhID === hocSinh.HocSinhID)
        console.log('arrCotDiemOfHocSinh', arrCotDiemOfHocSinh)
        for (var cotDiem of arrCotDiemOfHocSinh) {
            hocSinh[cotDiem.MaCotDiem] = cotDiem.KetQuaDanhGia_VI
            hocSinh[cotDiem.TenCotDiem_VI] = cotDiem.KetQuaDanhGia_VI
        }
        console.log('hocSinh', hocSinh)
    }
    console.log('DSHocSinh', DSHocSinh)
    const headers = [{
        "key": "hocSinh",
        "el": "uc-info-student",
        "title": "Học sinh",
        align: "center",
        cellProps: {
            class: `w-250`,
        }
    }]
    for (var header of _headers) {
        headers.push({
            title: header.TenCotDiem_VI,
            value: header.MaCotDiem,
            align: "center",
            minWidth: 1000,
            maxWidth: "1000",
            class: "text-center xxxx",
            style: "red:color;",
            nowrap: true,
            cellProps: {
                class: `w-${header.WidthCSS} text-center`,
            }
        })
    }
    vueData.headers = headers
    vueData.items = DSHocSinh
}
const isShowReasonReject = () => {
    let defaultObj = {
        disabled: false,
        NoiDungNhanXet: null
    }
    const obj = vueData.DSCotDiem.find(x => x.TinhTrang === 5) //Tổ trưởng từ chối
    defaultObj.disabled = obj ? true : false
    defaultObj.NoiDungNhanXet = obj?.NoiDungNhanXet ?? ''
    return defaultObj
}