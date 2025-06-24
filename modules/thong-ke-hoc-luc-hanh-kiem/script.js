
function TongKet_GetDTBMonHocByKhoiLop() {
    vueData.DSHocSinh = []
    if (vueData.Is_InCaKhoi) {
        ajaxCALL(`https://tapi.lhbs.vn/diemc${vueData.CapID}/LMS_ThongKeChung_TheoKhoi`,
            {
                HocKy: vueData.Semester.value,
                NamHoc: vueData.NienKhoa,
                TypeBaoCao: vueData.MatBaoCaoItem?.value
            }, res => {
                vueData.DSHocSinh_API_TongKet = res.data
                vueData.dataDiem = res.data
                initSpread()
            })
    } else {
        ajaxCALL(`https://tapi.lhbs.vn/diemc${vueData.CapID}/LMS_ThongKeChung`,
            {
                HocKy: vueData.Semester.value,
                NamHoc: vueData.NienKhoa,
                TypeBaoCao: 2
            }, res => {
                vueData.DSHocSinh_API_TongKet = res.data
                vueData.dataDiem = res.data
                initSpread()
            })
    }
}
function initSpread() {
    handleHeaders()
    handleData()
}
function handleHeaders() {
    let headerDefault = Object.keys(vueData.dataDiem[0])
    console.log('headerDefault', headerDefault)
    const DSCotDiem = vueData.MonHoc_QLD.map(item => item.MonHocCode.toLowerCase())
    let columnThongTinHocSinh = []
    for (var key of headerDefault) {
        let column = {
            type: 'text',
            title: key,
            name: key,
            width: 80,
            backGroundColor: null,
            wrap: true,
            align: "center",
            readOnly: true,
            style: 'font-size:8px'
        }
        columnThongTinHocSinh.push(column)
    }
    vueData.columnHeader = [...columnThongTinHocSinh]
    console.log('vueData.columnHeader', vueData.columnHeader)
    vueData.keyComp++
}
function handleData() {
    for (var item of vueData.dataDiem) {
        vueData.DSHocSinh.push(item)
    }
}
vueData.initSpread = initSpread
vueData.TongKet_GetDTBMonHocByKhoiLop = TongKet_GetDTBMonHocByKhoiLop