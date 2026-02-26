<template>
	<div class="qMultipleTrueFalse-options-grid">
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-2" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<div v-for="option in question.config.options" :key="option.id" class="qMultipleTrueFalse-option-card"
			:class="[{ 'qMultipleTrueFalse-selected': answer?.[option.id] !== undefined }]">
			<v-select placeholder="Đúng/Sai..."
				:items="[{ title: 'Đúng', value: true }, { title: 'Sai', value: false }]" item-title="title"
				item-value="value" :model-value="answer?.[option.id]"
				@update:modelValue="val => updateAnswer(option.id, val)"
				:bg-color="getTrueFalseBackgroundColor(option.id)" :readonly="readonly" style="max-width:120px" />
			<div class="qMultipleTrueFalse-option-content">
				<uc-latex-view class="qMultipleTrueFalse-option-text ga-2" :key="'o-' + question.id + '-' + option.id"
					v-model:content="option.text" />
			</div>
			<div v-if="hasGrading || submissionstatus == 4" class="ml-2">
				<v-icon v-if="answer?.[option.id] === option.correctAnswer" color="success">mdi-check</v-icon>
				<v-icon v-else color="error">mdi-close</v-icon>
			</div>
		</div>

		<!-- (4) Ý kiến học sinh -->
		<div class="mt-3">
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
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon> <span v-if="$i18n.locale =='en'&& isGrade">
						Student's Feedback
					</span>
					<span v-else-if="$i18n.locale !='en'&& isGrade">Ý kiến {{ isGrade ? 'học sinh' : 'bạn' }}:</span>
				</b>
				<div class="mt-1">{{ grading.comment }}</div>
			</div>
		</div>

		<!-- (5) Điểm -->
		<!-- Điểm câu – hiển thị khi đã trả bài (status == 4) -->
		<div v-if="submissionstatus == 4 || isGrade" class="mt-2">
			<strong>{{$i18n.locale == 'en' ? 'Score':'Điểm' }}:</strong>
			<v-chip size="small" :color="scoreChipColor" variant="tonal">
				<v-icon start size="16">mdi-star</v-icon>
				{{ displayScore }} / {{ effectiveMaxPoints }}
			</v-chip>
		</div>

		<!-- (6) Nhận xét GV -->
		<v-alert v-if="submissionstatus == 4 && !isGrade && grading?.teacherComment?.length > 0" border="start"
			color="info" elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading?.teacherComment ?? '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="my-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-2" v-if="isGrade">
			<v-textarea :model-value="grading?.teacherComment || ''" @update:model-value="updateTeacherComment"
				:label="$t('message.TeacherCommentOptional')" rows="2" outlined dense hide-details />
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
		submissionstatus: { type: Number, default: -1 },
		isShowBtnComment: { type: Boolean, default: true }
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
	mounted() {
		this.widthScreen = window.innerWidth
		if (this.isGrade) this.$emit('grading-change', { ...this.grading, manualScore: this.totalScore });
		window.addEventListener('resize', () => { this.handleResize() })
	},
	watch: {
		answer: { deep: true, handler() { if (this.isGrade) this.$emit("grading-change", { ...this.grading, manualScore: this.totalScore }); } }
	},
	data() {
		this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
		return { menu: false, widthScreen: null }; },
	methods: {
		handleResize() {
			this.widthScreen = window.innerWidth;
		},
		updateAnswer(id, val) { const newAnswer = { ...this.answer, [id]: val }; this.$emit("answer-change", newAnswer); },
		getTrueFalseBackgroundColor(id) { const v = this.answer?.[id]; if (v === true) return "green-lighten-1"; if (v === false) return "red-lighten-1"; return "white"; },
		onStudentCommentInput(val) {
			this.grading.comment = val
			this.$emit('grading-change', { ...this.grading, comment: val })
		},
		updateTeacherComment(val) { this.$emit("grading-change", { ...this.grading, teacherComment: val }); }
	}
}
</script>