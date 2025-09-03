<template>
	<div class="grader-container">
		<div>
			<p class="text-subtitle-2 text-grey-darken-1 mb-2">Bài làm của học sinh:</p>
			<div class="student-submission-content" v-html="answer || '<em>Học sinh không trả lời câu hỏi này.</em>'">
			</div>
		</div>

		<div class="mt-4 teacher-grading-area">
			<v-row>
				<v-col cols="12" sm="4">
					<label class="font-weight-medium">Điểm số</label>
					<v-text-field :model-value="grading ? grading.manualScore : 0" @update:model-value="updateScore"
						type="number" :max="question.points" min="0" step="0.25" outlined dense hide-details
						class="mt-2" :suffix="scoreSuffix"></v-text-field>
				</v-col>
				<v-col cols="12" sm="8">
					<label class="font-weight-medium">Nhận xét của giáo viên (tùy chọn)</label>
					<f-editor :model-value="grading ? grading.teacherComment : ''"
						@update:model-value="updateTeacherComment" :imageapi="vueData.v_Set.apiImageAdapter"
						variant="outlined" height="150" class="mt-2" />
				</v-col>
			</v-row>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-question-essay-grader',
		props: {
			question: Object,
			answer: String,
			grading: Object
		},
		emits: ['grading-change'],
		data() {
			return {
				vueData: window.vueData || {}
			}
		},
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
				const newGrading = { ...this.grading, manualScore: score };
				this.$emit('grading-change', newGrading);
			},
			updateTeacherComment(newComment) {
				const newGrading = { ...this.grading, teacherComment: newComment };
				this.$emit('grading-change', newGrading);
			}
		}
	}
</script>