function goToDetailedGradingPage(payload) {
    if (payload) {
        Toast.info({ text: `Mở trang chấm bài chi tiết...` });
        openWindow({
            title: "",
            id: "lms_tc_grade_asm",
            url: `/lms_tc_grade_asm?SubmissionID=${payload}&AssignType=${vueData.AssignType}`
        })
        // Ví dụ: openWindow({ url: `/lms_teacher_grading?SubmissionID=${payload.submissionId}` });
        // console.log("Navigate to grading page for SubmissionID:", payload.submissionId);
    }
}
vueData.goToDetailedGradingPage = goToDetailedGradingPage;