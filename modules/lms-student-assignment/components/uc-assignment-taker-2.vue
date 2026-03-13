<template>
	<!-- ── LOADING ── -->
	<div v-if="!assignment" class="uat__loading text-center pa-10">
		<v-progress-circular indeterminate size="64" />
		<p class="mt-4 text-medium-emphasis">Đang tải đề bài...</p>
	</div>

	<!-- ── MAIN ── -->
	<div v-else>

		<!-- Header thông tin bài tập -->
		<AssignmentHeader :assignment="assignment" :mon-hoc-name="monHocName" :student="hocSinhDetail" :draft="draft" />

		<!-- Kết quả (chỉ hiện khi đã chấm) -->
		<v-card v-show="isGraded" class="mx-2 mb-2" flat border>
			<v-card-text class="py-2">
				<div class="d-flex align-center flex-wrap ga-2">
					<v-chip color="primary" size="small" variant="outlined">
						<v-icon start size="16">mdi-trophy</v-icon>
						{{ draft?.Score }} / {{ assignment?.MaxScore }} điểm
					</v-chip>

					<v-chip size="small" color="success" variant="outlined">
						<v-icon start size="16">mdi-check-decagram</v-icon>
						Đã chấm
					</v-chip>

					<v-spacer />

					<v-btn v-if="draft?.TeacherComment?.trim()" size="small" variant="text"
						@click="toggleTC = !toggleTC">
						<v-icon start size="16">mdi-comment-quote-outline</v-icon>
						{{ toggleTC ? 'Ẩn nhận xét' : 'Xem nhận xét' }}
					</v-btn>
				</div>

				<v-expand-transition>
					<div v-show="toggleTC && draft?.TeacherComment?.trim()" class="mt-2 text-body-2"
						v-html="draft?.TeacherComment" />
				</v-expand-transition>
			</v-card-text>
		</v-card>

		<!-- Layout chính -->
		<v-row dense>

			<!-- Sidebar điều hướng (ẩn trên mobile) -->
			<v-col v-if="!isMobile" cols="12" sm="12" md="2" style="border-inline-end: 0.5px dashed #a7a2a2;">
				<QuestionNavigation :groups="assignment.groups" :user-answers="userAnswers"
					:current-group-index="currentGroupIndex" :current-question-index="currentQuestionIndexInGroup"
					:draft="draft" :get-icon-color="getIconColor" :get-status-icon="getQuestionStatusIcon"
					:get-question-number="getGlobalQuestionNumber" v-model:view-mode="viewMode"
					@navigate="navigateToQuestion" />
			</v-col>

			<!-- Nội dung câu hỏi -->
			<v-col cols="12" md="10" class="pe-0">

				<!-- ── CHẾ ĐỘ 1 CÂU ── -->
				<template v-if="viewMode === 'single'">

					<AssignmentProgress v-show="shouldShowProgress" :answered-count="answeredCount"
						:total-questions="totalQuestions" :progress-percent="progressPercent" :save-status="saveStatus"
						:save-status-color="saveStatusColor" :save-status-icon="saveStatusIcon"
						:is-submitted="isSubmitted" :is-graded="isGraded" @submit="handleSubmit" />

					<v-card v-if="currentQuestion?.config" class="uat__question-card" style="overflow: auto;"
						:style="contentCardStyle">
						<div class="px-2">
							<GroupHeader :group="currentGroup" :answered-count="getGroupAnsweredCount(currentGroup)" />
						</div>

						<v-divider />

						<!-- Hiện tất cả câu trong nhóm -->
						<div v-if="currentGroup.isCheckShowAllQuestion">
							<QuestionCard v-for="question in currentGroup.questions" :key="question.id"
								:question="question" :question-number="getGlobalQuestionNumberByQuestionId(question.id)"
								:answer="getAnswerForChild(question)" :grading="userAnswers[question.id]?.grading"
								:readonly="isSubmitted" :submission-status="draft?.SubmissionStatus"
								:is-block-copy-paste="isBlockCopyPaste" :is-flagged="userAnswers[question.id]?.flag"
								:status="questionStatus(question.id, question.points)"
								:status-icon="getQuestionStatusIcon(question.id)"
								:icon-color="getIconColor(question.id)" class="px-2 pt-2 pb-0"
								@update:answer="updateAnswer(question.id, $event)" @flag="handleFlag(question.id)" />
						</div>

						<!-- Hiện 1 câu + nút prev/next -->
						<template v-else>
							<v-card-text class="px-2 pt-2 pb-0">
								<QuestionCard :question="currentQuestion"
									:question-number="getGlobalQuestionNumberByQuestionId(currentQuestion.id)"
									:answer="getAnswerForChild(currentQuestion)"
									:grading="userAnswers[currentQuestion.id]?.grading" :readonly="isSubmitted"
									:submission-status="draft?.SubmissionStatus" :is-block-copy-paste="isBlockCopyPaste"
									:is-flagged="userAnswers[currentQuestion.id]?.flag"
									:status="questionStatus(currentQuestion.id, currentQuestion.points)"
									:status-icon="getQuestionStatusIcon(currentQuestion.id)"
									:icon-color="getIconColor(currentQuestion.id)"
									@update:answer="updateAnswer(currentQuestion.id, $event)"
									@flag="handleFlag(currentQuestion.id)" />
							</v-card-text>

							<v-divider class="mt-2" />

							<!-- Action bar sticky -->
							<v-card-actions class="pa-2 d-flex justify-space-between uat__action-bar">
								<v-btn variant="text" :disabled="isFirstQuestion" @click="prevQuestion">
									<v-icon start>mdi-chevron-left</v-icon>Câu trước
								</v-btn>

								<div class="d-flex align-center ga-2">
									<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
										<v-icon start size="16">{{ saveStatusIcon }}</v-icon>
										{{ saveStatus }}
									</v-chip>

									<v-btn v-if="!isSubmitted" variant="outlined" color="success" size="small"
										@click="handleSubmit">
										<v-icon start>mdi-check-all</v-icon>Nộp bài
									</v-btn>

									<v-chip v-else color="success" size="small" label>
										<v-icon start>mdi-check-decagram</v-icon>
										{{ isGraded ? 'Đã chấm điểm' : 'Đã nộp bài' }}
									</v-chip>
								</div>

								<v-btn variant="text" :disabled="isLastQuestion" @click="nextQuestion">
									Câu sau<v-icon end>mdi-chevron-right</v-icon>
								</v-btn>
							</v-card-actions>
						</template>
					</v-card>
				</template>

				<!-- ── CHẾ ĐỘ TẤT CẢ CÂU ── -->
				<div v-else class="uat__all-mode" style="overflow: auto;" :style="contentCardStyle">
					<AssignmentProgress v-show="shouldShowProgress" class="my-2 mx-2" :answered-count="answeredCount"
						:total-questions="totalQuestions" :progress-percent="progressPercent" :save-status="saveStatus"
						:save-status-color="saveStatusColor" :save-status-icon="saveStatusIcon"
						:is-submitted="isSubmitted" :is-graded="isGraded" @submit="handleSubmit" />

					<div class="uat__questions-container">
						<div v-for="(group, groupIndex) in assignment.groups" :key="group.id"
							class="uat__group-section mb-6">
							<GroupHeader :group="group" :answered-count="getGroupAnsweredCount(group)" />

							<div class="uat__questions-in-group">
								<QuestionCard v-for="(question, questionIndexInGroup) in group.questions"
									:key="question.id" :question="question"
									:question-number="getGlobalQuestionNumber(groupIndex, questionIndexInGroup)"
									:answer="getAnswerForChild(question)" :grading="userAnswers[question.id]?.grading"
									:readonly="isSubmitted" :submission-status="draft?.SubmissionStatus"
									:is-block-copy-paste="isBlockCopyPaste" :is-flagged="userAnswers[question.id]?.flag"
									:status="questionStatus(question.id, question.points)"
									:status-icon="getQuestionStatusIcon(question.id)"
									:icon-color="getIconColor(question.id)"
									@update:answer="updateAnswer(question.id, $event)"
									@flag="handleFlag(question.id)" />
							</div>
						</div>
					</div>
				</div>

			</v-col>
		</v-row>
	</div>
