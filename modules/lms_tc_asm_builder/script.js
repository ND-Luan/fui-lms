function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('AssignmentID');
    if (assignmentId && assignmentId > 0) {
        vueData.isEditMode = true;
        ajaxCALL("lms/EL_Teacher_GetAssignmentForEdit", { AssignmentID: assignmentId, AssignToClassID: vueData.AssignToClassID || 0 }, function (response) {
            console.log('res', response)
            // SỬA LẠI ĐIỀU KIỆN IF Ở ĐÂY
            const asmDefault = { version: "1.2", type: "GROUPED_MIXED", groups: [{ id: 'group_' + Date.now(), title: 'Phần 1', description: '', questions: [] }] }
            const assignmentData = response.data[0] || asmDefault;
            console.log('res' , response)
            try {
                // Cần parse chuỗi JSON trong AssignmentConfig
                if (typeof assignmentData.AssignmentConfig === 'string'
                    || typeof assignmentData.AssignmentConfig === 'object'
                ) assignmentData.AssignmentConfig = JSON.parse(assignmentData.AssignmentConfig) || asmDefault
            } catch (e) {
                console.error("Lỗi parse AssignmentConfig khi tải bài:", e);
                // Tạo một cấu trúc mặc định nếu parse lỗi
                assignmentData.AssignmentConfig = asmDefault
            }
            vueData.assignment = assignmentData
            vueData.dataReady = true;
        });
    } else {
        vueData.isEditMode = false;
        vueData.assignment = {
            Title: '',
            Instructions: '',
            MonHocLopID: null,
            AssignmentConfig: { version: "1.2", type: "GROUPED_MIXED", groups: [{ id: 'group_' + Date.now(), title: 'Phần 1', description: '', questions: [] }] },
            MaxScore: 10,
            Status: 1 // 1 = Nháp
        };
        vueData.dataReady = true;
    }
}
function saveAssignment(payload) {
    const dataToSend = { ...payload.assignment, AssignmentID: vueData.AssignmentID || 0, AssignToClassID: vueData.AssignToClassID || 0 };
    dataToSend.Status = payload.isPublishing ? 2 : 1;
    // Chuyển đổi lại thành chuỗi JSON trước khi gửi đi
    const groups = payload.assignment.AssignmentConfig?.groups || []
    let MaxScore = 0
    for (var group of groups) {
        for (var question of group.questions) {
            MaxScore += question.points
        }
    }
    dataToSend.MaxScore = MaxScore
    dataToSend.AssignmentConfig = JSON.stringify(dataToSend.AssignmentConfig)
    console.log('run saving...', dataToSend)
    ajaxCALL("lms/EL_Teacher_SaveAssignment",
        dataToSend,
        (response) => {
            Vue.$toast.success('Lưu bài tập thành công', { position: 'top' })
            if (!vueData.isEditMode && response.data && response.data[0] && response.data[0].AssignmentID) {
                const newId = response.data[0].AssignmentID;
                window.history.pushState({}, '', `?AssignmentID=${newId}`);
                vueData.isEditMode = true;
                vueData.assignment.AssignmentID = newId;
            }
        });
}
function onCloseWindow() {
    console.log('app.config.globalProperties.v_OpenWindowList', { ...app.config.globalProperties.v_OpenWindowList })
    let indexWindow = app.config.globalProperties.v_OpenWindowList.indexOf(item => item.id = 'WinSoanBaiTap')
    if (indexWindow != -1) {
        app.config.globalProperties.v_OpenWindowList.splice(indexWindow, 1)
    }
}
function abc() {
}
vueData.onCloseWindow = onCloseWindow
vueData.initPage = initPage;
vueData.saveAssignment = saveAssignment;