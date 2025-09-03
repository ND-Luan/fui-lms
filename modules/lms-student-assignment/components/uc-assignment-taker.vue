<template>
	<div v-if="!assignment" class="text-center pa-10">
		<v-progress-circular indeterminate size="64"></v-progress-circular>
		<p class="mt-4">Đang tải đề bài...</p>
	</div>

	<div v-else>
		<!-- COMPACT HEADER -->
		<v-card class="mb-3" flat border>
			<v-card-text class="py-2">
				<div class="d-flex align-center flex-wrap ga-2">
					<div class="d-flex align-center ga-2">
						<v-icon color="primary">mdi-book-open-variant</v-icon>
						<span class="font-weight-medium text-truncate" style="max-width: 38ch;">
							{{ assignment.Title }}
						</span>
						<v-chip size="x-small" variant="tonal" color="primary">{{ monHocName }}</v-chip>
					</div>

					<v-divider vertical class="mx-2 d-none d-md-block"></v-divider>

					<div class="d-flex align-center ga-2">
						<v-icon size="18">mdi-account</v-icon>
						<span class="text-caption">
							{{ vueData.HocSinhDetail?.HoTen }} • {{ vueData.HocSinhDetail?.TenLop }}
						</span>
					</div>

					<v-spacer />

					<!-- Hạn nộp + trạng thái -->
					<v-chip size="x-small" :color="dueDateStatus.color" :variant="dueDateStatus.variant" class="mr-1">
						<v-icon start size="14" :icon="dueDateStatus.icon"></v-icon>
						{{ dueDateStatus.text }}
					</v-chip>
					<span class="text-caption text-medium-emphasis">{{ formatDate(assignment.DueDate) }}</span>

					<!-- Hướng dẫn gọn -->
					<v-tooltip text="Hướng dẫn">
						<template #activator="{ props }">
							<v-btn v-bind="props" icon="mdi-information-outline" variant="text" density="comfortable"
								@click="showInstructions = !showInstructions" />
						</template>
					</v-tooltip>
				</div>

				<v-expand-transition>
					<v-alert v-if="showInstructions && assignment.Instructions" class="mt-2" density="comfortable"
						variant="tonal" type="info">
						{{ assignment.Instructions }}
					</v-alert>
				</v-expand-transition>
			</v-card-text>
		</v-card>

		<!-- COMPACT RESULT (nếu đã chấm) -->
		<v-card v-if="isGraded" class="mx-2 mb-3" flat border>
			<v-card-text class="py-2">
				<div class="d-flex align-center flex-wrap ga-2">
					<v-chip color="primary" size="small" variant="tonal">
						<v-icon start size="16">mdi-trophy</v-icon>
						{{ draft.Score }} / {{ assignment.MaxScore }} điểm
					</v-chip>

					<v-chip size="small" color="success" variant="outlined">
						<v-icon start size="16">mdi-check-decagram</v-icon> Đã chấm
					</v-chip>

					<v-spacer />

					<v-btn v-if="draft.TeacherComment?.trim()" size="small" variant="text"
						@click="toggleTC = !toggleTC">
						<v-icon start size="16">mdi-comment-quote-outline</v-icon>
						{{ toggleTC ? 'Ẩn nhận xét' : 'Xem nhận xét' }}
					</v-btn>
				</div>

				<v-expand-transition>
					<div v-if="toggleTC && draft.TeacherComment?.trim()" class="mt-2 text-body-2"
						v-html="draft.TeacherComment"></div>
				</v-expand-transition>
			</v-card-text>
		</v-card>

		<v-row dense>
			<!-- NAV -->
			<v-col cols="12" sm="12" md="4" v-if="!isMobile" style="border-inline-end: 0.5px dashed #a7a2a2;">
				<v-card class="question-nav" sticky top="80px" flat>
					<div class="d-flex justify-end mb-2" v-if="isTablet">
						<v-btn-toggle v-model="viewMode" color="primary" variant="outlined" density="compact" divided
							mandatory size="x-small">
							<v-btn value="single" size="x-small">
								<v-icon size="16">mdi-numeric-1-box</v-icon>
								<span class="ml-1 d-none d-sm-inline">Từng câu</span>
							</v-btn>
							<v-btn value="all" size="x-small">
								<v-icon size="16">mdi-view-list</v-icon>
								<span class="ml-1 d-none d-sm-inline">Tất cả</span>
							</v-btn>
						</v-btn-toggle>
					</div>

					<v-card-title class="d-flex justify-space-between align-center header-respondsive-fs py-2">
						Cấu trúc bài tập
						<div class="d-flex ga-2 align-center">
							<div class="d-flex justify-end" v-if="!isTablet">
								<v-btn-toggle v-model="viewMode" color="primary" variant="outlined" density="compact"
									divided mandatory size="x-small">
									<v-btn value="single" size="x-small">
										<v-icon size="16">mdi-numeric-1-box</v-icon>
										<span class="ml-1 d-none d-sm-inline">Từng câu</span>
									</v-btn>
									<v-btn value="all" size="x-small">
										<v-icon size="16">mdi-view-list</v-icon>
										<span class="ml-1 d-none d-sm-inline">Tất cả</span>
									</v-btn>
								</v-btn-toggle>
							</div>
							<v-btn icon size="small" @click="navCollapsed = !navCollapsed">
								<v-icon>{{ navCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
							</v-btn>
						</div>
					</v-card-title>

					<v-divider></v-divider>

					<v-expand-transition>
						<div v-show="!navCollapsed" class="pa-2 pb-0">
							<div v-for="(group, groupIndex) in assignment.groups" :key="group.id" class="mb-2">
								<v-list-item @click="toggleGroupCollapse(groupIndex)"
									class="group-header-item px-2 py-1" density="compact">
									<template #prepend>
										<v-icon size="20" class="group-toggle-icon">
											{{ groupCollapsed[groupIndex] ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
										</v-icon>
									</template>
									<v-list-item-title class="group-title body-respondsive-fs">{{ group.title }}
									</v-list-item-title>
									<template #append>
										<v-chip size="x-small" color="primary" variant="outlined">
											{{ group.questions.length }} câu
										</v-chip>
									</template>
								</v-list-item>

								<v-expand-transition>
									<div v-show="!groupCollapsed[groupIndex]" class="ml-4 mt-2">
										<div class="question-grid">
											<v-btn v-for="(q, questionIndexInGroup) in group.questions" :key="q.id"
												@click="navigateToQuestion(groupIndex, questionIndexInGroup)"
												:color="getIconColor(q.id)"
												:variant="isActiveQuestion(groupIndex, questionIndexInGroup) ? 'elevated' : 'tonal'"
												class="question-btn" :size="isMobile ? 'x-small' : 'small'">
												<v-icon size="16">{{ getQuestionStatusIcon(q.id) }}</v-icon>
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

			<!-- CONTENT -->
			<v-col cols="12" md="8">
				<div v-if="viewMode === 'single'">
					<!-- COMPACT PROGRESS (sticky nhỏ gọn cho chế độ single cũng được, nhưng giữ nguyên logic lưu) -->
					<v-card class="mb-3 mx-2" flat border>
						<v-card-text class="py-2">
							<div class="d-flex align-center ga-3">
								<v-progress-linear :model-value="progressPercent" color="primary" rounded :height="20">
									<template v-slot:default="{ value }">
										<span class="text-caption text-medium-emphasis">
											{{ answeredCount }}/{{ totalQuestions }}
											({{ Math.round(value) }}%)
										</span>
									</template>
								</v-progress-linear>

								<v-spacer />
								<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
									<v-icon start size="16">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
								</v-chip>
								<v-btn v-if="!isSubmitted" color="success" size="small" @click="onOpenSubmitDialog">
									<v-icon start size="16">mdi-check-all</v-icon>Nộp bài
								</v-btn>
								<v-chip v-else color="success" size="small" label>
									<v-icon start size="14">mdi-check-decagram</v-icon>
									{{ isGraded ? 'Đã chấm điểm' : 'Đã nộp bài' }}
								</v-chip>
							</div>
						</v-card-text>
					</v-card>

					<v-card v-if="currentQuestion?.config" class="question-content-card">
						<v-card-title class="d-flex justify-space-between align-center py-2">
							<div class="d-flex align-center ga-3">
								<v-chip color="blue-grey-4" size="small" label>{{ currentGroup.title }}</v-chip>
							</div>
							<div class="d-flex align-center ga-2">
								<v-chip color="primary" variant="outlined" size="small">
									{{ currentQuestion.points }}đ
								</v-chip>
								<v-chip class="ml-2" size="x-small" v-if="currentQuestion"
									:color="questionStatus(currentQuestion.id, currentQuestion.points).color"
									:variant="questionStatus(currentQuestion.id, currentQuestion.points).variant">
									{{ questionStatus(currentQuestion.id, currentQuestion.points).label }}
								</v-chip>
							</div>
						</v-card-title>

						<v-divider></v-divider>

						<v-card-text class="px-3 pt-3 pb-0">
							<!-- Question text -->
							<div class="d-flex ga-2">
								<b class="responsive-fs-title" style="flex-shrink: 0;display: inline-block;">
									Câu {{ getGlobalQuestionNumberByQuestionId(currentQuestion.id) }}:
								</b>
								<uc-latex-view class="question-text body-respondsive-fs flex-column ga-2"
									style="align-items: unset !important"
									v-model:content="currentQuestion.config.questionText" />
							</div>

							<!-- Group instruction  -->
							<v-alert v-if="currentGroup.description" color="blue-5" variant="tonal" class="mb-4"
								border="start" border-color="info" density="comfortable">
								<strong>Hướng dẫn phần {{ currentGroup.title }}:</strong> {{ currentGroup.description }}
							</v-alert>

							<!-- Media -->
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
									<v-img v-for="file in currentQuestion.config.media.sourceIMGs" :key="file.source"
										:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
										:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
										class="rounded-lg" max-height="400">
										<template #placeholder>
											<v-row align="center" class="fill-height ma-0" justify="center">
												<v-progress-circular color="grey-lighten-5" indeterminate />
											</v-row>
										</template>
									</v-img>
								</div>
								<div
									v-else-if="currentQuestion.config.media.type === 'FILE' && currentQuestion.config.media.sourceFiles.length > 0">
									<iframe v-for="file in currentQuestion.config.media.sourceFiles" :key="file.source"
										:src="file.source" style="width: 100%; height: 400px;"></iframe>
								</div>
							</div>

							<!-- Answer area -->
							<div class="answer-area">
								<component :is="getQuestionComponent(currentQuestion.type)" :question="currentQuestion"
									:answer="getAnswerForChild(currentQuestion)"
									:grading="userAnswers[currentQuestion.id]?.grading" :isGrade="false"
									@answer-change="updateAnswer(currentQuestion.id, $event)" :readonly="isSubmitted"
									:submissionstatus="draft?.SubmissionStatus" :max-points="currentQuestion.points"
									:student-comment="userAnswers[currentQuestion.id]?.grading?.comment || ''" />
							</div>
						</v-card-text>

						<!-- Action Bar -->
						<v-divider></v-divider>
						<v-card-actions class="pa-3 d-flex justify-space-between">
							<v-btn @click="prevQuestion" :disabled="globalQuestionNumber === 1" variant="text">
								<v-icon start>mdi-chevron-left</v-icon>Câu trước
							</v-btn>

							<div class="d-flex align-center ga-3">
								<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
									<v-icon start size="16">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
								</v-chip>

								<v-btn v-if="!isSubmitted" color="success" size="small" @click="onOpenSubmitDialog">
									<v-icon start>mdi-check-all</v-icon>Nộp bài
								</v-btn>

								<v-chip v-else color="success" size="small" label>
									<v-icon start>mdi-check-decagram</v-icon>
									{{ isGraded ? 'Đã chấm điểm' : 'Đã nộp bài' }}
								</v-chip>
							</div>

							<v-btn @click="nextQuestion" :disabled="globalQuestionNumber === totalQuestions"
								variant="text">
								Câu sau<v-icon end>mdi-chevron-right</v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</div>

				<div v-else class="all-questions-mode">
					<!-- COMPACT PROGRESS (All mode) -->
					<v-card class="mb-3 mx-2" flat border style="position: sticky; top: 0px; z-index: 50;">
						<v-card-text class="py-2">
							<div class="d-flex align-center flex-wrap ga-3">
								<v-progress-linear :model-value="progressPercent" color="primary" rounded :height="20">
									<template v-slot:default="{ value }">
										<span class="text-caption text-medium-emphasis">
											{{ answeredCount }}/{{ totalQuestions }}
											({{ Math.round(value) }}%)
										</span>
									</template>
								</v-progress-linear>
								<v-spacer />
								<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
									<v-icon start size="14">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
								</v-chip>
								<v-btn v-if="!isSubmitted" color="success" size="small" @click="onOpenSubmitDialog">
									<v-icon start size="16">mdi-check-all</v-icon>Nộp bài
								</v-btn>
								<v-chip v-else color="success" label size="small">
									<v-icon start size="14">mdi-check-decagram</v-icon>
									{{ isGraded ? 'Đã chấm điểm' : 'Đã nộp bài' }}
								</v-chip>
							</div>
						</v-card-text>
					</v-card>

					<!-- All Questions List -->
					<div class="questions-container">
						<div v-for="(group, groupIndex) in assignment.groups" :key="group.id"
							class="group-section mb-6">
							<v-card class="group-header-card mb-3" flat border>
								<v-card-text class="py-3">
									<div class="d-flex justify-space-between align-center">
										<div class="d-flex align-center ga-3">
											<div class="group-icon-wrapper">
												<v-icon color="primary" size="20">mdi-folder-text-outline</v-icon>
											</div>
											<div class="group-info">
												<h3 class="group-title-main">{{ group.title }}</h3>
												<div class="group-meta">
													<span class="text-caption text-medium-emphasis">{{
														group.questions.length }} câu hỏi</span>
													<span class="mx-2">•</span>
													<span class="text-caption text-medium-emphasis">
														Tối đa {{ group.questions.reduce((sum, q) => sum + q.points, 0)
														}} điểm
													</span>
												</div>
											</div>
										</div>
										<div class="group-progress-badge">
											<v-chip color="primary" variant="tonal" size="small"
												class="progress-chip justify-center">
												{{ getGroupAnsweredCount(group) }}/{{ group.questions.length }}
											</v-chip>
										</div>
									</div>
									<p v-if="group.description" class="group-description mb-0">
										{{ group.description }}
									</p>
								</v-card-text>
							</v-card>

							<div class="questions-in-group">
								<v-card v-for="(question, questionIndexInGroup) in group.questions" :key="question.id"
									class="question-card-all mb-3"
									:class="{ 'question-answered': isAnswered(question.id) }" flat border>
									<!-- Compact header -->
									<div class="question-header-all-compact">
										<div v-if="!isMobile" class="d-flex ga-2">
											<v-icon :color="getIconColor(question.id)" size="18">
												{{ getQuestionStatusIcon(question.id) }}
											</v-icon>
											<b style="flex-shrink: 0;display: inline-block;">
												Câu {{ getGlobalQuestionNumber(groupIndex, questionIndexInGroup) }}:
											</b>
											<uc-latex-view class="question-text-compact flex-grow-1 flex-column"
												v-model:content="question.config.questionText"
												style="align-items: flex-start !important;" />
											<v-chip text-color="primary" variant="outlined" size="x-small"
												class="points-chip-mobile" style="min-width: 30px">
												{{ question.points }}đ
											</v-chip>
											<v-chip class="ml-2" size="x-small"
												:color="questionStatus(question.id, question.points).color"
												:variant="questionStatus(question.id, question.points).variant">
												{{ questionStatus(question.id, question.points).label }}
											</v-chip>
										</div>

										<div v-else class="d-flex flex-column">
											<div class="d-flex ga-2 align-center"
												style="flex-shrink: 0;display: inline-block;">
												<v-icon :color="getIconColor(question.id)" size="18">
													{{ getQuestionStatusIcon(question.id) }}
												</v-icon>
												<b class="mt-1">
													Câu {{ getGlobalQuestionNumber(groupIndex, questionIndexInGroup) }}:
												</b>
												<v-spacer></v-spacer>
												<v-chip text-color="primary" variant="outlined" size="x-small"
													class="points-chip-mobile" style="min-width: 30px">
													{{ question.points }}đ
												</v-chip>
											</div>
											<uc-latex-view class="question-text-compact flex-column flex-grow-1 px-2"
												v-model:content="question.config.questionText"
												style="align-items: flex-start !important;" />
										</div>
									</div>

									<v-card-text class="question-content-compact pt-3 pb-4">
										<!-- Media -->
										<div v-if="question.config.media" class="media-container mb-4">
											<div v-if="question.config.media.type === 'YOUTUBE' && question.config.media.sourceYT.source.length > 0"
												class="youtube-container">
												<iframe :src="renderUrlYoutube(question.config.media.sourceYT.source)"
													frameborder="0"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowfullscreen></iframe>
											</div>
											<uc-wave-audio-player
												v-else-if="question.config.media.type === 'RECORD_AUDIO' && question.config.media.sourceRecord.source.length > 0"
												v-model:audioUrl="question.config.media.sourceRecord.source" />
											<div v-else-if="question.config.media.type === 'IMAGE' && question.config.media.sourceIMGs.length > 0"
												style="min-height: 400px">
												<v-img v-for="file in question.config.media.sourceIMGs"
													:key="file.source"
													:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
													:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
													class="rounded-lg" max-height="400">
													<template #placeholder>
														<v-row align="center" class="fill-height ma-0" justify="center">
															<v-progress-circular color="grey-lighten-5" indeterminate />
														</v-row>
													</template>
												</v-img>
											</div>
											<div
												v-else-if="question.config.media.type === 'FILE' && question.config.media.sourceFiles.length > 0">
												<iframe v-for="file in question.config.media.sourceFiles"
													:key="file.source" :src="file.source"
													style="width: 100%; height: 400px;"></iframe>
											</div>
										</div>

										<!-- Answer -->
										<div class="answer-section-compact">
											<component :is="getQuestionComponent(question.type)" :question="question"
												:answer="getAnswerForChild(question)"
												:grading="userAnswers[question.id]?.grading" :isGrade="false"
												@answer-change="updateAnswer(question.id, $event)"
												:readonly="isSubmitted" :submissionstatus="draft?.SubmissionStatus"
												:max-points="question.points"
												:student-comment="userAnswers[question.id]?.grading?.comment || ''" />
										</div>
									</v-card-text>
								</v-card>
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
		data() {
			return {
				viewMode: 'single',
				navCollapsed: false,
				groupCollapsed: {},
				currentGroupIndex: 0,
				currentQuestionIndexInGroup: 0,
				saveStatus: 'Đã lưu',
				saveStatusColor: 'grey',
				saveStatusIcon: 'mdi-cloud-check-outline',
				isSaving: false,
				autoSaveTimer: null,
				vueData,
				isMobile: false,
				isTablet: false,
				showInstructions: false,
				toggleTC: false
			}
		},
		computed: {
			userAnswers() {
				return this.puseranswers || {};
			},
			assignment() {
				if (!this.assignmentData || !this.assignmentData[0] || !this.assignmentData[0][0]) { return null; }
				const config = this.assignmentData[0][0];
				if (config && typeof config.AssignmentConfig === 'string' && !config.groups) {
					try { config.groups = JSON.parse(config.AssignmentConfig).groups || []; } catch (e) { config.groups = []; }
				}
				return config;
			},
			draft() {
				if (!this.assignmentData || !this.assignmentData[1] || !this.assignmentData[1][0]) { return null; }
				return this.assignmentData[1][0];
			},
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
			isSubmitted() { return this.draft?.SubmissionStatus >= 2; },
			isGraded() { return this.isSubmitted && this.draft?.SubmissionStatus === 4; },
			allQuestions() { return this.assignment?.groups?.flatMap(group => group.questions) || []; },
			dueDateStatus() {
				if (!this.assignment?.DueDate) {
					return { color: 'grey', variant: 'outlined', icon: 'mdi-calendar-blank', text: 'Không giới hạn' };
				}
				const now = new Date();
				const dueDate = new Date(this.assignment.DueDate);
				const timeDiff = dueDate.getTime() - now.getTime();
				const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
				const hoursDiff = Math.ceil(timeDiff / (1000 * 3600));
	
				if (timeDiff < 0) return { color: 'error', variant: 'elevated', icon: 'mdi-clock-alert-outline', text: 'Quá hạn' };
				if (hoursDiff <= 24) return { color: 'warning', variant: 'elevated', icon: 'mdi-clock-fast', text: hoursDiff <= 1 ? 'Gấp!' : `Còn ${hoursDiff}h` };
				if (daysDiff <= 3) return { color: 'orange', variant: 'elevated', icon: 'mdi-clock-outline', text: `Còn ${daysDiff} ngày` };
				return { color: 'success', variant: 'tonal', icon: 'mdi-clock-check-outline', text: daysDiff <= 7 ? `Còn ${daysDiff} ngày` : 'Trong hạn' };
			},
			answeredCount() { return this.allQuestions.filter(q => this.isAnswered(q.id)).length; },
			progressPercent() {
				if (!this.totalQuestions) return 0;
				return (this.answeredCount / this.totalQuestions) * 100;
			}
		},
		mounted() {
			window.addEventListener('resize', () => { this.ResizeWindow() })
			this.ResizeWindow()
		},
		methods: {
			ResizeWindow() {
				this.isMobile = window.innerWidth < 960
				this.isTablet = window.innerWidth <= 1240
			},
			isActiveQuestion(groupIndex, questionIndexInGroup) {
				return this.currentGroupIndex === groupIndex && this.currentQuestionIndexInGroup === questionIndexInGroup;
			},
			getAnswerForChild(question) {
				const answerObject = this.userAnswers[question.id];
				if (question.type === 'FILE_UPLOAD') {
					if (!answerObject || answerObject.answerData === undefined) return [];
				} else {
					if (!answerObject || answerObject.answerData === undefined) return null;
				}
				return answerObject.answerData;
			},
			updateAnswer(questionId, newAnswer) {
				if (this.isSubmitted) return;
	
				const newAnswers = { ...this.userAnswers };
				const currentAnswerObject = newAnswers[questionId] || {};
				let answerData;
	
				const question = this.allQuestions.find(q => q.id === questionId);
				if (!question) { console.error(`Không tìm thấy cấu hình cho câu hỏi ID: ${questionId}`); return; }
	
				const questionType = question.type;
				const fileBasedTypes = ['FILE_UPLOAD', 'AUDIO_RESPONSE'];
				if (fileBasedTypes.includes(questionType)) { answerData = Array.isArray(newAnswer) ? newAnswer : [newAnswer]; }
				else { answerData = newAnswer; }
	
				newAnswers[questionId] = {
					...currentAnswerObject,
					answerData,
					grading: { teacherComment: null, comment: null }
				};
	
				const manualComp = ['SHORT_ANSWER', 'ESSAY', 'FILE_UPLOAD', 'AUDIO_RESPONSE'];
				if (manualComp.includes(questionType)) {
					newAnswers[questionId].grading = { ...newAnswers[questionId].grading, manualScore: null }
				}
	
				this.$emit('update:puseranswers', newAnswers);
	
				this.saveStatus = 'Đang soạn...';
				this.saveStatusColor = 'orange';
				this.saveStatusIcon = 'mdi-pencil-outline';
				if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
				this.autoSaveTimer = setTimeout(this.saveDraft, 3000);
			},
			async saveDraft() {
				if (this.isSaving || this.isSubmitted) return;
				this.isSaving = true;
				this.saveStatus = 'Đang lưu...';
				this.saveStatusColor = 'blue';
				this.saveStatusIcon = 'mdi-cloud-upload-outline';
	
				const payload = {
					AssignToClassID: this.assignment.AssignToClassID,
					SubmissionContent: JSON.stringify({ answers: this.userAnswers }),
					SubmissionStatus: 1,
					HocSinhID: vueData.HocSinhDetail.HocSinhID
				};
				this.onSaveDraft(payload).then(() => {
					this.isSaving = false;
					this.saveStatus = 'Đã lưu';
					this.saveStatusColor = 'grey';
					this.saveStatusIcon = 'mdi-cloud-check-outline';
				});
			},
	
			// Điểm thực tế của câu
			getQuestionScore(questionId) {
				const g = this.userAnswers?.[questionId]?.grading
				if (!g) return null
				let s = 0, has = false
				if (typeof g.autoScore === 'number') { s += g.autoScore; has = true }
				if (typeof g.manualScore === 'number') { s += g.manualScore; has = true }
				return has ? s : null
			},
	
			// Chip trạng thái câu
			questionStatus(questionId, maxPoint) {
				const answered = this.isAnswered(questionId)
				if (!this.isSubmitted) {
					return answered ? { label: 'Đã TL', color: 'primary', variant: 'tonal' }
						: { label: 'Chưa TL', color: 'grey', variant: 'tonal' }
				}
				if (!this.isGraded) return { label: 'Chờ chấm', color: 'grey', variant: 'tonal' }
	
				if (!answered) return { label: 'Chưa TL', color: 'grey', variant: 'tonal' }
				const s = this.getQuestionScore(questionId)
				if (s === null) return { label: 'Chờ chấm', color: 'grey', variant: 'tonal' }
				if (s <= 0) return { label: 'Sai', color: 'error', variant: 'tonal' }
				if (s >= (maxPoint ?? 0)) return { label: 'Đúng', color: 'success', variant: 'tonal' }
				return { label: 'Một phần', color: 'warning', variant: 'tonal' }
			},
	
			initializeAnswers() {
				if (this.draft) {
					try {
						const asmConfigString = this.assignmentData[0][0]?.AssignmentConfig
						const asmData = JSON.parse(asmConfigString)
						const submissionContent = JSON.parse(this.draft.SubmissionContent) || { answers: {} }
						const answers = submissionContent.answers
	
						asmData.groups.forEach(group => {
							for (var question of group.questions) {
								answers[question.id] = {
									answerData: answers[question.id]?.answerData || null,
									grading: {
										comment: answers[question.id]?.grading?.comment || null,
										teacherComment: answers[question.id]?.grading?.teacherComment || null,
										manualScore: answers[question.id]?.grading?.manualScore || null,
									}
								}
							}
						})
						this.$emit('update:puseranswers', answers || {});
					} catch (e) {
						this.$emit('update:puseranswers', {});
					}
				} else {
					this.$emit('update:puseranswers', {});
				}
	
				if (this.assignment?.groups) {
					const initialCollapsed = {};
					this.assignment.groups.forEach((group, index) => { initialCollapsed[index] = false });
					this.groupCollapsed = initialCollapsed;
				}
			},
			getQuestionStatusIcon(questionId) {
				if (this.isGraded) {
					const grading = this.userAnswers[questionId]?.grading;
					if (!grading) return 'mdi-minus-circle-outline';
					const isCorrect = grading.isCorrect === true || (grading.autoScore > 0) || (grading.manualScore > 0);
					return isCorrect ? 'mdi-check-circle' : 'mdi-close-circle';
				}
				if (this.isAnswered(questionId)) { return 'mdi-pencil-circle'; }
				const num = this.getGlobalQuestionNumberByQuestionId(questionId);
				return `mdi-numeric-${num}-box-outline`;
			},
			getIconColor(questionId) {
				if (this.isGraded) {
					const grading = this.userAnswers[questionId]?.grading;
					if (!grading) return 'grey';
					const isCorrect = grading.isCorrect === true || (grading.autoScore > 0) || (grading.manualScore > 0);
					return isCorrect ? 'success' : 'error';
				}
				return this.isAnswered(questionId) ? 'blue' : 'grey';
			},
			getGlobalQuestionNumber(groupIndex, questionIndexInGroup) {
				if (!this.assignment?.groups) return 1;
				let number = 1;
				for (let i = 0; i < groupIndex; i++) { number += this.assignment.groups[i].questions.length; }
				return number + questionIndexInGroup;
			},
			getGlobalQuestionNumberByQuestionId(questionId) {
				if (!this.allQuestions) return 0;
				const index = this.allQuestions.findIndex(q => q.id === questionId);
				return index + 1;
			},
			getGroupAnsweredCount(group) {
				return group.questions.filter(q => this.isAnswered(q.id)).length;
			},
			toggleGroupCollapse(groupIndex) {
				this.groupCollapsed = { ...this.groupCollapsed, [groupIndex]: !this.groupCollapsed[groupIndex] };
			},
			navigateToQuestion(groupIndex, questionIndexInGroup) {
				this.currentGroupIndex = groupIndex;
				this.currentQuestionIndexInGroup = questionIndexInGroup;
				if (this.groupCollapsed[groupIndex]) { this.toggleGroupCollapse(groupIndex); }
			},
			prevQuestion() {
				if (this.currentQuestionIndexInGroup > 0) { this.currentQuestionIndexInGroup--; }
				else if (this.currentGroupIndex > 0) {
					this.currentGroupIndex--;
					this.currentQuestionIndexInGroup = this.assignment.groups[this.currentGroupIndex].questions.length - 1;
				}
			},
			nextQuestion() {
				if (!this.assignment || !this.assignment.groups) return;
				const currentGroup = this.assignment.groups[this.currentGroupIndex];
				if (this.currentQuestionIndexInGroup < currentGroup.questions.length - 1) { this.currentQuestionIndexInGroup++; }
				else if (this.currentGroupIndex < this.assignment.groups.length - 1) {
					this.currentGroupIndex++;
					this.currentQuestionIndexInGroup = 0;
				}
			},
			getQuestionComponent(type) {
				const map = {
					'QUIZ_SINGLE_CHOICE': 'uc-question-single-choice',
					'QUIZ_MULTIPLE_CHOICE': 'uc-question-multiple-choice',
					'QUIZ_TRUE_FALSE': 'uc-question-true-false',
					'QUIZ_MULTIPLE_TRUE_FALSE': 'uc-question-multiple-true-false',
					'QUIZ_FILL_IN_BLANK': 'uc-question-fill-in-blank',
					'QUIZ_MATCHING': 'uc-question-matching',
					'SHORT_ANSWER': 'uc-question-short-answer',
					'ESSAY': 'uc-question-essay',
					'FILE_UPLOAD': 'uc-question-file-upload',
					'AUDIO_RESPONSE': 'uc-question-audio-response'
				};
				return map[type] || 'div';
			},
			isAnswered(questionId) {
				const answer = this.userAnswers[questionId]?.answerData;
				if (answer === null || answer === undefined) return false;
				if (typeof answer === 'string' && answer.trim() === '') return false;
				if (Array.isArray(answer) && answer.length === 0) return false;
				if (typeof answer === 'object' && !Array.isArray(answer) && Object.keys(answer).length === 0) return false;
				return true;
			},
			formatDate(dateString) {
				if (!dateString) return 'Chưa có thông tin';
				const date = new Date(dateString);
				return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
			},
			getYoutubeEmbedUrl(url) {
				if (!url) return '';
				let videoId = '';
				const standardMatch = url.match(/[?&]v=([^&]+)/);
				if (standardMatch) videoId = standardMatch[1];
				const shortMatch = url.match(/youtu\.be\/([^?]+)/);
				if (shortMatch) videoId = shortMatch[1];
				const embedMatch = url.match(/embed\/([^?]+)/);
				if (embedMatch) videoId = embedMatch[1];
				if (videoId) return `https://www.youtube.com/embed/${videoId}`;
				return url;
			},
			getDriveFileId(url) {
				const match = url?.match(/\/d\/([^/]+)\//);
				return match ? match[1] : null;
			},
			renderUrlYoutube,
			test() { window.open("/lms-student-dashboard", '_parent'); },
		},
		watch: {
			assignmentData: { handler: 'initializeAnswers', deep: true },
			isMobile(val) { if (val) { this.viewMode = 'all' } }
		},
		beforeUnmount() {
			if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
		}
	}
</script>