</template>

<script>
export default {
	name: 'uc-assignment-taker',

	// Mixins từ script.js (load global trước component)
	mixins: [
		useQuestionNavigation(),
		useAnswerTracking(),
		useAutoSave(),
		useQuestionStatus(),
		useCopyPasteBlocker(),
		useTimeTracking(),
	],

	// ── PROPS ──────────────────────────────────────────────────
	props: {
		/** Bài làm hiện tại của học sinh { [questionId]: { answerData, flag, grading } } */
		puseranswers: { type: Object, default: () => ({}) },
		/** Response từ API: [[assignmentInfo], [submissionInfo]] */
		assignmentData: { type: Array, default: () => [] },
		/** Tên môn học */
		monHocName: { type: String, default: '' },
		/** Thông tin học sinh (từ AssignmentTakerPage) */
		hocSinhDetail: { type: Object, default: () => ({}) },
		/** Câu trả lời đã nộp — dùng khi xem lại bài đã chấm */
		userAnswersSubmitted: { type: Object, default: () => ({}) },
		/** Callback lưu nháp — trả về Promise */
		onSaveDraft: { type: Function, default: () => Promise.resolve() },
		/** Callback mở dialog xác nhận nộp bài */
		onOpenSubmitDialog: { type: Function, default: () => { } },
	},

	emits: ['update:puseranswers'],

	// ── DATA ───────────────────────────────────────────────────
	data() {
		return {
			// View state
			viewMode: 'all',   // 'single' | 'all'
			groupCollapsed: {},
			currentGroupIndex: 0,
			currentQuestionIndexInGroup: 0,
			toggleTC: false,

			// Responsive
			isMobile: false,
			isTablet: false,

			// Time tracking
			intervalDurationTime: null,
			resizeHandler: null,

			// Lodash ref (dùng trong template nếu cần)
			_,

			// Cache nội bộ
			_questionComponentCache: new Map(),
			_answerCache: new Map(),
		};
	},

	// ── COMPUTED ───────────────────────────────────────────────
	computed: {
		/** Alias để mixins dùng thống nhất qua this.userAnswers */
		userAnswers() {
			return this.puseranswers || {};
		},

		/**
		 * Parse AssignmentConfig — có cache để tránh parse lại mỗi render.
		 * Khi đã graded → dùng AssignmentConfig_HadAnswer (có đáp án đúng).
		 */
		assignment() {
			const config = this.assignmentData?.[0]?.[0];
			if (!config) return null;

			const submissionStatus = this.assignmentData[1]?.[0]?.SubmissionStatus;
			const isGraded = submissionStatus === 4;

			// Xóa cache nếu vừa chuyển sang graded nhưng cache chưa có đáp án
			if (isGraded && config._cachedGroups?.[0]?.questions?.[0]?.config?.correctAnswer === null) {
				delete config._cachedGroups;
			}

			if (!config._cachedGroups) {
				try {
					const raw = (isGraded && config.AssignmentConfig_HadAnswer)
						? config.AssignmentConfig_HadAnswer
						: config.AssignmentConfig;
					const parsed = JSON.parse(raw);
					config._cachedGroups = parsed.groups || [];
					config.groups = config._cachedGroups;
				} catch (e) {
					console.error('[uc-assignment-taker] Lỗi parse AssignmentConfig:', e);
					config._cachedGroups = [];
					config.groups = [];
				}
			} else {
				config.groups = config._cachedGroups;
			}

			return config;
		},

		/** Thông tin bài nộp hiện tại */
		draft() {
			return this.assignmentData?.[1]?.[0] || null;
		},

		isSubmitted() {
			return (this.draft?.SubmissionStatus ?? 0) >= 2;
		},

		isGraded() {
			return this.isSubmitted && this.draft?.SubmissionStatus === 4;
		},

		isBlockCopyPaste() {
			return this.assignment?.IsBlockCopy_Paste === true;
		},

		contentCardStyle() {
			return (this.draft?.SubmissionStatus ?? 0) <= 2
				? { height: 'calc(100vh - 70px)' }
				: { height: 'calc(100vh - 111px)' };
		},

		shouldShowProgress() {
			const s = this.draft?.SubmissionStatus;
			return s !== 4 && s !== 3;
		},

		isFirstQuestion() {
			return this.globalQuestionNumber === 1;
		},

		isLastQuestion() {
			return this.globalQuestionNumber === this.totalQuestions;
		},
	},

	// ── WATCHERS ───────────────────────────────────────────────
	watch: {
		assignmentData: {
			handler(val) {
				if (val) {
					this._questionComponentCache.clear();
					this._answerCache.clear();
				}
			},
			deep: false,
		},

		isMobile(val) {
			if (val) this.viewMode = 'all';
		},
	},

	// ── LIFECYCLE ──────────────────────────────────────────────
	created() {
		this.resizeHandler = _.throttle(this._onResize, 200);
	},

	mounted() {
		window.addEventListener('resize', this.resizeHandler, { passive: true });
		this._onResize();
		this._initializeAnswers();
		this._startTimeTracking();

		if (this.isBlockCopyPaste) this.addCopyPasteBlocker();
	},

	beforeUnmount() {
		window.removeEventListener('resize', this.resizeHandler);
		this.resizeHandler = null;

		this._stopTimeTracking();

		if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
		if (this.isBlockCopyPaste) this.removeCopyPasteBlocker();

		this._questionComponentCache.clear();
		this._answerCache.clear();
	},

	// ── METHODS ────────────────────────────────────────────────
	methods: {

		// ══════════════════════════════════════════════════════
		// RESPONSIVE
		// ══════════════════════════════════════════════════════

		_onResize() {
			this.isMobile = window.innerWidth < 960;
			this.isTablet = window.innerWidth <= 1240;
		},

		// ══════════════════════════════════════════════════════
		// ANSWER — lấy dữ liệu trả lời để truyền xuống QuestionCard
		// ══════════════════════════════════════════════════════

		getAnswerForChild(question) {
			if (!question) return null;

			const cached = this._answerCache.get(question.id);
			const current = this.userAnswers[question.id];

			if (cached && cached.answer === current?.answerData) {
				return cached.result;
			}

			let result;
			if (question.type === 'FILE_UPLOAD') {
				result = (!current || current.answerData === undefined) ? [] : current.answerData;
			} else {
				result = current?.answerData;
			}

			this._answerCache.set(question.id, { answer: current?.answerData, result });
			return result;
		},

		// ══════════════════════════════════════════════════════
		// ANSWER — cập nhật khi học sinh trả lời
		// ══════════════════════════════════════════════════════

		updateAnswer(questionId, newAnswer) {
			if (this.isSubmitted) return;

			const question = this.allQuestions.find(q => q.id === questionId);
			if (!question) {
				console.error(`[uc-assignment-taker] Không tìm thấy câu hỏi ID: ${questionId}`);
				return;
			}

			const newAnswers = { ...this.userAnswers };
			const currentAnswerObj = newAnswers[questionId] || {};
			const fileTypes = ['FILE_UPLOAD', 'AUDIO_RESPONSE'];
			const manualTypes = ['SHORT_ANSWER', 'ESSAY', 'FILE_UPLOAD', 'AUDIO_RESPONSE'];

			const answerData = fileTypes.includes(question.type)
				? (Array.isArray(newAnswer) ? newAnswer : [newAnswer])
				: newAnswer;

			newAnswers[questionId] = {
				...currentAnswerObj,
				answerData,
				grading: {
					teacherComment: currentAnswerObj.grading?.teacherComment ?? '',
					comment: currentAnswerObj.grading?.comment ?? '',
					...(manualTypes.includes(question.type) ? { manualScore: null } : {}),
				},
			};

			this._answerCache.delete(questionId);
			this.$emit('update:puseranswers', newAnswers);
			this.triggerAutoSave();
		},

		// ══════════════════════════════════════════════════════
		// ANSWER — khởi tạo structure bài làm từ SubmissionContent
		// ══════════════════════════════════════════════════════

		_initializeAnswers() {
			if (this.draft?.SubmissionContent) {
				try {
					const asmConfigStr = this.assignmentData?.[0]?.[0]?.AssignmentConfig;
					if (!asmConfigStr) {
						this.$emit('update:puseranswers', {});
						return;
					}

					const asmData = JSON.parse(asmConfigStr);
					if (!Array.isArray(asmData?.groups)) {
						this.$emit('update:puseranswers', {});
						return;
					}

					let saved = { answers: {} };
					try { saved = JSON.parse(this.draft.SubmissionContent); } catch { /* giữ default */ }

					const answers = saved?.answers || {};

					// Đảm bảo mỗi câu hỏi đều có structure đủ
					asmData.groups.forEach(group => {
						(group.questions || []).forEach(question => {
							if (!question.id || answers[question.id]) return;
							answers[question.id] = {
								answerData: null,
								flag: false,
								grading: { comment: null, teacherComment: null, manualScore: null },
							};
						});
					});

					this.$emit('update:puseranswers', answers);
				} catch (e) {
					console.error('[uc-assignment-taker] Lỗi _initializeAnswers:', e);
					this.$emit('update:puseranswers', {});
				}
			} else {
				// Chưa có bài nộp → tạo draft mới + khởi tạo groupCollapsed
				this.saveDraft();
				if (this.assignment?.groups) {
					const collapsed = {};
					this.assignment.groups.forEach((_, i) => { collapsed[i] = false; });
					this.groupCollapsed = collapsed;
				}
			}
		},

		// ══════════════════════════════════════════════════════
		// FLAG (đánh dấu câu để xem lại)
		// ══════════════════════════════════════════════════════

		handleFlag(qid) {
			const newAnswers = { ...this.userAnswers };
			if (!newAnswers[qid]) {
				newAnswers[qid] = {
					answerData: null,
					flag: true,
					grading: { comment: null, teacherComment: null, manualScore: null },
				};
			} else {
				newAnswers[qid] = { ...newAnswers[qid], flag: !newAnswers[qid]?.flag };
			}
			this.$emit('update:puseranswers', newAnswers);
			this.triggerAutoSave();
		},

		// ══════════════════════════════════════════════════════
		// GROUP COLLAPSE
		// ══════════════════════════════════════════════════════

		toggleGroupCollapse(groupIndex) {
			this.groupCollapsed = {
				...this.groupCollapsed,
				[groupIndex]: !this.groupCollapsed[groupIndex],
			};
		},

		// ══════════════════════════════════════════════════════
		// TIME TRACKING
		// ══════════════════════════════════════════════════════

		_startTimeTracking() {
			const submitionInfo = this.assignmentData?.[1]?.[0];
			if (!submitionInfo) return;
			if ([2, 3, 4].includes(submitionInfo.SubmissionStatus)) return;

			this.intervalDurationTime = setInterval(() => {
				this.insertDurationTime(submitionInfo);
			}, 5000);

			this.insertAccessTime(submitionInfo);
		},

		_stopTimeTracking() {
			if (this.intervalDurationTime) {
				clearInterval(this.intervalDurationTime);
				this.intervalDurationTime = null;
			}
		},

		// ══════════════════════════════════════════════════════
		// SUBMIT
		// ══════════════════════════════════════════════════════

		handleSubmit() {
			this._stopTimeTracking();
			this.onOpenSubmitDialog();
		},
	},
}
</script> 
