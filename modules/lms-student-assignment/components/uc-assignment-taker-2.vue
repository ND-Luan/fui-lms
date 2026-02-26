<template>
	<div v-if="!assignment" class="text-center pa-10">
		<v-progress-circular indeterminate size="64"></v-progress-circular>
		<p class="mt-4">Đang tải đề bài...</p>
	</div>

	<div v-else>
		<!-- Header -->
		<AssignmentHeader :assignment="assignment" :mon-hoc-name="monHocName" :student="studentInfo" :draft="draft" />

		<!-- Result Card (if graded) - v-show thay vì v-if để tránh re-render -->
		<v-card v-show="isGraded" class="mx-2 mb-2" flat border>
			<v-card-text class="py-2">
				<div class="d-flex align-center flex-wrap ga-2">
					<v-chip color="primary" size="small" variant="outlined">
						<v-icon start size="16">mdi-trophy</v-icon>
						{{ draft?.Score }} / {{ assignment?.MaxScore }} điểm
					</v-chip>

					<v-chip size="small" color="success" variant="outlined">
						<v-icon start size="16">mdi-check-decagram</v-icon> Đã chấm
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
						v-html="draft?.TeacherComment"></div>
				</v-expand-transition>
			</v-card-text>
		</v-card>

		<v-row dense>
			<!-- Navigation Sidebar - Lazy load khi không phải mobile -->
			<v-col v-if="!isMobile" cols="12" sm="12" md="2" style="border-inline-end: 0.5px dashed #a7a2a2;">
				<QuestionNavigation :groups="assignment.groups" :user-answers="userAnswers"
					:current-group-index="currentGroupIndex" :current-question-index="currentQuestionIndexInGroup"
					v-model:view-mode="viewMode" :draft="draft" :get-icon-color="getIconColor"
					:get-status-icon="getQuestionStatusIcon" :get-question-number="getGlobalQuestionNumber"
					@navigate="navigateToQuestion" />
			</v-col>

			<!-- Main Content -->
			<v-col cols="12" md="10" class="pe-0">
				<!-- Single Question Mode -->
				<template v-if="viewMode === 'single'">
					<!-- Progress Bar -->
					<AssignmentProgress v-show="shouldShowProgress" :answered-count="answeredCount"
						:total-questions="totalQuestions" :progress-percent="progressPercent" :save-status="saveStatus"
						:save-status-color="saveStatusColor" :save-status-icon="saveStatusIcon"
						:is-submitted="isSubmitted" :is-graded="isGraded" @submit="handleSubmit" />

					<v-card v-if="currentQuestion?.config" class="question-content-card" style="overflow: auto;"
						:style="contentCardStyle">
						<div class="px-2">
							<GroupHeader :group="currentGroup" :answered-count="getGroupAnsweredCount(currentGroup)" />
						</div>

						<v-divider />

						<!-- Show all questions in group OR single question -->
						<component :is="'div'" v-if="currentGroup.isCheckShowAllQuestion">
							<QuestionCard v-for="question in currentGroup.questions" :key="question.id"
								:question="question" :question-number="getGlobalQuestionNumberByQuestionId(question.id)"
								:answer="getAnswerForChild(question)" :grading="userAnswers[question.id]?.grading"
								:readonly="isSubmitted" :submission-status="draft?.SubmissionStatus"
								:is-block-copy-paste="isBlockCopyPaste" :is-flagged="userAnswers[question.id]?.flag"
								:status="questionStatus(question.id, question.points)"
								:status-icon="getQuestionStatusIcon(question.id)"
								:icon-color="getIconColor(question.id)" class="px-2 pt-2 pb-0"
								@update:answer="updateAnswer(question.id, $event)" @flag="handleFlag(question.id)" />
						</component>

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

							<!-- Navigation Buttons - Sticky footer -->
							<v-divider class="mt-2"></v-divider>
							<v-card-actions class="pa-2 d-flex justify-space-between action-bar-sticky">
								<v-btn @click="prevQuestion" :disabled="isFirstQuestion" variant="text">
									<v-icon start>mdi-chevron-left</v-icon>Câu trước
								</v-btn>

								<div class="d-flex align-center ga-2">
									<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
										<v-icon start size="16">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
									</v-chip>

									<v-btn v-if="!isSubmitted" variant="outlined" color="success" size="small" @click="handleSubmit">
										<v-icon start>mdi-check-all</v-icon>Nộp bài
									</v-btn>

									<v-chip v-else color="success" size="small" label>
										<v-icon start>mdi-check-decagram</v-icon>
										{{ isGraded ? 'Đã chấm điểm' : 'Đã nộp bài' }}
									</v-chip>
								</div>

								<v-btn @click="nextQuestion" :disabled="isLastQuestion" variant="text">
									Câu sau<v-icon end>mdi-chevron-right</v-icon>
								</v-btn>
							</v-card-actions>
						</template>
					</v-card>
				</template>

				<!-- All Questions Mode - Virtual scroll cho danh sách dài -->
				<div v-else class="all-questions-mode" style="overflow: auto;" :style="contentCardStyle">
					<!-- Progress Bar -->
					<AssignmentProgress v-show="shouldShowProgress" class="my-2 mx-2"
						:answered-count="answeredCount" :total-questions="totalQuestions"
						:progress-percent="progressPercent" :save-status="saveStatus"
						:save-status-color="saveStatusColor" :save-status-icon="saveStatusIcon"
						:is-submitted="isSubmitted" :is-graded="isGraded" @submit="handleSubmit" />

					<!-- All Questions List -->
					<div class="questions-container">
						<div v-for="(group, groupIndex) in assignment.groups" :key="group.id"
							class="group-section mb-6">
							<GroupHeader :group="group" :answered-count="getGroupAnsweredCount(group)" />

							<div class="questions-in-group">
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
		props: {
			puseranswers: Object,
			assignmentData: Array,
			monHocName: String,
			onSaveDraft: { type: Function, default: () => { } },
			onOpenSubmitDialog: { type: Function, default: () => { } }
		},
		emits: ['update:puseranswers'],
	
		mixins: [
			useQuestionNavigation(),
			useAnswerTracking(),
			useAutoSave(),
			useQuestionStatus(),
			useCopyPasteBlocker()
		],
	
		data() {
			return {
				viewMode: 'all',
				navCollapsed: false,
				groupCollapsed: {},
				currentGroupIndex: 0,
				currentQuestionIndexInGroup: 0,
				vueData,
				isMobile: false,
				isTablet: false,
				toggleTC: false,
				intervalDurationTime: null,
				resizeHandler: null,
				_,
				// Cache
				questionComponentCache: new Map(),
				answerCache: new Map()
			};
		},
	
		computed: {
			userAnswers() {
				return this.puseranswers || {};
			},
	
			// Cache assignment parsing
			assignment() {
				if (!this.assignmentData?.[0]?.[0]) return null;
	
				const config = this.assignmentData[0][0];
				// Cache parsed config
				if (!config._cachedGroups) {
					if (config && typeof config.AssignmentConfig === 'string' && !config.groups) {
						try {
							const parsedConfig = JSON.parse(config.AssignmentConfig);
							if(this.assignmentData[1][0].SubmissionStatus == 4){
								parsedConfig = JSON.parse(config.AssignmentConfig_HadAnswer);
							}
							config._cachedGroups = parsedConfig.groups || [];
							config.groups = config._cachedGroups;
						} catch (e) {
							console.error('Error parsing AssignmentConfig:', e);
							config._cachedGroups = [];
							config.groups = [];
						}
					} else {
						config._cachedGroups = config.groups || [];
					}
				} else {
					config.groups = config._cachedGroups;
				}
	
				return config;
			},
	
			draft() {
				return this.assignmentData?.[1]?.[0] || null;
			},
	
			isSubmitted() {
				return this.draft?.SubmissionStatus >= 2;
			},
	
			isGraded() {
				return this.isSubmitted && this.draft?.SubmissionStatus === 4;
			},
	
			isBlockCopyPaste() {
				return this.assignment?.IsBlockCopy_Paste === true;
			},
	
			// Computed styles để tránh tính toán lại liên tục
			contentCardStyle() {
				return this.draft?.SubmissionStatus <= 2
					? { height: 'calc(100vh - 70px)' }
					: { height: 'calc(100vh - 111px)' };
			},
	
			shouldShowProgress() {
				return this.draft?.SubmissionStatus !== 4 && this.draft?.SubmissionStatus !== 3;
			},
	
			// Cache student info
			studentInfo() {
				return vueData.HocSinhDetail || {};
			},
	
			// Navigation helpers
			isFirstQuestion() {
				return this.globalQuestionNumber === 1;
			},
	
			isLastQuestion() {
				return this.globalQuestionNumber === this.totalQuestions;
			}
		},
	
		watch: {
			assignmentData: {
				handler(val) {
					if (val) {
						console.log('assignmentData changed');
						// Clear cache khi data thay đổi
						this.questionComponentCache.clear();
						this.answerCache.clear();
					}
				},
				deep: false // Chỉ watch shallow để tránh deep watch tốn performance
			},
	
			isMobile(val) {
				if (val) {
					this.viewMode = 'all';
				}
			}
		},
	
		created() {
			// Khởi tạo resize handler với throttle
			this.resizeHandler = _.throttle(() => {
				this.ResizeWindow();
			}, 200);
		},
	
		mounted() {
			window.addEventListener('resize', this.resizeHandler, { passive: true });
	
			this.ResizeWindow();
			this.initializeAnswers();
	
			// Time tracking với throttle
			if (this.assignmentData?.length > 0) {
				if (this.assignmentData[1]?.[0] && ![2, 3, 4].includes(this.assignmentData[1][0].SubmissionStatus)) {
					this.intervalDurationTime = setInterval(() => {
						this.InsertDurationTime(this.assignmentData[1][0]);
					}, 5000);
					this.InsertAccessTime(this.assignmentData[1][0]);
				}
			}
	
			// Copy/paste blocker
			if (this.isBlockCopyPaste) {
				this.addCopyPasteBlocker();
			}
		},
	
		methods: {
			ResizeWindow() {
				this.isMobile = window.innerWidth < 960;
				this.isTablet = window.innerWidth <= 1240;
			},
	
			// Cache answer data để tránh tính toán lại
			getAnswerForChild(question) {
				if (!question) return null;
	
				const cacheKey = question.id;
				if (this.answerCache.has(cacheKey)) {
					const cached = this.answerCache.get(cacheKey);
					const currentAnswer = this.userAnswers[question.id];
	
					// Validate cache
					if (cached.answer === currentAnswer?.answerData) {
						return cached.result;
					}
				}
	
				const answerObject = this.userAnswers[question.id];
				let result;
	
				if (question.type === 'FILE_UPLOAD') {
					result = (!answerObject || answerObject.answerData === undefined) ? [] : answerObject.answerData;
				} else {
					result = answerObject?.answerData;
				}
	
				// Cache result
				this.answerCache.set(cacheKey, {
					answer: answerObject?.answerData,
					result
				});
	
				return result;
			},
	
			// Optimize updateAnswer với debounce cho auto-save
			updateAnswer(questionId, newAnswer) {
				if (this.isSubmitted) return;
	
				const question = this.allQuestions.find(q => q.id === questionId);
				if (!question) {
					console.error(`Không tìm thấy cấu hình cho câu hỏi ID: ${questionId}`);
					return;
				}
	
				const newAnswers = { ...this.userAnswers };
				const currentAnswerObject = newAnswers[questionId] || {};
				let answerData;
	
				const questionType = question.type;
				const fileBasedTypes = ['FILE_UPLOAD', 'AUDIO_RESPONSE'];
				if (fileBasedTypes.includes(questionType)) {
					answerData = Array.isArray(newAnswer) ? newAnswer : [newAnswer];
				} else {
					answerData = newAnswer;
				}
	
				newAnswers[questionId] = {
					...currentAnswerObject,
					answerData,
					grading: {
						teacherComment: currentAnswerObject.grading?.teacherComment ?? '',
						comment: currentAnswerObject.grading?.comment ?? '',
					}
				};
	
				const manualComp = ['SHORT_ANSWER', 'ESSAY', 'FILE_UPLOAD', 'AUDIO_RESPONSE'];
				if (manualComp.includes(questionType)) {
					newAnswers[questionId].grading = {
						...newAnswers[questionId].grading,
						manualScore: null
					};
				}
	
				// Clear cache
				this.answerCache.delete(questionId);
	
				this.$emit('update:puseranswers', newAnswers);
				this.triggerAutoSave();
			},
	
			// Optimize initializeAnswers
			initializeAnswers() {
				if (this.draft?.SubmissionContent) {
					try {
						const asmConfigString = this.assignmentData?.[0]?.[0]?.AssignmentConfig;
						if (!asmConfigString) {
							console.error('AssignmentConfig is missing');
							this.$emit('update:puseranswers', {});
							return;
						}
	
						const asmData = JSON.parse(asmConfigString);
	
						if (!asmData?.groups || !Array.isArray(asmData.groups)) {
							console.error('Invalid AssignmentConfig structure');
							this.$emit('update:puseranswers', {});
							return;
						}
	
						let submissionContent = { answers: {} };
						if (this.draft.SubmissionContent) {
							try {
								submissionContent = JSON.parse(this.draft.SubmissionContent);
							} catch (e) {
								console.error('Error parsing SubmissionContent:', e);
								submissionContent = { answers: {} };
							}
						}
	
						const answers = submissionContent?.answers || {};
	
						// Batch process questions
						asmData.groups.forEach(group => {
							if (!group.questions || !Array.isArray(group.questions)) return;
	
							for (const question of group.questions) {
								if (!question.id) continue;
	
								// Chỉ tạo default structure nếu chưa có
								if (!answers[question.id]) {
									answers[question.id] = {
										answerData: null,
										flag: false,
										grading: {
											comment: null,
											teacherComment: null,
											manualScore: null,
										}
									};
								}
							}
						});
	
						this.$emit('update:puseranswers', answers);
					} catch (e) {
						console.error('Lỗi initializeAnswers:', e);
						this.$emit('update:puseranswers', {});
					}
				} else {
					this.saveDraft();
					if (this.assignment?.groups) {
						const initialCollapsed = {};
						this.assignment.groups.forEach((group, index) => {
							initialCollapsed[index] = false;
						});
						this.groupCollapsed = initialCollapsed;
					}
				}
			},
	
			toggleGroupCollapse(groupIndex) {
				this.groupCollapsed = {
					...this.groupCollapsed,
					[groupIndex]: !this.groupCollapsed[groupIndex]
				};
			},
	
			handleFlag(qid) {
				const newAnswers = { ...this.userAnswers };
	
				if (!newAnswers[qid]) {
					newAnswers[qid] = {
						answerData: null,
						flag: true,
						grading: {
							comment: null,
							teacherComment: null,
							manualScore: null
						}
					};
				} else {
					newAnswers[qid] = {
						...newAnswers[qid],
						flag: !newAnswers[qid]?.flag
					};
				}
	
				this.$emit('update:puseranswers', newAnswers);
				this.triggerAutoSave();
			},
	
			InsertDurationTime,
			InsertAccessTime,
	
			OnCancelIntervalDuration() {
				if (this.intervalDurationTime) {
					clearInterval(this.intervalDurationTime);
					this.intervalDurationTime = null;
				}
			},
	
			handleSubmit() {
				if (this.intervalDurationTime) {
					this.OnCancelIntervalDuration();
				}
				this.onOpenSubmitDialog();
			}
		},
	
		beforeUnmount() {
			// Cleanup
			if (this.resizeHandler) {
				window.removeEventListener('resize', this.resizeHandler);
				this.resizeHandler = null;
			}
	
			if (this.intervalDurationTime) {
				clearInterval(this.intervalDurationTime);
				this.intervalDurationTime = null;
			}
	
			if (this.autoSaveTimer) {
				clearTimeout(this.autoSaveTimer);
				this.autoSaveTimer = null;
			}
	
			if (this.isBlockCopyPaste) {
				this.removeCopyPasteBlocker();
			}
	
			// Clear caches
			this.questionComponentCache.clear();
			this.answerCache.clear();
		}
	}
</script>