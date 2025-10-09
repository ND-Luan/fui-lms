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
			:readonly="readonly || isGrade" hide-details class="mt-2" />

		<!-- (3) Câu trả lời HS -->
		<div v-if="submissionstatus >= 2" class="d-flex flex-column pa-2 rounded bg-green-lighten-1">
			<b>
				<v-icon class="mr-1">mdi-account</v-icon> Câu trả lời của {{ !isGrade ? 'bạn' : 'học sinh' }}:
			</b>
			<span v-if="answer" class="mt-1">{{ answer }}</span>
			<b v-else class="text-red mt-1">Không nhập câu trả lời</b>
		</div>
		<!-- (4) Ý kiến học sinh -->
		<div class="mt-2">
			<div class="text-end" v-if="!isGrade && submissionstatus < 2 && isShowBtnComment">
				<v-menu v-model="menu" :close-on-content-click="false" location="start" scroll-strategy="close">
					<template v-slot:activator="{ props }">
						<v-btn color="orange-darken-1" v-bind="props" icon="mdi-notebook-edit-outline" size="small"
							v-tooltip="'Ý kiến của bạn'">
						</v-btn>
					</template>

					<v-card :min-width="widthScreen < 650 ? null : 600" class="elevation-0" variant="outlined"
						color="orange">
						<v-card-title class="bg-orange-darken-1">Ý kiến của bạn</v-card-title>
						<v-list>
							<v-list-item>
								<v-textarea :model-value="grading?.comment || ''"
									@update:model-value="onStudentCommentInput" rows="2" dense hide-details
									variant="outlined" placeholder="Nhập ý kiến của bạn" />
							</v-list-item>
						</v-list>
						<v-card-actions class="border-t py-0">
							<v-spacer></v-spacer>
							<v-btn text color="orange-darken-1" @click="menu = false">Đóng</v-btn>
						</v-card-actions>
					</v-card>
				</v-menu>
			</div>
			<div v-else-if="grading?.comment" class="pa-2 rounded bg-blue-lighten-1">
				<b>
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon>
					Ý kiến của {{ isGrade ? 'học sinh' : 'bạn' }}:
				</b>
				<div class="mt-1">{{ grading.comment }}</div>
			</div>
		</div>

		<!-- (5) Điểm -->
		<!-- Điểm câu – hiển thị khi đã trả bài (status == 4) -->
		<div v-if="submissionstatus == 4" class="mt-2">
			<strong>Điểm | Score:</strong>
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
					@update:modelValue="val => { grading.manualScore = val;}" label="Điểm"
					:max="question.points" :min="0" variant="outlined" density="compact" hide-details
					style="max-width: 100px;" @blur="submitPoints" control-variant="hidden" inset />
				<span class="text-h6 ml-2 text-primary"> / {{ question.points }}</span>
				<span class="ml-1 text-caption">điểm</span>
			</div>
			<v-textarea :model-value="grading ? grading.teacherComment : ''" @update:modelValue="updateTeacherComment"
				label="Nhận xét của giáo viên (tùy chọn)" rows="2" outlined dense hide-details />
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
			isShowBtnComment: { type: Boolean, default: true }
		},
		emits: ['answer-change', 'grading-change'],
		data() {
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
			}
		}
	}
</script>