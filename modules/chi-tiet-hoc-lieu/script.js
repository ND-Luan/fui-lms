// Hàm duy nhất để gán dữ liệu và buộc Vue render lại
function setData(key, value) {
    vueData[key] = value;
    if (vueData.__vue__) {
        vueData.__vue__.$forceUpdate();
    } else {
        // Fallback trong trường hợp __vue__ không tồn tại ngay lập tức
        Vue.nextTick(() => {
            if (vueData.__vue__) vueData.__vue__.$forceUpdate();
        });
    }
}
function initPage() {
    console.log('init');
    vueData.hocLieuID = new URLSearchParams(window.location.search).get('id');
    if (vueData.hocLieuID) {
        CALL('getTree');
    }
}
function handleGetTreeResponse(result) { // Đổi tên biến thành 'result' cho rõ ràng
    console.log("Hàm handleGetTreeResponse được gọi với:", result);
    // SỬA: Kiểm tra trực tiếp result, không qua .data nữa
    if (result && Array.isArray(result) && result.length > 1) {
        // result[0] là mảng chứa object banner
        // result[1] là mảng chứa dữ liệu cây
        vueData.bannerInfo = result[0] && result[0][0] ? result[0][0] : {};
        vueData.DSHocLieu_Flat = result[1] || [];
        console.log("Banner Info được gán:", vueData.bannerInfo);
        console.log("Dữ liệu cây phẳng được gán:", vueData.DSHocLieu_Flat);
        buildTree();
        if (vueData.treeMucLuc.length > 0) {
            onMucLucSelect(vueData.treeMucLuc[0]);
        }
    } else {
        console.error("Dữ liệu từ getTree không đúng cấu trúc. Mong đợi một mảng chứa 2 mảng con.", result);
    }
}
function handleGetDetailResponse(res) {
    let dataArray = null;
    if (res && res.data && Array.isArray(res.data)) {
        dataArray = res.data;
    } else if (res && Array.isArray(res)) {
        dataArray = res;
    }
    if (dataArray && dataArray.length > 0 && dataArray[0]) {
        const chiTiet = dataArray[0];
        vueData.selectedHoatDong = chiTiet;
        // SỬA: Gói lệnh hiển thị dialog trong nextTick
        Vue.nextTick(() => {
            // Dùng setData để gán dữ liệu và kích hoạt reactivity
            setData('selectedHoatDong', chiTiet);
            setData('showLessonPlayer', true);
        });
    } else {
        console.error("Dữ liệu chi tiết trả về không hợp lệ hoặc rỗng.", res);
        Vue.$toast.error("Không thể tải nội dung của mục này.");
    }
}
function buildTree() {
    const flatList = vueData.DSHocLieu_Flat;
    if (!flatList || flatList.length === 0) { vueData.treeMucLuc = []; return; }
    const nodeMap = {}; const roots = [];
    flatList.forEach(item => { nodeMap[item.NoiDungID] = { ...item, children: [] }; });
    Object.values(nodeMap).forEach(node => {
        if (node.ParentID && nodeMap[node.ParentID]) {
            nodeMap[node.ParentID].children.push(node);
        } else { roots.push(node); }
    });
    const sortNodes = (nodes) => {
        if (!nodes) return;
        nodes.sort((a, b) => (a.ThuTu || 0) - (b.ThuTu || 0));
        nodes.forEach(node => { if (node.children.length > 0) sortNodes(node.children); });
    };
    sortNodes(roots);
    vueData.treeMucLuc = roots;
}
function onMucLucSelect(node) {
    if (node) vueData.selectedBai = node;
}
function onHoatDongClick(hoatDong) {
    if (hoatDong && hoatDong.NoiDungID) {
        vueData.selectedHoatDong = hoatDong;
        // openWindow({
        //     title: "Chi tiết",
        //     //url: `/bai-giang-view?id=${hoatDong.NoiDungID}`
        //     url: `/bai-giang-view?hoclieuid=${vueData.id}&noidungid=${hoatDong.NoiDungID}`
        // })
        redirect(`/hoc-lieu-view?hoclieuid=${vueData.id}&noidungid=${hoatDong.NoiDungID}`)
        // CALL('getNoiDungDetail');
    }
}