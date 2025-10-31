<template>
	<div class="uc-fib-root">
		<!-- 1) Nội dung câu hỏi (chuỗi text + chỗ trống) -->
		<div class="d-flex flex-wrap align-center ga-2 question-body">
			<span v-for="(part, idx) in (question.config?.parts || [])" :key="idx">
				<span v-if="part.type === 'text'">{{ part.value }}</span>

				<span v-else-if="part.type === 'blank'">
					<!-- Ô nhập cho từng chỗ trống -->
					<v-text-field v-model="userAnswers[part.id]"
						:readonly="readonly || isGrade || submissionstatus >= 2" hide-details="auto" dense
						variant="filled" @blur="onBlurBlank(part.id)" :clearable="false"
						:style="{ width: blankWidths[part.id], minWidth: '0' }">
						<!-- icon đúng/sai khi đã chấm -->
						<template v-slot:append-inner v-if="isGradedView">
							<v-icon v-if="isBlankCorrect(part.id)" color="success">mdi-check</v-icon>
							<v-icon v-else color="error">mdi-close</v-icon>
						</template>
					</v-text-field>
				</span>
			</span>
		</div>

		<!-- 2) Hướng dẫn nộp bài (nếu có) -->
		<v-alert v-if="question.config?.submitGuide?.trim()" variant="tonal" type="info" border="start" class="mt-2">
			<strong>Hướng dẫn nộp:</strong> {{ question.config.submitGuide }}
		</v-alert>

		<!-- 3) Câu trả lời của học sinh -->
		<div class="student-answer-panel mt-4">
			<!-- <div class="panel-title d-flex align-center ga-2">
				<v-icon size="18">mdi-account-outline</v-icon>
				<b>Câu trả lời của {{ isGrade ? 'học sinh' : 'bạn' }}: </b>
			</div> -->

			<!-- Nếu đã nộp: cố định hiển thị, không cho sửa -->
			<template v-if="isGrade && submissionstatus >= 2">
				<div v-if="hasAnyAnswer" class="d-flex flex-wrap align-center ga-2 mt-2">
					<!-- Render lại chuỗi với các blank (readonly) -->
					<span v-for="(part, idx) in (question.config?.parts || [])" :key="'view-' + idx">
						<span v-if="part.type === 'text'">{{ part.value }}</span>
						<span v-else-if="part.type === 'blank'">
							<v-chip size="small" color="primary" variant="tonal" class="mx-1">
								{{ userAnswers[part.id] || '…' }}
							</v-chip>
						</span>
					</span>
				</div>
				<div v-else class="mt-2 text-red">
					<div class="student-answer-panel rounded bg-indigo-lighten-5 pa-2">
						<div class="panel-title d-flex align-center ga-2">
							<v-icon size="18">mdi-account-outline</v-icon>
							<b>Câu trả lời của {{ isGrade ? 'học sinh' : 'bạn' }}:</b>
						</div>
						<i class="text-red">{{ isGrade ? 'Học sinh' : 'Bạn' }} không điền đáp án.</i>
					</div>
				</div>
			</template>

			<!-- Nếu chưa nộp: hiển thị đúng các ô nhập ở trên, nên chỉ ghi chú thêm -->
			<!-- <template v-else>
				<div class="text-caption text-medium-emphasis mt-1">
					Nhập đáp án trực tiếp vào các ô trống phía trên.
				</div>
			</template> -->
		</div>

		<!-- 4) Ý kiến học sinh -->
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
		<div v-if="(grading?.comment || '').trim().length > 0 && submissionstatus >= 2"
			class="mt-2 rounded bg-blue-lighten-1">
			<div class="pa-2">
				<b>
					<v-icon class="mr-1" size="18">mdi-message-text-outline</v-icon> Ý kiến {{ isGrade ? 'học sinh' :
						'bạn' }}:
				</b>
				<div class="mt-1">{{ grading.comment }}</div>
			</div>
		</div>

		<!-- 5) Banner “ĐANG CHỜ CHẤM” (đã nộp nhưng chưa chấm) -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" variant="tonal" type="warning"
			density="comfortable" class="my-2">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- 6) Đáp án đúng (chỉ hiện khi chấm hoặc đã trả bài) -->
		<div v-if="isGradedView" class="mt-2">
			<strong>Đáp án đúng:</strong>
			<span class="ml-1">
				{{ correctAnswersList.join(', ') }}
			</span>
		</div>

		<!-- 7) Điểm từng câu (v-chip, chỉ hiện khi đã trả bài) -->
		<div v-if="submissionstatus == 4" class="mt-2">
			<strong>Điểm | Score:</strong>
			<v-chip size="small" :color="scoreChipColor" variant="tonal">
				<v-icon start size="16">mdi-star</v-icon>
				{{ displayScore }} / {{ effectiveMaxPoints }}
			</v-chip>
		</div>

		<!-- 8) Nhận xét của giáo viên -->
		<v-alert v-if="submissionstatus == 4 && !isGrade && (grading?.teacherComment || '').trim().length > 0"
			border="start" color="info" elevation="2" class="mt-2" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading.teacherComment }}
		</v-alert>

		<!-- 9) Khu vực chấm điểm cho GV -->
		<div class="mt-4 teacher-grading-area" v-if="isGrade">
			<!-- <div class="d-flex align-center mb-3">
				<v-number-input :model-value="grading?.manualScore ?? 0"
					@update:model-value="val => onUpdateScoreInput(val)" label="Điểm" :max="question.points" :min="0"
					variant="outlined" density="compact" hide-details style="max-width: 120px;"
					control-variant="stacked" inset />
				<span class="text-h6 ml-2 text-primary">/ {{ question.points }}</span>
				<span class="ml-1 text-caption">điểm</span>
				<v-chip class="ml-3" size="small" :color="scoreChipColor" variant="tonal">
					<v-icon start size="16">mdi-star</v-icon>
					Gợi ý: {{ autoScoreRounded }} / {{ question.points }}
				</v-chip>
			</div> -->

			<v-textarea :model-value="grading?.teacherComment || ''" @update:model-value="updateTeacherComment"
				label="Nhận xét của giáo viên (tùy chọn)" rows="2" outlined dense hide-details />
		</div>
	</div>
