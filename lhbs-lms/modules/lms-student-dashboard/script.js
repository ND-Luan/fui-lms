function initPage() {
    ajaxCALL("lms/EL_Student_GetDashboardData", null, function (response) {
        if (response && response.data && response.data.length >= 4) {
            vueData.focusTasks = response.data[0];
            vueData.weekSchedule = response.data[1];
            vueData.subjectProgress = response.data[2];
            vueData.recentFeed = response.data[3];
            vueData.achievements = response.data[4];
            vueData.dataReady = true;
        } else {
            console.error("API GetDashboard_V3 không trả về đủ 4 bảng dữ liệu.");
            Vue.$toast.error("Không thể tải dữ liệu dashboard.");
            vueData.dataReady = true;
        }
    }, function (error) {
        console.error("Lỗi khi gọi API GetDashboard_V3:", error);
        Vue.$toast.error("Có lỗi xảy ra khi tải dữ liệu.");
        vueData.dataReady = true;
    });
}
vueData.initPage = initPage;
// =============================================================
// CODE CHO MODAL XEM NHANH KẾT QUẢ BÀI LÀM ==
// =============================================================
function onViewSummary(submissionId) {
    if (!submissionId) return;
    vueData.gradeSummary = {
        ...vueData.gradeSummary, // Giữ lại các giá trị cũ nếu có
        visible: true,           // Đặt visible = true
        loading: true,           // Bật loading
        data: null,              // Xóa dữ liệu cũ
        submissionId: submissionId
    };
    // Gọi API để lấy dữ liệu
    ajaxCALL("lms/EL_Student_GetSubmissionSummary", { SubmissionID: submissionId }, function (response) {
        if (response && response.data && response.data.length >= 2) {
            vueData.gradeSummary = {
                ...vueData.gradeSummary,
                data: {
                    overview: response.data[0][0],
                    details: response.data[1]
                },
                loading: false
            };
        } else {
            Vue.$toast.error("Không thể tải chi tiết điểm.");
            vueData.gradeSummary = { ...vueData.gradeSummary, visible: false, loading: false };
        }
    }, function (error) {
        console.error("Lỗi khi gọi GetSubmissionSummary:", error);
        Vue.$toast.error("Có lỗi xảy ra khi tải chi tiết điểm.");
        vueData.gradeSummary = { ...vueData.gradeSummary, visible: false, loading: false };
    });
}
// Hàm này được gọi từ component uc-summary-modal khi người dùng muốn xem trang chi tiết
function goToFullGradingPage(assignmentId) {
    if (!assignmentId) return Vue.$toast.error("Không tìm thấy thông tin bài tập để điều hướng.")
    let window = {
        title: "Kết quả bài tập",
        url: `/lms-student-assignment?AssignToClassID=${assignmentId}`,
        id: '12333',
        onclose: {
            "EXE": "vueData.initPage()"
        }
    }
    openWindow(window)
    runAction(window.onclose, window)
    console.log('eêe')
}
function callTest() {
    console.log('Test function called from student dashboard');
    app.config.globalProperties.v_OpenWindowList.pop()
}
// Đăng ký các hàm mới vào vueData để ALLDRAW có thể gọi
vueData.onViewSummary = onViewSummary;
vueData.goToFullGradingPage = goToFullGradingPage;
// vueData.callTest = callTest;