function fn_renderDataPage() {
    console.log('HocLieu', vueData.HocLieuID)
    console.log('NoiDungID', vueData.NoiDungID)
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null)
    console.log('DetailNoiDung',  DetailNoiDung)
    const objCurrentBaiGiang = DetailNoiDung.find(x =>
          x.NoiDungID === vueData.NoiDungID
    )
    const DSBai = vueData.DetailNoiDung.filter(x => x.ParentID === null)
    console.log(DSBai,)
    console.log(objCurrentBaiGiang)
    const currentBai = DSBai.find(x => x.NoiDungID === objCurrentBaiGiang.NoiDungID)
    vueData.currentBaiGiang = {
        ...objCurrentBaiGiang,
        currentBai: currentBai
    }
    const lenCurrentNoiDung = DetailNoiDung.findIndex(x =>
        x.NoiDungID === vueData.NoiDungID
    )
    vueData.lenCurrentNoiDung = lenCurrentNoiDung
    vueData.lenDetailNoiDung = DetailNoiDung.length
    vueData.IsLoading = false
}
function increasePage() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null)
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung + 1]
    vueData.NoiDungID = objCurrent.NoiDungID
    let currentUrl = window.location.href; // Get the current page's URL
    let url = new URL(currentUrl);
    let params = url.searchParams;
    params.set("noidungid", objCurrent.NoiDungID);
    window.history.pushState({}, '', url.href); // Changes the URL in the browser without a full page reload
    CALL("getTree")
}
function decreasePage() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null)
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung - 1]
    vueData.NoiDungID = objCurrent.NoiDungID
    let currentUrl = window.location.href; // Get the current page's URL
    let url = new URL(currentUrl);
    let params = url.searchParams;
    params.set("noidungid", objCurrent.NoiDungID);
    window.history.pushState({}, '', url.href); // Changes the URL in the browser without a full page reload
    CALL("getTree")
}
vueData.fn_renderDataPage = fn_renderDataPage
vueData.increasePage = increasePage
vueData.decreasePage = decreasePage