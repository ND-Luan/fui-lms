<template>
	<div class="qMultipleTrueFalse-options-grid">
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-3" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<div v-for="option in question.config.options" :key="option.id" class="qMultipleTrueFalse-option-card"
			:class="[{ 'qMultipleTrueFalse-selected': answer?.[option.id] !== undefined }]">
			<v-select placeholder="Đúng/Sai..."
				:items="[{ title: '✅ Đúng', value: true }, { title: '❌ Sai', value: false }]" item-title="title"
				item-value="value" :model-value="answer?.[option.id]"
				@update:modelValue="val => updateAnswer(option.id, val)"
				:bg-color="getTrueFalseBackgroundColor(option.id)" :readonly="readonly" style="max-width:150px" />
			<div class="qMultipleTrueFalse-option-content">
				<uc-latex-view class="qMultipleTrueFalse-option-text" :key="'o-' + question.id + '-' + option.id"
					v-model:content="option.text" />
			</div>
			<div v-if="hasGrading || submissionstatus==4" class="ml-2">
				<v-icon v-if="answer?.[option.id] === option.correctAnswer" color="success">mdi-check</v-icon>
				<v-icon v-else color="error">mdi-close</v-icon>
			</div>
		</div>

		<!-- (4) Ý kiến học sinh -->
		<div class="mt-3">
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
		<v-alert v-if="submissionstatus == 4 && !isGrade && grading?.teacherComment?.length>0" border="start"
			color="info" elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading?.teacherComment ?? '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="mt-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-4" v-if="isGrade">
			<v-textarea :model-value="grading?.teacherComment || ''" @update:model-value="updateTeacherComment"
				label="Nhận xét của giáo viên (tùy chọn)" rows="2" outlined dense hide-details />
		</div>
	</div>
</template>

<script>
	export default {
		name: "uc-question-multiple-true-false",
		props: {
			question: { type: Object, required: true },
			answer: { type: Object, default: () => ({}) }, // { a:true, b:false,... }
			readonly: { type: Boolean, default: false },
			grading: { type: Object, default: null },
			isGrade: { type: Boolean, default: false },
			submissionstatus: { type: Number, default: -1 }
		},
		emits: ["answer-change", "grading-change"],
		computed: {
			hasGrading() { return this.grading && this.isGrade; },
			totalScore() {
				if (!this.isGrade) return 0;
				let c = 0; this.question.config.options.forEach(opt => { if (this.answer?.[opt.id] === opt.correctAnswer) c++; });
				return (c / this.question.config.options.length) * this.question.points;
			},
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
		mounted() { if (this.isGrade) this.$emit('grading-change', { ...this.grading, manualScore: this.totalScore }); },
		watch: {
			answer: { deep: true, handler() { if (this.isGrade) this.$emit("grading-change", { ...this.grading, manualScore: this.totalScore }); } }
		},
		methods: {
			updateAnswer(id, val) { const newAnswer = { ...this.answer, [id]: val }; this.$emit("answer-change", newAnswer); },
			getTrueFalseBackgroundColor(id) { const v = this.answer?.[id]; if (v === true) return "success"; if (v === false) return "error"; return "white"; },
			onStudentCommentInput(val) { this.$emit('grading-change', { ...this.grading, comment: val }) },
			updateTeacherComment(val) { this.$emit("grading-change", { ...this.grading, teacherComment: val }); }
		}
	}
</script>