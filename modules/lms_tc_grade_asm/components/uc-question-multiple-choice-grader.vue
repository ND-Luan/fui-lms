<template>
	<div class="grader-container">
		<!-- Phần hiển thị câu trả lời của học sinh (Read-only) -->
		<div>
			<p class="text-subtitle-2 text-grey-darken-1 mb-2">Lựa chọn của học sinh:</p>
			<v-radio-group :model-value="answer" readonly hide-details>
				<v-radio v-for="option in question.config.options" :key="option.id" :value="option.id" class="mb-2">
					<template v-slot:label>
						<div class="d-flex align-center justify-space-between w-100">
							<span :class="getOptionTextClass(option.id)">{{ option.text }}</span>
							<div class="feedback-icon">
								<v-icon v-if="isSelected(option.id) && isCorrect" color="success">mdi-check</v-icon>
								<v-icon v-if="isSelected(option.id) && !isCorrect" color="error">mdi-close</v-icon>
								<v-icon v-if="!isSelected(option.id) && isCorrectAnswer(option.id) && !isCorrect"
									color="success" style="opacity: 0.7;">mdi-check</v-icon>
							</div>
						</div>
					</template>
				</v-radio>
			</v-radio-group>
		</div>

		<!-- Vùng nhập liệu cho giáo viên -->
		<div class="mt-4 teacher-grading-area">
			<v-textarea :model-value="grading ? grading.teacherComment : ''" @update:model-value="updateTeacherComment"
				label="Nhận xét của giáo viên (tùy chọn)" rows="2" outlined dense hide-details />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-question-multiple-choice-grader',
		props: {
			question: { type: Object, required: true },
			answer: { default: null }, // selectedOptionId từ answerData của học sinh
			grading: { type: Object, default: () => ({}) } // grading object từ userAnswers
		},
		emits: ['grading-change'],
		computed: {
			isCorrect() {
				return this.answer === this.question.config.correctOptionId;
			}
		},
		methods: {
			isSelected(optionId) {
				return this.answer === optionId;
			},
			isCorrectAnswer(optionId) {
				return this.question.config.correctOptionId === optionId;
			},
			getOptionTextClass(optionId) {
				const isSelected = this.isSelected(optionId);
				const isCorrect = this.isCorrectAnswer(optionId);
	
				if (isCorrect) {
					return 'font-weight-bold success--text'; // Luôn highlight đáp án đúng
				}
				if (isSelected && !isCorrect) {
					return 'font-weight-bold error--text text-decoration-line-through'; // Gạch chân lựa chọn sai
				}
				return 'grey--text';
			},
			updateTeacherComment(newComment) {
				// Tạo một object grading mới và emit lên component cha
				const newGrading = {
					...this.grading, // Giữ lại các giá trị cũ như isCorrect, autoScore
					teacherComment: newComment
				};
				this.$emit('grading-change', newGrading);
			}
		}
	}
</script>