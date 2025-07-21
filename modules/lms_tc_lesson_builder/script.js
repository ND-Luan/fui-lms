// ====== SCRIPT ======
function handleElementAdd(elementType) {
    // 1. Chuẩn bị object dữ liệu hoàn chỉnh
    const newElement = {
        ElementID: 0, // Gửi 0 để backend biết đây là INSERT
        LessonID: vueData.lessonId,
        ElementType: elementType,
        ElementData: '{}', // Dữ liệu JSON rỗng ban đầu
        SortOrder: (vueData.elements.length + 1) * 10,
        // Các thuộc tính khác nếu SP yêu cầu...
    };
    // 2. Thêm vào UI ngay lập tức để người dùng thấy (với một ID tạm thời)
    const tempElement = { ...newElement, ElementID: 'new_' + Date.now() };
    vueData.elements.push(tempElement);
    vueData.selectedElementId = tempElement.ElementID;
    vueData.isDirty = true;
    // 3. Gọi API với object dữ liệu đã được chuẩn bị
    Fui.run('saveElementApi', newElement);
}
function selectElement(element) {
    vueData.selectedElementId = element.ElementID;
}
function updateElementProperty(key, value) {
    if (!vueData.selectedElement) return;
    vueData.selectedElement[key] = value;
    vueData.isDirty = true;
}
// Hàm này sẽ được gọi bởi component uc-element-properties
function onPropertyChange(key, value) {
    // Tìm element trong mảng và cập nhật
    const index = vueData.elements.findIndex(el => el.ElementID === vueData.selectedElementId);
    if (index !== -1) {
        vueData.elements[index][key] = value;
        vueData.isDirty = true; // Đánh dấu là có thay đổi chưa lưu
    }
}
function saveChanges() {
    // Logic gọi API lưu bài giảng và các elements
    // Chúng ta sẽ hoàn thiện sau
    console.log("Saving lesson:", vueData.lessonData);
    console.log("Saving elements:", vueData.elements);
    vueData.isDirty = false;
    Fui.toast('Đã lưu bài giảng!');
}