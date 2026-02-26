<template>
	<div v-if="!assignment" class="text-center pa-10">
		<v-progress-circular indeterminate size="64"></v-progress-circular>
		<p class="mt-4">Đang tải đề bài...</p>
	</div>

	<div v-else>
		<!-- COMPACT HEADER -->
		<v-card flat border>
			<v-card-text class="py-2">
				<div class="d-flex align-center flex-wrap ga-2">
					<div class="d-flex align-center ga-2">
						<v-icon color="primary">mdi-book-open-variant</v-icon>
						<span class="font-weight-medium text-truncate" style="max-width: 38ch;">
							{{ assignment.Title }}
						</span>
						<v-chip size="small" class="pa-0 font-weight-medium" variant="text" color="primary">{{
							monHocName }}</v-chip>
					</div>
					<v-divider vertical class="mx-2 d-none d-md-block"></v-divider>

					<div class="d-flex align-center ga-2">
						<v-icon size="18">mdi-account-outline</v-icon>
						<span class="text-caption">
							{{ vueData.HocSinhDetail?.HoTen }} • {{ vueData.HocSinhDetail?.TenLop }}
						</span>
					</div>

					<v-spacer />

					<!-- Hạn nộp + trạng thái -->
					<v-chip v-if="draft?.submissionstatus === 0 || draft?.submissionstatus === 1" size="x-small"
						:color="dueDateStatus.color" :variant="dueDateStatus.variant" class="mr-1 text-white">
						<v-icon start size="14" :icon="dueDateStatus.icon"></v-icon>
						{{ dueDateStatus.text }}
					</v-chip>
					<span class="text-caption text-medium-emphasis">{{ formatDate(assignment.DueDate) }}</span>

					<!-- Hướng dẫn gọn -->
					<v-tooltip text="Hướng dẫn" v-if="assignment?.Instructions">
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
				<v-expand-transition>
					<v-alert v-if="assignment.Reason" class="mt-2" density="comfortable" variant="tonal" type="warning">
						Lý do yêu cầu nộp lại: {{ assignment.Reason }}
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
						v-html="draft.TeacherComment">
					</div>
				</v-expand-transition>
			</v-card-text>
		</v-card>

		<v-row dense>
			<!-- NAV -->
			<v-col cols="12" sm="12" md="2" v-if="!isMobile" style="border-inline-end: 0.5px dashed #a7a2a2;">
				<v-card class="question-nav" sticky top="80px" flat>
					<v-card-title class="d-flex justify-space-between align-center header-respondsive-fs py-2">
						<span style="font-size: clamp(14px,2vw,16px);">Cấu trúc bài tập</span>
						<div class="d-flex ga-2 align-center">
							<v-btn icon size="small" @click="navCollapsed = !navCollapsed">
								<v-icon>{{ navCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up' }}</v-icon>
							</v-btn>
						</div>
					</v-card-title>

					<v-divider></v-divider>

					<v-expand-transition>
						<div v-show="!navCollapsed" class="pa-2 pb-0"
							style="max-height: calc(-185px + 100vh);overflow: auto;">
							<div class="d-flex justify-end mb-2">
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
							<div v-for="(group, groupIndex) in assignment.groups" :key="group.id" class="mb-2">
								<v-list-item @click="toggleGroupCollapse(groupIndex)"
									class="group-header-item px-0 py-1" density="compact">
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
									<div v-show="!groupCollapsed[groupIndex]" class="mt-2">
										<div class="question-grid">
											<v-badge v-for="(q, questionIndexInGroup) in group.questions" :key="q.id"
												location="top right" :color="userAnswers[q.id]?.flag ? 'red' : 'white'"
												:icon="userAnswers[q.id]?.flag ? 'mdi-flag-variant' : ''"
												:model-value="userAnswers[q.id]?.flag && (draft?.SubmissionStatus ?? null) == 1">
												<v-btn
													@click="navigateToQuestion(groupIndex, questionIndexInGroup, q.id)"
													:color="getIconColor(q.id)"
													:variant="isActiveQuestion(groupIndex, questionIndexInGroup) ? 'elevated' : 'tonal'"
													class="question-btn w-100" :size="isMobile ? 'x-small' : 'small'">
													<v-icon size="16">{{ getQuestionStatusIcon(q.id) }}</v-icon>
													{{ getGlobalQuestionNumber(groupIndex, questionIndexInGroup) }}
												</v-btn>
											</v-badge>
										</div>
									</div>
								</v-expand-transition>
							</div>
						</div>
					</v-expand-transition>
				</v-card>
			</v-col>

			<!-- CONTENT -->
			<v-col cols="12" md="10" class="pe-0">
				<div v-if="viewMode === 'single'">
					<!-- COMPACT PROGRESS (sticky nhỏ gọn cho chế độ single cũng được, nhưng giữ nguyên logic lưu) -->
					<v-card class="mb-3 mx-2" flat border
						v-if="draft?.SubmissionStatus !== 4 && draft?.SubmissionStatus !== 3">
						<v-card-text class="py-2">
							<div class="d-flex align-center ga-3">
								<v-progress-linear :model-value="progressPercent" color="primary" height="6" rounded
									class="flex-grow-1 w-50" />
								<span class="text-caption text-medium-emphasis">
									{{ answeredCount }}/{{ totalQuestions }} ({{ Math.round(progressPercent) }}%)
								</span>
								<v-spacer />
								<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
									<v-icon start size="16">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
								</v-chip>
								<v-btn v-if="!isSubmitted" color="success" size="small" @click="handleSubmit">
									<v-icon start size="16">mdi-check-all</v-icon>Nộp bài
								</v-btn>
								<v-chip v-else color="success" size="small" label>
									<v-icon start size="14">mdi-check-decagram</v-icon>
									{{ isGraded ? 'Đã chấm điểm' : 'Đã nộp bài' }}
								</v-chip>
							</div>
						</v-card-text>
					</v-card>

					<v-card v-if="currentQuestion?.config" class="question-content-card " style=" overflow: auto;"
						:style="{ height: draft?.SubmissionStatus <= 2 ? 'calc(100vh - 70px)' : 'calc(100vh - 111px)' }">
						<div class="d-flex justify-space-between align-center px-2">
							<v-card class="group-header-card mb-3 w-100" flat border>
								<v-card-text class="py-3">
									<div class="d-flex justify-space-between align-center">
										<div class="d-flex align-center ga-3">
											<div class="group-icon-wrapper">
												<v-icon color="primary" size="20">mdi-folder-text-outline</v-icon>
											</div>
											<div class="group-info">
												<h3 class="group-title-main">{{ currentGroup.title }}</h3>
												<div class="group-meta">
													<span class="text-caption text-medium-emphasis">{{
														currentGroup.questions.length }} câu hỏi</span>
													<span class="mx-2">•</span>
													<span class="text-caption text-medium-emphasis"> 
														Tối đa 
														{{currentGroup.questions.reduce((sum, q) => sum + q.points, 0)}} 
														điểm </span>
												</div>
											</div>
										</div>
										<div class="group-progress-badge">
											<v-chip color="primary" variant="tonal" size="small"
												class="progress-chip justify-center">
												{{ getGroupAnsweredCount(currentGroup) }}/{{
												currentGroup.questions.length }}
											</v-chip>
										</div>
									</div>
									<p v-if="currentGroup.description" class="group-description mb-0"
										style="text-wrap: auto;">
										{{ currentGroup.description }}
									</p>
									<!-- Media -->
									<div v-if="currentGroup.media" class="media-container">
										<div v-if="currentGroup.media.sourceYT.source?.length > 0"
											class="youtube-container">
											<iframe :src="renderUrlYoutube(currentGroup.media.sourceYT.source)"
												frameborder="0"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowfullscreen></iframe>
										</div>
										<uc-wave-audio-player v-if="currentGroup.media.sourceRecord.source?.length > 0"
											v-model:audioUrl="currentGroup.media.sourceRecord.source" />
										<div v-if="currentGroup.media.sourceFiles.image.length > 0"
											style="min-height: 350px">
											<v-img v-for="file in currentGroup.media.sourceFiles.image"
												@click="showDialogImage(file)" :key="file.source"
												:src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
												:lazy-src="'https://drive.google.com/thumbnail?id=' + getDriveFileId(file.source) + '&sz=w1000'"
												class="rounded-lg" max-height="350">
												<template #placeholder>
													<v-row align="center" class="fill-height ma-0" justify="center">
														<v-progress-circular color="grey-lighten-5" indeterminate />
													</v-row>
												</template>
											</v-img>
										</div>
										<div v-if="currentGroup.media.sourceFiles.file.length > 0">
											<iframe v-for="file in currentGroup.media.sourceFiles.file"
												:key="file.source" :src="file.source"
												style="width: 100%; height: 400px;"></iframe>
										</div>
									</div>
								</v-card-text>
							</v-card>
						</div>

						<v-divider />

						<div v-if="currentGroup.isCheckShowAllQuestion">
							<v-card-text class="px-3 pt-3 pb-0" v-for="question in currentGroup.questions"
								:key="question.id">
								<div class="d-flex align-center justify-end ga-2">
									<v-chip v-if="questionsTypesLabel(question.type)"
										:color="questionsTypesLabel(question.type).color" size="small">
										{{ questionsTypesLabel(question.type).label }}
									</v-chip>

									<v-chip class="ml-2" size="small"
										v-if="question && vueData.assignmentData[1] && vueData.assignmentData[1][0]?.SubmissionStatus != 4"
										:color="questionStatus(question.id, question.points).color"
										:variant="questionStatus(question.id, question.points).variant">
										{{ questionStatus(question.id, question.points).label }}
									</v-chip>
									<v-chip color="primary" variant="outlined" size="small">
										{{ question.points }}đ
									</v-chip>
								</div>
								<!-- Question text -->
								<div class="d-flex ga-2">
									<b class="responsive-fs-title" style="flex-shrink: 0;display: inline-block;">
										Câu {{ getGlobalQuestionNumberByQuestionId(question.id) }}:
									</b>
									<uc-latex-view class="question-text body-respondsive-fs flex-column ga-2"
										:escape-html="false" v-model:content="question.config.questionText" />
								</div>

								<!-- Media -->
								<div v-if="question.config.media" class="media-container">
									<div v-if="question.config.media.sourceYT.source.length > 0"
										class="youtube-container">
										<iframe :src="renderUrlYoutube(question.config.media.sourceYT.source)"
											frameborder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen></iframe>
									</div>
									<uc-wave-audio-player v-if="question.config.media.sourceRecord.source.length > 0"
										v-model:audioUrl="question.config.media.sourceRecord.source" />
									<div v-if="question.config.media.sourceFiles.image?.length > 0"
										style="min-height: fit-content">
										<v-img v-for="file in question.config.media.sourceFiles.image"
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
									<div v-if="question.config.media.sourceFiles.file?.length > 0">
										<iframe v-for="file in question.config.media.sourceFiles.file"
											:key="file.source" :src="file.source"
											style="width: 100%; height: 400px;"></iframe>
									</div>
								</div>

								<!-- Answer area -->
								<div class="answer-area"
									style="min-height: calc(-48.6rem + 100dvh); height: 100%;  overflow: auto;">
									<component :is="getQuestionComponent(question.type)" :question="question"
										:answer="getAnswerForChild(question)"
										:grading="userAnswers[question.id]?.grading" :isGrade="false"
										@answer-change="updateAnswer(question.id, $event)" :readonly="isSubmitted"
										:submissionstatus="draft?.SubmissionStatus" :max-points="question.points"
										:student-comment="userAnswers[question.id]?.grading?.comment || ''"
										:is-block-copy-paste="isBlockCopyPaste" />
								</div>
							</v-card-text>

						</div>
						<div v-else>
							<v-card-text class="px-3 pt-3 pb-0">
								<div class="d-flex align-center justify-end ga-2">
									<v-chip v-if="questionsTypesLabel(currentQuestion.type)"
										:color="questionsTypesLabel(currentQuestion.type).color" size="small">
										{{ questionsTypesLabel(currentQuestion.type).label }}
									</v-chip>

									<v-chip class="ml-2" size="small"
										v-if="currentQuestion && vueData.assignmentData[1] && vueData.assignmentData[1][0]?.SubmissionStatus != 4"
										:color="questionStatus(currentQuestion.id, currentQuestion.points).color"
										:variant="questionStatus(currentQuestion.id, currentQuestion.points).variant">
										{{ questionStatus(currentQuestion.id, currentQuestion.points).label }}
									</v-chip>
									<v-chip color="primary" variant="outlined" size="small">
										{{ currentQuestion.points }}đ
									</v-chip>
								</div>
								<!-- Question text -->
								<div class="d-flex ga-2">
									<b class="responsive-fs-title" style="flex-shrink: 0;display: inline-block;">
										Câu {{ getGlobalQuestionNumberByQuestionId(currentQuestion.id) }}:
									</b>
									<uc-latex-view class="question-text body-respondsive-fs flex-column ga-2"
										:escape-html="false" v-model:content="currentQuestion.config.questionText" />
								</div>

								<!-- Media -->
								<div v-if="currentQuestion.config.media" class="media-container">
									<div v-if="currentQuestion.config.media.sourceYT.source.length > 0"
										class="youtube-container">
										<iframe :src="renderUrlYoutube(currentQuestion.config.media.sourceYT.source)"
											frameborder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen></iframe>
									</div>
									<uc-wave-audio-player
										v-if="currentQuestion.config.media.sourceRecord.source.length > 0"
										v-model:audioUrl="currentQuestion.config.media.sourceRecord.source" />
									<div v-if="currentQuestion.config.media.sourceFiles.image?.length > 0"
										style="min-height: 400px">
										<v-img v-for="file in currentQuestion.config.media.sourceFiles.image"
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
									<div v-if="currentQuestion.config.media.sourceFiles.file?.length > 0">
										<iframe v-for="file in currentQuestion.config.media.sourceFiles.file"
											:key="file.source" :src="file.source"
											style="width: 100%; height: 400px;"></iframe>
									</div>
								</div>

								<!-- Answer area -->
								<div class="answer-area"
									style="min-height: calc(-48.6rem + 100dvh); height: 100%;  overflow: auto;">
									<component :is="getQuestionComponent(currentQuestion.type)"
										:question="currentQuestion" :answer="getAnswerForChild(currentQuestion)"
										:grading="userAnswers[currentQuestion.id]?.grading" :isGrade="false"
										@answer-change="updateAnswer(currentQuestion.id, $event)"
										:readonly="isSubmitted" :submissionstatus="draft?.SubmissionStatus"
										:max-points="currentQuestion.points"
										:student-comment="userAnswers[currentQuestion.id]?.grading?.comment || ''"
										:is-block-copy-paste="isBlockCopyPaste" />
								</div>
							</v-card-text>

							<!-- Action Bar -->
							<v-divider class="mt-3"></v-divider>
							<v-card-actions class="pa-3 d-flex justify-space-between"
								style="position: sticky; bottom: 0;z-index: 53;background-color: white;">
								<v-btn @click="prevQuestion" :disabled="globalQuestionNumber === 1" variant="text">
									<v-icon start>mdi-chevron-left</v-icon>Câu trước
								</v-btn>

								<div class="d-flex align-center flex-wrap ga-3">
									<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
										<v-icon start size="16">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
									</v-chip>

									<v-btn v-if="!isSubmitted" color="success" size="small" @click="handleSubmit">
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
						</div>
					</v-card>
				</div>
				<div v-else class="all-questions-mode" style="overflow: auto;"
					:style="{ height: draft?.SubmissionStatus <= 2 ? 'calc(100vh - 70px)' : 'calc(100vh - 111px)' }">
					<!-- COMPACT PROGRESS (All mode) -->
					<v-card class="my-2 mx-2" flat border style="position: sticky; top: -2px; z-index: 50;"
						v-if="draft?.SubmissionStatus !== 4 && draft?.SubmissionStatus !== 3">
						<v-card-text class="py-2">
							<div class="d-flex align-center flex-wrap ga-3">
								<v-progress-linear :model-value="progressPercent" color="primary" height="6" rounded
									class="progress-bar-inline flex-grow-1 w-50"></v-progress-linear>
								<span class="text-caption text-medium-emphasis">
									{{ answeredCount }}/{{ totalQuestions }} ({{ Math.round(progressPercent) }}%)
								</span>
								<v-spacer />
								<v-chip v-if="!isSubmitted" :color="saveStatusColor" size="small" label>
									<v-icon start size="14">{{ saveStatusIcon }}</v-icon>{{ saveStatus }}
								</v-chip>
								<v-btn v-if="!isSubmitted" color="success" size="small" @click="handleSubmit">
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
													<span class="text-caption text-medium-emphasis">
														{{ group.questions.length }} câu hỏi</span>
													<span class="mx-2">•</span>
													<span class="text-caption text-medium-emphasis">
														Tối đa {{group.questions.reduce((sum, q) => sum + q.points, 0)}}
														điểm
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
								<!-- Media -->
								<div v-if="group.media" class="media-container">
									<div v-if="group.media.sourceYT.source?.length > 0" class="youtube-container">
										<iframe :src="renderUrlYoutube(group.media.sourceYT.source)" frameborder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen></iframe>
									</div>
									<uc-wave-audio-player v-if="group.media.sourceRecord.source?.length > 0"
										v-model:audioUrl="group.media.sourceRecord.source" />
									<div v-if="group.media.sourceFiles.image.length > 0"
										style="min-height: fit-content">
										<v-img v-for="file in group.media.sourceFiles.image" :key="file.source"
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
									<div v-if="group.media.sourceFiles.file.length > 0">
										<iframe v-for="file in group.media.sourceFiles.file" :key="file.source"
											:src="file.source" style="width: 100%; height: 400px;"></iframe>
									</div>
								</div>
							</v-card>


							<div class="questions-in-group">
								<v-card v-for="(question, questionIndexInGroup) in group.questions" :key="question.id"
									:id="question.id" class="question-card-all mb-3"
									:class="{ 'question-answered': isAnswered(question.id) }" flat border>
									<!-- Compact header -->
									<div class="question-header-all-compact">
										<!-- Giao diện desktop -->
										<div v-if="!isMobile">
											<div class="mb-2 d-flex align-center ga-2">
												<v-chip v-if="questionsTypesLabel(question.type)"
													:color="questionsTypesLabel(question.type).color" size="x-small">
													{{ questionsTypesLabel(question.type).label }}
												</v-chip>
												<v-spacer></v-spacer>
												<v-chip size="x-small"
													v-if="vueData.assignmentData[1] && vueData.assignmentData[1][0]?.SubmissionStatus != 4"
													:color="questionStatus(question.id, question.points).color"
													:variant="questionStatus(question.id, question.points).variant">
													{{ questionStatus(question.id, question.points).label }}
												</v-chip>
												<v-chip text-color="primary" variant="outlined" size="x-small"
													class="points-chip-mobile" style="min-width: 30px">
													{{ question.points }}đ
												</v-chip>
												<v-btn size="x-small" v-if="draft?.SubmissionStatus < 2"
													:icon="iconFlag(userAnswers[question.id]?.flag)" color="red"
													variant="text" @click="handleFlag(question.id)"
													v-tooltip="'Đánh dấu câu hỏi'"></v-btn>
											</div>

											<div class="d-flex ga-2">
												<v-icon :color="getIconColor(question.id)" size="18">
													{{ getQuestionStatusIcon(question.id) }}
												</v-icon>
												<b style="flex-shrink: 0;display: inline-block;">
													Câu {{ getGlobalQuestionNumber(groupIndex, questionIndexInGroup) }}:
												</b>
												<uc-latex-view class="question-text-compact flex-grow-1 flex-column"
													v-model:content="question.config.questionText" :escape-html="false"
													style="align-items: flex-start !important;" />
											</div>
										</div>

										<!-- Giao diện mobile -->
										<div v-else class="d-flex flex-column ga-1">
											<div class="d-flex align-center ga-2">
												<v-chip v-if="questionsTypesLabel(question.type)"
													:color="questionsTypesLabel(question.type).color" size="x-small">
													{{ questionsTypesLabel(question.type).label }}
												</v-chip>
												<v-spacer></v-spacer>
												<v-chip text-color="primary" variant="outlined" size="x-small"
													class="points-chip-mobile" style="min-width: 30px">
													{{ question.points }}đ
												</v-chip>
												<v-chip size="x-small"
													v-if="vueData.assignmentData[1] && vueData.assignmentData[1][0]?.SubmissionStatus != 4"
													:color="questionStatus(question.id, question.points).color"
													:variant="questionStatus(question.id, question.points).variant">
													{{ questionStatus(question.id, question.points).label }}
												</v-chip>
											</div>


											<div class="d-flex ga-2">
												<v-icon class="mt-1" :color="getIconColor(question.id)" size="18">
													{{ getQuestionStatusIcon(question.id) }}
												</v-icon>
												<b
													style="flex-shrink: 0;display: inline-block;padding-top:2px;font-size: 0.85rem;">
													Câu {{ getGlobalQuestionNumber(groupIndex, questionIndexInGroup) }}:
												</b>
												<uc-latex-view
													class="question-text-compact flex-column flex-grow-1 justify-center"
													v-model:content="question.config.questionText" :escape-html="false"
													style="align-items: flex-start !important;font-size: 0.85rem;" />
											</div>

										</div>
									</div>

									<v-card-text class="question-content-compact pt-3 pb-4">
										<!-- Media -->
										<div v-if="question.config.media" class="media-container">
											<div v-if="question.config.media.sourceYT.source.length > 0"
												class="youtube-container">
												<iframe :src="renderUrlYoutube(question.config.media.sourceYT.source)"
													frameborder="0"
													allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
													allowfullscreen></iframe>
											</div>
											<uc-wave-audio-player
												v-if="question.config.media.sourceRecord.source.length > 0"
												v-model:audioUrl="question.config.media.sourceRecord.source" />
											<div v-if="question.config.media.sourceFiles.image?.length > 0"
												style="min-height: fit-content" class="mb-3">
												<v-img v-for="file in question.config.media.sourceFiles.image"
													@click="showDialogImage(file)" :key="file.source"
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
											<div v-if="question.config.media.sourceFiles.file?.length > 0">
												<iframe v-for="file in question.config.media.sourceFiles.file"
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
												:student-comment="userAnswers[question.id]?.grading?.comment || ''"
												:is-block-copy-paste="isBlockCopyPaste" />
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
				viewMode: 'all',
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
				toggleTC: false,
				fileData: {},
				dialogImage: false,
				_,
				intervalDurationTime: null,
				resizeHandler: null // THÊM để quản lý resize listener
			}
		},
		watch: {
			assignmentData: {
				handler: (val) => {
					console.log('assignmentData changed:', val)
				},
				deep: true
			},
			isMobile(val) {
				if (val) {
					this.viewMode = 'all'
				}
			}
		},
		computed: {
			userAnswers() {
				return this.puseranswers || {};
			},
			assignment() {
				if (!this.assignmentData || !this.assignmentData[0] || !this.assignmentData[0][0]) {
					return null;
				}
				const config = this.assignmentData[0][0];
				if (config && typeof config.AssignmentConfig === 'string' && !config.groups) {
					try {
						const parsedConfig = JSON.parse(config.AssignmentConfig);
						config.groups = parsedConfig.groups || [];
					} catch (e) {
						console.error('Error parsing AssignmentConfig:', e);
						config.groups = [];
					}
				}
				return config;
			},
			draft() {
				if (!this.assignmentData || !this.assignmentData[1] || !this.assignmentData[1][0]) {
					return null;
				}
				return this.assignmentData[1][0];
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
			},
			isSubmitted() {
				return this.draft?.SubmissionStatus >= 2;
			},
			isGraded() {
				return this.isSubmitted && this.draft?.SubmissionStatus === 4;
			},
			allQuestions() {
				return this.assignment?.groups?.flatMap(group => group.questions) || [];
			},
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
			answeredCount() {
				return this.allQuestions.filter(q => this.isAnswered(q.id)).length;
			},
			progressPercent() {
				if (!this.totalQuestions) return 0;
				return (this.answeredCount / this.totalQuestions) * 100;
			},
			isBlockCopyPaste() {
				return this.assignment?.IsBlockCopy_Paste === true;
			}
		},
		mounted() {
			// FIX: Lưu reference của resize handler để có thể remove sau
			this.resizeHandler = () => { this.ResizeWindow(); };
			window.addEventListener('resize', this.resizeHandler);
	
			this.ResizeWindow();
			this.initializeAnswers();
	
			// Xử lý thời gian truy cập và thời gian làm bài
			if (this.assignmentData && this.assignmentData.length > 0) {
				if (this.assignmentData[1] && this.assignmentData[1][0] && ![2, 3, 4].includes(this.assignmentData[1][0].SubmissionStatus)) {
					this.intervalDurationTime = setInterval(() => {
						this.InsertDurationTime(this.assignmentData[1][0]);
					}, 5000);
					this.InsertAccessTime(this.assignmentData[1][0]);
				}
			}
	
			// Thêm block copy/paste
			if (this.isBlockCopyPaste) {
				this.addCopyPasteBlocker();
			}
		},
		methods: {
			ResizeWindow() {
				this.isMobile = window.innerWidth < 960;
				this.isTablet = window.innerWidth <= 1240;
			},
			isActiveQuestion(groupIndex, questionIndexInGroup) {
				return this.currentGroupIndex === groupIndex && this.currentQuestionIndexInGroup === questionIndexInGroup;
			},
			getAnswerForChild(question) {
				if (!question) return null;
	
				const answerObject = this.userAnswers[question.id];
				if (question.type === 'FILE_UPLOAD') {
					if (!answerObject || answerObject.answerData === undefined) return [];
				}
				return answerObject?.answerData;
			},
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
	
				this.$emit('update:puseranswers', newAnswers);
				this.saveStatus = 'Đang soạn...';
				this.saveStatusColor = 'orange';
				this.saveStatusIcon = 'mdi-pencil-outline';
				if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
				this.autoSaveTimer = setTimeout(this.saveDraft, 500);
			},
	
			// FIX: Thêm error handling đầy đủ
			async saveDraft() {
				if (this.isSaving || this.isSubmitted) return;
				if (!this.assignment?.AssignToClassID && !this.assignment?.AssignToStudentID) return;
	
				this.isSaving = true;
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
				} finally {
					this.isSaving = false;
				}
			},
	
			// Điểm thực tế của câu
			getQuestionScore(questionId) {
				const g = vueData.userAnswersSubmitted?.[questionId]?.grading;
				if (!g) return null;
				let s = 0;
				let has = false;
				if (typeof g.autoScore === 'number') { s += g.autoScore; has = true; }
				if (typeof g.manualScore === 'number') { s += g.manualScore; has = true; }
				return has ? s : null;
			},
	
			// Chip trạng thái câu
			questionStatus(questionId, maxPoint) {
				const answered = this.isAnswered(questionId);
				if (!this.isSubmitted) {
					return answered ? { label: 'Đã TL', color: 'primary', variant: 'tonal' }
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
	
			// FIX: Thêm validation đầy đủ cho initializeAnswers
			initializeAnswers() {
				if (this.draft && this.draft.SubmissionContent) {
					try {
						const asmConfigString = this.assignmentData?.[0]?.[0]?.AssignmentConfig;
	
						// Validate trước khi parse
						if (!asmConfigString) {
							console.error('AssignmentConfig is missing');
							this.$emit('update:puseranswers', {});
							return;
						}
	
						const asmData = JSON.parse(asmConfigString);
	
						// Validate structure
						if (!asmData?.groups || !Array.isArray(asmData.groups)) {
							console.error('Invalid AssignmentConfig structure - groups missing or not an array');
							this.$emit('update:puseranswers', {});
							return;
						}
	
						let submissionContent = { answers: {} };
						if (this.draft && this.draft.SubmissionContent) {
							try {
								submissionContent = JSON.parse(this.draft.SubmissionContent);
							} catch (e) {
								console.error('Error parsing SubmissionContent:', e);
								submissionContent = { answers: {} };
							}
						}
	
						const answers = submissionContent?.answers || {};
	
						asmData.groups.forEach(group => {
							if (!group.questions || !Array.isArray(group.questions)) return;
	
							for (const question of group.questions) {
								if (!question.id) continue;
	
								answers[question.id] = {
									answerData: answers[question.id]?.answerData ?? null,
									flag: answers[question.id]?.flag ?? false,
									grading: {
										comment: answers[question.id]?.grading?.comment || null,
										teacherComment: answers[question.id]?.grading?.teacherComment || null,
										manualScore: answers[question.id]?.grading?.manualScore || null,
									}
								};
							}
						});
	
						this.$emit('update:puseranswers', answers);
					} catch (e) {
						console.error('Lỗi initializeAnswers:', e);
						this.$emit('update:puseranswers', {});
					}
				} else {
					// Nếu chưa có draft phải save trước
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
	
			getQuestionStatusIcon(questionId) {
				if (this.isGraded) {
					const question = this.allQuestions.find(q => q.id === questionId);
					const grading = vueData.userAnswersSubmitted?.[questionId]?.grading;
					if (!grading) return 'mdi-help-circle-outline';
					if (!question) return 'mdi-help-circle-outline';
	
					if (grading.isCorrect === true || grading.manualScore === question.points) return 'mdi-check-circle';
					if (grading.isCorrect === true || (grading.manualScore < question.points && grading.manualScore > 0)) return 'mdi-minus-circle-outline';
					return 'mdi-close-circle';
				}
				if (this.isAnswered(questionId)) { return 'mdi-pencil-circle'; }
				return 'mdi-help-box-outline';
			},
	
			getIconColor(questionId) {
				if (this.isGraded) {
					const question = this.allQuestions.find(q => q.id === questionId);
					const grading = vueData.userAnswersSubmitted?.[questionId]?.grading;
					if (!grading) return 'grey';
					if (!question) return 'grey';
	
					if (grading.isCorrect === true || grading.manualScore === question.points) return 'green';
					if (grading.isCorrect === true || (grading.manualScore < question.points && grading.manualScore > 0)) return 'warning';
					return 'red';
				}
				return this.isAnswered(questionId) ? 'blue' : 'grey';
			},
	
			getGlobalQuestionNumber(groupIndex, questionIndexInGroup) {
				if (!this.assignment?.groups) return 1;
				let number = 1;
				for (let i = 0; i < groupIndex; i++) {
					number += this.assignment.groups[i].questions.length;
				}
				return number + questionIndexInGroup;
			},
	
			getGlobalQuestionNumberByQuestionId(questionId) {
				if (!this.allQuestions) return 0;
				const index = this.allQuestions.findIndex(q => q.id === questionId);
				return index + 1;
			},
	
			getGroupAnsweredCount(group) {
				if (!group || !group.questions) return 0;
				return group.questions.filter(q => this.isAnswered(q.id)).length;
			},
	
			toggleGroupCollapse(groupIndex) {
				this.groupCollapsed = {
					...this.groupCollapsed,
					[groupIndex]: !this.groupCollapsed[groupIndex]
				};
			},
	
			// FIX: Thêm null check cho navigateToQuestion
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
					this.currentQuestionIndexInGroup = this.assignment.groups[this.currentGroupIndex].questions.length - 1;
				}
			},
	
			nextQuestion() {
				if (!this.assignment || !this.assignment.groups) return;
				const currentGroup = this.assignment.groups[this.currentGroupIndex];
				if (!currentGroup) return;
	
				if (this.currentQuestionIndexInGroup < currentGroup.questions.length - 1) {
					this.currentQuestionIndexInGroup++;
				} else if (this.currentGroupIndex < this.assignment.groups.length - 1) {
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
				try {
					const date = new Date(dateString);
					return date.toLocaleString('vi-VN', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					});
				} catch (e) {
					console.error('Error formatting date:', e);
					return 'Chưa có thông tin';
				}
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
				if (!url) return null;
				const match = url.match(/\/d\/([^/]+)\//);
				return match ? match[1] : null;
			},
	
			renderUrlYoutube,
			test() {
				window.open("/lms-student-dashboard", '_parent');
			},
			questionsTypesLabel,
	
			iconFlag(isFlagged) {
				return isFlagged ? 'mdi-flag-variant' : 'mdi-flag-variant-outline';
			},
	
			// FIX: Thêm null check cho handleFlag
			handleFlag(qid) {
				if (!this.userAnswers[qid]) {
					// Khởi tạo nếu chưa có
					const newAnswers = {
						...this.userAnswers,
						[qid]: {
							answerData: null,
							flag: true,
							grading: {
								comment: null,
								teacherComment: null,
								manualScore: null
							}
						}
					};
					this.$emit('update:puseranswers', newAnswers);
				} else {
					const newAnswers = { ...this.userAnswers };
					newAnswers[qid] = {
						...newAnswers[qid],
						flag: !newAnswers[qid]?.flag
					};
					this.$emit('update:puseranswers', newAnswers);
				}
	
				this.saveStatus = 'Đang soạn...';
				this.saveStatusColor = 'orange';
				this.saveStatusIcon = 'mdi-pencil-outline';
				if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
				this.autoSaveTimer = setTimeout(this.saveDraft, 2500);
			},
	
			showDialogImage(file) {
				this.dialogImage = true;
				this.fileData = file;
			},
	
			addCopyPasteBlocker() {
				document.addEventListener('copy', this.blockCopyPaste);
				document.addEventListener('cut', this.blockCopyPaste);
				document.addEventListener('paste', this.blockCopyPaste);
				document.addEventListener('contextmenu', this.blockContextMenu);
				document.addEventListener('keydown', this.blockKeyboardShortcuts);
			},
	
			removeCopyPasteBlocker() {
				document.removeEventListener('copy', this.blockCopyPaste);
				document.removeEventListener('cut', this.blockCopyPaste);
				document.removeEventListener('paste', this.blockCopyPaste);
				document.removeEventListener('contextmenu', this.blockContextMenu);
				document.removeEventListener('keydown', this.blockKeyboardShortcuts);
			},
	
			blockCopyPaste(e) {
				if (!this.isSubmitted) {
					const target = e.target;
					if (target.tagName === 'INPUT' ||
						target.tagName === 'TEXTAREA' ||
						target.isContentEditable) {
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
					if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v'].includes(e.key.toLowerCase())) {
						const target = e.target;
						if (target.tagName === 'INPUT' ||
							target.tagName === 'TEXTAREA' ||
							target.isContentEditable) {
							e.preventDefault();
							e.stopPropagation();
							if (Vue.$toast) {
								Vue.$toast.warning('Không được phép sử dụng phím tắt sao chép/dán', { position: "top" });
							}
						}
					}
				}
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
	
		// FIX: Cleanup hoàn chỉnh trong beforeUnmount
		beforeUnmount() {
			// Clear resize listener
			if (this.resizeHandler) {
				window.removeEventListener('resize', this.resizeHandler);
				this.resizeHandler = null;
			}
	
			// Clear interval
			if (this.intervalDurationTime) {
				clearInterval(this.intervalDurationTime);
				this.intervalDurationTime = null;
			}
	
			// Clear timeout
			if (this.autoSaveTimer) {
				clearTimeout(this.autoSaveTimer);
				this.autoSaveTimer = null;
			}
	
			// Remove copy/paste blockers
			if (this.isBlockCopyPaste) {
				this.removeCopyPasteBlocker();
			}
		}
	}
</script>