<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-2" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>
		<v-textarea v-if="submissionstatus < 2" :model-value="answer"
			@update:model-value="$emit('answer-change', $event)"
			:label="!isGrade ? 'Nhập câu trả lời của bạn' : 'Câu trả lời của học sinh'" rows="3" outlined
			:readonly="readonly || isGrade" hide-details class="mt-2" @copy="handleCopyPaste" @cut="handleCopyPaste"
			@paste="handleCopyPaste" @contextmenu="handleContextMenu" />

		<!-- (3) Câu trả lời HS -->
			<div v-if="submissionstatus >= 2" class="d-flex flex-column my-2 pa-3 rounded"
				style="background-color:#FAFAFA; border:1px solid #E0E0E0;">
				<div class="d-flex align-center mb-2" style="color:#424242; font-weight:600;">
					<v-icon size="18" class="mr-1" color="#616161">
						mdi-account
					</v-icon>
					Câu trả lời của {{ isGrade ? 'học sinh' : 'bạn' }}:
				</div>
			
				<uc-latex-view v-if="answer && answer.length > 0" :content="answer" :escapeHtml="false" />
			
				<span v-else class="text-medium-emphasis">
					Không nhập câu trả lời
				</span>
			</div>
		<!-- (4) Ý kiến học sinh -->
		<div class="mt-2">
			<div class="text-end" v-if="!isGrade && submissionstatus < 2 && isShowBtnComment">
				<v-menu v-model="menu" :close-on-content-click="false" scroll-strategy="close" location="start">
					<template #activator="{ props: menuProps }">
						<v-tooltip location="top">
							<template #activator="{ props: tooltipProps }">
								<v-btn v-bind="{ ...menuProps, ...tooltipProps }" icon="mdi-notebook-edit-outline" size="small"
									variant="text" color="primary" />
							</template>
							<span>Ý kiến của bạn</span>
						</v-tooltip>
					</template>
					<v-card :min-width="widthScreen < 650 ? null : 600" variant="outlined" class="elevation-0">
						<v-card-title class="px-4 py-3" style="background-color:#E3F2FD; color:#1565C0; font-weight:600;">
							Ý kiến của bạn
						</v-card-title>
						<v-list>
							<v-list-item>
								<v-textarea :model-value="grading?.comment || ''" @update:model-value="onStudentCommentInput" rows="2"
									hide-details variant="outlined" placeholder="Nhập ý kiến của bạn" />
							</v-list-item>
						</v-list>
						<v-card-actions class="border-t py-0">
							<v-spacer />
							<v-btn variant="text" color="primary" @click="menu = false">
								Đóng
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-menu>
			</div>
			<div v-else-if="grading?.comment" class="pa-2 rounded bg-blue-lighten-1">
				<b>
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon>
					<span v-if="$i18n.locale =='en'&& isGrade">
						Student's Feedback
					</span>
					<span v-else-if="$i18n.locale !='en'&& isGrade">Ý kiến {{ isGrade ? 'học sinh' : 'bạn' }}:</span>
				</b>
				<div class="mt-1">{{ grading.comment }}</div>
			</div>
		</div>

		<!-- (5) Điểm -->
		<!-- Điểm câu – hiển thị khi đã trả bài (status == 4) -->
		<div v-if="submissionstatus == 4" class="mt-2">
			<strong>{{$i18n.locale == 'en' ? 'Score':'Điểm' }}:</strong>
			<v-chip size="small" :color="scoreChipColor" variant="tonal">
				<v-icon start size="16">mdi-star</v-icon>
				{{ displayScore }} / {{ effectiveMaxPoints }}
			</v-chip>
		</div>

		<!-- (6) Nhận xét GV -->
		<v-alert v-if="submissionstatus == 4 && grading?.teacherComment && !isGrade" border="start" color="info"
			elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading.teacherComment || '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="my-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-2 teacher-grading-area" v-if="isGrade">
			<div class="d-flex align-center mb-2" v-if="submissionstatus == 2 || submissionstatus == 3">
				<v-number-input :model-value="grading ? grading.manualScore : 0"
					@update:modelValue="val => { grading.manualScore = val;}" label="Điểm" :max="question.points"
					:min="0" variant="outlined" density="compact" hide-details style="max-width: 100px;"
					@blur="submitPoints" control-variant="hidden" inset />
				<span class="text-h6 ml-2 text-primary"> / {{ question.points }}</span>
				<span class="ml-1 text-caption">điểm</span>
			</div>
			<v-textarea :model-value="grading ? grading.teacherComment : ''" @update:modelValue="updateTeacherComment"
				:label="$t('message.TeacherCommentOptional')" rows="2" outlined dense hide-details />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-question-short-answer',
		props: {
			question: Object,
			answer: String,
			readonly: { type: Boolean, default: false },
			grading: Object,
			isGrade: { type: Boolean, default: false },
			submissionstatus: { type: Number, default: -1 },
			isShowBtnComment: { type: Boolean, default: true },
			isBlockCopyPaste: {
				type: Boolean,
				default: false
			}
		},
		emits: ['answer-change', 'grading-change'],
		data() {
			this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
			return { menu: false, widthScreen: null }
		},
		computed: {
			guideText() { return this.question?.config?.submissionNote || this.question?.config?.instruction || '' },
			displayScore() {
				// Ưu tiên manualScore, rồi autoScore, nếu trống thì mặc định 0
				const s = this.grading?.manualScore ?? this.grading?.autoScore ?? 0;
				return typeof s === 'number' ? s : 0;
			},
			effectiveMaxPoints() {
				return this.question?.points ?? 0;
			},
			scoreChipColor() {
				const s = this.displayScore;
				const max = this.effectiveMaxPoints;
				if (s <= 0) return 'error'; // 0 điểm if (max && s>= max) return 'success'; // đạt tối đa
				return 'primary'; // điểm trung gian
			},
		},
		mounted() {
			this.widthScreen = window.innerWidth
			window.addEventListener('resize', () => { this.handleResize() })
		},
		methods: {
			handleResize() {
				this.widthScreen = window.innerWidth;
			},
			onStudentCommentInput(val) {
				this.grading.comment = val
				this.$emit('grading-change', { ...this.grading, comment: val })
			},
			updateTeacherComment(val) { this.$emit('grading-change', { ...this.grading, teacherComment: val }); },
			submitPoints() {
				this.$emit('grading-change', {
					...this.grading,
					manualScore: this.grading.manualScore
				});
			},
			handleCopyPaste(event) {
				if (this.isBlockCopyPaste && !this.readonly) {
					event.preventDefault();
					// Có thể thêm thông báo cho user
					Vue.$toast?.warning('Không được phép sao chép/dán nội dung trong bài này', { position: "top" });
				}
			},
			handleContextMenu(event) {
				if (this.isBlockCopyPaste && !this.readonly) {
					event.preventDefault();
				}
			}
		}
	}
</script>