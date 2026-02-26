// ===========================
// CONSTANTS & UTILITIES
// ===========================
const urlParams = new URLSearchParams(window.location.search);
const SUBMISSION_STATUS = {
    DRAFT: 1,
    SUBMITTED: 2,
    IN_REVIEW: 3,
    GRADED: 4
};
const QUIZ_TYPES = {
    SINGLE_CHOICE: 'QUIZ_SINGLE_CHOICE',
    MULTIPLE_CHOICE: 'QUIZ_MULTIPLE_CHOICE',
    TRUE_FALSE: 'QUIZ_TRUE_FALSE',
    MULTIPLE_TRUE_FALSE: 'QUIZ_MULTIPLE_TRUE_FALSE',
    FILL_IN_BLANK: 'QUIZ_FILL_IN_BLANK',
    MATCHING: 'QUIZ_MATCHING'
};
// ===========================
// INITIALIZATION
// ===========================
function initPage() {
    initializeParams();
    const { AssignToClassID, AssignToStudentID } = getAssignmentIDs();
    if (!validateAssignmentIDs(AssignToClassID, AssignToStudentID)) {
        return;
    }
    loadAssignmentData(AssignToClassID);
}
function initializeParams() {
    vueData.LanNop = urlParams.get('LanNop') ? parseInt(urlParams.get('LanNop')) : 1;
    vueData.Is_Resubmit = urlParams.get('Is_Resubmit') === '1' ? 1 : 0;
}
function getAssignmentIDs() {
    return {
        AssignToClassID: urlParams.get('AssignToClassID'),
        AssignToStudentID: urlParams.get('AssignToStudentID')
    };
}
function validateAssignmentIDs(classID, studentID) {
    if (!classID && !studentID) {
        Vue.$toast.error("Không tìm thấy ID bài tập trên URL.", { position: "top" });
        vueData.dataReady = true;
        return false;
    }
    return true;
}
// ===========================
// DATA LOADING
// ===========================
function loadAssignmentData(AssignToClassID) {
    const endpoint = vueData.Is_SendToClass === 'false'
        ? "lms/EL_Student_GetAssignmentDetail_AssignToStudent"
        : "lms/EL_Student_GetAssignmentDetail";
    const params = {
        [vueData.Is_SendToClass === 'false' ? 'AssignToStudentID' : 'AssignToClassID']: parseInt(AssignToClassID),
        LanNop: vueData.LanNop ?? 1
    };
    ajaxCALL(endpoint, params, async (response) => {
        await processAssignmentResponse(response);
        vueData.keyComp++;
    });
}
async function processAssignmentResponse(response) {
    if (!isValidResponse(response)) {
        handleInvalidResponse();
        return;
    }
    setAssignmentData(response);
    const config = vueData.assignmentData[0][0];
    config.groups = JSON.parse(config.AssignmentConfig).groups || [];
    await processAssignmentConfig(config);
    if (vueData.Is_Resubmit === 1) {
        insertSubmissionForResubmit();
    }
    loadSubmittedAnswers(response);
}
function isValidResponse(response) {
    return response?.data?.length > 0 && response.data[0]?.length > 0;
}
function handleInvalidResponse() {
    console.error("API getAssignmentDetail không trả về dữ liệu hợp lệ.");
    Vue.$toast.error("Không thể tải được dữ liệu bài tập.", { position: "top" });
}
function setAssignmentData(response) {
    vueData.assignmentData = response.data;
    if (vueData.Is_Resubmit === 1) {
        vueData.assignmentData[1] = [];
    }
    vueData.monHocName = response.data[0]?.[0]?.MonHocName || '';
    vueData.assignmentInfo = response.data[0] ?? {};
    vueData.submitionInfo = response.data[1][0] ?? {};
}
// ===========================
// QUESTION SHUFFLING
// ===========================
async function processAssignmentConfig(config) {
    const shouldShuffle = config.Is_Shuffle === 0 || !hasSubmission();
    if (shouldShuffle) {
        shuffleQuestionsAndAnswers(config);
    }
    if (isGradedSubmission()) {
        await mapAnswersForGradedAssignment(config);
    }
}
function hasSubmission() {
    return vueData.Is_SendToClass === 'false'
        ? vueData.submitionInfo?.SubmissionID
        : vueData.submitionInfo?.SubmissionContent;
}
function shuffleQuestionsAndAnswers(config) {
    config.groups.forEach(group => {
        if (group.advancedFeatures?.isShuffleQuestions) {
            group.questions = _.shuffle(group.questions);
        }
        if (group.advancedFeatures?.isShuffleAnswers) {
            shuffleQuizAnswers(group.questions);
        }
    });
    vueData.AssignmentConfigAfterShuffle = {
        ...JSON.parse(config.AssignmentConfig),
        groups: config.groups
    };
}
function shuffleQuizAnswers(questions) {
    questions
        .filter(q => q.type.includes('QUIZ_'))
        .forEach(question => {
            const { type, config } = question;
            switch (type) {
                case QUIZ_TYPES.SINGLE_CHOICE:
                case QUIZ_TYPES.MULTIPLE_CHOICE:
                case QUIZ_TYPES.MULTIPLE_TRUE_FALSE:
                    config.options = _.shuffle(config.options);
                    break;
                case QUIZ_TYPES.MATCHING:
                    config.columnA = _.shuffle(config.columnA);
                    config.columnB = _.shuffle(config.columnB);
                    break;
                // TRUE_FALSE and FILL_IN_BLANK don't need shuffling
            }
        });
}
// ===========================
// ANSWER MAPPING
// ===========================
function isGradedSubmission() {
    return vueData.submitionInfo?.SubmissionID &&
        vueData.submitionInfo?.SubmissionStatus === SUBMISSION_STATUS.GRADED;
}
async function mapAnswersForGradedAssignment(config) {
    const configWithAnswers = JSON.parse(config.AssignmentConfig_HadAnswer);
    const configNoAnswers = JSON.parse(config.AssignmentConfig);
    const mappedGroups = await handleMapingAnswer_For_Graded(configWithAnswers, configNoAnswers);
    config.groups = mappedGroups;
}
function handleMapingAnswer_For_Graded(asmConfig, asmConfigNoAnswer) {
    const flatQuestionsWithAnswers = asmConfig.groups.flatMap(g => g.questions);
    const groupsNoAnswer = _.cloneDeep(asmConfigNoAnswer.groups);
    const flatQuestionsNoAnswer = groupsNoAnswer.flatMap(g => g.questions);
    const answeredQuestions = flatQuestionsWithAnswers.map(questionWithAnswer => {
        const questionNoAnswer = flatQuestionsNoAnswer.find(q => q.id === questionWithAnswer.id);
        if (!questionNoAnswer) return null;
        copyCorrectAnswers(questionWithAnswer, questionNoAnswer);
        return questionNoAnswer;
    }).filter(Boolean);
    // Merge answered questions back into groups
    groupsNoAnswer.forEach(group => {
        group.questions = group.questions.map(question => {
            const answered = answeredQuestions.find(q => q.id === question.id);
            return answered || question;
        });
    });
    return groupsNoAnswer;
}
function copyCorrectAnswers(source, target) {
    const { type, config: sourceConfig } = source;
    const targetConfig = target.config;
    switch (type) {
        case QUIZ_TYPES.SINGLE_CHOICE:
        case QUIZ_TYPES.TRUE_FALSE:
            targetConfig.correctAnswer = _.cloneDeep(sourceConfig.correctAnswer);
            break;
        case QUIZ_TYPES.MULTIPLE_CHOICE:
            targetConfig.correctAnswers = _.cloneDeep(sourceConfig.correctAnswers);
            break;
        case QUIZ_TYPES.MULTIPLE_TRUE_FALSE:
            targetConfig.options = _.cloneDeep(sourceConfig.options);
            break;
        case QUIZ_TYPES.FILL_IN_BLANK:
            targetConfig.parts = _.cloneDeep(sourceConfig.parts);
            break;
        case QUIZ_TYPES.MATCHING:
            targetConfig.columnA = _.cloneDeep(sourceConfig.columnA);
            targetConfig.columnB = _.cloneDeep(sourceConfig.columnB);
            targetConfig.correctPairs = _.cloneDeep(sourceConfig.correctPairs);
            break;
    }
}
function loadSubmittedAnswers(response) {
    if (response.data[1][0]?.SubmissionStatus === SUBMISSION_STATUS.GRADED) {
        const submissionContent = JSON.parse(response.data[1][0]?.SubmissionContent || '{}');
        vueData.userAnswersSubmitted = submissionContent.answers || {};
    }
}
// ===========================
// SUBMISSION HANDLING
// ===========================
async function saveDraft(payload) {
    if (vueData.Is_Resubmit === 1) {
        return Promise.resolve(null);
    }
    console.log('payload', payload);
    const endpoint = vueData.Is_SendToClass === 'false'
        ? "lms/EL_Student_SaveSubmission_AssignToStudent"
        : "lms/EL_Student_SaveSubmission";
    const params = vueData.Is_SendToClass === 'false'
        ? { ...payload, Is_Resubmit: vueData.Is_Resubmit ?? 0, AssignToStudentID: parseInt(urlParams.get('AssignToClassID')) }
        : { ...payload, Is_Resubmit: vueData.Is_Resubmit ?? 0 };
    return new Promise(resolve => {
        ajaxCALL(endpoint, params, async (response) => {
            await handleSaveResponse(response);
            resolve(response.data);
        });
    });
}
async function handleSaveResponse(response) {
    vueData.assignmentData = response.data;
    loadSubmittedAnswers(response);
    if (response.data[0][0].Is_Shuffle !== 1) {
        await saveAssignmentConfig(response.data[1][0]?.SubmissionID);
    }
}
function saveAssignmentConfig(submissionID) {
    return new Promise(resolve => {
        ajaxCALL('/lms/EL_Student_Save_AssignmentConfig', {
            SubmissionID: submissionID,
            AssignmentConfig: JSON.stringify(vueData.AssignmentConfigAfterShuffle)
        }, res => {
            initPage();
            resolve(res);
        });
    });
}
function submitAssignment(payload) {
    const endpoint = vueData.Is_SendToClass === 'false'
        ? "lms/EL_Student_SaveSubmission_AssignToStudent"
        : "lms/EL_Student_SaveSubmission";
    const params = vueData.Is_SendToClass === 'false'
        ? { ...payload, Is_Resubmit: vueData.Is_Resubmit, AssignToStudentID: parseInt(urlParams.get('AssignToClassID')) }
        : { ...payload, Is_Resubmit: vueData.Is_Resubmit };
    ajaxCALL(endpoint, params,
        () => {
            Vue.$toast.success("Nộp bài thành công!", { position: "top" });
            initPage();
        },
        () => {
            Vue.$toast.error("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.", { position: "top" });
        }
    );
}
function openSubmitDialog() {
    vueData.confirmSubmitDialog = true;
}
function submitAssignmentFinal() {
    vueData.confirmSubmitDialog = false;
    const payload = {
        AssignToClassID: vueData.assignmentData[0][0].AssignToClassID,
        SubmissionContent: JSON.stringify({ answers: vueData.puseranswers }),
        SubmissionStatus: SUBMISSION_STATUS.SUBMITTED,
        HocSinhID: vueData.HocSinhDetail.HocSinhID
    };
    submitAssignment(payload);
}
// ===========================
// RESUBMISSION
// ===========================
function insertSubmissionForResubmit() {
    if (vueData.Is_SendToClass === 'false') {
        return;
    }
    const payload = {
        AssignToClassID: vueData.assignmentData[0][0].AssignToClassID,
        SubmissionContent: JSON.stringify({ answers: {} }),
        SubmissionStatus: SUBMISSION_STATUS.DRAFT
    };
    ajaxCALL("lms/EL_Student_InsertSubmission", payload, (response) => {
        urlParams.delete('Is_Resubmit');
        urlParams.set('LanNop', response.data[1][0].LanNop.toString());
        initPage();
    });
}
// ===========================
// QUESTION TRACKING
// ===========================
function renderQuestionNotSubmit() {
    const asmConfig = JSON.parse(vueData.assignmentData[0][0]?.AssignmentConfig);
    const allQuestions = asmConfig.groups.flatMap(g => g.questions);
    const unansweredQuestions = allQuestions
        .map((question, index) => ({
            question,
            index: index + 1
        }))
        .filter(({ question }) => vueData.puseranswers[question.id]?.answerData === null)
        .map(({ index }) => `Câu ${index}`);
    return unansweredQuestions.join(', ');
}
// ===========================
// TIME TRACKING
// ===========================
async function InsertDurationTime(submitionInfo) {
    if (isActiveSubmission(submitionInfo.SubmissionStatus)) {
        //Sử dụng fetch để tránh loading global
        await fetch('lms/EL_Student_UpdateDurationTime', {
            method: 'POST',
            headers: {
                Authorization: $awt,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ SubmissionID: submitionInfo.SubmissionID })
        });
    }
}
function InsertAccessTime(submitionInfo) {
    if (isActiveSubmission(submitionInfo.SubmissionStatus)) {
        ajaxCALL("lms/EL_Student_UpdateAccessTime", {
            SubmissionID: submitionInfo.SubmissionID
        }, () => { });
    }
}
function isActiveSubmission(status) {
    return ![SUBMISSION_STATUS.SUBMITTED, SUBMISSION_STATUS.IN_REVIEW, SUBMISSION_STATUS.GRADED].includes(status);
}
// ===========================
// EXPORTS
// ===========================
vueData.initPage = initPage;
vueData.saveDraft = saveDraft;
vueData.openSubmitDialog = openSubmitDialog;
vueData.submitAssignmentFinal = submitAssignmentFinal;
vueData.renderQuestionNotSubmit = renderQuestionNotSubmit;
/* Mixins*/
function useQuestionNavigation() {
    return {
        methods: {
            getGlobalQuestionNumber(groupIndex, questionIndex) {
                if (!this.assignment?.groups) return 1;
                let number = 1;
                for (let i = 0; i < groupIndex; i++) {
                    number += this.assignment.groups[i].questions.length;
                }
                return number + questionIndex;
            },
            getGlobalQuestionNumberByQuestionId(questionId) {
                if (!this.allQuestions) return 0;
                const index = this.allQuestions.findIndex(q => q.id === questionId);
                return index + 1;
            },
            navigateToQuestion(groupIndex, questionIndexInGroup, id) {
                if (this.viewMode === 'all') {
                    const element = document.getElementById(id);
                    if (element) {
                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    } else {
                        console.warn(`Element with id ${id} not found`);
                    }
                }
                this.currentGroupIndex = groupIndex;
                this.currentQuestionIndexInGroup = questionIndexInGroup;
                if (this.groupCollapsed[groupIndex]) {
                    this.toggleGroupCollapse(groupIndex);
                }
            },
            prevQuestion() {
                if (this.currentQuestionIndexInGroup > 0) {
                    this.currentQuestionIndexInGroup--;
                } else if (this.currentGroupIndex > 0) {
                    this.currentGroupIndex--;
                    this.currentQuestionIndexInGroup =
                        this.assignment.groups[this.currentGroupIndex].questions.length - 1;
                }
            },
            nextQuestion() {
                if (!this.assignment?.groups) return;
                const currentGroup = this.assignment.groups[this.currentGroupIndex];
                if (!currentGroup) return;
                if (this.currentQuestionIndexInGroup < currentGroup.questions.length - 1) {
                    this.currentQuestionIndexInGroup++;
                } else if (this.currentGroupIndex < this.assignment.groups.length - 1) {
                    this.currentGroupIndex++;
                    this.currentQuestionIndexInGroup = 0;
                }
            }
        },
        computed: {
            allQuestions() {
                return this.assignment?.groups?.flatMap(g => g.questions) || [];
            },
            totalQuestions() {
                if (!this.assignment?.groups) return 0;
                return this.assignment.groups.reduce((total, group) => total + group.questions.length, 0);
            },
            currentGroup() {
                return this.assignment?.groups?.[this.currentGroupIndex];
            },
            currentQuestion() {
                return this.currentGroup?.questions?.[this.currentQuestionIndexInGroup];
            },
            globalQuestionNumber() {
                if (!this.assignment?.groups) return 1;
                return this.getGlobalQuestionNumber(this.currentGroupIndex, this.currentQuestionIndexInGroup);
            }
        }
    };
}
function useAnswerTracking() {
    return {
        methods: {
            isAnswered(questionId) {
                const answer = this.userAnswers[questionId]?.answerData;
                if (answer === null || answer === undefined) return false;
                if (typeof answer === 'string' && answer.trim() === '') return false;
                if (Array.isArray(answer) && answer.length === 0) return false;
                if (typeof answer === 'object' && !Array.isArray(answer) && Object.keys(answer).length === 0) return false;
                return true;
            },
            getGroupAnsweredCount(group) {
                if (!group?.questions) return 0;
                return group.questions.filter(q => this.isAnswered(q.id)).length;
            }
        },
        computed: {
            answeredCount() {
                return this.allQuestions.filter(q => this.isAnswered(q.id)).length;
            },
            progressPercent() {
                if (!this.totalQuestions) return 0;
                return (this.answeredCount / this.totalQuestions) * 100;
            }
        }
    };
}
function useAutoSave() {
    return {
        data() {
            return {
                saveStatus: 'Đã lưu',
                saveStatusColor: 'grey',
                saveStatusIcon: 'mdi-cloud-check-outline',
                isSaving: false,
                autoSaveTimer: null,
                lastSaveTime: 0,
                MIN_SAVE_INTERVAL: 2000 // Tối thiểu 2s giữa các lần save
            };
        },
        methods: {
            triggerAutoSave() {
                this.saveStatus = 'Đang soạn...';
                this.saveStatusColor = 'orange';
                this.saveStatusIcon = 'mdi-pencil-outline';
                if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
                // Debounce 1s - chỉ save sau khi user ngừng typing 1s
                this.autoSaveTimer = setTimeout(() => {
                    this.saveDraft();
                }, 1000);
            },
            async saveDraft() {
                if (this.isSaving || this.isSubmitted) return;
                if (!this.assignment?.AssignToClassID && !this.assignment?.AssignToStudentID) return;
                // Throttle - tránh save quá nhiều lần trong thời gian ngắn
                const now = Date.now();
                if (now - this.lastSaveTime < this.MIN_SAVE_INTERVAL) {
                    // Reschedule
                    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
                    this.autoSaveTimer = setTimeout(() => {
                        this.saveDraft();
                    }, this.MIN_SAVE_INTERVAL - (now - this.lastSaveTime));
                    return;
                }
                this.isSaving = true;
                this.lastSaveTime = now;
                this.saveStatus = 'Đang lưu...';
                this.saveStatusColor = 'blue';
                this.saveStatusIcon = 'mdi-cloud-upload-outline';
                const payload = {
                    AssignToClassID: this.assignment?.AssignToClassID ?? this.assignment?.AssignToStudentID,
                    SubmissionContent: JSON.stringify({ answers: this.userAnswers }),
                    SubmissionStatus: 1,
                    HocSinhID: vueData.HocSinhDetail.HocSinhID
                };
                try {
                    await this.onSaveDraft(payload);
                    this.saveStatus = 'Đã lưu';
                    this.saveStatusColor = 'grey';
                    this.saveStatusIcon = 'mdi-cloud-check-outline';
                } catch (error) {
                    console.error('Lỗi lưu bài:', error);
                    this.saveStatus = 'Lỗi lưu';
                    this.saveStatusColor = 'error';
                    this.saveStatusIcon = 'mdi-cloud-alert';
                    // Retry sau 3s nếu lỗi
                    setTimeout(() => {
                        this.saveDraft();
                    }, 3000);
                } finally {
                    this.isSaving = false;
                }
            }
        }
    };
}
function useQuestionStatus() {
    return {
        methods: {
            getQuestionScore(questionId) {
                const g = vueData.userAnswersSubmitted?.[questionId]?.grading;
                if (!g) return null;
                let s = 0;
                let has = false;
                if (typeof g.autoScore === 'number') { s += g.autoScore; has = true; }
                if (typeof g.manualScore === 'number') { s += g.manualScore; has = true; }
                return has ? s : null;
            },
            questionStatus(questionId, maxPoint) {
                const answered = this.isAnswered(questionId);
                if (!this.isSubmitted) {
                    return answered
                        ? { label: 'Đã TL', color: 'primary', variant: 'tonal' }
                        : { label: 'Chưa TL', color: 'grey', variant: 'tonal' };
                }
                if (!this.isGraded) return { label: 'Chờ chấm', color: 'grey', variant: 'tonal' };
                if (!answered) return { label: 'Chưa TL', color: 'grey', variant: 'tonal' };
                const s = this.getQuestionScore(questionId);
                if (s === null) return { label: 'Chờ chấm', color: 'grey', variant: 'tonal' };
                if (s <= 0) return { label: 'Sai', color: 'error', variant: 'tonal' };
                if (s >= (maxPoint ?? 0)) return { label: 'Đúng', color: 'success', variant: 'tonal' };
                return { label: 'Một phần', color: 'warning', variant: 'tonal' };
            },
            getQuestionStatusIcon(questionId) {
                if (this.isGraded) {
                    const question = this.allQuestions.find(q => q.id === questionId);
                    const grading = vueData.userAnswersSubmitted?.[questionId]?.grading;
                    if (!grading || !question) return 'mdi-help-circle-outline';
                    if (grading.isCorrect === true || grading.manualScore === question.points) {
                        return 'mdi-check-circle';
                    }
                    if (grading.manualScore < question.points && grading.manualScore > 0) {
                        return 'mdi-minus-circle-outline';
                    }
                    return 'mdi-close-circle';
                }
                return this.isAnswered(questionId) ? 'mdi-pencil-circle' : 'mdi-help-box-outline';
            },
            getIconColor(questionId) {
                if (this.isGraded) {
                    const question = this.allQuestions.find(q => q.id === questionId);
                    const grading = vueData.userAnswersSubmitted?.[questionId]?.grading;
                    if (!grading || !question) return 'grey';
                    if (grading.isCorrect === true || grading.manualScore === question.points) {
                        return 'green';
                    }
                    if (grading.manualScore < question.points && grading.manualScore > 0) {
                        return 'warning';
                    }
                    return 'red';
                }
                return this.isAnswered(questionId) ? 'blue' : 'grey';
            }
        }
    };
}
function useCopyPasteBlocker() {
    return {
        methods: {
            blockCopyPaste(e) {
                if (!this.isSubmitted) {
                    // Bỏ qua nếu đang trong quá trình compose (gõ tiếng Việt)
                    if (e.isComposing || e.keyCode === 229) return;
                    const target = e.target;
                    if (target.tagName === 'INPUT' ||
                        target.tagName === 'TEXTAREA' ||
                        target.isContentEditable) {
                        // Kiểm tra thêm flag từ IME nếu có
                        if (target._isComposing) return;
                        e.preventDefault();
                        e.stopPropagation();
                        if (Vue.$toast) {
                            Vue.$toast.warning('Không được phép sao chép/dán nội dung trong bài thi này', { position: "top" });
                        }
                    }
                }
            },
            blockContextMenu(e) {
                if (!this.isSubmitted) {
                    const target = e.target;
                    if (target.tagName === 'INPUT' ||
                        target.tagName === 'TEXTAREA' ||
                        target.isContentEditable) {
                        e.preventDefault();
                    }
                }
            },
            blockKeyboardShortcuts(e) {
                if (!this.isSubmitted) {
                    // Đang compose IME (Telex/VNI)
                    if (e.isComposing || e.keyCode === 229) return;
                    const target = e.target;
                    if (!target || !(
                        target.tagName === 'INPUT' ||
                        target.tagName === 'TEXTAREA' ||
                        target.isContentEditable
                    )) return;
                    if (target._isComposing) return;
                    // ✅ FIX CHÍNH: Chỉ xử lý khi có Ctrl/Cmd thật sự
                    // Nếu không có Ctrl/Cmd thì bỏ qua toàn bộ — bao gồm ký tự '·' của VNI
                    if (!e.ctrlKey && !e.metaKey) return;
                    if (e.key && ['c', 'x', 'v'].includes(e.key.toLowerCase())) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (Vue.$toast) {
                            Vue.$toast.warning(
                                'Không được phép sử dụng phím tắt sao chép/dán',
                                { position: "top" }
                            );
                        }
                    }
                }
            },
            // Thêm vào methods trong useCopyPasteBlocker
            handleCompositionStart(e) {
                if (e.target) e.target._isComposing = true;
            },
            handleCompositionEnd(e) {
                if (e.target) {
                    // Delay nhỏ vì compositionend fire trước keyup ở một số IME
                    setTimeout(() => {
                        if (e.target) e.target._isComposing = false;
                    }, 50);
                }
            },
            addCopyPasteBlocker() {
                document.addEventListener('copy', this.blockCopyPaste);
                document.addEventListener('cut', this.blockCopyPaste);
                document.addEventListener('paste', this.blockCopyPaste);
                document.addEventListener('contextmenu', this.blockContextMenu);
                document.addEventListener('keydown', this.blockKeyboardShortcuts);
                // Thêm 2 dòng này để track VNI / Telex
                document.addEventListener('compositionstart', this.handleCompositionStart);
                document.addEventListener('compositionend', this.handleCompositionEnd);
            },
            removeCopyPasteBlocker() {
                document.removeEventListener('copy', this.blockCopyPaste);
                document.removeEventListener('cut', this.blockCopyPaste);
                document.removeEventListener('paste', this.blockCopyPaste);
                document.removeEventListener('contextmenu', this.blockContextMenu);
                document.removeEventListener('keydown', this.blockKeyboardShortcuts);
                // Thêm 2 dòng này
                document.removeEventListener('compositionstart', this.handleCompositionStart);
                document.removeEventListener('compositionend', this.handleCompositionEnd);
            }
        }
    };
}