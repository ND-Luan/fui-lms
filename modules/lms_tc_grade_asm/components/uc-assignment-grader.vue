<template>
	<div v-if="!assignment" class="text-center pa-10">
		<v-progress-circular indeterminate size="64" />
		<p class="mt-4">Đang tải dữ liệu bài nộp...</p>
	</div>

	<div v-else>
		<!-- Assignment Header -->
		<v-card class=" assignment-header rounded-0" color="primary" dark flat>
			<v-card-title class="d-flex justify-space-between">
				<span class="text-h5">Chấm bài: {{ assignment.Title }}</span>
				<div class="d-flex align-center ga-2 flex-wrap">
					<span><strong>Nộp bài lúc:</strong> {{ formatDate(submission.SubmissionTime) }}</span>
					<v-chip :color="getSubmissionStatusColor()" variant="elevated" size="small" class="progress-chip">
						{{ getSubmissionStatusText() }}
					</v-chip>
				</div>
				<span class="text-h6">Học sinh: {{ submission?.HoTenHocSinh }} - Lớp: {{ assignment?.TenLop
				}}</span>
			</v-card-title>
		</v-card>
		<v-row class="ma-0">
			<v-col cols="3">
				<v-card class="question-nav" sticky top="80px">
					<v-card-title class="d-flex justify-space-between align-center">
						Cấu trúc bài tập
						<v-btn icon size="small" @click="navCollapsed = !navCollapsed">
							<v-icon>{{ navCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
						</v-btn>
					</v-card-title>
					<v-divider />

					<v-expand-transition>
						<div v-show="!navCollapsed" class="pa-2">
							<div v-for="(group, groupIndex) in assignment.groups" :key="group.id" class="mb-2">
								<v-list-item @click="toggleGroupCollapse(groupIndex)"
									class="group-header-item px-2 py-1" density="compact">
									<template v-slot:prepend>
										<v-icon size="20" class="group-toggle-icon">
											{{ groupCollapsed[groupIndex] ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
										</v-icon>
									</template>
									<v-list-item-title class="group-title">{{ group.title }}</v-list-item-title>
									<template v-slot:append>
										<v-chip size="small" color="primary" variant="outlined">
											{{ group.questions.length }}
										</v-chip>
									</template>
								</v-list-item>

								<v-expand-transition>
									<div v-show="!groupCollapsed[groupIndex]" class="ml-4 mt-2">
										<div class="question-grid">
											<v-btn v-for="(q, questionIndexInGroup) in group.questions" :key="q.id"
												@click="navigateToQuestion(groupIndex, questionIndexInGroup, q.id)"
												:color="getGradingIconColor(q.id)"
												:variant="isActiveQuestion(groupIndex, questionIndexInGroup) ? 'elevated' : 'tonal'"
												class="question-btn" size="small">
												<v-icon size="16">{{ getGradingStatusIcon(q.id) }}</v-icon>
												{{ getGlobalQuestionNumber(groupIndex, questionIndexInGroup) }}
											</v-btn>
										</div>
									</div>
								</v-expand-transition>
							</div>
						</div>
					</v-expand-transition>
				</v-card>
			</v-col>
			<v-col cols="6" style="height: calc(100dvh - 48px); overflow: auto">
				<!-- Single Question Mode -->
				<div v-if="viewMode === 'single'">
					<v-row>
						<!-- Navigation Sidebar -->
						<!-- Single Question Grading Content -->
						<v-col cols="12" md="10" class="mx-auto" style="width: fit-content !important">
							<v-card v-if="currentQuestion?.config" class="question-content-card w-100">
								<v-card-title class="d-flex justify-space-between align-center">
									<div class="d-flex align-center ga-3">
										<span class="text-h6">Câu {{ globalQuestionNumber }}</span>
										<v-chip color="blue-grey-4" label>
											{{ currentGroup.title }}
										</v-chip>
									</div>
									<v-chip color="primary" variant="elevated" class="progress-chip">{{
										currentQuestion.points }}
										điểm</v-chip>
								</v-card-title>
								<v-divider />

								<!-- Group instruction -->
								<v-alert class="mt-2 mb-2" v-if="currentGroup.description" color="blue-lighten-5"
									border="start" border-color="info">
									<strong>Hướng dẫn phần {{ currentGroup.title }}:</strong>
									{{ currentGroup.description }}
								</v-alert>

								<!-- YOUTUBE, RECORD_AUDIO, IMAGE, FILE -->
								<!-- Media Container -->
								<div v-if="currentQuestion.config.media" class="media-container mb-4">
									<div v-if="currentQuestion.config.media.type === 'YOUTUBE' && currentQuestion.config.media.sourceYT.source.length > 0"
										class="youtube-container">
										<iframe :src="renderUrlYoutube(currentQuestion.config.media.sourceYT.source)"
											frameborder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen></iframe>
									</div>
									<uc-wave-audio-player
										v-else-if="currentQuestion.config.media.type === 'RECORD_AUDIO' && currentQuestion.config.media.sourceRecord.source.length > 0"
										v-model:audioUrl="currentQuestion.config.media.sourceRecord.source" />
									<div v-else-if="currentQuestion.config.media.type === 'IMAGE' && currentQuestion.config.media.sourceIMGs.length > 0"
										style="min-height: 400px">
										<v-img v-for="file in currentQuestion.config.media.sourceIMGs"
											:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
											:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
											class="rounded-lg" max-height="400">
											<template v-slot:placeholder>
												<v-row align="center" class="fill-height ma-0" justify="center">
													<v-progress-circular color="grey-lighten-5" indeterminate />
												</v-row>
											</template>
										</v-img>
									</div>
									<div
										v-else-if="currentQuestion.config.media.type === 'FILE' && currentQuestion.config.media.sourceFiles.length > 0">
										<iframe v-for="file in currentQuestion.config.media.sourceFiles"
											:src="file.source" style="width: 100%; height: 400px;"></iframe>
									</div>
								</div>

								<!-- Question text -->
								<!-- <div class="question-text mb-5" v-html="currentQuestion.config.questionText"></div> -->
								<uc-latex-view class="flex-column"
									:content="currentQuestion.config.questionText"></uc-latex-view>
								<!-- Grading Component -->
								<div class="answer-area" v-if="!isLoading">
									<component :is="getQuestionComponent(currentQuestion.type)"
										:question="currentQuestion"
										:answer="studentAnswers[currentQuestion.id] ? studentAnswers[currentQuestion.id].answerData : null"
										:grading="gradingData[currentQuestion.id] ? gradingData[currentQuestion.id]?.grading : null"
										:is-grade="true" @grading-change="updateGrading(currentQuestion.id, $event)"
										:submissionstatus="submission.SubmissionStatus" />
								</div>

								<!-- Single Mode Action Bar -->
								<v-divider></v-divider>
								<v-card-actions class="pa-4 d-flex justify-space-between">
									<v-btn @click="prevQuestion" :disabled="globalQuestionNumber === 1" variant="text">
										<v-icon start>mdi-chevron-left</v-icon>Câu trước
									</v-btn>

									<div class="d-flex align-center ga-3" v-if="submission?.SubmissionStatus !== 4">
										<v-btn @click="saveGrading(false)" color="grey-darken-1" variant="outlined"
											:loading="isSaving" size="small">
											<v-icon start>mdi-content-save-outline</v-icon>
											Chấm nháp
										</v-btn>

										<v-btn @click="saveGrading(true)" color="success" size="small"
											variant="elevated" :loading="isSaving">
											<v-icon start>mdi-send-check</v-icon>
											Hoàn tất & Trả bài
										</v-btn>
									</div>

									<v-btn @click="nextQuestion" :disabled="globalQuestionNumber === totalQuestions"
										variant="text">
										Câu sau
										<v-icon end>mdi-chevron-right</v-icon>
									</v-btn>
								</v-card-actions>
							</v-card>
						</v-col>
					</v-row>
				</div>

				<!-- All Questions Mode -->
				<div v-else class="all-questions-mode">
					<!-- Progress Summary -->
					<v-card class="mb-4 progress-summary" flat border>
						<v-card-text class="py-3">
							<div class="d-flex justify-space-between align-center flex-wrap ga-3">
								<div class="d-flex align-center ga-3 flex-wrap">
									<div class="progress-stats">
										<span class="text-subtitle-2 text-medium-emphasis">Tiến độ chấm:</span>
										<span class="text-h6 ml-1">{{ gradedCount }}/{{ totalQuestions }}</span>
									</div>
									<v-progress-linear :model-value="(gradedCount / totalQuestions) * 100"
										color="success" height="6" rounded
										class="progress-bar-inline"></v-progress-linear>
									<span class="text-caption text-medium-emphasis">
										{{ Math.round((gradedCount / totalQuestions) * 100) }}%
									</span>
								</div>

								<div class="d-flex align-center ga-2" v-if="submission?.SubmissionStatus !== 4">
									<v-btn @click="saveGrading(false)" color="grey-darken-1" variant="outlined"
										size="small" :loading="isSaving">
										<v-icon start size="16">mdi-content-save-outline</v-icon>Chấm nháp
									</v-btn>
									<v-btn @click="saveGrading(true)" color="success" size="small" variant="elevated"
										:loading="isSaving">
										<v-icon start size="16">mdi-send-check</v-icon>Hoàn tất & Trả bài
									</v-btn>
								</div>
							</div>
						</v-card-text>
					</v-card>

					<!-- All Questions List -->
					<div class="questions-container">
						<div v-for="(group, groupIndex) in assignment.groups" :key="group.id"
							class="group-section mb-6">
							<!-- Group Header (same as taker but with grading stats) -->
							<v-card class="group-header-card mb-3" flat border>
								<v-card-text class="py-4">
									<div class="d-flex justify-space-between align-center mb-2">
										<div class="d-flex align-center ga-3">
											<div class="group-icon-wrapper ">
												<v-icon color="primary" size="20">mdi-folder-text-outline</v-icon>
											</div>
											<div class="group-info">
												<h3 class="group-title-main">{{ group.title }}</h3>
												<div class="group-meta">
													<span class="text-caption text-medium-emphasis">{{
														group.questions.length }}
														câu hỏi</span>
													<span class="mx-2">•</span>
													<span class="text-caption text-medium-emphasis">Tối đa {{
														group.questions.reduce((sum, q) => sum + q.points, 0)}}
														điểm</span>
												</div>
											</div>
										</div>
										<div class="group-progress-badge">
											<v-chip color="success" variant="tonal" size="small" class=" status-badge">
												{{ getGroupGradedCount(group) }}/{{ group.questions.length }}
											</v-chip>
										</div>
									</div>
									<p v-if="group.description" class="group-description mb-0">
										{{ group.description }}
									</p>
								</v-card-text>
							</v-card>

							<!-- Questions in Group -->
							<div class="questions-in-group">
								<v-card v-for="(question, questionIndexInGroup) in group.questions" :key="question.id"
									class="question-card-all mb-3"
									:class="{ 'question-graded': isQuestionGraded(question.id) }" flat border
									:id="question.id">
									<!-- Question header (responsive) -->
									<div class="question-header-all-compact">
										<div class="d-flex flex-column ga-2 d-lg-flex d-none ">
											<!-- Desktop layout -->
											<div class="d-flex justify-space-between">
												<b style="flex-shrink: 0;display: inline-block;">
													<v-icon class="mb-1" :color="getGradingIconColor(question.id)" size="18">
														{{ getGradingStatusIcon(question.id) }}
													</v-icon>
													Câu {{ getGlobalQuestionNumberByQuestionId(question.id) }}:
												</b>
												<v-chip color="white" text-color="primary" variant="elevated"
													size="x-small"
													class="progress-chip status-badge points-chip-mobile">
													{{ question.points }} điểm
												</v-chip>
											</div>

											<uc-latex-view class="flex-column px-5" style="align-items: start !important;"
												:content="question.config.questionText" />
										</div>

										<div class="d-flex d-lg-none">
											<!-- Mobile layout -->
											<div class="question-meta-mobile">
												<div class="d-flex align-center ga-2">
													<v-icon :color="getGradingIconColor(question.id)" size="18">
														{{ getGradingStatusIcon(question.id) }}
													</v-icon>
													<span class="mobile-question-label">Câu {{
														getGlobalQuestionNumber(groupIndex, questionIndexInGroup)
													}}</span>
												</div>
												<v-chip color="white" text-color="primary" variant="elevated"
													size="x-small" class="points-chip-mobile">
													{{ question.points }}đ
												</v-chip>
											</div>
										</div>
									</div>

									<v-card-text class="question-content-compact pt-3 pb-4">
										<!-- Question text for mobile -->
										<div class="d-block d-lg-none mb-3">
											<!-- <div class="question-text-mobile" v-html="question.config.questionText">
											</div> -->
											<uc-latex-view class="flex-column"
												:content="question.config.questionText"></uc-latex-view>
										</div>

										<!-- YOUTUBE, RECORD_AUDIO, IMAGE, FILE -->
										<!-- Media Container -->
										<div v-if="question.config.media" class="media-container mb-4">
											<div
												v-if="question.config.media.type === 'YOUTUBE' && question.config.media.sourceYT.source.length > 0">
												<div class="youtube-container"
													v-if="question.config.media.sourceYT.source.length > 0">
													<iframe
														:src="renderUrlYoutube(question.config.media.sourceYT.source)"
														frameborder="0"
														allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
														allowfullscreen></iframe>
												</div>
												<v-container class="fill-height d-flex align-center justify-center py-8"
													v-else>
													<v-card class="pa-8 text-center mx-auto" max-width="720"
														elevation="2" rounded="sm">
														<div class="mb-4 d-flex justify-center">
															<v-avatar size="84" class="elevation-1"
																color="surface-variant">
																<v-icon size="48">mdi-link-off</v-icon>
															</v-avatar>
														</div>
														<h2 class="text-h4 mb-2">
															Không tìm thấy đường dẫn
														</h2>
													</v-card>
												</v-container>
											</div>
											<div
												v-else-if="question.config.media.type === 'RECORD_AUDIO' && question.config.media.sourceRecord.length > 0">
												<uc-wave-audio-player
													v-if="question.config.media.sourceRecord.length > 0"
													v-model:audioUrl="question.config.media.sourceRecord" />
												<v-container class="fill-height d-flex align-center justify-center py-8"
													v-else>
													<v-card class="pa-8 text-center mx-auto" max-width="720"
														elevation="2" rounded="sm">
														<div class="mb-4 d-flex justify-center">
															<v-avatar size="84" class="elevation-1"
																color="surface-variant">
																<v-icon size="48">mdi-link-off</v-icon>
															</v-avatar>
														</div>
														<h2 class="text-h4 mb-2">
															Không tìm thấy đường dẫn
														</h2>
													</v-card>
												</v-container>
											</div>

											<div v-else-if="question.config.media.type === 'IMAGE' && question.config.media.sourceIMGs.length > 0"
												style="min-height: 400px">
												<v-img v-for="file in question.config.media.sourceIMGs"
													:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
													:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
													class="rounded-lg" max-height="400">
													<template v-slot:placeholder>
														<v-row align="center" class="fill-height ma-0" justify="center">
															<v-progress-circular color="grey-lighten-5" indeterminate />
														</v-row>
													</template>
												</v-img>
											</div>
											<div
												v-else-if="question.config.media.type === 'FILE' && question.config.media.sourceFiles.length > 0">
												<iframe v-for="file in question.config.media.sourceFiles"
													:src="file.source" style="width: 100%; height: 400px;"></iframe>
											</div>


										</div>

										<!-- Grading component -->
										<div class="answer-section-compact" v-if="!isLoading">
											<component :is="getQuestionComponent(question.type)" :question="question"
												:answer="studentAnswers[question.id] ? studentAnswers[question.id].answerData : null"
												:grading="gradingData[question.id] ? gradingData[question.id].grading : null"
												:is-grade="true" @grading-change="updateGrading(question.id, $event)"
												:submissionstatus="submission.SubmissionStatus" />
										</div>
									</v-card-text>
								</v-card>
							</div>
						</div>
					</div>
				</div>
			</v-col>
			<v-col cols="3">
				<!-- View Mode Toggle (same as taker) -->
				<div class="d-flex justify-space-between align-center">
					<v-card-title class="ma-0">
						<v-icon left color="primary">mdi-clipboard-check-outline</v-icon>
						Tổng kết & Nhận xét chung
					</v-card-title>

				</div>

				<!-- Overall Grading Summary -->
				<v-card class="mb-2">
					<v-card-text>
						<v-row>
							<v-col cols="12">
								<v-btn-toggle v-model="viewMode" color="primary" variant="outlined" density="compact"
									divided mandatory size="small">
									<v-btn value="single" size="small">
										<v-icon size="16">mdi-numeric-1-box</v-icon>
										<span class="ml-1 d-none d-sm-inline">Từng câu</span>
									</v-btn>
									<v-btn value="all" size="small">
										<v-icon size="16">mdi-view-list</v-icon>
										<span class="ml-1 d-none d-sm-inline">Tất cả</span>
									</v-btn>
								</v-btn-toggle>
							</v-col>
							<v-col cols="12">
								<label class="font-weight-medium mb-2 d-block">Điểm tổng kết</label>
								<div class="d-flex align-center">

									<v-number-input v-model="gradingSummary.totalScore" label="Điểm"
										:max="assignment.MaxScore" :min="0" variant="outlined" density="compact"
										hide-details style="max-width: 100px;" control-variant="stacked" inset>
									</v-number-input>
									<span class="text-h6 ml-2 text-primary"> / {{ assignment.MaxScore }}</span>
									<span class="ml-1 text-caption">điểm</span>
								</div>
							</v-col>
							<v-col cols="12">
								<label class="font-weight-medium mb-2 d-block">Nhận xét chung cho toàn bài</label>
								<v-textarea v-model="gradingSummary.teacherComment" hide-details
									placeholder="Nhập nhận xét tổng quát về bài làm của học sinh..." />
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

			</v-col>
		</v-row>

	</div>
</template>

<script>
export default {
	name: 'uc-assignment-grader',
	props: {
		submissionData: Array,
		onSaveGradingDraft: { type: Function, default: () => { } },
		onPublishGrades: { type: Function, default: () => { } },
		onOpenPublishDialog: { type: Function, default: () => { } }
	},
	data() {
		return {
			viewMode: 'all', // 'single' or 'all'
			navCollapsed: false,
			groupCollapsed: {},
			currentGroupIndex: 0,
			currentQuestionIndexInGroup: 0,
			assignment: null,
			submission: null,
			studentAnswers: {},
			gradingData: {},
			gradingSummary: { totalScore: 0, teacherComment: '' },
			isSaving: false,
			isLoading: false,
		}
	},
	computed: {
		totalQuestions() {
			if (!this.assignment?.groups) return 0;
			return this.assignment.groups.reduce((total, group) => total + group.questions.length, 0);
		},
		currentGroup() { return this.assignment?.groups?.[this.currentGroupIndex]; },
		currentQuestion() { return this.currentGroup?.questions?.[this.currentQuestionIndexInGroup]; },
		globalQuestionNumber() {
			if (!this.assignment?.groups) return 1;
			return this.getGlobalQuestionNumber(this.currentGroupIndex, this.currentQuestionIndexInGroup);
		},
		allQuestions() {
			return this.assignment?.groups?.flatMap(group => group.questions) || [];
		},
		gradedCount() {
			return this.allQuestions.filter(q => this.isQuestionGraded(q.id)).length;
		}
	},
	methods: {

		async processData(data) {
			this.isLoading = true
			let promise = await new Promise((resolve, reject) => {
				if (!data || !data[0] || !data[1]) return;
				const assignmentConfig = data[0][0];
				if (assignmentConfig && (typeof assignmentConfig.AssignmentConfig === 'string' || typeof
					assignmentConfig.AssignmentConfig === 'object')) {
					assignmentConfig.groups = JSON.parse(assignmentConfig.AssignmentConfig)?.groups || [];
				}
				this.assignment = assignmentConfig;
				const submissionData = data[1][0];
				console.log('submissionData', submissionData)
				console.log('assignmentConfig', assignmentConfig)
				this.submission = submissionData;
				if (submissionData && submissionData?.SubmissionContent) {
					const content = JSON.parse(submissionData.SubmissionContent);

					// ====================================================================
					// == BẮT ĐẦU ĐOẠN CODE CẦN THÊM VÀO ==================================
					// ====================================================================

					const rawAnswers = content.answers || {};
					const allQuestions = this.assignment?.groups?.flatMap(group => group.questions) || [];

					// Duyệt qua từng câu trả lời để chuẩn hóa
					for (const questionId in rawAnswers) {
						const questionConfig = allQuestions.find(q => q.id === questionId);
						const answerObject = rawAnswers[questionId];

						if (questionConfig && answerObject && answerObject.answerData) {
							const type = questionConfig.type;
							const isArrayType = ['FILE_UPLOAD', 'AUDIO_RESPONSE'];

							// Nếu là loại câu hỏi yêu cầu mảng nhưng answerData không phải mảng,
							// hãy bọc nó trong một mảng.
							if (isArrayType.includes(type) && !Array.isArray(answerObject.answerData)) {
								answerObject.answerData = [answerObject.answerData];
							}
						}
					}

					// ====================================================================
					// == KẾT THÚC ĐOẠN CODE CẦN THÊM VÀO ===================================
					// ====================================================================

					this.studentAnswers = JSON.parse(JSON.stringify(content.answers || {}));
					this.gradingData = JSON.parse(JSON.stringify(content.answers || {}));
				}


				this.gradingSummary.totalScore = submissionData?.Score || 0;
				this.gradingSummary.teacherComment = submissionData?.TeacherComment || '';
				if (this.assignment?.groups) {
					const initialCollapsed = {};
					this.assignment.groups.forEach((group, index) => { initialCollapsed[index] = false });
					this.groupCollapsed = initialCollapsed;
				}
				resolve()
			})
			this.isLoading = false
		},

		isQuestionGraded(questionId) {
			const grading = this.gradingData[questionId]?.grading;
			return grading && (grading.manualScore !== null && grading.manualScore !== undefined);
		},

		getGroupGradedCount(group) {
			return group.questions.filter(q => this.isQuestionGraded(q.id)).length;
		},

		saveGrading(isPublishing) {
			let listQuestions = _.flatten(this.assignment.groups.map(q => { return [...q.questions] }))
			this.isSaving = true;
			this.calculateTotalScore();
			const payload = {
				SubmissionID: this.submission.SubmissionID,
				Score: this.gradingSummary.totalScore,
				TeacherComment: this.gradingSummary.teacherComment,
				SubmissionContent: JSON.stringify({ answers: this.gradingData })
			};
			console.log('payload', payload)
			if (isPublishing) {
				//Hàm warning những câu chưa chấm
				let messageQuestionsNotGrade = this.onHandleQuestionNotGrade(listQuestions)
				confirm({
					title: messageQuestionsNotGrade.length > 0 ? "Còn các câu hỏi chưa được chấm. Thầy/Cô xác nhận hoàn tất và trả bài?" : "Xác nhận hoàn tất chấm bài và trả bài cho học sinh?",
					message: messageQuestionsNotGrade.length > 0 ? ("Danh sách câu chưa chấm: " + messageQuestionsNotGrade) : "",
					action: () => {
						this.onPublishGrades(payload);
					}
				})
			} else {
				this.onSaveGradingDraft(payload);
			}
			setTimeout(() => { this.isSaving = false; }, 1500);
		},
		updateGrading(questionId, newGradingData) {
			const newGrading = { ...this.gradingData };
			const currentAnswer = newGrading[questionId] || {};
			newGrading[questionId] = { ...currentAnswer, grading: newGradingData };
			this.gradingData = newGrading;

			// Avoid tight recursive update loop
			setTimeout(() => {
				this.calculateTotalScore();
			}, 0);
			// this.calculateTotalScore();
		},
		calculateTotalScore() {
			let total = 0;
			this.allQuestions.forEach(q => {
				const grade = this.gradingData[q.id]?.grading;
				if (grade) {
					total += parseFloat(grade.autoScore || 0) + parseFloat(grade.manualScore || 0);
				}
			});
			this.gradingSummary.totalScore = parseFloat(total.toFixed(2));
		},
		getGradingStatusIcon(questionId) {
			const grading = this.gradingData[questionId]?.grading;
			if (!grading || (grading.manualScore === null || grading.manualScore === undefined)) return 'mdi-help-circle-outline';
			if (grading.isCorrect === true || grading.manualScore === this.getQuestionById(questionId)?.points) return 'mdi-check-circle';
			if (grading.isCorrect === false || grading.manualScore === 0) return 'mdi-close-circle';
			return 'mdi-minus-circle';
		},
		getGradingIconColor(questionId) {
			const grading = this.gradingData[questionId]?.grading;
			if (!grading || (grading.manualScore === null || grading.manualScore === undefined)) return 'grey';
			if (grading.isCorrect === true || grading.manualScore === this.getQuestionById(questionId)?.points) return 'success';
			if (grading.isCorrect === false || grading.manualScore === 0) return 'error';
			return 'warning';
		},
		getQuestionById(questionId) { return this.allQuestions.find(q => q.id === questionId); },
		isActiveQuestion(groupIndex, questionIndexInGroup) { return this.currentGroupIndex === groupIndex && this.currentQuestionIndexInGroup === questionIndexInGroup; },
		getQuestionComponent(type) {
			const map = {
				'QUIZ_SINGLE_CHOICE': 'uc-question-single-choice',
				'QUIZ_MULTIPLE_CHOICE': 'uc-question-multiple-choice',
				'QUIZ_TRUE_FALSE': 'uc-question-true-false',
				'QUIZ_FILL_IN_BLANK': 'uc-question-fill-in-blank',
				'QUIZ_MATCHING': 'uc-question-matching',
				'SHORT_ANSWER': 'uc-question-short-answer',
				'ESSAY': 'uc-question-essay',
				'FILE_UPLOAD': 'uc-question-file-upload',
				'AUDIO_RESPONSE': 'uc-question-audio-response',
				'QUIZ_MULTIPLE_TRUE_FALSE': 'uc-question-multiple-true-false'
			};
			return map[type] || 'div';
		},
		getSubmissionStatusColor() {
			switch (this.submission?.SubmissionStatus) {
				case 4: return 'success'; case 2: return 'info'; case 3: return 'purple'; default: return 'grey';
			}
		},
		getSubmissionStatusText() {
			switch (this.submission?.SubmissionStatus) {
				case 4: return 'Đã chấm bài và trả bài'; case 2: return 'Đã nộp'; case 3: return 'Đã chấm nháp'; default: return 'Chưa nộp';
			}
		},
		toggleGroupCollapse(groupIndex) { this.groupCollapsed = { ...this.groupCollapsed, [groupIndex]: !this.groupCollapsed[groupIndex] }; },
		navigateToQuestion(groupIndex, questionIndexInGroup, id) {
			if (this.viewMode == 'all') {
				document.getElementById(id).scrollIntoView({
					behavior: "smooth", // cuộn mượt
					block: "start" // vị trí hiển thị: start | center | end | nearest
				});
				return
			}
			this.currentGroupIndex = groupIndex;
			this.currentQuestionIndexInGroup = questionIndexInGroup;
			if (this.groupCollapsed[groupIndex]) {
				this.toggleGroupCollapse(groupIndex);
			}
		},
		prevQuestion() { if (this.currentQuestionIndexInGroup > 0) { this.currentQuestionIndexInGroup--; } else if (this.currentGroupIndex > 0) { this.currentGroupIndex--; this.currentQuestionIndexInGroup = this.assignment.groups[this.currentGroupIndex].questions.length - 1; } },
		nextQuestion() {
			if (!this.assignment || !this.assignment.groups) return;
			const currentGroup = this.assignment.groups[this.currentGroupIndex];
			if (this.currentQuestionIndexInGroup < currentGroup.questions.length - 1) { this.currentQuestionIndexInGroup++; } else if (this.currentGroupIndex < this.assignment.groups.length - 1) { this.currentGroupIndex++; this.currentQuestionIndexInGroup = 0; }
		},
		getGlobalQuestionNumber(groupIndex, questionIndexInGroup) {
			if (!this.assignment?.groups) return 1;
			let number = 1;
			for (let i = 0; i < groupIndex; i++) { number += this.assignment.groups[i].questions.length; }
			return number + questionIndexInGroup;
		},
		getDriveFileId(url) {
			const match = url.match(/\/d\/([^/]+)\//);
			return match ? match[1] : null;
		},
		submitPoints() {

		},
		formatDate(dateString) { if (!dateString) return 'Chưa có thông tin'; const date = new Date(dateString); return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); },
		onHandleQuestionNotGrade(listQuestions) {
			//Lấy id những câu hỏi có manualScore = null
			let listQuestionsNotGrade = _.keys(_.pickBy(this.gradingData, (value) => { return value.grading.manualScore == null }))
			//Xử lấy show các câu hỏi chưa chấm
			let getNumberQuestionNotGrade = _.reduce(listQuestions, (result, q, index) => {
				if (listQuestionsNotGrade.includes(q.id)) result.push('Câu ' + (index + 1))
				return result
			}, [])
			return getNumberQuestionNotGrade.length > 0 ? getNumberQuestionNotGrade.join(', ') : ''
		},
		renderUrlYoutube,
		getGlobalQuestionNumberByQuestionId(questionId) {
			if (!this.allQuestions) return 0;
			const index = this.allQuestions.findIndex(q => q.id === questionId);
			return index + 1;
		},
	},
	watch: {
		submissionData: {
			handler: 'processData',
			immediate: true,
			// deep: true
		}
	}
}
</script>

<style>
.progress-chip {
	max-width: none !important;
	white-space: nowrap;
}

.status-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background-color: #eaf5eb;
	color: #34a853;
	border-radius: 9999px;
	font-weight: 600;
	font-size: 14px;
	padding: 2px 10px;
	line-height: 1;
	min-width: 40px;
	height: 24px;
}
</style>