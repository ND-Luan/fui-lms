function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const AssignToClassID = urlParams.get('AssignToClassID');
    const AssignmentID = urlParams.get('AssignmentID');
    ajaxCALL("lms/EL_Teacher_GetAssignmentForEdit", {
        AssignmentID: AssignmentID || 0,
        AssignToClassID: AssignToClassID || 0,
        //HocSinhID: vueData.HocSinhID
    }, function (response) {
        const data = response.data[0]
        if (data) {
            vueData.assignmentData = data;
            // vueData.monHocName = response.data[0]?.[0]?.MonHocName || '';
            // vueData.assignmentInfo = response.data[0] ?? {}
            // vueData.submitionInfo = response.data[1][0] ?? {}
            vueData.dataReady = true
        } else {
            console.error("API getAssignmentDetail không trả về dữ liệu hợp lệ.");
            Vue.$toast.error("Không thể tải được dữ liệu bài tập.", { position: "top" });
        }
    });
}
async function saveDraft(payload) {
    return new Promise(resolve => {
        ajaxCALL("lms/EL_Student_SaveSubmission", payload, function (response) {
            vueData.assignmentData = response.data;
            if (response.data[1][0]?.SubmissionStatus == 4) {
                vueData.userAnswersSubmitted = JSON.parse(response.data[1][0]?.SubmissionContent || '{}')?.answers || {}
            }
            // vueData.assignmentData[0] = response.data[0];
            // vueData.assignmentData[1] = response.data[1]
            console.log('save ')
            resolve(response.data)
        });
    })
}
function submitAssignment(payload) {
    ajaxCALL("lms/EL_Student_SaveSubmission", payload, function (response) {
        Vue.$toast.success("Nộp bài thành công!", { position: "top" });
        initPage()
    }, function (error) {
        Vue.$toast.error("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.", { position: "top" });
    });
}
function openSubmitDialog() {
    vueData.confirmSubmitDialog = true;
}
function submitAssignmentFinal() {
    vueData.confirmSubmitDialog = false;
    const payload = {
        AssignToClassID: vueData.assignmentData[0][0].AssignToClassID,
        SubmissionContent: JSON.stringify({ answers: vueData.puseranswers }),
        SubmissionStatus: 2,
        HocSinhID: vueData.HocSinhDetail.HocSinhID
    };
    submitAssignment(payload);
}
function renderQuestionNotSubmit() {
    const asmConfigString = vueData.assignmentData[0][0]?.AssignmentConfig
    const asmConfig = JSON.parse(asmConfigString)
    const questions = []
    for (var group of asmConfig.groups) {
        questions.push(group.questions)
    }
    const flatQuestions = questions.flat()
    const questionNotDone = []
    flatQuestions.forEach((question, index) => {
        if (vueData.puseranswers[question.id].answerData === null)
            questionNotDone.push('Câu ' + (index + 1))
    })
    return questionNotDone.join(', ')
}
vueData.initPage = initPage;
vueData.saveDraft = saveDraft;
vueData.openSubmitDialog = openSubmitDialog;
vueData.submitAssignmentFinal = submitAssignmentFinal;
vueData.renderQuestionNotSubmit = renderQuestionNotSubmit