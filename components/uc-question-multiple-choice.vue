<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-3" variant="tonal" type="info" density="comfortable" border="start"
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
						</div>
					</div>
				</template>
			</v-checkbox>
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
		<v-alert v-if="submissionstatus==4 && !isGrade && grading?.teacherComment" border="start" color="info"
			elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading.teacherComment }}
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
		name: 'uc-question-multiple-choice',
		props: {
			question: { type: Object, required: true },
			answer: { type: Array, default: () => [] },
			readonly: { type: Boolean, default: false },
			grading: { type: Object, default: null },
			isGrade: { type: Boolean, default: false },
			submissionstatus: { type: Number, default: -1 }
		},
		emits: ['answer-change', 'grading-change'],
		data() { return { internalAnswer: this.answer ? [...this.answer] : [] } },
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
			if (this.isGrade) {
				const ok = _.isEqual(_.sortBy(this.question.config.correctAnswers), _.sortBy(this.internalAnswer))
				this.$emit('grading-change', { ...this.grading, manualScore: ok ? this.question.points : 0 });
			}
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
			onStudentCommentInput(val) { this.$emit('grading-change', { ...this.grading, comment: val }) },
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