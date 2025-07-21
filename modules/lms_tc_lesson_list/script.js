// ====== SCRIPT ======
// Hàm điều hướng đến trang tạo bài giảng
function handleCreate() {
    Fui.routeTo('/lms_tc_lesson_builder');
}
// Hàm xử lý khi bộ lọc thay đổi
function handleFilterChange(newFilters) {
    vueData.pagination.page = 1; // Reset về trang 1
    vueData.filters = newFilters;
    // `watch` trong ALLDRAW sẽ tự động gọi API
}
// Hàm xử lý khi chuyển trang
function handlePageChange(newPage) {
    vueData.pagination.page = newPage;
    // `watch` trong ALLDRAW sẽ tự động gọi API
}
// Hàm xử lý khi click nút xóa (chúng ta sẽ hoàn thiện sau)
function handleDelete(lesson) {
    if (confirm(`Bạn có chắc muốn xóa bài giảng "${lesson.Title}"?`)) {
        // CALL('deleteLessonApi', { LessonID: lesson.LessonID }); // Sẽ kích hoạt sau
        console.log('Deleting lesson:', lesson);
    }
}