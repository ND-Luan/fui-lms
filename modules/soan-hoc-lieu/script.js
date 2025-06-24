// === SCRIPT (Phiên bản cuối cùng) ===
function buildTree() {
    const flatList = vueData.DSHocLieu_Flat;
    if (!flatList) {
        vueData.treeHocLieu = [];
        return;
    }
    const nodeMap = {};
    const roots = [];
    flatList.forEach(item => {
        nodeMap[item.HocLieuID] = { ...item, children: [] };
    });
    Object.values(nodeMap).forEach(node => {
        if (node.ParentID && nodeMap[node.ParentID]) {
            nodeMap[node.ParentID].children.push(node);
        } else {
            roots.push(node);
        }
    });
    const sortNodes = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return;
        nodes.sort((a, b) => (a.ThuTu || 0) - (b.ThuTu || 0) || a.TenHocLieu.localeCompare(b.TenHocLieu));
        nodes.forEach(node => {
            if (node.children.length > 0) {
                sortNodes(node.children);
            }
        });
    };
    sortNodes(roots);
    vueData.treeHocLieu = roots;
}
function onNodeSelect(node) {
    vueData.isNewItem = false;
    vueData.selectedItem = JSON.parse(JSON.stringify(node));
}
function addNewChuong() {
    if (!vueData.selectedLop || !vueData.selectedLop.MonHocLopID) {
        Vue.$toast.warning("Vui lòng chọn Môn học và Lớp trước khi thêm Chương.");
        return;
    }
    vueData.isNewItem = true;
    const currentChildrenCount = vueData.treeHocLieu ? vueData.treeHocLieu.length : 0;
    vueData.selectedItem = {
        HocLieuID: 0,
        TenHocLieu: "Chương mới",
        LoaiHocLieu: "CHUONG",
        ParentID: null,
        MonHocLopID: vueData.selectedLop.MonHocLopID,
        ThuTu: currentChildrenCount,
        NoiDung: ""
    };
}
function addChildItem(parentNode) {
    if (!parentNode || !parentNode.HocLieuID) {
        Vue.$toast.warning("Vui lòng chọn một mục cha trong cây trước.");
        return;
    }
    vueData.isNewItem = true;
    const currentChildrenCount = parentNode.children ? parentNode.children.length : 0;
    vueData.selectedItem = {
        HocLieuID: 0,
        TenHocLieu: "Mục con mới",
        LoaiHocLieu: "BAI",
        ParentID: parentNode.HocLieuID,
        MonHocLopID: parentNode.MonHocLopID,
        ThuTu: currentChildrenCount,
        NoiDung: ""
    };
}
// SỬA HÀM NÀY
// === SCRIPT (Phiên bản cuối cùng, sửa lỗi UPDATE) ===
function saveItem() {
    if (!vueData.selectedItem) {
        Vue.$toast.error("Không có mục nào được chọn để lưu.");
        return;
    }
    if (vueData.editorInstance && ['HTML', 'INTERACTIVE'].includes(vueData.selectedItem.LoaiHocLieu)) {
        vueData.selectedItem.NoiDung = vueData.editorInstance.getDoc().getValue();
    }
    if (!vueData.selectedItem.TenHocLieu || vueData.selectedItem.TenHocLieu.trim() === '') {
        Vue.$toast.error("Tên học liệu không được để trống.");
        return;
    }
    // ==========================================================
    //      ĐÂY LÀ PHẦN SỬA LỖI QUYẾT ĐỊNH
    // ==========================================================
    if (!vueData.selectedItem.ParentID) { vueData.selectedItem.ParentID = 0;}
    const payload = {
        HocLieuID: vueData.selectedItem.HocLieuID || 0,
        TenHocLieu: vueData.selectedItem.TenHocLieu,
        LoaiHocLieu: vueData.selectedItem.LoaiHocLieu,
        ParentID: vueData.selectedItem.ParentID || 0,
        // Logic mới:
        // 1. Ưu tiên lấy MonHocLopID từ chính item đang sửa.
        // 2. Nếu không có (trường hợp Thêm Mới), mới lấy từ dropdown selectedLop.
        MonHocLopID: vueData.selectedItem.MonHocLopID || vueData.selectedLop?.MonHocLopID,
        // Luôn đảm bảo ThuTu là một con số.
        ThuTu: vueData.selectedItem.ThuTu || 0,
        NoiDung: vueData.selectedItem.NoiDung
    };
    // Kiểm tra cuối cùng xem MonHocLopID có tồn tại không
    if (!payload.MonHocLopID) {
        Vue.$toast.error("Không xác định được Môn học/Lớp. Vui lòng chọn lại từ đầu.");
        return;
    }
    CALL("saveHocLieu", payload, (res) => {
        if (res.data && res.data.length > 0 && res.data[0].length > 0) {
            const savedItem = res.data[0][0];
            CALL("getHocLieu", null, () => {
                Vue.nextTick(() => {
                    onNodeSelect(savedItem);
                });
            });
            Vue.$toast.success("Đã lưu thành công!");
        } else {
            Vue.$toast.error("Lưu thất bại, không nhận được phản hồi từ máy chủ.");
        }
    });
}
function deleteItem(nodeToDelete) {
    if (!nodeToDelete || !nodeToDelete.HocLieuID) return;
    CONFIRM("Bạn có chắc chắn muốn xóa mục '" + nodeToDelete.TenHocLieu + "' không? Hành động này không thể hoàn tác.", () => {
        CALL("deleteHocLieu", { HocLieuID: nodeToDelete.HocLieuID }, (res) => {
            CALL("getHocLieu");
            if (vueData.selectedItem && vueData.selectedItem.HocLieuID === nodeToDelete.HocLieuID) {
                vueData.selectedItem = null;
            }
            Vue.$toast.success("Đã xóa thành công!");
        });
    });
}