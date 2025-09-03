<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-3" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<div class="qMatching-container flex-column">
			<div class="qMatching-title-row">
				<div class="qMatching-title">Cột A</div>
				<div class="qMatching-title">Cột B</div>
			</div>

			<!-- Duyệt từng hàng -->
			<div v-for="(itemA, idx) in question.config.columnA" :key="itemA.id" class="qMatching-row">
				<div class="qMatching-item-a">
					<uc-latex-view v-model:content="itemA.text" />
				</div>
				<div class="qMatching-item-b d-flex align-center">
					<span class="qMatching-drag-icon mr-2">⋮⋮</span>
					<uc-latex-view class="qMatching-text" v-model:content="userAnswers[idx].text" />
					<div v-if="isGraded || submissionstatus == 4" class="qMatching-feedback ml-auto">
						<v-icon v-if="isCorrectPair(itemA.id, userAnswers[idx].id)" color="success">mdi-check</v-icon>
						<v-icon v-else color="error">mdi-close</v-icon>
					</div>
				</div>
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
		<v-alert v-if="submissionstatus == 4 && !isGrade && grading?.teacherComment?.length > 0" border="start"
			color="info" elevation="2" class="mt-4" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading?.teacherComment ?? '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="mt-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-4 qMatching-grading" v-if="isGrade">
			<v-textarea :model-value="grading?.teacherComment || ''" @update:model-value="updateTeacherComment"
				label="Nhận xét của giáo viên (tùy chọn)" rows="2" outlined dense hide-details />
		</div>
	</div>
</template>

<script>
	export default {
		name: "uc-question-matching",
		props: {
			question: { type: Object, required: true },
			answer: { default: () => [] }, // [{from,to}]
			readonly: { type: Boolean, default: false },
			grading: { type: Object, default: null },
			isGrade: { type: Boolean, default: false },
			submissionstatus: { type: Number, default: -1 },
		},
		emits: ["answer-change", "grading-change"],
		data() {
			return {
				userAnswers: this.answer?.length
					? this.answer.map(p => this.question.config.columnB.find(b => b.id === p.to))
					: [...this.question.config.columnB]
			};
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
			if (typeof Sortable !== "undefined") {
				Sortable.create(this.$refs.sortableB, {
					animation: 200, ghostClass: "qMatching-ghost", disabled: this.readonly || this.isGrade, onEnd: this.onDragEnd
				})
			}
			if (this.isGrade) {
				let isCorrect = true
				this.question.config.correctPairs.forEach((item, index) => {
					if (item.to != this.userAnswers[index].id) isCorrect = false
				})
				this.$emit('grading-change', { ...this.grading, manualScore: isCorrect ? this.question.points : 0 });
			}
		},
		watch: {
			answer(answer) {
				this.userAnswers = answer?.length
					? answer.map(p => this.question.config.columnB.find(b => b.id === p.to))
					: [...this.question.config.columnB]
			}
		},
		methods: {
			onDragEnd() {
				const newOrder = Array.from(this.$refs.sortableB.children).map(el => {
					const id = el.getAttribute("data-id");
					return this.question.config.columnB.find(b => b.id === id);
				});
				this.userAnswers = newOrder;
				const newAnswer = this.question.config.columnA.map((a, idx) => ({ from: a.id, to: this.userAnswers[idx].id }));
				this.$emit("answer-change", newAnswer);
			},
			isCorrectPair(aId, bId) { return this.question.config.correctPairs.some(p => p.from === aId && p.to === bId); },
			onStudentCommentInput(val) { this.$emit('grading-change', { ...this.grading, comment: val }) },
			updateTeacherComment(val) { this.$emit("grading-change", { ...this.grading, teacherComment: val }); }
		}
	}
</script>