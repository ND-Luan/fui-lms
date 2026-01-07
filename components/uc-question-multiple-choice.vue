<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-2" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<div v-for="option in question.config.options" :key="option.id" class="mb-2">
			<v-checkbox v-model="internalAnswer" :value="option.id" :readonly="readonly || isGrade" hide-details>
				<template #label>
					<div class="d-flex align-center justify-space-between w-100">
						<uc-latex-view :class="getOptionTextClass(option.id)" v-model:content="option.text" />
						<div v-if="isGraded || submissionstatus == 4" class="feedback-icon">
							<v-icon v-if="isSelected(option.id) && isOptionCorrect(option.id)" color="success">mdi-check
							</v-icon>
							<v-icon v-if="isSelected(option.id) && !isOptionCorrect(option.id)" color="error">mdi-close
							</v-icon>
							<v-icon v-if="!isSelected(option.id) && isOptionCorrect(option.id)" color="success"
								style="opacity:.7">mdi-check</v-icon>
							<v-icon v-if="!isSelected(option.id) && !isOptionCorrect(option.id)" color="error"
								style="opacity:.7">mdi-close
							</v-icon>
						</div>
					</div>
				</template>
			</v-checkbox>
		</div>

		<!-- (4) Ý kiến học sinh -->
		<div class="mt-2">
			<div class="text-end" v-if="!isGrade && submissionstatus < 2 && isShowBtnComment">
				<v-menu v-model="menu" :close-on-content-click="false" scroll-strategy="close" location="start">
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
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon><span
						v-if="$i18n.locale == 'en' && isGrade">
						Student's Feedback
					</span>
					<span v-else-if="$i18n.locale != 'en' && isGrade">Ý kiến {{ isGrade ? 'học sinh' : 'bạn' }}:</span>
				</b>
				<div class="mt-1">{{ grading.comment }}</div>
			</div>
		</div>

		<!-- (5) Điểm -->
		<!-- Điểm câu – hiển thị khi đã trả bài (status == 4) -->
		<div v-if="submissionstatus == 4" class="mt-2">
			<strong>{{ $i18n.locale == 'en' ? 'Score' : 'Điểm' }}:</strong>
			<v-chip size="small" :color="scoreChipColor" variant="tonal">
				<v-icon start size="16">mdi-star</v-icon>
				{{ displayScore }} / {{ effectiveMaxPoints }}
			</v-chip>
		</div>

		<!-- (6) Nhận xét GV -->
		<v-alert v-if="submissionstatus == 4 && !isGrade && grading?.teacherComment" border="start" color="info"
			elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading.teacherComment }}
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
	name: 'uc-question-multiple-choice',
	props: {
		question: { type: Object, required: true },
		answer: { type: Array, default: () => [] },
		readonly: { type: Boolean, default: false },
		grading: { type: Object, default: null },
		isGrade: { type: Boolean, default: false },
		submissionstatus: { type: Number, default: -1 },
		isShowBtnComment: { type: Boolean, default: true }
	},
	emits: ['answer-change', 'grading-change'],
	data() {
		this.$i18n.locale = (localStorage.getItem('IsLanguage') && localStorage.getItem('IsLanguage') == 'true') ? 'en' : 'vi'
		return { internalAnswer: this.answer ? [...this.answer] : [], menu: false, widthScreen: null }
	},
	computed: {
		isGraded() { return this.grading && this.isGrade; },
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
		if (this.isGrade) {
			console.log('mounted', this.answer)
			console.log('www', this.question.config.correctAnswers)
			console.log('www', this.totalScore())
			const ok = _.isEqual(_.sortBy(this.question.config.correctAnswers), _.sortBy(this.internalAnswer))
			this.$emit('grading-change', { ...this.grading, manualScore: this.totalScore() });
		}
		window.addEventListener('resize', () => { this.handleResize() })
	},
	watch: {
		internalAnswer(newVal) { if (!this.isGrade) this.$emit('answer-change', newVal); },
		answer(newVal) {
			if (JSON.stringify(this.internalAnswer) !== JSON.stringify(newVal)) {
				this.internalAnswer = [...(newVal || [])];
			}
		}
	},
	methods: {
		handleResize() {
			this.widthScreen = window.innerWidth;
		},
		totalScore() {
			if (!this.isGrade) return 0;
			let c = 0;
			this.question.config.correctAnswers.forEach(opt => {
				if (this.answer.includes(opt)) c++;
			});
			return (c / this.question.config.correctAnswers.length) * this.question.points;
		},
		isSelected(optionId) { return this.internalAnswer.includes(optionId) },
		isOptionCorrect(optionId) {
			return (this.question.config.correctOptionIds || this.question.config.correctAnswers || []).includes(optionId);
		},
		getOptionTextClass(optionId) {
			if (!this.isGraded) return this.isSelected(optionId) ? 'font-weight-bold' : '';
			const selected = this.isSelected(optionId), correct = this.isOptionCorrect(optionId);
			if (selected && correct) return 'font-weight-bold';
			if (!selected && correct) return 'font-italic correct-answer-hint';
			return 'text-disabled';
		},
		onStudentCommentInput(val) {
			this.grading.comment = val
			this.$emit('grading-change', { ...this.grading, comment: val })
		},
		updateTeacherComment(val) { this.$emit('grading-change', { ...this.grading, teacherComment: val }); }
	}
}
</script>

<style scoped>
.correct-answer-hint {
	font-style: italic;
	color: green;
}

.text-disabled {
	color: grey;
}
</style>