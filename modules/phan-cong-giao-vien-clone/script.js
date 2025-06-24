function getGiaoVienLop_Get_By_GiaoVienID(GiaoVienID) {
    ajaxCALL('lms/GiaoVienLop_Get_By_GiaoVienID', {
        GiaoVienID
    },
        res => {
            vueData.GiaoVienLop_List = res.data
            vueData.isShowDialogEdit = true
        })
}
function convertDanhSachPhanCong() {
    const uniqueMaGiaoVien = [...new Set(vueData.DSPhanCong_API.map(x => x.GiaoVienID))]
    const uniqueMonHocID = [...new Set(vueData.DSPhanCong_API.map(x => x.MonHocID))]
    const DSPhanCong = []
    console.log(uniqueMaGiaoVien)
    for (var GiaoVienID of uniqueMaGiaoVien.slice(0, 50)) {
        // const DSGiaoVienLop_MonHoc = []
        // for (var MonHocID of uniqueMonHocID) {
        //     const arr = vueData.DSPhanCong_API.filter(x => x.GiaoVienID === GiaoVienID && x.MonHocID === MonHocID)
        //     DSGiaoVienLop_MonHoc.push(arr)
        // }
        // const arrFlatDSGiaoVienLop_MonHoc = DSGiaoVienLop_MonHoc.flat()
        // // console.log('arrFlatDSGiaoVienLop_MonHoc', arrFlatDSGiaoVienLop_MonHoc)
        // DSPhanCong.push({
        //     GiaoVienID: arrFlatDSGiaoVienLop_MonHoc[0]?.GiaoVienID,
        //     HoTen: arrFlatDSGiaoVienLop_MonHoc[0]?.HoTen,
        //     MonHocID: arrFlatDSGiaoVienLop_MonHoc[0]?.MonHocID,
        //     TenMonDuLieuNganh: arrFlatDSGiaoVienLop_MonHoc[0]?.TenMonDuLieuNganh,
        //     List_Lop: arrFlatDSGiaoVienLop_MonHoc
        //         // .map(x => {
        //         // return x.TenLop //+ ' - ' + x.TenMonDuLieuNganh
        //         // })
        //         .sort((a, b) => a.TenLop - b.TenLop)
        // })
        const arr = vueData.DSPhanCong_API.filter(x => x.GiaoVienID === GiaoVienID)
        DSPhanCong.push({
            GiaoVienID: arr[0]?.GiaoVienID,
            HoTen: arr[0]?.HoTen,
            MonHocID: arr[0]?.MonHocID,
            TenMonDuLieuNganh: arr[0]?.TenMonDuLieuNganh,
            List_Lop: arr
                // .map(x => {
                // return x.TenLop //+ ' - ' + x.TenMonDuLieuNganh
                // })
                .sort((a, b) => a.TenLop - b.TenLop)
        })
    }
    vueData.DSPhanCong = DSPhanCong
}
vueData.convertDanhSachPhanCong = convertDanhSachPhanCong
vueData.getGiaoVienLop_Get_By_GiaoVienID = getGiaoVienLop_Get_By_GiaoVienID