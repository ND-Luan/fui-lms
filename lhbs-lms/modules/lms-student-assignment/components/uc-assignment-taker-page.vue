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
        <v-alert v-if="showFlagFeatureAlert" type="info" variant="tonal" closable class="ma-2"
            @click:close="dismissFlagFeatureAlert">
            <template #prepend>
                <v-icon>mdi-flag-variant</v-icon>
            </template>
            <strong>Tính năng mới:</strong> Bạn có thể <strong>đánh dấu câu hỏi</strong> bằng nút
            <v-icon size="16" color="red">mdi-flag-variant-outline</v-icon>
            để xem lại sau — kể cả sau khi đã nộp bài.
            Tất cả câu hỏi đã đánh dấu sẽ được tổng hợp tại trang <strong>Câu hỏi đã đánh dấu</strong> trong Trang chủ
            học sinh.
        </v-alert>

        <!-- Main Content -->
        <v-container v-if="dataReady" fluid class="pa-0">
            <v-row :no-gutters="true">
                <v-col cols="12">
                    <!-- Assignment Taker Component -->
                    <uc-assignment-taker-2 v-if="dataReady === true" :key="keyComp" ref="assignmentTaker" class="pa-0"
                        v-model:assignment-data="assignmentData" v-model:puseranswers="puseranswers"
                        :hocSinhDetail="HocSinhDetail" :mon-hoc-name="monHocName" :on-save-draft="saveDraft"
                        :on-save-flags-post-submit="saveFlagsPostSubmit" :on-open-submit-dialog="openSubmitDialog" />
                    <v-dialog v-model="confirmSubmitDialog" max-width="420">
                        <v-card>
                            <v-alert type="warning" variant="tonal" rounded="0" class="mb-0"
                                icon="mdi-send-check-outline" title="Xác nhận nộp bài">
                                Bạn có chắc chắn muốn nộp bài không? Sau khi nộp, bạn sẽ
                                <strong>không thể chỉnh sửa</strong> bài làm của mình.
                            </v-alert>

                            <v-alert v-if="isFullQuizAutoGrade" type="info" variant="tonal" rounded="0" class="mb-0"
                                icon="mdi-lightning-bolt-outline">
                                Tất cả các câu đều là dạng trắc nghiệm nên hệ thống sẽ
                                <strong>tự động chấm và công bố điểm ngay sau khi nộp</strong>.
                            </v-alert>

                            <v-alert v-if="renderQuestionNotSubmit().length > 0" type="error" variant="tonal"
                                rounded="0" class="mb-0" icon="mdi-alert-circle-outline">
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
            isLoadingAssignment: false,

            // Alert tính năng mới đánh dấu câu hỏi
            showFlagFeatureAlert: false,

            // Guard cho beforeunload
            beforeunloadHandler: null,
        };
    },

    computed: {
        // true khi bài đang trong trạng thái chưa nộp (0=chưa làm, 1=DRAFT)
        isActiveDirty() {
            if (!this.dataReady) return false;
            return (this.submitionInfo?.SubmissionStatus ?? 0) < 2;
        },

        isFullQuizAutoGrade() {
            return this.toBoolean(this.assignmentData?.[0]?.[0]?.Is_Full_Quiz);
        },
    },

    watch: {
        // Thông báo cho parent (iframe wrapper) mỗi khi trạng thái dirty thay đổi
        isActiveDirty(val) {
            window.parent.postMessage({ type: 'lms:assignment:dirty', isDirty: val }, '*');
        },
    },

    mounted() {
        this.callNienKhoa_Get();
        this._initFlagFeatureAlert();

        // Chặn đóng tab browser khi bài đang làm chưa nộp
        this.beforeunloadHandler = (e) => {
            if (this.isActiveDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', this.beforeunloadHandler);
    },

    beforeUnmount() {
        if (this.beforeunloadHandler) {
            window.removeEventListener('beforeunload', this.beforeunloadHandler);
        }
        // Khi trang làm bài bị huỷ mount (đóng iframe), reset dirty để parent biết
        window.parent.postMessage({ type: 'lms:assignment:dirty', isDirty: false }, '*');
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
            if (this.isLoadingAssignment) return;
            this.isLoadingAssignment = true;

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
                this.isLoadingAssignment = false;
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
            this.ensureAutoGradeScoresInSubmissionContent();
        },

        ensureAutoGradeScoresInSubmissionContent() {
            if (!this.isFullQuizAutoGrade) return;
            if (this.submitionInfo?.SubmissionStatus !== this.SUBMISSION_STATUS.GRADED) return;

            const raw = this.submitionInfo?.SubmissionContent;
            if (!raw) return;

            let parsed = null;
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                console.error('Không parse được SubmissionContent để backfill điểm tự động:', e);
                return;
            }

            const answers = parsed?.answers || {};
            const hasMissingScore = Object.values(answers).some(answerItem => {
                const grading = answerItem?.grading || {};
                const hasManual = typeof grading.manualScore === 'number';
                const hasAuto = typeof grading.autoScore === 'number';
                return !hasManual && !hasAuto;
            });

            if (!hasMissingScore) return;

            const groups = this.getGroupsForAutoGrading();
            if (!groups.length) return;

            const graded = this.fn_AutoGradeSubmission({ answers: _.cloneDeep(answers) }, groups);
            this.submitionInfo = {
                ...this.submitionInfo,
                SubmissionContent: graded.SubmissionContent,
                Score: this.submitionInfo?.Score ?? graded.Score,
            };

            if (this.assignmentData?.[1]?.[0]) {
                this.assignmentData[1][0] = {
                    ...this.assignmentData[1][0],
                    SubmissionContent: graded.SubmissionContent,
                    Score: this.assignmentData[1][0]?.Score ?? graded.Score,
                };
            }
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
                    Is_Full_Quiz: this.isFullQuizAutoGrade,
                    Is_Resubmit: this.Is_Resubmit ?? 0,
                    AssignToStudentID: parseInt(this.urlParams.get('AssignToStudentID')),
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                }
                : {
                    ...payload,
                    Is_Full_Quiz: this.isFullQuizAutoGrade,
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

            const buildParams = (payloadInput, submitToken) => (isSendToStudent
                ? {
                    ...payloadInput,
                    Is_Full_Quiz: this.isFullQuizAutoGrade,
                    SubmitToken: submitToken,
                    Is_Resubmit: this.Is_Resubmit,
                    AssignToStudentID: parseInt(this.urlParams.get('AssignToStudentID')),
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                }
                : {
                    ...payloadInput,
                    Is_Full_Quiz: this.isFullQuizAutoGrade,
                    SubmitToken: submitToken,
                    Is_Resubmit: this.Is_Resubmit,
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                });

            try {
                if (this.isFullQuizAutoGrade) {
                    // Phase 1: chốt trạng thái 4 để API detail cho phép trả config có đáp án.
                    const phase1Payload = {
                        ...payload,
                        SubmissionStatus: this.SUBMISSION_STATUS.GRADED,
                    };

                    let tokenPhase1 = await this.requestSubmitToken(isSendToStudent);
                    if (!tokenPhase1) {
                        Vue.$toast.error('Không lấy được one-time token nộp bài. Vui lòng thử lại.', { position: 'top' });
                        return;
                    }

                    await fetchPromise(endpoint, buildParams(phase1Payload, tokenPhase1), { cache: false });

                    const { AssignToClassID, AssignToStudentID } = this.getAssignmentIDs();
                    await this.loadAssignmentData(AssignToClassID, AssignToStudentID);

                    const phase2Payload = this.buildAutoGradedPayload({
                        ...payload,
                        SubmissionStatus: this.SUBMISSION_STATUS.GRADED,
                    });

                    const canPublishScore =
                        phase2Payload?.SubmissionStatus === this.SUBMISSION_STATUS.GRADED
                        && typeof phase2Payload?.Score === 'number';

                    if (canPublishScore) {
                        const tokenPhase2 = await this.requestSubmitToken(isSendToStudent);
                        if (!tokenPhase2) {
                            Vue.$toast.error('Đã nộp bài nhưng chưa lấy được token để cập nhật điểm. Vui lòng thử lại.', { position: 'top' });
                            this.initPage();
                            return;
                        }
                        await fetchPromise(endpoint, buildParams(phase2Payload, tokenPhase2), { cache: false });
                        Vue.$toast.success('Nộp bài thành công! Hệ thống đã tự động chấm và công bố điểm.', { position: 'top' });
                    } else {
                        Vue.$toast.success('Nộp bài thành công!', { position: 'top' });
                    }
                } else {
                    const payloadForSubmit = payload;
                    let submitToken = null;
                    if ((payloadForSubmit?.SubmissionStatus ?? 0) >= this.SUBMISSION_STATUS.SUBMITTED) {
                        submitToken = await this.requestSubmitToken(isSendToStudent);
                        if (!submitToken) {
                            Vue.$toast.error('Không lấy được one-time token nộp bài. Vui lòng thử lại.', { position: 'top' });
                            return;
                        }
                    }
                    await fetchPromise(endpoint, buildParams(payloadForSubmit, submitToken), { cache: false });
                    Vue.$toast.success('Nộp bài thành công!', { position: 'top' });
                }

                this.initPage();
            } catch (err) {
                Vue.$toast.error('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.', { position: 'top' });
            }
        },

        async requestSubmitToken(isSendToStudent) {
            try {
                const params = {
                    HocSinhID: this.HocSinhDetail.HocSinhID,
                };

                if (isSendToStudent) {
                    params.AssignToStudentID = parseInt(this.urlParams.get('AssignToStudentID'));
                } else {
                    params.AssignToClassID = this.assignmentData?.[0]?.[0]?.AssignToClassID;
                }

                const res = await fetchPromise('lms/EL_Student_SubmitToken_Begin', params, { cache: false });
                return res?.SubmitToken || res?.[0]?.SubmitToken || null;
            } catch (error) {
                console.error('Lỗi requestSubmitToken:', error);
                return null;
            }
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

        toBoolean(value) {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'number') return value === 1;
            if (typeof value === 'string') {
                const normalized = value.trim().toLowerCase();
                return normalized === '1' || normalized === 'true';
            }
            return false;
        },

        buildAutoGradedPayload(payload) {
            const groups = this.getGroupsForAutoGrading();
            if (!groups.length) {
                console.warn('Auto-grade fallback: thiếu cấu hình câu hỏi có đáp án, chuyển về trạng thái đã nộp.');
                return {
                    ...payload,
                    SubmissionStatus: this.SUBMISSION_STATUS.SUBMITTED,
                };
            }

            const hasAnyAnswerKey = this.countScorableQuizQuestions(groups) > 0;
            if (!hasAnyAnswerKey) {
                console.warn('Auto-grade fallback: không tìm thấy answer key để chấm tự động, chuyển về trạng thái đã nộp.');
                return {
                    ...payload,
                    SubmissionStatus: this.SUBMISSION_STATUS.SUBMITTED,
                };
            }

            const graded = this.fn_AutoGradeSubmission({ answers: _.cloneDeep(this.puseranswers || {}) }, groups);
            if (typeof graded?.Score !== 'number' || Number.isNaN(graded.Score)) {
                console.warn('Auto-grade fallback: tính điểm thất bại, chuyển về trạng thái đã nộp.');
                return {
                    ...payload,
                    SubmissionStatus: this.SUBMISSION_STATUS.SUBMITTED,
                };
            }

            return {
                ...payload,
                SubmissionStatus: this.SUBMISSION_STATUS.GRADED,
                SubmissionContent: graded.SubmissionContent,
                Score: graded.Score,
            };
        },

        getGroupsForAutoGrading() {
            const detail = this.assignmentData?.[0]?.[0] || {};
            const rawConfigs = [
                detail.AssignmentConfig_HadAnswer,
                detail.AssignmentConfig,
            ].filter(Boolean);

            let bestGroups = [];
            let bestScore = -1;

            for (const rawConfig of rawConfigs) {
                try {
                    const parsed = JSON.parse(rawConfig);
                    const groups = parsed?.groups || [];
                    const score = this.countScorableQuizQuestions(groups);
                    if (score > bestScore) {
                        bestScore = score;
                        bestGroups = groups;
                    }
                } catch (e) {
                    console.error('Không parse được AssignmentConfig để tự động chấm:', e);
                }
            }

            return bestGroups;
        },

        countScorableQuizQuestions(groups) {
            let count = 0;
            for (const group of (groups || [])) {
                for (const question of (group?.questions || [])) {
                    if (this.hasAnswerKey(question)) count += 1;
                }
            }
            return count;
        },

        hasAnswerKey(question) {
            if (!question || !question.type) return false;
            const config = question.config || {};

            if (question.type === this.QUIZ_TYPES.SINGLE_CHOICE || question.type === this.QUIZ_TYPES.TRUE_FALSE) {
                return config.correctAnswer !== null && config.correctAnswer !== undefined && config.correctAnswer !== '';
            }
            if (question.type === this.QUIZ_TYPES.MULTIPLE_CHOICE) {
                return Array.isArray(config.correctAnswers) && config.correctAnswers.length > 0;
            }
            if (question.type === this.QUIZ_TYPES.MULTIPLE_TRUE_FALSE) {
                return Array.isArray(config.options) && config.options.some(opt => opt?.correctAnswer !== null && opt?.correctAnswer !== undefined);
            }
            if (question.type === this.QUIZ_TYPES.MATCHING) {
                return Array.isArray(config.correctPairs) && config.correctPairs.length > 0;
            }
            if (question.type === this.QUIZ_TYPES.FILL_IN_BLANK) {
                const blanks = (config.parts || []).filter(p => p.type === 'blank');
                return blanks.some(blank => Array.isArray(blank.acceptedAnswers) && blank.acceptedAnswers.length > 0);
            }

            return false;
        },

        isSameValue(left, right) {
            if (left === right) return true;
            if (left == null || right == null) return false;
            return String(left) === String(right);
        },

        fn_AutoGradeSubmission(submissionContentObj, asmGroups) {
            let answers = submissionContentObj?.answers ?? {};
            let score = 0;

            for (const group of asmGroups) {
                for (const question of (group?.questions || [])) {
                    let manualScore = 0;
                    const answerData = answers?.[question.id]?.answerData;
                    const questionPoints = Number(question?.points ?? 0);

                    if (answerData == null) continue;

                    if (question.type === this.QUIZ_TYPES.SINGLE_CHOICE) {
                        if (this.isSameValue(question?.config?.correctAnswer, answerData)) {
                            manualScore = questionPoints;
                        }
                    }
                    else if (question.type === this.QUIZ_TYPES.MULTIPLE_CHOICE) {
                        const arr1 = question?.config?.correctAnswers || [];
                        const mode = question?.config?.scoringMode || 'equal';
                        let correctIndex = 0;

                        arr1.forEach(opt => {
                            if (Array.isArray(answerData) && answerData.some(item => this.isSameValue(item, opt))) correctIndex++;
                        });

                        if (mode === 'partial') {
                            const partialMap = { 1: 0.1, 2: 0.25, 3: 0.5, 4: 1.0 };
                            manualScore = partialMap[correctIndex] ?? 0;
                        } else {
                            manualScore = arr1.length
                                ? Math.round((correctIndex / arr1.length) * questionPoints * 100) / 100
                                : 0;
                        }
                    }
                    else if (question.type === this.QUIZ_TYPES.TRUE_FALSE) {
                        if (this.isSameValue(question?.config?.correctAnswer, answerData)) {
                            manualScore = questionPoints;
                        }
                    }
                    else if (question.type === this.QUIZ_TYPES.MULTIPLE_TRUE_FALSE) {
                        const mode = question?.config?.scoringMode || 'equal';
                        const options = question?.config?.options || [];
                        let correctCount = 0;

                        options.forEach(opt => {
                            if (this.isSameValue(opt?.correctAnswer, answerData?.[opt.id])) correctCount++;
                        });

                        if (mode === 'partial') {
                            const partialMap = { 1: 0.1, 2: 0.25, 3: 0.5, 4: 1.0 };
                            manualScore = partialMap[correctCount] ?? 0;
                        } else {
                            const total = options.length;
                            manualScore = total
                                ? Math.round((correctCount / total) * questionPoints * 100) / 100
                                : 0;
                        }
                    }
                    else if (question.type === this.QUIZ_TYPES.MATCHING) {
                        let numberOfCorrect = 0;
                        const correctPairs = question?.config?.correctPairs || [];

                        correctPairs.forEach(item => {
                            const findAnswer = Array.isArray(answerData)
                                ? answerData.find(a => this.isSameValue(a.from, item.from))
                                : null;
                            if (findAnswer && this.isSameValue(findAnswer.to, item.to)) numberOfCorrect += 1;
                        });

                        manualScore = correctPairs.length
                            ? (numberOfCorrect / correctPairs.length) * questionPoints
                            : 0;
                    }
                    else if (question.type === this.QUIZ_TYPES.FILL_IN_BLANK) {
                        const parts = question?.config?.parts || [];
                        const blanks = parts.filter(p => p.type === 'blank');

                        if (blanks.length === 0) {
                            manualScore = questionPoints;
                        } else {
                            let correctAnswersCount = 0;

                            blanks.forEach(blank => {
                                const studentAnswer = String(answerData?.[blank.id] ?? '').toLowerCase().replace(/\s+/g, '').trim();
                                const acceptedAnswers = (blank.acceptedAnswers || [])
                                    .map(item => String(item).toLowerCase().replace(/\s+/g, '').trim());
                                if (acceptedAnswers.includes(studentAnswer)) correctAnswersCount += 1;
                            });

                            manualScore = (correctAnswersCount / blanks.length) * questionPoints;
                        }
                    }

                    score += manualScore;
                    answers = {
                        ...answers,
                        [question.id]: {
                            ...answers[question.id],
                            grading: {
                                ...answers?.[question.id]?.grading,
                                manualScore,
                                autoScore: manualScore,
                            },
                        },
                    };
                }
            }

            return {
                SubmissionContent: JSON.stringify({ answers }),
                Score: Math.round(score * 100) / 100,
            };
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