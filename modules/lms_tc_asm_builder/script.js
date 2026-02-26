const urlParams = new URLSearchParams(window.location.search);
function initPage() {
    vueData.HocKi = localStorage.getItem('HocKi') ?? 1
    let IsLanguage = localStorage.getItem('IsLanguage') ? true : false;
    const assignmentId = urlParams.get('AssignmentID');
    // 👉 Xác định URL và params theo loại Assign
    let apiUrl = "lms/EL_Teacher_GetAssignmentForEdit";
    let apiParams = { AssignmentID: assignmentId };
    if (vueData.AssignToClassID) {
        apiParams.AssignToClassID = vueData.AssignToClassID ?? 0;
    }
    else if (vueData.AssignToStudentID) {
        apiUrl = "lms/EL_Teacher_GetAssignmentForEdit_Student";
        apiParams.AssignToStudentID = vueData.AssignToStudentID;
    }
    console.log(
        apiUrl,
        apiParams
    )
    if (assignmentId && assignmentId > 0) {
        vueData.isEditMode = true;
        ajaxCALL(apiUrl, apiParams, function (response) {
            const asmDefault = {
                version: "1.2",
                type: "GROUPED_MIXED",
                groups: [{
                    id: 'group_' + Date.now(),
                    title: `${IsLanguage ? 'Section' : 'Phần'} 1`,
                    media: {
                        type: "YOUTUBE",
                        sourceYT: { id: "", source: "", name: "" },
                        sourceRecord: { id: "", source: "", name: "" },
                        sourceFiles: { file: [], image: [] }
                    },
                    description: '',
                    advancedFeatures: {
                        isShuffleQuestions: false,
                        isShuffleAnswers: false
                    },
                    questions: []
                }]
            };
            let assignmentData = { ...response.data[0] };
            if (!assignmentData?.AssignmentConfig) {
                assignmentData.AssignmentConfig = asmDefault;
            }
            try {
                if (typeof assignmentData.AssignmentConfig === 'string') {
                    assignmentData.AssignmentConfig =
                        JSON.parse(assignmentData.AssignmentConfig) || asmDefault;
                }
            } catch (e) {
                assignmentData.AssignmentConfig = asmDefault;
            }
            vueData.assignment = assignmentData;
            console.log(" vueData.assignment ", vueData.assignment )
            vueData.dataReady = true;
        });
    } else {
        // 👉 Mode tạo mới
        vueData.isEditMode = false;
        vueData.assignment = {
            Title: '',
            Instructions: '',
            MonHocLopID: null,
            AssignmentConfig: {
                version: "1.2",
                type: "GROUPED_MIXED",
                groups: [{
                    id: 'group_' + Date.now(),
                    title: `${IsLanguage ? 'Section' : 'Phần'} 1`,
                    description: '',
                    AdvancedFeatures: {
                        isShuffleQuestions: false,
                        isShuffleAnswers: false
                    },
                    questions: [],
                    media: {
                        type: "YOUTUBE",
                        sourceYT: { id: "", source: "", name: "" },
                        sourceRecord: { id: "", source: "", name: "" },
                        sourceFiles: { file: [], image: [] }
                    }
                }]
            },
            MaxScore: 10,
            Status: 1
        };
        vueData.dataReady = true;
    }
}
async function saveAssignment(payload) {
    const dataToSend = {
        ...payload.assignment,
        AssignmentID: vueData.AssignmentID || 0,
        AssignToClassID: vueData.AssignToClassID || 0,
        Is_Full_Quiz: payload.Is_Full_Quiz ? 1 : 0,
        IsBlockCopy_Paste: payload.setting.IsBlockCopy_Paste
    };
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
    const cloneGroup = _.cloneDeep(dataToSend.AssignmentConfig)
    for (var group of cloneGroup.groups) {
        group.questions = group.questions.map(x => {
            if (x.type === "QUIZ_SINGLE_CHOICE") x.config.correctAnswer = null
            if (x.type === "QUIZ_MULTIPLE_CHOICE") x.config.correctAnswers = []
            if (x.type === "QUIZ_TRUE_FALSE") x.config.correctAnswer = null
            if (x.type === "QUIZ_MULTIPLE_TRUE_FALSE") x.config.options = x.config.options.map(n => ({ ...n, inCorrectAnswer: null, correctAnswer: null }))
            if (x.type === "QUIZ_FILL_IN_BLANK")
                x.config.parts = x.config.parts.map(n => {
                    if (n.type === "blank") n.acceptedAnswers = []
                    return n
                })
            if (x.type === "QUIZ_MATCHING") x.config.correctPairs = []
            return x
        })
    }
    dataToSend.AssignmentConfig_NoAnswer = JSON.stringify(cloneGroup)
    dataToSend.AssignmentConfig = JSON.stringify(dataToSend.AssignmentConfig)
    console.log('run saving......', dataToSend)
    ajaxCALL("lms/EL_Teacher_SaveAssignment",
        dataToSend,
        (response) => {
            Vue.$toast.success('Lưu bài tập thành công', { position: 'top' })
            console.log('vueData.isEditMode', vueData.isEditMode)
            if (urlParams.get('AssignToClassID') && !vueData.isEditMode) {
                window.open("/lms-teacher-dashboard", '_parent');
            }
            if (!vueData.isEditMode && response.data && response.data[0] && response.data[0].AssignmentID) {
                const newId = response.data[0].AssignmentID;
                window.history.pushState({}, '', `?AssignmentID=${newId}`);
                vueData.isEditMode = true;
                vueData.assignment.AssignmentID = newId;
                console.log('assignment', vueData.assignment)
            }
        });
}
function isCheckAllGroupFullQuiz(groups) {
    let isNotFullQuiz = false
    if (!groups) return isNotFullQuiz
    for (var group of groups) {
        for (var question of group.questions) {
            let isCheck = question.type.includes('QUIZ') ? true : false
            if (!isCheck) {
                return true
            }
        }
    }
    return isNotFullQuiz
}
function isCheckGroupHasAnswerQuestionNotChoose(groups) {
    const obj = {
        isNotChoose: false,
        questionNotChooses: [],
        message: null
    }
    if (!groups) return obj
    for (var group of groups) {
        for (var question of group.questions) {
            let isCheck = isCheckAnswerQuestionNotChoose(question)
            if (isCheck) {
                obj.isNotChoose = true
                obj.questionNotChooses.push(question)
            }
        }
    }
    const numberQuestions = obj.questionNotChooses.map(x => 'Câu ' + x.ordinalNumber)
    obj.message = numberQuestions.join(', ') ?? ''
    return obj
}
function isCheckAnswerQuestionNotChoose(question) {
    let flag = false
    const config = question.config
    if (!config) return flag
    if (question.type === "QUIZ_SINGLE_CHOICE")
        if (!config.correctAnswer) flag = true
    if (question.type === "QUIZ_MULTIPLE_CHOICE")
        if (config.correctAnswers.length === 0) flag = true
    if (question.type === "QUIZ_TRUE_FALSE")
        if (config.correctAnswer === null) flag = true
    if (question.type === "QUIZ_MULTIPLE_TRUE_FALSE") {
        for (var option of config.options) {
            if (!option?.correctAnswer && !option?.inCorrectAnswer) {
                flag = true
                break;
            }
        }
    }
    if (question.type === "QUIZ_FILL_IN_BLANK") {
        if (config.parts.length === 0) {
            flag = true
        }
        if (!config.parts.find(x => x.type === 'blank')) flag = true
        for (var part of config.parts) {
            if (part.type === "blank" && (part.acceptedAnswers?.length === 0 || part.acceptedAnswers[0]?.length === 0)) {
                flag = true
            }
        }
    }
    if (question.type === "QUIZ_MATCHING") {
        if (config.correctPairs.length === 0) {
            flag = true
        }
    }
    return flag
}
vueData.initPage = initPage;
vueData.saveAssignment = saveAssignment;
vueData.isCheckAllGroupFullQuiz = isCheckAllGroupFullQuiz
vueData.isCheckGroupHasAnswerQuestionNotChoose = isCheckGroupHasAnswerQuestionNotChoose
vueData.isCheckAnswerQuestionNotChoose = isCheckAnswerQuestionNotChoose