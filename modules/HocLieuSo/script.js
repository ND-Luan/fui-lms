// --- SCRIPT ---
// Hàm được gọi khi chọn một môn học
function selectSubject(subject) {
    console.log('selectSubject called with:', subject);
    vueData.selectedMonHoc = subject;
    vueData.currentView = 'grades';
    CALL('getLop');
}
// Hàm được gọi khi chọn một lớp
function selectGrade(grade) {
    console.log('selectGrade called with:', grade);
    vueData.selectedLop = grade;
    vueData.currentView = 'lessons';
    CALL('getHocLieu');
}
// Hàm quay lại
function goBack() {
    console.log('goBack called. Current view is:', vueData.currentView);
    if (vueData.currentView === 'lessons') {
        vueData.currentView = 'grades';
        vueData.selectedLop = null;
        vueData.treeHocLieu = [];
        vueData.selectedHocLieuItem = null;
    } else if (vueData.currentView === 'grades') {
        vueData.currentView = 'subjects';
        vueData.selectedMonHoc = null;
        vueData.DSLop = [];
    }
}
// Hàm xây dựng cây
function buildTree() {
    console.log('buildTree called.');
    const flatList = vueData.DSHocLieu_Flat;
    if (!flatList || flatList.length === 0) {
        vueData.treeHocLieu = [];
        return;
    }
    const map = {};
    const roots = [];
    for (let i = 0; i < flatList.length; i++) {
        map[flatList[i].HocLieuID] = i;
        // Đảm bảo thuộc tính children tồn tại
        if (!flatList[i].children) flatList[i].children = [];
    }
    for (const node of flatList) {
        if (node.ParentID !== null && map[node.ParentID] !== undefined) {
            flatList[map[node.ParentID]].children.push(node);
        } else {
            roots.push(node);
        }
    }
    vueData.treeHocLieu = roots;
}
// Hàm xử lý khi chọn node trên cây
function onNodeSelect(node) {
    console.log('onNodeSelect called with:', node);
    vueData.selectedHocLieuItem = node;
}