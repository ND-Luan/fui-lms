<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-3" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<v-textarea v-if="submissionstatus < 2" :model-value="answer"
			@update:model-value="$emit('answer-change', $event)"
			:label="!isGrade ? 'Nhập câu trả lời của bạn' : 'Câu trả lời của học sinh'" rows="3" outlined
			:readonly="readonly || isGrade" hide-details />

		<!-- (3) Câu trả lời HS -->
		<div v-if="submissionstatus >= 2" class="d-flex flex-column my-3 pa-3 rounded bg-grey-lighten-4">
			<b>
				<v-icon class="mr-1">mdi-account</v-icon> Câu trả lời của {{!isGrade ? 'bạn' : 'học sinh' }}:
			</b>
			<span v-if="answer" class="mt-1">{{ answer }}</span>
			<b v-else class="text-red mt-1">Không nhập câu trả lời</b>
		</div>

		<!-- (4) Ý kiến học sinh -->
		<div class="mt-2">
			<v-textarea v-if="!isGrade && submissionstatus < 2" :model-value="grading?.comment || ''"
				@update:model-value="onStudentCommentInput" label="Ý kiến của bạn (tùy chọn)" rows="2" outlined dense
				hide-details />
			<div v-else-if="grading?.comment" class="pa-3 rounded bg-grey-lighten-4">
				<b>
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon> Ý kiến {{ isGrade ? 'học sinh' :
					'bạn' }}:
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
			elevation="2" class="mt-3" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading.teacherComment || '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="mt-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-4 teacher-grading-area" v-if="isGrade">
			<div class="d-flex align-center mb-3">
				<v-number-input :model-value="grading ? grading.manualScore : 0"
					@update:model-value="val => grading.manualScore = (val === undefined ? null : val)" label="Điểm"
					:max="question.points" :min="0" variant="outlined" density="compact" hide-details
					style="max-width: 100px;" @blur="submitPoints" control-variant="stacked" inset />
				<span class="text-h6 ml-2 text-primary"> / {{ question.points }}</span>
				<span class="ml-1 text-caption">điểm</span>
			</div>
			<v-textarea :model-value="grading ? grading.teacherComment : ''" @update:model-value="updateTeacherComment"
				label="Nhận xét của giáo viên (tùy chọn)" rows="3" outlined dense hide-details />
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
			submissionstatus: { type: Number, default: -1 }
		},
		emits: ['answer-change', 'grading-change'],
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
			}
		},
		methods: {
			onStudentCommentInput(val) { this.$emit('grading-change', { ...this.grading, comment: val }) },
			updateTeacherComment(val) { this.$emit('grading-change', { ...this.grading, teacherComment: val }); },
			submitPoints() { this.$emit('grading-change', { ...this.grading, manualScore: parseFloat(this.grading.manualScore) }); }
		}
	}
</script>