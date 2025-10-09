function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('AssignmentID');
    if (assignmentId && assignmentId > 0) {
        vueData.isEditMode = true;
        ajaxCALL("lms/EL_Teacher_GetAssignmentForEdit", { AssignmentID: assignmentId, AssignToClassID: vueData.AssignToClassID || 0 }, function (response) {
            console.log('res', response.data[0])
            const asmDefault = {
                version: "1.2", type: "GROUPED_MIXED", groups: [
                    {
                        id: 'group_' + Date.now(), title: 'Phần 1',
                        media: {
                            type: "YOUTUBE",
                            sourceYT: {
                                id: "",
                                source: "",
                                name: ""
                            },
                            sourceRecord: {
                                id: "",
                                source: "",
                                name: ""
                            },
                            sourceFiles: {
                                file: [],
                                image: []
                            }
                        },
                        description: '',
                        questions: []
                    }
                ]
            }
            let assignmentData = {
                ...response.data[0]
            };
            if (!response.data[0]?.AssignmentConfig) assignmentData.AssignmentConfig = asmDefault
            try {
                // Cần parse chuỗi JSON trong AssignmentConfig
                if (typeof assignmentData.AssignmentConfig === 'string') {
                    assignmentData.AssignmentConfig = JSON.parse(assignmentData.AssignmentConfig) || asmDefault
                }
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
            AssignmentConfig: {
                version: "1.2", type: "GROUPED_MIXED", groups: [{
                    id: 'group_' + Date.now(),
                    title: 'Phần 1',
                    description: '',
                    questions: [],
                    media: {
                        type: "YOUTUBE",
                        sourceYT: {
                            id: "",
                            source: "",
                            name: ""
                        },
                        sourceRecord: {
                            id: "",
                            source: "",
                            name: ""
                        },
                        sourceFiles: {
                            file: [],
                            image: []
                        }
                    },
                }]
            },
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
vueData.onCloseWindow = onCloseWindow
vueData.initPage = initPage;
vueData.saveAssignment = saveAssignment;
vueData.isCheckGroupHasAnswerQuestionNotChoose = isCheckGroupHasAnswerQuestionNotChoose
vueData.isCheckAnswerQuestionNotChoose = isCheckAnswerQuestionNotChoose