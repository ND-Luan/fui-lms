function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = urlParams.get('SubmissionID');
    if (!submissionId) {
        Vue.$toast.error("Không tìm thấy ID bài nộp trên URL.", { position: "top" });
        vueData.dataReady = true;
        return;
    }
    if (vueData.AssignType == 'CLASS') {
        ajaxCALL("lms/EL_Teacher_GetSubmissionDetail", { SubmissionID: submissionId }, function (response) {
            if (response && response.data && response.data.length >= 2 && response.data[0].length > 0) {
                vueData.submissionData = response.data;
                vueData.dataReady = true;
            } else {
                Vue.$toast.error("Không thể tải dữ liệu bài nộp.", { position: "top" });
            }
        });
    } else {
        ajaxCALL("lms/EL_Teacher_GetSubmissionDetail_AssignToStudent", { SubmissionID: submissionId }, function (response) {
            if (response && response.data && response.data.length >= 2 && response.data[0].length > 0) {
                vueData.submissionData = response.data;
                vueData.dataReady = true;
            } else {
                Vue.$toast.error("Không thể tải dữ liệu bài nộp.", { position: "top" });
            }
        });
    }
}
function saveGradingDraft(payload) {
    // confirm({
    //     title: "Xác nhận chấm pháp?",
    //     action: () => {
    //         ajaxCALL("lms/EL_Teacher_SaveGradeDraft", payload, function (response) {
    //             initPage()
    //             Vue.$toast.success("Đã lưu nháp kết quả chấm!", { position: "top" });
    //             if (response && response.data && response.data[0]) {
    //                 vueData.submissionData[1][0] = { ...response.data[0] };
    //                 vueData.submissionData = [...vueData.submissionData];
    //             }
    //         });
    //     }
    // })
    ajaxCALL("lms/EL_Teacher_SaveGradeDraft", payload, function (response) {
        initPage()
        Vue.$toast.success("Đã lưu nháp kết quả chấm!", { position: "top" });
        if (response && response.data && response.data[0]) {
            vueData.submissionData[1][0] = { ...response.data[0] };
            vueData.submissionData = [...vueData.submissionData];
        }
    });
}
function publishGrades(payload) {
    if (vueData.AssignType == 'CLASS') {
        ajaxCALL("lms/EL_Teacher_PublishGrade", payload, function (response) {
            Vue.$toast.success("Hoàn tất chấm bài và trả bài thành công!", { position: "top" });
            initPage()
            // Chuyển hướng về trang danh sách (có thể kích hoạt sau)
            // window.location.href = '/teacher/grading-list';
        });
    }
    else {
        ajaxCALL("lms/EL_Teacher_PublishGrade_AssignToStudent", payload, function (response) {
            Vue.$toast.success("Hoàn tất chấm bài và trả bài thành công!", { position: "top" });
            initPage()
            // Chuyển hướng về trang danh sách (có thể kích hoạt sau)
            // window.location.href = '/teacher/grading-list';
        });
    }
}
function openPublishDialog() {
    vueData.confirmPublishDialog = true;
}
function publishGradesFinal() {
    vueData.confirmPublishDialog = false;
    const graderComponent = Fui.vm.$refs.assignmentGrader;
    if (graderComponent) {
        graderComponent.calculateTotalScore();
        const payload = {
            SubmissionID: graderComponent.submission.SubmissionID,
            Score: graderComponent.gradingSummary.totalScore,
            TeacherComment: graderComponent.gradingSummary.teacherComment,
            SubmissionContent: JSON.stringify({ answers: graderComponent.gradingData })
        };
        publishGrades(payload);
    } else {
        console.error("Không tìm thấy component uc-assignment-grader.");
    }
}
vueData.initPage = initPage;
vueData.saveGradingDraft = saveGradingDraft;
vueData.publishGrades = publishGrades;
vueData.openPublishDialog = openPublishDialog;
vueData.publishGradesFinal = publishGradesFinal;