</template>

<script>
export default {
	name: 'uc-question-fill-in-blank',
	props: {
		question: { type: Object, required: true },
		// answer: { blankId: "text", ... }
		answer: { type: Object, default: () => ({}) },
		readonly: { type: Boolean, default: false },
		grading: { type: Object, default: null },
		isGrade: { type: Boolean, default: false },
		submissionstatus: { type: Number, default: -1 },
		isShowBtnComment: { type: Boolean, default: true }
	},
	emits: ['answer-change', 'grading-change'],
	data() {
		return {
			userAnswers: this.buildInitialAnswers(this.answer, this.question?.config?.parts || []),
			menu: false, widthScreen: null
		}
	},
	computed: {
		blankWidths() {
			const widths = {}
			Object.keys(this.userAnswers).forEach(id => {
				const val = this.userAnswers[id] || ''
				const len = val.length + 7
				widths[id] = `${len}ch`
			})
			return widths
		},
		// Hiển thị icon đúng/sai và đáp án đúng khi đang ở trang chấm (isGrade) hoặc đã trả bài (status==4)
		isGradedView() {
			return this.isGrade || this.submissionstatus === 4
		},

		// Có bất kỳ blank nào có câu trả lời?
		hasAnyAnswer() {
			const vals = Object.values(this.userAnswers || {})
			return vals.some(v => (v ?? '').toString().trim().length > 0)
		},

		// Danh sách đáp án đúng (lấy phần tử đầu của mỗi blank)
		correctAnswersList() {
			const parts = this.question?.config?.parts || []
			return parts
				.filter(p => p.type === 'blank')
				.map(p => (p.acceptedAnswers && p.acceptedAnswers.length > 0 ? p.acceptedAnswers[0] : ''))
				.filter(Boolean)
		},

		// Tự chấm: điểm = (số blank đúng / tổng blank) * points (làm tròn 2 chữ số khi hiển thị gợi ý)
		autoScore() {
			const parts = this.question?.config?.parts || []
			const blanks = parts.filter(p => p.type === 'blank')
			if (blanks.length === 0) return 0
			
			let correct = 0
			blanks.forEach(b => {
				if (this.isBlankCorrect(b.id)) correct += 1
			})
			const pts = Number(this.question?.points ?? 0)
			return (correct / blanks.length) * pts
		},
		autoScoreRounded() {
			return Math.round((this.autoScore + Number.EPSILON) * 100) / 100
		},

		// Chip điểm chuẩn hoá
		displayScore() {
			// Ưu tiên manualScore (GV có thể sửa), nếu rỗng => 0
			const s = this.grading?.manualScore
			return typeof s === 'number' ? s : 0
		},
		effectiveMaxPoints() {
			return Number(this.question?.points ?? 0)
		},
		scoreChipColor() {
			const s = this.displayScore
			const max = this.effectiveMaxPoints
			if (s <= 0) return 'error'
			if (max && s >= max) return 'success'
			return 'primary'
		}
	},
	watch: {
		// Đồng bộ khi prop "answer" đổi từ bên ngoài
		answer: {
			deep: true,
			handler(ans) {
				const newAnswers = this.buildInitialAnswers(ans, this.question?.config?.parts || [])
				const isChanged = JSON.stringify(newAnswers) !== JSON.stringify(this.userAnswers)
				if (isChanged) {
					this.userAnswers = newAnswers
				}
			}
		},
		// Khi học sinh nhập (hoặc GV reorder sửa – nếu có), phát ra answer-change
		userAnswers: {
			deep: true,
			handler(val) {
				// Không ghi đè khi đã nộp; student không được sửa nữa
				if (this.submissionstatus < 2) {
					this.$emit('answer-change', { ...val })
				}

				// Trang chấm: tự động gợi ý điểm vào manualScore
				if (this.isGrade) {
					this.$emit('grading-change', {
						...(this.grading || {}),
						manualScore: this.autoScoreRounded
					})
				}
			}
		}
	},
	mounted() {
		this.widthScreen = window.innerWidth
		// Lần đầu vào trang chấm: set gợi ý điểm
		if (this.isGrade) {
			this.$emit('grading-change', {
				...(this.grading || {}),
				manualScore: this.autoScoreRounded
			})
		}
		window.addEventListener('resize', () => { this.handleResize() })
	},
	methods: {
		handleResize() {
			this.widthScreen = window.innerWidth;
		},
		// Khởi tạo map answer cho các blank
		buildInitialAnswers(ansObj, parts) {
			const map = {}
				; (parts || []).forEach(p => {
					if (p.type === 'blank') {
						const raw = ansObj && typeof ansObj === 'object' ? ansObj[p.id] : ''
						map[p.id] = raw != null ? String(raw) : ''
					}
				})
			return map
		},
		onBlurBlank(blankId) {
			// có thể thêm chuẩn hoá theo nhu cầu (ví dụ trim)
			if (this.userAnswers[blankId] != null) {
				this.userAnswers[blankId] = String(this.userAnswers[blankId]).trim()
			}
		},
		isBlankCorrect(blankId) {
			const parts = this.question?.config?.parts || []
			const blank = parts.find(p => p.type === 'blank' && p.id === blankId)
			if (!blank) return false

			const student = (this.userAnswers?.[blankId] || '').toString().trim().toLowerCase()
			const accepted = Array.isArray(blank.acceptedAnswers) ? blank.acceptedAnswers : [blank.acceptedAnswers]
			return accepted
				.filter(a => a != null)
				.some(a => a.toString().trim().toLowerCase() === student)
		},
		getWidth(value) {
			const len = (value?.length || 1) + 1
			return `${len + 6}ch`
		},
		updateTeacherComment(newComment) {
			this.$emit('grading-change', {
				...(this.grading || {}),
				teacherComment: newComment
			})
		},
		onUpdateScoreInput(val) {
			const parsed = (val === undefined || val === null) ? 0 : Number(val)
			this.$emit('grading-change', {
				...(this.grading || {}),
				manualScore: isNaN(parsed) ? 0 : parsed
			})
		},
		onStudentCommentInput(val) {
			this.grading.comment = val
			this.$emit('grading-change', { ...this.grading, comment: val })
		},
	}
}
</script>

<style scoped>
.uc-fib-root {
	/* container spacing if needed */
}

.question-body :deep(.v-field) {
	/* thu gọn khoảng cách ở ô input nếu muốn */
	margin-bottom: 6px;
}

.student-answer-panel {
	background: rgba(33, 150, 243, 0.06);
	/* blue lighten background */
	border: 1px dashed rgba(33, 150, 243, 0.35);
	border-radius: 8px;
	padding: 10px 12px;
}

.panel-title {
	font-weight: 600;
}

.student-comment {
	background: rgba(76, 175, 80, 0.06);
	/* green-ish */
	border: 1px dashed rgba(76, 175, 80, 0.35);
	border-radius: 8px;
	padding: 10px 12px;
}
</style>