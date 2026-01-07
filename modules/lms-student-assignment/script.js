const urlParams = new URLSearchParams(window.location.search);
function initPage() {
    vueData.LanNop = urlParams.get('LanNop') ? parseInt(urlParams.get('LanNop')) : 1
    if (urlParams.get('Is_Resubmit')) {
        vueData.Is_Resubmit = urlParams.get('Is_Resubmit') == '1' ? 1 : 0
    } else {
        vueData.Is_Resubmit = 0
    }
    const AssignToClassID = urlParams.get('AssignToClassID');
    const AssignToStudentID = urlParams.get('AssignToStudentID');
    if (!AssignToClassID && !AssignToStudentID) {
        Vue.$toast.error("Không tìm thấy ID bài tập trên URL.", { position: "top" });
        vueData.dataReady = true;
        return;
    }
    if (vueData.Is_SendToClass == 'false') {
        ajaxCALL("lms/EL_Student_GetAssignmentDetail_AssignToStudent", {
            AssignToStudentID: parseInt(AssignToClassID),
            LanNop: vueData.LanNop ?? 1
            //HocSinhID: vueData.HocSinhID
        }, async function (response) {
            if (response && response.data && response.data.length > 0 && response.data[0].length > 0) {
                vueData.assignmentData = response.data;
                if (vueData.Is_Resubmit == 1) {
                    vueData.assignmentData[1] = []
                }
                vueData.monHocName = response.data[0]?.[0]?.MonHocName || '';
                vueData.assignmentInfo = response.data[0] ?? {}
                vueData.submitionInfo = response.data[1][0] ?? {}
                const config = vueData.assignmentData[0][0];
                config.groups = JSON.parse(config.AssignmentConfig).groups || [];
                //Xử lí đảo câu hỏi, đáp án
                if (config.Is_Shuffle == 0 || !vueData.submitionInfo?.SubmissionID) {
                    config.groups.forEach((group) => {
                        if (group.advancedFeatures && group.advancedFeatures.isShuffleQuestions) {
                            group.questions = _.shuffle(group.questions)
                        }
                        if (group.advancedFeatures && group.advancedFeatures.isShuffleAnswers) {
                            group.questions.filter(q => q.type.includes('QUIZ_')).forEach(q => {
                                if (q.type == 'QUIZ_SINGLE_CHOICE') {
                                    q.config.options = _.shuffle(q.config.options)
                                }
                                else if (q.type == 'QUIZ_TRUE_FALSE') {
                                }
                                else if (q.type == 'QUIZ_MULTIPLE_TRUE_FALSE') {
                                    q.config.options = _.shuffle(q.config.options)
                                }
                                else if (q.type == 'QUIZ_FILL_IN_BLANK') {
                                }
                                else if (q.type == 'QUIZ_MATCHING') {
                                    q.config.columnA = _.shuffle(q.config.columnA)
                                    q.config.columnB = _.shuffle(q.config.columnB)
                                }
                                else if (q.type == 'QUIZ_MULTIPLE_CHOICE') {
                                    q.config.options = _.shuffle(q.config.options)
                                }
                            })
                        }
                    })
                    vueData.AssignmentConfigAfterShuffle = { ...JSON.parse(config.AssignmentConfig), groups: config.groups }
                }
                if (vueData.Is_Resubmit == 1) {
                    insertSubmissionForResubmit()
                }
                //Xử lí mapping đáp án cho bài đã chấm điểm
                if (vueData.submitionInfo?.SubmissionID && vueData.submitionInfo?.SubmissionStatus == 4) {
                    let config_After_Mapping = await handleMapingAnswer_For_Graded(JSON.parse(config.AssignmentConfig_HadAnswer), JSON.parse(config.AssignmentConfig))
                    config.groups = config_After_Mapping
                }
                // vueData.dataReady = true;
                if (response.data[1][0]?.SubmissionStatus == 4) {
                    vueData.userAnswersSubmitted = JSON.parse(response.data[1][0]?.SubmissionContent || '{}')?.answers || {}
                }
            } else {
                console.error("API getAssignmentDetail không trả về dữ liệu hợp lệ.");
                Vue.$toast.error("Không thể tải được dữ liệu bài tập.", { position: "top" });
            }
            vueData.keyComp++
        });
    } else {
        ajaxCALL("lms/EL_Student_GetAssignmentDetail", {
            AssignToClassID: parseInt(AssignToClassID),
            LanNop: vueData.LanNop ?? 1
            //HocSinhID: vueData.HocSinhID
        }, async function (response) {
            if (response && response.data && response.data.length > 0 && response.data[0].length > 0) {
                vueData.assignmentData = response.data;
                if (vueData.Is_Resubmit == 1) {
                    vueData.assignmentData[1] = []
                }
                vueData.monHocName = response.data[0]?.[0]?.MonHocName || '';
                vueData.assignmentInfo = response.data[0] ?? {}
                vueData.submitionInfo = response.data[1][0] ?? {}
                const config = vueData.assignmentData[0][0];
                config.groups = JSON.parse(config.AssignmentConfig).groups || [];
                //Xử lí đảo câu hỏi, đáp án
                if (config.Is_Shuffle == 0 || !vueData.submitionInfo?.SubmissionContent) {
                    config.groups.forEach((group) => {
                        if (group.advancedFeatures && group.advancedFeatures.isShuffleQuestions) {
                            group.questions = _.shuffle(group.questions)
                        }
                        if (group.advancedFeatures && group.advancedFeatures.isShuffleAnswers) {
                            group.questions.filter(q => q.type.includes('QUIZ_')).forEach(q => {
                                if (q.type == 'QUIZ_SINGLE_CHOICE') {
                                    q.config.options = _.shuffle(q.config.options)
                                }
                                else if (q.type == 'QUIZ_TRUE_FALSE') {
                                }
                                else if (q.type == 'QUIZ_MULTIPLE_TRUE_FALSE') {
                                    q.config.options = _.shuffle(q.config.options)
                                }
                                else if (q.type == 'QUIZ_FILL_IN_BLANK') {
                                }
                                else if (q.type == 'QUIZ_MATCHING') {
                                    q.config.columnA = _.shuffle(q.config.columnA)
                                    q.config.columnB = _.shuffle(q.config.columnB)
                                }
                                else if (q.type == 'QUIZ_MULTIPLE_CHOICE') {
                                    q.config.options = _.shuffle(q.config.options)
                                }
                            })
                        }
                    })
                    vueData.AssignmentConfigAfterShuffle = { ...JSON.parse(config.AssignmentConfig), groups: config.groups }
                }
                if (vueData.Is_Resubmit == 1) {
                    insertSubmissionForResubmit()
                }
                //Xử lí mapping đáp án cho bài đã chấm điểm
                if (vueData.submitionInfo?.SubmissionID && vueData.submitionInfo?.SubmissionStatus == 4) {
                    let config_After_Mapping = await handleMapingAnswer_For_Graded(JSON.parse(config.AssignmentConfig_HadAnswer), JSON.parse(config.AssignmentConfig))
                    config.groups = config_After_Mapping
                }
                // vueData.dataReady = true;
                if (response.data[1][0]?.SubmissionStatus == 4) {
                    vueData.userAnswersSubmitted = JSON.parse(response.data[1][0]?.SubmissionContent || '{}')?.answers || {}
                }
            } else {
                console.error("API getAssignmentDetail không trả về dữ liệu hợp lệ.");
                Vue.$toast.error("Không thể tải được dữ liệu bài tập.", { position: "top" });
            }
            vueData.keyComp++
        });
    }
}
async function saveDraft(payload) {
    return new Promise(resolve => {
        if (vueData.Is_Resubmit == 1) {
            return resolve(null)
        }
        console.log('payload', payload)
        if (vueData.Is_SendToClass == 'false') {
            ajaxCALL("lms/EL_Student_SaveSubmission_AssignToStudent", { ...payload, Is_Resubmit: vueData.Is_Resubmit ?? 0, AssignToStudentID: parseInt(urlParams.get('AssignToClassID')) }, function (response) {
                vueData.assignmentData = response.data;
                if (response.data[1][0]?.SubmissionStatus == 4) {
                    vueData.userAnswersSubmitted = JSON.parse(response.data[1][0]?.SubmissionContent || '{}')?.answers || {}
                }
                if (response.data[0][0].Is_Shuffle != 1) {
                    ajaxCALL('/lms/EL_Student_Save_AssignmentConfig', {
                        SubmissionID: response.data[1][0]?.SubmissionID,
                        AssignmentConfig: JSON.stringify(vueData.AssignmentConfigAfterShuffle)
                    }, res => {
                        initPage()
                    })
                }
                resolve(response.data)
            });
        }
        else {
            ajaxCALL("lms/EL_Student_SaveSubmission", { ...payload, Is_Resubmit: vueData.Is_Resubmit ?? 0 }, function (response) {
                vueData.assignmentData = response.data;
                if (response.data[1][0]?.SubmissionStatus == 4) {
                    vueData.userAnswersSubmitted = JSON.parse(response.data[1][0]?.SubmissionContent || '{}')?.answers || {}
                }
                if (response.data[0][0].Is_Shuffle != 1) {
                    ajaxCALL('/lms/EL_Student_Save_AssignmentConfig', {
                        SubmissionID: response.data[1][0]?.SubmissionID,
                        AssignmentConfig: JSON.stringify(vueData.AssignmentConfigAfterShuffle)
                    }, res => {
                        initPage()
                    })
                }
                resolve(response.data)
            });
        }
    })
}
function submitAssignment(payload) {
    if (vueData.Is_SendToClass == 'false') {
        ajaxCALL("lms/EL_Student_SaveSubmission_AssignToStudent", { ...payload, Is_Resubmit: vueData.Is_Resubmit, AssignToStudentID: parseInt(urlParams.get('AssignToClassID')) }, function (response) {
            Vue.$toast.success("Nộp bài thành công!", { position: "top" });
            initPage()
        }, function (error) {
            Vue.$toast.error("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.", { position: "top" });
        });
    } else {
        ajaxCALL("lms/EL_Student_SaveSubmission", { ...payload, Is_Resubmit: vueData.Is_Resubmit }, function (response) {
            Vue.$toast.success("Nộp bài thành công!", { position: "top" });
            initPage()
        }, function (error) {
            Vue.$toast.error("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.", { position: "top" });
        });
    }
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
function handleMapingAnswer_For_Graded(asmConfig, asmConfigNoAnswer) {
    const groups_asmConfig = asmConfig.groups;
    const flatGroups_asmConfig = groups_asmConfig.map(g => g.questions).flat();
    // ✅ clone sâu toàn bộ groups để không làm thay đổi bản gốc
    const groups_asmConfigNoAnswer = _.cloneDeep(asmConfigNoAnswer.groups);
    const flatGroups_asmConfigNoAnswer = groups_asmConfigNoAnswer.map(g => g.questions).flat();
    const AnsweredQuestions = [];
    flatGroups_asmConfig.forEach(questionWithAnswer => {
        const questionNoAnswer = flatGroups_asmConfigNoAnswer.find(q => q.id === questionWithAnswer.id);
        if (!questionNoAnswer) return;
        switch (questionWithAnswer.type) {
            case 'QUIZ_SINGLE_CHOICE':
                questionNoAnswer.config.correctAnswer = _.cloneDeep(questionWithAnswer.config.correctAnswer);
                break;
            case 'QUIZ_MULTIPLE_CHOICE':
                questionNoAnswer.config.correctAnswers = _.cloneDeep(questionWithAnswer.config.correctAnswers);
                break;
            case 'QUIZ_TRUE_FALSE':
                questionNoAnswer.config.correctAnswer = _.cloneDeep(questionWithAnswer.config.correctAnswer);
                break;
            case 'QUIZ_MULTIPLE_TRUE_FALSE':
                questionNoAnswer.config.options = _.cloneDeep(questionWithAnswer.config.options);
                break;
            case 'QUIZ_FILL_IN_BLANK':
                questionNoAnswer.config.parts = _.cloneDeep(questionWithAnswer.config.parts);
                break;
            case 'QUIZ_MATCHING':
                questionNoAnswer.config.columnA = _.cloneDeep(questionWithAnswer.config.columnA);
                questionNoAnswer.config.columnB = _.cloneDeep(questionWithAnswer.config.columnB);
                questionNoAnswer.config.correctPairs = _.cloneDeep(questionWithAnswer.config.correctPairs);
                break;
        }
        AnsweredQuestions.push(questionNoAnswer);
    });
    // ✅ đảm bảo giữ nguyên question chưa có đáp án
    groups_asmConfigNoAnswer.forEach(group => {
        group.questions = group.questions.map(question => {
            const answered = AnsweredQuestions.find(q => q && q.id === question.id);
            return answered ? answered : question;
        });
    });
    return groups_asmConfigNoAnswer
}
function insertSubmissionForResubmit() {
    if (vueData.Is_SendToClass == 'false') {
    } else {
        const payload = {
            AssignToClassID: vueData.assignmentData[0][0].AssignToClassID,
            SubmissionContent: JSON.stringify({ answers: {} }),
            SubmissionStatus: 1,
            // HocSinhID: vueData.HocSinhDetail.HocSinhID,
        }
        ajaxCALL("lms/EL_Student_InsertSubmission", payload, function (response) {
            urlParams.delete('Is_Resubmit');
            urlParams.set('LanNop', response.data[1][0].LanNop.toString());
            initPage()
        })
    }
}
async function InsertDurationTime(submitionInfo) {
    if (![2, 3, 4].includes(submitionInfo.SubmissionStatus)) {
        const response = await fetch(vueData.v_Set.apiDomain + 'lms/EL_Student_UpdateDurationTime', {
            method: 'POST',
            headers: {
                Authorization: $awt,
                'Content-Type': 'application/json', // Indicate the body content type
            },
            body: JSON.stringify({ SubmissionID: submitionInfo.SubmissionID }), // Convert the JavaScript object to a JSON string
        });
        const result = await response.json();
        console.log('Success:', result);
    }
}
function InsertAccessTime(submitionInfo) {
    if (![2, 3, 4].includes(submitionInfo.SubmissionStatus)) {
        ajaxCALL("lms/EL_Student_UpdateAccessTime", {
            SubmissionID: submitionInfo.SubmissionID
        }, res => {
        })
    }
}
vueData.initPage = initPage;
vueData.saveDraft = saveDraft;
vueData.openSubmitDialog = openSubmitDialog;
vueData.submitAssignmentFinal = submitAssignmentFinal;
vueData.renderQuestionNotSubmit = renderQuestionNotSubmit
_