function fn_renderDataPage() {
    console.log('HocLieu', vueData.HocLieuID)
    console.log('NoiDungID', vueData.NoiDungID)
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null)
    console.log('DetailNoiDung', DetailNoiDung)
    const objCurrentBaiGiang = DetailNoiDung.find(x =>
        x.NoiDungID === vueData.NoiDungID
    )
    const DSBai = vueData.DetailNoiDung.filter(x => x.ParentID === null)
    const DSNhomKyNang = vueData.DetailNoiDung.filter(x => x.LoaiNoiDung === 'NHOM_KY_NANG')
    console.log(DSBai,)
    console.log('objCurrentBaiGiang', objCurrentBaiGiang)
    const currentNhomKyNang = DSNhomKyNang.find(x => x.NoiDungID === objCurrentBaiGiang.ParentID)
    const currentBai = DSBai.find(x => x.NoiDungID === currentNhomKyNang.ParentID)
    console.log('currentNhomKyNang', currentNhomKyNang)
    vueData.currentBaiGiang = {
        ...objCurrentBaiGiang,
        currentNhomKyNang: currentNhomKyNang,
        currentBai: currentBai
    }
    const lenCurrentNoiDung = DetailNoiDung.findIndex(x =>
        x.NoiDungID === vueData.NoiDungID
    )
    vueData.lenCurrentNoiDung = lenCurrentNoiDung
    vueData.lenDetailNoiDung = DetailNoiDung.length
    vueData.IsLoading = false
}
function pushState(key, value) {
    let currentUrl = window.location.href; // Get the current page's URL
    let url = new URL(currentUrl);
    let params = url.searchParams;
    params.set(key, value);
    window.history.pushState({}, '', url.href); // Changes the URL in the browser without a full page reload
}
function increasePage() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null)
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung + 1]
    vueData.NoiDungID = objCurrent.NoiDungID
    pushState('noidungid', objCurrent.NoiDungID)
    initPage()
    fn_renderDataPage()
}
function decreasePage() {
    const DetailNoiDung = vueData.DetailNoiDung.filter(x => x.ParentID !== null && x.DataJson !== null)
    const objCurrent = DetailNoiDung[vueData.lenCurrentNoiDung - 1]
    vueData.NoiDungID = objCurrent.NoiDungID
    pushState('noidungid', objCurrent.NoiDungID)
    initPage()
    fn_renderDataPage()
}
function initPage() {
    console.log('init');
    vueData.isLoading = true;
    vueData.lessonId = new URLSearchParams(window.location.search).get('noidungid');
    if (vueData.lessonId) {
        CALL('getLessonDetail');
    } else {
        vueData.isLoading = false;
        vueData.lessonTitle = "Không tìm thấy ID bài giảng.";
    }
}
function handleApiResponse(res) {
    vueData.isLoading = false;
    if (res && Array.isArray(res) && res[0]) {
        const lessonData = res[0];
        vueData.lessonTitle = lessonData.TenNoiDung;
        let slide = {
            id: lessonData.NoiDungID,
            type: lessonData.LoaiNoiDung, // Luôn lấy LoaiNoiDung làm type gốc
            content: null // Khởi tạo content là null
        };
        // console.log('x', lessonData.DataJson && lessonData.DataJson.trim() !== '')
        function isPureHTMLString(str) {
            try {
                // Nếu parse thành JSON được → rõ ràng không phải HTML "thuần"
                JSON.parse(str);
                return false;
            } catch {
                // Nếu không phải JSON → có thể là HTML → kiểm tra kỹ hơn
                const el = document.createElement('div');
                el.innerHTML = str.trim();
                return el.childNodes.length > 0 && [...el.childNodes].some(n => n.nodeType === 1);
            }
        }
        try {
            // Chỉ parse nếu DataJson có nội dung
            if (lessonData.DataJson && lessonData.DataJson.trim() !== '') {
                if (isPureHTMLString(lessonData.DataJson)) {
                    slide.content = {}; // đảm bảo không còn là null nữa
                    slide.content.htmlContent = lessonData.DataJson
                } else {
                    const jsonParse = JSON.parse(lessonData.DataJson)
                    slide.content = jsonParse;
                }
            } else {
                // Nếu không có DataJson, có thể là một bài placeholder
                slide.content = { title: "Nội dung đang được cập nhật." };
            }
        }
        catch (e) {
            console.warn('error', e)
            // Nếu parse lỗi, coi DataJson là HTML thô và đổi type
            slide.type = 'RawHTML';
            slide.content = lessonData.DataJson;
        }
        // console.log('slidse', slide)
        // Gán vào một mảng chứa một slide duy nhất
        vueData.slides = [slide];
        vueData.currentSlideIndex = 1; // Tạm thời đặt là 1 để kích hoạt watch
        vueData.currentSlideIndex = 0; // Đặt lại là 0 để Vue chắc chắn thấy thay đổi
    } else {
        vueData.lessonTitle = "Lỗi tải dữ liệu bài giảng.";
        vueData.slides = [];
        vueData.currentSlideIndex = -1;
    }
}
function goToNextSlide() {
    if (vueData.currentSlideIndex < vueData.slides.length - 1) {
        vueData.currentSlideIndex++;
    }
}
function goToPrevSlide() {
    if (vueData.currentSlideIndex > 0) {
        vueData.currentSlideIndex--;
    }
}
function goBack() {
    window.location.replace(`chi-tiet-hoc-lieu?id=${vueData.HocLieuID}`);
}
vueData.fn_renderDataPage = fn_renderDataPage
vueData.increasePage = increasePage
vueData.decreasePage = decreasePage