<template>
	<div>
		<!-- (2.1) Hướng dẫn -->
		<v-alert v-if="guideText" class="mb-2" variant="tonal" type="info" density="comfortable" border="start"
			border-color="info">
			<strong>Hướng dẫn:</strong> {{ guideText }}
		</v-alert>

		<f-editor v-if="submissionstatus < 2" :model-value="answer" @update:model-value="handlAnswerd"
			:imageapi="vueData.v_Set.apiImageAdapter" :readonly="submissionstatus >= 2" variant="outlined" height="300"
			auto-grow label="Soạn câu trả lời của bạn..." @copy="handleCopyPaste" @cut="handleCopyPaste"
			@paste="handleCopyPaste" @contextmenu="handleContextMenu" />

		<div v-if="question.config.minWords && !readonly" class="mt-2 text-caption text--grey">
			Số từ tối thiểu: {{ question.config.minWords }} (Hiện tại: {{ wordCount }})
		</div>

		<!-- (3) Câu trả lời HS -->
		<div v-if="submissionstatus >= 2" class="d-flex flex-column my-2 pa-2 rounded bg-green-lighten-1">
			<b>
				<v-icon class="mr-1">mdi-account</v-icon> Câu trả lời của {{ isGrade ? 'học sinh' : 'bạn' }}:
			</b>
			<uc-latex-view v-if="answer && answer.length > 0" class="mt-1" :content="answer" />
			<b v-else class="text-white mt-1">Không nhập câu trả lời</b>
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
					Ý kiến của {{ isGrade ? 'học sinh' : 'bạn' }}:
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
		<v-alert v-if="submissionstatus == 4 && grading?.teacherComment && !isGrade" border="start" color="info"
			elevation="2" class="mt-3" icon="mdi-comment-quote-outline">
			<strong>Nhận xét GV:</strong> {{ grading?.teacherComment ?? '-' }}
		</v-alert>

		<!-- ĐANG CHỜ CHẤM -->
		<v-alert v-if="!isGrade && submissionstatus >= 2 && submissionstatus !== 4" class="my-2" variant="tonal"
			type="warning" density="comfortable">
			ĐANG CHỜ CHẤM
		</v-alert>

		<!-- GV -->
		<div class="mt-4" v-if="isGrade">
			<div class="d-flex align-center mb-2" v-if="submissionstatus == 2 || submissionstatus == 3">
				<v-number-input :model-value="grading ? grading.manualScore : 0"
					@update:model-value="val => grading.manualScore = (val === undefined ? null : val)" label="Điểm"
					:max="question.points" :min="0" variant="outlined" density="compact" hide-details
					style="max-width: 100px;" @blur="submitPoints" control-variant="hidden" inset />
				<span class="text-h6 ml-2 text-primary"> / {{ question.points }}</span>
				<span class="ml-1 text-caption">điểm</span>
			</div>
			<v-textarea :model-value="grading ? grading.teacherComment : null"
				@update:model-value="updateTeacherComment" :label="$t('message.TeacherCommentOptional')" rows="2"
				outlined dense hide-details />
		</div>
	</div>
</template>

<script>
	export default {
		name: 'uc-question-essay',
		props: {
			question: Object,
			answer: String,
			readonly: Boolean,
			grading: Object,
			isGrade: { type: Boolean, default: false },
			submissionstatus: { type: Number, default: -1 },
			isShowBtnComment: { type: Boolean, default: true },
			isBlockCopyPaste: {
				type: Boolean,
				default: false
			}
		},
		emits: ['answer-change', 'grading-change'],
		data() { return { vueData: window.vueData || {}, menu: false, widthScreen: null } },
		mounted() {
			this.widthScreen = window.innerWidth
			window.addEventListener('resize', () => { this.handleResize() })
		},
		computed: {
			guideText() { return this.question?.config?.submissionNote || this.question?.config?.instruction || '' },
			wordCount() {
				if (!this.answer) return 0;
				const text = this.answer.replace(/<[^>]*>?/gm, '');
				return text.trim().split(/\s+/).filter(w => w.length > 0).length;
			},
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
		methods: {
			handleResize() {
				this.widthScreen = window.innerWidth;
			},
			onStudentCommentInput(val) {
				this.grading.comment = val
				this.$emit('grading-change', { ...this.grading, comment: val })
			},
			updateTeacherComment(val) { this.$emit('grading-change', { ...this.grading, teacherComment: val }); },
			submitPoints() {
				this.$emit('grading-change', {
					...this.grading,
					manualScore: this.grading.manualScore
				});
			},
			handlAnswerd(val) {
				if (this.submissionstatus == 1) {
					if (!val) return
					this.$emit('answer-change', val)
				}
			},
			handleCopyPaste(event) {
				if (this.isBlockCopyPaste && !this.readonly) {
					event.preventDefault();
					// Có thể thêm thông báo cho user
					Vue.$toast?.warning('Không được phép sao chép/dán nội dung trong bài này', { position: "top" });
				}
			},
			handleContextMenu(event) {
				if (this.isBlockCopyPaste && !this.readonly) {
					event.preventDefault();
				}
			}
		}
	}
</script>