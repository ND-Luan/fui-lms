<!-- Tên file: uc-question-short-answer-grader.vue -->
<template>
	<div class="grader-container">
		<div>
			<p class="text-subtitle-2 text-grey-darken-1 mb-2">Câu trả lời của học sinh:</p>
			<div class="student-submission-content">
				<p v-if="answer && answer.trim()" class="mb-0">{{ answer }}</p>
				<em v-else class="grey--text">Học sinh không trả lời câu hỏi này.</em>
			</div>
		</div>

		<div class="mt-4 teacher-grading-area">
			<v-row>
				<v-col cols="12" sm="4">
					<label class="font-weight-medium">Đánh giá</label>
					<div class="d-flex align-center mt-2">
						<v-text-field :model-value="grading ? grading.manualScore : 0" @update:model-value="updateScore"
							type="number" :max="question.points" min="0" step="0.25" outlined dense hide-details
							class="mr-2" :suffix="scoreSuffix" />

						<v-btn-toggle :model-value="grading ? grading.isCorrect : null"
							@update:model-value="updateIsCorrect" color="primary" variant="outlined" density="compact"
							divided>
							<v-btn :value="true" icon="mdi-check" color="success" />
							<v-btn :value="false" icon="mdi-close" color="error" />
						</v-btn-toggle>
					</div>
				</v-col>

				<v-col cols="12" sm="8">
					<label class="font-weight-medium">Nhận xét của giáo viên (tùy chọn)</label>
					<v-textarea :model-value="grading ? grading.teacherComment : ''"
						@update:model-value="updateTeacherComment" rows="2" outlined dense hide-details class="mt-2" />
				</v-col>
			</v-row>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-question-short-answer-grader',
		props: {
			question: Object,
			answer: String,
			grading: Object
		},
		emits: ['grading-change'],
		computed: {
			scoreSuffix() {
				const points = this.question?.points || 0;
				return `/ ${points}`;
			}
		},
		methods: {
			updateScore(newScore) {
				let score = parseFloat(newScore);
				if (isNaN(score) || score < 0) {
					score = 0;
				}
				if (score > this.question.points) {
					score = this.question.points;
				}
				const newGrading = {
					...this.grading,
					manualScore: score,
					isCorrect: score > 0
				};
				this.$emit('grading-change', newGrading);
			},
			updateTeacherComment(newComment) {
				const newGrading = { ...this.grading, teacherComment: newComment };
				this.$emit('grading-change', newGrading);
			},
			updateIsCorrect(isCorrect) {
				const newGrading = { ...this.grading, isCorrect: isCorrect };
				if (isCorrect === false) {
					newGrading.manualScore = 0;
				}
				if (isCorrect === true && (!newGrading.manualScore || newGrading.manualScore === 0)) {
					newGrading.manualScore = this.question.points;
				}
				this.$emit('grading-change', newGrading);
			}
		}
	}
</script>