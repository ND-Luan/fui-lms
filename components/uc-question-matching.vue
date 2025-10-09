<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-2" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<div class="qMatching-container d-flex">
			<!-- Cột A -->
			<div class="qMatching-column qMatching-column-a">
				<div class="qMatching-title">Cột A</div>
				<div v-for="itemA in question.config.columnA" :key="itemA.id" class="qMatching-item-a">
					<uc-latex-view v-model:content="itemA.text" />
				</div>
			</div>

			<!-- Cột B -->
			<div class="qMatching-column qMatching-column-b">
				<div class="qMatching-title">Cột B</div>
				<div ref="sortableB" class="qMatching-list">
					<div v-for="(itemB, idx) in userAnswers" :key="itemB.id"
						class="qMatching-item-b d-flex align-center" :data-id="itemB.id">
						<span class="qMatching-drag-icon mr-2">⋮⋮</span>
						<uc-latex-view class="qMatching-text" v-model:content="itemB.text" />
						<div v-if="isGraded || submissionstatus == 4" class="qMatching-feedback ml-auto">
							<v-icon v-if="isCorrectPair(question.config.columnA[idx].id, itemB.id)" color="success">
								mdi-check</v-icon>
							<v-icon v-else color="error">mdi-close</v-icon>
						</div>
					</div>
				</div>
			</div>
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
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon>
					Ý kiến {{ isGrade ? 'học sinh' : 'bạn' }}:
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
			color="info" elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading?.teacherComment ?? '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="my-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-2 qMatching-grading" v-if="isGrade">
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
			isShowBtnComment: { type: Boolean, default: true }
		},
		emits: ["answer-change", "grading-change"],
		data() {
			return {
				menu: false,
				widthScreen: null,
				userAnswers: this.answer?.length
					? this.answer.map(p => this.question.config.columnB.find(b => b.id === p.to))
					: //this.shuffleArray([...
					this.question.config.columnB
				//])
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
			this.widthScreen = window.innerWidth
			if (typeof Sortable !== "undefined") {
				Sortable.create(this.$refs.sortableB, {
					animation: 200, ghostClass: "qMatching-ghost", disabled: this.readonly || this.isGrade || this.submissionstatus >= 2, onEnd: this.onDragEnd
				});
			}
			if (this.isGrade) {
				let isCorrect = true
				this.question.config.correctPairs.forEach((item, index) => {
					if (item.to != this.userAnswers[index].id) isCorrect = false
				})
				this.$emit('grading-change', { ...this.grading, manualScore: isCorrect ? this.question.points : 0 });
			}
			window.addEventListener('resize', () => { this.handleResize() })
		},
		watch: {
			answer(answer) {
				this.userAnswers = answer?.length
					? answer.map(p => this.question.config.columnB.find(b => b.id === p.to))
					: [...this.question.config.columnB]
			}
		},
		methods: {
			handleResize() {
				this.widthScreen = window.innerWidth;
			},
			shuffleArray(array) {
				for (let i = array.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[array[i], array[j]] = [array[j], array[i]];
				}
				return array;
			},
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
			onStudentCommentInput(val) {
				this.grading.comment = val
				this.$emit('grading-change', { ...this.grading, comment: val })
			},
			updateTeacherComment(val) { this.$emit("grading-change", { ...this.grading, teacherComment: val }); }
		}
	}
</script>