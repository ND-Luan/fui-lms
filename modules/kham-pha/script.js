// === SCRIPT ===
function groupHocLieu() {
    if (!vueData.DSHocLieu || vueData.DSHocLieu.length === 0) {
        vueData.DSHocLieu_DaNhom = [];
        return;
    }
    const grouped = vueData.DSHocLieu.reduce((acc, sach) => {
        // Lấy tên bộ sách làm key để nhóm
        const key = sach.TenBoSach;
        // Nếu chưa có nhóm này, tạo một nhóm mới
        if (!acc[key]) {
            acc[key] = {
                tenNhom: key,
                sachs: []
            };
        }
        // Thêm sách vào nhóm tương ứng
        acc[key].sachs.push(sach);
        return acc;
    }, {});
    // Chuyển object đã nhóm thành một mảng để v-for có thể lặp qua
    vueData.DSHocLieu_DaNhom = Object.values(grouped);
}