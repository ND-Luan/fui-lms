<template>
	<div class="grader-container">
		<!-- Hiển thị các file ghi âm học sinh đã nộp -->
		<div>
			<p class="text-subtitle-2 text-grey-darken-1 mb-2">Các bản ghi âm đã nộp:</p>
			<div v-if="answer && answer.length > 0">
				<div v-for="(file, index) in answer" :key="file.fileId || index" class="mb-2">
					<f-audio :file="urlReturnFile + '/FileData/' + file.fileId" :allowstop="true"></f-audio>
				</div>
			</div>
			<p v-else class="grey--text"><i>Học sinh không nộp bản ghi âm nào.</i></p>
		</div>

		<!-- Vùng chấm bài của giáo viên -->
		<div class="mt-4 teacher-grading-area">
			<v-row>
				<v-col cols="12" sm="4">
					<label class="font-weight-medium">Điểm số</label>
					<v-text-field :model-value="grading ? grading.manualScore : 0" @update:model-value="updateScore"
						type="number" :max="question.points" min="0" step="0.25" outlined dense hide-details
						class="mt-2" :suffix="scoreSuffix" />
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
		name: 'uc-question-audio-response-grader',
		props: {
			question: Object,
			answer: Array, // answerData (Array of audio files)
			grading: Object
		},
		emits: ['grading-change'],
		data() {
			return {
				urlReturnFile: "https://file.lhbs.vn/lms"
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
				if (isNaN(score) || score < 0) { score = 0; }
				if (score > this.question.points) { score = this.question.points; }
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