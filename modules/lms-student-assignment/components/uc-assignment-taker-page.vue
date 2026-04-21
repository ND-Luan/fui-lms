<template>
    <div>
        <!-- Loading State -->
        <div v-if="!dataReady" class="page-loading">
            <div class="loader-ring">
                <v-progress-circular indeterminate size="52" width="3" color="primary" />
            </div>
            <p class="loading-label">Đang tải dữ liệu học sinh...</p>
        </div>

        <!-- Thông báo tính năng mới: Đánh dấu câu hỏi (hiện trong 2 ngày) -->
        <v-alert
            v-if="showFlagFeatureAlert"
            type="info"
            variant="tonal"
            closable
            class="ma-2"
            @click:close="dismissFlagFeatureAlert"
        >
            <template #prepend>
                <v-icon>mdi-flag-variant</v-icon>
            </template>
            <strong>Tính năng mới:</strong> Bạn có thể <strong>đánh dấu câu hỏi</strong> bằng nút
            <v-icon size="16" color="red">mdi-flag-variant-outline</v-icon>
            để xem lại sau — kể cả sau khi đã nộp bài.
            Tất cả câu hỏi đã đánh dấu sẽ được tổng hợp tại trang <strong>Câu hỏi đã đánh dấu</strong> trong Trang chủ học sinh.
        </v-alert>

        <!-- Main Content -->
        <v-container v-if="dataReady" fluid class="pa-0">
            <v-row :no-gutters="true">
                <v-col cols="12">
                    <!-- Assignment Taker Component -->
                    <uc-assignment-taker-2 v-if="dataReady === true" :key="keyComp" ref="assignmentTaker" class="pa-0"
                        v-model:assignment-data="assignmentData" v-model:puseranswers="puseranswers"
                        :hocSinhDetail="HocSinhDetail" :mon-hoc-name="monHocName" :on-save-draft="saveDraft"
                        :on-save-flags-post-submit="saveFlagsPostSubmit"
                        :on-open-submit-dialog="openSubmitDialog" />
                    <v-dialog v-model="confirmSubmitDialog" max-width="420">
                        <v-card>
                            <v-alert type="warning" variant="tonal" rounded="0" class="mb-0"
                                icon="mdi-send-check-outline" title="Xác nhận nộp bài">
                                Bạn có chắc chắn muốn nộp bài không? Sau khi nộp, bạn sẽ
                                <strong>không thể chỉnh sửa</strong> bài làm của mình.
                            </v-alert>

                            <v-alert v-if="renderQuestionNotSubmit().length > 0"
                                type="error" variant="tonal" rounded="0" class="mb-0"
                                icon="mdi-alert-circle-outline">
                                Còn những câu
                                <strong>{{ renderQuestionNotSubmit() }}</strong>
                                chưa làm.
                            </v-alert>

                            <v-card-actions class="pa-3">
                                <v-spacer />
                                <v-btn variant="text" color="grey" @click="confirmSubmitDialog = false">
                                    <v-icon start>mdi-close</v-icon>Hủy
                                </v-btn>
                                <v-btn color="success" variant="flat" @click="submitAssignmentFinal()">
                                    <v-icon start>mdi-check-all</v-icon>Xác nhận Nộp
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
export default {
    name: 'AssignmentTakerPage',

    data() {
        const urlParams = new URLSearchParams(window.location.search);

        // Parse boolean ngay từ đầu, tránh so sánh string rải rác trong code
        // Is_SendToClass=0 hoặc Is_SendToClass=false → false; còn lại → true
        // Nếu Is_SendToClass không có trong URL, tự suy từ sự hiện diện của AssignToStudentID
        const _isSTC = urlParams.get('Is_SendToClass');
        const isSendToClass = _isSTC === null
            ? !urlParams.get('AssignToStudentID')
            : _isSTC !== '0' && _isSTC !== 'false';

        return {
            urlParams,
            SUBMISSION_STATUS: { DRAFT: 1, SUBMITTED: 2, IN_REVIEW: 3, GRADED: 4 },
            QUIZ_TYPES: {
                SINGLE_CHOICE: 'QUIZ_SINGLE_CHOICE',
                MULTIPLE_CHOICE: 'QUIZ_MULTIPLE_CHOICE',
                TRUE_FALSE: 'QUIZ_TRUE_FALSE',
                MULTIPLE_TRUE_FALSE: 'QUIZ_MULTIPLE_TRUE_FALSE',
                FILL_IN_BLANK: 'QUIZ_FILL_IN_BLANK',
                MATCHING: 'QUIZ_MATCHING'
            },
            HocSinhID: parseInt(urlParams.get('HocSinhID') || '0'),

            // Boolean thay vì string — dùng trực tiếp trong toàn bộ code
            isSendToClass,

            dataReady: false,
            assignmentData: [],
            monHocName: '',
            confirmSubmitDialog: false,
            puseranswers: {},
            NienKhoa: null,
            assignmentInfo: {},
            userAnswersSubmitted: {},
            submitionInfo: {},
            isRendered: false,
            keyComp: 0,
            Is_Resubmit: 0,
            LanNop: 1,
            HocSinhDetail: null,
            DSNienKhoa: [],
            AssignmentConfigAfterShuffle: null,

            // Guard flag — chặn loadAssignmentData chạy đồng thời
            _isLoadingAssignment: false,

            // Alert tính năng mới đánh dấu câu hỏi
            showFlagFeatureAlert: false,
        };
    },

    mounted() {
        this.callNienKhoa_Get();
        this._initFlagFeatureAlert();
    },

    methods: {

        // ===========================
        // SUBMIT DIALOG
        // ===========================

        openSubmitDialog() {
            this.confirmSubmitDialog = true;
        },

        // ===========================
        // INITIALIZATION
        // ===========================

        async callNienKhoa_Get() {
            try {
                const data = await fetchPromise('/lms/NienKhoa_Get', {});
                this.DSNienKhoa = data || [];
                const activeNK = this.DSNienKhoa.find(item => item.IsActive);
                this.NienKhoa = activeNK?.NienKhoa ?? null;
                await this.callHocSinh_Detail_GetBy_HocSinhID();
            } catch (err) {
                console.error('Lỗi NienKhoa_Get:', err);
            }
        },

        async callHocSinh_Detail_GetBy_HocSinhID() {
            try {
                const data = await fetchPromise('/lms/HocSinh_Detail_GetBy_HocSinhID', {
                    HocSinhID: this.HocSinhID,
                    NienKhoa: this.NienKhoa,
                });
                this.HocSinhDetail = data || null;
                this.dataReady = true;
                this.initPage();
            } catch (err) {
                console.error('Lỗi HocSinh_Detail_GetBy_HocSinhID:', err);
                this.dataReady = true;
            }
        },

        initPage() {
            this.initializeParams();
            const { AssignToClassID, AssignToStudentID } = this.getAssignmentIDs();
            if (!this.validateAssignmentIDs(AssignToClassID, AssignToStudentID)) return;
            this.loadAssignmentData(AssignToClassID, AssignToStudentID);
        },

        initializeParams() {
            this.LanNop = this.urlParams.get('LanNop')
                ? parseInt(this.urlParams.get('LanNop'))
                : 1;
            this.Is_Resubmit = this.urlParams.get('Is_Resubmit') === '1' ? 1 : 0;
        },

        getAssignmentIDs() {
            return {
                AssignToClassID: this.urlParams.get('AssignToClassID'),
                AssignToStudentID: this.urlParams.get('AssignToStudentID'),
            };
        },

        validateAssignmentIDs(classID, studentID) {
            if (!classID && !studentID) {
                Vue.$toast.error('Không tìm thấy ID bài tập trên URL.', { position: 'top' });
                this.dataReady = true;
                return false;
            }
            return true;
        },

        // ===========================
        // DATA LOADING
        // ===========================

        async loadAssignmentData(AssignToClassID, AssignToStudentID) {
            // Guard: chặn gọi đồng thời, tránh race condition
            if (this._isLoadingAssignment) return;
            this._isLoadingAssignment = true;

            try {
                const isSendToStudent = !this.isSendToClass;

                if (!isSendToStudent && !AssignToClassID) {
                    Vue.$toast.error('Không tìm thấy AssignToClassID bài tập trên URL.', { position: 'top' });
                    return;
                }
                if (isSendToStudent && !AssignToStudentID) {
                    Vue.$toast.error('Không tìm thấy AssignToStudentID bài tập trên URL.', { position: 'top' });
                    return;
                }

                const endpoint = isSendToStudent
                    ? 'lms/EL_Student_GetAssignmentDetail_AssignToStudent'
                    : 'lms/EL_Student_GetAssignmentDetail';

                // Tách rõ 2 case thay vì dùng computed key — tránh null khi key sai
                const params = isSendToStudent
                    ? {
                        AssignToStudentID: parseInt(AssignToStudentID),
                        HocSinhID: this.HocSinhDetail.HocSinhID,
                        LanNop: this.LanNop ?? 1,
                    }
                    : {
                        AssignToClassID: parseInt(AssignToClassID),
                        HocSinhID: this.HocSinhDetail.HocSinhID,
                        LanNop: this.LanNop ?? 1,
                    };

                const data = await fetchPromise(endpoint, params, { cache: false });
                await this.processAssignmentResponse({ data });
                this.keyComp++;
            } catch (err) {
                console.error('Lỗi loadAssignmentData:', err);
            } finally {
                // Luôn release guard dù thành công hay lỗi
                this._isLoadingAssignment = false;
            }
        },

        async processAssignmentResponse(response) {
            if (!this.isValidResponse(response)) {
                this.handleInvalidResponse();
                return;
            }
            this.setAssignmentData(response);
            const config = this.assignmentData[0][0];
            config.groups = JSON.parse(config.AssignmentConfig).groups || [];
            await this.processAssignmentConfig(config);
            if (this.Is_Resubmit === 1) {
                this.insertSubmissionForResubmit();
            }
            this.loadSubmittedAnswers(response);
        },

        isValidResponse(response) {
            return response?.data?.length > 0 && response.data[0]?.length > 0;
        },

        handleInvalidResponse() {
            console.error('API getAssignmentDetail không trả về dữ liệu hợp lệ.');
            Vue.$toast.error('Không thể tải được dữ liệu bài tập.', { position: 'top' });
        },

        setAssignmentData(response) {
            this.assignmentData = response.data;
            if (this.Is_Resubmit === 1) {
                this.assignmentData[1] = [];
            }
            this.monHocName = response.data[0]?.[0]?.MonHocName || '';
            this.assignmentInfo = response.data[0] ?? {};
            this.submitionInfo = response.data[1][0] ?? {};
        },

        // ===========================
        // QUESTION SHUFFLING
        // ===========================

        async processAssignmentConfig(config) {
            const shouldShuffle = config.Is_Shuffle === 0 || !this.hasSubmission();
            if (shouldShuffle) {
                this.shuffleQuestionsAndAnswers(config);
            }
            if (this.isGradedSubmission()) {
                await this.mapAnswersForGradedAssignment(config);
            }
        },

        hasSubmission() {
            return !this.isSendToClass
                ? this.submitionInfo?.SubmissionID
                : this.submitionInfo?.SubmissionContent;
        },

        shuffleQuestionsAndAnswers(config) {
            config.groups.forEach(group => {
                if (group.advancedFeatures?.isShuffleQuestions) {
                    group.questions = _.shuffle(group.questions);
                }
                if (group.advancedFeatures?.isShuffleAnswers) {
                    this.shuffleQuizAnswers(group.questions);
                }
            });
            this.AssignmentConfigAfterShuffle = {
                ...JSON.parse(config.AssignmentConfig),
                groups: config.groups,
            };
        },

        shuffleQuizAnswers(questions) {
            questions
                .filter(q => q.type.includes('QUIZ_'))
                .forEach(question => {
                    const { type, config } = question;
                    switch (type) {
                        case this.QUIZ_TYPES.SINGLE_CHOICE:
                        case this.QUIZ_TYPES.MULTIPLE_CHOICE:
                        case this.QUIZ_TYPES.MULTIPLE_TRUE_FALSE:
                            config.options = _.shuffle(config.options);
                            break;
                        case this.QUIZ_TYPES.MATCHING:
                            config.columnA = _.shuffle(config.columnA);
                            config.columnB = _.shuffle(config.columnB);
                            break;
                    }
                });
        },

        // ===========================
        // ANSWER MAPPING
        // ===========================

        isGradedSubmission() {
            return (
                this.submitionInfo?.SubmissionID &&
                this.submitionInfo?.SubmissionStatus === this.SUBMISSION_STATUS.GRADED
            );
        },

        async mapAnswersForGradedAssignment(config) {
            const configWithAnswers = JSON.parse(config.AssignmentConfig_HadAnswer);
            const configNoAnswers = JSON.parse(config.AssignmentConfig);
            const mappedGroups = await this.handleMapingAnswer_For_Graded(configWithAnswers, configNoAnswers);
            config.groups = mappedGroups;
        },

        handleMapingAnswer_For_Graded(asmConfig, asmConfigNoAnswer) {
            const flatQuestionsWithAnswers = asmConfig.groups.flatMap(g => g.questions);
            const groupsNoAnswer = _.cloneDeep(asmConfigNoAnswer.groups);
            const flatQuestionsNoAnswer = groupsNoAnswer.flatMap(g => g.questions);

            const answeredQuestions = flatQuestionsWithAnswers.map(questionWithAnswer => {
                const questionNoAnswer = flatQuestionsNoAnswer.find(q => q.id === questionWithAnswer.id);
                if (!questionNoAnswer) return null;
                this.copyCorrectAnswers(questionWithAnswer, questionNoAnswer);
                return questionNoAnswer;
            }).filter(Boolean);

            groupsNoAnswer.forEach(group => {
                group.questions = group.questions.map(question => {
                    const answered = answeredQuestions.find(q => q.id === question.id);
                    return answered || question;
                });
            });
            return groupsNoAnswer;
        },

        copyCorrectAnswers(source, target) {
            const { type, config: sourceConfig } = source;
            const targetConfig = target.config;
            switch (type) {
                case this.QUIZ_TYPES.SINGLE_CHOICE:
                case this.QUIZ_TYPES.TRUE_FALSE:
                    targetConfig.correctAnswer = _.cloneDeep(sourceConfig.correctAnswer);
                    break;
                case this.QUIZ_TYPES.MULTIPLE_CHOICE:
                    targetConfig.correctAnswers = _.cloneDeep(sourceConfig.correctAnswers);
                    break;
                case this.QUIZ_TYPES.MULTIPLE_TRUE_FALSE:
                    targetConfig.options = _.cloneDeep(sourceConfig.options);
                    break;
                case this.QUIZ_TYPES.FILL_IN_BLANK:
                    targetConfig.parts = _.cloneDeep(sourceConfig.parts);
                    break;
                case this.QUIZ_TYPES.MATCHING:
                    targetConfig.columnA = _.cloneDeep(sourceConfig.columnA);
                    targetConfig.columnB = _.cloneDeep(sourceConfig.columnB);
                    targetConfig.correctPairs = _.cloneDeep(sourceConfig.correctPairs);
                    break;
            }
        },

        loadSubmittedAnswers(response) {
            if (response.data[1][0]?.SubmissionStatus === this.SUBMISSION_STATUS.GRADED) {
                const submissionContent = JSON.parse(response.data[1][0]?.SubmissionContent || '{}');
                this.userAnswersSubmitted = submissionContent.answers || {};
            }
        },

        // ===========================
        // SUBMISSION HANDLING
        // ===========================

        async saveDraft(payload) {
            if (this.Is_Resubmit === 1) return null;

            const isSendToStudent = !this.isSendToClass;
            const endpoint = isSendToStudent
                ? 'lms/EL_Student_SaveSubmission_AssignToStudent'
                : 'lms/EL_Student_SaveSubmission';

            const params = isSendToStudent
                ? {
                    ...payload,
                    Is_Resubmit: this.Is_Resubmit ?? 0,
                    AssignToStudentID: parseInt(this.urlParams.get('AssignToStudentID')),
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                }
                : {
                    ...payload,
                    Is_Resubmit: this.Is_Resubmit ?? 0,
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                };

            const data = await fetchPromise(endpoint, params, { cache: false });
            await this.handleSaveResponse({ data });
            return data;
        },

        async handleSaveResponse(response) {
            this.assignmentData = response.data;
            this.loadSubmittedAnswers(response);
            if (response.data[0][0].Is_Shuffle !== 1) {
                // saveAssignmentConfig không tự gọi initPage nữa
                // initPage gọi tập trung tại đây sau khi save config xong
                await this.saveAssignmentConfig(response.data[1][0]?.SubmissionID);
                this.initPage();
            }
        },

        async saveAssignmentConfig(submissionID) {
            await fetchPromise(
                '/lms/EL_Student_Save_AssignmentConfig',
                {
                    SubmissionID: submissionID,
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                    AssignmentConfig: JSON.stringify(this.AssignmentConfigAfterShuffle),
                },
                { cache: false }
            );
            // Không gọi initPage() ở đây — caller tự quyết định
        },

        async submitAssignment(payload) {
            const isSendToStudent = !this.isSendToClass;
            const endpoint = isSendToStudent
                ? 'lms/EL_Student_SaveSubmission_AssignToStudent'
                : 'lms/EL_Student_SaveSubmission';

            const params = isSendToStudent
                ? {
                    ...payload,
                    Is_Resubmit: this.Is_Resubmit,
                    AssignToStudentID: parseInt(this.urlParams.get('AssignToStudentID')),
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                }
                : {
                    ...payload,
                    Is_Resubmit: this.Is_Resubmit,
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                };

            try {
                await fetchPromise(endpoint, params, { cache: false });
                Vue.$toast.success('Nộp bài thành công!', { position: 'top' });
                this.initPage();
            } catch (err) {
                Vue.$toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.', { position: 'top' });
            }
        },

        openSubmitDialog() {
            this.confirmSubmitDialog = true;
        },

        submitAssignmentFinal() {
            this.confirmSubmitDialog = false;
            const payload = {
                AssignToClassID: this.assignmentData[0][0].AssignToClassID,
                SubmissionContent: JSON.stringify({ answers: this.puseranswers }),
                SubmissionStatus: this.SUBMISSION_STATUS.SUBMITTED,
                HocSinhID: this.HocSinhDetail.HocSinhID,
            };
            this.submitAssignment(payload);
        },

        // ===========================
        // RESUBMISSION
        // ===========================

        async insertSubmissionForResubmit() {
            // isSendToClass là boolean — không cần so sánh string
            if (!this.isSendToClass) return;

            const payload = {
                AssignToClassID: this.assignmentData[0][0].AssignToClassID,
                SubmissionContent: JSON.stringify({ answers: {} }),
                SubmissionStatus: this.SUBMISSION_STATUS.DRAFT,
                HocSinhID: this.HocSinhDetail.HocSinhID,
            };

            try {
                const data = await fetchPromise('lms/EL_Student_InsertSubmission', payload, { cache: false });
                this.urlParams.delete('Is_Resubmit');
                this.urlParams.set('LanNop', data[1][0].LanNop.toString());
                this.initPage();
            } catch (err) {
                console.error('Lỗi insertSubmissionForResubmit:', err);
            }
        },

        // ===========================
        // ALERT TÍNH NĂNG MỚI
        // ===========================

        _initFlagFeatureAlert() {
            const KEY = 'flag_feature_alert_dismissed';
            const dismissed = localStorage.getItem(KEY);
            if (dismissed) return;
            // Hiện trong 2 ngày kể từ lần đầu vào
            const FIRST_KEY = 'flag_feature_alert_first_seen';
            const now = Date.now();
            const firstSeen = localStorage.getItem(FIRST_KEY);
            if (!firstSeen) {
                localStorage.setItem(FIRST_KEY, now.toString());
            } else if (now - parseInt(firstSeen) > 2 * 24 * 60 * 60 * 1000) {
                // Quá 2 ngày — tự ẩn, không cần user tắt
                localStorage.setItem(KEY, '1');
                return;
            }
            this.showFlagFeatureAlert = true;
        },

        dismissFlagFeatureAlert() {
            this.showFlagFeatureAlert = false;
            localStorage.setItem('flag_feature_alert_dismissed', '1');
        },

        // ===========================
        // FLAG POST-SUBMIT
        // ===========================

        async saveFlagsPostSubmit(payload) {
            const isSendToStudent = !this.isSendToClass;
            if (isSendToStudent) {
                await fetchPromise('lms/EL_Student_SaveSubmission_AssignToStudent_WithFlag', {
                    AssignToStudentID: parseInt(this.urlParams.get('AssignToStudentID')),
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                    SubmissionContent: payload.SubmissionContent,
                }, { cache: false });
            } else {
                await fetchPromise('lms/EL_Student_SaveSubmissionWithFlag', {
                    AssignToClassID: payload.AssignToClassID,
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                    SubmissionContent: payload.SubmissionContent,
                }, { cache: false });
            }
        },

        // ===========================
        // QUESTION TRACKING
        // ===========================

        renderQuestionNotSubmit() {
            if (!this.assignmentData[0]?.[0]?.AssignmentConfig) return '';
            const asmConfig = JSON.parse(this.assignmentData[0][0].AssignmentConfig);
            const allQuestions = asmConfig.groups.flatMap(g => g.questions);
            const unanswered = allQuestions
                .map((question, index) => ({ question, index: index + 1 }))
                .filter(({ question }) => this.puseranswers[question.id]?.answerData === null)
                .map(({ index }) => `Câu ${index}`);
            return unanswered.join(', ');
        },
    },
}
</script>