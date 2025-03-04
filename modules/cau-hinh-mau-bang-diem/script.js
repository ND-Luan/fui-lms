async function loadDSMauBangDiem() {
    const res = await TemplateBangDiem_Service.Get({
        TemplateBangDiemID: 0,
        CapID: vueData.CapID
    })
    if (res.IsSuccess) {
        vueData.TBMauBangDiem = res.Result
    }
}